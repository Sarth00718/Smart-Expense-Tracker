const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const { 
  calculateSpendingScore, 
  detectBehavioralPatterns, 
  predictFutureExpenses,
  getHeatmapData 
} = require('../utils/analytics');

// @desc    Get dashboard statistics
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalExpensesResult = await Expense.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;

    const totalIncomeResult = await Income.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = totalIncomeResult[0]?.total || 0;

    const monthExpensesResult = await Expense.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthExpenses = monthExpensesResult[0]?.total || 0;

    const monthIncomeResult = await Income.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthIncome = monthIncomeResult[0]?.total || 0;

    const netBalance = totalIncome - totalExpenses;
    const monthNetBalance = monthIncome - monthExpenses;

    const categories = await Expense.distinct('category', { userId: req.userId });

    const recentExpenseCount = await Expense.countDocuments({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    const recentIncomeCount = await Income.countDocuments({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    const budgetCount = await Budget.countDocuments({ userId: req.userId });
    const goalsCount = await Goal.countDocuments({ userId: req.userId });
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
};

// @desc    Get calendar heatmap data
// @access  Private
exports.getHeatmap = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    // Only fetch expenses for the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({ 
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).select('date amount category').lean();

    const heatmapData = getHeatmapData(expenses, year, month);

    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
};

// @desc    Detect behavioral patterns
// @access  Private
exports.getPatterns = async (req, res) => {
  try {
    // Only fetch last 3 months of expenses for pattern detection
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({ 
      userId: req.userId,
      date: { $gte: threeMonthsAgo }
    })
      .select('date amount category paymentMode')
      .sort({ date: -1 })
      .limit(200)
      .lean();

    const patterns = detectBehavioralPatterns(expenses);

    res.json({ patterns });
  } catch (error) {
    console.error('Patterns error:', error);
    res.status(500).json({ error: 'Failed to detect patterns' });
  }
};

// @desc    Predict future expenses
// @access  Private
exports.getPredictions = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    
    // Only fetch last 6 months for predictions
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await Expense.find({ 
      userId: req.userId,
      date: { $gte: sixMonthsAgo }
    })
      .select('date amount category')
      .sort({ date: 1 })
      .lean();

    const predictions = predictFutureExpenses(expenses, months);

    res.json({ predictions });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
};

// @desc    Calculate spending score
// @access  Private
exports.getScore = async (req, res) => {
  try {
    // Only fetch last 3 months for score calculation
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({ 
      userId: req.userId,
      date: { $gte: threeMonthsAgo }
    })
      .select('date amount category')
      .lean();

    const score = calculateSpendingScore(expenses);

    // Handle new accounts with no expenses
    if (score === null) {
      return res.json({
        score: null,
        rating: 'No Data Yet',
        color: '#94a3b8',
        maxScore: 100,
        message: 'Start tracking expenses to see your financial health score'
      });
    }

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
      score: null, 
      rating: 'Good', 
      color: '#3b82f6', 
      maxScore: 100 
    });
  }
};
