import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Validates a numeric amount value.
 */
export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return { valid: false, error: 'Amount must be a valid number' };
  if (numAmount < 0) return { valid: false, error: 'Amount cannot be negative' };
  if (numAmount > 10000000) return { valid: false, error: 'Amount exceeds maximum limit' };
  return { valid: true, value: Math.round(numAmount * 100) / 100 };
};

/**
 * Builds a Mongoose date filter from query params (startDate, endDate).
 */
export const buildDateFilter = (query) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  return filter;
};

/**
 * Extracts page/limit/skip from query params.
 */
export const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 10000);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Returns a standard pagination metadata object.
 */
export const formatPaginationResponse = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});

/**
 * Computes aggregate summary stats for a given model and user.
 */
export const getSummaryStats = async (Model, userId, groupField) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [totalResult, monthResult, groupResult] = await Promise.all([
    Model.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Model.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Model.aggregate([
      { $match: { userId } },
      { $group: { _id: `$${groupField}`, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  return {
    total: Math.round((totalResult[0]?.total || 0) * 100) / 100,
    thisMonth: Math.round((monthResult[0]?.total || 0) * 100) / 100,
    groups: groupResult.map((g) => ({
      [groupField]: g._id,
      total: Math.round(g.total * 100) / 100,
      count: g.count,
    })),
  };
};
