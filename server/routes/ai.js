const express = require('express');
const router = express.Router();
const axios = require('axios');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');
const { calculateSpendingScore } = require('../utils/analytics');
const { parseFinanceQuery, analyzeAffordability } = require('../utils/nlp');
const { callGroqWithRetry } = require('../utils/llmRetry');

// @route   POST /api/ai/chat
// @desc    Conversational AI Finance Bot
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch user's financial data
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    const incomes = await Income.find({ userId: req.userId }).sort({ date: -1 });
    const budgets = await Budget.find({ userId: req.userId });
    const goals = await Goal.find({ userId: req.userId });

    // Parse the query using NLP
    const queryData = parseFinanceQuery(message, expenses, budgets, goals);

    // Check for specific query patterns
    const lowerMessage = message.toLowerCase();
    
    // Handle "Where did I overspend" queries
    if (lowerMessage.includes('overspend') || lowerMessage.includes('over spend')) {
      const response = analyzeOverspending(expenses, budgets);
      return res.json({ response });
    }

    // Handle budget plan suggestions
    if ((lowerMessage.includes('suggest') || lowerMessage.includes('recommend') || lowerMessage.includes('create')) && 
        (lowerMessage.includes('budget') || lowerMessage.includes('plan'))) {
      const salaryMatch = message.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)?/i);
      const salary = salaryMatch ? parseFloat(salaryMatch[1].replace(/,/g, '')) : null;
      
      const response = suggestBudgetPlan(salary, expenses, budgets);
      return res.json({ response });
    }

    // Check if we can answer with rule-based logic
    if (queryData.canAnswerDirectly) {
      return res.json({ response: queryData.directAnswer });
    }

    // Use LLM for complex queries with retry logic
    try {
      // Prepare context for LLM
      const context = buildFinancialContext(expenses, incomes, budgets, goals, queryData);
      
      const prompt = `You are a helpful personal finance assistant. Answer the user's question based on their financial data.

USER QUESTION: "${message}"

FINANCIAL DATA:
${context}

Provide a clear, concise, and helpful answer. Use ₹ for currency. Be friendly and actionable.`;

      const aiResponse = await callGroqWithRetry(
        prompt,
        'You are a helpful personal finance assistant. Provide clear, concise answers with specific numbers and actionable advice.',
        { maxTokens: 400, temperature: 0.7 }
      );

      res.json({ response: aiResponse });
    } catch (llmError) {
      // Fallback to rule-based response
      console.error('LLM error:', llmError.message);
      return res.json({ 
        response: queryData.fallbackAnswer || 'I\'m having trouble processing your request right now. Please try asking about specific expenses, budgets, or financial goals.' 
      });
    }

  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({ 
      response: '❌ Sorry, I encountered an error processing your request. Please try again or rephrase your question.' 
    });
  }
});

// Helper function to analyze overspending
function analyzeOverspending(expenses, budgets) {
  if (expenses.length === 0) {
    return '📊 You haven\'t tracked any expenses yet. Start adding expenses to see where you might be overspending!';
  }

  // Get current month expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  if (monthlyExpenses.length === 0) {
    return '📊 No expenses found for this month yet.';
  }

  // Calculate category totals
  const categoryTotals = {};
  monthlyExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  // Compare with budgets
  const overspendingCategories = [];
  const budgetMap = {};
  budgets.forEach(b => {
    budgetMap[b.category] = b.monthlyBudget;
  });

  Object.entries(categoryTotals).forEach(([category, spent]) => {
    const budget = budgetMap[category];
    if (budget && spent > budget) {
      overspendingCategories.push({
        category,
        spent,
        budget,
        overspent: spent - budget,
        percentage: ((spent / budget) * 100).toFixed(0)
      });
    }
  });

  if (overspendingCategories.length === 0) {
    const totalSpent = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
    return `✅ Great news! You're staying within your budgets this month!\n\n📊 Total spent: ₹${totalSpent.toFixed(2)}\n\nTop categories:\n${
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `• ${cat}: ₹${amt.toFixed(2)}`)
        .join('\n')
    }`;
  }

  // Sort by overspending amount
  overspendingCategories.sort((a, b) => b.overspent - a.overspent);

  let response = `⚠️ **Overspending Alert for ${now.toLocaleString('default', { month: 'long' })}**\n\n`;
  response += `You've exceeded your budget in ${overspendingCategories.length} categor${overspendingCategories.length > 1 ? 'ies' : 'y'}:\n\n`;

  overspendingCategories.forEach((item, index) => {
    response += `${index + 1}. **${item.category}**\n`;
    response += `   • Budget: ₹${item.budget.toFixed(2)}\n`;
    response += `   • Spent: ₹${item.spent.toFixed(2)} (${item.percentage}%)\n`;
    response += `   • Over by: ₹${item.overspent.toFixed(2)}\n\n`;
  });

  response += `💡 **Recommendations:**\n`;
  response += `• Review ${overspendingCategories[0].category} expenses and identify unnecessary spending\n`;
  response += `• Set up alerts for when you reach 80% of your budget\n`;
  response += `• Consider adjusting your budget if this is a recurring pattern`;

  return response;
}

// Helper function to suggest budget plan
function suggestBudgetPlan(salary, expenses, budgets) {
  if (!salary) {
    return '💰 Please specify your monthly salary/income. For example: "Suggest budget plan for ₹20,000 salary"';
  }

  // Calculate average spending by category if expenses exist
  const categoryAverages = {};
  if (expenses.length > 0) {
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
    });

    Object.keys(categoryTotals).forEach(cat => {
      categoryAverages[cat] = categoryTotals[cat] / categoryCounts[cat];
    });
  }

  // Standard budget allocation (50/30/20 rule adapted)
  const budgetPlan = {
    'Essentials (50%)': salary * 0.50,
    'Food & Groceries': salary * 0.15,
    'Housing & Utilities': salary * 0.25,
    'Transportation': salary * 0.10,
    'Wants (30%)': salary * 0.30,
    'Entertainment': salary * 0.10,
    'Shopping': salary * 0.10,
    'Dining Out': salary * 0.10,
    'Savings & Investments (20%)': salary * 0.20,
    'Emergency Fund': salary * 0.10,
    'Investments': salary * 0.10
  };

  let response = `💰 **Budget Plan for ₹${salary.toLocaleString()} Monthly Income**\n\n`;
  response += `Based on the 50/30/20 rule:\n\n`;

  response += `🏠 **Essentials (50% - ₹${budgetPlan['Essentials (50%)'].toFixed(0)})**\n`;
  response += `• Food & Groceries: ₹${budgetPlan['Food & Groceries'].toFixed(0)}\n`;
  response += `• Housing & Utilities: ₹${budgetPlan['Housing & Utilities'].toFixed(0)}\n`;
  response += `• Transportation: ₹${budgetPlan['Transportation'].toFixed(0)}\n\n`;

  response += `🎯 **Wants (30% - ₹${budgetPlan['Wants (30%)'].toFixed(0)})**\n`;
  response += `• Entertainment: ₹${budgetPlan['Entertainment'].toFixed(0)}\n`;
  response += `• Shopping: ₹${budgetPlan['Shopping'].toFixed(0)}\n`;
  response += `• Dining Out: ₹${budgetPlan['Dining Out'].toFixed(0)}\n\n`;

  response += `💎 **Savings & Investments (20% - ₹${budgetPlan['Savings & Investments (20%)'].toFixed(0)})**\n`;
  response += `• Emergency Fund: ₹${budgetPlan['Emergency Fund'].toFixed(0)}\n`;
  response += `• Investments: ₹${budgetPlan['Investments'].toFixed(0)}\n\n`;

  response += `📝 **Tips:**\n`;
  response += `• Adjust categories based on your lifestyle\n`;
  response += `• Track expenses daily to stay on budget\n`;
  response += `• Review and adjust monthly\n`;
  response += `• Build emergency fund first (3-6 months expenses)`;

  if (expenses.length > 0) {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgMonthlySpending = totalSpent / Math.max(1, expenses.length / 30);
    
    if (avgMonthlySpending > salary) {
      response += `\n\n⚠️ **Warning:** Your current spending (₹${avgMonthlySpending.toFixed(0)}/month) exceeds your income. Focus on reducing expenses!`;
    }
  }

  return response;
}

// Helper function to build financial context
function buildFinancialContext(expenses, incomes, budgets, goals, queryData) {
  let context = '';

  // Total expenses and income
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  context += `Total Income: ₹${totalIncome.toFixed(2)}\n`;
  context += `Total Expenses: ₹${totalExpenses.toFixed(2)}\n`;
  context += `Net Balance: ₹${netBalance.toFixed(2)}\n`;
  context += `Number of Transactions: ${expenses.length} expenses, ${incomes.length} income\n\n`;

  // Income breakdown
  if (incomes.length > 0) {
    const sourceTotals = {};
    incomes.forEach(inc => {
      sourceTotals[inc.source] = (sourceTotals[inc.source] || 0) + inc.amount;
    });
    
    context += 'INCOME SOURCES:\n';
    Object.entries(sourceTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, amt]) => {
        context += `- ${source}: ₹${amt.toFixed(2)}\n`;
      });
    context += '\n';
  }

  // Category breakdown
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  context += 'EXPENSE CATEGORIES:\n';
  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amt]) => {
      context += `- ${cat}: ₹${amt.toFixed(2)}\n`;
    });

  // Recent expenses (last 10)
  if (expenses.length > 0) {
    context += '\nRECENT EXPENSES:\n';
    expenses.slice(0, 10).forEach(exp => {
      context += `- ${exp.date.toISOString().split('T')[0]}: ${exp.category} - ₹${exp.amount.toFixed(2)} (${exp.description || 'No description'})\n`;
    });
  }

  // Budgets
  if (budgets.length > 0) {
    context += '\nBUDGETS:\n';
    budgets.forEach(budget => {
      const spent = categoryTotals[budget.category] || 0;
      const remaining = budget.monthlyBudget - spent;
      context += `- ${budget.category}: Budget ₹${budget.monthlyBudget}, Spent ₹${spent.toFixed(2)}, Remaining ₹${remaining.toFixed(2)}\n`;
    });
  }

  // Goals
  if (goals.length > 0) {
    context += '\nSAVINGS GOALS:\n';
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      context += `- ${goal.name}: ₹${goal.currentAmount} / ₹${goal.targetAmount} (${progress.toFixed(0)}%)\n`;
    });
  }

  // Query-specific data
  if (queryData.relevantData) {
    context += `\n${queryData.relevantData}\n`;
  }

  return context;
}

// @route   GET /api/ai/suggestions
// @desc    Get AI-powered financial suggestions
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(50);

    if (expenses.length === 0) {
      return res.json({
        suggestions: 'No expenses found. Start tracking your expenses to get personalized AI suggestions!'
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.json({
        suggestions: getMockSuggestions(expenses)
      });
    }

    // Prepare expense data
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = {};
    
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const expenseList = expenses.slice(0, 10).map(exp => 
      `• ${exp.date.toISOString().split('T')[0]}: ${exp.category} - ₹${exp.amount.toFixed(2)} (${exp.description})`
    ).join('\n');

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(', ');

    const prompt = `You are a personal finance expert. Analyze these expenses and provide saving tips.

Explain in short bullet point manner, 5-7 points only.
Don't provide general saving suggestions, provide suggestions from data.

---
EXPENSE DATA:
Total: ₹${total.toFixed(2)}
Category Breakdown: ${categoryBreakdown}

Recent Transactions:
${expenseList}
---
Provide specific, actionable advice. Keep response under 150 words, practical, and friendly.`;

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful personal finance advisor.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const aiText = response.data.choices[0].message.content;
    const score = calculateSpendingScore(expenses);

    res.json({
      suggestions: `🤖 **AI Financial Advisor**:\n\n${aiText}\n\n📊 **Financial Health Score: ${score}/100**`
    });

  } catch (error) {
    console.error('AI suggestions error:', error.message);
    
    // Fallback to mock suggestions
    const expenses = await Expense.find({ userId: req.userId }).limit(50);
    res.json({
      suggestions: getMockSuggestions(expenses)
    });
  }
});

// Mock suggestions fallback
function getMockSuggestions(expenses) {
  if (expenses.length === 0) {
    return 'No expenses found. Start tracking to get insights!';
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = {};
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const highestCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];

  const score = calculateSpendingScore(expenses);

  return `🤖 **AI Financial Advisor**:

📊 **Financial Health Score: ${score}/100**

## SPENDING ANALYSIS
Total: ₹${total.toFixed(2)} across ${expenses.length} transactions.
Highest category: '${highestCategory[0]}' at ₹${highestCategory[1].toFixed(2)}

## TOP RECOMMENDATIONS
1. **Review ${highestCategory[0]} Expenses**: Optimize ₹${highestCategory[1].toFixed(2)} spending
2. **Weekly Expense Tracking**: Review spending every Sunday
3. **30-Day Rule**: Wait 30 days for non-essential purchases over ₹500
4. **Automate Savings**: Set up automatic transfers
5. **Use Budget Planning**: Set category budgets in the app

## NEXT STEPS
• Set up budgets for top 3 categories
• Create a savings goal
• Track daily expenses consistently`;
}

module.exports = router;
