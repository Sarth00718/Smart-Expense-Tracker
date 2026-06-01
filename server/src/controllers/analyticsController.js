import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Achievement from '../models/Achievement.js';
import { calculateSpendingScore, detectBehavioralPatterns, predictFutureExpenses, getHeatmapData } from '../utils/analytics.js';

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalExpensesResult, totalIncomeResult,
      monthExpensesResult, monthIncomeResult,
      categories, recentExpenseCount, recentIncomeCount,
      budgetCount, goalsCount, achievementsCount,
      categoryAgg,
    ] = await Promise.all([
      Expense.aggregate([{ $match: { userId: req.userId } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } }, count: { $sum: 1 } } }]),
      Income.aggregate([{ $match: { userId: req.userId } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } }, count: { $sum: 1 } } }]),
      Expense.aggregate([{ $match: { userId: req.userId, date: { $gte: startOfMonth, $lte: endOfMonth } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } }, count: { $sum: 1 } } }]),
      Income.aggregate([{ $match: { userId: req.userId, date: { $gte: startOfMonth, $lte: endOfMonth } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } }, count: { $sum: 1 } } }]),
      Expense.distinct('category', { userId: req.userId }),
      Expense.countDocuments({ userId: req.userId, date: { $gte: sevenDaysAgo } }),
      Income.countDocuments({ userId: req.userId, date: { $gte: sevenDaysAgo } }),
      Budget.countDocuments({ userId: req.userId }),
      Goal.countDocuments({ userId: req.userId }),
      Achievement.countDocuments({ userId: req.userId }),
      // Category breakdown computed server-side (issue #10)
      Expense.aggregate([
        { $match: { userId: req.userId } },
        { $group: { _id: '$category', total: { $sum: { $toDouble: '$amount' } } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const totalIncome   = totalIncomeResult[0]?.total   || 0;
    const monthExpenses = monthExpensesResult[0]?.total || 0;
    const monthIncome   = monthIncomeResult[0]?.total   || 0;

    const categoryBreakdown = Object.fromEntries(
      categoryAgg.map(({ _id, total }) => [_id, Math.round(total * 100) / 100])
    );
    const topCategories = categoryAgg.slice(0, 5).map(({ _id, total }) => ({
      category: _id,
      total: Math.round(total * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 1000) / 10 : 0,
    }));

    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
      : 0;

    res.json({
      totalExpenses:    Math.round(totalExpenses * 100) / 100,
      totalIncome:      Math.round(totalIncome   * 100) / 100,
      netBalance:       Math.round((totalIncome - totalExpenses) * 100) / 100,
      savingsRate,
      monthExpenses:    Math.round(monthExpenses * 100) / 100,
      monthIncome:      Math.round(monthIncome   * 100) / 100,
      monthNetBalance:  Math.round((monthIncome - monthExpenses) * 100) / 100,
      categoryBreakdown,
      topCategories,
      categoryCount:    categories.length,
      recentExpenseCount,
      recentIncomeCount,
      budgetCount,
      goalsCount,
      achievementsCount,
      totalExpenseCount: totalExpensesResult[0]?.count || 0,
      totalIncomeCount:  totalIncomeResult[0]?.count   || 0,
      monthExpenseCount: monthExpensesResult[0]?.count || 0,
      monthIncomeCount:  monthIncomeResult[0]?.count   || 0,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0, 23, 59, 59) },
    }).select('date amount category').lean();
    res.json(getHeatmapData(expenses, year, month));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
};

export const getPatterns = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const expenses = await Expense.find({ userId: req.userId, date: { $gte: threeMonthsAgo } })
      .select('date amount category paymentMode').sort({ date: -1 }).limit(200).lean();
    res.json({ patterns: detectBehavioralPatterns(expenses) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect patterns' });
  }
};

export const getPredictions = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const expenses = await Expense.find({ userId: req.userId, date: { $gte: sixMonthsAgo } })
      .select('date amount category').sort({ date: 1 }).lean();
    res.json({ predictions: predictFutureExpenses(expenses, months) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
};

export const getScore = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const expenses = await Expense.find({ userId: req.userId, date: { $gte: threeMonthsAgo } })
      .select('date amount category').lean();

    const score = calculateSpendingScore(expenses);

    if (score === null) {
      return res.json({ score: null, rating: 'No Data Yet', color: '#94a3b8', maxScore: 100, message: 'Start tracking expenses to see your financial health score' });
    }

    let rating, color;
    if (score >= 80) { rating = 'Excellent'; color = '#10b981'; }
    else if (score >= 60) { rating = 'Good'; color = '#3b82f6'; }
    else if (score >= 40) { rating = 'Fair'; color = '#f59e0b'; }
    else { rating = 'Needs Improvement'; color = '#ef4444'; }

    res.json({ score, rating, color, maxScore: 100 });
  } catch (error) {
    res.status(500).json({ score: null, rating: 'Good', color: '#3b82f6', maxScore: 100 });
  }
};
