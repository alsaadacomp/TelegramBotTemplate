/**
 * Help Command Handler
 * Handles /help command
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger.util');

/**
 * Handle /help command
 * @param {object} ctx - Telegraf context
 */
async function handleHelp(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    logger.command('info', `/help command executed by user ${telegramId}`);
    
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
    
    // Get help message based on role
    const helpMessage = user.role === 'super_admin' 
      ? messageService.get('help.superAdmin')
      : messageService.get('help.admin');
    
    // Send help message
    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    logger.command('info', `/help command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/help command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.get('error.generic');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

module.exports = {
  handleHelp
};
