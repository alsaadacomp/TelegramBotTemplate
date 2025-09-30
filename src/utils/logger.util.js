/**
 * Advanced Logging System
 * 
 * Features:
 * - Multiple log levels (ERROR, WARN, INFO, DEBUG, VERBOSE)
 * - Console output in English (for developers)
 * - File output with rotation
 * - Categorized logging (SYSTEM, DATABASE, AUTH, etc.)
 * - Colored console output
 * - JSON file format for easy parsing
 * 
 * @module logger.util
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const LOGGER_CONFIG = require('../../config/logger.config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../data/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom format for console output (English only)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, category, userId, action, ...meta }) => {
    let log = `[${timestamp}] [${level}]`;
    
    if (category) {
      log += ` [${category.toUpperCase()}]`;
    }
    
    if (userId) {
      log += ` [User:${userId}]`;
    }
    
    if (action) {
      log += ` [${action}]`;
    }
    
    log += ` ${message}`;
    
    // Add metadata if exists (excluding already displayed fields)
    const displayedFields = ['timestamp', 'level', 'message', 'category', 'userId', 'action'];
    const remainingMeta = Object.keys(meta)
      .filter(key => !displayedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = meta[key];
        return obj;
      }, {});
    
    if (Object.keys(remainingMeta).length > 0) {
      log += ` ${JSON.stringify(remainingMeta)}`;
    }
    
    return log;
  })
);

/**
 * Custom format for file output (JSON)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

/**
 * Create Winston Logger Instance
 */
const logger = winston.createLogger({
  level: LOGGER_CONFIG.LEVEL,
  levels: LOGGER_CONFIG.LEVELS_VALUES,
  transports: []
});

// Add Console Transport if enabled
if (LOGGER_CONFIG.CONSOLE.ENABLED) {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: LOGGER_CONFIG.CONSOLE.LEVEL
  }));
}

// Add File Transports if enabled
if (LOGGER_CONFIG.FILE.ENABLED) {
  // Combined log (all levels)
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, LOGGER_CONFIG.FILE.COMBINED),
    format: fileFormat,
    maxsize: LOGGER_CONFIG.FILE.MAX_SIZE,
    maxFiles: LOGGER_CONFIG.FILE.MAX_FILES
  }));
  
  // Error log (errors only)
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, LOGGER_CONFIG.FILE.ERROR),
    level: 'error',
    format: fileFormat,
    maxsize: LOGGER_CONFIG.FILE.MAX_SIZE,
    maxFiles: LOGGER_CONFIG.FILE.MAX_FILES
  }));
  
  // Access log (user actions)
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, LOGGER_CONFIG.FILE.ACCESS),
    level: 'info',
    format: fileFormat,
    maxsize: LOGGER_CONFIG.FILE.MAX_SIZE,
    maxFiles: LOGGER_CONFIG.FILE.MAX_FILES
  }));
}

/**
 * Logger Class with categorized methods
 */
class Logger {
  /**
   * Log error message
   * @param {string} message - Error message (English)
   * @param {Object} meta - Additional metadata
   */
  static error(message, meta = {}) {
    logger.error(message, { category: LOGGER_CONFIG.CATEGORIES.ERROR, ...meta });
  }
  
  /**
   * Log warning message
   * @param {string} message - Warning message (English)
   * @param {Object} meta - Additional metadata
   */
  static warn(message, meta = {}) {
    logger.warn(message, { category: LOGGER_CONFIG.CATEGORIES.SYSTEM, ...meta });
  }
  
  /**
   * Log info message
   * @param {string} message - Info message (English)
   * @param {Object} meta - Additional metadata
   */
  static info(message, meta = {}) {
    logger.info(message, { category: LOGGER_CONFIG.CATEGORIES.SYSTEM, ...meta });
  }
  
  /**
   * Log debug message
   * @param {string} message - Debug message (English)
   * @param {Object} meta - Additional metadata
   */
  static debug(message, meta = {}) {
    logger.debug(message, { category: LOGGER_CONFIG.CATEGORIES.SYSTEM, ...meta });
  }
  
  /**
   * Log verbose message
   * @param {string} message - Verbose message (English)
   * @param {Object} meta - Additional metadata
   */
  static verbose(message, meta = {}) {
    logger.verbose(message, { category: LOGGER_CONFIG.CATEGORIES.SYSTEM, ...meta });
  }
  
  /**
   * Log system-related message
   * @param {string} level - Log level
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static system(level, message, meta = {}) {
    logger.log(level, message, { category: LOGGER_CONFIG.CATEGORIES.SYSTEM, ...meta });
  }
  
  /**
   * Log database-related message
   * @param {string} level - Log level
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static database(level, message, meta = {}) {
    logger.log(level, message, { category: LOGGER_CONFIG.CATEGORIES.DATABASE, ...meta });
  }
  
  /**
   * Log authentication-related message
   * @param {string} level - Log level
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static auth(level, message, meta = {}) {
    logger.log(level, message, { category: LOGGER_CONFIG.CATEGORIES.AUTH, ...meta });
  }
  
  /**
   * Log user action
   * @param {number} userId - Telegram user ID
   * @param {string} action - Action name
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static userAction(userId, action, message, meta = {}) {
    logger.info(message, {
      category: LOGGER_CONFIG.CATEGORIES.USER,
      userId,
      action,
      ...meta
    });
  }
  
  /**
   * Log command execution
   * @param {number} userId - Telegram user ID
   * @param {string} command - Command name
   * @param {Object} meta - Additional metadata
   */
  static command(userId, command, meta = {}) {
    logger.info(`Command executed: ${command}`, {
      category: LOGGER_CONFIG.CATEGORIES.COMMAND,
      userId,
      action: command,
      ...meta
    });
  }
  
  /**
   * Log security event
   * @param {string} level - Log level
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static security(level, message, meta = {}) {
    logger.log(level, message, { category: LOGGER_CONFIG.CATEGORIES.SECURITY, ...meta });
  }
  
  /**
   * Log with custom category
   * @param {string} category - Custom category
   * @param {string} level - Log level
   * @param {string} message - Log message (English)
   * @param {Object} meta - Additional metadata
   */
  static custom(category, level, message, meta = {}) {
    logger.log(level, message, { category, ...meta });
  }
}

/**
 * Graceful shutdown - close all transports
 */
process.on('SIGINT', () => {
  logger.info('Logger shutting down gracefully...', { category: 'SYSTEM' });
  logger.close();
});

process.on('SIGTERM', () => {
  logger.info('Logger shutting down gracefully...', { category: 'SYSTEM' });
  logger.close();
});

module.exports = Logger;
