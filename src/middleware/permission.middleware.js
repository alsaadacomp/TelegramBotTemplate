/**
 * Permission Middleware
 * Handles command and action permissions based on user roles
 */

const logger = require('../utils/logger.util');
const permissionService = require('../services/permission.service');
const messageService = require('../services/message.service');

/**
 * Middleware to check if a user has permission to use a command
 * @param {Object} ctx - Telegraf context
 * @param {Function} next - Next middleware function
 */
async function permissionMiddleware(ctx, next) {
  try {
    // Skip permission check for start command
    if (ctx.updateType === 'message' && ctx.message && ctx.message.text) {
      const command = ctx.message.text.split(' ')[0].toLowerCase();
      if (command === '/start') {
        return next();
      }
    }

    // Get user from state (set by auth middleware)
    const user = ctx.state.user;
    if (!user) {
      logger.warn('Permission check failed: No user in context', 'Permission');
      return ctx.reply('⚠️ يرجى استخدام /start أولاً');
    }

    // Allow all commands for super admin
    if (user.role === 'super_admin') {
      return next();
    }

    // Check permission for the command
    const command = ctx.updateType === 'message' 
      ? ctx.message?.text?.split(' ')[0].replace('/', '') 
      : ctx.update.callback_query?.data?.split('_')[0];

    if (!command) {
      return next();
    }

    const hasPermission = await permissionService.hasPermission(user.role, `command.${command}`);
    
    if (!hasPermission) {
      logger.warn(`Permission denied for user ${user.telegram_id} (${user.role}) to use command: ${command}`, 'Permission');
      return ctx.reply('⛔ ليس لديك صلاحية لاستخدام هذا الأمر');
    }

    // User has permission, continue to the next middleware/command
    return next();
  } catch (error) {
    logger.error('Error in permission middleware:', error);
    const errorMessage = messageService.get('error.permission');
    return ctx.reply(errorMessage).catch(() => {});
  }
}

module.exports = permissionMiddleware;
