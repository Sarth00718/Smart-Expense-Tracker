const express = require('express');
const router = express.Router();
const axios = require('axios');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');
const { calculateSpendingScore } = require('../utils/analytics');
const { parseFinanceQuery, analyzeAffordability } = require('../utils/nlp');
const { callGroqWithRetry } = require('../utils/llmRetry');
const { callAIWithRetry } = require('../utils/aiService');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/ai/chat
// @desc    Conversational AI Finance Bot with History
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatHistory.findOne({ 
        userId: req.userId, 
        conversationId 
      });
    }
    
    if (!conversation) {
      // Create new conversation
      conversation = new ChatHistory({
        userId: req.userId,
        conversationId: conversationId || uuidv4(),
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Fetch user's financial data
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    const incomes = await Income.find({ userId: req.userId }).sort({ date: -1 });
    const budgets = await Budget.find({ userId: req.userId });
    const goals = await Goal.find({ userId: req.userId });

    // Parse the query using NLP
    const queryData = parseFinanceQuery(message, expenses, budgets, goals);

    // Check for specific query patterns
    const lowerMessage = message.toLowerCase();
    let responseText;
    let apiUsed = 'fallback';
    
    // Handle "Where did I overspend" queries
    if (lowerMessage.includes('overspend') || lowerMessage.includes('over spend')) {
      responseText = analyzeOverspending(expenses, budgets);
    }
    // Handle budget plan suggestions
    else if ((lowerMessage.includes('suggest') || lowerMessage.includes('recommend') || lowerMessage.includes('create')) && 
        (lowerMessage.includes('budget') || lowerMessage.includes('plan'))) {
      const salaryMatch = message.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)?/i);
      const salary = salaryMatch ? parseFloat(salaryMatch[1].replace(/,/g, '')) : null;
      
      responseText = suggestBudgetPlan(salary, expenses, budgets);
    }
    // Check if we can answer with rule-based logic
    else if (queryData.canAnswerDirectly) {
      responseText = queryData.directAnswer;
    }
    // Use AI for complex queries
    else {
      try {
        console.log('🤖 Processing AI query:', message.substring(0, 50) + '...');
        
        // Get current date info for prompt
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[now.getMonth()];
        
        // Prepare context for AI including conversation history
        const context = buildFinancialContext(expenses, incomes, budgets, goals, queryData);
        
        // Include recent conversation history for context
        const recentMessages = conversation.messages.slice(-6, -1); // Last 3 exchanges (excluding current)
        const conversationContext = recentMessages.length > 0 
          ? '\n\nRECENT CONVERSATION:\n' + recentMessages.map(msg => 
              `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n')
          : '';
        
        const prompt = `You are a helpful personal finance assistant. Answer the user's question based on their financial data and conversation history.

USER QUESTION: "${message}"

FINANCIAL DATA:
${context}${conversationContext}

IMPORTANT INSTRUCTIONS:
- Provide a clear, concise, and helpful answer
- Use ₹ for currency (Indian Rupees)
- Be friendly and actionable
- Use bullet points (•) for lists
- Keep response under 300 words
- If referring to previous conversation, acknowledge it naturally
- Focus on specific numbers and data from the user's financial records
- Provide actionable advice based on the data
- When user asks about "this month" or "current month", use the data from THIS MONTH section
- When user asks about "today" or "current", refer to the CURRENT DATE CONTEXT
- Always specify the time period you're referring to (e.g., "In ${currentMonthName} ${currentYear}...")
- If user asks about a specific category, look at both THIS MONTH'S and ALL TIME data`;

        console.log('📤 Sending request to Groq API...');
        
        const aiResult = await callAIWithRetry(
          prompt,
          'You are a helpful personal finance assistant specializing in Indian personal finance. Provide clear, concise answers with specific numbers and actionable advice. Always use ₹ for currency.',
          { maxTokens: 500, temperature: 0.7 }
        );

        console.log('✅ Received AI response');
        responseText = aiResult.text;
        apiUsed = aiResult.api;
      } catch (llmError) {
        // Fallback to rule-based response
        console.error('❌ AI error:', llmError.message);
        console.error('Stack:', llmError.stack);
        
        // Provide a more helpful error message
        responseText = queryData.fallbackAnswer || 
          `I'm having trouble processing your request right now. Here's what I can tell you:\n\n` +
          `📊 You have ${expenses.length} expenses totaling ₹${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}\n` +
          `💰 You have ${incomes.length} income records totaling ₹${incomes.reduce((sum, inc) => sum + inc.amount, 0).toFixed(2)}\n\n` +
          `Try asking:\n• "Where did I overspend this month?"\n• "What are my top spending categories?"\n• "How much did I spend on food?"\n\n` +
          `Error: ${llmError.message}`;
        
        apiUsed = 'fallback';
      }
    }

    // Add assistant response to history
    conversation.messages.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
      apiUsed
    });

    // Save conversation
    await conversation.save();

    res.json({ 
      response: responseText,
      conversationId: conversation.conversationId,
      apiUsed
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({ 
      response: '❌ Sorry, I encountered an error processing your request. Please try again or rephrase your question.' 
    });
  }
});

// @route   GET /api/ai/conversations
// @desc    Get user's conversation history
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await ChatHistory.find({ 
      userId: req.userId,
      isActive: true
    })
    .select('conversationId title lastMessageAt messages')
    .sort({ lastMessageAt: -1 })
    .limit(50);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// @route   GET /api/ai/conversations/:conversationId
// @desc    Get specific conversation
// @access  Private
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await ChatHistory.findOne({
      userId: req.userId,
      conversationId: req.params.conversationId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// @route   DELETE /api/ai/conversations/:conversationId
// @desc    Delete conversation
// @access  Private
router.delete('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await ChatHistory.findOne({
      userId: req.userId,
      conversationId: req.params.conversationId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// @route   POST /api/ai/conversations/new
// @desc    Start new conversation
// @access  Private
router.post('/conversations/new', auth, async (req, res) => {
  try {
    const conversationId = uuidv4();
    res.json({ conversationId });
  } catch (error) {
    console.error('New conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
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

  // Current date and time information
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDay;

  context += `CURRENT DATE CONTEXT:\n`;
  context += `Today's Date: ${currentMonthName} ${currentDay}, ${currentYear}\n`;
  context += `Current Month: ${currentMonthName} ${currentYear}\n`;
  context += `Days in this month: ${daysInMonth}\n`;
  context += `Days remaining in month: ${daysRemaining}\n\n`;

  // Calculate current month data
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const monthExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
  const monthIncome = incomes.filter(inc => new Date(inc.date) >= startOfMonth);
  const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthIncomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);

  context += `THIS MONTH (${currentMonthName} ${currentYear}):\n`;
  context += `Income: ₹${monthIncomeTotal.toFixed(2)}\n`;
  context += `Expenses: ₹${monthExpenseTotal.toFixed(2)}\n`;
  context += `Balance: ₹${(monthIncomeTotal - monthExpenseTotal).toFixed(2)}\n`;
  context += `Transactions: ${monthExpenses.length} expenses, ${monthIncome.length} income\n\n`;

  // Total expenses and income (all time)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  context += `ALL TIME TOTALS:\n`;
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

  // Category breakdown for current month
  const monthCategoryTotals = {};
  monthExpenses.forEach(exp => {
    monthCategoryTotals[exp.category] = (monthCategoryTotals[exp.category] || 0) + exp.amount;
  });
  
  if (Object.keys(monthCategoryTotals).length > 0) {
    context += `THIS MONTH'S EXPENSE CATEGORIES:\n`;
    Object.entries(monthCategoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amt]) => {
        const percentage = ((amt / monthExpenseTotal) * 100).toFixed(1);
        context += `- ${cat}: ₹${amt.toFixed(2)} (${percentage}% of monthly expenses)\n`;
      });
    context += '\n';
  }

  // All-time category breakdown
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  context += 'ALL TIME EXPENSE CATEGORIES:\n';
  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amt]) => {
      context += `- ${cat}: ₹${amt.toFixed(2)}\n`;
    });

  // Recent expenses (last 10 from current month)
  if (monthExpenses.length > 0) {
    context += '\nRECENT EXPENSES THIS MONTH:\n';
    monthExpenses.slice(0, 10).forEach(exp => {
      const expDate = new Date(exp.date);
      const dayOfMonth = expDate.getDate();
      context += `- ${currentMonthName} ${dayOfMonth}: ${exp.category} - ₹${exp.amount.toFixed(2)} (${exp.description || 'No description'})\n`;
    });
  }

  // Budgets (current month)
  if (budgets.length > 0) {
    context += '\nMONTHLY BUDGETS (for ' + currentMonthName + '):\n';
    budgets.forEach(budget => {
      const spent = monthCategoryTotals[budget.category] || 0;
      const remaining = budget.monthlyBudget - spent;
      const percentUsed = ((spent / budget.monthlyBudget) * 100).toFixed(1);
      const status = spent > budget.monthlyBudget ? '⚠️ OVER BUDGET' : 
                     spent > budget.monthlyBudget * 0.8 ? '⚠️ WARNING' : '✅ ON TRACK';
      context += `- ${budget.category}: Budget ₹${budget.monthlyBudget}, Spent ₹${spent.toFixed(2)} (${percentUsed}%), Remaining ₹${remaining.toFixed(2)} ${status}\n`;
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
    const { type = 'general' } = req.query;
    
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
        suggestions: getMockSuggestions(expenses, type)
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

    // Different prompts based on type
    let prompt = '';
    let systemMessage = 'You are a helpful personal finance advisor.';

    if (type === 'budget') {
      prompt = `You are a budget planning expert. Analyze these expenses and provide budget tips.

EXPENSE DATA:
Total: ₹${total.toFixed(2)}
Category Breakdown: ${categoryBreakdown}

Recent Transactions:
${expenseList}

Provide 7 actionable budget tips based on this data. Focus on:
- Setting realistic category budgets
- Identifying areas to reduce spending
- Budget allocation strategies
- Tracking methods

Keep response under 200 words, use bullet points with ** for emphasis.`;
      systemMessage = 'You are a budget planning expert who provides practical, data-driven advice.';
    } else if (type === 'forecast') {
      prompt = `You are a financial forecasting expert. Analyze these expenses and predict future spending.

EXPENSE DATA:
Total: ₹${total.toFixed(2)}
Category Breakdown: ${categoryBreakdown}

Recent Transactions:
${expenseList}

Provide spending forecast and predictions:
- Predict next month's spending by category
- Identify spending trends (increasing/decreasing)
- Warn about potential overspending
- Suggest preventive measures

Keep response under 200 words, use bullet points with ** for emphasis.`;
      systemMessage = 'You are a financial forecasting expert who analyzes spending patterns.';
    } else {
      prompt = `You are a personal finance expert. Analyze these expenses and provide saving tips.

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
    }

    // Call AI with retry logic (using Groq)
    try {
      console.log(`🤖 Generating ${type} suggestions...`);
      
      const aiResult = await callAIWithRetry(
        prompt,
        systemMessage,
        { maxTokens: 600, temperature: 0.7 }
      );

      const score = calculateSpendingScore(expenses);

      console.log(`✅ ${type} suggestions generated successfully`);

      res.json({
        suggestions: `🤖 **AI Financial Advisor** (${aiResult.api}):\n\n${aiResult.text}\n\n📊 **Financial Health Score: ${score}/100**`
      });
    } catch (llmError) {
      console.error('❌ AI suggestions error:', llmError.message);
      console.error('Stack:', llmError.stack);
      
      // Fallback to mock suggestions
      console.log('⚠️ Falling back to mock suggestions');
      res.json({
        suggestions: getMockSuggestions(expenses, type)
      });
    }

  } catch (error) {
    console.error('AI suggestions error:', error.message);
    
    // Fallback to mock suggestions
    const expenses = await Expense.find({ userId: req.userId }).limit(50);
    res.json({
      suggestions: getMockSuggestions(expenses, 'general')
    });
  }
});

// Mock suggestions fallback
function getMockSuggestions(expenses, type = 'general') {
  if (expenses.length === 0) {
    return 'No expenses found. Start tracking to get insights!';
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = {};
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  const highestCategory = sortedCategories[0];
  const score = calculateSpendingScore(expenses);

  if (type === 'budget') {
    return `🤖 **AI Financial Advisor**:

Here are 7 actionable budget tips based on your expense data:

* **Set Category Budgets**: Your top spending is ${highestCategory[0]} (₹${highestCategory[1].toFixed(2)}). Set a monthly limit of ₹${(highestCategory[1] * 0.8).toFixed(2)} to reduce by 20%.

* **Track Daily Expenses**: You've spent ₹${total.toFixed(2)} across ${expenses.length} transactions. Track expenses daily to stay aware of your spending patterns.

* **Use the 50/30/20 Rule**: Allocate 50% for needs, 30% for wants, and 20% for savings. Based on your spending, aim to save at least ₹${(total * 0.2).toFixed(2)} monthly.

* **Reduce ${highestCategory[0]} Spending**: Consider walking, using public transport, or carpooling instead. Try packing lunch or cooking at home more often.

* **Set Budget Alerts**: Enable notifications when you reach 80% of your category budgets to avoid overspending.

* **Review Weekly**: Every Sunday, review your spending for the week and adjust your budget for the upcoming week.

* **Emergency Fund First**: Before investing, build an emergency fund of 3-6 months of expenses (₹${(total * 4).toFixed(2)} based on current spending).

📊 **Financial Health Score: ${score}/100**`;
  } else if (type === 'forecast') {
    const avgDaily = total / Math.max(1, expenses.length / 30);
    const projectedMonthly = avgDaily * 30;
    
    return `🤖 **AI Financial Advisor**:

Here's your spending forecast based on current patterns:

* **Next Month Projection**: Based on your current spending rate of ₹${avgDaily.toFixed(2)}/day, you're projected to spend ₹${projectedMonthly.toFixed(2)} next month.

* **${highestCategory[0]} Trend**: This is your highest category at ₹${highestCategory[1].toFixed(2)}. If this continues, expect ₹${(highestCategory[1] * 1.1).toFixed(2)} next month (10% increase typical).

${sortedCategories.slice(1, 3).map(([cat, amt]) => 
  `* **${cat} Forecast**: Current spending ₹${amt.toFixed(2)}. Projected: ₹${(amt * 1.05).toFixed(2)} (5% increase).`
).join('\n\n')}

* **Overspending Risk**: ${projectedMonthly > total * 1.2 ? '⚠️ HIGH - Your spending is accelerating. Take action now!' : projectedMonthly > total ? '⚠️ MODERATE - Spending is increasing slightly.' : '✅ LOW - Spending is stable or decreasing.'}

* **Preventive Measures**: 
  - Set a daily spending limit of ₹${(projectedMonthly * 0.8 / 30).toFixed(2)} to reduce next month's total by 20%
  - Review ${highestCategory[0]} expenses and cut unnecessary items
  - Use cash for discretionary spending to increase awareness

* **Savings Opportunity**: If you reduce spending by 15%, you could save ₹${(projectedMonthly * 0.15).toFixed(2)} next month.

📊 **Financial Health Score: ${score}/100**`;
  } else {
    return `🤖 **AI Financial Advisor**:

Here are 7 actionable saving tips based on the expense data:

* **Cut down on ${highestCategory[0]}**: You've spent ₹${highestCategory[1].toFixed(2)} in ${expenses.length} transactions. Consider ${
  highestCategory[0] === 'Food' ? 'walking, using public transport, or carpooling instead' :
  highestCategory[0] === 'Travel' ? 'booking in advance or exploring cheaper travel options for your next trip' :
  highestCategory[0] === 'Shopping' ? 'setting a budget and prioritizing essential purchases' :
  highestCategory[0] === 'Entertainment' ? 'finding free or low-cost entertainment alternatives' :
  'reviewing and reducing unnecessary expenses'
}.

${sortedCategories.slice(1, 3).map(([cat, amt]) => 
  `* **Opt for cheaper ${cat.toLowerCase()} options**: Your ${cat.toLowerCase()} expenses are ₹${amt.toFixed(2)}. Try ${
    cat === 'Food' ? 'making your own meals or opting for local street food options' :
    cat === 'Shopping' ? 'waiting for sales or using cashback apps' :
    cat === 'Bills' ? 'reviewing subscriptions and canceling unused services' :
    'finding more cost-effective alternatives'
  }.`
).join('\n\n')}

* **Avoid impulse buys**: You've spent a lot on ${sortedCategories.map(([cat]) => cat.toLowerCase()).slice(0, 2).join(' and ')}. Try to make a shopping list before heading out.

* **Use cashback apps**: You've spent a lot on various purchases. Consider using cashback apps like Paytm or Freecharge to earn rewards on your transactions.

* **Track expenses daily**: Review your spending every day to stay aware and make better financial decisions.

📊 **Financial Health Score: ${score}/100**`;
  }
}

module.exports = router;
