/**
 * ====================================
 * Permission Service
 * ====================================
 * Manages user roles, permissions, and join requests.
 *
 * @module services/permission
 */

const permissionsConfig = require('../../config/permissions.config');
const dbService = require('./database.service');
const cacheService = require('./cache.service');
const logger = require('../utils/logger.util');

class PermissionService {
  constructor() {
    this.dbService = dbService;
    this.cacheService = cacheService;
  }

  /**
   * Checks if a user's role has a specific permission.
   * @param {string} roleName - The name of the role (e.g., 'admin').
   * @param {string} permission - The permission string (e.g., 'general.menu').
   * @returns {Promise<boolean>}
   */
  async hasPermission(roleName, permission) {
    const cacheKey = `role:${roleName}:${permission}`;
    const cachedResult = this.cacheService.get('permissions', cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const hasPerm = permissionsConfig.hasPermission(roleName, permission);
    this.cacheService.set('permissions', cacheKey, hasPerm, 3600); // Cache for 1 hour
    return hasPerm;
  }

  /**
   * Gets the role for a given user.
   * @param {number} telegramId - The user's Telegram ID.
   * @returns {Promise<string>}
   */
  async getUserRole(telegramId) {
    const cacheKey = `user:${telegramId}:role`;
    const cachedRole = this.cacheService.get('users', cacheKey);
    if (cachedRole) {
      return cachedRole;
    }

    const user = await this.dbService.getUserByTelegramId(telegramId);
    const role = user ? user.role : permissionsConfig.ROLES.VISITOR;

    this.cacheService.set('users', cacheKey, role, 900); // Cache for 15 minutes
    return role;
  }

  /**
   * Assigns a new role to a user.
   * @param {number} telegramId - The ID of the user to update.
   * @param {string} newRole - The new role to assign.
   * @param {number} adminId - The ID of the admin performing the action.
   */
  async assignRole(telegramId, newRole, adminId) {
    if (!Object.values(permissionsConfig.ROLES).includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const user = await this.dbService.getUserByTelegramId(telegramId);
    if (!user) {
      throw new Error(`User with ID ${telegramId} not found.`);
    }

    await this.dbService.updateUser(telegramId, { role: newRole });
    this.invalidateUserCache(telegramId);

    logger.info(`Role for user ${telegramId} changed to ${newRole} by admin ${adminId}.`, 'Permission');
    await this.dbService.logAction({
      user_id: adminId,
      action: 'ROLE_CHANGE',
      metadata: JSON.stringify({ target_user_id: telegramId, new_role: newRole }),
    });
  }

  /**
   * Creates a new join request in the database.
   * @param {object} requestData - Data for the join request.
   * @returns {Promise<object>}
   */
  async createJoinRequest(requestData) {
    const result = await this.dbService.createJoinRequest(requestData);
    logger.info(`New join request created for user ${requestData.telegram_id} with ID ${result.id}`, 'Permission');
    return result;
  }

  /**
   * Retrieves all pending join requests.
   * @returns {Promise<Array<object>>}
   */
  async getPendingRequests() {
    return this.dbService.getPendingJoinRequests();
  }

  /**
   * Approves a join request.
   * @param {number} requestId - The ID of the join request.
   * @param {number} adminId - The ID of the super_admin who approved it.
   * @returns {Promise<object>}
   */
  async approveRequest(requestId, adminId) {
    const request = await this.dbService.get('SELECT * FROM join_requests WHERE id = ?', [requestId]);
    if (!request || request.status !== 'pending') {
      throw new Error('Request not found or already processed.');
    }

    // 1. Create or update the user
    let user = await this.dbService.getUserByTelegramId(request.telegram_id);
    const userData = {
      telegram_id: request.telegram_id,
      username: request.username,
      first_name: request.first_name,
      last_name: request.last_name,
      role: permissionsConfig.ROLES.ADMIN, // Assign ADMIN role
      status: 'active',
      join_request_id: requestId,
    };

    if (user) {
      await this.dbService.updateUser(user.id, userData);
    } else {
      await this.dbService.createUser(userData);
    }

    // 2. Update the request status
    await this.dbService.updateJoinRequestStatus(requestId, 'approved', adminId);

    this.invalidateUserCache(request.telegram_id);
    logger.info(`Join request ${requestId} approved by admin ${adminId}. User ${request.telegram_id} is now an admin.`, 'Permission');
    return request; // Return the original request for notification purposes
  }

  /**
   * Rejects a join request.
   * @param {number} requestId - The ID of the join request.
   * @param {number} adminId - The ID of the super_admin who rejected it.
   * @param {string} reason - The reason for rejection.
   * @returns {Promise<object>}
   */
  async rejectRequest(requestId, adminId, reason) {
    const request = await this.dbService.get('SELECT * FROM join_requests WHERE id = ?', [requestId]);
    if (!request || request.status !== 'pending') {
      throw new Error('Request not found or already processed.');
    }

    await this.dbService.updateJoinRequestStatus(requestId, 'rejected', adminId, reason);

    logger.info(`Join request ${requestId} rejected by admin ${adminId}.`, 'Permission');
    return request;
  }

  /**
   * Checks if a user has access to a specific permission.
   * @param {number} telegramId - The user's Telegram ID.
   * @param {string} permission - The permission to check.
   * @returns {Promise<boolean>}
   */
  async checkAccess(telegramId, permission) {
    try {
      const role = await this.getUserRole(telegramId);
      return await this.hasPermission(role, permission);
    } catch (error) {
      logger.error(`Error checking access for user ${telegramId}: ${error.message}`, 'Permission');
      return false;
    }
  }

  /**
   * Gets all permissions for a user.
   * @param {number} telegramId - The user's Telegram ID.
   * @returns {Promise<Array<string>>}
   */
  async getUserPermissions(telegramId) {
    try {
      const role = await this.getUserRole(telegramId);
      return this.getRolePermissions(role);
    } catch (error) {
      logger.error(`Error getting permissions for user ${telegramId}: ${error.message}`, 'Permission');
      return [];
    }
  }

  /**
   * Checks if user has any of the specified permissions.
   * @param {number} telegramId - The user's Telegram ID.
   * @param {Array<string>} permissions - Array of permissions to check.
   * @returns {Promise<boolean>}
   */
  async hasAnyPermission(telegramId, permissions) {
    try {
      const role = await this.getUserRole(telegramId);
      return permissions.some(permission => permissionsConfig.hasPermission(role, permission));
    } catch (error) {
      logger.error(`Error checking any permission for user ${telegramId}: ${error.message}`, 'Permission');
      return false;
    }
  }

  /**
   * Checks if user has all of the specified permissions.
   * @param {number} telegramId - The user's Telegram ID.
   * @param {Array<string>} permissions - Array of permissions to check.
   * @returns {Promise<boolean>}
   */
  async hasAllPermissions(telegramId, permissions) {
    try {
      const role = await this.getUserRole(telegramId);
      return permissions.every(permission => permissionsConfig.hasPermission(role, permission));
    } catch (error) {
      logger.error(`Error checking all permissions for user ${telegramId}: ${error.message}`, 'Permission');
      return false;
    }
  }

  /**
   * Gets all permissions for a specific role.
   * @param {string} role - The role name.
   * @returns {Array<string>}
   */
  getRolePermissions(role) {
    try {
      return permissionsConfig.getPermissionsForRole(role);
    } catch (error) {
      logger.error(`Error getting permissions for role ${role}: ${error.message}`, 'Permission');
      return [];
    }
  }

  /**
   * Validates if a role is valid.
   * @param {string} role - The role to validate.
   * @returns {boolean}
   */
  isValidRole(role) {
    return Object.values(permissionsConfig.ROLES).includes(role);
  }

  /**
   * Gets all available roles.
   * @returns {Array<string>}
   */
  getAllRoles() {
    return Object.values(permissionsConfig.ROLES);
  }

  /**
   * Gets all available permissions.
   * @returns {Array<string>}
   */
  getAllPermissions() {
    return Object.keys(permissionsConfig.PERMISSIONS);
  }

  /**
   * Invalidates all caches related to a user.
   * @param {number} telegramId - The user's Telegram ID.
   */
  invalidateUserCache(telegramId) {
    const id = String(telegramId);
    this.cacheService.delete('users', `user:${id}:role`);
    this.cacheService.deleteWithPrefix('permissions', `role:${id}`);
    logger.debug(`Cache invalidated for user ${id}.`, 'Permission');
  }
}

// Export a singleton instance
const instance = new PermissionService();
module.exports = instance;
