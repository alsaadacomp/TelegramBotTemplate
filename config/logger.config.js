/**
 * Logger Configuration
 * Winston-based logging system with daily rotation
 * 
 * @module config/logger.config
 */

require('dotenv').config();
const path = require('path');

module.exports = {
  // ========================================
  // Global Settings
  // ========================================
  enabled: true,

  // Log level: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'
  level: process.env.LOG_LEVEL || 'info',

  // Silent mode (disable all logging)
  silent: false,

  // Exit on error
  exitOnError: false,

  // ========================================
  // Output Destinations
  // ========================================
  destinations: {
    // Console output
    console: {
      enabled: process.env.LOG_TO_CONSOLE !== 'false',
      level: process.env.LOG_LEVEL || 'info',
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      handleRejections: true,
    },

    // File output
    file: {
      enabled: process.env.LOG_TO_FILE !== 'false',
      directory: path.join(__dirname, '../data/logs'),
      
      // Combined log (all levels)
      combined: {
        enabled: true,
        filename: 'combined-%DATE%.log',
        level: 'info',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
        zippedArchive: true,
      },

      // Error log (errors only)
      error: {
        enabled: true,
        filename: 'error-%DATE%.log',
        level: 'error',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
        zippedArchive: true,
      },

      // Exceptions log
      exceptions: {
        enabled: true,
        filename: 'exceptions-%DATE%.log',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
        zippedArchive: true,
      },

      // Rejections log (unhandled promise rejections)
      rejections: {
        enabled: true,
        filename: 'rejections-%DATE%.log',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
        zippedArchive: true,
      },
    },
  },

  // ========================================
  // Log Formats
  // ========================================
  formats: {
    // Timestamp format
    timestamp: {
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
      tz: process.env.TIMEZONE || 'Asia/Riyadh',
    },

    // Console format
    console: {
      colorize: true,
      prettyPrint: true,
      depth: 3,
      showLevel: true,
      showTimestamp: true,
    },

    // File format
    file: {
      json: false, // Use simple format, not JSON
      prettyPrint: false,
      depth: 3,
      showLevel: true,
      showTimestamp: true,
    },

    // Error format (with stack trace)
    error: {
      showStack: true,
      showMetadata: true,
    },
  },

  // ========================================
  // Log Categories
  // ========================================
  categories: {
    // System logs
    system: {
      enabled: true,
      level: 'info',
      prefix: '[SYSTEM]',
      color: 'blue',
    },

    // Bot logs
    bot: {
      enabled: true,
      level: 'info',
      prefix: '[BOT]',
      color: 'green',
    },

    // Database logs
    database: {
      enabled: true,
      level: 'info',
      prefix: '[DB]',
      color: 'cyan',
    },

    // Cache logs
    cache: {
      enabled: process.env.DEBUG === 'true',
      level: 'debug',
      prefix: '[CACHE]',
      color: 'magenta',
    },

    // API logs (Telegram, Google Sheets)
    api: {
      enabled: true,
      level: 'info',
      prefix: '[API]',
      color: 'yellow',
    },

    // User action logs
    user: {
      enabled: true,
      level: 'info',
      prefix: '[USER]',
      color: 'white',
    },

    // Workflow execution logs
    workflow: {
      enabled: true,
      level: 'info',
      prefix: '[WORKFLOW]',
      color: 'blue',
    },

    // Sync logs (SQLite <-> Sheets)
    sync: {
      enabled: true,
      level: 'info',
      prefix: '[SYNC]',
      color: 'cyan',
    },

    // Security logs
    security: {
      enabled: true,
      level: 'warn',
      prefix: '[SECURITY]',
      color: 'red',
    },

    // Performance logs
    performance: {
      enabled: process.env.DEBUG === 'true',
      level: 'debug',
      prefix: '[PERF]',
      color: 'gray',
    },

    // Error logs
    error: {
      enabled: true,
      level: 'error',
      prefix: '[ERROR]',
      color: 'red',
    },
  },

  // ========================================
  // Filtering
  // ========================================
  filters: {
    // Sensitive data patterns to redact
    sensitive: [
      /token[=:]\s*['"]?([^'"\s]+)['"]?/gi,
      /password[=:]\s*['"]?([^'"\s]+)['"]?/gi,
      /api[_-]?key[=:]\s*['"]?([^'"\s]+)['"]?/gi,
      /secret[=:]\s*['"]?([^'"\s]+)['"]?/gi,
      /private[_-]?key[=:]\s*['"]?([^'"\s]+)['"]?/gi,
      /\d{16}/g, // Credit card numbers
    ],

    // Replace sensitive data with this
    redactWith: '[REDACTED]',

    // Exclude these messages from logs
    exclude: [
      'health check',
      'ping',
    ],

    // Only log messages matching these patterns (empty = log all)
    include: [],
  },

  // ========================================
  // Performance Settings
  // ========================================
  performance: {
    // Buffer logs before writing (improves performance)
    buffer: {
      enabled: true,
      size: 100, // Number of logs to buffer
      flushInterval: 1000, // Flush every X ms
    },

    // Async logging (non-blocking)
    async: true,

    // Sampling (log only X% of debug messages)
    sampling: {
      enabled: false,
      rate: 0.1, // 10% of debug messages
      level: 'debug',
    },
  },

  // ========================================
  // Notification Settings
  // ========================================
  notifications: {
    // Notify admins on critical errors
    critical: {
      enabled: process.env.NOTIFY_ADMINS_ON_CRITICAL !== 'false',
      levels: ['error', 'critical'],
      throttle: 300000, // Don't spam, max 1 notification per 5 minutes
    },

    // Error threshold before notification
    errorThreshold: {
      enabled: true,
      count: 10, // Notify after X errors
      window: 60000, // Within X ms
    },
  },

  // ========================================
  // Debug Settings
  // ========================================
  debug: {
    // Enable debug mode
    enabled: process.env.DEBUG === 'true',

    // Verbose logging
    verbose: process.env.VERBOSE_LOGGING === 'true',

    // Log SQL queries
    logQueries: process.env.DEBUG === 'true',

    // Log API requests
    logApiRequests: process.env.DEBUG === 'true',

    // Log cache operations
    logCacheOps: process.env.VERBOSE_LOGGING === 'true',

    // Pretty print objects
    prettyPrint: true,

    // Show file and line numbers
    showLocation: process.env.DEBUG === 'true',
  },

  // ========================================
  // Metadata
  // ========================================
  metadata: {
    // Add these fields to all logs
    defaults: {
      app: 'telegram-bot',
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
    },

    // User context in logs
    includeUser: true,

    // Request context in logs
    includeRequest: true,

    // Performance metrics in logs
    includePerformance: process.env.DEBUG === 'true',
  },

  // ========================================
  // Log Levels Configuration
  // ========================================
  levels: {
    // Custom log levels
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },

  // Log level colors
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray',
  },

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Get log level number
   * @param {string} level - Log level name
   * @returns {number}
   */
  getLevelNumber(level) {
    return this.levels[level] || 2;
  },

  /**
   * Check if level should be logged
   * @param {string} level - Log level to check
   * @returns {boolean}
   */
  shouldLog(level) {
    if (!this.enabled) return false;
    return this.getLevelNumber(level) <= this.getLevelNumber(this.level);
  },

  /**
   * Get category configuration
   * @param {string} category - Category name
   * @returns {Object|null}
   */
  getCategory(category) {
    return this.categories[category] || null;
  },

  /**
   * Check if category is enabled
   * @param {string} category - Category name
   * @returns {boolean}
   */
  isCategoryEnabled(category) {
    const cat = this.getCategory(category);
    return cat ? cat.enabled : true;
  },

  /**
   * Redact sensitive information
   * @param {string} message - Log message
   * @returns {string}
   */
  redactSensitive(message) {
    let redacted = message;
    this.filters.sensitive.forEach(pattern => {
      redacted = redacted.replace(pattern, this.filters.redactWith);
    });
    return redacted;
  },

  /**
   * Get log file path
   * @param {string} type - Log type (combined, error, etc.)
   * @returns {string}
   */
  getLogFilePath(type) {
    const fileConfig = this.destinations.file[type];
    if (!fileConfig || !fileConfig.enabled) return null;
    
    return path.join(
      this.destinations.file.directory,
      fileConfig.filename
    );
  },

  /**
   * Get configuration summary
   * @returns {Object}
   */
  getSummary() {
    return {
      enabled: this.enabled,
      level: this.level,
      consoleEnabled: this.destinations.console.enabled,
      fileEnabled: this.destinations.file.enabled,
      categories: Object.keys(this.categories).filter(
        cat => this.categories[cat].enabled
      ).length,
      debugMode: this.debug.enabled,
      notifications: this.notifications.critical.enabled,
      logDirectory: this.destinations.file.directory,
    };
  },

  /**
   * Validate logger configuration
   * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check log level
    if (!Object.keys(this.levels).includes(this.level)) {
      errors.push(`Invalid log level: ${this.level}`);
    }

    // Check if at least one destination is enabled
    if (!this.destinations.console.enabled && !this.destinations.file.enabled) {
      warnings.push('All log destinations are disabled');
    }

    // Check log directory exists (will be created automatically)
    if (this.destinations.file.enabled) {
      // Note: Directory will be created by winston
    }

    // Check max file size format
    const maxSize = this.destinations.file.combined.maxSize;
    if (!/^\d+[kmg]$/i.test(maxSize)) {
      warnings.push(`Invalid max file size format: ${maxSize}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};
