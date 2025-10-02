/**
 * Settings Command Handler
 * Handles /settings command and settings button
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger.util');

/**
 * Handle /settings command
 * @param {object} ctx - Telegraf context
 */
async function handleSettings(ctx) {
  try {
    const telegramId = ctx.from.id;
    const user = ctx.user; // Provided by authMiddleware
    
    logger.command('info', `/settings command executed by user ${telegramId} (${user.role})`);
    
    // Check if user is Super Admin
    if (user.role !== 'super_admin') {
      await ctx.reply('⛔ هذا الأمر متاح للمالك فقط.');
      logger.security('warn', `Unauthorized settings access attempt by user ${telegramId} (${user.role})`);
      return;
    }
    
    // Get system stats for settings page
    const stats = await getSettingsStats();
    
    // Get settings message with stats
    const settingsMessage = messageService.get('settings.title', stats);
    
    // Send settings message
    await ctx.reply(settingsMessage, {
      parse_mode: 'Markdown'
    });
    
    logger.command('info', `/settings command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/settings command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.get('error.generic');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

async function getSettingsStats() {
  try {
    const [activeAdmins, pendingRequests, dbSize, lastActivity] = await Promise.all([
      dbService.get("SELECT COUNT(*) as count FROM users WHERE (role = 'admin' OR role = 'super_admin') AND status = 'active'"),
      dbService.get("SELECT COUNT(*) as count FROM join_requests WHERE status = 'pending'"),
      dbService.getDatabaseSize(),
      dbService.getLastActivityTime(),
    ]);
    return {
      activeAdmins: activeAdmins.count || 0,
      pendingRequests: pendingRequests.count || 0,
      dbSize: dbSize || 'غير متاح',
      lastActivity: lastActivity || 'لا يوجد',
    };
  } catch (error) {
    logger.error('Failed to get settings stats:', 'SettingsHandler', error);
    return { 
      activeAdmins: 0, 
      pendingRequests: 0, 
      dbSize: 'غير متاح',
      lastActivity: 'غير متاح'
    };
  }
}

/**
 * Handle settings button click
 * @param {object} ctx - Telegraf context
 */
async function handleSettingsButton(ctx) {
  // Same as command for now
  await handleSettings(ctx);
}

module.exports = {
  handleSettings,
  handleSettingsButton
};
