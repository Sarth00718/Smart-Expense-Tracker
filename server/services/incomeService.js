const incomeRepository = require('../repositories/incomeRepository');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { startOfMonth, endOfMonth } = require('date-fns');

class IncomeService {
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

  async createIncome(userId, data) {
    const { date, source, amount, description, isRecurring } = data;

    if (!date || !source || amount === undefined) {
      throw new ValidationError('Date, source, and amount are required');
    }

    const validatedAmount = this.validateAmount(amount);

    const income = await incomeRepository.create({
      userId,
      date: new Date(date),
      source,
      amount: validatedAmount,
      description: description || '',
      isRecurring: isRecurring || false
    });

    return income;
  }

  async getIncome(userId, options = {}) {
    const { page = 1, limit = 50, startDate, endDate, source } = options;

    const query = { userId };

    if (source) query.source = source;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await incomeRepository.count(query);
    const income = await incomeRepository.find(query, {
      sort: { date: -1, createdAt: -1 },
      skip,
      limit
    });

    return {
      data: income,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getIncomeById(userId, incomeId) {
    const income = await incomeRepository.findByUserIdAndId(userId, incomeId);
    if (!income) {
      throw new NotFoundError('Income');
    }
    return income;
  }

  async updateIncome(userId, incomeId, data) {
    const income = await this.getIncomeById(userId, incomeId);

    if (data.date) income.date = new Date(data.date);
    if (data.source) income.source = data.source;
    if (data.amount !== undefined) income.amount = this.validateAmount(data.amount);
    if (data.description !== undefined) income.description = data.description;
    if (data.isRecurring !== undefined) income.isRecurring = data.isRecurring;

    await income.save();
    return income;
  }

  async deleteIncome(userId, incomeId) {
    const income = await incomeRepository.deleteByUserIdAndId(userId, incomeId);
    if (!income) {
      throw new NotFoundError('Income');
    }
    return { message: 'Income deleted successfully' };
  }

  async getSources(userId) {
    const sources = await incomeRepository.distinct('source', { userId });
    return sources.sort();
  }

  async getSummary(userId) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const total = await incomeRepository.getTotalByUserId(userId);
    const thisMonth = await incomeRepository.getMonthlyTotal(userId, monthStart, monthEnd);
    const sourceSummary = await incomeRepository.getSourceSummary(userId);

    return {
      total_income: Math.round(total * 100) / 100,
      this_month: Math.round(thisMonth * 100) / 100,
      sources: sourceSummary.map(item => ({
        source: item._id,
        total: Math.round(item.total * 100) / 100,
        count: item.count
      }))
    };
  }
}

module.exports = new IncomeService();
