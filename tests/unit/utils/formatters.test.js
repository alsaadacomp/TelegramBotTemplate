/**
 * Unit Tests for Formatters Utility
 * Tests all formatting functions with various scenarios
 */

const formatters = require('../../../src/utils/formatters.util');

describe('Formatters Utility', () => {
  
  // ========== Date Formatting ==========
  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T10:30:00');

    test('should format date with default pattern', () => {
      const result = formatters.formatDate(testDate, 'YYYY-MM-DD', { arabic: false });
      expect(result).toBe('2024-03-15');
    });

    test('should format date with Arabic numerals', () => {
      const result = formatters.formatDate(testDate, 'YYYY-MM-DD', { arabic: true });
      expect(result).toContain('٢٠٢٤');
    });

    test('should format date with Arabic month names', () => {
      const result = formatters.formatDate(testDate, 'DD MMMM YYYY', { arabicMonths: true, arabic: false });
      expect(result).toContain('مارس');
    });

    test('should format date with day name', () => {
      const result = formatters.formatDate(testDate, 'dddd DD-MM-YYYY', { arabic: false });
      expect(result).toContain('الجمعة');
    });

    test('should handle invalid date', () => {
      const result = formatters.formatDate('invalid-date');
      expect(result).toBe('');
    });

    test('should handle null date', () => {
      const result = formatters.formatDate(null);
      expect(result).toBe('');
    });
  });

  // ========== Time Formatting ==========
  describe('formatTime', () => {
    const testTime = new Date('2024-03-15T14:30:45');

    test('should format time without seconds', () => {
      const result = formatters.formatTime(testTime, { arabic: false, seconds: false });
      expect(result).toBe('14:30');
    });

    test('should format time with seconds', () => {
      const result = formatters.formatTime(testTime, { arabic: false, seconds: true });
      expect(result).toBe('14:30:45');
    });

    test('should format time with Arabic numerals', () => {
      const result = formatters.formatTime(testTime, { arabic: true, seconds: false });
      expect(result).toContain('١٤');
    });

    test('should format time with AM/PM', () => {
      const result = formatters.formatTime(testTime, { arabic: false, ampm: true });
      expect(result).toContain('م');
    });

    test('should handle invalid time', () => {
      const result = formatters.formatTime('invalid-time');
      expect(result).toBe('');
    });
  });

  // ========== DateTime Formatting ==========
  describe('formatDateTime', () => {
    const testDateTime = new Date('2024-03-15T14:30:00');

    test('should format datetime with date and time', () => {
      const result = formatters.formatDateTime(testDateTime, { arabic: false });
      expect(result).toContain('2024-03-15');
      expect(result).toContain('14:30');
    });

    test('should format datetime without time', () => {
      const result = formatters.formatDateTime(testDateTime, { includeTime: false, arabic: false });
      expect(result).toBe('2024-03-15');
    });

    test('should format datetime with seconds', () => {
      const result = formatters.formatDateTime(testDateTime, { seconds: true, arabic: false });
      expect(result).toContain('14:30:00');
    });
  });

  // ========== File Size Formatting ==========
  describe('formatFileSize', () => {
    test('should format bytes', () => {
      const result = formatters.formatFileSize(500, { arabic: false });
      expect(result).toBe('500.00 بايت');
    });

    test('should format kilobytes', () => {
      const result = formatters.formatFileSize(1024 * 5, { arabic: false });
      expect(result).toContain('5.00 كيلوبايت');
    });

    test('should format megabytes', () => {
      const result = formatters.formatFileSize(1024 * 1024 * 10, { arabic: false });
      expect(result).toContain('10.00 ميجابايت');
    });

    test('should format gigabytes', () => {
      const result = formatters.formatFileSize(1024 * 1024 * 1024 * 2, { arabic: false });
      expect(result).toContain('2.00 جيجابايت');
    });

    test('should handle zero bytes', () => {
      const result = formatters.formatFileSize(0, { arabic: false });
      expect(result).toBe('0 بايت');
    });

    test('should use Arabic numerals when requested', () => {
      const result = formatters.formatFileSize(1024, { arabic: true });
      expect(result).toContain('١');
    });

    test('should handle invalid input', () => {
      const result = formatters.formatFileSize(null);
      expect(result).toBe('');
    });
  });

  // ========== Text Truncation ==========
  describe('truncateText', () => {
    test('should truncate long text', () => {
      const text = 'هذا نص طويل جداً يحتاج إلى قص';
      const result = formatters.truncateText(text, 15);
      expect(result.length).toBeLessThanOrEqual(18); // 15 + '...'
      expect(result).toContain('...');
    });

    test('should not truncate short text', () => {
      const text = 'نص قصير';
      const result = formatters.truncateText(text, 50);
      expect(result).toBe(text);
    });

    test('should respect word boundaries', () => {
      const text = 'كلمة أولى كلمة ثانية كلمة ثالثة';
      const result = formatters.truncateText(text, 20, { breakWord: false });
      expect(result).not.toContain('ثالث...');
    });

    test('should allow breaking words', () => {
      const text = 'كلمةطويلةجداً';
      const result = formatters.truncateText(text, 8, { breakWord: true });
      expect(result).toBe('كلمةطويل...');
    });

    test('should use custom suffix', () => {
      const text = 'نص طويل جداً';
      const result = formatters.truncateText(text, 5, { suffix: '…' });
      expect(result).toContain('…');
    });
  });

  // ========== Currency Formatting ==========
  describe('formatCurrency', () => {
    test('should format EGP currency', () => {
      const result = formatters.formatCurrency(1000, 'EGP', { arabic: false });
      expect(result).toContain('جنيه');
    });

    test('should format USD currency', () => {
      const result = formatters.formatCurrency(1000, 'USD', { arabic: false });
      expect(result).toContain('$');
    });

    test('should format SAR currency', () => {
      const result = formatters.formatCurrency(1000, 'SAR', { arabic: false });
      expect(result).toContain('ريال');
    });

    test('should format without symbol', () => {
      const result = formatters.formatCurrency(1000, 'EGP', { symbol: false, arabic: false });
      expect(result).not.toContain('جنيه');
    });

    test('should handle decimals', () => {
      const result = formatters.formatCurrency(1234.56, 'EGP', { arabic: false, decimals: 2 });
      expect(result).toContain('1،234٫56');
    });

    test('should use Arabic numerals', () => {
      const result = formatters.formatCurrency(1000, 'EGP', { arabic: true });
      expect(result).toContain('١');
    });

    test('should handle invalid amount', () => {
      const result = formatters.formatCurrency(null);
      expect(result).toBe('');
    });
  });

  // ========== Percentage Formatting ==========
  describe('formatPercentage', () => {
    test('should format percentage', () => {
      const result = formatters.formatPercentage(75.5, { arabic: false });
      expect(result).toBe('75.5٪');
    });

    test('should format normalized percentage', () => {
      const result = formatters.formatPercentage(0.755, { arabic: false, normalized: true });
      expect(result).toBe('75.5٪');
    });

    test('should use Arabic numerals', () => {
      const result = formatters.formatPercentage(50, { arabic: true });
      expect(result).toContain('٥٠');
    });

    test('should handle decimal places', () => {
      const result = formatters.formatPercentage(75.123, { arabic: false, decimals: 2 });
      expect(result).toBe('75.12٪');
    });

    test('should handle invalid value', () => {
      const result = formatters.formatPercentage(null);
      expect(result).toBe('');
    });
  });

  // ========== Phone Number Formatting ==========
  describe('formatPhoneNumber', () => {
    test('should format phone with default pattern', () => {
      const result = formatters.formatPhoneNumber('1234567890', { arabic: false });
      expect(result).toBe('123-456-7890');
    });

    test('should format phone with custom pattern', () => {
      const result = formatters.formatPhoneNumber('01234567890', { 
        format: 'XXXXX-XXX-XXX',
        arabic: false 
      });
      expect(result).toBe('01234-567-890');
    });

    test('should use Arabic numerals', () => {
      const result = formatters.formatPhoneNumber('1234567890', { arabic: true });
      expect(result).toContain('١');
    });

    test('should handle invalid phone', () => {
      const result = formatters.formatPhoneNumber('');
      expect(result).toBe('');
    });
  });

  // ========== Text Capitalization ==========
  describe('capitalizeFirst', () => {
    test('should capitalize first letter', () => {
      const result = formatters.capitalizeFirst('hello');
      expect(result).toBe('Hello');
    });

    test('should handle already capitalized text', () => {
      const result = formatters.capitalizeFirst('Hello');
      expect(result).toBe('Hello');
    });

    test('should handle empty string', () => {
      const result = formatters.capitalizeFirst('');
      expect(result).toBe('');
    });

    test('should handle null', () => {
      const result = formatters.capitalizeFirst(null);
      expect(result).toBe('');
    });
  });

  // ========== Slugify ==========
  describe('slugify', () => {
    test('should create slug from Arabic text', () => {
      const result = formatters.slugify('مرحبا بك في العالم');
      expect(result).toBe('مرحبا-بك-في-العالم');
    });

    test('should create slug from English text', () => {
      const result = formatters.slugify('Hello World');
      expect(result).toBe('hello-world');
    });

    test('should use custom separator', () => {
      const result = formatters.slugify('Hello World', { separator: '_' });
      expect(result).toBe('hello_world');
    });

    test('should not lowercase when option is false', () => {
      const result = formatters.slugify('Hello World', { lowercase: false });
      expect(result).toBe('Hello-World');
    });

    test('should handle empty string', () => {
      const result = formatters.slugify('');
      expect(result).toBe('');
    });
  });

  // ========== Relative Time Formatting ==========
  describe('formatRelativeTime', () => {
    test('should show "now" for recent dates', () => {
      const now = new Date();
      const result = formatters.formatRelativeTime(now, { arabic: true });
      expect(result).toBe('الآن');
    });

    test('should show minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatters.formatRelativeTime(fiveMinutesAgo, { arabic: true });
      expect(result).toContain('دقيقة');
    });

    test('should show hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatters.formatRelativeTime(threeHoursAgo, { arabic: true });
      expect(result).toContain('ساعة');
    });

    test('should show days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = formatters.formatRelativeTime(twoDaysAgo, { arabic: true });
      expect(result).toContain('يوم');
    });

    test('should show formatted date for old dates', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = formatters.formatRelativeTime(twoMonthsAgo, { arabic: false });
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('should handle invalid date', () => {
      const result = formatters.formatRelativeTime('invalid');
      expect(result).toBe('');
    });
  });
});
