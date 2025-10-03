/**
 * Formatters Utility
 * * Comprehensive formatting functions for various data types
 * Supports Arabic and English outputs
 * * @module utils/formatters
 */

const logger = require('./logger.util');
const { toArabicNumbers, formatNumber: formatArabicNumber } = require('./arabic-numbers.util');

/**
 * Arabic month names
 */
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Arabic day names
 */
const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

/**
 * Format date
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale ('ar' or 'en')
 * @param {string} format - Format pattern (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date
 * * Format patterns:
 * - YYYY: Full year (2025)
 * - YY: Short year (25)
 * - MM: Month (01-12)
 * - DD: Day (01-31)
 * - HH: Hours (00-23)
 * - mm: Minutes (00-59)
 * - ss: Seconds (00-59)
 */
function formatDate(date, locale = 'ar', format = 'YYYY-MM-DD') {
  try {
    const arabic = locale === 'ar';
    const arabicMonths = locale === 'ar';

    if (!date) {
      return arabic ? 'تاريخ غير صالح' : 'Invalid date';
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date for formatting', { date });
      return arabic ? 'تاريخ غير صالح' : 'Invalid date';
    }

    let formatted = format;

    // Year
    const fullYear = dateObj.getFullYear();
    const shortYear = String(fullYear).slice(-2);
    formatted = formatted.replace('YYYY', String(fullYear));
    formatted = formatted.replace('YY', shortYear);

    // Month
    const month = dateObj.getMonth() + 1;
    const monthPadded = String(month).padStart(2, '0');
    
    if (arabicMonths && format.includes('MMMM')) {
      formatted = formatted.replace('MMMM', ARABIC_MONTHS[month - 1]);
    } else {
      formatted = formatted.replace('MM', monthPadded);
      formatted = formatted.replace('M', String(month));
    }

    // Day
    const day = dateObj.getDate();
    const dayPadded = String(day).padStart(2, '0');
    formatted = formatted.replace('DD', dayPadded);
    formatted = formatted.replace('D', String(day));

    // Day name
    if (format.includes('dddd')) {
      const dayName = ARABIC_DAYS[dateObj.getDay()];
      formatted = formatted.replace('dddd', dayName);
    }

    // Hours
    const hours = dateObj.getHours();
    const hoursPadded = String(hours).padStart(2, '0');
    formatted = formatted.replace('HH', hoursPadded);
    formatted = formatted.replace('H', String(hours));

    // Minutes
    const minutes = dateObj.getMinutes();
    const minutesPadded = String(minutes).padStart(2, '0');
    formatted = formatted.replace('mm', minutesPadded);

    // Seconds
    const seconds = dateObj.getSeconds();
    const secondsPadded = String(seconds).padStart(2, '0');
    formatted = formatted.replace('ss', secondsPadded);

    // Convert to Arabic numerals if requested
    if (arabic) {
      formatted = toArabicNumbers(formatted);
    }

    return formatted;
  } catch (error) {
    logger.error('Error formatting date', { error: error.message, date });
    return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
  }
}

/**
 * Format time
 * @param {Date|string|number} time - Time to format
 * @param {string} locale - Locale ('ar' or 'en')
 * @param {string} format - Format ('12' or '24')
 * @returns {string} Formatted time
 */
function formatTime(time, locale = 'ar', format = '24') {
  try {
    const arabic = locale === 'ar';
    const ampm = format === '12';

    if (!time) {
      return arabic ? 'وقت غير صالح' : 'Invalid time';
    }

    const dateObj = new Date(time);

    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid time for formatting', { time });
      return arabic ? 'وقت غير صالح' : 'Invalid time';
    }

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const secs = dateObj.getSeconds();

    let formatted = '';
    let period = '';

    if (ampm) {
      period = hours >= 12 ? ' م' : ' ص'; // م = PM, ص = AM
      hours = hours % 12 || 12;
    }

    const hoursPadded = String(hours).padStart(2, '0');
    const minutesPadded = String(minutes).padStart(2, '0');

    formatted = `${hoursPadded}:${minutesPadded}`;

    formatted += period;

    if (arabic) {
      formatted = toArabicNumbers(formatted);
    }

    return formatted;
  } catch (error) {
    logger.error('Error formatting time', { error: error.message, time });
    return locale === 'ar' ? 'وقت غير صالح' : 'Invalid time';
  }
}

/**
 * Format date and time together
 * @param {Date|string|number} datetime - DateTime to format
 * @param {Object} options - Formatting options
 * @param {string} options.dateFormat - Date format (default: 'YYYY-MM-DD')
 * @param {boolean} options.arabic - Use Arabic numerals (default: true)
 * @param {boolean} options.arabicMonths - Use Arabic month names (default: false)
 * @param {boolean} options.includeTime - Include time (default: true)
 * @param {boolean} options.seconds - Include seconds (default: false)
 * @returns {string} Formatted datetime
 */
function formatDateTime(datetime, options = {}) {
  try {
    const {
      dateFormat = 'YYYY-MM-DD',
      arabic = true,
      arabicMonths = false,
      includeTime = true,
      seconds = false
    } = options;

    if (!datetime) {
      return '';
    }

    const dateObj = new Date(datetime);

    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid datetime for formatting', { datetime });
      return '';
    }

    const datePart = formatDate(dateObj, dateFormat, { arabic, arabicMonths });

    if (!includeTime) {
      return datePart;
    }

    const timePart = formatTime(dateObj, { arabic, seconds });

    return `${datePart} ${timePart}`;
  } catch (error) {
    logger.error('Error formatting datetime', { error: error.message, datetime });
    return '';
  }
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {Object} options - Formatting options
 * @param {boolean} options.arabic - Use Arabic numerals (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
function formatFileSize(bytes, options = {}) {
  try {
    const { arabic = true, decimals = 2 } = options;

    if (bytes === null || bytes === undefined || isNaN(bytes)) {
      return '';
    }

    const numBytes = Number(bytes);

    if (numBytes === 0) {
      return arabic ? '٠ بايت' : '0 B';
    }

    const units = arabic ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'] : ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    
    // Convert to fixed decimal string, then replace decimal point if needed
    let value = (numBytes / Math.pow(k, i)).toFixed(decimals);
    if (arabic) {
        value = value.replace('.', '٫'); // Arabic decimal separator
        value = toArabicNumbers(value);
    }

    return `${value} ${units[i]}`;
  } catch (error) {
    logger.error('Error formatting file size', { error: error.message, bytes });
    return '';
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, length = 50, suffix = '...') {
  try {
    if (!text || typeof text !== 'string') {
      return '';
    }

    if (text.length <= length) {
      return text;
    }

    let truncated = text.slice(0, length);

    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }

    return truncated + suffix;
  } catch (error) {
    logger.error('Error truncating text', { error: error.message, text });
    return text;
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'SAR')
 * @param {string} locale - Locale ('ar' or 'en')
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = 'SAR', locale = 'ar') {
  try {
    const arabic = locale === 'ar';
    const decimals = 2;

    if (amount === null || amount === undefined || isNaN(amount)) {
      return '';
    }

    const numAmount = Number(amount);

    // Format with thousand separators
    let formatted = numAmount.toFixed(decimals);
    if (arabic) {
      formatted = toArabicNumbers(formatted);
      formatted = formatted.replace('.', '٫'); // Arabic decimal separator
    }

    const currencySymbols = {
      SAR: 'ريال',
      USD: '$',
      EUR: '€',
      EGP: 'جنيه',
      AED: 'درهم',
      KWD: 'دينار'
    };

    const currencySymbol = currencySymbols[currency] || currency;

    return `${formatted} ${currencySymbol}`;
  } catch (error) {
    logger.error('Error formatting currency', { error: error.message, amount });
    return '';
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format (0-100 or 0-1)
 * @param {Object} options - Formatting options
 * @param {boolean} options.arabic - Use Arabic numerals (default: true)
 * @param {number} options.decimals - Decimal places (default: 1)
 * @param {boolean} options.normalized - Value is 0-1 instead of 0-100 (default: false)
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, options = {}) {
  try {
    const { arabic = true, decimals = 1, normalized = false } = options;

    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    let numValue = Number(value);

    if (normalized) {
      numValue *= 100;
    }

    const fixed = numValue.toFixed(decimals);
    const formatted = arabic ? toArabicNumbers(fixed) : fixed;

    return `${formatted}٪`;
  } catch (error) {
    logger.error('Error formatting percentage', { error: error.message, value });
    return '';
  }
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.arabic - Use Arabic numerals (default: true)
 * @param {string} options.format - Format pattern (default: 'XXX-XXX-XXXX')
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone, options = {}) {
  try {
    const { arabic = true, format = 'XXX-XXX-XXXX' } = options;

    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 0) {
      return '';
    }

    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < cleaned.length; i++) {
      if (format[i] === 'X') {
        formatted += cleaned[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }

    // Add remaining digits
    if (digitIndex < cleaned.length) {
      formatted += cleaned.slice(digitIndex);
    }

    if (arabic) {
      formatted = toArabicNumbers(formatted);
    }

    return formatted;
  } catch (error) {
    logger.error('Error formatting phone number', { error: error.message, phone });
    return phone;
  }
}

/**
 * Capitalize first letter of text
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
function capitalizeFirst(text) {
  try {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch (error) {
    logger.error('Error capitalizing text', { error: error.message, text });
    return text;
  }
}

/**
 * Convert text to slug (URL-friendly)
 * @param {string} text - Text to convert
 * @param {Object} options - Slug options
 * @param {string} options.separator - Separator character (default: '-')
 * @param {boolean} options.lowercase - Convert to lowercase (default: true)
 * @returns {string} Slug
 */
function slugify(text, options = {}) {
  try {
    const { separator = '-', lowercase = true } = options;

    if (!text || typeof text !== 'string') {
      return '';
    }

    let slug = text;

    // Convert to lowercase
    if (lowercase) {
      slug = slug.toLowerCase();
    }

    // Replace spaces with separator
    slug = slug.replace(/\s+/g, separator);

    // Remove invalid characters
    slug = slug.replace(/[^\w\u0600-\u06FF-]/g, '');

    // Replace multiple separators with single
    const separatorPattern = new RegExp(`${separator}+`, 'g');
    slug = slug.replace(separatorPattern, separator);

    // Trim separators from start and end
    slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

    return slug;
  } catch (error) {
    logger.error('Error creating slug', { error: error.message, text });
    return '';
  }
}

/**
 * Format relative time (e.g., "منذ 5 دقائق")
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.arabic - Use Arabic text (default: true)
 * @returns {string} Relative time string
 */
function formatRelativeTime(date, options = {}) {
  try {
    const { arabic = true } = options;

    if (!date) {
      return '';
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return arabic ? 'الآن' : 'now';
    } else if (diffMins < 60) {
      const num = arabic ? toArabicNumbers(String(diffMins)) : diffMins;
      return arabic ? `منذ ${num} دقيقة` : `${num} minutes ago`;
    } else if (diffHours < 24) {
      const num = arabic ? toArabicNumbers(String(diffHours)) : diffHours;
      return arabic ? `منذ ${num} ساعة` : `${num} hours ago`;
    } else if (diffDays < 30) {
      const num = arabic ? toArabicNumbers(String(diffDays)) : diffDays;
      return arabic ? `منذ ${num} يوم` : `${num} days ago`;
    } else {
      return formatDate(dateObj, 'YYYY-MM-DD', { arabic });
    }
  } catch (error) {
    logger.error('Error formatting relative time', { error: error.message, date });
    return '';
  }
}

/**
 * Pluralize words based on count
 * @param {number} count - Count to check
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form
 * @param {string} locale - Locale ('ar' or 'en')
 * @returns {string} Pluralized word
 */
function pluralize(count, singular, plural, locale = 'ar') {
  try {
    if (count === 1) {
      return singular;
    }
    return plural;
  } catch (error) {
    logger.error('Error pluralizing word', { error: error.message, count, singular, plural });
    return plural;
  }
}

module.exports = {
  formatDate,
  formatTime,
  formatDateTime,
  formatFileSize,
  truncateText,
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,
  capitalizeFirst,
  slugify,
  formatRelativeTime,
  pluralize
};