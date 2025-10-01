/**
 * Helpers Utility
 * 
 * Various helper functions for common operations
 * 
 * @module utils/helpers
 */

const crypto = require('crypto');
const logger = require('./logger.util');

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @param {Object} options - Generation options
 * @param {number} options.length - Length of random part (default: 8)
 * @param {boolean} options.timestamp - Include timestamp (default: true)
 * @returns {string} Unique ID
 */
function generateId(prefix = '', options = {}) {
  try {
    const { length = 8, timestamp = true } = options;

    let id = prefix ? `${prefix}_` : '';

    if (timestamp) {
      id += Date.now().toString(36) + '_';
    }

    // Generate random string
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    const randomString = randomBytes.toString('hex').slice(0, length);
    
    id += randomString;

    return id;
  } catch (error) {
    logger.error('Error generating ID', { error: error.message });
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Sleep/delay for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times with delay
 * @param {Function} fn - Function to retry (can be async)
 * @param {Object} options - Retry options
 * @param {number} options.times - Number of retry attempts (default: 3)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 * @param {Function} options.onRetry - Callback on retry (receives attempt number)
 * @param {boolean} options.exponentialBackoff - Use exponential backoff (default: false)
 * @returns {Promise} Result of function or throws last error
 */
async function retry(fn, options = {}) {
  const {
    times = 3,
    delay = 1000,
    onRetry = null,
    exponentialBackoff = false
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < times) {
        logger.warn(`Retry attempt ${attempt} failed`, {
          error: error.message,
          nextAttempt: attempt + 1
        });

        if (onRetry) {
          onRetry(attempt);
        }

        const currentDelay = exponentialBackoff
          ? delay * Math.pow(2, attempt - 1)
          : delay;

        await sleep(currentDelay);
      }
    }
  }

  logger.error('All retry attempts failed', {
    attempts: times,
    error: lastError.message
  });

  throw lastError;
}

/**
 * Sanitize input by removing/escaping potentially dangerous characters
 * @param {string} input - Input to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} options.allowHtml - Allow HTML tags (default: false)
 * @param {boolean} options.trim - Trim whitespace (default: true)
 * @param {number} options.maxLength - Maximum length (default: Infinity)
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, options = {}) {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const { allowHtml = false, trim = true, maxLength = Infinity } = options;

    let sanitized = input;

    // Trim whitespace
    if (trim) {
      sanitized = sanitized.trim();
    }

    // Remove HTML tags if not allowed
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Escape special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
    }

    return sanitized;
  } catch (error) {
    logger.error('Error sanitizing input', { error: error.message });
    return '';
  }
}

/**
 * Deep clone an object or array
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
  try {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item));
    }

    // Handle Object
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }

    return cloned;
  } catch (error) {
    logger.error('Error deep cloning object', { error: error.message });
    return obj;
  }
}

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  try {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error checking isEmpty', { error: error.message });
    return false;
  }
}

/**
 * Pick specified keys from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} New object with picked keys
 */
function pick(obj, keys) {
  try {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
      return {};
    }

    const result = {};

    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }

    return result;
  } catch (error) {
    logger.error('Error picking keys', { error: error.message });
    return {};
  }
}

/**
 * Omit specified keys from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
function omit(obj, keys) {
  try {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
      return obj;
    }

    const result = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !keys.includes(key)) {
        result[key] = obj[key];
      }
    }

    return result;
  } catch (error) {
    logger.error('Error omitting keys', { error: error.message });
    return obj;
  }
}

/**
 * Split array into chunks
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array>} Array of chunks
 */
function chunk(array, size) {
  try {
    if (!Array.isArray(array) || size <= 0) {
      return [];
    }

    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  } catch (error) {
    logger.error('Error chunking array', { error: error.message });
    return [array];
  }
}

/**
 * Shuffle array randomly
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (new array)
 */
function shuffle(array) {
  try {
    if (!Array.isArray(array)) {
      return [];
    }

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  } catch (error) {
    logger.error('Error shuffling array', { error: error.message });
    return array;
  }
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(fn, limit) {
  let inThrottle;

  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects to merge
 * @returns {Object} Merged object
 */
function deepMerge(target, ...sources) {
  try {
    if (!sources.length) {
      return target;
    }

    const source = sources.shift();

    if (typeof target === 'object' && typeof source === 'object') {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) {
              target[key] = Array.isArray(source[key]) ? [] : {};
            }
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    }

    return deepMerge(target, ...sources);
  } catch (error) {
    logger.error('Error deep merging objects', { error: error.message });
    return target;
  }
}

/**
 * Get nested property from object using dot notation
 * @param {Object} obj - Object to get from
 * @param {string} path - Path in dot notation (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Value at path or default value
 */
function getNestedProperty(obj, path, defaultValue = undefined) {
  try {
    if (!obj || typeof obj !== 'object' || !path) {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }

    return current;
  } catch (error) {
    logger.error('Error getting nested property', { error: error.message, path });
    return defaultValue;
  }
}

/**
 * Set nested property in object using dot notation
 * @param {Object} obj - Object to set in
 * @param {string} path - Path in dot notation (e.g., 'user.profile.name')
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
function setNestedProperty(obj, path, value) {
  try {
    if (!obj || typeof obj !== 'object' || !path) {
      return obj;
    }

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    return obj;
  } catch (error) {
    logger.error('Error setting nested property', { error: error.message, path });
    return obj;
  }
}

/**
 * Convert object to query string
 * @param {Object} obj - Object to convert
 * @param {Object} options - Conversion options
 * @param {boolean} options.encode - URL encode values (default: true)
 * @returns {string} Query string
 */
function objectToQueryString(obj, options = {}) {
  try {
    const { encode = true } = options;

    if (!obj || typeof obj !== 'object') {
      return '';
    }

    const params = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value !== null && value !== undefined) {
          const encodedKey = encode ? encodeURIComponent(key) : key;
          const encodedValue = encode ? encodeURIComponent(String(value)) : String(value);
          params.push(`${encodedKey}=${encodedValue}`);
        }
      }
    }

    return params.join('&');
  } catch (error) {
    logger.error('Error converting object to query string', { error: error.message });
    return '';
  }
}

/**
 * Convert query string to object
 * @param {string} queryString - Query string to parse
 * @param {Object} options - Parsing options
 * @param {boolean} options.decode - URL decode values (default: true)
 * @returns {Object} Parsed object
 */
function queryStringToObject(queryString, options = {}) {
  try {
    const { decode = true } = options;

    if (!queryString || typeof queryString !== 'string') {
      return {};
    }

    const cleanQuery = queryString.replace(/^\?/, '');
    const params = cleanQuery.split('&');
    const result = {};

    for (const param of params) {
      const [key, value] = param.split('=');
      
      if (key) {
        const decodedKey = decode ? decodeURIComponent(key) : key;
        const decodedValue = decode && value ? decodeURIComponent(value) : value || '';
        result[decodedKey] = decodedValue;
      }
    }

    return result;
  } catch (error) {
    logger.error('Error converting query string to object', { error: error.message });
    return {};
  }
}

/**
 * Generate random number in range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random number
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {Object} options - Generation options
 * @param {string} options.chars - Character set to use
 * @returns {string} Random string
 */
function randomString(length, options = {}) {
  const {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  } = options;

  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

module.exports = {
  generateId,
  sleep,
  retry,
  sanitizeInput,
  deepClone,
  isEmpty,
  pick,
  omit,
  chunk,
  shuffle,
  debounce,
  throttle,
  deepMerge,
  getNestedProperty,
  setNestedProperty,
  objectToQueryString,
  queryStringToObject,
  randomInRange,
  randomString
};