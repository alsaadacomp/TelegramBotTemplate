// src/services/database.service.js

/**
 * Database Service - Complete Implementation
 * 
 * Provides high-level database operations for the bot
 * Handles users, sections, logs, settings, and conversation states
 * 
 * @module DatabaseService
 */

const DatabaseAdapter = require('../core/database-adapter.core');
const SQLiteAdapter = require('../adapters/sqlite.adapter');
const UserModel = require('../models/user.model');
const SectionModel = require('../models/section.model');
const logger = require('../utils/logger.util');
const DatabaseConfig = require('../../config/database.config');

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

  async initialize() {
    try {
      logger.database('info', 'DatabaseService: Initializing...');
      this.adapter = this._createAdapter();
      await this.adapter.connect();
      this.models.user = new UserModel(this.adapter);
      this.models.section = new SectionModel(this.adapter);
      logger.database('info', 'DatabaseService: Models initialized');
      logger.database('info', 'DatabaseService: Initializing tables...');
      await this.models.user.initialize();
      await this.models.section.initialize();
      await this._initializeLogsTable();
      await this._initializeSettingsTable();
      await this._initializeConversationStatesTable();
      logger.database('info', 'DatabaseService: All tables initialized');
      this.isInitialized = true;
      logger.info('DatabaseService: Initialized successfully');
      logger.database('info', 'DatabaseService: Configuration:', this.config.getSummary());
      return true;
    } catch (error) {
      logger.error('DatabaseService: Initialization failed:', error);
      throw error;
    }
  }

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
        user_id INTEGER PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        current_step TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    await this.adapter.raw(query);
    await this.adapter.raw('CREATE INDEX IF NOT EXISTS idx_conversation_states_workflow ON conversation_states(workflow_id)');
    logger.database('info', 'ConversationStatesModel: Table initialized');
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
      const user = await this.models.user.update(userId, updates);
      logger.info('DatabaseService: User updated successfully', { id: user.id });
      return user;
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
      return await this.models.user.findByRole(role);
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
      logger.database('info', 'DatabaseService: Creating section', { id: sectionData.id });
      const section = await this.models.section.create(sectionData);
      logger.info('DatabaseService: Section created successfully', { id: section.id });
      return section;
    } catch (error) {
      logger.error('DatabaseService: Failed to create section', error);
      throw error;
    }
  }

  async getSection(sectionId) {
    try {
      return await this.models.section.findById(sectionId);
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
      const section = await this.models.section.update(sectionId, updates);
      logger.info('DatabaseService: Section updated successfully', { id: section.id });
      return section;
    } catch (error) {
      logger.error('DatabaseService: Failed to update section', error);
      throw error;
    }
  }

  async deleteSection(sectionId) {
    try {
      logger.database('info', 'DatabaseService: Deleting section', { section_id: sectionId });
      const result = await this.models.section.delete(sectionId);
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
      const result = await this.adapter.queryOne(query, [key]);
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
          description = excluded.description,
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

  async getConversationState(userId) {
    try {
      const query = 'SELECT * FROM conversation_states WHERE user_id = ?';
      const state = await this.adapter.queryOne(query, [userId]);
      if (state && state.data) {
        state.data = JSON.parse(state.data);
      }
      return state;
    } catch (error) {
      logger.error('DatabaseService: Failed to get conversation state', error);
      throw error;
    }
  }

  async setConversationState(userId, stateData) {
    try {
      const query = `
        INSERT INTO conversation_states (user_id, workflow_id, current_step, data, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          workflow_id = excluded.workflow_id,
          current_step = excluded.current_step,
          data = excluded.data,
          updated_at = CURRENT_TIMESTAMP
      `;
      const params = [userId, stateData.workflow_id, stateData.current_step, JSON.stringify(stateData.data || {})];
      await this.adapter.raw(query, params);
      logger.database('info', 'DatabaseService: Conversation state saved', { user_id: userId });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to set conversation state', error);
      throw error;
    }
  }

  async deleteConversationState(userId) {
    try {
      const query = 'DELETE FROM conversation_states WHERE user_id = ?';
      await this.adapter.raw(query, [userId]);
      logger.database('info', 'DatabaseService: Conversation state deleted', { user_id: userId });
      return true;
    } catch (error) {
      logger.error('DatabaseService: Failed to delete conversation state', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();