    const {
  validateEmail,
  validatePhone,
  validateArabicText,
  validateNumber,
  validateDate,
  validateUrl,
  validateTelegramId,
  validateLength,
  validatePattern,
  validateRequired,
  validateMultiple
} = require('../../../src/utils/validators.util');

describe('Validators Utility', () => {
  describe('validateEmail', () => {
    test('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    test('should validate complex email', () => {
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    test('should validate email with +', () => {
      expect(validateEmail('admin+tag@company.org')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    test('should reject email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    test('should reject email without username', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    test('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    test('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });

    test('should reject null email', () => {
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('should validate Arabic numerals', () => {
      expect(validatePhone('٠١٢٣٤٥٦٧٨٩')).toBe(true);
    });

    test('should validate Arabic 11 digits', () => {
      expect(validatePhone('٠٥٠١٢٣٤٥٦٧٨')).toBe(true);
    });

    test('should validate English numerals', () => {
      expect(validatePhone('0123456789')).toBe(true);
    });

    test('should validate with country code', () => {
      expect(validatePhone('+966501234567')).toBe(true);
    });

    test('should validate with separators', () => {
      expect(validatePhone('050-123-4567')).toBe(true);
    });

    test('should reject too short phone', () => {
      expect(validatePhone('123')).toBe(false);
    });

    test('should reject too long phone', () => {
      expect(validatePhone('12345678901234567')).toBe(false);
    });

    test('should reject phone with letters', () => {
      expect(validatePhone('abc123456')).toBe(false);
    });

    test('should reject empty phone', () => {
      expect(validatePhone('')).toBe(false);
    });

    test('should validate with custom options', () => {
      expect(validatePhone('12345', { minLength: 5, maxLength: 5 })).toBe(true);
    });
  });

  describe('validateArabicText', () => {
    test('should validate simple Arabic text', () => {
      expect(validateArabicText('مرحبا')).toBe(true);
    });

    test('should validate Arabic with spaces', () => {
      expect(validateArabicText('مرحبا بك في العالم')).toBe(true);
    });

    test('should validate Arabic with Arabic numbers', () => {
      expect(validateArabicText('النص العربي ١٢٣')).toBe(true);
    });

    test('should validate Arabic with English numbers', () => {
      expect(validateArabicText('العنوان: شارع 456')).toBe(true);
    });

    test('should validate Arabic with punctuation', () => {
      expect(validateArabicText('السلام عليكم، كيف حالك؟')).toBe(true);
    });

    test('should reject English text', () => {
      expect(validateArabicText('Hello World')).toBe(false);
    });

    test('should reject empty text', () => {
      expect(validateArabicText('')).toBe(false);
    });

    test('should reject null text', () => {
      expect(validateArabicText(null)).toBe(false);
    });

    test('should accept numbers in text', () => {
      expect(validateArabicText('مرحبا ١٢٣', { allowPunctuation: false })).toBe(true);
    });

    test('should accept mixed numbers in text', () => {
      expect(validateArabicText('الشقة رقم ٢٥ الطابق 3')).toBe(true);
    });
  });

  describe('validateNumber', () => {
    test('should validate integer', () => {
      expect(validateNumber(123)).toBe(true);
    });

    test('should validate decimal', () => {
      expect(validateNumber(123.45)).toBe(true);
    });

    test('should validate string number', () => {
      expect(validateNumber('456')).toBe(true);
    });

    test('should validate Arabic number', () => {
      expect(validateNumber('٧٨٩')).toBe(true);
    });

    test('should validate negative number', () => {
      expect(validateNumber(-50)).toBe(true);
    });

    test('should reject text in number field', () => {
      expect(validateNumber('abc')).toBe(false);
    });

    test('should reject text with number', () => {
      expect(validateNumber('العمر: ٢٥')).toBe(false);
    });

    test('should reject null', () => {
      expect(validateNumber(null)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(validateNumber('')).toBe(false);
    });

    test('should reject Infinity', () => {
      expect(validateNumber(Infinity)).toBe(false);
    });

    test('should reject NaN', () => {
      expect(validateNumber(NaN)).toBe(false);
    });

    test('should validate number in range', () => {
      expect(validateNumber(50, { min: 10, max: 100 })).toBe(true);
    });

    test('should reject number below min', () => {
      expect(validateNumber(5, { min: 10, max: 100 })).toBe(false);
    });

    test('should reject number above max', () => {
      expect(validateNumber(150, { min: 10, max: 100 })).toBe(false);
    });

    test('should reject decimal when not allowed', () => {
      expect(validateNumber(10.5, { allowDecimal: false })).toBe(false);
    });

    test('should reject negative when not allowed', () => {
      expect(validateNumber(-10, { allowNegative: false })).toBe(false);
    });
  });

  describe('validateDate', () => {
    test('should validate Date object', () => {
      expect(validateDate(new Date())).toBe(true);
    });

    test('should validate date string', () => {
      expect(validateDate('2025-01-15')).toBe(true);
    });

    test('should validate timestamp', () => {
      expect(validateDate(1736899200000)).toBe(true);
    });

    test('should reject invalid date string', () => {
      expect(validateDate('invalid date')).toBe(false);
    });

    test('should reject null date', () => {
      expect(validateDate(null)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(validateDate('')).toBe(false);
    });

    test('should validate date in range', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(validateDate(today, { minDate: yesterday, maxDate: tomorrow })).toBe(true);
    });

    test('should reject date before min', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(validateDate(yesterday, { minDate: today })).toBe(false);
    });

    test('should reject date after max', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(validateDate(tomorrow, { maxDate: today })).toBe(false);
    });
  });

  describe('validateUrl', () => {
    test('should validate HTTPS URL', () => {
      expect(validateUrl('https://example.com')).toBe(true);
    });

    test('should validate HTTP URL', () => {
      expect(validateUrl('http://example.com')).toBe(true);
    });

    test('should validate URL without protocol', () => {
      expect(validateUrl('example.com')).toBe(true);
    });

    test('should validate subdomain URL', () => {
      expect(validateUrl('subdomain.example.com')).toBe(true);
    });

    test('should reject invalid URL', () => {
      expect(validateUrl('not a url')).toBe(false);
    });

    test('should reject empty string', () => {
      expect(validateUrl('')).toBe(false);
    });

    test('should reject null', () => {
      expect(validateUrl(null)).toBe(false);
    });

    test('should validate URL with protocol when required', () => {
      expect(validateUrl('https://example.com', { requireProtocol: true })).toBe(true);
    });

    test('should reject URL without protocol when required', () => {
      expect(validateUrl('example.com', { requireProtocol: true })).toBe(false);
    });
  });

  describe('validateTelegramId', () => {
    test('should validate valid ID', () => {
      expect(validateTelegramId(123456789)).toBe(true);
    });

    test('should validate string ID', () => {
      expect(validateTelegramId('987654321')).toBe(true);
    });

    test('should reject negative ID', () => {
      expect(validateTelegramId(-123)).toBe(false);
    });

    test('should reject zero', () => {
      expect(validateTelegramId(0)).toBe(false);
    });

    test('should reject text', () => {
      expect(validateTelegramId('abc')).toBe(false);
    });

    test('should reject null', () => {
      expect(validateTelegramId(null)).toBe(false);
    });
  });

  describe('validateLength', () => {
    test('should validate length in range', () => {
      expect(validateLength('hello', { min: 3, max: 10 })).toBe(true);
    });

    test('should validate exact length', () => {
      expect(validateLength('hi', { min: 2, max: 2 })).toBe(true);
    });

    test('should reject too short', () => {
      expect(validateLength('hi', { min: 3 })).toBe(false);
    });

    test('should reject too long', () => {
      expect(validateLength('hello world', { max: 5 })).toBe(false);
    });

    test('should reject null', () => {
      expect(validateLength(null)).toBe(false);
    });

    test('should validate with trim', () => {
      expect(validateLength('  hello  ', { min: 5, max: 5, trim: true })).toBe(true);
    });

    test('should validate without trim', () => {
      expect(validateLength('  hello  ', { min: 9, max: 9, trim: false })).toBe(true);
    });
  });

  describe('validatePattern', () => {
    test('should validate regex pattern', () => {
      expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBe(true);
    });

    test('should validate string pattern', () => {
      expect(validatePattern('test@example.com', '^[a-z@.]+$')).toBe(true);
    });

    test('should reject uppercase in lowercase pattern', () => {
      expect(validatePattern('ABC', /^[a-z]+$/)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(validatePattern('', /^[a-z]+$/)).toBe(false);
    });

    test('should reject null', () => {
      expect(validatePattern(null)).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('should validate string', () => {
      expect(validateRequired('hello')).toBe(true);
    });

    test('should validate number', () => {
      expect(validateRequired(123)).toBe(true);
    });

    test('should validate zero', () => {
      expect(validateRequired(0)).toBe(true);
    });

    test('should validate false', () => {
      expect(validateRequired(false)).toBe(true);
    });

    test('should validate array', () => {
      expect(validateRequired([1, 2, 3])).toBe(true);
    });

    test('should reject null', () => {
      expect(validateRequired(null)).toBe(false);
    });

    test('should reject undefined', () => {
      expect(validateRequired(undefined)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(validateRequired('')).toBe(false);
    });

    test('should reject whitespace string', () => {
      expect(validateRequired('   ')).toBe(false);
    });

    test('should reject empty array', () => {
      expect(validateRequired([])).toBe(false);
    });

    test('should reject empty object', () => {
      expect(validateRequired({})).toBe(false);
    });

    test('should reject zero when not allowed', () => {
      expect(validateRequired(0, { allowZero: false })).toBe(false);
    });

    test('should accept empty string when allowed', () => {
      expect(validateRequired('', { allowEmptyString: true })).toBe(true);
    });
  });

  describe('validateMultiple', () => {
    test('should validate valid data', () => {
      const data = {
        email: 'test@example.com',
        phone: '0123456789',
        name: 'أحمد محمد',
        age: 25
      };
      
      const rules = {
        email: [{ validator: 'email', message: 'بريد إلكتروني غير صالح' }],
        phone: [{ validator: 'phone', message: 'رقم هاتف غير صالح' }],
        name: [{ validator: 'arabicText', message: 'اسم غير صالح' }],
        age: [{ validator: 'number', message: 'عمر غير صالح', options: { min: 1, max: 120 } }]
      };
      
      const result = validateMultiple(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject invalid data', () => {
      const data = {
        email: 'invalid',
        phone: '123',
        name: 'Hello World',
        age: 'abc'
      };
      
      const rules = {
        email: [{ validator: 'email', message: 'بريد إلكتروني غير صالح' }],
        phone: [{ validator: 'phone', message: 'رقم هاتف غير صالح' }],
        name: [{ validator: 'arabicText', message: 'اسم غير صالح' }],
        age: [{ validator: 'number', message: 'عمر غير صالح' }]
      };
      
      const result = validateMultiple(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(Object.keys(result.errors).length).toBe(4);
    });
  });
});