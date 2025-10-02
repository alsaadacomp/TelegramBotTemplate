const validators = require('../../src/utils/validators.util');

// Validators Utility Tests
describe('Validators Utility', () => {

  // Email Validation Tests
  describe('Email Validation', () => {
    test('should return true for valid email addresses', () => {
      expect(validators.validateEmail('user@example.com')).toBe(true);
      expect(validators.validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    test('should return false for invalid email addresses', () => {
      expect(validators.validateEmail('invalid.email')).toBe(false);
      expect(validators.validateEmail('@example.com')).toBe(false);
      expect(validators.validateEmail(null)).toBe(false);
    });
  });

  // Phone Validation Tests
  describe('Phone Validation', () => {
    test('should return true for valid phone numbers (Arabic and English)', () => {
      expect(validators.validatePhone('٠١٢٣٤٥٦٧٨٩')).toBe(true);
      expect(validators.validatePhone('0123456789')).toBe(true);
      expect(validators.validatePhone('+966501234567')).toBe(true);
    });

    test('should return false for invalid phone numbers', () => {
      expect(validators.validatePhone('123')).toBe(false);
      expect(validators.validatePhone('abc123456')).toBe(false);
    });
  });
  
  // Arabic Text Validation Tests
  describe('Arabic Text Validation', () => {
    test('should return true for valid Arabic text with numbers and punctuation', () => {
      expect(validators.validateArabicText('مرحبا بك في العالم')).toBe(true);
      expect(validators.validateArabicText('النص العربي ١٢٣')).toBe(true);
      expect(validators.validateArabicText('العنوان: شارع 456')).toBe(true);
    });

    test('should return false for English text', () => {
      expect(validators.validateArabicText('Hello World')).toBe(false);
    });
  });

  // Number Validation Tests
  describe('Number Validation', () => {
    test('should return true for valid numbers', () => {
      expect(validators.validateNumber(123)).toBe(true);
      expect(validators.validateNumber('٧٨٩')).toBe(true);
    });

    test('should return false for invalid numbers', () => {
      expect(validators.validateNumber('abc')).toBe(false);
      expect(validators.validateNumber(null)).toBe(false);
    });

    test('should validate number range correctly', () => {
      expect(validators.validateNumber(50, { min: 10, max: 100 })).toBe(true);
      expect(validators.validateNumber(5, { min: 10, max: 100 })).toBe(false);
    });
  });

  // Multiple Validation Tests
  describe('Multiple Validations', () => {
    const rules = {
      email: [{ validator: 'email', message: 'بريد إلكتروني غير صالح' }],
      phone: [{ validator: 'phone', message: 'رقم هاتف غير صالح' }],
      age: [{ validator: 'number', message: 'عمر غير صالح', options: { min: 18 } }]
    };

    test('should return isValid: true for valid data', () => {
      const data = { email: 'test@example.com', phone: '0123456789', age: 25 };
      const result = validators.validateMultiple(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should return isValid: false with error details for invalid data', () => {
      const data = { email: 'invalid', phone: '123', age: 17 };
      const result = validators.validateMultiple(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('phone');
      expect(result.errors).toHaveProperty('age');
    });
  });
});