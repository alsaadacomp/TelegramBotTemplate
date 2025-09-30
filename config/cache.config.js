/**
 * Cache Configuration
 * Multi-level caching system with TTL per data type
 * 
 * @module config/cache.config
 */

require('dotenv').config();

module.exports = {
  // ========================================
  // Global Cache Settings
  // ========================================
  enabled: process.env.CACHE_ENABLED !== 'false',

  // Default TTL (seconds) - 0 means no expiration
  defaultTTL: 3600, // 1 hour

  // Check period for expired keys (seconds)
  checkPeriod: 600, // 10 minutes

  // Max keys in cache (0 = unlimited)
  maxKeys: 10000,

  // Use clone when getting cached data (prevents mutation)
  useClones: true,

  // Delete expired keys on get
  deleteOnExpire: true,

  // ========================================
  // Cache Keys TTL Configuration (seconds)
  // ========================================
  ttl: {
    // User data cache
    users: parseInt(process.env.CACHE_TTL_USERS) || 3600, // 1 hour
    
    // User by telegram_id
    userByTelegramId: parseInt(process.env.CACHE_TTL_USERS) || 3600,
    
    // User permissions
    userPermissions: parseInt(process.env.CACHE_TTL_USERS) || 3600,
    
    // Sections data cache
    sections: parseInt(process.env.CACHE_TTL_SECTIONS) || 7200, // 2 hours
    
    // Section by ID
    sectionById: parseInt(process.env.CACHE_TTL_SECTIONS) || 7200,
    
    // Section tree/hierarchy
    sectionTree: parseInt(process.env.CACHE_TTL_SECTIONS) || 7200,
    
    // Workflows cache
    workflows: parseInt(process.env.CACHE_TTL_SECTIONS) || 7200, // 2 hours
    
    // Workflow by ID
    workflowById: parseInt(process.env.CACHE_TTL_SECTIONS) || 7200,
    
    // Google Sheets data cache
    sheetsData: parseInt(process.env.CACHE_TTL_SHEETS_DATA) || 1800, // 30 minutes
    
    // Sheets range data
    sheetsRange: parseInt(process.env.CACHE_TTL_SHEETS_DATA) || 1800,
    
    // Active conversations cache
    conversations: parseInt(process.env.CACHE_TTL_CONVERSATIONS) || 900, // 15 minutes
    
    // Conversation by user ID
    conversationByUser: parseInt(process.env.CACHE_TTL_CONVERSATIONS) || 900,
    
    // System settings cache (no expiration)
    settings: parseInt(process.env.CACHE_TTL_SETTINGS) || 0, // Never expires
    
    // Rate limit data
    rateLimit: 60, // 1 minute
    
    // Session data
    sessions: 86400, // 24 hours
    
    // Statistics cache
    stats: 1800, // 30 minutes
    
    // Query results cache
    queries: 300, // 5 minutes
    
    // File metadata cache
    files: 3600, // 1 hour
    
    // Temporary data (very short-lived)
    temp: 60, // 1 minute
  },

  // ========================================
  // Cache Key Prefixes
  // ========================================
  prefixes: {
    user: 'user',
    userByTelegramId: 'user:telegram',
    userPermissions: 'user:perms',
    section: 'section',
    sectionTree: 'section:tree',
    workflow: 'workflow',
    sheets: 'sheets',
    sheetsRange: 'sheets:range',
    conversation: 'conv',
    setting: 'setting',
    rateLimit: 'ratelimit',
    session: 'session',
    stats: 'stats',
    query: 'query',
    file: 'file',
    temp: 'temp',
  },

  // ========================================
  // Cache Strategies per Data Type
  // ========================================
  strategies: {
    users: {
      strategy: 'lru', // Least Recently Used
      maxSize: 1000,
      ttl: 3600,
    },

    sections: {
      strategy: 'lfu', // Least Frequently Used
      maxSize: 500,
      ttl: 7200,
    },

    workflows: {
      strategy: 'lfu',
      maxSize: 200,
      ttl: 7200,
    },

    conversations: {
      strategy: 'fifo', // First In First Out
      maxSize: 500,
      ttl: 900,
    },

    sheets: {
      strategy: 'lru',
      maxSize: 100,
      ttl: 1800,
    },

    queries: {
      strategy: 'lru',
      maxSize: 1000,
      ttl: 300,
    },
  },

  // ========================================
  // Cache Invalidation Rules
  // ========================================
  invalidation: {
    // Auto-invalidate on these events
    events: {
      'user.created': ['users', 'stats'],
      'user.updated': ['user:*', 'userPermissions:*', 'stats'],
      'user.deleted': ['user:*', 'users', 'stats'],
      'section.created': ['sections', 'sectionTree', 'stats'],
      'section.updated': ['section:*', 'sections', 'sectionTree'],
      'section.deleted': ['section:*', 'sections', 'sectionTree', 'stats'],
      'workflow.created': ['workflows', 'stats'],
      'workflow.updated': ['workflow:*', 'workflows'],
      'workflow.deleted': ['workflow:*', 'workflows', 'stats'],
      'data.created': ['stats', 'query:*'],
      'data.updated': ['query:*', 'stats'],
      'data.deleted': ['query:*', 'stats'],
      'sheets.synced': ['sheets:*', 'stats'],
      'settings.updated': ['setting:*'],
    },

    // Patterns to invalidate (supports wildcards)
    patterns: {
      clearUser: 'user:*',
      clearSections: 'section:*',
      clearWorkflows: 'workflow:*',
      clearSheets: 'sheets:*',
      clearQueries: 'query:*',
      clearAll: '*',
    },
  },

  // ========================================
  // Performance Settings
  // ========================================
  performance: {
    // Enable cache statistics
    enableStats: true,

    // Log cache hits/misses
    logAccess: process.env.DEBUG === 'true',

    // Warn on slow cache operations (ms)
    slowOperationThreshold: 100,

    // Enable compression for large values (> X bytes)
    compression: {
      enabled: true,
      threshold: 10240, // 10 KB
    },

    // Memory management
    memory: {
      // Max memory usage (bytes) - 0 = unlimited
      maxSize: 104857600, // 100 MB
      
      // Check memory usage interval (ms)
      checkInterval: 60000, // 1 minute
      
      // Auto-clear when memory > X%
      clearThreshold: 90,
    },
  },

  // ========================================
  // Debug Settings
  // ========================================
  debug: {
    // Enable detailed logging
    enabled: process.env.DEBUG === 'true',

    // Log cache operations
    logOperations: process.env.VERBOSE_LOGGING === 'true',

    // Show cache stats periodically
    showStats: process.env.DEBUG === 'true',
    statsInterval: 300000, // 5 minutes
  },

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Generate cache key with prefix
   * @param {string} prefix - Key prefix
   * @param {string|number} id - Item ID
   * @returns {string}
   */
  generateKey(prefix, id) {
    return `${prefix}:${id}`;
  },

  /**
   * Get TTL for a cache type
   * @param {string} type - Cache type
   * @returns {number} TTL in seconds
   */
  getTTL(type) {
    return this.ttl[type] || this.defaultTTL;
  },

  /**
   * Get prefix for a cache type
   * @param {string} type - Cache type
   * @returns {string}
   */
  getPrefix(type) {
    return this.prefixes[type] || type;
  },

  /**
   * Get invalidation pattern for an event
   * @param {string} event - Event name
   * @returns {string[]}
   */
  getInvalidationPatterns(event) {
    return this.invalidation.events[event] || [];
  },

  /**
   * Check if caching is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  },

  /**
   * Get strategy for a data type
   * @param {string} type - Data type
   * @returns {Object}
   */
  getStrategy(type) {
    return this.strategies[type] || {
      strategy: 'lru',
      maxSize: 1000,
      ttl: this.defaultTTL,
    };
  },

  /**
   * Get cache configuration summary
   * @returns {Object}
   */
  getSummary() {
    return {
      enabled: this.enabled,
      defaultTTL: this.defaultTTL,
      maxKeys: this.maxKeys,
      strategies: Object.keys(this.strategies).length,
      ttlConfigs: Object.keys(this.ttl).length,
      invalidationRules: Object.keys(this.invalidation.events).length,
      memoryLimit: this.performance.memory.maxSize,
      compressionEnabled: this.performance.compression.enabled,
      statsEnabled: this.performance.enableStats,
    };
  },

  /**
   * Validate cache configuration
   * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check TTL values
    Object.entries(this.ttl).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`Invalid TTL for ${key}: ${value}`);
      }
    });

    // Check memory limit
    if (this.performance.memory.maxSize > 0 && this.performance.memory.maxSize < 10485760) {
      warnings.push('Memory limit is less than 10 MB, may cause performance issues');
    }

    // Check max keys
    if (this.maxKeys > 0 && this.maxKeys < 100) {
      warnings.push('Max keys is less than 100, may cause frequent cache misses');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};
