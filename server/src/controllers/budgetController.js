import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      { $match: { userId: req.userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const spendingMap = {};
    expenses.forEach((e) => { spendingMap[e._id] = e.total; });

    const result = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const remaining = Math.max(0, b.monthlyBudget - spent);
      const percentage = b.monthlyBudget > 0 ? Math.min(100, (spent / b.monthlyBudget) * 100) : 0;
      return {
        _id: b._id,
        category: b.category,
        budget: b.monthlyBudget,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        status: spent > b.monthlyBudget ? 'over' : 'under',
      };
    });

    res.json({ budgets: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const createBudget = async (req, res) => {
  try {
    const { category, monthlyBudget } = req.body;
    if (!category || !monthlyBudget) return res.status(400).json({ error: 'Category and monthly budget are required' });
    if (monthlyBudget <= 0) return res.status(400).json({ error: 'Budget must be positive' });

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category },
      { monthlyBudget: parseFloat(monthlyBudget) },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ userId: req.userId, category: req.params.category });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
