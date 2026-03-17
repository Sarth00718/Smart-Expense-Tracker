import Expense from '../models/Expense.js';
import { checkAndAwardAchievements } from '../utils/achievements.js';
import { escapeRegex, isStringArray } from '../utils/securityUtils.js';
import { getSummaryStats, validateAmount, buildDateFilter, buildPagination, formatPaginationResponse } from '../utils/helpers.js';
import { parseNaturalLanguageQuery } from '../utils/nlp.js';

export const getAllExpenses = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const query = { userId: req.userId, ...buildDateFilter(req.query) };

    if (req.query.category) query.category = req.query.category;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit);

    res.json({ data: expenses, pagination: formatPaginationResponse(total, page, limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring, paymentMode, tags } = req.body;

    if (!date || !category || !amount) {
      return res.status(400).json({ error: 'Date, category, and amount are required' });
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) return res.status(400).json({ error: amountValidation.error });

    const expense = await Expense.create({
      userId: req.userId,
      date: new Date(date),
      category,
      amount: amountValidation.value,
      description: description || '',
      isRecurring: isRecurring || false,
      paymentMode: paymentMode || 'Cash',
      tags: tags || [],
    });

    // Award achievements in background
    checkAndAwardAchievements(req.userId).catch(() => {});

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring, paymentMode, tags } = req.body;
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    if (date) expense.date = new Date(date);
    if (category) expense.category = category;
    if (amount !== undefined) {
      const v = validateAmount(amount);
      if (!v.valid) return res.status(400).json({ error: v.error });
      expense.amount = v.value;
    }
    if (description !== undefined) expense.description = description;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;
    if (paymentMode) expense.paymentMode = paymentMode;
    if (tags) expense.tags = tags;

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

export const deleteAllExpenses = async (req, res) => {
  try {
    const result = await Expense.deleteMany({ userId: req.userId });
    res.json({ message: 'All expenses deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expenses' });
  }
};

export const filterExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, minAmount, maxAmount } = req.query;
    const query = { userId: req.userId };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter expenses' });
  }
};

export const searchExpenses = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const filters = parseNaturalLanguageQuery(query);
    const dbQuery = { userId: req.userId };

    if (filters.category) dbQuery.category = filters.category;
    if (filters.minAmount) dbQuery.amount = { ...dbQuery.amount, $gte: filters.minAmount };
    if (filters.maxAmount) dbQuery.amount = { ...dbQuery.amount, $lte: filters.maxAmount };

    if (filters.startDate && filters.endDate) {
      dbQuery.date = { $gte: filters.startDate, $lte: filters.endDate };
    } else if (filters.timePeriod) {
      const now = new Date();
      const periods = {
        today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      };
      if (filters.timePeriod === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        periods.yesterday = new Date(y.getFullYear(), y.getMonth(), y.getDate());
      }
      if (periods[filters.timePeriod]) dbQuery.date = { $gte: periods[filters.timePeriod] };
    }

    if (filters.descriptionKeywords?.length > 0 && !filters.category) {
      if (!isStringArray(filters.descriptionKeywords)) {
        return res.status(400).json({ error: 'Invalid search keywords format' });
      }
      const escapedKeywords = filters.descriptionKeywords.map(escapeRegex);
      dbQuery.$or = escapedKeywords.map((kw) => ({
        $or: [
          { description: { $regex: kw, $options: 'i' } },
          { category: { $regex: kw, $options: 'i' } },
        ],
      }));
    }

    const expenses = await Expense.find(dbQuery).sort({ date: -1 });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    res.json({ query, count: expenses.length, total: Math.round(total * 100) / 100, results: expenses });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Expense.distinct('category', { userId: req.userId });
    res.json({ categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const summary = await getSummaryStats(Expense, req.userId, 'category');
    res.json({
      total_expenses: summary.total,
      this_month: summary.thisMonth,
      categories: summary.groups.map((g) => ({ category: g.category, total: g.total, count: g.count })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

export const getRecentExpenses = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent expenses' });
  }
};
