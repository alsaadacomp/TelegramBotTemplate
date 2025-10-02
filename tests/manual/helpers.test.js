const helpers = require('../../src/utils/helpers.util');

// Helpers Utility Tests
describe('Helpers Utility', () => {

  // ID Generation Tests
  describe('ID Generation', () => {
    test('should generate a unique ID', () => {
      const id1 = helpers.generateId();
      const id2 = helpers.generateId();
      expect(id1).not.toBe(id2);
    });

    test('should generate an ID with a prefix', () => {
      const id = helpers.generateId('user');
      expect(id).startsWith('user_');
    });
  });

  // Sleep/Delay Tests
  describe('Sleep Function', () => {
    test('should pause execution for the specified duration', async () => {
      const start = Date.now();
      await helpers.sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  // Retry Tests
  describe('Retry Function', () => {
    test('should return the result on the first try if successful', async () => {
      const successfulFn = jest.fn().mockResolvedValue('success');
      const result = await helpers.retry(successfulFn, { times: 3, delay: 10 });
      expect(result).toBe('success');
      expect(successfulFn).toHaveBeenCalledTimes(1);
    });

    test('should retry until the function succeeds', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      };
      const result = await helpers.retry(failingFn, { times: 5, delay: 10 });
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    test('should throw an error after all retries fail', async () => {
      const alwaysFailingFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      await expect(helpers.retry(alwaysFailingFn, { times: 3, delay: 10 })).rejects.toThrow('Always fails');
      expect(alwaysFailingFn).toHaveBeenCalledTimes(3);
    });
  });

  // Deep Clone Tests
  describe('Deep Clone', () => {
    test('should create an independent clone of a nested object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = helpers.deepClone(original);
      cloned.b.c = 999;
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(999);
    });
  });

  // Array Manipulation Tests
  describe('Array Manipulation', () => {
    test('should split an array into chunks of a specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = helpers.chunk(array, 3);
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });
  });

  // Nested Property Tests
  describe('Nested Properties', () => {
    const obj = { user: { profile: { name: 'Ahmad' } } };
    
    test('should get a nested property value', () => {
      const value = helpers.getNestedProperty(obj, 'user.profile.name');
      expect(value).toBe('Ahmad');
    });

    test('should return a default value for a missing nested property', () => {
      const value = helpers.getNestedProperty(obj, 'user.profile.age', 25);
      expect(value).toBe(25);
    });

    test('should set a nested property value', () => {
      const newObj = {};
      helpers.setNestedProperty(newObj, 'user.profile.name', 'Saleh');
      expect(newObj.user.profile.name).toBe('Saleh');
    });
  });
});