/**
 * Math utilities to handle floating point precision issues
 * Prevents common JavaScript math errors like 0.1 + 0.2 = 0.30000000000000004
 */

/**
 * Rounds a number to specified decimal places
 * Handles floating point precision issues
 * 
 * @param {number} value - The number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 * 
 * @example
 * roundToDecimals(0.1 + 0.2, 2) // 0.3 (not 0.30000000000000004)
 * roundToDecimals(1.005, 2) // 1.01 (not 1.00)
 */
export function roundToDecimals(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) return 0
  
  const multiplier = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

/**
 * Safely adds multiple numbers with precision
 * 
 * @param {...number} numbers - Numbers to add
 * @returns {number} Sum with correct precision
 * 
 * @example
 * safeAdd(0.1, 0.2) // 0.3
 * safeAdd(1.1, 2.2, 3.3) // 6.6
 */
export function safeAdd(...numbers) {
  return roundToDecimals(
    numbers.reduce((sum, num) => sum + (Number(num) || 0), 0)
  )
}

/**
 * Safely subtracts numbers with precision
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Difference with correct precision
 */
export function safeSubtract(a, b) {
  return roundToDecimals((Number(a) || 0) - (Number(b) || 0))
}

/**
 * Safely multiplies numbers with precision
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product with correct precision
 */
export function safeMultiply(a, b) {
  return roundToDecimals((Number(a) || 0) * (Number(b) || 0))
}

/**
 * Safely divides numbers with precision
 * 
 * @param {number} a - Numerator
 * @param {number} b - Denominator
 * @returns {number} Quotient with correct precision (0 if denominator is 0)
 */
export function safeDivide(a, b) {
  const denominator = Number(b) || 0
  if (denominator === 0) return 0
  return roundToDecimals((Number(a) || 0) / denominator)
}

/**
 * Calculates percentage with precision
 * 
 * @param {number} value - The value
 * @param {number} total - The total
 * @returns {number} Percentage (0-100) with 2 decimal places
 * 
 * @example
 * calculatePercentage(25, 100) // 25.00
 * calculatePercentage(1, 3) // 33.33
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0
  return roundToDecimals((Number(value) || 0) / (Number(total) || 1) * 100)
}

/**
 * Formats a number as currency with proper rounding
 * 
 * @param {number} value - The value to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.5678) // '₹1,234.57'
 * formatCurrency(0.1 + 0.2) // '₹0.30'
 */
export function formatCurrency(value, currency = '₹', decimals = 2) {
  const rounded = roundToDecimals(value, decimals)
  return `${currency}${rounded.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`
}

/**
 * Converts amount to cents (or paise) for backend storage
 * Prevents floating point issues in database
 * 
 * @param {number} amount - Amount in main currency units
 * @returns {number} Amount in cents/paise (integer)
 * 
 * @example
 * toCents(10.99) // 1099
 * toCents(0.1 + 0.2) // 30
 */
export function toCents(amount) {
  return Math.round((Number(amount) || 0) * 100)
}

/**
 * Converts cents (or paise) back to main currency units
 * 
 * @param {number} cents - Amount in cents/paise
 * @returns {number} Amount in main currency units
 * 
 * @example
 * fromCents(1099) // 10.99
 * fromCents(30) // 0.30
 */
export function fromCents(cents) {
  return roundToDecimals((Number(cents) || 0) / 100)
}

/**
 * Safely parses a string to a number with precision
 * 
 * @param {string|number} value - Value to parse
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {number} Parsed and rounded number
 * 
 * @example
 * parseAmount('123.456') // 123.46
 * parseAmount('invalid') // 0
 */
export function parseAmount(value, decimals = 2) {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) return 0
  return roundToDecimals(parsed, decimals)
}

/**
 * Validates if a value is a valid positive amount
 * 
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid positive amount
 */
export function isValidAmount(value) {
  const num = Number(value)
  return !isNaN(num) && num > 0 && isFinite(num)
}

/**
 * Clamps a value between min and max with precision
 * 
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  const num = Number(value) || 0
  return roundToDecimals(Math.min(Math.max(num, min), max))
}
