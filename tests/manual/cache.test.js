/**
 * ===================================
 * Test Suite for Cache Service
 * ===================================
 * @test-suite services/cache
 */

const cacheService = require('../../src/services/cache.service');

// `describe` لتجميع الاختبارات المتعلقة بخدمة الكاش
describe('Cache Service', () => {

  // يتم استدعاء هذه الدالة قبل كل اختبار لضمان بيئة نظيفة
  beforeEach(() => {
    cacheService.clearAll();
  });

  test('should set and get a value correctly', () => {
    const userData = { name: 'Ahmad', role: 'admin' };
    cacheService.set('users', '12345', userData);
    const retrievedUser = cacheService.get('users', '12345');
    
    // التحقق من أن القيمة التي تم استرجاعها هي نفسها التي تم تخزينها
    expect(retrievedUser).toEqual(userData);
  });

  test('should return undefined for a cache miss', () => {
    const missingUser = cacheService.get('users', '99999');
    expect(missingUser).toBeUndefined();
  });

  test('should check for a key with has() and delete it', () => {
    cacheService.set('users', '12345', { name: 'test' });
    
    expect(cacheService.has('users', '12345')).toBe(true);
    cacheService.delete('users', '12345');
    expect(cacheService.has('users', '12345')).toBe(false);
  });

  test('should expire a key after its TTL', async () => {
    // jest.useFakeTimers() تسمح لنا بالتحكم في الوقت
    jest.useFakeTimers();
    
    cacheService.set('temp', 'key', 'value', 2); // TTL ثانيتين
    
    // التقدم بالوقت 2.5 ثانية
    jest.advanceTimersByTime(2500);
    
    const value = cacheService.get('temp', 'key');
    expect(value).toBeUndefined();

    // استعادة التحكم في الوقت
    jest.useRealTimers();
  });

  test('should handle multiple set and get operations (mset/mget)', () => {
    const users = [
      { key: '1001', value: { name: 'User 1' } },
      { key: '1002', value: { name: 'User 2' } },
    ];
    cacheService.mset('users', users);
    
    const retrieved = cacheService.mget('users', ['1001', '1002']);
    expect(retrieved['1001'].name).toBe('User 1');
    expect(retrieved['1002'].name).toBe('User 2');
  });

  test('should use helper methods like getUser and cacheUser', () => {
    const userData = { telegram_id: 55555, first_name: 'محمد' };
    cacheService.cacheUser(55555, userData);
    const retrievedUser = cacheService.getUser(55555);
    
    expect(retrievedUser).toEqual(userData);
  });
  
  test('should get cache statistics correctly', () => {
    cacheService.set('users', '1', 'a');
    cacheService.get('users', '1'); // Hit
    cacheService.get('users', '2'); // Miss

    const stats = cacheService.getStats('users');
    expect(stats.keys).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    
    // ✅ تم التعديل: تحويل النص إلى رقم قبل المقارنة
    expect(parseFloat(stats.hitRate)).toBe(50);
  });
});