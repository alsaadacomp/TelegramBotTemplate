/**
 * Cache Service
 * 
 * Advanced caching system using node-cache
 * 
 * Features:
 * - In-memory caching with TTL
 * - Multiple cache types (Users, Sections, Settings, Conversations)
 * - Automatic cleanup of expired entries
 * - Cache statistics and monitoring
 * - Batch operations support
 * 
 * @module cache.service
 */

const NodeCache = require('node-cache');
const CACHE_CONFIG = require('../../config/cache.config');
const Logger = require('../utils/logger.util');

/**
 * Cache Service Class
 */
class CacheService {
  constructor() {
    // Initialize cache instances
    this.caches = {};
    
    // Create cache for each type defined in strategies
    Object.keys(CACHE_CONFIG.strategies).forEach(type => {
      const strategy = CACHE_CONFIG.strategies[type];
      this.caches[type] = new NodeCache({
        stdTTL: strategy.ttl || CACHE_CONFIG.defaultTTL,
        checkperiod: CACHE_CONFIG.checkPeriod,
        useClones: CACHE_CONFIG.useClones !== false,
        deleteOnExpire: CACHE_CONFIG.deleteOnExpire !== false,
        maxKeys: strategy.maxSize || CACHE_CONFIG.maxKeys
      });
      
      // Listen to events
      this._setupEventListeners(type);
    });
    
    // Add a default cache for general use
    this.caches.default = new NodeCache({
      stdTTL: CACHE_CONFIG.defaultTTL,
      checkperiod: CACHE_CONFIG.checkPeriod,
      useClones: CACHE_CONFIG.useClones,
      deleteOnExpire: CACHE_CONFIG.deleteOnExpire
    });
    this._setupEventListeners('default');
    
    Logger.system('info', 'Cache service initialized', {
      types: Object.keys(this.caches),
      totalCaches: Object.keys(this.caches).length,
      defaultTTL: CACHE_CONFIG.defaultTTL
    });
  }
  
  /**
   * Setup event listeners for a cache instance
   * @param {string} type - Cache type
   * @private
   */
  _setupEventListeners(type) {
    const cache = this.caches[type];
    
    // Log when key expires
    cache.on('expired', (key, value) => {
      if (CACHE_CONFIG.debug.enabled) {
        Logger.debug(`Cache key expired: ${type}:${key}`);
      }
    });
    
    // Log errors
    cache.on('error', (error) => {
      Logger.error(`Cache error in ${type}`, { error: error.message });
    });
  }
  
  /**
   * Get cache instance by type
   * @param {string} type - Cache type (users, sections, etc.)
   * @returns {NodeCache} Cache instance
   * @private
   */
  _getCache(type) {
    const cache = this.caches[type] || this.caches.default;
    if (!cache) {
      Logger.warn(`Cache type "${type}" not found, using default cache`);
      return this.caches.default;
    }
    return cache;
  }
  
  /**
   * Build cache key with prefix
   * @param {string} type - Cache type
   * @param {string} key - Key
   * @returns {string} Full cache key
   * @private
   */
  _buildKey(type, key) {
    const prefix = CACHE_CONFIG.getPrefix(type);
    return `${prefix}:${key}`;
  }
  
  // ========================================
  // Basic Operations
  // ========================================
  
  /**
   * Set a value in cache
   * @param {string} type - Cache type
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Optional TTL override (seconds)
   * @returns {boolean} Success status
   */
  set(type, key, value, ttl = null) {
    try {
      const cache = this._getCache(type);
      const cacheKey = this._buildKey(type, key);
      const useTTL = ttl !== null ? ttl : CACHE_CONFIG.getTTL(type);
      
      const success = cache.set(cacheKey, value, useTTL);
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache SET: ${cacheKey}`, { ttl: useTTL, success });
      }
      
      return success;
    } catch (error) {
      Logger.error('Cache set error', { type, key, error: error.message });
      return false;
    }
  }
  
  /**
   * Get a value from cache
   * @param {string} type - Cache type
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(type, key) {
    try {
      const cache = this._getCache(type);
      const cacheKey = this._buildKey(type, key);
      const value = cache.get(cacheKey);
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache GET: ${cacheKey}`, { hit: value !== undefined });
      }
      
      return value;
    } catch (error) {
      Logger.error('Cache get error', { type, key, error: error.message });
      return undefined;
    }
  }
  
  /**
   * Delete a key from cache
   * @param {string} type - Cache type
   * @param {string} key - Cache key
   * @returns {number} Number of deleted entries
   */
  delete(type, key) {
    try {
      const cache = this._getCache(type);
      const cacheKey = this._buildKey(type, key);
      const deleted = cache.del(cacheKey);
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache DELETE: ${cacheKey}`, { deleted });
      }
      
      return deleted;
    } catch (error) {
      Logger.error('Cache delete error', { type, key, error: error.message });
      return 0;
    }
  }
  
  /**
   * Check if key exists in cache
   * @param {string} type - Cache type
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(type, key) {
    try {
      const cache = this._getCache(type);
      const cacheKey = this._buildKey(type, key);
      return cache.has(cacheKey);
    } catch (error) {
      Logger.error('Cache has error', { type, key, error: error.message });
      return false;
    }
  }
  
  /**
   * Get TTL of a key
   * @param {string} type - Cache type
   * @param {string} key - Cache key
   * @returns {number|undefined} TTL in seconds or undefined if not found
   */
  getTTL(type, key) {
    try {
      const cache = this._getCache(type);
      const cacheKey = this._buildKey(type, key);
      return cache.getTtl(cacheKey);
    } catch (error) {
      Logger.error('Cache getTTL error', { type, key, error: error.message });
      return undefined;
    }
  }
  
  // ========================================
  // Batch Operations
  // ========================================
  
  /**
   * Set multiple values at once
   * @param {string} type - Cache type
   * @param {Array<{key: string, value: *, ttl?: number}>} items - Items to cache
   * @returns {boolean} Success status
   */
  mset(type, items) {
    try {
      const cache = this._getCache(type);
      const cacheItems = items.map(item => ({
        key: this._buildKey(type, item.key),
        val: item.value,
        ttl: item.ttl !== undefined ? item.ttl : CACHE_CONFIG.getTTL(type)
      }));
      
      const success = cache.mset(cacheItems);
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache MSET`, { type, count: items.length, success });
      }
      
      return success;
    } catch (error) {
      Logger.error('Cache mset error', { type, error: error.message });
      return false;
    }
  }
  
  /**
   * Get multiple values at once
   * @param {string} type - Cache type
   * @param {string[]} keys - Keys to get
   * @returns {Object} Object with key-value pairs
   */
  mget(type, keys) {
    try {
      const cache = this._getCache(type);
      const cacheKeys = keys.map(key => this._buildKey(type, key));
      const values = cache.mget(cacheKeys);
      
      // Convert back to original keys
      const result = {};
      keys.forEach((key, index) => {
        const cacheKey = cacheKeys[index];
        if (values[cacheKey] !== undefined) {
          result[key] = values[cacheKey];
        }
      });
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache MGET`, { type, requested: keys.length, found: Object.keys(result).length });
      }
      
      return result;
    } catch (error) {
      Logger.error('Cache mget error', { type, error: error.message });
      return {};
    }
  }
  
  /**
   * Delete multiple keys at once
   * @param {string} type - Cache type
   * @param {string[]} keys - Keys to delete
   * @returns {number} Number of deleted entries
   */
  mdel(type, keys) {
    try {
      const cache = this._getCache(type);
      const cacheKeys = keys.map(key => this._buildKey(type, key));
      const deleted = cache.del(cacheKeys);
      
      if (CACHE_CONFIG.debug.logOperations) {
        Logger.debug(`Cache MDEL`, { type, requested: keys.length, deleted });
      }
      
      return deleted;
    } catch (error) {
      Logger.error('Cache mdel error', { type, error: error.message });
      return 0;
    }
  }
  
  // ========================================
  // Cleanup & Management
  // ========================================
  
  /**
   * Clear all keys in a specific cache type
   * @param {string} type - Cache type to clear
   */
  clear(type) {
    try {
      const cache = this._getCache(type);
      cache.flushAll();
      
      Logger.info(`Cache cleared: ${type}`);
    } catch (error) {
      Logger.error('Cache clear error', { type, error: error.message });
    }
  }
  
  /**
   * Clear all caches
   */
  clearAll() {
    try {
      Object.keys(this.caches).forEach(type => {
        this.caches[type].flushAll();
      });
      
      Logger.info('All caches cleared');
    } catch (error) {
      Logger.error('Cache clearAll error', { error: error.message });
    }
  }
  
  /**
   * Delete expired keys manually
   * @param {string} [type] - Optional specific cache type
   */
  cleanup(type = null) {
    try {
      if (type) {
        const cache = this._getCache(type);
        const keys = cache.keys();
        let deleted = 0;
        
        keys.forEach(key => {
          const ttl = cache.getTtl(key);
          if (ttl !== undefined && ttl < Date.now()) {
            cache.del(key);
            deleted++;
          }
        });
        
        Logger.info(`Cache cleanup: ${type}`, { deleted });
      } else {
        Object.keys(this.caches).forEach(cacheType => {
          this.cleanup(cacheType);
        });
      }
    } catch (error) {
      Logger.error('Cache cleanup error', { type, error: error.message });
    }
  }
  
  // ========================================
  // Statistics & Monitoring
  // ========================================
  
  /**
   * Get statistics for a specific cache type
   * @param {string} type - Cache type
   * @returns {Object} Statistics object
   */
  getStats(type) {
    try {
      const cache = this._getCache(type);
      const stats = cache.getStats();
      
      return {
        type,
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) : 0,
        ksize: stats.ksize,
        vsize: stats.vsize
      };
    } catch (error) {
      Logger.error('Cache getStats error', { type, error: error.message });
      return {};
    }
  }
  
  /**
   * Get statistics for all caches
   * @returns {Object} Statistics object with all cache types
   */
  getAllStats() {
    try {
      const stats = {};
      Object.keys(this.caches).forEach(type => {
        stats[type] = this.getStats(type);
      });
      return stats;
    } catch (error) {
      Logger.error('Cache getAllStats error', { error: error.message });
      return {};
    }
  }
  
  /**
   * Get all keys in a cache type
   * @param {string} type - Cache type
   * @returns {string[]} Array of keys
   */
  keys(type) {
    try {
      const cache = this._getCache(type);
      const allKeys = cache.keys();
      
      // Remove prefix from keys
      const prefix = CACHE_CONFIG.getPrefix(type);
      return allKeys.map(key => key.replace(`${prefix}:`, ''));
    } catch (error) {
      Logger.error('Cache keys error', { type, error: error.message });
      return [];
    }
  }
  
  /**
   * Get number of keys in a cache type
   * @param {string} type - Cache type
   * @returns {number}
   */
  count(type) {
    try {
      const cache = this._getCache(type);
      return cache.keys().length;
    } catch (error) {
      Logger.error('Cache count error', { type, error: error.message });
      return 0;
    }
  }
  
  // ========================================
  // Helper Methods for Common Operations
  // ========================================
  
  /**
   * Cache a user by telegram_id
   * @param {number} telegramId - Telegram user ID
   * @param {Object} userData - User data
   * @param {number} [ttl] - Optional TTL
   * @returns {boolean}
   */
  cacheUser(telegramId, userData, ttl = null) {
    return this.set('users', telegramId.toString(), userData, ttl);
  }
  
  /**
   * Get cached user by telegram_id
   * @param {number} telegramId - Telegram user ID
   * @returns {Object|undefined}
   */
  getUser(telegramId) {
    return this.get('users', telegramId.toString());
  }
  
  /**
   * Delete cached user
   * @param {number} telegramId - Telegram user ID
   * @returns {number}
   */
  deleteUser(telegramId) {
    return this.delete('users', telegramId.toString());
  }
  
  /**
   * Cache a section
   * @param {string} sectionId - Section ID
   * @param {Object} sectionData - Section data
   * @param {number} [ttl] - Optional TTL
   * @returns {boolean}
   */
  cacheSection(sectionId, sectionData, ttl = null) {
    return this.set('sections', sectionId, sectionData, ttl);
  }
  
  /**
   * Get cached section
   * @param {string} sectionId - Section ID
   * @returns {Object|undefined}
   */
  getSection(sectionId) {
    return this.get('sections', sectionId);
  }
  
  /**
   * Cache a workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} workflowData - Workflow data
   * @param {number} [ttl] - Optional TTL
   * @returns {boolean}
   */
  cacheWorkflow(workflowId, workflowData, ttl = null) {
    return this.set('workflows', workflowId, workflowData, ttl);
  }
  
  /**
   * Get cached workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Object|undefined}
   */
  getWorkflow(workflowId) {
    return this.get('workflows', workflowId);
  }
  
  /**
   * Cache conversation state
   * @param {number} userId - User ID
   * @param {Object} state - Conversation state
   * @param {number} [ttl] - Optional TTL
   * @returns {boolean}
   */
  cacheConversation(userId, state, ttl = null) {
    return this.set('conversations', userId.toString(), state, ttl);
  }
  
  /**
   * Get conversation state
   * @param {number} userId - User ID
   * @returns {Object|undefined}
   */
  getConversation(userId) {
    return this.get('conversations', userId.toString());
  }
  
  /**
   * Delete conversation state
   * @param {number} userId - User ID
   * @returns {number}
   */
  deleteConversation(userId) {
    return this.delete('conversations', userId.toString());
  }
  
  /**
   * Cache a setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {boolean}
   */
  cacheSetting(key, value) {
    // Settings don't expire (TTL = 0)
    return this.set('settings', key, value, 0);
  }
  
  /**
   * Get cached setting
   * @param {string} key - Setting key
   * @returns {*}
   */
  getSetting(key) {
    return this.get('settings', key);
  }
  
  // ========================================
  // Utility Methods
  // ========================================
  
  /**
   * Get cache health status
   * @returns {Object}
   */
  getHealth() {
    try {
      const allStats = this.getAllStats();
      let totalKeys = 0;
      let totalHits = 0;
      let totalMisses = 0;
      
      Object.values(allStats).forEach(stats => {
        totalKeys += stats.keys || 0;
        totalHits += stats.hits || 0;
        totalMisses += stats.misses || 0;
      });
      
      return {
        healthy: true,
        totalCaches: Object.keys(this.caches).length,
        totalKeys,
        totalHits,
        totalMisses,
        overallHitRate: totalHits > 0 ? (totalHits / (totalHits + totalMisses) * 100).toFixed(2) : 0,
        caches: allStats
      };
    } catch (error) {
      Logger.error('Cache health check error', { error: error.message });
      return {
        healthy: false,
        error: error.message
      };
    }
  }
  
  /**
   * Print cache statistics to console
   */
  printStats() {
    const health = this.getHealth();
    
    console.log('\n====================================');
    console.log('📊 CACHE STATISTICS');
    console.log('====================================');
    console.log(`Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`Total Caches: ${health.totalCaches}`);
    console.log(`Total Keys: ${health.totalKeys}`);
    console.log(`Overall Hit Rate: ${health.overallHitRate}%`);
    console.log('------------------------------------');
    
    Object.entries(health.caches).forEach(([type, stats]) => {
      console.log(`\n${type}:`);
      console.log(`  Keys: ${stats.keys}`);
      console.log(`  Hits: ${stats.hits}`);
      console.log(`  Misses: ${stats.misses}`);
      console.log(`  Hit Rate: ${stats.hitRate}%`);
    });
    
    console.log('\n====================================\n');
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Export singleton
module.exports = cacheService;
