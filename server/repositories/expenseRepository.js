const BaseRepository = require('./baseRepository');
const Expense = require('../models/Expense');

class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  async findByUserId(userId, options = {}) {
    return this.find({ userId }, options);
  }

  async findByUserIdAndId(userId, expenseId) {
    return this.findOne({ _id: expenseId, userId });
  }

  async deleteByUserIdAndId(userId, expenseId) {
    return this.model.findOneAndDelete({ _id: expenseId, userId });
  }

  async getTotalByUserId(userId, dateFilter = {}) {
    const match = { userId, ...dateFilter };
    const result = await this.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async getCategorySummary(userId, dateFilter = {}) {
    const match = { userId, ...dateFilter };
    return this.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
  }

  async getMonthlyTotal(userId, startDate, endDate, category = null) {
    const match = { 
      userId, 
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (category) {
      match.category = category;
    }
    
    return this.getTotalByUserId(userId, match);
  }

  async deleteAllByUserId(userId) {
    return this.model.deleteMany({ userId });
  }
}

module.exports = new ExpenseRepository();
