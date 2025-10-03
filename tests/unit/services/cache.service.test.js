const cacheService = require('../../../src/services/cache.service');

describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clearAll();
  });

  describe('Basic Operations', () => {
    test('should set and get value', () => {
      cacheService.set('test', 'key1', 'value1');
      const result = cacheService.get('test', 'key1');
      expect(result).toBe('value1');
    });

    test('should return undefined for missing key', () => {
      const result = cacheService.get('test', 'missing');
      expect(result).toBeUndefined();
    });

    test('should delete key', () => {
      cacheService.set('test', 'key1', 'value1');
      cacheService.delete('test', 'key1');
      const result = cacheService.get('test', 'key1');
      expect(result).toBeUndefined();
    });

    test('should check if key exists', () => {
      cacheService.set('test', 'key1', 'value1');
      expect(cacheService.has('test', 'key1')).toBe(true);
      expect(cacheService.has('test', 'missing')).toBe(false);
    });

    test('should set TTL for key', () => {
      cacheService.set('test', 'key1', 'value1', 5);
      const ttl = cacheService.getTTL('test', 'key1');
      expect(ttl).toBeGreaterThan(Date.now());
    });

    test('should handle multiple set/get operations', () => {
      cacheService.mset('test', [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' }
      ]);
      
      const results = cacheService.mget('test', ['key1', 'key2', 'key3']);
      expect(results.key1).toBe('value1');
      expect(results.key2).toBe('value2');
      expect(results.key3).toBe('value3');
    });

    test('should delete multiple keys', () => {
      cacheService.set('test', 'key1', 'value1');
      cacheService.set('test', 'key2', 'value2');
      cacheService.set('test', 'key3', 'value3');
      
      const deletedCount = cacheService.mdel('test', ['key1', 'key2']);
      expect(deletedCount).toBe(2);
      expect(cacheService.get('test', 'key1')).toBeUndefined();
      expect(cacheService.get('test', 'key2')).toBeUndefined();
      expect(cacheService.get('test', 'key3')).toBe('value3');
    });
  });

  describe('User Cache Operations', () => {
    test('should cache user data', () => {
      const userData = {
        telegram_id: 123456789,
        username: 'testuser',
        first_name: 'محمد',
        role: 'user'
      };
      
      cacheService.cacheUser(123456789, userData);
      const cachedUser = cacheService.getUser(123456789);
      
      expect(cachedUser).toEqual(userData);
    });

    test('should delete user from cache', () => {
      const userData = {
        telegram_id: 123456789,
        username: 'testuser',
        first_name: 'محمد',
        role: 'user'
      };
      
      cacheService.cacheUser(123456789, userData);
      cacheService.deleteUser(123456789);
      const cachedUser = cacheService.getUser(123456789);
      
      expect(cachedUser).toBeUndefined();
    });
  });

  describe('Section Cache Operations', () => {
    test('should cache section data', () => {
      const sectionData = {
        id: 'sales',
        name: 'المبيعات',
        icon: '📊',
        enabled: true
      };
      
      cacheService.cacheSection('sales', sectionData);
      const cachedSection = cacheService.getSection('sales');
      
      expect(cachedSection).toEqual(sectionData);
    });
  });

  describe('Workflow Cache Operations', () => {
    test('should cache workflow data', () => {
      const workflowData = {
        id: 'add_customer',
        name: 'إضافة عميل',
        steps: ['name', 'phone', 'type']
      };
      
      cacheService.cacheWorkflow('add_customer', workflowData);
      const cachedWorkflow = cacheService.getWorkflow('add_customer');
      
      expect(cachedWorkflow).toEqual(workflowData);
    });
  });

  describe('Conversation State Operations', () => {
    test('should cache conversation state', () => {
      const conversationState = {
        workflow: 'add_customer',
        step: 'enter_phone',
        data: { name: 'أحمد محمد' }
      };
      
      cacheService.cacheConversation(77777, conversationState);
      const cachedState = cacheService.getConversation(77777);
      
      expect(cachedState).toEqual(conversationState);
    });

    test('should delete conversation state', () => {
      const conversationState = {
        workflow: 'add_customer',
        step: 'enter_phone',
        data: { name: 'أحمد محمد' }
      };
      
      cacheService.cacheConversation(77777, conversationState);
      cacheService.deleteConversation(77777);
      const cachedState = cacheService.getConversation(77777);
      
      expect(cachedState).toBeUndefined();
    });
  });

  describe('Settings Cache Operations', () => {
    test('should cache settings', () => {
      cacheService.cacheSetting('bot_name', 'السعادة بوت');
      cacheService.cacheSetting('max_users', 1000);
      cacheService.cacheSetting('maintenance_mode', false);
      
      expect(cacheService.getSetting('bot_name')).toBe('السعادة بوت');
      expect(cacheService.getSetting('max_users')).toBe(1000);
      expect(cacheService.getSetting('maintenance_mode')).toBe(false);
    });
  });

  describe('Cache Management', () => {
    test('should get all keys for a cache type', () => {
      cacheService.set('users', 'key1', 'value1');
      cacheService.set('users', 'key2', 'value2');
      cacheService.set('users', 'key3', 'value3');
      
      const keys = cacheService.keys('users');
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    test('should count keys in cache type', () => {
      cacheService.set('users', 'key1', 'value1');
      cacheService.set('users', 'key2', 'value2');
      
      expect(cacheService.count('users')).toBe(2);
    });

    test('should clear specific cache type', () => {
      cacheService.set('users', 'key1', 'value1');
      cacheService.set('users', 'key2', 'value2');
      cacheService.set('sections', 'key1', 'value1');
      
      cacheService.clear('users');
      
      expect(cacheService.count('users')).toBe(0);
      expect(cacheService.count('sections')).toBe(1);
    });

    test('should clear all caches', () => {
      cacheService.set('users', 'key1', 'value1');
      cacheService.set('sections', 'key1', 'value1');
      cacheService.set('workflows', 'key1', 'value1');
      
      cacheService.clearAll();
      
      expect(cacheService.count('users')).toBe(0);
      expect(cacheService.count('sections')).toBe(0);
      expect(cacheService.count('workflows')).toBe(0);
    });
  });

  describe('Cache Statistics', () => {
    test('should get cache statistics', () => {
      cacheService.set('users', 'key1', 'value1');
      cacheService.get('users', 'key1'); // hit
      cacheService.get('users', 'missing'); // miss
      
      const stats = cacheService.getAllStats();
      expect(stats.users).toBeDefined();
      expect(stats.users.keys).toBe(1);
      expect(stats.users.hits).toBe(1);
      expect(stats.users.misses).toBe(1);
    });

    test('should get cache health', () => {
      const health = cacheService.getHealth();
      expect(health.healthy).toBe(true);
      expect(typeof health.totalCaches).toBe('number');
      expect(typeof health.totalKeys).toBe('number');
      expect(typeof health.overallHitRate).toBe('number');
    });
  });

  describe('TTL and Expiration', () => {
    test('should handle TTL expiration', (done) => {
      cacheService.set('test', 'temp', 'value', 1); // 1 second TTL
      
      setTimeout(() => {
        const result = cacheService.get('test', 'temp');
        expect(result).toBeUndefined();
        done();
      }, 1500);
    });

    test('should cleanup expired entries', () => {
      cacheService.set('test', 'temp1', 'value1', 1);
      cacheService.set('test', 'temp2', 'value2', 1);
      
      // Manual cleanup
      cacheService.cleanup('test');
      
      // Should still exist before expiration
      expect(cacheService.get('test', 'temp1')).toBe('value1');
      expect(cacheService.get('test', 'temp2')).toBe('value2');
    });
  });
});
