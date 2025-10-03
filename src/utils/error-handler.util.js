/**
 * Advanced Error Handling System
 * 
 * @description Comprehensive error handling with Arabic messages for users and English for developers
 * @author Alsaada Bot Template
 * @version 1.0.0
 */

const Logger = require('./logger.util');

/**
 * Base Error Class
 */
class AppError extends Error {
  constructor(userMessage, consoleMessage, details = null) {
    super(consoleMessage);
    this.name = 'AppError';
    this.userMessage = userMessage || 'حدث خطأ غير متوقع';
    this.consoleMessage = consoleMessage || 'An unexpected error occurred';
    this.details = details;
    this.statusCode = 500;
    this.code = 'APP_ERROR';
    this.timestamp = new Date().toISOString();
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      consoleMessage: this.consoleMessage,
      details: this.details,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '❌ البيانات المدخلة غير صحيحة',
      consoleMessage || 'Validation failed',
      details
    );
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
  }
}

/**
 * Database Error
 */
class DatabaseError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '⚠️ حدث خطأ في قاعدة البيانات',
      consoleMessage || 'Database operation failed',
      details
    );
    this.name = 'DatabaseError';
    this.code = 'DATABASE_ERROR';
    this.statusCode = 500;
  }
}

/**
 * Permission Error
 */
class PermissionError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '⛔ ليس لديك صلاحية للقيام بهذا الإجراء',
      consoleMessage || 'Permission denied',
      details
    );
    this.name = 'PermissionError';
    this.code = 'PERMISSION_ERROR';
    this.statusCode = 403;
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '🔍 العنصر المطلوب غير موجود',
      consoleMessage || 'Resource not found',
      details
    );
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
  }
}

/**
 * Configuration Error
 */
class ConfigError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '⚙️ حدث خطأ في إعدادات النظام',
      consoleMessage || 'Configuration error',
      details
    );
    this.name = 'ConfigError';
    this.code = 'CONFIG_ERROR';
    this.statusCode = 500;
  }
}

/**
 * External Service Error
 */
class ExternalServiceError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '🌐 الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً',
      consoleMessage || 'External service unavailable',
      details
    );
    this.name = 'ExternalServiceError';
    this.code = 'EXTERNAL_SERVICE_ERROR';
    this.statusCode = 503;
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '⏱️ لقد تجاوزت الحد المسموح من الطلبات، يرجى الانتظار',
      consoleMessage || 'Rate limit exceeded',
      details
    );
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT_ERROR';
    this.statusCode = 429;
  }
}

/**
 * File Operation Error
 */
class FileOperationError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '📁 حدث خطأ أثناء معالجة الملف',
      consoleMessage || 'File operation failed',
      details
    );
    this.name = 'FileOperationError';
    this.code = 'FILE_OPERATION_ERROR';
    this.statusCode = 500;
  }
}

/**
 * Business Logic Error
 */
class BusinessLogicError extends AppError {
  constructor(userMessage, consoleMessage, details = null) {
    super(
      userMessage || '❗ لا يمكن إكمال هذا الإجراء',
      consoleMessage || 'Business rule violation',
      details
    );
    this.name = 'BusinessLogicError';
    this.code = 'BUSINESS_LOGIC_ERROR';
    this.statusCode = 422;
  }
}

/**
 * Main Error Handler
 */
class ErrorHandler {
  /**
   * Handle error and send message to user
   */
  static async handle(error, ctx = null) {
    // Log the error
    this.logError(error, ctx);

    // Send message to user if context exists
    if (ctx && ctx.reply) {
      try {
        const userMessage = this.getUserMessage(error);
        await ctx.reply(userMessage, { parse_mode: 'HTML' });
      } catch (replyError) {
        Logger.error('Failed to send error message to user', {
          category: 'ERROR',
          originalError: error.message,
          replyError: replyError.message
        });
      }
    }

    // Notify admins about critical errors
    if (this.isCriticalError(error)) {
      await this.notifyAdmins(error, ctx);
    }
  }

  /**
   * Get user-friendly message
   */
  static getUserMessage(error) {
    if (error instanceof AppError) {
      return error.userMessage;
    }

    // Telegraf errors
    if (error.description) {
      return '⚠️ حدث خطأ أثناء التواصل مع تليجرام';
    }

    // Generic errors
    return '❌ حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
  }

  /**
   * Log the error
   */
  static logError(error, ctx = null) {
    const errorInfo = {
      name: error.name,
      message: error.consoleMessage || error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack
    };

    // User info if exists
    if (ctx && ctx.from) {
      errorInfo.user = {
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name
      };
    }

    // Message info if exists
    if (ctx && ctx.message) {
      errorInfo.message_text = ctx.message.text;
    }

    // Determine severity level
    const level = this.getErrorLevel(error);

    Logger.custom('ERROR', level, error.consoleMessage || error.message, errorInfo);
  }

  /**
   * Determine error severity level
   */
  static getErrorLevel(error) {
    if (this.isCriticalError(error)) {
      return 'error';
    }
    
    if (error instanceof ValidationError || error instanceof PermissionError) {
      return 'warn';
    }

    return 'error';
  }

  /**
   * Check if error is critical
   */
  static isCriticalError(error) {
    return (
      error instanceof DatabaseError ||
      error instanceof ConfigError ||
      error instanceof ExternalServiceError ||
      (error.statusCode && error.statusCode >= 500)
    );
  }

  /**
   * Notify admins about the error
   */
  static async notifyAdmins(error, ctx = null) {
    try {
      const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;
      if (!SUPER_ADMIN_ID || !ctx || !ctx.telegram) {
        return;
      }

      const message = this.formatAdminNotification(error, ctx);
      await ctx.telegram.sendMessage(SUPER_ADMIN_ID, message, { parse_mode: 'HTML' });
    } catch (notifyError) {
      Logger.error('Failed to notify admin', {
        category: 'ERROR',
        error: notifyError.message
      });
    }
  }

  /**
   * Format admin notification message
   */
  static formatAdminNotification(error, ctx) {
    let message = '🚨 <b>Critical Error Alert</b>\n\n';
    message += `<b>Type:</b> ${error.name}\n`;
    message += `<b>Code:</b> ${error.code}\n`;
    message += `<b>Message:</b> ${error.consoleMessage || error.message}\n`;
    
    if (ctx && ctx.from) {
      message += `\n<b>User:</b> ${ctx.from.first_name} (@${ctx.from.username || 'N/A'})\n`;
      message += `<b>User ID:</b> ${ctx.from.id}\n`;
    }

    if (error.details) {
      message += `\n<b>Details:</b>\n<code>${JSON.stringify(error.details, null, 2)}</code>`;
    }

    return message;
  }

  /**
   * Convert regular errors to AppError
   */
  static normalizeError(error) {
    if (error instanceof AppError) {
      return error;
    }

    return new AppError(
      'حدث خطأ غير متوقع',
      error.message,
      { originalError: error.name }
    );
  }

  /**
   * Handle error and return formatted response
   */
  static handleError(error) {
    if (error instanceof AppError) {
      return {
        message: error.userMessage,
        code: error.code,
        statusCode: error.statusCode
      };
    }

    // Handle different error types
    if (error.name === 'ValidationError') {
      return {
        message: '❌ البيانات المدخلة غير صحيحة',
        code: 'VALIDATION_ERROR',
        statusCode: 400
      };
    }

    if (error.name === 'DatabaseError') {
      return {
        message: '⚠️ حدث خطأ في قاعدة البيانات',
        code: 'DATABASE_ERROR',
        statusCode: 500
      };
    }

    if (error.name === 'NetworkError') {
      return {
        message: '🌐 خطأ في الشبكة',
        code: 'NETWORK_ERROR',
        statusCode: 503
      };
    }

    return {
      message: '❌ حدث خطأ غير متوقع',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }

  /**
   * Format error with context
   */
  static formatError(error, context = null) {
    const result = this.handleError(error);
    
    if (context) {
      result.context = context;
    }
    
    return result;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error) {
    const retryableErrors = [
      'NetworkError',
      'ExternalServiceError',
      'DatabaseError'
    ];
    
    return retryableErrors.includes(error.name);
  }

  /**
   * Get error code
   */
  static getErrorCode(error) {
    if (error instanceof AppError) {
      return error.code;
    }

    const errorCodes = {
      'ValidationError': 'VALIDATION_ERROR',
      'DatabaseError': 'DATABASE_ERROR',
      'NetworkError': 'NETWORK_ERROR',
      'PermissionError': 'PERMISSION_ERROR'
    };

    return errorCodes[error.name] || 'UNKNOWN_ERROR';
  }

  /**
   * Log error with proper format
   */
  static logError(error, context = null) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: this.getErrorCode(error),
      stack: error.stack
    };

    if (context) {
      errorInfo.context = context;
    }

    Logger.error('Error occurred', errorInfo);
  }
}

/**
 * Async function wrapper for automatic error handling
 */
function wrapAsync(fn) {
  return async (ctx, next) => {
    try {
      await fn(ctx, next);
    } catch (error) {
      await ErrorHandler.handle(error, ctx);
    }
  };
}

/**
 * Middleware wrapper
 */
function wrapMiddleware(middleware) {
  return wrapAsync(middleware);
}

/**
 * Command handler wrapper
 */
function wrapCommand(handler) {
  return wrapAsync(handler);
}

/**
 * Action handler wrapper
 */
function wrapAction(handler) {
  return wrapAsync(handler);
}

// Export
module.exports = {
  // Error Classes
  AppError,
  ValidationError,
  DatabaseError,
  PermissionError,
  NotFoundError,
  ConfigError,
  ExternalServiceError,
  RateLimitError,
  FileOperationError,
  BusinessLogicError,
  
  // Error Handler
  ErrorHandler,
  
  // Wrappers
  wrapAsync,
  wrapMiddleware,
  wrapCommand,
  wrapAction,

  // Utility functions
  handleError: ErrorHandler.handleError,
  formatError: ErrorHandler.formatError,
  isRetryableError: ErrorHandler.isRetryableError,
  getErrorCode: ErrorHandler.getErrorCode,
  logError: ErrorHandler.logError
};
