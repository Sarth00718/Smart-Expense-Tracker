/**
 * Utility functions for security and data validation
 */

/**
 * Escapes special regex characters to prevent regex injection
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string safe for use in regex
 */
const escapeRegex = (string) => {
    if (typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates that an array contains only strings
 * @param {any} arr - The array to validate
 * @returns {boolean} - True if valid array of strings
 */
const isStringArray = (arr) => {
    return Array.isArray(arr) && arr.every(item => typeof item === 'string');
};

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export { 
    escapeRegex,
    isStringArray,
    isValidObjectId
 };
