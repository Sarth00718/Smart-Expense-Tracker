const Expense = require('../models/Expense');
const { checkAndAwardAchievements } = require('../utils/achievements');
const { parseNaturalLanguageQuery } = require('../utils/nlp');
const { escapeRegex, isStringArray } = require('../utils/securityUtils');
const { 
  getSummaryStats, 
  validateAmount, 
  buildDateFilter, 
  buildPagination, 
  formatPaginationResponse 
} = require('../utils/sharedControllers');

// @desc    Filter expenses
// @access  Private
exports.filterExpenses = async (req, res) => {
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
    console.error('Filter expenses error:', error);
    res.status(500).json({ error: 'Failed to filter expenses' });
  }
};

// @desc    Get unique categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Expense.distinct('category', { userId: req.userId });
    res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Get expense summary statistics
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const summary = await getSummaryStats(Expense, req.userId, 'category');
    
    res.json({
      total_expenses: summary.total,
      this_month: summary.thisMonth,
      categories: summary.groups.map(g => ({
        category: g.category,
        total: g.total,
        count: g.count
      }))
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// @desc    Get total of all expenses
// @access  Private
exports.getTotal = async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const total = result[0]?.total || 0;
    res.json({ total_expense: Math.round(total * 100) / 100 });
  } catch (error) {
    console.error('Get total error:', error);
    res.status(500).json({ error: 'Failed to fetch total' });
  }
};

// @desc    Get summary by category
// @access  Private
exports.getCategorySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const result = summary.map(item => [
      item._id,
      Math.round(item.total * 100) / 100
    ]);

    res.json(result);
  } catch (error) {
    console.error('Get category summary error:', error);
    res.status(500).json({ error: 'Failed to fetch category summary' });
  }
};

// @desc    Get recent expenses with limit
// @access  Private
exports.getRecentExpenses = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);
    res.json(expenses);
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch recent expenses' });
  }
};

// @desc    Natural language search
// @access  Private
exports.searchExpenses = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const filters = parseNaturalLanguageQuery(query);

    const dbQuery = { userId: req.userId };

    if (filters.category) dbQuery.category = filters.category;
    if (filters.minAmount) dbQuery.amount = { ...dbQuery.amount, $gte: filters.minAmount };
    if (filters.maxAmount) dbQuery.amount = { ...dbQuery.amount, $lte: filters.maxAmount };

    if (filters.startDate && filters.endDate) {
      dbQuery.date = {
        $gte: filters.startDate,
        $lte: filters.endDate
      };
    } else if (filters.timePeriod) {
      const now = new Date();
      let startDate;

      switch (filters.timePeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo;
          break;
      }

      if (startDate) {
        dbQuery.date = { $gte: startDate };
      }
    }

    if (filters.descriptionKeywords.length > 0 && !filters.category) {
      if (!isStringArray(filters.descriptionKeywords)) {
        return res.status(400).json({ error: 'Invalid search keywords format' });
      }

      const escapedKeywords = filters.descriptionKeywords.map(keyword => escapeRegex(keyword));

      dbQuery.$or = escapedKeywords.map(keyword => ({
        $or: [
          { description: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } }
        ]
      }));
    }

    const expenses = await Expense.find(dbQuery).sort({ date: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      query,
      count: expenses.length,
      total: Math.round(total * 100) / 100,
      filters: filters.timePeriod || filters.category || 'custom',
      results: expenses
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

// @desc    Add new expense
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring } = req.body;

    if (!date || !category || !amount) {
      return res.status(400).json({ error: 'Date, category, and amount are required' });
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.error });
    }

    const expense = new Expense({
      userId: req.userId,
      date: new Date(date),
      category,
      amount: amountValidation.value,
      description: description || '',
      isRecurring: isRecurring || false
    });

    await expense.save();

    try {
      await checkAndAwardAchievements(req.userId);
    } catch (achievementError) {
      console.error('Achievement check failed:', achievementError);
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// @desc    Get all expenses for user with pagination
// @access  Private
exports.getAllExpenses = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const query = { userId: req.userId };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: expenses,
      pagination: formatPaginationResponse(total, page, limit)
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// @desc    Delete all expenses for user
// @access  Private
exports.deleteAllExpenses = async (req, res) => {
  try {
    const result = await Expense.deleteMany({ userId: req.userId });

    res.json({
      message: 'All expenses deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all expenses error:', error);
    res.status(500).json({ error: 'Failed to delete expenses' });
  }
};

// @desc    Update expense
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (date) expense.date = new Date(date);
    if (category) expense.category = category;
    if (amount !== undefined) {
      const amountValidation = validateAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({ error: amountValidation.error });
      }
      expense.amount = amountValidation.value;
    }
    if (description !== undefined) expense.description = description;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;

    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// @desc    Delete expense
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
