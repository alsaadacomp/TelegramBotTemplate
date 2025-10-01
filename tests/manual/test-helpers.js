/**
 * Manual Test for Helpers Utility
 * 
 * Run: node tests/manual/test-helpers.js
 */

const helpers = require('../../src/utils/helpers.util');

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
console.log(`${colors.cyan}  Testing Helpers Utility${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

// ============================================
// ID Generation Tests
// ============================================
console.log(`${colors.blue}--- ID Generation ---${colors.reset}`);

test('Generate ID without prefix', () => {
  const id = helpers.generateId();
  console.log(`  Result: ${id}`);
  assert(id.length > 0, 'Empty ID generated');
  assert(typeof id === 'string', 'ID not a string');
});

test('Generate ID with prefix', () => {
  const id = helpers.generateId('user');
  console.log(`  Result: ${id}`);
  assert(id.startsWith('user_'), 'Prefix not found');
});

test('Generate ID without timestamp', () => {
  const id = helpers.generateId('test', { timestamp: false });
  console.log(`  Result: ${id}`);
  assert(id.startsWith('test_'), 'Prefix not found');
  assert(id.length < 20, 'ID too long (contains timestamp)');
});

test('Generate ID with custom length', () => {
  const id = helpers.generateId('', { length: 16 });
  console.log(`  Result: ${id}`);
  assert(id.length >= 16, 'ID too short');
});

test('Generate multiple unique IDs', () => {
  const ids = new Set();
  for (let i = 0; i < 10; i++) {
    ids.add(helpers.generateId());
  }
  assert(ids.size === 10, 'Duplicate IDs generated');
});

// ============================================
// Sleep/Delay Tests
// ============================================
console.log(`\n${colors.blue}--- Sleep/Delay ---${colors.reset}`);

test('Sleep for 100ms', async () => {
  const start = Date.now();
  await helpers.sleep(100);
  const duration = Date.now() - start;
  console.log(`  Duration: ${duration}ms`);
  assert(duration >= 100, 'Sleep too short');
  assert(duration < 150, 'Sleep too long');
});

// ============================================
// Retry Tests
// ============================================
console.log(`\n${colors.blue}--- Retry Function ---${colors.reset}`);

test('Retry successful function', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    return 'success';
  };
  
  const result = await helpers.retry(fn, { times: 3, delay: 50 });
  console.log(`  Attempts: ${attempts}, Result: ${result}`);
  assert(attempts === 1, 'Function retried unnecessarily');
  assert(result === 'success', 'Incorrect result');
});

test('Retry failing function until success', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('Not yet');
    return 'success';
  };
  
  const result = await helpers.retry(fn, { times: 5, delay: 50 });
  console.log(`  Attempts: ${attempts}, Result: ${result}`);
  assert(attempts === 3, 'Wrong number of attempts');
  assert(result === 'success', 'Incorrect result');
});

test('Retry exhausted and throws error', async () => {
  let errorThrown = false;
  const fn = async () => {
    throw new Error('Always fails');
  };
  
  try {
    await helpers.retry(fn, { times: 2, delay: 50 });
  } catch (error) {
    errorThrown = true;
    console.log(`  Error caught: ${error.message}`);
  }
  
  assert(errorThrown, 'Error not thrown after retries exhausted');
});

// ============================================
// Sanitize Input Tests
// ============================================
console.log(`\n${colors.blue}--- Sanitize Input ---${colors.reset}`);

test('Sanitize HTML tags', () => {
  const input = '<script>alert("xss")</script>Hello';
  const sanitized = helpers.sanitizeInput(input);
  console.log(`  Input: ${input}`);
  console.log(`  Result: ${sanitized}`);
  assert(!sanitized.includes('<script>'), 'HTML tags not removed');
});

test('Escape special characters', () => {
  const input = 'Test & "quotes" <tags>';
  const sanitized = helpers.sanitizeInput(input);
  console.log(`  Input: ${input}`);
  console.log(`  Result: ${sanitized}`);
  assert(sanitized.includes('&amp;'), 'Ampersand not escaped');
  assert(sanitized.includes('&quot;'), 'Quotes not escaped');
});

test('Trim whitespace', () => {
  const input = '  hello world  ';
  const sanitized = helpers.sanitizeInput(input);
  console.log(`  Input: "${input}"`);
  console.log(`  Result: "${sanitized}"`);
  assert(sanitized === 'hello world', 'Whitespace not trimmed');
});

test('Limit length', () => {
  const input = 'This is a very long text that needs to be truncated';
  const sanitized = helpers.sanitizeInput(input, { maxLength: 20 });
  console.log(`  Input: ${input}`);
  console.log(`  Result: ${sanitized}`);
  assert(sanitized.length <= 20, 'Length not limited');
});

// ============================================
// Deep Clone Tests
// ============================================
console.log(`\n${colors.blue}--- Deep Clone ---${colors.reset}`);

test('Deep clone object', () => {
  const original = { a: 1, b: { c: 2 } };
  const cloned = helpers.deepClone(original);
  
  cloned.b.c = 999;
  
  console.log(`  Original: ${JSON.stringify(original)}`);
  console.log(`  Cloned:   ${JSON.stringify(cloned)}`);
  
  assert(original.b.c === 2, 'Original object was modified');
  assert(cloned.b.c === 999, 'Clone not independent');
});

test('Deep clone array', () => {
  const original = [1, [2, 3], { a: 4 }];
  const cloned = helpers.deepClone(original);
  
  cloned[1][0] = 999;
  cloned[2].a = 888;
  
  console.log(`  Original: ${JSON.stringify(original)}`);
  console.log(`  Cloned:   ${JSON.stringify(cloned)}`);
  
  assert(original[1][0] === 2, 'Original array was modified');
  assert(cloned[1][0] === 999, 'Clone not independent');
});

test('Deep clone Date object', () => {
  const original = new Date('2025-01-01');
  const cloned = helpers.deepClone(original);
  
  assert(cloned instanceof Date, 'Date not cloned correctly');
  assert(cloned.getTime() === original.getTime(), 'Date value incorrect');
});

// ============================================
// isEmpty Tests
// ============================================
console.log(`\n${colors.blue}--- isEmpty Check ---${colors.reset}`);

test('isEmpty - empty values', () => {
  assert(helpers.isEmpty(null) === true, 'Null not empty');
  assert(helpers.isEmpty(undefined) === true, 'Undefined not empty');
  assert(helpers.isEmpty('') === true, 'Empty string not empty');
  assert(helpers.isEmpty('   ') === true, 'Whitespace not empty');
  assert(helpers.isEmpty([]) === true, 'Empty array not empty');
  assert(helpers.isEmpty({}) === true, 'Empty object not empty');
  console.log(`  All empty values detected correctly`);
});

test('isEmpty - non-empty values', () => {
  assert(helpers.isEmpty('text') === false, 'Text marked as empty');
  assert(helpers.isEmpty(0) === false, 'Zero marked as empty');
  assert(helpers.isEmpty(false) === false, 'False marked as empty');
  assert(helpers.isEmpty([1]) === false, 'Array with items marked as empty');
  assert(helpers.isEmpty({ a: 1 }) === false, 'Object with keys marked as empty');
  console.log(`  All non-empty values detected correctly`);
});

// ============================================
// Pick & Omit Tests
// ============================================
console.log(`\n${colors.blue}--- Pick & Omit ---${colors.reset}`);

test('Pick keys from object', () => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const picked = helpers.pick(obj, ['a', 'c']);
  console.log(`  Original: ${JSON.stringify(obj)}`);
  console.log(`  Picked:   ${JSON.stringify(picked)}`);
  assert(Object.keys(picked).length === 2, 'Wrong number of keys');
  assert(picked.a === 1 && picked.c === 3, 'Wrong values picked');
});

test('Omit keys from object', () => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const omitted = helpers.omit(obj, ['b', 'd']);
  console.log(`  Original: ${JSON.stringify(obj)}`);
  console.log(`  Omitted:  ${JSON.stringify(omitted)}`);
  assert(Object.keys(omitted).length === 2, 'Wrong number of keys');
  assert(omitted.a === 1 && omitted.c === 3, 'Wrong values remaining');
});

// ============================================
// Array Manipulation Tests
// ============================================
console.log(`\n${colors.blue}--- Array Manipulation ---${colors.reset}`);

test('Chunk array', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8];
  const chunks = helpers.chunk(array, 3);
  console.log(`  Original: ${JSON.stringify(array)}`);
  console.log(`  Chunks:   ${JSON.stringify(chunks)}`);
  assert(chunks.length === 3, 'Wrong number of chunks');
  assert(chunks[0].length === 3, 'First chunk wrong size');
  assert(chunks[2].length === 2, 'Last chunk wrong size');
});

test('Shuffle array', () => {
  const original = [1, 2, 3, 4, 5];
  const shuffled = helpers.shuffle(original);
  console.log(`  Original: ${JSON.stringify(original)}`);
  console.log(`  Shuffled: ${JSON.stringify(shuffled)}`);
  assert(shuffled.length === original.length, 'Length changed');
  assert(JSON.stringify(shuffled) !== JSON.stringify(original) || shuffled.length < 2, 'Array not shuffled');
});

// ============================================
// Deep Merge Tests
// ============================================
console.log(`\n${colors.blue}--- Deep Merge ---${colors.reset}`);

test('Deep merge objects', () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { b: { d: 3 }, e: 4 };
  const merged = helpers.deepMerge(obj1, obj2);
  console.log(`  Obj1:   ${JSON.stringify(obj1)}`);
  console.log(`  Obj2:   ${JSON.stringify(obj2)}`);
  console.log(`  Merged: ${JSON.stringify(merged)}`);
  assert(merged.a === 1, 'First object key missing');
  assert(merged.b.c === 2, 'Nested key from first object missing');
  assert(merged.b.d === 3, 'Nested key from second object missing');
  assert(merged.e === 4, 'Second object key missing');
});

// ============================================
// Nested Property Tests
// ============================================
console.log(`\n${colors.blue}--- Nested Property ---${colors.reset}`);

test('Get nested property', () => {
  const obj = { user: { profile: { name: 'Ahmad' } } };
  const value = helpers.getNestedProperty(obj, 'user.profile.name');
  console.log(`  Object: ${JSON.stringify(obj)}`);
  console.log(`  Path: user.profile.name`);
  console.log(`  Value: ${value}`);
  assert(value === 'Ahmad', 'Wrong value retrieved');
});

test('Get nested property with default', () => {
  const obj = { user: { profile: {} } };
  const value = helpers.getNestedProperty(obj, 'user.profile.age', 25);
  console.log(`  Object: ${JSON.stringify(obj)}`);
  console.log(`  Path: user.profile.age (missing)`);
  console.log(`  Value: ${value}`);
  assert(value === 25, 'Default value not returned');
});

test('Set nested property', () => {
  const obj = {};
  helpers.setNestedProperty(obj, 'user.profile.name', 'Ahmad');
  console.log(`  Result: ${JSON.stringify(obj)}`);
  assert(obj.user.profile.name === 'Ahmad', 'Property not set correctly');
});

// ============================================
// Query String Tests
// ============================================
console.log(`\n${colors.blue}--- Query String ---${colors.reset}`);

test('Object to query string', () => {
  const obj = { name: 'Ahmad', age: 25, active: true };
  const queryString = helpers.objectToQueryString(obj);
  console.log(`  Object: ${JSON.stringify(obj)}`);
  console.log(`  Query:  ${queryString}`);
  assert(queryString.includes('name=Ahmad'), 'Name not found');
  assert(queryString.includes('age=25'), 'Age not found');
  assert(queryString.includes('&'), 'Separator not found');
});

test('Query string to object', () => {
  const queryString = 'name=Ahmad&age=25&active=true';
  const obj = helpers.queryStringToObject(queryString);
  console.log(`  Query:  ${queryString}`);
  console.log(`  Object: ${JSON.stringify(obj)}`);
  assert(obj.name === 'Ahmad', 'Name not parsed');
  assert(obj.age === '25', 'Age not parsed');
  assert(obj.active === 'true', 'Active not parsed');
});

// ============================================
// Random Utilities Tests
// ============================================
console.log(`\n${colors.blue}--- Random Utilities ---${colors.reset}`);

test('Random number in range', () => {
  const results = [];
  for (let i = 0; i < 10; i++) {
    const num = helpers.randomInRange(1, 10);
    results.push(num);
  }
  console.log(`  Results: ${results.join(', ')}`);
  assert(results.every(n => n >= 1 && n <= 10), 'Number out of range');
});

test('Random string', () => {
  const str = helpers.randomString(10);
  console.log(`  Result: ${str}`);
  assert(str.length === 10, 'Wrong length');
  assert(/^[A-Za-z0-9]+$/.test(str), 'Invalid characters');
});

test('Random string with custom chars', () => {
  const str = helpers.randomString(8, { chars: '0123456789' });
  console.log(`  Result: ${str}`);
  assert(str.length === 8, 'Wrong length');
  assert(/^[0-9]+$/.test(str), 'Non-numeric characters');
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
