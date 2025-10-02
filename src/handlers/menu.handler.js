/**
 * Menu Command Handler
 * Handles /menu command and displays the main menu with quick actions
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const { buildMenuKeyboard } = require('../keyboards/menu.keyboard');
const logger = require('../utils/logger.util');

/**
 * Handle /menu command
 * @param {object} ctx - Telegraf context
 */
async function handleMenu(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    logger.command('info', `/menu command executed by user ${telegramId}`);
    
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
    
    // Get system stats if super admin
    let stats = {};
    if (user.role === 'super_admin') {
      stats = await getSystemStats();
    }
    
    // Get menu message with stats for super admin
    const menuMessage = user.role === 'super_admin' 
      ? messageService.get('menu.superAdmin', stats)
      : messageService.get('menu.admin');
    
    // Build menu keyboard based on user role
    const keyboard = buildMenuKeyboard(user.role);
    
    if (!keyboard) {
      await ctx.reply('⚠️ لا توجد أوامر متاحة لك حالياً');
      return;
    }
    
    // Send menu
    await ctx.reply(menuMessage, {
      ...keyboard,
      parse_mode: 'Markdown'
    });
    
    logger.command('info', `/menu command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/menu command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.get('error.generic');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

/**
 * Handle menu callback queries
 * @param {object} ctx - Telegraf context
 */
async function handleMenuCallback(ctx) {
  try {
    const callbackData = ctx.callbackQuery.data;
    const telegramId = ctx.from.id;
    
    logger.command('info', `Menu callback: ${callbackData} by user ${telegramId}`);
    
    // Answer callback query
    await ctx.answerCbQuery();
    
    // Handle menu close
    if (callbackData === 'menu_close') {
      await ctx.deleteMessage().catch(() => {});
      return;
    }
    
    // Handle command callbacks
    if (callbackData.startsWith('cmd_')) {
      const command = callbackData.replace('cmd_', '');
      
      // Delete the menu message
      await ctx.deleteMessage().catch(() => {});
      
      // Execute the command
      await ctx.telegram.sendMessage(telegramId, `/${command}`);
      
      // Simulate command execution by sending it back to the bot
      // This will trigger the command handler
      const message = {
        text: `/${command}`,
        from: ctx.from,
        chat: ctx.chat
      };
      
      // Create a new context for the command
      const commandCtx = {
        ...ctx,
        message,
        update: { message }
      };
      
      // Note: The actual command will be handled by the bot's command handler
      // This is just for logging and cleanup
      logger.command('info', `Command ${command} triggered from menu by user ${telegramId}`);
    }
    
  } catch (error) {
    logger.command('error', `Menu callback failed`, {
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Get system statistics for super admin
 * @returns {Promise<object>} System statistics
 */
async function getSystemStats() {
  try {
    const [
      totalAdmins,
      activeAdmins, 
      pendingRequests, 
      dbSize, 
      lastActivity,
      totalUsers
    ] = await Promise.all([
      dbService.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' OR role = 'super_admin'"),
      dbService.get("SELECT COUNT(*) as count FROM users WHERE (role = 'admin' OR role = 'super_admin') AND status = 'active'"),
      dbService.get("SELECT COUNT(*) as count FROM join_requests WHERE status = 'pending'"),
      dbService.getDatabaseSize(),
      dbService.getLastActivityTime(),
      dbService.get("SELECT COUNT(*) as count FROM users")
    ]);

    return {
      totalAdmins: totalAdmins.count || 0,
      activeAdmins: activeAdmins.count || 0,
      inactiveAdmins: (totalAdmins.count || 0) - (activeAdmins.count || 0),
      pendingRequests: pendingRequests.count || 0,
      dbSize: dbSize || 'غير متاح',
      lastActivity: lastActivity || 'لا يوجد',
      totalUsers: totalUsers.count || 0
    };
  } catch (error) {
    logger.error('Failed to get system stats:', 'MenuHandler', error);
    return { 
      totalAdmins: 0,
      activeAdmins: 0,
      inactiveAdmins: 0,
      pendingRequests: 0, 
      dbSize: 'غير متاح',
      lastActivity: 'غير متاح',
      totalUsers: 0
    };
  }
}

module.exports = {
  handleMenu,
  handleMenuCallback
};
