/**
 * Telegram Bot - Main Entry Point
 */

require('dotenv').config();
const { Telegraf } = require('telegraf');
const logger = require('./utils/logger.util');
const dbService = require('./services/database.service');
const cacheService = require('./services/cache.service');
const permissions = require('../config/permissions.config');

// Initialize services

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

/**
 * Initialize database and bot
 */
async function initialize() {
  try {
    logger.system('info', 'Starting bot initialization...');
    
    await dbService.initialize();
    logger.system('info', 'Database initialized');
    
    const botInfo = await bot.telegram.getMe();
    logger.system('info', `Bot started: @${botInfo.username}`);
    
    return true;
  } catch (error) {
    logger.system('error', 'Initialization failed', { error: error.message });
    throw error;
  }
}

/**
 * Register/Get user
 */
async function getUser(ctx) {
  try {
    const from = ctx.from;
    let user = await cacheService.getUser(from.id);
    
    if (!user) {
      user = await dbService.getUserByTelegramId(from.id);
      
      if (!user) {
        const userData = {
          telegram_id: from.id,
          username: from.username || null,
          first_name: from.first_name || '',
          last_name: from.last_name || null,
          role: from.id.toString() === process.env.SUPER_ADMIN_ID ? permissions.roles.SUPER_ADMIN.name : permissions.roles.USER.name,
          is_active: 1
        };
        
        user = await dbService.createUser(userData);
        logger.userAction(from.id, 'register', `New user: ${from.id}`);
      }
      
      await cacheService.cacheUser(from.id, user);
    }
    
    await dbService.models.user.updateActivity(from.id);
    return user;
  } catch (error) {
    logger.error('Failed to get or create user', { error: error.message });
    throw error;
  }
}

// Start Command
bot.command('start', async (ctx) => {
  try {
    const user = await getUser(ctx);
    
    let message = '';
    if (user.role === permissions.roles.SUPER_ADMIN.name) {
      message = `🎉 مرحباً ${user.first_name}!\n\n👑 صلاحيات المدير\n\n📊 الأوامر:\n/help - المساعدة\n/status - الحالة`;
    } else {
      message = `👋 مرحباً ${user.first_name}!\n\nاستخدم /help للمساعدة`;
    }
    
    await ctx.reply(message);
    logger.command(user.telegram_id, 'start');
  } catch (error) {
    logger.error('Start command failed', { error: error.message });
    await ctx.reply('❌ حدث خطأ');
  }
});

// Help Command
bot.command('help', async (ctx) => {
  try {
    const user = await getUser(ctx);
    
    let message = '📚 المساعدة\n\n';
    message += '• /start - البدء\n';
    message += '• /help - المساعدة\n';
    
    if (user.role === permissions.roles.SUPER_ADMIN.name || user.role === permissions.roles.ADMIN.name) {
      message += '• /status - حالة النظام\n';
      message += '• /stats - الإحصائيات\n';
    }
    
    await ctx.reply(message);
    logger.command(user.telegram_id, 'help');
  } catch (error) {
    logger.error('Help command failed', { error: error.message });
    await ctx.reply('❌ حدث خطأ');
  }
});

// Status Command
bot.command('status', async (ctx) => {
  try {
    const user = await getUser(ctx);
    
    if (user.role !== permissions.roles.SUPER_ADMIN.name && user.role !== permissions.roles.ADMIN.name) {
      await ctx.reply('⛔ غير مصرح');
      return;
    }
    
    const stats = await dbService.models.user.getStatistics();
    
    let message = '📊 حالة النظام\n\n';
    message += '✅ البوت يعمل\n';
    message += '✅ قاعدة البيانات متصلة\n\n';
    message += `المستخدمين: ${stats.total || 0}\n`;
    
    await ctx.reply(message);
    logger.command(user.telegram_id, 'status');
  } catch (error) {
    logger.error('Status command failed', { error: error.message });
    await ctx.reply('❌ خطأ في جلب البيانات');
  }
});

// Stats Command
bot.command('stats', async (ctx) => {
  try {
    const user = await getUser(ctx);
    
    if (user.role !== permissions.roles.SUPER_ADMIN.name && user.role !== permissions.roles.ADMIN.name) {
      await ctx.reply('⛔ غير مصرح');
      return;
    }
    
    const stats = await dbService.models.user.getStatistics();
    
    let message = '📈 الإحصائيات\n\n';
    message += `المستخدمين: ${stats.total || 0}\n`;
    message += `النشطين: ${stats.active || 0}\n`;
    message += `المشرفين: ${stats.admins || 0}\n`;
    
    await ctx.reply(message);
    logger.command(user.telegram_id, 'stats');
  } catch (error) {
    logger.error('Stats command failed', { error: error.message });
    await ctx.reply('❌ خطأ');
  }
});

// Error handler
bot.catch((error, ctx) => {
  logger.error('Unhandled bot error', { error: error.message, userId: ctx.from?.id });
  ctx.reply('❌ خطأ غير متوقع').catch(() => {});
});

// Start bot
async function startBot() {
  try {
    await initialize();
    await bot.launch();
    
    logger.system('info', '✅ Bot running...');
    
    process.once('SIGINT', () => stop('SIGINT'));
    process.once('SIGTERM', () => stop('SIGTERM'));
  } catch (error) {
    logger.system('error', 'Start failed', { error: error.message });
    process.exit(1);
  }
}

async function stop(signal) {
  logger.system('info', `${signal} - Stopping...`);
  bot.stop(signal);
  await dbService.disconnect();
  process.exit(0);
}

if (require.main === module) {
  startBot();
}

module.exports = { bot, startBot };
