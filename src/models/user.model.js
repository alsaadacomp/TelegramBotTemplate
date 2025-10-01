/**
 * User Model
 * Defines user schema and provides user-related database operations
 * 
 * @module models/user
 */

/**
 * User Model Class
 */
class UserModel {
  constructor(dbService) {
    this.db = dbService;
    this.tableName = 'users';
  }

  // ========================================
  // Table Schema
  // ========================================

  /**
   * Get table schema definition
   * @returns {Object} Schema definition
   */
  static getSchema() {
    return {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      telegram_id: 'INTEGER UNIQUE NOT NULL',
      username: 'TEXT',
      first_name: 'TEXT',
      last_name: 'TEXT',
      phone: 'TEXT',
      role: 'TEXT DEFAULT "user"',
      is_active: 'INTEGER DEFAULT 1',
      is_banned: 'INTEGER DEFAULT 0',
      banned_reason: 'TEXT',
      banned_at: 'TEXT',
      language: 'TEXT DEFAULT "ar"',
      last_activity: 'TEXT',
      created_at: 'TEXT NOT NULL',
      updated_at: 'TEXT',
    };
  }

  /**
   * Get default values for new user
   * @returns {Object} Default values
   */
  static getDefaults() {
    return {
      role: 'user',
      is_active: 1,
      is_banned: 0,
      language: 'ar',
      created_at: new Date().toISOString(),
    };
  }

  // ========================================
  // Table Initialization
  // ========================================

  /**
   * Initialize users table
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.db.createTable(this.tableName, UserModel.getSchema());
      console.log('UserModel: Table initialized');
    } catch (error) {
      console.error('UserModel: Failed to initialize table:', error);
      throw error;
    }
  }

  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    try {
      const data = {
        ...UserModel.getDefaults(),
        ...userData,
        created_at: new Date().toISOString(),
      };

      const user = await this.db.create(this.tableName, data);
      console.log(`UserModel: User created - ID: ${user.id}, Telegram ID: ${user.telegram_id}`);
      
      return user;
    } catch (error) {
      console.error('UserModel: Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Find users by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users array
   */
  async find(criteria = {}, options = {}) {
    try {
      return await this.db.find(this.tableName, criteria, options);
    } catch (error) {
      console.error('UserModel: Failed to find users:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id) {
    try {
      return await this.db.findById(this.tableName, id);
    } catch (error) {
      console.error('UserModel: Failed to find user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by Telegram ID
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<Object|null>} User or null
   */
  async findByTelegramId(telegramId) {
    try {
      return await this.db.findOne(this.tableName, { telegram_id: telegramId });
    } catch (error) {
      console.error('UserModel: Failed to find user by Telegram ID:', error);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User or null
   */
  async findByUsername(username) {
    try {
      return await this.db.findOne(this.tableName, { username });
    } catch (error) {
      console.error('UserModel: Failed to find user by username:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const success = await this.db.updateById(this.tableName, id, updateData);
      
      if (success) {
        console.log(`UserModel: User updated - ID: ${id}`);
      }
      
      return success;
    } catch (error) {
      console.error('UserModel: Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Update user by Telegram ID
   * @param {number} telegramId - Telegram ID
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of updated records
   */
  async updateByTelegramId(telegramId, data) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      return await this.db.update(this.tableName, { telegram_id: telegramId }, updateData);
    } catch (error) {
      console.error('UserModel: Failed to update user by Telegram ID:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      return await this.db.deleteById(this.tableName, id);
    } catch (error) {
      console.error('UserModel: Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Delete user by Telegram ID
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteByTelegramId(telegramId) {
    try {
      const result = await this.db.delete(this.tableName, { telegram_id: telegramId });
      if (result > 0) {
        console.log(`UserModel: User deleted - Telegram ID: ${telegramId}`);
      }
      return result;
    } catch (error) {
      console.error('UserModel: Failed to delete user by Telegram ID:', error);
      throw error;
    }
  }

  /**
   * Count users by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of users
   */
  async count(criteria = {}) {
    try {
      return await this.db.count(this.tableName, criteria);
    } catch (error) {
      console.error('UserModel: Failed to count users:', error);
      throw error;
    }
  }

  // ========================================
  // User-Specific Operations
  // ========================================

  /**
   * Get or create user (find by Telegram ID or create new)
   * @param {Object} telegramUser - Telegram user object
   * @returns {Promise<Object>} User object
   */
  async getOrCreate(telegramUser) {
    try {
      // Try to find existing user
      let user = await this.findByTelegramId(telegramUser.id);

      if (user) {
        // Update last activity
        await this.updateByTelegramId(telegramUser.id, {
          last_activity: new Date().toISOString(),
        });
        
        return user;
      }

      // Create new user
      const userData = {
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        language: telegramUser.language_code || 'ar',
        last_activity: new Date().toISOString(),
      };

      user = await this.create(userData);
      
      console.log(`UserModel: New user registered - Telegram ID: ${telegramUser.id}`);
      
      return user;
    } catch (error) {
      console.error('UserModel: Failed to get or create user:', error);
      throw error;
    }
  }

  /**
   * Update user activity timestamp
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<number>} Number of updated records
   */
  async updateActivity(telegramId) {
    try {
      return await this.updateByTelegramId(telegramId, {
        last_activity: new Date().toISOString(),
      });
    } catch (error) {
      console.error('UserModel: Failed to update activity:', error);
      throw error;
    }
  }

  /**
   * Change user role
   * @param {number} telegramId - Telegram ID
   * @param {string} role - New role
   * @returns {Promise<number>} Number of updated records
   */
  async changeRole(telegramId, role) {
    try {
      const validRoles = ['user', 'moderator', 'manager', 'admin', 'super_admin'];
      
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      const result = await this.updateByTelegramId(telegramId, { role });
      
      if (result > 0) {
        console.log(`UserModel: Role changed - Telegram ID: ${telegramId}, New Role: ${role}`);
      }
      
      return result;
    } catch (error) {
      console.error('UserModel: Failed to change role:', error);
      throw error;
    }
  }

  /**
   * Ban user
   * @param {number} telegramId - Telegram ID
   * @param {string} reason - Ban reason
   * @returns {Promise<number>} Number of updated records
   */
  async ban(telegramId, reason = null) {
    try {
      const result = await this.updateByTelegramId(telegramId, {
        is_banned: 1,
        banned_reason: reason,
        banned_at: new Date().toISOString(),
      });
      
      if (result > 0) {
        console.log(`UserModel: User banned - Telegram ID: ${telegramId}`);
      }
      
      return result;
    } catch (error) {
      console.error('UserModel: Failed to ban user:', error);
      throw error;
    }
  }

  /**
   * Unban user
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<number>} Number of updated records
   */
  async unban(telegramId) {
    try {
      const result = await this.updateByTelegramId(telegramId, {
        is_banned: 0,
        banned_reason: null,
        banned_at: null,
      });
      
      if (result > 0) {
        console.log(`UserModel: User unbanned - Telegram ID: ${telegramId}`);
      }
      
      return result;
    } catch (error) {
      console.error('UserModel: Failed to unban user:', error);
      throw error;
    }
  }

  /**
   * Activate user
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<number>} Number of updated records
   */
  async activate(telegramId) {
    try {
      return await this.updateByTelegramId(telegramId, { is_active: 1 });
    } catch (error) {
      console.error('UserModel: Failed to activate user:', error);
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {number} telegramId - Telegram ID
   * @returns {Promise<number>} Number of updated records
   */
  async deactivate(telegramId) {
    try {
      return await this.updateByTelegramId(telegramId, { is_active: 0 });
    } catch (error) {
      console.error('UserModel: Failed to deactivate user:', error);
      throw error;
    }
  }

  // ========================================
  // Query Helpers
  // ========================================

  /**
   * Get all active users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Active users
   */
  async getActive(options = {}) {
    return await this.find({ is_active: 1, is_banned: 0 }, options);
  }

  /**
   * Get all banned users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Banned users
   */
  async getBanned(options = {}) {
    return await this.find({ is_banned: 1 }, options);
  }

  /**
   * Get users by role
   * @param {string} role - Role name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with specified role
   */
  async getByRole(role, options = {}) {
    return await this.find({ role }, options);
  }

  /**
   * Get all admins (admin and super_admin)
   * @returns {Promise<Array>} Admin users
   */
  async getAdmins() {
    try {
      // Use raw query for IN clause
      const users = await this.db.raw(
        `SELECT * FROM ${this.tableName} WHERE role IN (?, ?)`,
        ['admin', 'super_admin']
      );
      
      return users;
    } catch (error) {
      console.error('UserModel: Failed to get admins:', error);
      throw error;
    }
  }

  /**
   * Search users by name or username
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching users
   */
  async search(query) {
    try {
      const searchPattern = `%${query}%`;
      
      const users = await this.db.raw(
        `SELECT * FROM ${this.tableName} 
         WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?`,
        [searchPattern, searchPattern, searchPattern]
      );
      
      return users;
    } catch (error) {
      console.error('UserModel: Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics() {
    try {
      const total = await this.count();
      const active = await this.count({ is_active: 1, is_banned: 0 });
      const banned = await this.count({ is_banned: 1 });
      const admins = (await this.getAdmins()).length;

      return {
        total,
        active,
        banned,
        inactive: total - active - banned,
        admins,
      };
    } catch (error) {
      console.error('UserModel: Failed to get statistics:', error);
      throw error;
    }
  }

  // ========================================
  // Validation
  // ========================================

  /**
   * Validate user data
   * @param {Object} data - User data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    if (!data.telegram_id) {
      throw new Error('telegram_id is required');
    }

    if (typeof data.telegram_id !== 'number') {
      throw new Error('telegram_id must be a number');
    }

    if (data.role) {
      const validRoles = ['user', 'moderator', 'manager', 'admin', 'super_admin'];
      if (!validRoles.includes(data.role)) {
        throw new Error(`Invalid role: ${data.role}`);
      }
    }

    if (data.language) {
      const validLanguages = ['ar', 'en'];
      if (!validLanguages.includes(data.language)) {
        throw new Error(`Invalid language: ${data.language}`);
      }
    }
  }
}

module.exports = UserModel;
