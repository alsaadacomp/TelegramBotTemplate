/**
 * Validators Utility
 * 
 * Comprehensive validation functions for various data types
 * Supports Arabic and English inputs
 * 
 * @module utils/validators
 */

const logger = require('./logger.util');
const { normalizeArabicNumbers } = require('./arabic-numbers.util');

/**
 * Email validation regex pattern
 */
const EMAIL_PATTERN = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * URL validation regex pattern
 */
const URL_PATTERN = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/.*)?$/i;

/**
 * Arabic text pattern (includes spaces, Arabic numerals, English numerals, and punctuation)
 * FIXED: Changed \d to 0-9, escaped dot, added colon and hyphen
 */
const ARABIC_TEXT_PATTERN = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s0-9٠-٩،؛؟!\\.:\\-]+$/;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
  try {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const trimmed = email.trim();
    
    if (trimmed.length === 0 || trimmed.length > 254) {
      return false;
    }

    return EMAIL_PATTERN.test(trimmed);
  } catch (error) {
    logger.error('Error validating email', { error: error.message });
    return false;
  }
}

/**
 * Validate phone number (supports Arabic and English numerals)
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 10)
 * @param {number} options.maxLength - Maximum length (default: 15)
 * @returns {boolean} True if valid
 */
function validatePhone(phone, options = {}) {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const { minLength = 10, maxLength = 15 } = options;

    // Normalize Arabic numbers to English
    const normalized = normalizeArabicNumbers(phone);
    
    // Remove common separators
    const cleaned = normalized.replace(/[\s\-()]/g, '');
    
    // Check if only numbers and optional + prefix
    const phonePattern = /^\+?[0-9]+$/;
    if (!phonePattern.test(cleaned)) {
      return false;
    }

    // Remove + for length check
    const numbersOnly = cleaned.replace('+', '');
    
    if (numbersOnly.length < minLength || numbersOnly.length > maxLength) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating phone', { error: error.message });
    return false;
  }
}

/**
 * Validate Arabic text
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowNumbers - Allow numbers (default: true)
 * @param {boolean} options.allowPunctuation - Allow punctuation (default: true)
 * @returns {boolean} True if valid
 */
function validateArabicText(text, options = {}) {
  try {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const { allowNumbers = true, allowPunctuation = true } = options;

    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return false;
    }

    // Build pattern based on options
    let pattern;
    if (!allowNumbers && !allowPunctuation) {
      // Only Arabic letters and spaces
      pattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/;
    } else if (!allowNumbers && allowPunctuation) {
      // Arabic letters, spaces, and punctuation
      // FIXED: Escaped dot, added colon and hyphen
      pattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s،؛؟!\\.:\\-]+$/;
    } else if (allowNumbers && !allowPunctuation) {
      // Arabic letters, spaces, and numbers (both Arabic and English)
      // FIXED: Changed \d to 0-9 for explicit English numeral support
      pattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s0-9٠-٩]+$/;
    } else {
      // Everything (default)
      pattern = ARABIC_TEXT_PATTERN;
    }

    return pattern.test(trimmed);
  } catch (error) {
    logger.error('Error validating Arabic text', { error: error.message });
    return false;
  }
}

/**
 * Validate number
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {boolean} options.allowDecimal - Allow decimal numbers (default: true)
 * @param {boolean} options.allowNegative - Allow negative numbers (default: true)
 * @returns {boolean} True if valid
 */
function validateNumber(value, options = {}) {
  try {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const {
      min = -Infinity,
      max = Infinity,
      allowDecimal = true,
      allowNegative = true
    } = options;

    // Convert to string and normalize Arabic numbers
    const stringValue = String(value);
    const normalized = normalizeArabicNumbers(stringValue);

    // Parse as number
    const num = Number(normalized);

    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
      return false;
    }

    // Check decimal
    if (!allowDecimal && num % 1 !== 0) {
      return false;
    }

    // Check negative
    if (!allowNegative && num < 0) {
      return false;
    }

    // Check range
    if (num < min || num > max) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating number', { error: error.message });
    return false;
  }
}

/**
 * Validate date
 * @param {*} date - Date to validate (string, Date object, or timestamp)
 * @param {Object} options - Validation options
 * @param {Date|string} options.minDate - Minimum date
 * @param {Date|string} options.maxDate - Maximum date
 * @returns {boolean} True if valid
 */
function validateDate(date, options = {}) {
  try {
    if (!date) {
      return false;
    }

    const { minDate, maxDate } = options;

    let dateObj;

    // Parse date
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return false;
    }

    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return false;
    }

    // Check min date
    if (minDate) {
      const minDateObj = new Date(minDate);
      if (dateObj < minDateObj) {
        return false;
      }
    }

    // Check max date
    if (maxDate) {
      const maxDateObj = new Date(maxDate);
      if (dateObj > maxDateObj) {
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Error validating date', { error: error.message });
    return false;
  }
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.requireProtocol - Require http/https protocol (default: false)
 * @returns {boolean} True if valid
 */
function validateUrl(url, options = {}) {
  try {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const { requireProtocol = false } = options;

    const trimmed = url.trim();

    if (trimmed.length === 0) {
      return false;
    }

    // Check if URL has protocol when required
    if (requireProtocol && !trimmed.match(/^https?:\/\//)) {
      return false;
    }

    // Test URL pattern
    if (!URL_PATTERN.test(trimmed)) {
      return false;
    }

    // Try to create URL object (more robust check)
    try {
      const urlWithProtocol = trimmed.match(/^https?:\/\//)
        ? trimmed
        : `https://${trimmed}`;
      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    logger.error('Error validating URL', { error: error.message });
    return false;
  }
}

/**
 * Validate Telegram user ID
 * @param {*} id - User ID to validate
 * @returns {boolean} True if valid
 */
function validateTelegramId(id) {
  try {
    if (!id) {
      return false;
    }

    // Convert to number
    const numId = Number(id);

    // Telegram IDs are positive integers
    if (!Number.isInteger(numId) || numId <= 0) {
      return false;
    }

    // Telegram IDs are typically less than 10 digits
    if (String(numId).length > 12) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating Telegram ID', { error: error.message });
    return false;
  }
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum length (default: 0)
 * @param {number} options.max - Maximum length (default: Infinity)
 * @param {boolean} options.trim - Trim before checking (default: true)
 * @returns {boolean} True if valid
 */
function validateLength(text, options = {}) {
  try {
    if (text === null || text === undefined) {
      return false;
    }

    const { min = 0, max = Infinity, trim = true } = options;

    const stringValue = String(text);
    const value = trim ? stringValue.trim() : stringValue;
    const length = value.length;

    return length >= min && length <= max;
  } catch (error) {
    logger.error('Error validating length', { error: error.message });
    return false;
  }
}

/**
 * Validate pattern (regex)
 * @param {string} text - Text to validate
 * @param {RegExp|string} pattern - Pattern to match
 * @returns {boolean} True if matches pattern
 */
function validatePattern(text, pattern) {
  try {
    if (!text || typeof text !== 'string') {
      return false;
    }

    if (!pattern) {
      return false;
    }

    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return regex.test(text);
  } catch (error) {
    logger.error('Error validating pattern', { error: error.message });
    return false;
  }
}

/**
 * Validate required value (not null, undefined, or empty string)
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowZero - Allow zero as valid (default: true)
 * @param {boolean} options.allowEmptyString - Allow empty string (default: false)
 * @returns {boolean} True if value is present
 */
function validateRequired(value, options = {}) {
  try {
    const { allowZero = true, allowEmptyString = false } = options;

    // Check null/undefined
    if (value === null || value === undefined) {
      return false;
    }

    // Check zero
    if (value === 0 && !allowZero) {
      return false;
    }

    // Check empty string
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0 && !allowEmptyString) {
        return false;
      }
    }

    // Check empty array
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    // Check empty object
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating required', { error: error.message });
    return false;
  }
}

/**
 * Validate multiple values with multiple validators
 * @param {Object} data - Object with values to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with errors
 * 
 * @example
 * const result = validateMultiple(
 *   { email: 'test@example.com', phone: '0123456789' },
 *   {
 *     email: [{ validator: 'email', message: 'بريد إلكتروني غير صالح' }],
 *     phone: [{ validator: 'phone', message: 'رقم هاتف غير صالح' }]
 *   }
 * );
 */
function validateMultiple(data, rules) {
  const errors = {};
  let isValid = true;

  try {
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];

      for (const rule of fieldRules) {
        const { validator, message, options } = rule;

        let valid = false;

        switch (validator) {
          case 'required':
            valid = validateRequired(value, options);
            break;
          case 'email':
            valid = validateEmail(value);
            break;
          case 'phone':
            valid = validatePhone(value, options);
            break;
          case 'arabicText':
            valid = validateArabicText(value, options);
            break;
          case 'number':
            valid = validateNumber(value, options);
            break;
          case 'date':
            valid = validateDate(value, options);
            break;
          case 'url':
            valid = validateUrl(value, options);
            break;
          case 'length':
            valid = validateLength(value, options);
            break;
          case 'pattern':
            valid = validatePattern(value, options?.pattern);
            break;
          default:
            logger.warn(`Unknown validator: ${validator}`);
            continue;
        }

        if (!valid) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message || `حقل ${field} غير صالح`);
          isValid = false;
        }
      }
    }

    return {
      isValid,
      errors: isValid ? null : errors
    };
  } catch (error) {
    logger.error('Error in validateMultiple', { error: error.message });
    return {
      isValid: false,
      errors: { _general: ['حدث خطأ أثناء التحقق من البيانات'] }
    };
  }
}

module.exports = {
  validateEmail,
  validatePhone,
  validateArabicText,
  validateNumber,
  validateDate,
  validateUrl,
  validateTelegramId,
  validateLength,
  validatePattern,
  validateRequired,
  validateMultiple
};