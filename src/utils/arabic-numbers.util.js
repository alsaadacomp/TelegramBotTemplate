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

module.exports = {
  toEnglish,
  toArabic,
  normalize,
  ARABIC_NUMERALS,
  ENGLISH_NUMERALS,
};
