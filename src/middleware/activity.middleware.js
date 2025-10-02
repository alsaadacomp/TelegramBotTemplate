/**
 * Activity Middleware
 * Updates the last activity timestamp for users when they interact with the bot
 */

const logger = require('../utils/logger.util');
const dbService = require('../services/database.service');

/**
 * Middleware to update the last activity timestamp for users
 * @param {Object} ctx - Telegraf context
 * @param {Function} next - Next middleware function
 */
async function updateActivityMiddleware(ctx, next) {
  try {
    // Only process if we have a message or callback query from a user
    const from = ctx.update?.message?.from || ctx.update?.callback_query?.from;
    
    if (from) {
      const { id: telegramId } = from;
      
      // Update last activity in the database
      await dbService.updateUser(telegramId, {
        last_activity: new Date().toISOString()
      });
      
      // Log the activity (optional, for debugging)
      logger.debug(`Updated last activity for user ${telegramId}`);
    }
    
    // Continue to the next middleware/command
    return next();
  } catch (error) {
    logger.error('Error in activity middleware:', error);
    // Continue to the next middleware/command even if there's an error
    return next();
  }
}

module.exports = {
  updateActivityMiddleware
};
