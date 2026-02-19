import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import SavedFilter from '../models/SavedFilter.js';
import Expense from '../models/Expense.js';

/**
 * GET /api/filters
 * Get all saved filters for user
 */
router.get('/', auth, async (req, res) => {
  try {
    const filters = await SavedFilter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(filters);
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

/**
 * POST /api/filters
 * Create new saved filter
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, filters, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Filter name is required' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await SavedFilter.updateMany(
        { userId: req.userId },
        { isDefault: false }
      );
    }

    const savedFilter = new SavedFilter({
      userId: req.userId,
      name,
      filters,
      isDefault
    });

    await savedFilter.save();

    res.status(201).json(savedFilter);
  } catch (error) {
    console.error('Create filter error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Filter with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create filter' });
  }
});

/**
 * PUT /api/filters/:id
 * Update saved filter
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, filters, isDefault } = req.body;

    const savedFilter = await SavedFilter.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!savedFilter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault && !savedFilter.isDefault) {
      await SavedFilter.updateMany(
        { userId: req.userId, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    savedFilter.name = name || savedFilter.name;
    savedFilter.filters = filters || savedFilter.filters;
    savedFilter.isDefault = isDefault !== undefined ? isDefault : savedFilter.isDefault;

    await savedFilter.save();

    res.json(savedFilter);
  } catch (error) {
    console.error('Update filter error:', error);
    res.status(500).json({ error: 'Failed to update filter' });
  }
});

/**
 * DELETE /api/filters/:id
 * Delete saved filter
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await SavedFilter.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    res.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Delete filter error:', error);
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

/**
 * POST /api/filters/search
 * Advanced search with multiple criteria
 */
router.post('/search', auth, async (req, res) => {
  try {
    const {
      dateRange,
      amountRange,
      categories,
      paymentModes,
      tags,
      searchText,
      page = 1,
      limit = 50
    } = req.body;

    // Build query
    const query = { userId: req.userId };

    // Date range filter
    if (dateRange) {
      query.date = {};
      if (dateRange.start) query.date.$gte = new Date(dateRange.start);
      if (dateRange.end) query.date.$lte = new Date(dateRange.end);
    }

    // Amount range filter
    if (amountRange) {
      query.amount = {};
      if (amountRange.min !== undefined) query.amount.$gte = amountRange.min;
      if (amountRange.max !== undefined) query.amount.$lte = amountRange.max;
    }

    // Category filter
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    // Payment mode filter
    if (paymentModes && paymentModes.length > 0) {
      query.paymentMode = { $in: paymentModes };
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Text search
    if (searchText) {
      query.description = { $regex: searchText, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query)
    ]);

    // Calculate aggregates
    const aggregates = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = aggregates[0] || { totalAmount: 0, avgAmount: 0, count: 0 };

    res.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: stats.totalAmount,
        average: stats.avgAmount,
        count: stats.count
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/filters/quick/:preset
 * Quick filter presets
 */
router.get('/quick/:preset', auth, async (req, res) => {
  try {
    const { preset } = req.params;
    const now = new Date();
    let dateRange = {};

    switch (preset) {
      case 'today':
        dateRange = {
          start: new Date(now.setHours(0, 0, 0, 0)),
          end: new Date(now.setHours(23, 59, 59, 999))
        };
        break;

      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        dateRange = {
          start: new Date(yesterday.setHours(0, 0, 0, 0)),
          end: new Date(yesterday.setHours(23, 59, 59, 999))
        };
        break;

      case 'last7days':
        dateRange = {
          start: new Date(now.setDate(now.getDate() - 7)),
          end: new Date()
        };
        break;

      case 'last30days':
        dateRange = {
          start: new Date(now.setDate(now.getDate() - 30)),
          end: new Date()
        };
        break;

      case 'thisMonth':
        dateRange = {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
        break;

      case 'lastMonth':
        dateRange = {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid preset' });
    }

    const expenses = await Expense.find({
      userId: req.userId,
      date: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    }).sort({ date: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      expenses,
      stats: {
        total,
        count: expenses.length,
        average: expenses.length > 0 ? total / expenses.length : 0
      },
      dateRange
    });
  } catch (error) {
    console.error('Quick filter error:', error);
    res.status(500).json({ error: 'Failed to apply quick filter' });
  }
});

export default router;
