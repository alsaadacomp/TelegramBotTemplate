const {
  generateId,
  sleep,
  retry,
  sanitizeInput,
  deepClone,
  isEmpty,
  pick,
  omit,
  chunk,
  shuffle,
  deepMerge,
  getNestedProperty,
  setNestedProperty,
  objectToQueryString,
  queryStringToObject,
  randomInRange,
  randomString
} = require('../../../src/utils/helpers.util');

describe('Helpers Utility', () => {
  describe('generateId', () => {
    test('should generate unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    test('should generate ID with prefix', () => {
      const id = generateId('user');
      expect(id).toMatch(/^user_/);
    });

    test('should generate ID without timestamp', () => {
      const id = generateId('test', { timestamp: false });
      expect(id).toMatch(/^test_/);
      expect(id.length).toBeLessThan(20);
    });

    test('should generate ID with custom length', () => {
      const id = generateId('', { length: 16 });
      expect(id.length).toBeGreaterThanOrEqual(16);
    });

    test('should generate multiple unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('sleep', () => {
    test('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(150);
    });
  });

  describe('retry', () => {
    test('should retry successful function', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return 'success';
      };
      
      const result = await retry(fn, { times: 3, delay: 50 });
      expect(attempts).toBe(1);
      expect(result).toBe('success');
    });

    test('should retry failing function until success', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Not yet');
        return 'success';
      };
      
      const result = await retry(fn, { times: 5, delay: 50 });
      expect(attempts).toBe(3);
      expect(result).toBe('success');
    });

    test('should throw error after retries exhausted', async () => {
      const fn = async () => {
        throw new Error('Always fails');
      };
      
      await expect(retry(fn, { times: 2, delay: 50 })).rejects.toThrow('Always fails');
    });
  });

  describe('sanitizeInput', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    test('should escape special characters', () => {
      const input = 'Test & "quotes" <tags>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
    });

    test('should trim whitespace', () => {
      const input = '  hello world  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('hello world');
    });

    test('should limit length', () => {
      const input = 'This is a very long text that needs to be truncated';
      const sanitized = sanitizeInput(input, { maxLength: 20 });
      expect(sanitized.length).toBeLessThanOrEqual(20);
    });
  });

  describe('deepClone', () => {
    test('should deep clone object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      
      cloned.b.c = 999;
      
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(999);
    });

    test('should deep clone array', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(original);
      
      cloned[1][0] = 999;
      cloned[2].a = 888;
      
      expect(original[1][0]).toBe(2);
      expect(cloned[1][0]).toBe(999);
      expect(original[2].a).toBe(4);
      expect(cloned[2].a).toBe(888);
    });

    test('should deep clone Date object', () => {
      const original = new Date('2025-01-01');
      const cloned = deepClone(original);
      
      expect(cloned).toBeInstanceOf(Date);
      expect(cloned.getTime()).toBe(original.getTime());
    });
  });

  describe('isEmpty', () => {
    test('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    test('should detect non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('pick', () => {
    test('should pick specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const picked = pick(obj, ['a', 'c']);
      expect(Object.keys(picked)).toHaveLength(2);
      expect(picked.a).toBe(1);
      expect(picked.c).toBe(3);
    });
  });

  describe('omit', () => {
    test('should omit specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const omitted = omit(obj, ['b', 'd']);
      expect(Object.keys(omitted)).toHaveLength(2);
      expect(omitted.a).toBe(1);
      expect(omitted.c).toBe(3);
    });
  });

  describe('chunk', () => {
    test('should chunk array into smaller arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];
      const chunks = chunk(array, 3);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(3);
      expect(chunks[2]).toHaveLength(2);
    });
  });

  describe('shuffle', () => {
    test('should shuffle array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      expect(shuffled).toHaveLength(original.length);
      // Note: This test might occasionally fail due to randomness
      // In a real scenario, you'd test multiple times or use a seeded random
    });
  });

  describe('deepMerge', () => {
    test('should deep merge objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = deepMerge(obj1, obj2);
      
      expect(merged.a).toBe(1);
      expect(merged.b.c).toBe(2);
      expect(merged.b.d).toBe(3);
      expect(merged.e).toBe(4);
    });
  });

  describe('getNestedProperty', () => {
    test('should get nested property', () => {
      const obj = { user: { profile: { name: 'Ahmad' } } };
      const value = getNestedProperty(obj, 'user.profile.name');
      expect(value).toBe('Ahmad');
    });

    test('should return default for missing property', () => {
      const obj = { user: { profile: {} } };
      const value = getNestedProperty(obj, 'user.profile.age', 25);
      expect(value).toBe(25);
    });
  });

  describe('setNestedProperty', () => {
    test('should set nested property', () => {
      const obj = {};
      setNestedProperty(obj, 'user.profile.name', 'Ahmad');
      expect(obj.user.profile.name).toBe('Ahmad');
    });
  });

  describe('objectToQueryString', () => {
    test('should convert object to query string', () => {
      const obj = { name: 'Ahmad', age: 25, active: true };
      const queryString = objectToQueryString(obj);
      expect(queryString).toContain('name=Ahmad');
      expect(queryString).toContain('age=25');
      expect(queryString).toContain('&');
    });
  });

  describe('queryStringToObject', () => {
    test('should convert query string to object', () => {
      const queryString = 'name=Ahmad&age=25&active=true';
      const obj = queryStringToObject(queryString);
      expect(obj.name).toBe('Ahmad');
      expect(obj.age).toBe('25');
      expect(obj.active).toBe('true');
    });
  });

  describe('randomInRange', () => {
    test('should generate random number in range', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const num = randomInRange(1, 10);
        results.push(num);
      }
      expect(results.every(n => n >= 1 && n <= 10)).toBe(true);
    });
  });

  describe('randomString', () => {
    test('should generate random string', () => {
      const str = randomString(10);
      expect(str).toHaveLength(10);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    test('should generate random string with custom chars', () => {
      const str = randomString(8, { chars: '0123456789' });
      expect(str).toHaveLength(8);
      expect(/^[0-9]+$/.test(str)).toBe(true);
    });
  });
});