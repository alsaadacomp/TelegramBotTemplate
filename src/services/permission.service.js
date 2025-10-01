/**
 * ====================================
 * Permission Service
 * ====================================
 * خدمة إدارة الصلاحيات والأدوار
 * * المسؤوليات:
 * - التحقق من صلاحيات المستخدمين
 * - إدارة الأدوار (تعيين، إزالة، تحديث)
 * - التحقق من الوصول للأقسام
 * - إدارة الصلاحيات المخصصة
 * * @module services/permission
 */

const { ROLES, PERMISSIONS, ROLE_HIERARCHY } = require('../../config/permissions.config');
const dbService = require('./database.service');
const cacheService = require('./cache.service');
const logger = require('../utils/logger.util');
const { PermissionError } = require('../utils/error-handler.util');

/**
 * Permission Service Class
 */
class PermissionService {
  constructor() {
    this.dbService = dbService;
    this.cacheService = cacheService;
    this.initialized = false;
  }

  /**
   * تهيئة الخدمة
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.dbService.initialize();
      this.initialized = true;
      logger.info('Permission service initialized successfully', 'PERMISSION');
    } catch (error) {
      logger.error('Failed to initialize permission service', 'PERMISSION', error);
      throw error;
    }
  }

  // ================================
  // دوال التحقق من الصلاحيات
  // ================================

  /**
   * التحقق من صلاحية محددة للمستخدم
   * @param {number} userId - معرف المستخدم في Telegram
   * @param {string} permission - اسم الصلاحية
   * @returns {Promise<boolean>}
   */
  async checkPermission(userId, permission) {
    try {
      // التحقق من الكاش أولاً
      const cacheKey = `${userId}:${permission}`;
      const cached = this.cacheService.get('permissions', cacheKey);
      if (cached !== undefined) {
        logger.debug(`Permission check from cache: ${userId} -> ${permission} = ${cached}`, 'PERMISSION');
        return cached;
      }

      // الحصول على دور المستخدم
      const userRole = await this.getUserRole(userId);
      
      if (!userRole) {
        logger.warn(`User ${userId} has no role assigned`, 'PERMISSION');
        return false;
      }

      // التحقق من الصلاحية
      const hasPermission = this._hasPermission(userRole, permission);

      // حفظ في الكاش (15 دقيقة)
      this.cacheService.set('permissions', cacheKey, hasPermission, 900);

      logger.info(`Permission check: ${userId} (${userRole}) -> ${permission} = ${hasPermission}`, 'PERMISSION');
      return hasPermission;
    } catch (error) {
      logger.error(`Error checking permission for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من عدة صلاحيات (يجب أن يملك كلها)
   * @param {number} userId - معرف المستخدم
   * @param {string[]} permissions - قائمة الصلاحيات
   * @returns {Promise<boolean>}
   */
  async checkPermissions(userId, permissions) {
    try {
      for (const permission of permissions) {
        const has = await this.checkPermission(userId, permission);
        if (!has) return false;
      }
      return true;
    } catch (error) {
      logger.error(`Error checking multiple permissions for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من صلاحية واحدة على الأقل (OR)
   * @param {number} userId - معرف المستخدم
   * @param {string[]} permissions - قائمة الصلاحيات
   * @returns {Promise<boolean>}
   */
  async checkAnyPermission(userId, permissions) {
    try {
      for (const permission of permissions) {
        const has = await this.checkPermission(userId, permission);
        if (has) return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error checking any permission for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من دور المستخدم
   * @param {number} userId - معرف المستخدم
   * @param {string} role - الدور المطلوب
   * @returns {Promise<boolean>}
   */
  async hasRole(userId, role) {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole === role;
    } catch (error) {
      logger.error(`Error checking role for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من عدة أدوار (OR)
   * @param {number} userId - معرف المستخدم
   * @param {string[]} roles - قائمة الأدوار
   * @returns {Promise<boolean>}
   */
  async hasAnyRole(userId, roles) {
    try {
      const userRole = await this.getUserRole(userId);
      return roles.includes(userRole);
    } catch (error) {
      logger.error(`Error checking any role for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من إمكانية الوصول لقسم محدد
   * @param {number} userId - معرف المستخدم
   * @param {string} sectionId - معرف القسم
   * @returns {Promise<boolean>}
   */
  async canAccessSection(userId, sectionId) {
    try {
      const cacheKey = `${userId}:${sectionId}:view`;
      const cached = this.cacheService.get('sections', cacheKey);
      if (cached !== undefined) return cached;
  
      const section = await this.dbService.getSection(sectionId);
      if (!section || !section.enabled) return false;
  
      let sectionPermissions = null;
      if (section.permissions) {
        // ✅ START: التعديل الذكي للتعامل مع JSON
        if (typeof section.permissions === 'string') {
          try {
            sectionPermissions = JSON.parse(section.permissions);
          } catch (e) {
            logger.warn(`Invalid JSON in permissions for section ${sectionId}`, 'PERMISSION');
            return false; 
          }
        } else {
          sectionPermissions = section.permissions;
        }
        // ✅ END: التعديل الذكي
      }
  
      if (!sectionPermissions || !Array.isArray(sectionPermissions.view) || sectionPermissions.view.length === 0) {
        this.cacheService.set('sections', cacheKey, true, 900);
        return true;
      }
  
      const userRole = await this.getUserRole(userId);
      const hasAccess = sectionPermissions.view.includes(userRole);
  
      this.cacheService.set('sections', cacheKey, hasAccess, 900);
      return hasAccess;
    } catch (error) {
      logger.error(`Error checking section access for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  /**
   * التحقق من إمكانية تنفيذ إجراء في قسم
   * @param {number} userId - معرف المستخدم
   * @param {string} sectionId - معرف القسم
   * @param {string} action - الإجراء (view, create, edit, delete, execute)
   * @returns {Promise<boolean>}
   */
  async canPerformAction(userId, sectionId, action) {
    try {
      const cacheKey = `${userId}:${sectionId}:${action}`;
      const cached = this.cacheService.get('sections', cacheKey);
      if (cached !== undefined) return cached;
  
      const section = await this.dbService.getSection(sectionId);
      if (!section || !section.enabled) return false;
  
      let sectionPermissions = null;
      if (section.permissions) {
        // ✅ START: التعديل الذكي للتعامل مع JSON
        if (typeof section.permissions === 'string') {
          try {
            sectionPermissions = JSON.parse(section.permissions);
          } catch (e) {
            logger.warn(`Invalid JSON in permissions for section ${sectionId}`, 'PERMISSION');
            return false;
          }
        } else {
          sectionPermissions = section.permissions;
        }
        // ✅ END: التعديل الذكي
      }
  
      if (!sectionPermissions || !sectionPermissions[action]) {
        return this.canAccessSection(userId, sectionId);
      }
  
      const userRole = await this.getUserRole(userId);
      const hasAccess = Array.isArray(sectionPermissions[action]) && sectionPermissions[action].includes(userRole);
      
      this.cacheService.set('sections', cacheKey, hasAccess, 900);
      return hasAccess;
    } catch (error) {
      logger.error(`Error checking action permission for user ${userId}`, 'PERMISSION', error);
      return false;
    }
  }

  // ================================
  // دوال إدارة الأدوار
  // ================================

  async getUserRole(userId) {
    try {
      const cacheKey = `${userId}`;
      const cached = this.cacheService.get('users', cacheKey);
      if (cached) {
        return cached.role;
      }
      const user = await this.dbService.getUserByTelegramId(userId);
      if (!user) {
        logger.warn(`User ${userId} not found in database`, 'PERMISSION');
        return null;
      }
      const role = user.role || ROLES.USER;
      this.cacheService.set('users', cacheKey, { role }, 1800);
      return role;
    } catch (error) {
      logger.error(`Error getting role for user ${userId}`, 'PERMISSION', error);
      return null;
    }
  }

  async assignRole(userId, role, adminId) {
    try {
      if (!Object.values(ROLES).includes(role)) {
        throw new PermissionError(`Invalid role: ${role}`);
      }
      const adminUser = await this.dbService.getUserByTelegramId(adminId);
      if (!adminUser) {
        throw new PermissionError('Admin user not found');
      }
      const canAssign = await this.checkPermission(adminId, 'USERS_EDIT');
      if (!canAssign) {
        throw new PermissionError('You do not have permission to assign roles');
      }
      if (!this._canManageRole(adminUser.role, role)) {
        throw new PermissionError(`Cannot assign role ${role} with your current role`);
      }
      const userToUpdate = await this.dbService.getUserByTelegramId(userId);
      if (!userToUpdate) {
        throw new Error(`User with telegram_id ${userId} not found.`);
      }
      const updated = await this.dbService.updateUser(userToUpdate.id, { role });
      if (!updated) {
        throw new Error('Failed to update user role in database');
      }
      this._invalidateUserCache(userId);
      logger.info(`Role assigned: ${userId} -> ${role} by ${adminId}`, 'PERMISSION');
      await this.dbService.createLog({
        level: 'info',
        message: `Role assigned: ${userId} -> ${role} by ${adminId}`,
        user_id: adminUser.id,
        action: 'ASSIGN_ROLE',
        metadata: JSON.stringify({
          target_user: userId,
          new_role: role
        })
      });
      return true;
    } catch (error) {
      logger.error(`Error assigning role to user ${userId}`, 'PERMISSION', error);
      throw error;
    }
  }

  async removeRole(userId, adminId) {
    return this.assignRole(userId, ROLES.USER, adminId);
  }

  async promoteUser(userId, adminId) {
    try {
      const currentRole = await this.getUserRole(userId);
      const nextRole = this._getNextRole(currentRole);
      if (!nextRole) {
        throw new PermissionError('User is already at the highest role');
      }
      return this.assignRole(userId, nextRole, adminId);
    } catch (error) {
      logger.error(`Error promoting user ${userId}`, 'PERMISSION', error);
      throw error;
    }
  }

  async demoteUser(userId, adminId) {
    try {
      const currentRole = await this.getUserRole(userId);
      const previousRole = this._getPreviousRole(currentRole);
      if (!previousRole) {
        throw new PermissionError('User is already at the lowest role');
      }
      return this.assignRole(userId, previousRole, adminId);
    } catch (error) {
      logger.error(`Error demoting user ${userId}`, 'PERMISSION', error);
      throw error;
    }
  }

  // ================================
  // دوال الإحصائيات والإدارة
  // ================================

  async getUsersByRole(role) {
    try {
      const users = await this.dbService.getUsersByRole(role);
      logger.info(`Retrieved ${users.length} users with role ${role}`, 'PERMISSION');
      return users;
    } catch (error) {
      logger.error(`Error getting users by role ${role}`, 'PERMISSION', error);
      return [];
    }
  }

  async getRoleStats() {
    try {
      const stats = {};
      for (const role of Object.values(ROLES)) {
        const users = await this.getUsersByRole(role);
        stats[role] = users.length;
      }
      logger.info('Retrieved role statistics', 'PERMISSION');
      return stats;
    } catch (error) {
      logger.error('Error getting role statistics', 'PERMISSION', error);
      return {};
    }
  }

  async getUserPermissions(userId) {
    try {
      const role = await this.getUserRole(userId);
      if (!role) return [];
      const permissions = [];
      for (const [permission, roles] of Object.entries(PERMISSIONS)) {
        if (roles.includes(role)) {
          permissions.push(permission);
        }
      }
      return permissions;
    } catch (error) {
      logger.error(`Error getting permissions for user ${userId}`, 'PERMISSION', error);
      return [];
    }
  }

  // ================================
  // دوال مساعدة خاصة
  // ================================

  _hasPermission(role, permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
      logger.warn(`Unknown permission: ${permission}`, 'PERMISSION');
      return false;
    }
    return allowedRoles.includes(role);
  }

  _canManageRole(adminRole, targetRole) {
    const adminLevel = ROLE_HIERARCHY[adminRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return adminLevel > targetLevel;
  }

  _getNextRole(currentRole) {
    const hierarchy = [ROLES.USER, ROLES.MODERATOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    const currentIndex = hierarchy.indexOf(currentRole);
    if (currentIndex === -1 || currentIndex === hierarchy.length - 1) return null;
    return hierarchy[currentIndex + 1];
  }

  _getPreviousRole(currentRole) {
    const hierarchy = [ROLES.USER, ROLES.MODERATOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    const currentIndex = hierarchy.indexOf(currentRole);
    if (currentIndex <= 0) return null;
    return hierarchy[currentIndex - 1];
  }

  _invalidateUserCache(userId) {
    this.cacheService.delete('users', userId.toString());
    this.cacheService.deleteWithPrefix('permissions', `${userId}:`);
    this.cacheService.deleteWithPrefix('sections', `${userId}:`);
    logger.debug(`Cache invalidated for user ${userId}`, 'PERMISSION');
  }

  async cleanup() {
    try {
      await this.dbService.cleanup();
      this.initialized = false;
      logger.info('Permission service cleaned up', 'PERMISSION');
    } catch (error) {
      logger.error('Error cleaning up permission service', 'PERMISSION', error);
    }
  }
}

let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new PermissionService();
    }
    return instance;
  },
  createInstance: () => new PermissionService()
};