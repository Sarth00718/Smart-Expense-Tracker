const expenseRepository = require('../repositories/expenseRepository');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { startOfMonth, endOfMonth } = require('date-fns');

class ExpenseService {
  validateAmount(amount) {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      throw new ValidationError('Amount must be a valid number');
    }

    if (numAmount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }

    if (numAmount > 10000000) {
      throw new ValidationError('Amount exceeds maximum limit');
    }

    return Math.round(numAmount * 100) / 100;
  }

  async createExpense(userId, data) {
    const { date, category, amount, description, isRecurring, paymentMode, tags } = data;

    if (!date || !category || amount === undefined) {
      throw new ValidationError('Date, category, and amount are required');
    }

    const validatedAmount = this.validateAmount(amount);

    const expense = await expenseRepository.create({
      userId,
      date: new Date(date),
      category,
      amount: validatedAmount,
      description: description || '',
      isRecurring: isRecurring || false,
      paymentMode: paymentMode || 'Cash',
      tags: tags || []
    });

    return expense;
  }

  async getExpenses(userId, options = {}) {
    const { page = 1, limit = 50, startDate, endDate, category, minAmount, maxAmount } = options;

    const query = { userId };

    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;
    const total = await expenseRepository.count(query);
    const expenses = await expenseRepository.find(query, {
      sort: { date: -1, createdAt: -1 },
      skip,
      limit
    });

    return {
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getExpenseById(userId, expenseId) {
    const expense = await expenseRepository.findByUserIdAndId(userId, expenseId);
    if (!expense) {
      throw new NotFoundError('Expense');
    }
    return expense;
  }

  async updateExpense(userId, expenseId, data) {
    const expense = await this.getExpenseById(userId, expenseId);

    if (data.date) expense.date = new Date(data.date);
    if (data.category) expense.category = data.category;
    if (data.amount !== undefined) expense.amount = this.validateAmount(data.amount);
    if (data.description !== undefined) expense.description = data.description;
    if (data.isRecurring !== undefined) expense.isRecurring = data.isRecurring;
    if (data.paymentMode) expense.paymentMode = data.paymentMode;
    if (data.tags) expense.tags = data.tags;

    await expense.save();
    return expense;
  }

  async deleteExpense(userId, expenseId) {
    const expense = await expenseRepository.deleteByUserIdAndId(userId, expenseId);
    if (!expense) {
      throw new NotFoundError('Expense');
    }
    return { message: 'Expense deleted successfully' };
  }

  async deleteAllExpenses(userId) {
    const result = await expenseRepository.deleteAllByUserId(userId);
    return {
      message: 'All expenses deleted successfully',
      deletedCount: result.deletedCount
    };
  }

  async getCategories(userId) {
    const categories = await expenseRepository.distinct('category', { userId });
    return categories.sort();
  }

  async getSummary(userId) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const total = await expenseRepository.getTotalByUserId(userId);
    const thisMonth = await expenseRepository.getMonthlyTotal(userId, monthStart, monthEnd);
    const categorySummary = await expenseRepository.getCategorySummary(userId);

    return {
      total_expenses: Math.round(total * 100) / 100,
      this_month: Math.round(thisMonth * 100) / 100,
      categories: categorySummary.map(item => ({
        category: item._id,
        total: Math.round(item.total * 100) / 100,
        count: item.count
      }))
    };
  }

  async getCategorySummary(userId) {
    const summary = await expenseRepository.getCategorySummary(userId);
    return summary.map(item => [item._id, Math.round(item.total * 100) / 100]);
  }

  async getRecentExpenses(userId, limit = 10) {
    return expenseRepository.find(
      { userId },
      { sort: { date: -1, createdAt: -1 }, limit }
    );
  }
}

module.exports = new ExpenseService();
