const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// @route   GET /api/budget-recommendations
// @desc    Get AI-driven budget recommendations based on spending patterns
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get expenses from last 3+ months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: threeMonthsAgo }
    }).sort({ date: 1 });

    // Check if we have sufficient data (minimum 3 months)
    if (expenses.length === 0) {
      return res.json({
        hasData: false,
        message: 'No expense data available. Start tracking expenses to get personalized budget recommendations.',
        recommendations: []
      });
    }

    // Check if data spans at least 3 months
    const oldestExpense = expenses[0];
    const monthsOfData = Math.floor(
      (new Date() - new Date(oldestExpense.date)) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsOfData < 3) {
      return res.json({
        hasData: false,
        message: `You have ${monthsOfData} month(s) of data. We need at least 3 months of expense history to provide accurate budget recommendations. Keep tracking!`,
        recommendations: []
      });
    }

    // Get income data for context
    const incomeData = await Income.find({
      userId: req.userId,
      date: { $gte: threeMonthsAgo }
    });

    const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
    const avgMonthlyIncome = totalIncome / Math.max(monthsOfData, 1);

    // Analyze spending by category
    const categorySpending = {};
    const categoryMonths = {};

    expenses.forEach(exp => {
      const month = exp.date.toISOString().substring(0, 7);
      
      if (!categorySpending[exp.category]) {
        categorySpending[exp.category] = [];
        categoryMonths[exp.category] = new Set();
      }
      
      categorySpending[exp.category].push(exp.amount);
      categoryMonths[exp.category].add(month);
    });

    // Generate recommendations
    const recommendations = [];

    for (const [category, amounts] of Object.entries(categorySpending)) {
      const total = amounts.reduce((sum, amt) => sum + amt, 0);
      const avg = total / amounts.length;
      const monthsActive = categoryMonths[category].size;
      const avgMonthly = total / monthsActive;

      // Calculate variance for confidence
      const mean = avgMonthly;
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;

      // Determine confidence level
      let confidence;
      if (coefficientOfVariation < 0.3) {
        confidence = 'high';
      } else if (coefficientOfVariation < 0.6) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      // Calculate recommended budget (avg + 15% buffer)
      const recommendedBudget = Math.round(avgMonthly * 1.15);

      // Generate reasoning
      let reasoning = `Based on ${monthsActive} months of data, you spend an average of ₹${Math.round(avgMonthly)} per month on ${category}. `;
      
      if (confidence === 'high') {
        reasoning += 'Your spending is consistent, so this budget should work well.';
      } else if (confidence === 'medium') {
        reasoning += 'Your spending varies moderately, so we added a 15% buffer.';
      } else {
        reasoning += 'Your spending varies significantly. Consider reviewing this category more closely.';
      }

      // Add income-based insight
      if (avgMonthlyIncome > 0) {
        const percentage = (recommendedBudget / avgMonthlyIncome) * 100;
        reasoning += ` This represents ${percentage.toFixed(1)}% of your average monthly income.`;
      }

      recommendations.push({
        category,
        recommendedAmount: recommendedBudget,
        currentAverage: Math.round(avgMonthly),
        confidence,
        reasoning,
        dataPoints: amounts.length,
        monthsAnalyzed: monthsActive
      });
    }

    // Sort by recommended amount (highest first)
    recommendations.sort((a, b) => b.recommendedAmount - a.recommendedAmount);

    const totalRecommended = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);

    res.json({
      hasData: true,
      monthsAnalyzed: monthsOfData,
      totalRecommendedBudget: totalRecommended,
      avgMonthlyIncome: Math.round(avgMonthlyIncome),
      recommendations
    });

  } catch (error) {
    console.error('Budget recommendations error:', error);
    res.status(500).json({ 
      error: 'Unable to generate budget recommendations. Please try again later.',
      hasData: false,
      recommendations: []
    });
  }
});

module.exports = router;
