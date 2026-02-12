/**
 * Shared controller utilities to reduce code duplication
 * Common patterns extracted from expense and income controllers
 */

/**
 * Get summary statistics for a collection
 * @param {Model} Model - Mongoose model
 * @param {String} userId - User ID
 * @param {String} groupField - Field to group by (e.g., 'category', 'source')
 * @returns {Object} Summary statistics
 */
async function getSummaryStats(Model, userId, groupField = 'category') {
  const totalResult = await Model.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const total = totalResult[0]?.total || 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthResult = await Model.aggregate([
    { $match: { userId, date: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const thisMonth = monthResult[0]?.total || 0;

  const groups = await Model.aggregate([
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
    total: Math.round(total * 100) / 100,
    thisMonth: Math.round(thisMonth * 100) / 100,
    groups: groups.map(g => ({
      [groupField]: g._id,
      total: Math.round(g.total * 100) / 100,
      count: g.count
    }))
  };
}

/**
 * Validate and sanitize amount
 * @param {*} amount - Amount to validate
 * @param {String} fieldName - Field name for error messages
 * @returns {Object} { valid: boolean, value?: number, error?: string }
 */
function validateAmount(amount, fieldName = 'Amount') {
  if (amount === undefined || amount === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (numAmount <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` };
  }

  if (numAmount > 999999999) {
    return { valid: false, error: `${fieldName} is too large` };
  }

  return { valid: true, value: numAmount };
}

/**
 * Build date query filter
 * @param {Object} query - Query parameters
 * @returns {Object} MongoDB date filter
 */
function buildDateFilter(query) {
  const { startDate, endDate } = query;
  
  if (!startDate && !endDate) {
    return {};
  }

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  return { date: dateFilter };
}

/**
 * Build pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Pagination config
 */
function buildPagination(query) {
  const page = parseInt(query.page) || 1;
  const requestedLimit = parseInt(query.limit) || 50;
  const limit = Math.min(requestedLimit, 100); // Cap at 100
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Format pagination response
 * @param {Number} total - Total count
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
function formatPaginationResponse(total, page, limit) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
}

module.exports = {
  getSummaryStats,
  validateAmount,
  buildDateFilter,
  buildPagination,
  formatPaginationResponse
};
