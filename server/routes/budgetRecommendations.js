const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// @route   GET /api/budget-recommendations
// @desc    Get AI-driven budget recommendations based on current and past months
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get all expenses for the user
    const expenses = await Expense.find({
      userId: req.userId
    }).sort({ date: 1 });

    // Check if we have any data
    if (expenses.length === 0) {
      return res.json({
        hasData: false,
        message: 'No expense data available. Start tracking expenses to get personalized budget recommendations.',
        recommendations: []
      });
    }

    // Calculate unique months of data
    const monthlyData = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      
      if (!monthlyData[monthKey][exp.category]) {
        monthlyData[monthKey][exp.category] = 0;
      }
      
      monthlyData[monthKey][exp.category] += exp.amount;
    });

    const monthsOfData = Object.keys(monthlyData).length;

    console.log(`📊 Budget Recommendations: Found ${monthsOfData} month(s) of expense data`);
    console.log(`📅 Months with data:`, Object.keys(monthlyData).sort());

    // Get income data for context
    const incomeData = await Income.find({
      userId: req.userId
    });

    // Calculate income by month
    const incomeByMonth = {};
    incomeData.forEach(inc => {
      const incDate = new Date(inc.date);
      const monthKey = `${incDate.getFullYear()}-${String(incDate.getMonth() + 1).padStart(2, '0')}`;
      incomeByMonth[monthKey] = (incomeByMonth[monthKey] || 0) + inc.amount;
    });

    const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
    const incomeMonthsCount = Object.keys(incomeByMonth).length || 1;
    const avgMonthlyIncome = totalIncome / incomeMonthsCount;

    // Analyze spending by category across all months
    const categoryAnalysis = {};

    Object.entries(monthlyData).forEach(([month, categories]) => {
      Object.entries(categories).forEach(([category, amount]) => {
        if (!categoryAnalysis[category]) {
          categoryAnalysis[category] = {
            monthlyAmounts: [],
            totalSpent: 0,
            monthsActive: 0
          };
        }
        
        categoryAnalysis[category].monthlyAmounts.push(amount);
        categoryAnalysis[category].totalSpent += amount;
        categoryAnalysis[category].monthsActive++;
      });
    });

    // Generate recommendations
    const recommendations = [];

    for (const [category, data] of Object.entries(categoryAnalysis)) {
      const { monthlyAmounts, totalSpent, monthsActive } = data;
      
      // Calculate average monthly spending
      const avgMonthly = totalSpent / monthsActive;

      // Calculate variance for confidence
      let confidence;
      let coefficientOfVariation = 0;
      
      if (monthsActive === 1) {
        // Single month of data - medium confidence by default
        confidence = 'medium';
      } else {
        const variance = monthlyAmounts.reduce((sum, val) => sum + Math.pow(val - avgMonthly, 2), 0) / monthlyAmounts.length;
        const stdDev = Math.sqrt(variance);
        coefficientOfVariation = avgMonthly > 0 ? stdDev / avgMonthly : 0;

        // Determine confidence level
        if (coefficientOfVariation < 0.3) {
          confidence = 'high';
        } else if (coefficientOfVariation < 0.6) {
          confidence = 'medium';
        } else {
          confidence = 'low';
        }
      }

      // Calculate recommended budget (avg + buffer based on variance)
      let bufferPercentage = 0.15; // Default 15%
      if (confidence === 'low') {
        bufferPercentage = 0.25; // 25% buffer for high variance
      } else if (confidence === 'medium') {
        bufferPercentage = 0.20; // 20% buffer for medium variance
      }
      
      const recommendedBudget = Math.round(avgMonthly * (1 + bufferPercentage));

      // Generate reasoning
      let reasoning = '';
      
      if (monthsActive === 1) {
        reasoning = `Based on 1 month of data, you spent ₹${Math.round(avgMonthly)} on ${category}. `;
        reasoning += `We've added a ${Math.round(bufferPercentage * 100)}% buffer since we have limited history. Track for more months to get more accurate recommendations.`;
      } else {
        reasoning = `Based on ${monthsActive} months of data, you spend an average of ₹${Math.round(avgMonthly)} per month on ${category}. `;
        
        if (confidence === 'high') {
          reasoning += 'Your spending is consistent, so this budget should work well.';
        } else if (confidence === 'medium') {
          reasoning += `Your spending varies moderately, so we added a ${Math.round(bufferPercentage * 100)}% buffer.`;
        } else {
          reasoning += `Your spending varies significantly, so we added a ${Math.round(bufferPercentage * 100)}% buffer. Consider reviewing this category more closely.`;
        }
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
        dataPoints: monthlyAmounts.length,
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
