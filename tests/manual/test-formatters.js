/**
 * Manual Test for Formatters Utility
 * 
 * Run: node tests/manual/test-formatters.js
 */

const formatters = require('../../src/utils/formatters.util');

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
console.log(`${colors.cyan}  Testing Formatters Utility${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

// ============================================
// Date Formatting Tests
// ============================================
console.log(`${colors.blue}--- Date Formatting ---${colors.reset}`);

test('Format date with default pattern (Arabic)', () => {
  const date = new Date('2025-01-15');
  const formatted = formatters.formatDate(date);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('٢٠٢٥'), 'Arabic year not found');
  assert(formatted.length > 0, 'Empty result');
});

test('Format date with custom pattern', () => {
  const date = new Date('2025-01-15');
  const formatted = formatters.formatDate(date, 'DD/MM/YYYY');
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

test('Format date with Arabic months', () => {
  const date = new Date('2025-01-15');
  const formatted = formatters.formatDate(date, 'DD MMMM YYYY', { arabicMonths: true });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('يناير'), 'Arabic month not found');
});

test('Format date with day name', () => {
  const date = new Date('2025-01-15');
  const formatted = formatters.formatDate(date, 'dddd، DD MMMM YYYY', { arabicMonths: true });
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

test('Format date with English numerals', () => {
  const date = new Date('2025-01-15');
  const formatted = formatters.formatDate(date, 'YYYY-MM-DD', { arabic: false });
  console.log(`  Result: ${formatted}`);
  assert(formatted === '2025-01-15', 'Incorrect format');
});

// ============================================
// Time Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- Time Formatting ---${colors.reset}`);

test('Format time 24-hour (Arabic)', () => {
  const time = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatTime(time);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('١٤'), 'Arabic hour not found');
  assert(formatted.includes('٣٠'), 'Arabic minute not found');
});

test('Format time with seconds', () => {
  const time = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatTime(time, { seconds: true });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('٤٥'), 'Seconds not found');
});

test('Format time 12-hour with AM/PM', () => {
  const time = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatTime(time, { ampm: true });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('م'), 'PM marker not found');
});

test('Format time with English numerals', () => {
  const time = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatTime(time, { arabic: false });
  console.log(`  Result: ${formatted}`);
  assert(formatted === '14:30', 'Incorrect format');
});

// ============================================
// DateTime Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- DateTime Formatting ---${colors.reset}`);

test('Format datetime with default options', () => {
  const datetime = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatDateTime(datetime);
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

test('Format datetime date only', () => {
  const datetime = new Date('2025-01-15T14:30:45');
  const formatted = formatters.formatDateTime(datetime, { includeTime: false });
  console.log(`  Result: ${formatted}`);
  assert(!formatted.includes(':'), 'Time included');
});

// ============================================
// File Size Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- File Size Formatting ---${colors.reset}`);

test('Format file size - bytes', () => {
  const formatted = formatters.formatFileSize(500);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('بايت'), 'Bytes unit not found');
});

test('Format file size - kilobytes', () => {
  const formatted = formatters.formatFileSize(2048);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('كيلوبايت'), 'KB unit not found');
});

test('Format file size - megabytes', () => {
  const formatted = formatters.formatFileSize(5242880);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('ميجابايت'), 'MB unit not found');
});

test('Format file size - gigabytes', () => {
  const formatted = formatters.formatFileSize(1073741824);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('جيجابايت'), 'GB unit not found');
});

test('Format file size with custom decimals', () => {
  const formatted = formatters.formatFileSize(1500000, { decimals: 1 });
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

test('Format file size with English numerals', () => {
  const formatted = formatters.formatFileSize(1024, { arabic: false });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('1.00'), 'English numerals not found');
});

// ============================================
// Text Truncation Tests
// ============================================
console.log(`\n${colors.blue}--- Text Truncation ---${colors.reset}`);

test('Truncate long text', () => {
  const text = 'هذا نص طويل جداً يحتاج إلى اختصار لكي يظهر بشكل مناسب في الواجهة';
  const truncated = formatters.truncateText(text, 30);
  console.log(`  Result: ${truncated}`);
  assert(truncated.length <= 33, 'Text not truncated'); // 30 + "..."
  assert(truncated.includes('...'), 'Suffix not found');
});

test('Truncate with word break', () => {
  const text = 'هذا نص طويل جداً يحتاج إلى اختصار';
  const truncated = formatters.truncateText(text, 20, { breakWord: true });
  console.log(`  Result: ${truncated}`);
  assert(truncated.length <= 23, 'Text not truncated');
});

test('Do not truncate short text', () => {
  const text = 'نص قصير';
  const truncated = formatters.truncateText(text, 50);
  console.log(`  Result: ${truncated}`);
  assert(truncated === text, 'Short text truncated');
});

// ============================================
// Currency Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- Currency Formatting ---${colors.reset}`);

test('Format currency - SAR', () => {
  const formatted = formatters.formatCurrency(1250.50, 'SAR');
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('ريال'), 'SAR symbol not found');
  assert(formatted.includes('٥٠'), 'Decimal not found');
});

test('Format currency - USD', () => {
  const formatted = formatters.formatCurrency(99.99, 'USD');
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('$'), 'USD symbol not found');
});

test('Format currency - EGP', () => {
  const formatted = formatters.formatCurrency(500, 'EGP');
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('جنيه'), 'EGP symbol not found');
});

test('Format currency without symbol', () => {
  const formatted = formatters.formatCurrency(1000, 'SAR', { symbol: false });
  console.log(`  Result: ${formatted}`);
  assert(!formatted.includes('ريال'), 'Symbol found');
});

test('Format currency with custom decimals', () => {
  const formatted = formatters.formatCurrency(1234.567, 'SAR', { decimals: 1 });
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

// ============================================
// Percentage Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- Percentage Formatting ---${colors.reset}`);

test('Format percentage', () => {
  const formatted = formatters.formatPercentage(75.5);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('٧٥'), 'Arabic numerals not found');
  assert(formatted.includes('٪'), 'Percent symbol not found');
});

test('Format normalized percentage (0-1)', () => {
  const formatted = formatters.formatPercentage(0.755, { normalized: true });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('٧٥'), 'Conversion failed');
});

test('Format percentage with custom decimals', () => {
  const formatted = formatters.formatPercentage(75.567, { decimals: 2 });
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

// ============================================
// Phone Number Formatting Tests
// ============================================
console.log(`\n${colors.blue}--- Phone Number Formatting ---${colors.reset}`);

test('Format phone number with default pattern', () => {
  const formatted = formatters.formatPhoneNumber('0501234567');
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('-'), 'Separator not found');
});

test('Format phone number with custom pattern', () => {
  const formatted = formatters.formatPhoneNumber('0501234567', { format: 'XXXX-XXX-XXX' });
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
});

test('Format phone number with English numerals', () => {
  const formatted = formatters.formatPhoneNumber('0501234567', { arabic: false });
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('0'), 'English numerals not found');
});

// ============================================
// Text Utilities Tests
// ============================================
console.log(`\n${colors.blue}--- Text Utilities ---${colors.reset}`);

test('Capitalize first letter', () => {
  const formatted = formatters.capitalizeFirst('hello world');
  console.log(`  Result: ${formatted}`);
  assert(formatted === 'Hello world', 'Capitalization failed');
});

test('Create slug from Arabic text', () => {
  const formatted = formatters.slugify('مرحبا بك في العالم');
  console.log(`  Result: ${formatted}`);
  assert(formatted.length > 0, 'Empty result');
  assert(!formatted.includes(' '), 'Spaces not removed');
});

test('Create slug from English text', () => {
  const formatted = formatters.slugify('Hello World 2025');
  console.log(`  Result: ${formatted}`);
  assert(formatted === 'hello-world-2025', 'Slug failed');
});

test('Create slug with custom separator', () => {
  const formatted = formatters.slugify('Hello World', { separator: '_' });
  console.log(`  Result: ${formatted}`);
  assert(formatted === 'hello_world', 'Custom separator failed');
});

// ============================================
// Relative Time Tests
// ============================================
console.log(`\n${colors.blue}--- Relative Time ---${colors.reset}`);

test('Format relative time - now', () => {
  const now = new Date();
  const formatted = formatters.formatRelativeTime(now);
  console.log(`  Result: ${formatted}`);
  assert(formatted === 'الآن', 'Now formatting failed');
});

test('Format relative time - minutes ago', () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const formatted = formatters.formatRelativeTime(fiveMinutesAgo);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('دقيقة'), 'Minutes not found');
});

test('Format relative time - hours ago', () => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const formatted = formatters.formatRelativeTime(twoHoursAgo);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('ساعة'), 'Hours not found');
});

test('Format relative time - days ago', () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const formatted = formatters.formatRelativeTime(threeDaysAgo);
  console.log(`  Result: ${formatted}`);
  assert(formatted.includes('يوم'), 'Days not found');
});

// ============================================
// Summary
// ============================================
console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  Test Summary${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
console.log(`${colors.yellow}Total:  ${passedTests + failedTests}${colors.reset}`);

if (failedTests === 0) {
  console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
  process.exit(1);
}
