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
