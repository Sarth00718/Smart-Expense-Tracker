const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { checkAndAwardAchievements } = require('../utils/achievements');
const { parseNaturalLanguageQuery } = require('../utils/nlp');

// IMPORTANT: Specific routes MUST come before parameterized routes like /:id
// Otherwise Express will match "filter" as an ID parameter

// @route   GET /api/expenses/filter
// @desc    Filter expenses
// @access  Private
router.get('/filter', auth, async (req, res) => {
  try {
    const { category, startDate, endDate, minAmount, maxAmount } = req.query;

    const query = { userId: req.userId };

    if (category) query.category = category;
    if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    if (minAmount) query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
    if (maxAmount) query.amount = { ...query.amount, $lte: parseFloat(maxAmount) };

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Filter expenses error:', error);
    res.status(500).json({ error: 'Failed to filter expenses' });
  }
});

// @route   GET /api/expenses/categories
// @desc    Get unique categories
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Expense.distinct('category', { userId: req.userId });
    res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// @route   GET /api/expenses/summary
// @desc    Get expense summary statistics
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Total expenses
    const totalResult = await Expense.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const total = totalResult[0]?.total || 0;

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthResult = await Expense.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonth = monthResult[0]?.total || 0;

    // Category breakdown
    const categories = await Expense.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      total_expenses: Math.round(total * 100) / 100,
      this_month: Math.round(thisMonth * 100) / 100,
      categories: categories.map(cat => ({
        category: cat._id,
        total: Math.round(cat.total * 100) / 100,
        count: cat.count
      }))
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// @route   GET /api/expenses/total
// @desc    Get total of all expenses
// @access  Private
router.get('/total', auth, async (req, res) => {
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
});

// @route   GET /api/expenses/category-summary
// @desc    Get summary by category
// @access  Private
router.get('/category-summary', auth, async (req, res) => {
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
});

// @route   GET /api/expenses/recent/:limit
// @desc    Get recent expenses with limit
// @access  Private
router.get('/recent/:limit', auth, async (req, res) => {
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
});

// @route   POST /api/expenses/search
// @desc    Natural language search
// @access  Private
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const filters = parseNaturalLanguageQuery(query);

    // Build MongoDB query
    const dbQuery = { userId: req.userId };

    if (filters.category) dbQuery.category = filters.category;
    if (filters.minAmount) dbQuery.amount = { ...dbQuery.amount, $gte: filters.minAmount };
    if (filters.maxAmount) dbQuery.amount = { ...dbQuery.amount, $lte: filters.maxAmount };
    
    // Use startDate and endDate if provided (for year-based queries)
    if (filters.startDate && filters.endDate) {
      dbQuery.date = { 
        $gte: filters.startDate, 
        $lte: filters.endDate 
      };
    } else if (filters.timePeriod) {
      // Fallback to old time period logic
      const now = new Date();
      let startDate;

      switch (filters.timePeriod) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      if (startDate) {
        dbQuery.date = { $gte: startDate };
      }
    }

    // Search in description if keywords provided AND no category specified
    // If category is specified, description keywords are ignored to avoid over-filtering
    if (filters.descriptionKeywords.length > 0 && !filters.category) {
      dbQuery.$or = filters.descriptionKeywords.map(keyword => ({
        $or: [
          { description: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } }
        ]
      }));
    }

    const expenses = await Expense.find(dbQuery).sort({ date: -1 });

    // Calculate total
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
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring } = req.body;

    // Validation
    if (!date || !category || !amount) {
      return res.status(400).json({ error: 'Date, category, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (amount > 999999999) {
      return res.status(400).json({ error: 'Amount is too large' });
    }

    const expense = new Expense({
      userId: req.userId,
      date: new Date(date),
      category,
      amount: parseFloat(amount),
      description: description || '',
      isRecurring: isRecurring || false
    });

    await expense.save();

    // Check for achievements
    await checkAndAwardAchievements(req.userId);

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses for user with pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { userId: req.userId };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// @route   DELETE /api/expenses
// @desc    Delete all expenses for user (DANGEROUS - requires confirmation)
// @access  Private
router.delete('/', auth, async (req, res) => {
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
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, category, amount, description, isRecurring } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update fields
    if (date) expense.date = new Date(date);
    if (category) expense.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }
      if (amount > 999999999) {
        return res.status(400).json({ error: 'Amount is too large' });
      }
      expense.amount = parseFloat(amount);
    }
    if (description !== undefined) expense.description = description;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;

    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
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
});

module.exports = router;
