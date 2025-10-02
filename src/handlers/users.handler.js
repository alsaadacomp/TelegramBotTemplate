/**
 * Users Command Handler
 * Handles /users command (admin only)
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const permissionService = require('../services/permission.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger.util');

/**
 * Handle /users command
 * @param {object} ctx - Telegraf context
 */
async function handleUsers(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    logger.command('info', `/users command executed by user ${telegramId}`);
    
    // Get user
    let user = await cacheService.getUser(telegramId);
    if (!user) {
      user = await dbService.getUserByTelegramId(telegramId);
      if (user) {
        await cacheService.setUser(telegramId, user);
      }
    }
    
    if (!user) {
      await ctx.reply('⚠️ يرجى البدء أولاً باستخدام /start');
      return;
    }
    
    // Check permission
    const hasPermission = await permissionService.checkPermission(
      telegramId,
      'USERS_VIEW'
    );
    
    if (!hasPermission) {
      const noPermMessage = messageService.getNoPermissionMessage(
        user.first_name || user.username
      );
      await ctx.reply(noPermMessage);
      logger.security('warn', `Unauthorized users access attempt by user ${telegramId}`);
      return;
    }
    
    // TODO: Implement actual user management
    // For now, send placeholder message
    const usersMessage = `👥 **إدارة المستخدمين**\n\n` +
                        `🚧 قيد التطوير...\n\n` +
                        `سيتم إضافة إدارة المستخدمين الكاملة في المرحلة القادمة.`;
    
    await ctx.reply(usersMessage, { parse_mode: 'Markdown' });
    
    logger.command('info', `/users command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/users command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.getErrorMessage('generic_error');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

module.exports = {
  handleUsers
};
