/**
 * ===================================
 * Authentication & Authorization Middleware
 * ===================================
 */

const permissionService = require('../services/permission.service');
const dbService = require('../services/database.service');
const logger = require('../utils/logger.util');
const messageService = require('../services/message.service');
const { PERMISSIONS, ROLES } = require('../../config/permissions.config');
const botConfig = require('../../config/bot.config');

const VISITOR_ALLOWED_COMMANDS = ['/start'];

const COMMAND_PERMISSIONS = {
  '/help': PERMISSIONS.GENERAL_HELP,
  '/menu': PERMISSIONS.GENERAL_MENU,
  '/profile': PERMISSIONS.GENERAL_PROFILE,
  '/stats': PERMISSIONS.GENERAL_STATS,
  '/users': PERMISSIONS.ADMINISTRATION_USERS,
  '/requests': PERMISSIONS.ADMINISTRATION_REQUESTS,
  '/system': PERMISSIONS.SYSTEM_SETTINGS,
  '/logs': PERMISSIONS.SYSTEM_LOGS,
  '/backup': PERMISSIONS.SYSTEM_BACKUP,
};

async function authMiddleware(ctx, next) {
  const from = ctx.from;
  if (!from) {
    logger.warn('Update received without a "from" field.', 'Auth');
    return;
  }

  try {
    let user = await dbService.getUserByTelegramId(from.id);

    if (botConfig.isSuperAdmin(from.id)) {
      // User is the designated Super Admin. Grant full access.
      if (!user) {
        // If super admin is not in DB, create them.
        user = await dbService.createUser({
          telegram_id: from.id,
          username: from.username,
          first_name: from.first_name,
          last_name: from.last_name,
          role: ROLES.SUPER_ADMIN,
          status: 'active',
        });
      } else if (user.role !== ROLES.SUPER_ADMIN) {
        // Ensure the role is correct in the DB as well.
        user.role = ROLES.SUPER_ADMIN;
        await dbService.updateUser(from.id, { role: ROLES.SUPER_ADMIN });
      }
    } else if (!user) {
      // User is not Super Admin and not in DB. Treat as a visitor.
      user = {
        telegram_id: from.id,
        username: from.username,
        first_name: from.first_name,
        last_name: from.last_name,
        role: ROLES.VISITOR,
        isNew: true,
      };
    }

    // Attach user object to the context.
    ctx.user = user;
    ctx.userId = from.id;

    return next();
  } catch (error) {
    logger.error('Error in authentication middleware:', 'Auth', error);
    await ctx.reply(messageService.get('error.generic'));
  }
}

async function permissionMiddleware(ctx, next) {
  const command = ctx.message?.text?.split(' ')[0];
  if (!command || !command.startsWith('/')) {
    return next();
  }

  const { user } = ctx;

  if (user.role === ROLES.VISITOR) {
    if (!VISITOR_ALLOWED_COMMANDS.includes(command)) {
      logger.warn(`Visitor (ID: ${user.telegram_id}) blocked from accessing: ${command}`, 'Auth');
      await ctx.reply(messageService.get('error.permissionDenied'));
      return;
    }
    return next();
  }

  if (user.status === 'banned') {
    logger.warn(`Banned user (ID: ${user.telegram_id}) attempted to use: ${command}`, 'Auth');
    await ctx.reply('You are banned from using this bot.');
    return;
  }

  const requiredPermission = COMMAND_PERMISSIONS[command];
  if (!requiredPermission) {
    return next();
  }

  try {
    const hasPermission = await permissionService.hasPermission(user.role, requiredPermission);
    if (!hasPermission) {
      logger.warn(`Permission denied for ${user.telegram_id} (${user.role}) on ${command}`, 'Auth');
      await ctx.reply(messageService.get('error.permissionDenied'));
      return;
    }
    return next();
  } catch (error) {
    logger.error(`Error checking permission for ${command}:`, 'Auth', error);
    await ctx.reply(messageService.get('error.generic'));
  }
}

module.exports = {
  authMiddleware,
  permissionMiddleware,
};