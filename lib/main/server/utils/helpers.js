const { v4: uuidv4 } = require('uuid');
const { getStorageConnection } = require('../storageConnection');
let JWT_SECRET;

/**
 * Extracts attributes from the provided data object.
 * @param {Object} data - The data object containing attributes.
 * @returns {Object} The extracted attributes or an empty object.
 */
exports.extractAttributes = (data) => {
  if (data && data.data && data.data.attributes) {
    return data.data.attributes;
  } else {
    return {};
  }
};

/**
 * Validates if the provided URL matches Slack's webhook URL pattern.
 * @param {string} data - The URL to validate.
 * @returns {boolean} True if valid Slack URL, else false.
 */
exports.SlackUrl = (data) => {
  const urlRegex =
    /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return urlRegex.test(data);
};

/**
 * Adds a JWT secret to the storage if it doesn't exist.
 * @returns {Promise<string|boolean>} The JWT secret or false if not set.
 */
exports.addJWTSecret = async () => {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('jwtSecret');
    if (data && data.item && data.item.key === 'jwtSecret') {
      JWT_SECRET = data.item.value;
    } else {
      const newJwtSecret = uuidv4();
      const result = await storageConnection.setConfig(
        'jwtSecret',
        newJwtSecret
      );
      if (result && result.item && result.item.key === 'jwtSecret') {
        JWT_SECRET = result.item.value;
      }
    }
    return JWT_SECRET || false;
  } catch (err) {
    console.error('An error occurred in addJWTSecret:', err);
    throw err;
  }
};

/**
 * Retrieves the JWT secret.
 * @returns {string|boolean} The JWT secret or false if not set.
 */
exports.getJWTSecret = () => {
  if (JWT_SECRET) {
    return JWT_SECRET;
  } else {
    return false;
  }
};

/**
 * Escapes special characters in a string to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeString (str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively sanitizes an object or array by escaping all string values.
 * @param {*} data - The data to sanitize.
 * @returns {*} The sanitized data.
 */
function sanitizeData (data) {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object') {
    const sanitizedObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedObject;
  } else if (typeof data === 'string') {
    return escapeString(data);
  } else {
    // For numbers, booleans, null, undefined, etc.
    return data;
  }
}

// Export the sanitizeData function
exports.sanitizeData = sanitizeData;
