import express from 'express';
const router = express.Router();
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import ChatHistory from '../models/ChatHistory.js';
import auth from '../middleware/auth.js';
import { calculateSpendingScore } from '../utils/analytics.js';
import { parseFinanceQuery } from '../utils/nlp.js';
import { callAIWithRetry } from '../utils/aiService.js';
import crypto from 'crypto';

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
      // Create new conversation with crypto-based UUID
      conversation = new ChatHistory({
        userId: req.userId,
        conversationId: conversationId || crypto.randomUUID(),
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
    
    // Handle affordability queries
    if ((lowerMessage.includes('afford') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) && 
        /₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)?/i.test(message)) {
      const amountMatch = message.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)?/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
      
      if (amount) {
        responseText = analyzeAffordability(amount, expenses, incomes, message);
        apiUsed = 'rule-based';
      }
    }
    // Handle "Where did I overspend" queries
    else if (lowerMessage.includes('overspend') || lowerMessage.includes('over spend')) {
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
        // Check if API key is configured
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
          throw new Error('AI_NOT_CONFIGURED: Groq API key is not configured. Please add GROQ_API_KEY to your .env file.');
        }
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[now.getMonth()];
        
        const context = buildFinancialContext(expenses, incomes, budgets, goals, queryData);
        
        const recentMessages = conversation.messages.slice(-6, -1);
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
- If user asks about a specific category, look at both THIS MONTH'S and ALL TIME data
- CRITICAL: When analyzing affordability or balance, ALWAYS use the "Current Balance" from THIS MONTH section
- CRITICAL: The "Current Balance" already accounts for both income and expenses for the current month
- If income is ₹0.00 for this month, explicitly mention that no income has been recorded yet`;

        const aiResult = await callAIWithRetry(
          prompt,
          'You are a helpful personal finance assistant specializing in Indian personal finance. Provide clear, concise answers with specific numbers and actionable advice. Always use ₹ for currency.',
          { maxTokens: 500, temperature: 0.7 }
        );

        responseText = aiResult.text;
        apiUsed = aiResult.api;
      } catch (llmError) {
        
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
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// @route   POST /api/ai/conversations/new
// @desc    Start new conversation
// @access  Private
router.post('/conversations/new', auth, async (req, res) => {
  try {
    const conversationId = crypto.randomUUID();
    res.json({ conversationId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Helper function to analyze affordability
function analyzeAffordability(amount, expenses, incomes, originalQuery) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  
  // Calculate current month data
  const monthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  
  const monthIncome = incomes.filter(inc => {
    const incDate = new Date(inc.date);
    return incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear;
  });
  
  const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthIncomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const currentBalance = monthIncomeTotal - monthExpenseTotal;
  
  let response = `🔍 **Affordability Analysis for ₹${amount.toFixed(2)}:**\n\n`;
  response += `📊 **Current Month Status:**\n`;
  response += `• Income: ₹${monthIncomeTotal.toFixed(2)}\n`;
  response += `• Expenses: ₹${monthExpenseTotal.toFixed(2)}\n`;
  response += `• Current Balance: ₹${currentBalance.toFixed(2)}\n`;
  response += `• Days Remaining: ${daysRemaining}\n\n`;
  
  // Determine affordability
  const canAfford = currentBalance >= amount;
  const balanceAfterPurchase = currentBalance - amount;
  const dailyBudgetRemaining = daysRemaining > 0 ? balanceAfterPurchase / daysRemaining : 0;
  
  if (canAfford) {
    if (balanceAfterPurchase >= 0) {
      response += `✅ **RECOMMENDED**\n\n`;
      response += `⚠️ This purchase would ${balanceAfterPurchase < currentBalance * 0.2 ? 'significantly reduce' : 'reduce'} your balance by ₹${amount.toFixed(2)}.\n\n`;
      response += `💡 **After Purchase:**\n`;
      response += `• Remaining Balance: ₹${balanceAfterPurchase.toFixed(2)}\n`;
      
      if (daysRemaining > 0) {
        response += `• Daily Budget for Rest of Month: ₹${dailyBudgetRemaining.toFixed(2)}\n`;
      }
      
      if (balanceAfterPurchase < 1000) {
        response += `\n⚠️ **Warning:** Your remaining balance will be very low. Consider:\n`;
        response += `• Postponing non-essential purchases\n`;
        response += `• Ensuring you have emergency funds\n`;
        response += `• Checking if this purchase is truly necessary\n`;
      }
    } else {
      response += `❌ **NOT RECOMMENDED**\n\n`;
      response += `⚠️ This purchase would exceed your current balance by ₹${Math.abs(balanceAfterPurchase).toFixed(2)}.\n\n`;
      response += `💡 **Suggestion:** Wait until next month or consider a smaller amount.\n`;
    }
  } else {
    response += `❌ **NOT RECOMMENDED**\n\n`;
    response += `⚠️ This purchase would exceed your current balance by ₹${Math.abs(balanceAfterPurchase).toFixed(2)}.\n\n`;
    response += `💡 **Suggestions:**\n`;
    response += `• Wait until next month when you receive more income\n`;
    response += `• Consider a smaller purchase amount\n`;
    response += `• Review your expenses to find areas to cut back\n`;
    
    if (monthIncomeTotal === 0) {
      response += `\n📝 **Note:** No income recorded for this month yet. Add your income to get accurate affordability analysis.\n`;
    }
  }
  
  return response;
}

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
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  const monthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const expYear = expDate.getFullYear();
    const expMonth = expDate.getMonth();
    return expYear === currentYear && expMonth === currentMonth;
  });
  
  const monthIncome = incomes.filter(inc => {
    const incDate = new Date(inc.date);
    const incYear = incDate.getFullYear();
    const incMonth = incDate.getMonth();
    return incYear === currentYear && incMonth === currentMonth;
  });
  
  // Debug: Log income data for troubleshooting
  console.log('🔍 AI Context Debug:');
  console.log(`Total incomes in DB: ${incomes.length}`);
  console.log(`Current month incomes: ${monthIncome.length}`);
  if (incomes.length > 0) {
    console.log('Sample income dates:', incomes.slice(0, 3).map(inc => ({
      date: inc.date,
      amount: inc.amount,
      source: inc.source
    })));
  }
  
  const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthIncomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  
  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`📅 Current Month: ${currentMonthName} ${currentYear} (Month index: ${currentMonth})`);
    console.log(`📊 Date Range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);
    console.log(`💰 Total Income Records: ${incomes.length}, This Month: ${monthIncome.length}`);
    if (monthIncome.length > 0) {
      console.log(`💰 Income dates this month:`, monthIncome.map(inc => ({
        date: new Date(inc.date).toISOString(),
        amount: inc.amount,
        source: inc.source
      })));
    }
    console.log(`💸 Total Expense Records: ${expenses.length}, This Month: ${monthExpenses.length}`);
    console.log(`💵 Month Income Total: ₹${monthIncomeTotal.toFixed(2)}`);
    console.log(`💳 Month Expense Total: ₹${monthExpenseTotal.toFixed(2)}`);
  }

  context += `THIS MONTH (${currentMonthName} ${currentYear}):\n`;
  context += `Income: ₹${monthIncomeTotal.toFixed(2)} (${monthIncome.length} transaction${monthIncome.length !== 1 ? 's' : ''})\n`;
  context += `Expenses: ₹${monthExpenseTotal.toFixed(2)} (${monthExpenses.length} transaction${monthExpenses.length !== 1 ? 's' : ''})\n`;
  context += `Current Balance: ₹${(monthIncomeTotal - monthExpenseTotal).toFixed(2)}\n`;
  context += `Days Remaining: ${daysRemaining}\n`;
  
  // Add income details for this month if available
  if (monthIncome.length > 0) {
    context += `\nTHIS MONTH'S INCOME DETAILS:\n`;
    monthIncome.forEach(inc => {
      const incDate = new Date(inc.date);
      const dayOfMonth = incDate.getDate();
      context += `- ${currentMonthName} ${dayOfMonth}: ${inc.source} - ₹${inc.amount.toFixed(2)}${inc.description ? ` (${inc.description})` : ''}\n`;
    });
  }
  context += `\n`;

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
      const scoreText = score !== null ? `📊 **Financial Health Score: ${score}/100**` : '📊 **Financial Health Score: Not enough data yet**';

      console.log(`✅ ${type} suggestions generated successfully`);

      res.json({
        suggestions: `🤖 **AI Financial Advisor** (${aiResult.api}):\n\n${aiResult.text}\n\n${scoreText}`
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
  const scoreText = score !== null ? `📊 **Financial Health Score: ${score}/100**` : '📊 **Financial Health Score: Not enough data yet**';

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

${scoreText}`;
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

${scoreText}`;
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

${scoreText}`;
  }
}

export default router;
