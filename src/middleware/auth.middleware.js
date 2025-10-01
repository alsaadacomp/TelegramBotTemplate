/**
 * ====================================
 * Authentication & Authorization Middleware
 * ====================================
 * وسيط التحقق من الهوية والصلاحيات
 * 
 * المسؤوليات:
 * - التحقق من تسجيل المستخدم
 * - التحقق من الصلاحيات قبل تنفيذ الأوامر
 * - معالجة الأخطاء الأمنية
 * - تسجيل محاولات الوصول غير المصرح بها
 * - حماية الأوامر الإدارية
 * 
 * @module middleware/auth
 */

const { getInstance: getPermissionService } = require('../services/permission.service');
const dbService = require('../services/database.service');
const logger = require('../utils/logger.util');
const { PermissionError, NotFoundError } = require('../utils/error-handler.util');
const { ROLES } = require('../../config/permissions.config');

/**
 * قائمة الأوامر المتاحة للجميع (لا تحتاج صلاحيات)
 */
const PUBLIC_COMMANDS = [
  '/start',
  '/help',
  '/about',
  '/cancel'
];

/**
 * مصفوفة الأوامر والصلاحيات المطلوبة
 */
const COMMAND_PERMISSIONS = {
  // أوامر النظام
  '/system': 'SYSTEM_SETTINGS',
  '/backup': 'SYSTEM_BACKUP',
  '/restart': 'SYSTEM_MANAGE',
  
  // أوامر قاعدة البيانات
  '/db': 'SYSTEM_SETTINGS',
  
  // أوامر المستخدمين
  '/users': 'USERS_VIEW',
  '/adduser': 'USERS_EDIT',
  '/removeuser': 'USERS_DELETE',
  '/setrole': 'USERS_EDIT',
  '/ban': 'USERS_EDIT',
  '/unban': 'USERS_EDIT',
  
  // أوامر الأقسام
  '/sections': 'SECTIONS_VIEW',
  '/addsection': 'SECTIONS_CREATE',
  '/editsection': 'SECTIONS_EDIT',
  '/deletesection': 'SECTIONS_DELETE',
  '/togglesection': 'SECTIONS_TOGGLE',
  
  // أوامر البيانات
  '/export': 'DATA_EXPORT',
  '/import': 'DATA_CREATE',
  
  // أوامر البث
  '/broadcast': 'BROADCAST_ALL',
  '/notify': 'BROADCAST_ROLE',
  
  // أوامر السجلات
  '/logs': 'LOGS_VIEW',
  '/cleanlogs': 'LOGS_DELETE',
  
  // أوامر التقارير
  '/stats': 'DATA_VIEW',
  '/report': 'DATA_VIEW'
};

/**
 * ==================================
 * Middleware الرئيسي للمصادقة
 * ==================================
 */
async function authMiddleware(ctx, next) {
  try {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || 'Unknown';
    const command = ctx.message?.text?.split(' ')[0];

    // التحقق من وجود معرف المستخدم
    if (!userId) {
      logger.warn('Message received without user ID', 'AUTH');
      await ctx.reply('⚠️ خطأ في التعرف على المستخدم');
      return;
    }

    // الحصول على أو إنشاء المستخدم
    let user = await dbService.getUserByTelegramId(userId);

    if (!user) {
      // إنشاء مستخدم جديد
      logger.info(`Creating new user: ${userId} (${username})`, 'AUTH');
      
      user = await dbService.createUser({
        telegram_id: userId,
        username: username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        role: ROLES.USER,
        status: 'active'
      });
    } else {
      // تحديث آخر نشاط
      await dbService.updateUser(userId, {
        last_active: new Date().toISOString()
      });
    }

    // إرفاق المستخدم بالسياق
    ctx.user = user;
    ctx.userId = userId;

    // التحقق من حالة المستخدم
    if (user.status === 'banned') {
      logger.warn(`Banned user tried to access: ${userId}`, 'AUTH');
      await ctx.reply('⛔ تم حظرك من استخدام البوت');
      return;
    }

    if (user.status === 'inactive') {
      logger.warn(`Inactive user tried to access: ${userId}`, 'AUTH');
      await ctx.reply('⚠️ حسابك غير نشط. يرجى التواصل مع المسؤول');
      return;
    }

    // تسجيل الوصول
    logger.debug(`User access: ${userId} (${user.role}) - Command: ${command || 'none'}`, 'AUTH');

    // المتابعة للخطوة التالية
    await next();

  } catch (error) {
    logger.error('Error in auth middleware', 'AUTH', error);
    await ctx.reply('❌ حدث خطأ في التحقق من الهوية');
  }
}

/**
 * ==================================
 * Middleware التحقق من الصلاحيات
 * ==================================
 */
async function checkPermissionMiddleware(ctx, next) {
  try {
    const userId = ctx.userId;
    const command = ctx.message?.text?.split(' ')[0];

    // تجاهل إذا لم يكن أمر
    if (!command || !command.startsWith('/')) {
      return await next();
    }

    // السماح بالأوامر العامة
    if (PUBLIC_COMMANDS.includes(command)) {
      return await next();
    }

    // التحقق من الصلاحية المطلوبة
    const requiredPermission = COMMAND_PERMISSIONS[command];

    if (requiredPermission) {
      const permissionService = getPermissionService();
      const hasPermission = await permissionService.checkPermission(userId, requiredPermission);

      if (!hasPermission) {
        const user = ctx.user;
        logger.warn(
          `Permission denied: ${userId} (${user.role}) tried to execute ${command}`,
          'AUTH'
        );

        // تسجيل المحاولة
        await dbService.logAction({
          user_id: userId,
          action: 'PERMISSION_DENIED',
          metadata: JSON.stringify({
            command,
            required_permission: requiredPermission,
            user_role: user.role
          })
        });

        await ctx.reply(
          `⛔ عذراً، ليس لديك صلاحية لتنفيذ هذا الأمر\n\n` +
          `الأمر: ${command}\n` +
          `الصلاحية المطلوبة: ${requiredPermission}\n` +
          `دورك الحالي: ${user.role}`
        );
        return;
      }

      logger.info(`Permission granted: ${userId} -> ${command}`, 'AUTH');
    }

    // المتابعة للخطوة التالية
    await next();

  } catch (error) {
    logger.error('Error in permission check middleware', 'AUTH', error);
    await ctx.reply('❌ حدث خطأ في التحقق من الصلاحيات');
  }
}

/**
 * ==================================
 * Middleware التحقق من الدور
 * ==================================
 * 
 * يتحقق من أن المستخدم يملك دور محدد
 * 
 * @param {string|string[]} allowedRoles - الدور أو قائمة الأدوار المسموحة
 * @returns {Function}
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (ctx, next) => {
    try {
      const userId = ctx.userId;
      const user = ctx.user;

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const hasRole = roles.includes(user.role);

      if (!hasRole) {
        logger.warn(
          `Role check failed: ${userId} (${user.role}) needs one of [${roles.join(', ')}]`,
          'AUTH'
        );

        await ctx.reply(
          `⛔ هذا الأمر متاح فقط لـ: ${roles.join(', ')}\n` +
          `دورك الحالي: ${user.role}`
        );
        return;
      }

      logger.debug(`Role check passed: ${userId} (${user.role})`, 'AUTH');
      await next();

    } catch (error) {
      logger.error('Error in role check middleware', 'AUTH', error);
      await ctx.reply('❌ حدث خطأ في التحقق من الدور');
    }
  };
}

/**
 * ==================================
 * Middleware التحقق من صلاحية محددة
 * ==================================
 * 
 * يتحقق من أن المستخدم يملك صلاحية محددة
 * 
 * @param {string|string[]} requiredPermissions - الصلاحية أو قائمة الصلاحيات
 * @param {boolean} requireAll - هل يجب امتلاك كل الصلاحيات (default: true)
 * @returns {Function}
 */
function requirePermission(requiredPermissions, requireAll = true) {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return async (ctx, next) => {
    try {
      const userId = ctx.userId;
      const permissionService = getPermissionService();

      let hasPermission;
      
      if (requireAll) {
        hasPermission = await permissionService.checkPermissions(userId, permissions);
      } else {
        hasPermission = await permissionService.checkAnyPermission(userId, permissions);
      }

      if (!hasPermission) {
        logger.warn(
          `Permission denied: ${userId} needs ${requireAll ? 'all' : 'any'} of [${permissions.join(', ')}]`,
          'AUTH'
        );

        await ctx.reply(
          `⛔ ليس لديك الصلاحية المطلوبة\n\n` +
          `الصلاحيات المطلوبة: ${permissions.join(', ')}`
        );
        return;
      }

      logger.debug(`Permission check passed: ${userId}`, 'AUTH');
      await next();

    } catch (error) {
      logger.error('Error in permission requirement middleware', 'AUTH', error);
      await ctx.reply('❌ حدث خطأ في التحقق من الصلاحيات');
    }
  };
}

/**
 * ==================================
 * Middleware للمسؤولين فقط
 * ==================================
 */
const adminOnly = requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

/**
 * ==================================
 * Middleware للسوبر أدمن فقط
 * ==================================
 */
const superAdminOnly = requireRole(ROLES.SUPER_ADMIN);

/**
 * ==================================
 * Middleware التحقق من الوصول للقسم
 * ==================================
 * 
 * @param {string} sectionId - معرف القسم
 * @returns {Function}
 */
function requireSectionAccess(sectionId) {
  return async (ctx, next) => {
    try {
      const userId = ctx.userId;
      const permissionService = getPermissionService();

      const hasAccess = await permissionService.canAccessSection(userId, sectionId);

      if (!hasAccess) {
        logger.warn(`Section access denied: ${userId} -> ${sectionId}`, 'AUTH');
        await ctx.reply('⛔ ليس لديك صلاحية الوصول لهذا القسم');
        return;
      }

      logger.debug(`Section access granted: ${userId} -> ${sectionId}`, 'AUTH');
      await next();

    } catch (error) {
      logger.error('Error in section access check', 'AUTH', error);
      await ctx.reply('❌ حدث خطأ في التحقق من الوصول');
    }
  };
}

/**
 * ==================================
 * Middleware التحقق من إمكانية الإجراء
 * ==================================
 * 
 * @param {string} sectionId - معرف القسم
 * @param {string} action - الإجراء (view, create, edit, delete, execute)
 * @returns {Function}
 */
function requireSectionAction(sectionId, action) {
  return async (ctx, next) => {
    try {
      const userId = ctx.userId;
      const permissionService = getPermissionService();

      const canPerform = await permissionService.canPerformAction(userId, sectionId, action);

      if (!canPerform) {
        logger.warn(
          `Section action denied: ${userId} -> ${sectionId}.${action}`,
          'AUTH'
        );
        await ctx.reply(`⛔ ليس لديك صلاحية ${action} في هذا القسم`);
        return;
      }

      logger.debug(`Section action granted: ${userId} -> ${sectionId}.${action}`, 'AUTH');
      await next();

    } catch (error) {
      logger.error('Error in section action check', 'AUTH', error);
      await ctx.reply('❌ حدث خطأ في التحقق من الصلاحيات');
    }
  };
}

/**
 * ==================================
 * Middleware تسجيل الأوامر
 * ==================================
 */
async function logCommandMiddleware(ctx, next) {
  try {
    const userId = ctx.userId;
    const command = ctx.message?.text?.split(' ')[0];

    if (command && command.startsWith('/')) {
      await dbService.logAction({
        user_id: userId,
        action: 'COMMAND_EXECUTED',
        metadata: JSON.stringify({
          command,
          full_text: ctx.message.text
        })
      });

      logger.info(`Command executed: ${command} by ${userId}`, 'AUTH');
    }

    await next();

  } catch (error) {
    logger.error('Error in command log middleware', 'AUTH', error);
    // لا نوقف التنفيذ حتى لو فشل التسجيل
    await next();
  }
}

// ================================
// التصدير
// ================================

module.exports = {
  // Middleware الرئيسية
  authMiddleware,
  checkPermissionMiddleware,
  logCommandMiddleware,
  
  // Middleware الأدوار
  requireRole,
  adminOnly,
  superAdminOnly,
  
  // Middleware الصلاحيات
  requirePermission,
  
  // Middleware الأقسام
  requireSectionAccess,
  requireSectionAction,
  
  // الثوابت
  PUBLIC_COMMANDS,
  COMMAND_PERMISSIONS
};
