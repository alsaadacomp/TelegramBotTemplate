/**
 * Logger Configuration
 * 
 * Comprehensive logging system configuration
 * - Multiple log levels
 * - File and console output
 * - Log rotation settings
 * - Categorized logging
 * 
 * @module logger.config
 */

/**
 * Log Levels (from highest to lowest priority)
 */
const LOG_LEVELS = {
  ERROR: 'error',      // Critical errors that need immediate attention
  WARN: 'warn',        // Warning messages
  INFO: 'info',        // General informational messages
  DEBUG: 'debug',      // Debugging information
  VERBOSE: 'verbose'   // Detailed trace information
};

/**
 * Winston Log Levels Values
 * (Lower number = higher priority)
 */
const LEVELS_VALUES = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4
};

/**
 * Log Categories
 * Used to organize logs by their purpose
 */
const CATEGORIES = {
  SYSTEM: 'system',       // System-related logs
  DATABASE: 'database',   // Database operations
  AUTH: 'auth',          // Authentication/Authorization
  USER: 'user',          // User actions
  COMMAND: 'command',    // Bot commands
  ERROR: 'error',        // Error logs
  SECURITY: 'security'   // Security-related events
};

/**
 * Main Logger Configuration
 */
const LOGGER_CONFIG = {
  /**
   * Default log level
   * All logs at this level and higher priority will be logged
   */
  LEVEL: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
  
  /**
   * Log Levels Definition
   */
  LEVELS: LOG_LEVELS,
  LEVELS_VALUES: LEVELS_VALUES,
  
  /**
   * Log Categories
   */
  CATEGORIES: CATEGORIES,
  
  /**
   * Console Output Configuration
   */
  CONSOLE: {
    ENABLED: process.env.LOG_TO_CONSOLE !== 'false', // Default: true
    LEVEL: process.env.LOG_CONSOLE_LEVEL || LOG_LEVELS.DEBUG,
    COLORS: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      verbose: 'cyan'
    }
  },
  
  /**
   * File Output Configuration
   */
  FILE: {
    ENABLED: process.env.LOG_TO_FILE !== 'false', // Default: true
    
    // File names
    COMBINED: 'combined.log',  // All logs
    ERROR: 'error.log',        // Errors only
    ACCESS: 'access.log',      // User actions
    
    // Rotation settings
    MAX_SIZE: 10 * 1024 * 1024, // 10 MB per file
    MAX_FILES: 5,               // Keep last 5 rotated files
    
    // Compression
    COMPRESS: true,             // Compress old log files
    
    // Date pattern for rotation
    DATE_PATTERN: 'YYYY-MM-DD'
  },
  
  /**
   * Log Rotation Configuration
   */
  ROTATION: {
    // Automatic rotation enabled
    ENABLED: true,
    
    // Check for rotation every hour
    CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
    
    // Maximum file age before deletion (days)
    MAX_AGE_DAYS: 30,
    
    // Compress logs older than (days)
    COMPRESS_AFTER_DAYS: 7
  },
  
  /**
   * Performance Settings
   */
  PERFORMANCE: {
    // Maximum logs per second (to prevent flooding)
    MAX_LOGS_PER_SECOND: 100,
    
    // Batch write logs instead of individual writes
    BATCH_WRITES: true,
    BATCH_SIZE: 10,
    BATCH_INTERVAL: 1000 // 1 second
  },
  
  /**
   * Development vs Production
   */
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  
  /**
   * Sensitive Data Filtering
   * Fields that should be masked in logs
   */
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'secret',
    'api_key',
    'private_key',
    'credit_card',
    'ssn'
  ],
  
  /**
   * Stack Trace Configuration
   */
  STACK_TRACE: {
    ENABLED: true,
    MAX_DEPTH: 10 // Maximum stack trace depth
  }
};

/**
 * Helper function to check if logging is enabled for a level
 * @param {string} level - Log level to check
 * @returns {boolean} True if enabled
 */
function isLevelEnabled(level) {
  const currentLevel = LEVELS_VALUES[LOGGER_CONFIG.LEVEL];
  const checkLevel = LEVELS_VALUES[level];
  return checkLevel <= currentLevel;
}

/**
 * Helper function to mask sensitive data
 * @param {Object} data - Data object
 * @returns {Object} Data with sensitive fields masked
 */
function maskSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const masked = { ...data };
  
  for (const field of LOGGER_CONFIG.SENSITIVE_FIELDS) {
    if (field in masked) {
      masked[field] = '***MASKED***';
    }
  }
  
  return masked;
}

module.exports = LOGGER_CONFIG;
module.exports.isLevelEnabled = isLevelEnabled;
module.exports.maskSensitiveData = maskSensitiveData;
