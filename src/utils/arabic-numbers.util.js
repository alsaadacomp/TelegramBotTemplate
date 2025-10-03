/**
 * ===================================
 * Arabic Numerals Utility
 * ===================================
 * A utility for converting between Arabic (Indic) and English (ASCII) numerals.
 *
 * @module utils/arabic-numbers
 */

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ENGLISH_NUMERALS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts a string containing Arabic numerals to English numerals.
 * @param {string} input - The string to convert. Can be null or undefined.
 * @returns {string} The converted string, or an empty string if input is invalid.
 * @example
 * toEnglish('١٢٣٤٥'); // returns '12345'
 */
function toEnglish(input) {
  if (!input) {
    return '';
  }
  let result = String(input);
  for (let i = 0; i < ARABIC_NUMERALS.length; i++) {
    const regex = new RegExp(ARABIC_NUMERALS[i], 'g');
    result = result.replace(regex, ENGLISH_NUMERALS[i]);
  }
  return result;
}

/**
 * Converts a string containing English numerals to Arabic numerals.
 * @param {string | number} input - The string or number to convert. Can be null or undefined.
 * @returns {string} The converted string, or an empty string if input is invalid.
 * @example
 * toArabic('12345'); // returns '١٢٣٤٥'
 */
function toArabic(input) {
  if (input === null || input === undefined) {
    return '';
  }
  let result = String(input);
  for (let i = 0; i < ENGLISH_NUMERALS.length; i++) {
    const regex = new RegExp(ENGLISH_NUMERALS[i], 'g');
    result = result.replace(regex, ARABIC_NUMERALS[i]);
  }
  return result;
}

/**
 * Normalizes a string by converting all Arabic numerals to English numerals.
 * This is an alias for the toEnglish function.
 * @param {string} input - The string to normalize.
 * @returns {string} The normalized string.
 */
const normalize = toEnglish;

/**
 * Formats a number with thousands separator and decimal places
 * @param {number|string} number - Number to format
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @param {string} options.separator - Thousands separator (default: ',')
 * @param {string} options.decimalPoint - Decimal point (default: '.')
 * @param {boolean} options.arabic - Use Arabic numerals (default: true)
 * @returns {string} Formatted number
 * @example
 * formatNumber(1234567.89, { decimals: 2, arabic: true }); // '١٬٢٣٤٬٥٦٧٫٨٩'
 */
function formatNumber(number, options = {}) {
  const {
    decimals = 0,
    separator = '،', // Arabic comma
    decimalPoint = '٫', // Arabic decimal point
    arabic = true
  } = options;

  if (number === null || number === undefined || isNaN(number)) {
    return '';
  }

  // Convert to number if string
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  // Round to specified decimals
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;
  
  // Split into integer and decimal parts
  const parts = rounded.toFixed(decimals).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousands separator
  const withSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  // Combine parts
  let result = decimalPart ? `${withSeparator}${decimalPoint}${decimalPart}` : withSeparator;
  
  // Convert to Arabic if needed
  if (arabic) {
    result = toArabic(result);
  }
  
  return result;
}

// Aliases for compatibility
const normalizeArabicNumbers = toEnglish;
const toArabicNumbers = toArabic;
const convertToArabicNumbers = toArabic;
const convertToEnglishNumbers = toEnglish;

module.exports = {
  // Main functions
  toEnglish,
  toArabic,
  normalize,
  formatNumber,
  
  // Aliases for compatibility
  normalizeArabicNumbers,
  toArabicNumbers,
  convertToArabicNumbers,
  convertToEnglishNumbers,
  
  // Constants
  ARABIC_NUMERALS,
  ENGLISH_NUMERALS,
};
