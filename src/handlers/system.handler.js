/**
 * System Command Handler
 * Handles /system command (super_admin only)
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const permissionService = require('../services/permission.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger.util');

/**
 * Handle /system command
 * @param {object} ctx - Telegraf context
 */
async function handleSystem(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    logger.command('info', `/system command executed by user ${telegramId}`);
    
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
    
    // Check permission - only super_admin
    const hasPermission = await permissionService.checkPermission(
      telegramId,
      'SYSTEM_MANAGE'
    );
    
    if (!hasPermission) {
      const noPermMessage = messageService.getNoPermissionMessage(
        user.first_name || user.username
      );
      await ctx.reply(noPermMessage);
      logger.security('warn', `Unauthorized system access attempt by user ${telegramId}`);
      return;
    }
    
    // TODO: Implement actual system management
    // For now, send placeholder message
    const systemMessage = `🔧 **إدارة النظام**\n\n` +
                         `✅ النظام يعمل بشكل طبيعي\n\n` +
                         `🚧 الأوامر المتقدمة قيد التطوير:\n` +
                         `• /backup - النسخ الاحتياطي\n` +
                         `• /sync - المزامنة\n` +
                         `• /restart - إعادة التشغيل\n` +
                         `• /database - إدارة قاعدة البيانات`;
    
    await ctx.reply(systemMessage, { parse_mode: 'Markdown' });
    
    logger.command('info', `/system command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/system command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.getErrorMessage('generic_error');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

module.exports = {
  handleSystem
};
