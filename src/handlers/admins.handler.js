/**
 * Admins Command Handler
 * Handles /admins command for managing administrators
 */

const cacheService = require('../services/cache.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const { buildAdminsKeyboard } = require('../keyboards/admins.keyboard');
const logger = require('../utils/logger.util');

/**
 * Handle /admins command
 * @param {object} ctx - Telegraf context
 */
async function handleAdmins(ctx) {
  try {
    const telegramId = ctx.from.id;
    const user = ctx.user; // Provided by authMiddleware
    
    logger.command('info', `/admins command executed by user ${telegramId} (${user.role})`);
    
    // Check if user is Super Admin
    if (user.role !== 'super_admin') {
      await ctx.reply('⛔ هذا الأمر متاح للمالك فقط.');
      logger.security('warn', `Unauthorized admins access attempt by user ${telegramId} (${user.role})`);
      return;
    }
    
    // Get all admins
    const admins = await dbService.getAllAdmins();
    
    // Build message with admin list
    const message = buildAdminsMessage(admins);
    
    // Build keyboard with admin actions
    const keyboard = buildAdminsKeyboard(admins);
    
    // Send message with keyboard
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
    logger.command('info', `/admins command completed for user ${telegramId}`);
    
  } catch (error) {
    logger.command('error', `/admins command failed`, {
      error: error.message,
      stack: error.stack
    });
    
    const errorMessage = messageService.get('error.generic');
    await ctx.reply(errorMessage).catch(() => {});
  }
}

/**
 * Build admin list message
 * @param {Array} admins - List of admin users
 * @returns {string} Formatted message
 */
function buildAdminsMessage(admins) {
  if (!admins || admins.length === 0) {
    return '❌ لا يوجد مشرفون في النظام.';
  }
  
  let message = '👥 **قائمة المشرفين**\n\n';
  
  admins.forEach((admin, index) => {
    const statusEmoji = admin.status === 'active' ? '🟢' : '🔴';
    const roleDisplay = admin.role === 'super_admin' ? 'مالك النظام' : 'مشرف';
    const lastActive = admin.last_activity 
      ? new Date(admin.last_activity).toLocaleString('ar-EG')
      : 'غير متاح';
    
    message += `*${index + 1}. ${admin.first_name || 'مستخدم'} ${admin.last_name || ''}*\n`;
    message += `   ${statusEmoji} الحالة: ${admin.status === 'active' ? 'نشط' : 'غير نشط'}\n`;
    message += `   👤 الدور: ${roleDisplay}\n`;
    message += `   📅 آخر نشاط: ${lastActive}\n`;
    message += `   📱 معرف التليجرام: @${admin.username || 'غير متاح'}\n\n`;
  });
  
  return message;
}

/**
 * Handle admin action callbacks
 * @param {object} ctx - Telegraf context
 */
async function handleAdminAction(ctx) {
  try {
    const callbackData = ctx.callbackQuery.data;
    const telegramId = ctx.from.id;
    
    // Answer callback query to remove the loading indicator
    await ctx.answerCbQuery();
    
    // Extract action and admin ID from callback data
    const [action, adminId] = callbackData.split('_').slice(1);
    
    if (!action || !adminId) {
      await ctx.reply('❌ بيانات غير صالحة.');
      return;
    }
    
    // Handle different actions
    switch (action) {
      case 'view':
        await viewAdminDetails(ctx, adminId);
        break;
      case 'promote':
        await promoteAdmin(ctx, adminId);
        break;
      case 'demote':
        await demoteAdmin(ctx, adminId);
        break;
      case 'deactivate':
        await deactivateAdmin(ctx, adminId);
        break;
      case 'activate':
        await activateAdmin(ctx, adminId);
        break;
      case 'remove':
        await removeAdmin(ctx, adminId);
        break;
      default:
        await ctx.reply('❌ إجراء غير معروف.');
    }
    
  } catch (error) {
    logger.error('Error handling admin action:', error);
    await ctx.answerCbQuery('❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
  }
}

// Helper functions for admin actions
async function viewAdminDetails(ctx, adminId) {
  // Implementation for viewing admin details
  await ctx.reply('عرض تفاصيل المشرف: ' + adminId);
}

async function promoteAdmin(ctx, adminId) {
  // Implementation for promoting admin to super admin
  await ctx.reply('ترقية المشرف: ' + adminId);
}

async function demoteAdmin(ctx, adminId) {
  // Implementation for demoting super admin to regular admin
  await ctx.reply('خفض رتبة المشرف: ' + adminId);
}

async function deactivateAdmin(ctx, adminId) {
  // Implementation for deactivating admin
  await ctx.reply('تعطيل المشرف: ' + adminId);
}

async function activateAdmin(ctx, adminId) {
  // Implementation for activating admin
  await ctx.reply('تفعيل المشرف: ' + adminId);
}

async function removeAdmin(ctx, adminId) {
  // Implementation for removing admin
  await ctx.reply('حذف المشرف: ' + adminId);
}

module.exports = {
  handleAdmins,
  handleAdminAction
};
