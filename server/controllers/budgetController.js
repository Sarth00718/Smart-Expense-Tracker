const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Set budget for category
// @access  Private
exports.createBudget = async (req, res) => {
  try {
    const { category, monthlyBudget } = req.body;

    if (!category || !monthlyBudget) {
      return res.status(400).json({ error: 'Category and monthly budget are required' });
    }

    if (monthlyBudget <= 0) {
      return res.status(400).json({ error: 'Budget must be positive' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category },
      { monthlyBudget: parseFloat(monthlyBudget) },
      { new: true, upsert: true }
    );

    res.json(budget);
  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({ error: 'Failed to set budget' });
  }
};

// @desc    Get all budgets with spending analysis
// @access  Private
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spendingMap = {};
    expenses.forEach(exp => {
      spendingMap[exp._id] = exp.total;
    });

    const result = budgets.map(budget => {
      const spent = spendingMap[budget.category] || 0;
      const remaining = Math.max(0, budget.monthlyBudget - spent);
      const percentage = budget.monthlyBudget > 0 
        ? Math.min(100, (spent / budget.monthlyBudget) * 100) 
        : 0;

      return {
        _id: budget._id,
        category: budget.category,
        budget: budget.monthlyBudget,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        status: spent > budget.monthlyBudget ? 'over' : 'under'
      };
    });

    res.json({ budgets: result });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

// @desc    Delete budget
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      userId: req.userId,
      category: req.params.category
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
