/**
 * Profile Command Handler
 * Handles /profile command
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger.util');

/**
 * Handle /profile command
 * @param {object} ctx - Telegraf context
 */
async function handleProfile(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    logger.command('info', `/profile command executed by user ${telegramId}`);
    
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
    
    // Get profile message
    const profileMessage = messageService.getProfileMessage(user);
    
    // Send profile message
    await ctx.reply(profileMessage, {
      parse_mode: 'Markdown'
    });
    
    logger.command('info', `/profile command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/profile command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.getErrorMessage('generic_error');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

module.exports = {
  handleProfile
};
