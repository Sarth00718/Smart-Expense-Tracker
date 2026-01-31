const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ExpenseTemplate = require('../models/ExpenseTemplate');
const Expense = require('../models/Expense');

/**
 * GET /api/templates
 * Get all expense templates for user
 */
router.get('/', auth, async (req, res) => {
  try {
    const { category, sortBy = 'createdAt' } = req.query;

    const query = { userId: req.userId };
    if (category) {
      query.templateCategory = category;
    }

    const sortOptions = {
      createdAt: { createdAt: -1 },
      name: { name: 1 },
      usage: { usageCount: -1 },
      lastUsed: { lastUsed: -1 }
    };

    const templates = await ExpenseTemplate.find(query)
      .sort(sortOptions[sortBy] || sortOptions.createdAt);

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * GET /api/templates/:id
 * Get single template
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await ExpenseTemplate.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * POST /api/templates
 * Create new expense template
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      category,
      amount,
      description,
      paymentMode,
      tags,
      templateCategory,
      isRecurring
    } = req.body;

    // Validation
    if (!name || !category || !amount) {
      return res.status(400).json({ error: 'Name, category, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const template = new ExpenseTemplate({
      userId: req.userId,
      name,
      category,
      amount,
      description,
      paymentMode,
      tags,
      templateCategory,
      isRecurring
    });

    await template.save();

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/templates/:id
 * Update expense template
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await ExpenseTemplate.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const {
      name,
      category,
      amount,
      description,
      paymentMode,
      tags,
      templateCategory,
      isRecurring
    } = req.body;

    if (name) template.name = name;
    if (category) template.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }
      template.amount = amount;
    }
    if (description !== undefined) template.description = description;
    if (paymentMode) template.paymentMode = paymentMode;
    if (tags !== undefined) template.tags = tags;
    if (templateCategory) template.templateCategory = templateCategory;
    if (isRecurring !== undefined) template.isRecurring = isRecurring;

    await template.save();

    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete expense template
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await ExpenseTemplate.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * POST /api/templates/:id/use
 * Create expense from template
 */
router.post('/:id/use', auth, async (req, res) => {
  try {
    const template = await ExpenseTemplate.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { date, customAmount, customDescription } = req.body;

    // Create expense from template
    const expense = new Expense({
      userId: req.userId,
      category: template.category,
      amount: customAmount || template.amount,
      description: customDescription || template.description,
      paymentMode: template.paymentMode,
      tags: template.tags,
      isRecurring: template.isRecurring,
      date: date || new Date()
    });

    await expense.save();

    // Increment template usage
    await template.incrementUsage();

    res.status(201).json({
      expense,
      template: {
        id: template._id,
        name: template.name,
        usageCount: template.usageCount
      }
    });
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({ error: 'Failed to create expense from template' });
  }
});

/**
 * GET /api/templates/stats/summary
 * Get template usage statistics
 */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const templates = await ExpenseTemplate.find({ userId: req.userId });

    const stats = {
      total: templates.length,
      byCategory: {},
      mostUsed: templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(t => ({
          id: t._id,
          name: t.name,
          usageCount: t.usageCount,
          lastUsed: t.lastUsed
        })),
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0)
    };

    // Count by template category
    templates.forEach(t => {
      stats.byCategory[t.templateCategory] = (stats.byCategory[t.templateCategory] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Template stats error:', error);
    res.status(500).json({ error: 'Failed to fetch template statistics' });
  }
});

module.exports = router;
