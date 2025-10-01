/**
 * Cache Middleware
 * 
 * Purpose:
 * - Automatically cache frequently accessed data
 * - Reduce database queries
 * - Improve response time
 * - Cache user data, settings, and sections
 * 
 * @module cache.middleware
 */

const cacheService = require('../services/cache.service');
const Logger = require('../utils/logger.util');

/**
 * Cache user data middleware
 * Caches user information for quick access
 */
async function cacheUserMiddleware(ctx, next) {
  const userId = ctx.from?.id;
  
  if (!userId) {
    return await next();
  }
  
  try {
    // Try to get user from cache
    const cachedUser = cacheService.get('USERS', userId.toString());
    
    if (cachedUser) {
      // Cache hit - attach to context
      ctx.user = cachedUser;
      Logger.debug(`User loaded from cache: ${userId}`);
    } else {
      // Cache miss - will be loaded from database by other middleware
      Logger.debug(`User not in cache: ${userId}`);
    }
    
    await next();
    
  } catch (error) {
    Logger.error('Error in cache user middleware', {
      userId,
      error: error.message
    });
    await next();
  }
}

/**
 * Update user cache after database changes
 * @param {number} userId - User ID
 * @param {Object} userData - User data to cache
 */
function updateUserCache(userId, userData) {
  try {
    cacheService.set('USERS', userId.toString(), userData);
    Logger.debug(`User cache updated: ${userId}`);
  } catch (error) {
    Logger.error('Failed to update user cache', {
      userId,
      error: error.message
    });
  }
}

/**
 * Invalidate user cache
 * Call this after updating user in database
 * @param {number} userId - User ID
 */
function invalidateUserCache(userId) {
  try {
    cacheService.delete('USERS', userId.toString());
    Logger.debug(`User cache invalidated: ${userId}`);
  } catch (error) {
    Logger.error('Failed to invalidate user cache', {
      userId,
      error: error.message
    });
  }
}

/**
 * Cache sections data
 * Sections rarely change, so cache them longer
 */
async function cacheSectionsMiddleware(ctx, next) {
  try {
    // Try to get sections from cache
    const cachedSections = cacheService.get('SECTIONS', 'all');
    
    if (cachedSections) {
      // Cache hit
      ctx.sections = cachedSections;
      Logger.debug('Sections loaded from cache');
    }
    
    await next();
    
  } catch (error) {
    Logger.error('Error in cache sections middleware', {
      error: error.message
    });
    await next();
  }
}

/**
 * Update sections cache
 * @param {Object} sections - Sections data
 */
function updateSectionsCache(sections) {
  try {
    cacheService.set('SECTIONS', 'all', sections);
    Logger.debug('Sections cache updated');
  } catch (error) {
    Logger.error('Failed to update sections cache', {
      error: error.message
    });
  }
}

/**
 * Invalidate sections cache
 * Call this after modifying sections
 */
function invalidateSectionsCache() {
  try {
    cacheService.delete('SECTIONS', 'all');
    Logger.debug('Sections cache invalidated');
  } catch (error) {
    Logger.error('Failed to invalidate sections cache', {
      error: error.message
    });
  }
}

/**
 * Cache settings data
 * Settings change rarely
 */
function cacheSettings(key, value) {
  try {
    // Settings never expire (TTL = 0)
    cacheService.set('SETTINGS', key, value);
    Logger.debug(`Setting cached: ${key}`);
  } catch (error) {
    Logger.error('Failed to cache setting', {
      key,
      error: error.message
    });
  }
}

/**
 * Get setting from cache
 * @param {string} key - Setting key
 * @returns {*} Setting value or undefined
 */
function getCachedSetting(key) {
  try {
    return cacheService.get('SETTINGS', key);
  } catch (error) {
    Logger.error('Failed to get cached setting', {
      key,
      error: error.message
    });
    return undefined;
  }
}

/**
 * Invalidate setting cache
 * @param {string} key - Setting key
 */
function invalidateSettingCache(key) {
  try {
    cacheService.delete('SETTINGS', key);
    Logger.debug(`Setting cache invalidated: ${key}`);
  } catch (error) {
    Logger.error('Failed to invalidate setting cache', {
      key,
      error: error.message
    });
  }
}

/**
 * Cache conversation state
 * For workflow management
 * @param {number} userId - User ID
 * @param {Object} state - Conversation state
 */
function cacheConversationState(userId, state) {
  try {
    // Short TTL for conversation states (15 minutes)
    cacheService.set('CONVERSATIONS', userId.toString(), state);
    Logger.debug(`Conversation state cached: ${userId}`);
  } catch (error) {
    Logger.error('Failed to cache conversation state', {
      userId,
      error: error.message
    });
  }
}

/**
 * Get conversation state from cache
 * @param {number} userId - User ID
 * @returns {Object} Conversation state or undefined
 */
function getConversationState(userId) {
  try {
    return cacheService.get('CONVERSATIONS', userId.toString());
  } catch (error) {
    Logger.error('Failed to get conversation state', {
      userId,
      error: error.message
    });
    return undefined;
  }
}

/**
 * Clear conversation state
 * @param {number} userId - User ID
 */
function clearConversationState(userId) {
  try {
    cacheService.delete('CONVERSATIONS', userId.toString());
    Logger.debug(`Conversation state cleared: ${userId}`);
  } catch (error) {
    Logger.error('Failed to clear conversation state', {
      userId,
      error: error.message
    });
  }
}

/**
 * Generic cache wrapper for database queries
 * @param {string} type - Cache type
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} [ttl] - Optional TTL override
 * @returns {Promise<*>} Cached or fetched data
 */
async function cacheWrapper(type, key, fetchFunction, ttl = null) {
  try {
    // Try cache first
    const cached = cacheService.get(type, key);
    
    if (cached !== undefined) {
      Logger.debug(`Cache hit: ${type}:${key}`);
      return cached;
    }
    
    // Cache miss - fetch data
    Logger.debug(`Cache miss: ${type}:${key} - fetching...`);
    const data = await fetchFunction();
    
    // Store in cache
    if (data !== undefined && data !== null) {
      cacheService.set(type, key, data, ttl);
    }
    
    return data;
    
  } catch (error) {
    Logger.error(`Cache wrapper error: ${type}:${key}`, {
      error: error.message
    });
    
    // On error, try to fetch directly
    try {
      return await fetchFunction();
    } catch (fetchError) {
      Logger.error('Fetch function also failed', {
        error: fetchError.message
      });
      throw fetchError;
    }
  }
}

/**
 * Get cache statistics
 * For monitoring and debugging
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  try {
    return cacheService.getAllStats();
  } catch (error) {
    Logger.error('Failed to get cache stats', {
      error: error.message
    });
    return null;
  }
}

/**
 * Clear all caches
 * Use with caution!
 */
function clearAllCaches() {
  try {
    cacheService.flushAll();
    Logger.warn('All caches cleared');
  } catch (error) {
    Logger.error('Failed to clear all caches', {
      error: error.message
    });
  }
}

/**
 * Clear specific cache type
 * @param {string} type - Cache type to clear
 */
function clearCache(type) {
  try {
    cacheService.flush(type);
    Logger.info(`Cache cleared: ${type}`);
  } catch (error) {
    Logger.error(`Failed to clear cache: ${type}`, {
      error: error.message
    });
  }
}

module.exports = {
  // Middleware
  cacheUserMiddleware,
  cacheSectionsMiddleware,
  
  // User cache
  updateUserCache,
  invalidateUserCache,
  
  // Sections cache
  updateSectionsCache,
  invalidateSectionsCache,
  
  // Settings cache
  cacheSettings,
  getCachedSetting,
  invalidateSettingCache,
  
  // Conversation state
  cacheConversationState,
  getConversationState,
  clearConversationState,
  
  // Utilities
  cacheWrapper,
  getCacheStats,
  clearAllCaches,
  clearCache
};
