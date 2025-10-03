/**
 * Unit Tests for Validators Utility
 * Tests all validation functions with various scenarios
 */

const validators = require('../../../src/utils/validators.util');

describe('Validators Utility', () => {
  
  // ========== Email Validation ==========
  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(validators.validateEmail('test@example.com')).toBe(true);
      expect(validators.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validators.validateEmail('user+tag@example.com')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(validators.validateEmail('invalid-email')).toBe(false);
      expect(validators.validateEmail('@example.com')).toBe(false);
      expect(validators.validateEmail('user@')).toBe(false);
      expect(validators.validateEmail('')).toBe(false);
    });

    test('should handle null/undefined', () => {
      expect(validators.validateEmail(null)).toBe(false);
      expect(validators.validateEmail(undefined)).toBe(false);
    });
  });

  // ========== Phone Validation ==========
  describe('validatePhone', () => {
    test('should validate Egyptian phone numbers', () => {
      expect(validators.validatePhone('01234567890')).toBe(true);
      expect(validators.validatePhone('+201234567890')).toBe(true);
    });

    test('should validate Arabic numerals', () => {
      expect(validators.validatePhone('٠١٢٣٤٥٦٧٨٩٠')).toBe(true);
    });

    test('should validate international formats', () => {
      expect(validators.validatePhone('+966501234567')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(validators.validatePhone('123')).toBe(false);
      expect(validators.validatePhone('abc123')).toBe(false);
      expect(validators.validatePhone('')).toBe(false);
    });

    test('should respect min/max length options', () => {
      expect(validators.validatePhone('12345', { minLength: 3, maxLength: 5 })).toBe(true);
      expect(validators.validatePhone('12', { minLength: 3 })).toBe(false);
    });
  });

  // ========== Arabic Text Validation ==========
  describe('validateArabicText', () => {
    test('should validate pure Arabic text', () => {
      expect(validators.validateArabicText('مرحبا بك')).toBe(true);
      expect(validators.validateArabicText('النص العربي')).toBe(true);
    });

    test('should validate Arabic with numbers', () => {
      expect(validators.validateArabicText('العنوان رقم ١٢٣')).toBe(true);
      expect(validators.validateArabicText('الشارع 456')).toBe(true);
    });

    test('should validate Arabic with punctuation', () => {
      expect(validators.validateArabicText('مرحبا، كيف حالك؟')).toBe(true);
      expect(validators.validateArabicText('العنوان: شارع النيل')).toBe(true);
    });

    test('should reject English text', () => {
      expect(validators.validateArabicText('Hello World')).toBe(false);
    });

    test('should respect allowNumbers option', () => {
      expect(validators.validateArabicText('النص ١٢٣', { allowNumbers: false })).toBe(false);
    });
  });

  // ========== Number Validation ==========
  describe('validateNumber', () => {
    test('should validate integer numbers', () => {
      expect(validators.validateNumber(123)).toBe(true);
      expect(validators.validateNumber('456')).toBe(true);
    });

    test('should validate decimal numbers', () => {
      expect(validators.validateNumber(12.5)).toBe(true);
      expect(validators.validateNumber('45.67')).toBe(true);
    });

    test('should validate Arabic numerals', () => {
      expect(validators.validateNumber('٧٨٩')).toBe(true);
    });

    test('should validate negative numbers', () => {
      expect(validators.validateNumber(-50)).toBe(true);
    });

    test('should reject invalid numbers', () => {
      expect(validators.validateNumber('abc')).toBe(false);
      expect(validators.validateNumber(null)).toBe(false);
    });

    test('should validate number range', () => {
      expect(validators.validateNumber(50, { min: 10, max: 100 })).toBe(true);
      expect(validators.validateNumber(5, { min: 10, max: 100 })).toBe(false);
      expect(validators.validateNumber(150, { min: 10, max: 100 })).toBe(false);
    });

    test('should respect allowDecimal option', () => {
      expect(validators.validateNumber(12.5, { allowDecimal: false })).toBe(false);
      expect(validators.validateNumber(12, { allowDecimal: false })).toBe(true);
    });

    test('should respect allowNegative option', () => {
      expect(validators.validateNumber(-50, { allowNegative: false })).toBe(false);
      expect(validators.validateNumber(50, { allowNegative: false })).toBe(true);
    });
  });

  // ========== Date Validation ==========
  describe('validateDate', () => {
    test('should validate Date objects', () => {
      expect(validators.validateDate(new Date())).toBe(true);
    });

    test('should validate date strings', () => {
      expect(validators.validateDate('2024-01-01')).toBe(true);
    });

    test('should validate timestamps', () => {
      expect(validators.validateDate(Date.now())).toBe(true);
    });

    test('should reject invalid dates', () => {
      expect(validators.validateDate('invalid-date')).toBe(false);
      expect(validators.validateDate(null)).toBe(false);
    });

    test('should validate date range', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      expect(validators.validateDate(today, { minDate: yesterday, maxDate: tomorrow })).toBe(true);
      expect(validators.validateDate(yesterday, { minDate: today })).toBe(false);
    });
  });

  // ========== URL Validation ==========
  describe('validateUrl', () => {
    test('should validate URLs with protocol', () => {
      expect(validators.validateUrl('https://example.com')).toBe(true);
      expect(validators.validateUrl('http://test.org')).toBe(true);
    });

    test('should validate URLs without protocol', () => {
      expect(validators.validateUrl('example.com')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(validators.validateUrl('not-a-url')).toBe(false);
      expect(validators.validateUrl('')).toBe(false);
    });

    test('should respect requireProtocol option', () => {
      expect(validators.validateUrl('example.com', { requireProtocol: true })).toBe(false);
      expect(validators.validateUrl('https://example.com', { requireProtocol: true })).toBe(true);
    });
  });

  // ========== Telegram ID Validation ==========
  describe('validateTelegramId', () => {
    test('should validate valid Telegram IDs', () => {
      expect(validators.validateTelegramId(123456789)).toBe(true);
      expect(validators.validateTelegramId('987654321')).toBe(true);
    });

    test('should reject invalid Telegram IDs', () => {
      expect(validators.validateTelegramId(0)).toBe(false);
      expect(validators.validateTelegramId(-123)).toBe(false);
      expect(validators.validateTelegramId('abc')).toBe(false);
    });

    test('should reject very long IDs', () => {
      expect(validators.validateTelegramId('12345678901234')).toBe(false);
    });
  });

  // ========== Full Name Validation ==========
  describe('validateFullName', () => {
    test('should validate Arabic full names', () => {
      expect(validators.validateFullName('أحمد محمد')).toBe(true);
      expect(validators.validateFullName('فاطمة الزهراء')).toBe(true);
    });

    test('should reject single word names', () => {
      expect(validators.validateFullName('أحمد')).toBe(false);
    });

    test('should reject short names', () => {
      expect(validators.validateFullName('أح')).toBe(false);
    });

    test('should reject names with numbers', () => {
      expect(validators.validateFullName('أحمد ١٢٣')).toBe(false);
    });
  });

  // ========== Phone Normalization ==========
  describe('normalizePhone', () => {
    test('should normalize Arabic numbers to English', () => {
      expect(validators.normalizePhone('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    test('should remove separators', () => {
      expect(validators.normalizePhone('012-345-6789')).toBe('0123456789');
      expect(validators.normalizePhone('(012) 345-6789')).toBe('0123456789');
    });

    test('should preserve + prefix', () => {
      expect(validators.normalizePhone('+201234567890')).toBe('+201234567890');
    });
  });

  // ========== Length Validation ==========
  describe('validateLength', () => {
    test('should validate text within range', () => {
      expect(validators.validateLength('test', { min: 2, max: 10 })).toBe(true);
    });

    test('should reject text outside range', () => {
      expect(validators.validateLength('a', { min: 2 })).toBe(false);
      expect(validators.validateLength('very long text here', { max: 10 })).toBe(false);
    });

    test('should trim by default', () => {
      expect(validators.validateLength('  test  ', { min: 4, max: 4 })).toBe(true);
    });

    test('should not trim when option is false', () => {
      expect(validators.validateLength('  test  ', { min: 8, max: 8, trim: false })).toBe(true);
    });
  });

  // ========== Pattern Validation ==========
  describe('validatePattern', () => {
    test('should validate against regex', () => {
      expect(validators.validatePattern('ABC123', /^[A-Z0-9]+$/)).toBe(true);
    });

    test('should reject non-matching patterns', () => {
      expect(validators.validatePattern('abc123', /^[A-Z0-9]+$/)).toBe(false);
    });

    test('should accept string patterns', () => {
      expect(validators.validatePattern('test@example.com', '^[\\w.]+@[\\w.]+$')).toBe(true);
    });
  });

  // ========== Required Validation ==========
  describe('validateRequired', () => {
    test('should validate non-empty values', () => {
      expect(validators.validateRequired('text')).toBe(true);
      expect(validators.validateRequired(123)).toBe(true);
      expect(validators.validateRequired(true)).toBe(true);
    });

    test('should reject null/undefined', () => {
      expect(validators.validateRequired(null)).toBe(false);
      expect(validators.validateRequired(undefined)).toBe(false);
    });

    test('should handle zero', () => {
      expect(validators.validateRequired(0)).toBe(true);
      expect(validators.validateRequired(0, { allowZero: false })).toBe(false);
    });

    test('should handle empty strings', () => {
      expect(validators.validateRequired('')).toBe(false);
      expect(validators.validateRequired('', { allowEmptyString: true })).toBe(true);
    });

    test('should reject empty arrays', () => {
      expect(validators.validateRequired([])).toBe(false);
    });

    test('should reject empty objects', () => {
      expect(validators.validateRequired({})).toBe(false);
    });
  });

  // ========== Multiple Validation ==========
  describe('validateMultiple', () => {
    const rules = {
      email: [{ validator: 'email', message: 'بريد إلكتروني غير صالح' }],
      phone: [{ validator: 'phone', message: 'رقم هاتف غير صالح' }],
      age: [{ validator: 'number', message: 'عمر غير صالح', options: { min: 18 } }]
    };

    test('should return isValid: true for valid data', () => {
      const data = {
        email: 'test@example.com',
        phone: '01234567890',
        age: 25
      };
      const result = validators.validateMultiple(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should return errors for invalid data', () => {
      const data = {
        email: 'invalid-email',
        phone: '123',
        age: 15
      };
      const result = validators.validateMultiple(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('phone');
      expect(result.errors).toHaveProperty('age');
    });

    test('should handle mixed valid/invalid data', () => {
      const data = {
        email: 'test@example.com',
        phone: '123',
        age: 25
      };
      const result = validators.validateMultiple(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).not.toHaveProperty('email');
      expect(result.errors).toHaveProperty('phone');
      expect(result.errors).not.toHaveProperty('age');
    });
  });
});
