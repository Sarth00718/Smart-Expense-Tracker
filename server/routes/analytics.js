const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const { 
  calculateSpendingScore, 
  detectBehavioralPatterns, 
  predictFutureExpenses,
  getHeatmapData 
} = require('../utils/analytics');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics (includes income + expenses)
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;

    // Total income
    const totalIncomeResult = await Income.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = totalIncomeResult[0]?.total || 0;

    // Month expenses
    const monthExpensesResult = await Expense.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthExpenses = monthExpensesResult[0]?.total || 0;

    // Month income
    const monthIncomeResult = await Income.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthIncome = monthIncomeResult[0]?.total || 0;

    // Net balance
    const netBalance = totalIncome - totalExpenses;
    const monthNetBalance = monthIncome - monthExpenses;

    // Category count
    const categories = await Expense.distinct('category', { userId: req.userId });

    // Recent count (last 7 days)
    const recentExpenseCount = await Expense.countDocuments({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    const recentIncomeCount = await Income.countDocuments({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    // Budget count
    const budgetCount = await Budget.countDocuments({ userId: req.userId });

    // Goals count
    const goalsCount = await Goal.countDocuments({ userId: req.userId });

    // Achievements count
    const achievementsCount = await Achievement.countDocuments({ userId: req.userId });

    res.json({
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      monthExpenses: Math.round(monthExpenses * 100) / 100,
      monthIncome: Math.round(monthIncome * 100) / 100,
      monthNetBalance: Math.round(monthNetBalance * 100) / 100,
      categoryCount: categories.length,
      recentExpenseCount,
      recentIncomeCount,
      budgetCount,
      goalsCount,
      achievementsCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// @route   GET /api/analytics/heatmap
// @desc    Get calendar heatmap data
// @access  Private
router.get('/heatmap', auth, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const expenses = await Expense.find({ userId: req.userId });
    const heatmapData = getHeatmapData(expenses, year, month);

    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
});

// @route   GET /api/analytics/patterns
// @desc    Detect behavioral patterns
// @access  Private
router.get('/patterns', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(100);

    const patterns = detectBehavioralPatterns(expenses);

    res.json({ patterns });
  } catch (error) {
    console.error('Patterns error:', error);
    res.status(500).json({ error: 'Failed to detect patterns' });
  }
});

// @route   GET /api/analytics/predictions
// @desc    Predict future expenses
// @access  Private
router.get('/predictions', auth, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: 1 });

    const predictions = predictFutureExpenses(expenses, months);

    res.json({ predictions });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// @route   GET /api/analytics/score
// @desc    Calculate spending score
// @access  Private
router.get('/score', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const score = calculateSpendingScore(expenses);

    let rating, color;
    if (score >= 80) {
      rating = 'Excellent';
      color = '#10b981';
    } else if (score >= 60) {
      rating = 'Good';
      color = '#3b82f6';
    } else if (score >= 40) {
      rating = 'Fair';
      color = '#f59e0b';
    } else {
      rating = 'Needs Improvement';
      color = '#ef4444';
    }

    res.json({
      score,
      rating,
      color,
      maxScore: 100
    });
  } catch (error) {
    console.error('Score error:', error);
    res.status(500).json({ 
      score: 70, 
      rating: 'Good', 
      color: '#3b82f6', 
      maxScore: 100 
    });
  }
});

module.exports = router;
