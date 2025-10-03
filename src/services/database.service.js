// src/services/database.service.js

/**
 * Database Service - Complete Implementation
 * * Provides high-level database operations for the bot
 * Handles users, sections, logs, settings, and conversation states
 * * @module DatabaseService
 */

const DatabaseAdapter = require('../core/database-adapter.core');
const SQLiteAdapter = require('../adapters/sqlite.adapter');
const UserModel = require('../models/user.model');
const SectionModel = require('../models/section.model');
const logger = require('../utils/logger.util');
const DatabaseConfig = require('../../config/database.config');
// const migrationRunner = require('../utils/migrate');

class DatabaseService {
  constructor() {
    this.adapter = null;
    this.isInitialized = false;
    this.config = DatabaseConfig;
    this.models = {
      user: null,
      section: null
    };
  }
  
  /**
   * Initialize the database service
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initialize() {
    try {
      logger.database('info', 'DatabaseService: Initializing...');
      this.adapter = this._createAdapter();
      await this.adapter.connect();
      
      // Initialize models
      this.models.user = new UserModel(this.adapter);
      this.models.section = new SectionModel(this.adapter);
      
      logger.database('info', 'DatabaseService: Models initialized');
      logger.database('info', 'DatabaseService: Initializing tables...');
      
      // Initialize core tables
      await this.models.user.initialize();
      await this.models.section.initialize();
      await this._initializeLogsTable();
      await this._initializeSettingsTable();
      await this._initializeConversationStatesTable();
      await this._initializeJoinRequestsTable();
      
      logger.database('info', 'DatabaseService: All tables initialized');
      
      // Run database migrations
      // logger.database('info', 'DatabaseService: Running migrations...');
      // await migrationRunner.initialize();
      
      this.isInitialized = true;
      logger.info('DatabaseService: initialized successfully');
      logger.database('info', 'DatabaseService: Configuration:', this.config.getSummary());
      return true;
    } catch (error) {
      logger.database('error', 'DatabaseService: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Create database adapter based on configuration
   * @private
   * @returns {DatabaseAdapter} Database adapter instance
   */
  _createAdapter() {
    const mode = this.config.mode;
    logger.database('info', `DatabaseService: Creating adapter for mode: ${mode}`);
    switch (mode) {
      case 'sqlite':
        return new SQLiteAdapter(this.config.sqlite);
      case 'sheets':
        throw new Error('Google Sheets adapter not yet implemented');
      case 'hybrid':
        throw new Error('Hybrid mode not yet implemented');
      default:
        throw new Error(`Unknown database mode: ${mode}`);
    }
  }

  async _initializeLogsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER,
        action TEXT,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    await this.adapter.raw(query);
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)');
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id)');
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)');
    logger.database('info', 'LogsModel: Table initialized');
  }

  async _initializeSettingsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string',
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.adapter.raw(query);
    logger.database('info', 'SettingsModel: Table initialized');
  }

  async _initializeConversationStatesTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS conversation_states (
        telegram_id INTEGER PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        current_step TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.adapter.raw(query);
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_conversation_states_workflow ON conversation_states(workflow_id)');
    logger.database('info', 'ConversationStatesModel: Table initialized');
  }

  async _initializeJoinRequestsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS join_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        reviewed_by INTEGER,
        reviewed_at DATETIME,
        rejection_reason TEXT,
        metadata TEXT
      )
    `;
    await this.adapter.raw(query);
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_join_requests_telegram_id ON join_requests(telegram_id)');
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status)');
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_join_requests_requested_at ON join_requests(requested_at DESC)');
    logger.database('info', 'JoinRequestsModel: Table initialized');
  }

  async disconnect() {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.isInitialized = false;
      logger.database('info', 'DatabaseService: Disconnected');
    }
  }

  async createUser(userData) {
    try {
      logger.database('info', 'DatabaseService: Creating user', { telegram_id: userData.telegram_id });
      const user = await this.models.user.create(userData);
      logger.info('DatabaseService: User created successfully', { id: user.id, telegram_id: user.telegram_id });
      return user;
    } catch (error) {
      logger.error('DatabaseService: Failed to create user', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      return await this.models.user.findById(userId);
    } catch (error) {
      logger.error('DatabaseService: Failed to get user', error);
      throw error;
    }
  }

  async getUserByTelegramId(telegramId) {
    try {
      logger.database('debug', 'DatabaseService: Getting user by telegram_id', { telegram_id: telegramId });
      const user = await this.models.user.findByTelegramId(telegramId);
      if (user) {
        logger.database('debug', 'DatabaseService: User found', { id: user.id, telegram_id: user.telegram_id });
      } else {
        logger.database('debug', 'DatabaseService: User not found', { telegram_id: telegramId });
      }
      return user;
    } catch (error) {
      logger.error('DatabaseService: Failed to get user by telegram_id', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      logger.database('info', 'DatabaseService: Updating user', { user_id: userId });
      const success = await this.models.user.update(userId, updates);
      if(success) {
        logger.info('DatabaseService: User updated successfully', { id: userId });
      }
      return success;
    } catch (error) {
      logger.error('DatabaseService: Failed to update user', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      logger.database('info', 'DatabaseService: Deleting user', { user_id: userId });
      const result = await this.models.user.delete(userId);
      logger.info('DatabaseService: User deleted successfully', { id: userId });
      return result;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete user', error);
      throw error;
    }
  }

  async deleteUserByTelegramId(telegramId) {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        return 0;
      }
      await this.deleteConversationState(telegramId);
      await this.adapter.raw('DELETE FROM logs WHERE user_id = ?', [user.id]);
      logger.database('info', 'DatabaseService: Deleting user by telegram_id', { telegram_id: telegramId });
      const result = await this.models.user.deleteByTelegramId(telegramId);
      logger.info('DatabaseService: User deleted successfully', { telegram_id: telegramId });
      return result;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete user by telegram_id', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await this.models.user.findAll();
    } catch (error) {
      logger.error('DatabaseService: Failed to get all users', error);
      throw error;
    }
  }

  async getUsersByRole(role) {
    try {
      return await this.models.user.getByRole(role);
    } catch (error) {
      logger.error('DatabaseService: Failed to get users by role', error);
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      return await this.models.user.findByStatus('active');
    } catch (error) {
      logger.error('DatabaseService: Failed to get active users', error);
      throw error;
    }
  }

  async updateUserLastActive(userId) {
    try {
      return await this.models.user.updateLastActive(userId);
    } catch (error) {
      logger.error('DatabaseService: Failed to update user last active', error);
      throw error;
    }
  }

  async createSection(sectionData) {
    try {
      logger.database('info', 'DatabaseService: Creating section', { section_id: sectionData.section_id });
      const section = await this.models.section.create(sectionData);
      logger.info('DatabaseService: Section created successfully', { id: section.id });
      return await this.models.section.findBySectionId(sectionData.section_id);
    } catch (error) {
      logger.error('DatabaseService: Failed to create section', error);
      throw error;
    }
  }

  async getSection(sectionId) {
    try {
      return await this.models.section.findBySectionId(sectionId);
    } catch (error) {
      logger.error('DatabaseService: Failed to get section', error);
      throw error;
    }
  }

  async getAllSections() {
    try {
      return await this.models.section.findAll();
    } catch (error) {
      logger.error('DatabaseService: Failed to get all sections', error);
      throw error;
    }
  }

  async getEnabledSections() {
    try {
      return await this.models.section.findEnabled();
    } catch (error) {
      logger.error('DatabaseService: Failed to get enabled sections', error);
      throw error;
    }
  }

  async getSectionsTree() {
    try {
      return await this.models.section.buildTree();
    } catch (error) {
      logger.error('DatabaseService: Failed to get sections tree', error);
      throw error;
    }
  }

  async updateSection(sectionId, updates) {
    try {
      logger.database('info', 'DatabaseService: Updating section', { section_id: sectionId });
      const success = await this.models.section.update(sectionId, updates);
      if(success){
        logger.info('DatabaseService: Section updated successfully', { id: sectionId });
      }
      return success;
    } catch (error) {
      logger.error('DatabaseService: Failed to update section', error);
      throw error;
    }
  }

  async deleteSection(sectionId) {
    try {
      logger.database('info', 'DatabaseService: Deleting section', { section_id: sectionId });
      const result = await this.models.section.deleteBySectionId(sectionId);
      logger.info('DatabaseService: Section deleted successfully', { id: sectionId });
      return result;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete section', error);
      throw error;
    }
  }

  async createLog(logData) {
    try {
      const query = `
        INSERT INTO logs (level, message, user_id, action, metadata)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [
        logData.level,
        logData.message,
        logData.user_id || null,
        logData.action || null,
        logData.metadata ? JSON.stringify(logData.metadata) : null
      ];
      const result = await this.adapter.raw(query, params);
      return { id: result.lastID, ...logData };
    } catch (error) {
      logger.error('DatabaseService: Failed to create log', error);
      throw error;
    }
  }

  async getLogs(options = {}) {
    try {
      const { level = null, user_id = null, action = null, limit = 100, offset = 0 } = options;
      let query = 'SELECT * FROM logs WHERE 1=1';
      const params = [];
      if (level) {
        query += ' AND level = ?';
        params.push(level);
      }
      if (user_id) {
        query += ' AND user_id = ?';
        params.push(user_id);
      }
      if (action) {
        query += ' AND action = ?';
        params.push(action);
      }
      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      const logs = await this.adapter.query(query, params);
      return logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }));
    } catch (error) {
      logger.error('DatabaseService: Failed to get logs', error);
      throw error;
    }
  }

  async deleteOldLogs(days = 30) {
    try {
      const query = `DELETE FROM logs WHERE timestamp < datetime('now', '-${days} days')`;
      const result = await this.adapter.raw(query);
      logger.info(`DatabaseService: Deleted ${result.changes} old logs`);
      return result.changes;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete old logs', error);
      throw error;
    }
  }

  async getSetting(key) {
    try {
      const query = 'SELECT * FROM settings WHERE key = ?';
      const rows = await this.adapter.raw(query, [key]);
      const result = rows.length > 0 ? rows[0] : null;
      if (!result) return null;
      return this._parseSettingValue(result.value, result.type);
    } catch (error) {
      logger.error('DatabaseService: Failed to get setting', error);
      throw error;
    }
  }

  async setSetting(key, value, type = 'string', description = null) {
    try {
      const query = `
        INSERT INTO settings (key, value, type, description, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          description = COALESCE(excluded.description, description),
          updated_at = CURRENT_TIMESTAMP
      `;
      const params = [key, this._stringifySettingValue(value, type), type, description];
      await this.adapter.raw(query, params);
      logger.database('info', 'DatabaseService: Setting saved', { key });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to set setting', error);
      throw error;
    }
  }

  async getAllSettings() {
    try {
      const query = 'SELECT * FROM settings';
      const results = await this.adapter.query(query);
      const settings = {};
      for (const row of results) {
        settings[row.key] = this._parseSettingValue(row.value, row.type);
      }
      return settings;
    } catch (error) {
      logger.error('DatabaseService: Failed to get all settings', error);
      throw error;
    }
  }

  async deleteSetting(key) {
    try {
      const query = 'DELETE FROM settings WHERE key = ?';
      await this.adapter.raw(query, [key]);
      logger.database('info', 'DatabaseService: Setting deleted', { key });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete setting', error);
      throw error;
    }
  }

  _parseSettingValue(value, type) {
    switch (type) {
      case 'number': return Number(value);
      case 'boolean': return value === 'true' || value === '1';
      case 'json': return JSON.parse(value);
      case 'array': return JSON.parse(value);
      default: return value;
    }
  }

  _stringifySettingValue(value, type) {
    switch (type) {
      case 'number': return String(value);
      case 'boolean': return value ? 'true' : 'false';
      case 'json':
      case 'array': return JSON.stringify(value);
      default: return String(value);
    }
  }

  async getConversationState(telegramId) {
    try {
      const query = 'SELECT * FROM conversation_states WHERE telegram_id = ?';
      const rows = await this.adapter.raw(query, [telegramId]);
      const state = rows.length > 0 ? rows[0] : null;
      if (state && state.data) {
        state.data = JSON.parse(state.data);
      }
      return state;
    } catch (error) {
      logger.error('DatabaseService: Failed to get conversation state', error);
      throw error;
    }
  }

  async setConversationState(telegramId, stateData) {
    try {
      const query = `
        INSERT INTO conversation_states (telegram_id, workflow_id, current_step, data, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(telegram_id) DO UPDATE SET
          workflow_id = excluded.workflow_id,
          current_step = excluded.current_step,
          data = excluded.data,
          updated_at = CURRENT_TIMESTAMP
      `;
      const params = [telegramId, stateData.workflow_id, stateData.current_step, JSON.stringify(stateData.data || {})];
      await this.adapter.raw(query, params);
      logger.database('info', 'DatabaseService: Conversation state saved', { telegram_id: telegramId });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to set conversation state', error);
      throw error;
    }
  }

  async deleteConversationState(telegramId) {
    try {
      const query = 'DELETE FROM conversation_states WHERE telegram_id = ?';
      await this.adapter.raw(query, [telegramId]);
      logger.database('info', 'DatabaseService: Conversation state deleted', { telegram_id: telegramId });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete conversation state', error);
      throw error;
    }
  }

  async get(sql, params) {
    try {
      const rows = await this.adapter.raw(sql, params);
      return rows[0];
    } catch (error) {
      logger.error('DatabaseService: Failed to get', error);
      throw error;
    }
  }

  async query(sql, params) {
    try {
      return await this.adapter.raw(sql, params);
    } catch (error) {
      logger.error('DatabaseService: Failed to query', error);
      throw error;
    }
  }

  /**
   * Provides a 'run' alias for 'raw' to be compatible with migration runner.
   */
  async run(sql, params) {
    try {
      return await this.adapter.raw(sql, params);
    } catch (error) {
      logger.error('DatabaseService: Failed to run command', error);
      throw error;
    }
  }

  /**
   * Provides an 'all' alias for 'query' to be compatible with migration runner.
   */
  async all(sql, params) {
    try {
      return await this.adapter.query(sql, params);
    } catch (error) {
      logger.error('DatabaseService: Failed to run all command', error);
      throw error;
    }
  }

  // =======================================
  // Join Requests Management
  // =======================================

  /**
   * Create a join request
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>}
   */
  async createJoinRequest(requestData) {
    try {
      const query = `
        INSERT INTO join_requests (
          telegram_id, username, first_name, last_name, 
          full_name, phone, requested_at, status, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'pending', ?)
      `;
      const params = [
        requestData.telegram_id,
        requestData.username || null,
        requestData.first_name || null,
        requestData.last_name || null,
        requestData.full_name,
        requestData.phone,
        requestData.metadata ? JSON.stringify(requestData.metadata) : null
      ];
      const result = await this.adapter.raw(query, params);
      logger.database('info', 'DatabaseService: Join request created', { 
        id: result.lastID, 
        telegram_id: requestData.telegram_id 
      });
      return { id: result.lastID, ...requestData };
    } catch (error) {
      logger.error('DatabaseService: Failed to create join request', error);
      throw error;
    }
  }

  /**
   * Get pending join requests
   * @returns {Promise<Array>}
   */
  async getPendingJoinRequests() {
    try {
      const query = `
        SELECT * FROM join_requests 
        WHERE status = 'pending' 
        ORDER BY requested_at DESC
      `;
      const requests = await this.adapter.query(query);
      return requests.map(req => ({
        ...req,
        metadata: req.metadata ? JSON.parse(req.metadata) : null
      }));
    } catch (error) {
      logger.error('DatabaseService: Failed to get pending join requests', error);
      throw error;
    }
  }

  /**
   * Get join request by telegram ID
   * @param {number} telegramId
   * @returns {Promise<Object|null>}
   */
  async getJoinRequestByTelegramId(telegramId) {
    try {
      const query = `
        SELECT * FROM join_requests 
        WHERE telegram_id = ? 
        ORDER BY requested_at DESC 
        LIMIT 1
      `;
      const rows = await this.adapter.raw(query, [telegramId]);
      const request = rows.length > 0 ? rows[0] : null;
      if (request && request.metadata) {
        request.metadata = JSON.parse(request.metadata);
      }
      return request;
    } catch (error) {
      logger.error('DatabaseService: Failed to get join request', error);
      throw error;
    }
  }

  /**
   * Count pending join requests
   * @returns {Promise<number>}
   */
  async countPendingJoinRequests() {
    try {
      const query = 'SELECT COUNT(*) as count FROM join_requests WHERE status = ?';
      const rows = await this.adapter.raw(query, ['pending']);
      const result = rows.length > 0 ? rows[0] : null;
      return result ? result.count : 0;
    } catch (error) {
      logger.error('DatabaseService: Failed to count pending join requests', error);
      return 0;
    }
  }

  /**
   * Update join request status
   * @param {number} requestId
   * @param {string} status - 'approved' or 'rejected'
   * @param {number} reviewedBy - Admin telegram ID
   * @param {string} reason - Rejection reason (optional)
   * @returns {Promise<boolean>}
   */
  async updateJoinRequestStatus(requestId, status, reviewedBy, reason = null) {
    try {
      const query = `
        UPDATE join_requests 
        SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ?
        WHERE id = ?
      `;
      await this.adapter.raw(query, [status, reviewedBy, reason, requestId]);
      logger.database('info', 'DatabaseService: Join request status updated', { 
        id: requestId, 
        status 
      });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to update join request status', error);
      throw error;
    }
  }

  // =======================================
  // Statistics Methods
  // =======================================

  /**
   * Count active admins
   * @returns {Promise<number>}
   */
  async countActiveAdmins() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role IN ('admin', 'super_admin') 
        AND status = 'active'
      `;
      const rows = await this.adapter.raw(query);
      const result = rows.length > 0 ? rows[0] : null;
      return result ? result.count : 0;
    } catch (error) {
      logger.error('DatabaseService: Failed to count active admins', error);
      return 0;
    }
  }

  /**
   * Count all admins
   * @returns {Promise<number>}
   */
  async countAdmins() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role IN ('admin', 'super_admin')
      `;
      const rows = await this.adapter.raw(query);
      const result = rows.length > 0 ? rows[0] : null;
      return result ? result.count : 0;
    } catch (error) {
      logger.error('DatabaseService: Failed to count admins', error);
      return 0;
    }
  }

  /**
   * Get the size of the database file
   * @returns {Promise<string>} Formatted database size (e.g., "2.5 MB")
   */
  async getDatabaseSize() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Get the database file path from the adapter
      let dbPath = './data/database/bot.db'; // Default path
      
      // If using SQLite adapter, get the actual path
      if (this.adapter && this.adapter.getDatabasePath) {
        dbPath = this.adapter.getDatabasePath();
      }
      
      // Convert to absolute path if it's relative
      const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
      
      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        return 'غير متاح';
      }
      
      // Get file stats
      const stats = fs.statSync(absolutePath);
      const fileSizeInBytes = stats.size;
      
      // Convert to appropriate unit
      const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
      let size = fileSizeInBytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      // Format the size with 2 decimal places
      return `${size.toFixed(2)} ${units[unitIndex]}`;
      
    } catch (error) {
      logger.error('DatabaseService: Failed to get database size', error);
      return 'غير متاح';
    }
  }

  /**
   * Get the last activity time from the database
   * @returns {Promise<string>} Formatted time string
   */
  async getLastActivityTime() {
    try {
      const query = `
        SELECT last_activity 
        FROM users 
        WHERE last_activity IS NOT NULL 
        ORDER BY last_activity DESC 
        LIMIT 1
      `;
      const rows = await this.adapter.raw(query);
      const result = rows.length > 0 ? rows[0] : null;
      if (!result || !result.last_activity) return 'لا يوجد';
      
      const lastActive = new Date(result.last_activity);
      const now = new Date();
      const diffMs = now - lastActive;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    } catch (error) {
      logger.error('DatabaseService: Failed to get last activity time', error);
      return 'غير متاح';
    }
  }

  /**
   * Get today's activity count
   * @returns {Promise<number>}
   */
  async getTodayActivityCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM logs 
        WHERE DATE(timestamp) = DATE('now')
      `;
      const rows = await this.adapter.raw(query);
      const result = rows.length > 0 ? rows[0] : null;
      return result ? result.count : 0;
    } catch (error) {
      logger.error('DatabaseService: Failed to get today activity count', error);
      return 0;
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.adapter && this.adapter.close) {
        await this.adapter.close();
        logger.database('info', 'DatabaseService: Connection closed');
      }
      this.isInitialized = false;
    } catch (error) {
      logger.error('DatabaseService: Failed to close connection', error);
    }
  }

  /**
   * Check if database is connected
   * @returns {Promise<boolean>}
   */
  async isConnected() {
    try {
      if (!this.adapter) return false;
      return await this.adapter.isConnected();
    } catch (error) {
      logger.error('DatabaseService: Failed to check connection', error);
      return false;
    }
  }

}

module.exports = new DatabaseService();