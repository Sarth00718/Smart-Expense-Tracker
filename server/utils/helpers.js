const { startOfMonth, endOfMonth } = require('date-fns');

const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }

  if (numAmount > 10000000) {
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }

  return { valid: true, value: Math.round(numAmount * 100) / 100 };
};

const buildDateFilter = (query) => {
  const filter = {};
  
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  
  return filter;
};

const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

const formatPaginationResponse = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};

const getSummaryStats = async (Model, userId, groupField) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const totalResult = await Model.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const monthResult = await Model.aggregate([
    { 
      $match: { 
        userId, 
        date: { $gte: monthStart, $lte: monthEnd } 
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const groupResult = await Model.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: `$${groupField}`,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return {
    total: Math.round((totalResult[0]?.total || 0) * 100) / 100,
    thisMonth: Math.round((monthResult[0]?.total || 0) * 100) / 100,
    groups: groupResult.map(g => ({
      [groupField]: g._id,
      total: Math.round(g.total * 100) / 100,
      count: g.count
    }))
  };
};

module.exports = {
  validateAmount,
  buildDateFilter,
  buildPagination,
  formatPaginationResponse,
  getSummaryStats
};
