/**
 * Shared validation utilities
 * Reduces code duplication across routes
 */

/**
 * Validate amount field
 * @param {number} amount - Amount to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
const validateAmount = (amount, fieldName = 'Amount') => {
  if (amount === undefined || amount === null) {
    return { valid: false, error: `${fieldName} is required` }
  }

  const numAmount = Number(amount)

  if (isNaN(numAmount)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }

  if (numAmount <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` }
  }

  if (numAmount > 10000000) {
    return { valid: false, error: `${fieldName} cannot exceed ₹10,000,000` }
  }

  return { valid: true, value: numAmount }
}

/**
 * Validate category field
 * @param {string} category - Category to validate
 * @param {Array} allowedCategories - List of allowed categories
 * @returns {Object} Validation result
 */
const validateCategory = (category, allowedCategories = null) => {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Category is required' }
  }

  const trimmedCategory = category.trim()

  if (trimmedCategory.length === 0) {
    return { valid: false, error: 'Category cannot be empty' }
  }

  if (trimmedCategory.length > 50) {
    return { valid: false, error: 'Category name too long (max 50 characters)' }
  }

  if (allowedCategories && !allowedCategories.includes(trimmedCategory)) {
    return { 
      valid: false, 
      error: `Invalid category. Allowed: ${allowedCategories.join(', ')}` 
    }
  }

  return { valid: true, value: trimmedCategory }
}

/**
 * Validate date field
 * @param {string|Date} date - Date to validate
 * @returns {Object} Validation result
 */
const validateDate = (date) => {
  if (!date) {
    return { valid: false, error: 'Date is required' }
  }

  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  // Check if date is not too far in the future (1 year)
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  if (dateObj > oneYearFromNow) {
    return { valid: false, error: 'Date cannot be more than 1 year in the future' }
  }

  // Check if date is not too far in the past (10 years)
  const tenYearsAgo = new Date()
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)

  if (dateObj < tenYearsAgo) {
    return { valid: false, error: 'Date cannot be more than 10 years in the past' }
  }

  return { valid: true, value: dateObj }
}

/**
 * Validate description field
 * @param {string} description - Description to validate
 * @param {boolean} required - Whether description is required
 * @returns {Object} Validation result
 */
const validateDescription = (description, required = false) => {
  if (!description || description.trim().length === 0) {
    if (required) {
      return { valid: false, error: 'Description is required' }
    }
    return { valid: true, value: '' }
  }

  const trimmedDesc = description.trim()

  if (trimmedDesc.length > 500) {
    return { valid: false, error: 'Description too long (max 500 characters)' }
  }

  return { valid: true, value: trimmedDesc }
}

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated pagination params
 */
const validatePagination = (params) => {
  const { page = 1, limit = 50 } = params

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: 'Invalid page number' }
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { valid: false, error: 'Invalid limit (must be between 1 and 100)' }
  }

  return { 
    valid: true, 
    value: { 
      page: pageNum, 
      limit: limitNum,
      skip: (pageNum - 1) * limitNum
    } 
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const trimmedEmail = email.trim().toLowerCase()

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true, value: trimmedEmail }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password too long (max 128 characters)' }
  }

  return { valid: true, value: password }
}

module.exports = {
  validateAmount,
  validateCategory,
  validateDate,
  validateDescription,
  validatePagination,
  validateEmail,
  validatePassword
}
