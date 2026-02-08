/**
 * Shared date filtering utilities
 * Reduces code duplication across routes
 */

/**
 * Build date range query for MongoDB
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (ISO string)
 * @param {string} params.endDate - End date (ISO string)
 * @param {string} params.month - Month filter (YYYY-MM format)
 * @returns {Object} MongoDB date query object
 */
const buildDateQuery = ({ startDate, endDate, month }) => {
  const dateQuery = {}

  if (month) {
    const [year, monthNum] = month.split('-')
    const start = new Date(year, monthNum - 1, 1)
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999)
    dateQuery.$gte = start
    dateQuery.$lte = end
  } else {
    if (startDate) {
      dateQuery.$gte = new Date(startDate)
    }
    if (endDate) {
      dateQuery.$lte = new Date(endDate)
    }
  }

  return Object.keys(dateQuery).length > 0 ? dateQuery : null
}

/**
 * Get date range for common presets
 * @param {string} preset - Preset name (today, yesterday, last7days, etc.)
 * @returns {Object} Date range with start and end dates
 */
const getPresetDateRange = (preset) => {
  const now = new Date()
  let dateRange = {}

  switch (preset) {
    case 'today':
      dateRange = {
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999))
      }
      break

    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      dateRange = {
        start: new Date(yesterday.setHours(0, 0, 0, 0)),
        end: new Date(yesterday.setHours(23, 59, 59, 999))
      }
      break

    case 'last7days':
      dateRange = {
        start: new Date(now.setDate(now.getDate() - 7)),
        end: new Date()
      }
      break

    case 'last30days':
      dateRange = {
        start: new Date(now.setDate(now.getDate() - 30)),
        end: new Date()
      }
      break

    case 'thisMonth':
      dateRange = {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      }
      break

    case 'lastMonth':
      dateRange = {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      }
      break

    case 'thisYear':
      dateRange = {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      }
      break

    default:
      throw new Error('Invalid preset')
  }

  return dateRange
}

/**
 * Parse and validate date parameters
 * @param {Object} params - Query parameters
 * @returns {Object} Validated date parameters
 */
const validateDateParams = (params) => {
  const { startDate, endDate, month } = params

  if (startDate && isNaN(Date.parse(startDate))) {
    throw new Error('Invalid start date format')
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    throw new Error('Invalid end date format')
  }

  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('Invalid month format. Use YYYY-MM')
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date must be before end date')
  }

  return { startDate, endDate, month }
}

module.exports = {
  buildDateQuery,
  getPresetDateRange,
  validateDateParams
}
