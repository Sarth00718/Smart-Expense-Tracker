import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Achievement from '../models/Achievement.js';
import { 
  calculateSpendingScore, 
  detectBehavioralPatterns, 
  predictFutureExpenses,
  getHeatmapData 
} from '../utils/analytics.js';

// @desc    Get dashboard statistics
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    console.log(`📊 Dashboard request for user: ${req.userId}`);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0); // Ensure start of day
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999); // Ensure end of day
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Log date ranges for debugging
    console.log(`📅 Current month range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

    // Total Expenses (All Time) - Using aggregation to ensure number type
    const totalExpensesResult = await Expense.aggregate([
      { $match: { userId: req.userId } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $toDouble: '$amount' } }, // Ensure number conversion
          count: { $sum: 1 }
        } 
      }
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const totalExpenseCount = totalExpensesResult[0]?.count || 0;

    // Total Income (All Time) - Using aggregation to ensure number type
    const totalIncomeResult = await Income.aggregate([
      { $match: { userId: req.userId } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $toDouble: '$amount' } }, // Ensure number conversion
          count: { $sum: 1 }
        } 
      }
    ]);
    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalIncomeCount = totalIncomeResult[0]?.count || 0;

    // This Month Expenses - Using aggregation with proper date filtering
    const monthExpensesResult = await Expense.aggregate([
      { 
        $match: { 
          userId: req.userId, 
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        } 
      }
    ]);
    const monthExpenses = monthExpensesResult[0]?.total || 0;
    const monthExpenseCount = monthExpensesResult[0]?.count || 0;

    // This Month Income - Using aggregation with proper date filtering
    const monthIncomeResult = await Income.aggregate([
      { 
        $match: { 
          userId: req.userId, 
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        } 
      }
    ]);
    const monthIncome = monthIncomeResult[0]?.total || 0;
    const monthIncomeCount = monthIncomeResult[0]?.count || 0;

    // Calculate balances
    const netBalance = totalIncome - totalExpenses;
    const monthNetBalance = monthIncome - monthExpenses;

    // Log calculations for debugging
    console.log(`💰 Total Income: ₹${totalIncome.toFixed(2)} (${totalIncomeCount} records)`);
    console.log(`💸 Total Expenses: ₹${totalExpenses.toFixed(2)} (${totalExpenseCount} records)`);
    console.log(`💵 Net Balance: ₹${netBalance.toFixed(2)}`);
    console.log(`📅 Month Income: ₹${monthIncome.toFixed(2)} (${monthIncomeCount} records)`);
    console.log(`📅 Month Expenses: ₹${monthExpenses.toFixed(2)} (${monthExpenseCount} records)`);
    console.log(`📅 Month Net Balance: ₹${monthNetBalance.toFixed(2)}`);

    // Get additional stats
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

    // Validate all numbers before sending
    const response = {
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
      achievementsCount,
      // Additional metadata for debugging
      totalExpenseCount,
      totalIncomeCount,
      monthExpenseCount,
      monthIncomeCount,
      calculatedAt: new Date().toISOString()
    };

    console.log(`✅ Dashboard response prepared successfully`);
    res.json(response);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get calendar heatmap data
// @access  Private
export const getHeatmap = async (req, res) => {
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
export const getPatterns = async (req, res) => {
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
export const getPredictions = async (req, res) => {
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
export const getScore = async (req, res) => {
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
