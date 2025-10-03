const { normalizeArabicNumbers, convertToArabicNumbers, convertToEnglishNumbers } = require('../../../src/utils/arabic-numbers.util');

describe('Arabic Numbers Utility', () => {
  describe('normalizeArabicNumbers', () => {
    test('should convert Arabic numbers to English', () => {
      expect(normalizeArabicNumbers('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    test('should handle mixed Arabic and English numbers', () => {
      expect(normalizeArabicNumbers('٠١٢345٦٧٨٩')).toBe('0123456789');
    });

    test('should handle text with Arabic numbers', () => {
      expect(normalizeArabicNumbers('العمر: ٢٥ سنة')).toBe('العمر: 25 سنة');
    });

    test('should handle empty string', () => {
      expect(normalizeArabicNumbers('')).toBe('');
    });

    test('should handle string without numbers', () => {
      expect(normalizeArabicNumbers('مرحبا بك')).toBe('مرحبا بك');
    });

    test('should handle null input', () => {
      expect(normalizeArabicNumbers(null)).toBe('');
    });

    test('should handle undefined input', () => {
      expect(normalizeArabicNumbers(undefined)).toBe('');
    });
  });

  describe('convertToArabicNumbers', () => {
    test('should convert English numbers to Arabic', () => {
      expect(convertToArabicNumbers('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
    });

    test('should handle mixed English and Arabic numbers', () => {
      expect(convertToArabicNumbers('012345٦٧٨٩')).toBe('٠١٢٣٤٥٦٧٨٩');
    });

    test('should handle text with English numbers', () => {
      expect(convertToArabicNumbers('العمر: 25 سنة')).toBe('العمر: ٢٥ سنة');
    });

    test('should handle empty string', () => {
      expect(convertToArabicNumbers('')).toBe('');
    });

    test('should handle string without numbers', () => {
      expect(convertToArabicNumbers('مرحبا بك')).toBe('مرحبا بك');
    });
  });

  describe('convertToEnglishNumbers', () => {
    test('should convert Arabic numbers to English', () => {
      expect(convertToEnglishNumbers('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    test('should handle mixed Arabic and English numbers', () => {
      expect(convertToEnglishNumbers('٠١٢345٦٧٨٩')).toBe('0123456789');
    });

    test('should handle text with Arabic numbers', () => {
      expect(convertToEnglishNumbers('العمر: ٢٥ سنة')).toBe('العمر: 25 سنة');
    });

    test('should handle empty string', () => {
      expect(convertToEnglishNumbers('')).toBe('');
    });

    test('should handle string without numbers', () => {
      expect(convertToEnglishNumbers('مرحبا بك')).toBe('مرحبا بك');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long strings', () => {
      const longString = '٠'.repeat(1000);
      const result = normalizeArabicNumbers(longString);
      expect(result).toBe('0'.repeat(1000));
    });

    test('should handle special characters', () => {
      expect(normalizeArabicNumbers('٠١٢٣٤٥٦٧٨٩!@#$%^&*()')).toBe('0123456789!@#$%^&*()');
    });

    test('should handle whitespace', () => {
      expect(normalizeArabicNumbers(' ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ')).toBe(' 0 1 2 3 4 5 6 7 8 9 ');
    });

    test('should handle newlines and tabs', () => {
      expect(normalizeArabicNumbers('٠\n١\t٢\r٣')).toBe('0\n1\t2\r3');
    });
  });

  describe('Performance', () => {
    test('should handle large inputs efficiently', () => {
      const largeInput = '٠١٢٣٤٥٦٧٨٩'.repeat(1000);
      const start = Date.now();
      const result = normalizeArabicNumbers(largeInput);
      const duration = Date.now() - start;
      
      expect(result).toBe('0123456789'.repeat(1000));
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
