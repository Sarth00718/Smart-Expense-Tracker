/**
 * Escapes special regex characters to prevent regex injection.
 */
export const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates that a value is an array containing only strings.
 */
export const isStringArray = (arr) => {
  return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
};

/**
 * Validates MongoDB ObjectId format.
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
