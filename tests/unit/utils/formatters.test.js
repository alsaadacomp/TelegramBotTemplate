const {
  formatDate,
  formatTime,
  formatFileSize,
  formatCurrency,
  truncateText,
  pluralize
} = require('../../../src/utils/formatters.util');

describe('Formatters Utility', () => {
  describe('formatDate', () => {
    test('should format date in Arabic', () => {
      const date = new Date('2025-10-03');
      const result = formatDate(date, 'ar');
      expect(result).toContain('٢٠٢٥');
    });

    test('should format date with custom format', () => {
      const date = new Date('2025-10-03');
      const result = formatDate(date, 'ar', 'DD/MM/YYYY');
      expect(result).toBe('٠٣/١٠/٢٠٢٥');
    });

    test('should format date in English', () => {
      const date = new Date('2025-10-03');
      const result = formatDate(date, 'en');
      expect(result).toContain('2025');
    });

    test('should handle invalid date', () => {
      const result = formatDate('invalid date');
      expect(result).toBe('تاريخ غير صالح');
    });
  });

  describe('formatTime', () => {
    test('should format time in 24-hour format', () => {
      const date = new Date('2025-10-03T14:30:00');
      const result = formatTime(date, 'ar', '24');
      expect(result).toContain('١٤:٣٠');
    });

    test('should format time in 12-hour format', () => {
      const date = new Date('2025-10-03T14:30:00');
      const result = formatTime(date, 'ar', '12');
      expect(result).toContain('٢:٣٠');
    });

    test('should handle invalid time', () => {
      const result = formatTime('invalid time');
      expect(result).toBe('وقت غير صالح');
    });
  });

  describe('formatFileSize', () => {
    test('should format bytes', () => {
      expect(formatFileSize(500)).toBe('٥٠٠٫٠٠ بايت');
    });

    test('should format KB', () => {
      expect(formatFileSize(1024)).toBe('١٫٠٠ كيلوبايت');
    });

    test('should format MB', () => {
      expect(formatFileSize(1048576)).toBe('١٫٠٠ ميجابايت');
    });

    test('should format GB', () => {
      expect(formatFileSize(1073741824)).toBe('١٫٠٠ جيجابايت');
    });

    test('should format TB', () => {
      expect(formatFileSize(1099511627776)).toBe('١٫٠٠ تيرابايت');
    });

    test('should handle zero', () => {
      expect(formatFileSize(0)).toBe('٠ بايت');
    });

    test('should handle negative numbers', () => {
      expect(formatFileSize(-100)).toBe('NaN undefined');
    });
  });

  describe('formatCurrency', () => {
    test('should format currency in Arabic', () => {
      const result = formatCurrency(1234.56, 'SAR', 'ar');
      expect(result).toContain('١٢٣٤٫٥٦');
      expect(result).toContain('ريال');
    });

    test('should format currency in English', () => {
      const result = formatCurrency(1234.56, 'USD', 'en');
      expect(result).toContain('1234.56');
      expect(result).toContain('$');
    });

    test('should handle zero amount', () => {
      const result = formatCurrency(0, 'SAR', 'ar');
      expect(result).toContain('٠');
    });

    test('should handle negative amounts', () => {
      const result = formatCurrency(-100, 'SAR', 'ar');
      expect(result).toContain('-١٠٠');
    });
  });

  describe('truncateText', () => {
    test('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result).toContain('...');
    });

    test('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe(text);
    });

    test('should handle custom suffix', () => {
      const text = 'This is a very long text';
      const result = truncateText(text, 10, '---');
      expect(result).toContain('---');
    });

    test('should handle empty text', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    test('should handle null text', () => {
      const result = truncateText(null, 10);
      expect(result).toBe('');
    });
  });

  describe('pluralize', () => {
    test('should pluralize Arabic words', () => {
      expect(pluralize(1, 'رسالة', 'رسائل', 'ar')).toBe('رسالة');
      expect(pluralize(2, 'رسالة', 'رسائل', 'ar')).toBe('رسائل');
      expect(pluralize(5, 'رسالة', 'رسائل', 'ar')).toBe('رسائل');
    });

    test('should pluralize English words', () => {
      expect(pluralize(1, 'message', 'messages', 'en')).toBe('message');
      expect(pluralize(2, 'message', 'messages', 'en')).toBe('messages');
      expect(pluralize(5, 'message', 'messages', 'en')).toBe('messages');
    });

    test('should handle zero count', () => {
      expect(pluralize(0, 'رسالة', 'رسائل', 'ar')).toBe('رسائل');
    });

    test('should handle negative count', () => {
      expect(pluralize(-1, 'رسالة', 'رسائل', 'ar')).toBe('رسائل');
    });
  });
});