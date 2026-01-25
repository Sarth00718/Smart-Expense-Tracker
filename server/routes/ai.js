const express = require('express');
const router = express.Router();
const axios = require('axios');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { calculateSpendingScore } = require('../utils/analytics');

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
