const formatters = require('../../src/utils/formatters.util');

// Formatters Utility Tests
describe('Formatters Utility', () => {

  // Date Formatting Tests
  describe('Date Formatting', () => {
    const date = new Date('2025-01-15T14:30:45');

    test('should format date with default pattern in Arabic', () => {
      const formatted = formatters.formatDate(date);
      expect(formatted).toContain('٢٠٢٥');
      expect(formatted).toBe('٢٠٢٥-٠١-١٥');
    });

    test('should format date with custom pattern', () => {
      const formatted = formatters.formatDate(date, 'DD/MM/YYYY');
      expect(formatted).toBe('١٥/٠١/٢٠٢٥');
    });

    test('should format date with Arabic month names', () => {
      const formatted = formatters.formatDate(date, 'DD MMMM YYYY', { arabicMonths: true });
      expect(formatted).toContain('يناير');
    });
    
    test('should format date with English numerals', () => {
      const formatted = formatters.formatDate(date, 'YYYY-MM-DD', { arabic: false });
      expect(formatted).toBe('2025-01-15');
    });
  });

  // Time Formatting Tests
  describe('Time Formatting', () => {
    const time = new Date('2025-01-15T14:30:45');

    test('should format time in 24-hour format (Arabic)', () => {
      const formatted = formatters.formatTime(time);
      expect(formatted).toBe('١٤:٣٠');
    });

    test('should format time with seconds', () => {
      const formatted = formatters.formatTime(time, { seconds: true });
      expect(formatted).toBe('١٤:٣٠:٤٥');
    });

    test('should format time in 12-hour format with AM/PM', () => {
      const formattedPM = formatters.formatTime(time, { ampm: true });
      expect(formattedPM).toContain('٠٢:٣٠ م');
      
      const timeAM = new Date('2025-01-15T09:30:45');
      const formattedAM = formatters.formatTime(timeAM, { ampm: true });
      expect(formattedAM).toContain('٠٩:٣٠ ص');
    });
  });

  // File Size Formatting Tests
  describe('File Size Formatting', () => {
    test('should format bytes correctly', () => {
      expect(formatters.formatFileSize(500)).toContain('بايت');
    });

    test('should format kilobytes correctly', () => {
      expect(formatters.formatFileSize(2048)).toContain('٢٫٠٠ كيلوبايت');
    });

    test('should format megabytes correctly', () => {
      expect(formatters.formatFileSize(5242880)).toContain('٥٫٠٠ ميجابايت');
    });
  });

  // Text Truncation Tests
  describe('Text Truncation', () => {
    const longText = 'هذا نص طويل جداً يحتاج إلى اختصار لكي يظهر بشكل مناسب في الواجهة';
    
    test('should truncate long text and add suffix', () => {
      const truncated = formatters.truncateText(longText, 20);
      expect(truncated.length).toBeLessThanOrEqual(23);
      expect(truncated).toContain('...');
    });

    test('should not truncate short text', () => {
      const shortText = 'نص قصير';
      const truncated = formatters.truncateText(shortText, 50);
      expect(truncated).toBe(shortText);
    });
  });

  // Currency Formatting Tests
  describe('Currency Formatting', () => {
    test('should format SAR currency correctly', () => {
      const formatted = formatters.formatCurrency(1250.50, 'SAR');
      expect(formatted).toContain('ريال');
      expect(formatted).toContain('١٬٢٥٠٫٥٠');
    });
    
    test('should format USD currency correctly', () => {
      const formatted = formatters.formatCurrency(99.99, 'USD');
      expect(formatted).toContain('$');
    });
  });

  // Relative Time Tests
  describe('Relative Time Formatting', () => {
    test('should format time as "الآن" for recent dates', () => {
      expect(formatters.formatRelativeTime(new Date())).toBe('الآن');
    });

    test('should format time in minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatters.formatRelativeTime(fiveMinutesAgo)).toContain('منذ ٥ دقيقة');
    });

    test('should format time in hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatters.formatRelativeTime(twoHoursAgo)).toContain('منذ ٢ ساعة');
    });
  });
});