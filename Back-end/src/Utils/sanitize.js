/**
 * Sanitization Utility for Lightstorm Backend
 * Provides functions to escape special regex characters and sanitize user input
 */

/**
 * Escape special regex characters to prevent ReDoS and regex injection attacks
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string safe for use in RegExp
 */
const escapeRegex = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  // Escape special regex characters: \ ^ $ . * + ? ( ) [ ] { } |
  return str.replace(/[\^$.*+?()[\]{}|]/g, '\\$&');
};

/**
 * Sanitize a string by trimming whitespace and removing dangerous characters
 * @param {string} str - The string to sanitize
 * @param {Object} options - Sanitization options
 * @param {number} options.maxLength - Maximum allowed length
 * @param {boolean} options.escapeHtml - Whether to escape HTML entities
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str, options = {}) => {
  if (typeof str !== 'string') {
    return '';
  }

  let sanitized = str.trim();

  // Apply max length if specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Escape HTML entities if requested
  if (options.escapeHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  return sanitized;
};

/**
 * Validate and pick only allowed fields from an object
 * Prevents mass assignment attacks by whitelisting fields
 * @param {Object} obj - The source object
 * @param {string[]} allowedFields - Array of allowed field names
 * @returns {Object} - Object containing only allowed fields
 */
const pickAllowedFields = (obj, allowedFields) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const result = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      result[field] = obj[field];
    }
  }
  return result;
};

/**
 * Sanitize MongoDB query operators from object
 * Prevents NoSQL injection by removing keys starting with $ or containing dots
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeMongoQuery = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip keys starting with $ (MongoDB operators) and keys with dots
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    // Recursively sanitize nested objects and arrays
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.map(sanitizeMongoQuery);
      } else {
        result[key] = sanitizeMongoQuery(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
};

module.exports = {
  escapeRegex,
  sanitizeString,
  pickAllowedFields,
  sanitizeMongoQuery
};
