/**
 * Date utilities to handle timezone-aware date operations
 * Prevents timezone shift issues when working with date inputs
 */

/**
 * Converts a date input value to ISO string at start of day in local timezone
 * Prevents timezone shifts when sending dates to backend
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format from input
 * @returns {string} ISO string representing start of day in local timezone
 * 
 * @example
 * // User inputs 2026-08-04, regardless of timezone it stays 2026-08-04
 * toLocalISOString('2026-08-04') // '2026-08-04T00:00:00.000+05:30' (for IST)
 */
export function toLocalISOString(dateString) {
  if (!dateString) return new Date().toISOString()
  
  // Parse the date string as local date (not UTC)
  const [year, month, day] = dateString.split('-').map(Number)
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0)
  
  return localDate.toISOString()
}

/**
 * Converts an ISO date string to YYYY-MM-DD format in local timezone
 * Prevents date from shifting when displaying in date input
 * 
 * @param {string} isoString - ISO date string from backend
 * @returns {string} Date string in YYYY-MM-DD format
 * 
 * @example
 * // Backend sends '2026-08-04T00:00:00.000Z', displays as Aug 04 in all timezones
 * toLocalDateInputValue('2026-08-04T00:00:00.000Z') // '2026-08-04'
 */
export function toLocalDateInputValue(isoString) {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Gets today's date in YYYY-MM-DD format for date input default value
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formats a date for display (e.g., "Aug 04, 2026")
 * Uses local timezone to prevent date shifts
 * 
 * @param {string} isoString - ISO date string
 * @param {string} format - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export function formatLocalDate(isoString, formatStr = 'MMM dd, yyyy') {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const replacements = {
    'yyyy': date.getFullYear(),
    'MMM': months[date.getMonth()],
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'dd': String(date.getDate()).padStart(2, '0'),
    'd': date.getDate()
  }
  
  let result = formatStr
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(key, value)
  }
  
  return result
}

/**
 * Gets the month and year from a date in local timezone
 * Prevents timezone bleeding when grouping by month
 * 
 * @param {string|Date} date - Date to extract month from
 * @returns {string} Month in YYYY-MM format (local timezone)
 * 
 * @example
 * // For a date on Jan 31 11:59 PM EST
 * getLocalMonth('2026-01-31T23:59:00-05:00') // '2026-01'
 * // NOT '2026-02' (which would happen with UTC grouping)
 */
export function getLocalMonth(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Checks if a date is in a specific month (using local timezone)
 * Prevents timezone bleeding in month filters
 * 
 * @param {string|Date} date - Date to check
 * @param {number} year - Target year
 * @param {number} month - Target month (1-12)
 * @returns {boolean} True if date is in the specified month
 */
export function isInLocalMonth(date, year, month) {
  const d = new Date(date)
  return d.getFullYear() === year && d.getMonth() + 1 === month
}
