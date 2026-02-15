const BaseRepository = require('./baseRepository');
const Income = require('../models/Income');

class IncomeRepository extends BaseRepository {
  constructor() {
    super(Income);
  }

  async findByUserId(userId, options = {}) {
    return this.find({ userId }, options);
  }

  async findByUserIdAndId(userId, incomeId) {
    return this.findOne({ _id: incomeId, userId });
  }

  async deleteByUserIdAndId(userId, incomeId) {
    return this.model.findOneAndDelete({ _id: incomeId, userId });
  }

  async getTotalByUserId(userId, dateFilter = {}) {
    const match = { userId, ...dateFilter };
    const result = await this.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async getSourceSummary(userId, dateFilter = {}) {
    const match = { userId, ...dateFilter };
    return this.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
  }

  async getMonthlyTotal(userId, startDate, endDate) {
    return this.getTotalByUserId(userId, {
      date: { $gte: startDate, $lte: endDate }
    });
  }
}

module.exports = new IncomeRepository();
