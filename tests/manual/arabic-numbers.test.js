/**
 * ===================================
 * Test Suite for Arabic Numerals Utility
 * ===================================
 * @test-suite utils/arabic-numbers
 */

// ✅ تم تصحيح المسار هنا
const { toEnglish, toArabic } = require('../../src/utils/arabic-numbers.util');

describe('Arabic Numerals Utility', () => {

  // --- اختبار دالة toEnglish ---
  describe('toEnglish', () => {
    test('should convert a string of Arabic numerals to English numerals', () => {
      expect(toEnglish('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    test('should convert a mixed string of Arabic numerals and text', () => {
      expect(toEnglish('رقم هاتفي هو ٠١٢٣٤٥')).toBe('رقم هاتفي هو 012345');
    });

    test('should return an empty string for null or undefined input', () => {
      expect(toEnglish(null)).toBe('');
      expect(toEnglish(undefined)).toBe('');
    });

    test('should handle strings with no Arabic numerals', () => {
      expect(toEnglish('Hello World 123')).toBe('Hello World 123');
    });

    test('should handle empty strings', () => {
      expect(toEnglish('')).toBe('');
    });
  });

  // --- اختبار دالة toArabic ---
  describe('toArabic', () => {
    test('should convert a string of English numerals to Arabic numerals', () => {
      expect(toArabic('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
    });

    test('should convert a mixed string of English numerals and text', () => {
      expect(toArabic('My phone number is 012345')).toBe('My phone number is ٠١٢٣٤٥');
    });
    
    test('should convert a number type input to Arabic numerals string', () => {
        expect(toArabic(1995)).toBe('١٩٩٥');
    });

    test('should return an empty string for null or undefined input', () => {
      expect(toArabic(null)).toBe('');
      expect(toArabic(undefined)).toBe('');
    });

    test('should handle strings with no English numerals', () => {
      expect(toArabic('أهلاً بالعالم')).toBe('أهلاً بالعالم');
    });

    test('should handle empty strings', () => {
      expect(toArabic('')).toBe('');
    });
  });
});