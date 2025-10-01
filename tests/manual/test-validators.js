/**
 * Manual Test for Validators Utility
 * 
 * Run: node tests/manual/test-validators.js
 */

const validators = require('../../src/utils/validators.util');

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passedTests = 0;
let failedTests = 0;

/**
 * Test helper function
 */
function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failedTests++;
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  Testing Validators Utility${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

// ============================================
// Email Validation Tests
// ============================================
console.log(`${colors.blue}--- Email Validation ---${colors.reset}`);

test('Valid email addresses', () => {
  assert(validators.validateEmail('user@example.com') === true, 'Simple email failed');
  assert(validators.validateEmail('test.user@domain.co.uk') === true, 'Complex email failed');
  assert(validators.validateEmail('admin+tag@company.org') === true, 'Email with + failed');
});

test('Invalid email addresses', () => {
  assert(validators.validateEmail('invalid.email') === false, 'No @ accepted');
  assert(validators.validateEmail('@example.com') === false, 'No username accepted');
  assert(validators.validateEmail('user@') === false, 'No domain accepted');
  assert(validators.validateEmail('') === false, 'Empty string accepted');
  assert(validators.validateEmail(null) === false, 'Null accepted');
});

// ============================================
// Phone Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Phone Validation ---${colors.reset}`);

test('Valid phone numbers (Arabic)', () => {
  assert(validators.validatePhone('٠١٢٣٤٥٦٧٨٩') === true, 'Arabic numerals failed');
  assert(validators.validatePhone('٠٥٠١٢٣٤٥٦٧٨') === true, 'Arabic 11 digits failed');
});

test('Valid phone numbers (English)', () => {
  assert(validators.validatePhone('0123456789') === true, 'English numerals failed');
  assert(validators.validatePhone('+966501234567') === true, 'With country code failed');
  assert(validators.validatePhone('050-123-4567') === true, 'With separators failed');
});

test('Invalid phone numbers', () => {
  assert(validators.validatePhone('123') === false, 'Too short accepted');
  assert(validators.validatePhone('12345678901234567') === false, 'Too long accepted');
  assert(validators.validatePhone('abc123456') === false, 'Letters accepted');
  assert(validators.validatePhone('') === false, 'Empty string accepted');
});

test('Phone validation with custom options', () => {
  assert(validators.validatePhone('12345', { minLength: 5, maxLength: 5 }) === true, 'Custom length failed');
});

// ============================================
// Arabic Text Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Arabic Text Validation ---${colors.reset}`);

test('Valid Arabic text', () => {
  assert(validators.validateArabicText('مرحبا') === true, 'Simple Arabic failed');
  assert(validators.validateArabicText('مرحبا بك في العالم') === true, 'Arabic with spaces failed');
  assert(validators.validateArabicText('النص العربي ١٢٣') === true, 'Arabic with Arabic numbers failed');
  assert(validators.validateArabicText('العنوان: شارع 456') === true, 'Arabic with English numbers failed');
  assert(validators.validateArabicText('السلام عليكم، كيف حالك؟') === true, 'Arabic with punctuation failed');
});

test('Invalid Arabic text', () => {
  assert(validators.validateArabicText('Hello World') === false, 'English text accepted');
  assert(validators.validateArabicText('') === false, 'Empty string accepted');
  assert(validators.validateArabicText(null) === false, 'Null accepted');
});

test('Arabic text ALWAYS accepts numbers (new behavior)', () => {
  // IMPORTANT: Numbers are now ALWAYS accepted in text fields
  assert(validators.validateArabicText('مرحبا', { allowPunctuation: false }) === true, 'Text without numbers failed');
  assert(validators.validateArabicText('مرحبا ١٢٣', { allowPunctuation: false }) === true, 'Arabic numbers in text should be accepted');
  assert(validators.validateArabicText('العنوان: شارع 15', { allowPunctuation: true }) === true, 'English numbers in text should be accepted');
  assert(validators.validateArabicText('الشقة رقم ٢٥ الطابق 3') === true, 'Mixed numbers in text should be accepted');
});

// ============================================
// Number Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Number Validation ---${colors.reset}`);

test('Valid numbers (number-only fields)', () => {
  assert(validators.validateNumber(123) === true, 'Integer failed');
  assert(validators.validateNumber(123.45) === true, 'Decimal failed');
  assert(validators.validateNumber('456') === true, 'String number failed');
  assert(validators.validateNumber('٧٨٩') === true, 'Arabic number failed');
  assert(validators.validateNumber(-50) === true, 'Negative number failed');
});

test('Invalid numbers (number-only fields)', () => {
  assert(validators.validateNumber('abc') === false, 'Text accepted in number field');
  assert(validators.validateNumber('العمر: ٢٥') === false, 'Text with number accepted in number field');
  assert(validators.validateNumber(null) === false, 'Null accepted');
  assert(validators.validateNumber('') === false, 'Empty string accepted');
  assert(validators.validateNumber(Infinity) === false, 'Infinity accepted');
  assert(validators.validateNumber(NaN) === false, 'NaN accepted');
});

test('Number validation with range', () => {
  assert(validators.validateNumber(50, { min: 10, max: 100 }) === true, 'Number in range failed');
  assert(validators.validateNumber(5, { min: 10, max: 100 }) === false, 'Number below min accepted');
  assert(validators.validateNumber(150, { min: 10, max: 100 }) === false, 'Number above max accepted');
});

test('Number validation with options', () => {
  assert(validators.validateNumber(10.5, { allowDecimal: false }) === false, 'Decimal not rejected');
  assert(validators.validateNumber(-10, { allowNegative: false }) === false, 'Negative not rejected');
});

// ============================================
// Date Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Date Validation ---${colors.reset}`);

test('Valid dates', () => {
  assert(validators.validateDate(new Date()) === true, 'Date object failed');
  assert(validators.validateDate('2025-01-15') === true, 'Date string failed');
  assert(validators.validateDate(1736899200000) === true, 'Timestamp failed');
});

test('Invalid dates', () => {
  assert(validators.validateDate('invalid date') === false, 'Invalid date string accepted');
  assert(validators.validateDate(null) === false, 'Null accepted');
  assert(validators.validateDate('') === false, 'Empty string accepted');
});

test('Date validation with range', () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  assert(validators.validateDate(today, { minDate: yesterday, maxDate: tomorrow }) === true, 'Date in range failed');
  assert(validators.validateDate(yesterday, { minDate: today }) === false, 'Date before min accepted');
  assert(validators.validateDate(tomorrow, { maxDate: today }) === false, 'Date after max accepted');
});

// ============================================
// URL Validation Tests
// ============================================
console.log(`\n${colors.blue}--- URL Validation ---${colors.reset}`);

test('Valid URLs', () => {
  assert(validators.validateUrl('https://example.com') === true, 'HTTPS URL failed');
  assert(validators.validateUrl('http://example.com') === true, 'HTTP URL failed');
  assert(validators.validateUrl('example.com') === true, 'URL without protocol failed');
  assert(validators.validateUrl('subdomain.example.com') === true, 'Subdomain URL failed');
});

test('Invalid URLs', () => {
  assert(validators.validateUrl('not a url') === false, 'Invalid URL accepted');
  assert(validators.validateUrl('') === false, 'Empty string accepted');
  assert(validators.validateUrl(null) === false, 'Null accepted');
});

test('URL validation with options', () => {
  assert(validators.validateUrl('https://example.com', { requireProtocol: true }) === true, 'URL with protocol failed');
  assert(validators.validateUrl('example.com', { requireProtocol: true }) === false, 'URL without protocol accepted when required');
});

// ============================================
// Telegram ID Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Telegram ID Validation ---${colors.reset}`);

test('Valid Telegram IDs', () => {
  assert(validators.validateTelegramId(123456789) === true, 'Valid ID failed');
  assert(validators.validateTelegramId('987654321') === true, 'String ID failed');
});

test('Invalid Telegram IDs', () => {
  assert(validators.validateTelegramId(-123) === false, 'Negative ID accepted');
  assert(validators.validateTelegramId(0) === false, 'Zero accepted');
  assert(validators.validateTelegramId('abc') === false, 'Text accepted');
  assert(validators.validateTelegramId(null) === false, 'Null accepted');
});

// ============================================
// Length Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Length Validation ---${colors.reset}`);

test('Valid lengths', () => {
  assert(validators.validateLength('hello', { min: 3, max: 10 }) === true, 'Length in range failed');
  assert(validators.validateLength('hi', { min: 2, max: 2 }) === true, 'Exact length failed');
});

test('Invalid lengths', () => {
  assert(validators.validateLength('hi', { min: 3 }) === false, 'Too short accepted');
  assert(validators.validateLength('hello world', { max: 5 }) === false, 'Too long accepted');
  assert(validators.validateLength(null) === false, 'Null accepted');
});

test('Length validation with trim', () => {
  assert(validators.validateLength('  hello  ', { min: 5, max: 5, trim: true }) === true, 'Trim failed');
  assert(validators.validateLength('  hello  ', { min: 9, max: 9, trim: false }) === true, 'No trim failed');
});

// ============================================
// Pattern Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Pattern Validation ---${colors.reset}`);

test('Valid patterns', () => {
  assert(validators.validatePattern('abc123', /^[a-z0-9]+$/) === true, 'Regex pattern failed');
  assert(validators.validatePattern('test@example.com', '^[a-z@.]+$') === true, 'String pattern failed');
});

test('Invalid patterns', () => {
  assert(validators.validatePattern('ABC', /^[a-z]+$/) === false, 'Uppercase accepted in lowercase pattern');
  assert(validators.validatePattern('', /^[a-z]+$/) === false, 'Empty string accepted');
  assert(validators.validatePattern(null) === false, 'Null accepted');
});

// ============================================
// Required Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Required Validation ---${colors.reset}`);

test('Valid required values', () => {
  assert(validators.validateRequired('hello') === true, 'String failed');
  assert(validators.validateRequired(123) === true, 'Number failed');
  assert(validators.validateRequired(0) === true, 'Zero failed');
  assert(validators.validateRequired(false) === true, 'False failed');
  assert(validators.validateRequired([1, 2, 3]) === true, 'Array failed');
});

test('Invalid required values', () => {
  assert(validators.validateRequired(null) === false, 'Null accepted');
  assert(validators.validateRequired(undefined) === false, 'Undefined accepted');
  assert(validators.validateRequired('') === false, 'Empty string accepted');
  assert(validators.validateRequired('   ') === false, 'Whitespace string accepted');
  assert(validators.validateRequired([]) === false, 'Empty array accepted');
  assert(validators.validateRequired({}) === false, 'Empty object accepted');
});

test('Required validation with options', () => {
  assert(validators.validateRequired(0, { allowZero: false }) === false, 'Zero accepted when not allowed');
  assert(validators.validateRequired('', { allowEmptyString: true }) === true, 'Empty string rejected when allowed');
});

// ============================================
// Multiple Validation Tests
// ============================================
console.log(`\n${colors.blue}--- Multiple Validation ---${colors.reset}`);

test('Valid multiple validation', () => {
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
  
  const result = validators.validateMultiple(data, rules);
  assert(result.isValid === true, 'Valid data failed');
  assert(result.errors === null, 'Errors present for valid data');
});

test('Invalid multiple validation', () => {
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
  
  const result = validators.validateMultiple(data, rules);
  assert(result.isValid === false, 'Invalid data passed');
  assert(result.errors !== null, 'No errors for invalid data');
  assert(Object.keys(result.errors).length === 4, 'Wrong number of errors');
});

// ============================================
// Summary
// ============================================
console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  Test Summary${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
console.log(`Failed: ${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);
console.log(`Total:  ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
  process.exit(1);
}
