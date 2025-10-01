/**
 * Middleware معالجة الأخطاء
 * Error Handling Middleware
 * 
 * @description middleware شامل لمعالجة جميع أخطاء Telegraf والتطبيق
 * @author Alsaada Bot Template
 * @version 1.0.0
 */

const { ErrorHandler, AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

/**
 * Middleware معالجة الأخطاء الرئيسي
 * Main error handling middleware
 */
function errorMiddleware(bot) {
  // معالجة أخطاء Telegraf
  bot.catch(async (error, ctx) => {
    logger.error('Telegraf error caught', {
      category: 'ERROR',
      error: error.message,
      stack: error.stack,
      update: ctx.update
    });

    // معالجة الخطأ وإرسال رسالة للمستخدم
    await ErrorHandler.handle(error, ctx);
  });

  // معالجة الأخطاء غير المعالجة في Node.js
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      category: 'SYSTEM',
      error: error.message,
      stack: error.stack
    });

    // محاولة إشعار المشرفين
    if (process.env.SUPER_ADMIN_ID && bot.telegram) {
      bot.telegram.sendMessage(
        process.env.SUPER_ADMIN_ID,
        `🚨 <b>Uncaught Exception</b>\n\n${error.message}`,
        { parse_mode: 'HTML' }
      ).catch(err => {
        logger.error('Failed to notify admin about uncaught exception', {
          category: 'ERROR',
          error: err.message
        });
      });
    }

    // إعطاء وقت لإرسال الرسالة ثم الإغلاق
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // معالجة الـ Promises المرفوضة غير المعالجة
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      category: 'SYSTEM',
      reason: reason,
      promise: promise
    });

    // محاولة إشعار المشرفين
    if (process.env.SUPER_ADMIN_ID && bot.telegram) {
      bot.telegram.sendMessage(
        process.env.SUPER_ADMIN_ID,
        `🚨 <b>Unhandled Promise Rejection</b>\n\n${reason}`,
        { parse_mode: 'HTML' }
      ).catch(err => {
        logger.error('Failed to notify admin about unhandled rejection', {
          category: 'ERROR',
          error: err.message
        });
      });
    }
  });

  logger.info('Error middleware initialized', { category: 'SYSTEM' });
}

/**
 * Middleware معالجة أخطاء الـ Commands
 * Command error handling middleware
 */
function commandErrorHandler(handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx, next);
    } catch (error) {
      await ErrorHandler.handle(error, ctx);
    }
  };
}

/**
 * Middleware معالجة أخطاء الـ Actions
 * Action error handling middleware
 */
function actionErrorHandler(handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx, next);
    } catch (error) {
      await ErrorHandler.handle(error, ctx);
    }
  };
}

/**
 * Middleware معالجة أخطاء الـ Hears
 * Hears error handling middleware
 */
function hearsErrorHandler(handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx, next);
    } catch (error) {
      await ErrorHandler.handle(error, ctx);
    }
  };
}

/**
 * Middleware معالجة أخطاء الـ On
 * On event error handling middleware
 */
function onErrorHandler(handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx, next);
    } catch (error) {
      await ErrorHandler.handle(error, ctx);
    }
  };
}

// تصدير
module.exports = {
  errorMiddleware,
  commandErrorHandler,
  actionErrorHandler,
  hearsErrorHandler,
  onErrorHandler
};
