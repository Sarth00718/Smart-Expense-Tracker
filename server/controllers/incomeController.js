const Income = require('../models/Income');

// @desc    Get unique income sources
// @access  Private
exports.getSources = async (req, res) => {
  try {
    const sources = await Income.distinct('source', { userId: req.userId });
    res.json({ sources: sources.sort() });
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
};

// @desc    Get all income with pagination
// @access  Private
exports.getAllIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 50;
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    const query = { userId: req.userId };

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    if (req.query.source) {
      query.source = req.query.source;
    }

    const total = await Income.countDocuments(query);
    const income = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: income,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

// @desc    Add new income
// @access  Private
exports.createIncome = async (req, res) => {
  try {
    const { date, source, amount, description, isRecurring } = req.body;

    if (!date || !source || !amount) {
      return res.status(400).json({ error: 'Date, source, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (amount > 999999999) {
      return res.status(400).json({ error: 'Amount is too large' });
    }

    const income = new Income({
      userId: req.userId,
      date: new Date(date),
      source,
      amount: parseFloat(amount),
      description: description || '',
      isRecurring: isRecurring || false
    });

    await income.save();
    res.status(201).json(income);
  } catch (error) {
    console.error('Add income error:', error);
    res.status(500).json({ error: 'Failed to add income' });
  }
};

// @desc    Update income
// @access  Private
exports.updateIncome = async (req, res) => {
  try {
    const { date, source, amount, description, isRecurring } = req.body;

    const income = await Income.findOne({ _id: req.params.id, userId: req.userId });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    if (date) income.date = new Date(date);
    if (source) income.source = source;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }
      if (amount > 999999999) {
        return res.status(400).json({ error: 'Amount is too large' });
      }
      income.amount = parseFloat(amount);
    }
    if (description !== undefined) income.description = description;
    if (isRecurring !== undefined) income.isRecurring = isRecurring;

    await income.save();
    res.json(income);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
};

// @desc    Get income summary statistics
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const totalResult = await Income.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const total = totalResult[0]?.total || 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthResult = await Income.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonth = monthResult[0]?.total || 0;

    const sources = await Income.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      total_income: Math.round(total * 100) / 100,
      this_month: Math.round(thisMonth * 100) / 100,
      sources: sources.map(src => ({
        source: src._id,
        total: Math.round(src.total * 100) / 100,
        count: src.count
      }))
    });
  } catch (error) {
    console.error('Get income summary error:', error);
    res.status(500).json({ error: 'Failed to fetch income summary' });
  }
};

// @desc    Delete income
// @access  Private
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
};
