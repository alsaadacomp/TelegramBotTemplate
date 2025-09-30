/**
 * Database Service
 * Main service for database operations
 * Factory for creating and managing database adapters
 * 
 * @module services/database
 */

const databaseConfig = require('../../config/database.config');
const SQLiteAdapter = require('../adapters/sqlite.adapter');
const UserModel = require('../models/user.model');
const SectionModel = require('../models/section.model');

/**
 * Database Service Class
 */
class DatabaseService {
  constructor() {
    this.adapter = null;
    this.models = {};
    this.connected = false;
  }

  // ========================================
  // Initialization
  // ========================================

  /**
   * Initialize database service
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('DatabaseService: Initializing...');

      // Create adapter based on config
      this.adapter = this._createAdapter();

      // Connect to database
      await this.adapter.connect();

      // Initialize models
      await this._initializeModels();

      // Create tables if they don't exist
      await this._initializeTables();

      this.connected = true;

      console.log('DatabaseService: Initialized successfully');
      console.log('DatabaseService: Configuration:', databaseConfig.getSummary());
    } catch (error) {
      console.error('DatabaseService: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Shutdown database service
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      if (this.adapter && this.connected) {
        await this.adapter.disconnect();
        this.connected = false;
        console.log('DatabaseService: Shut down successfully');
      }
    } catch (error) {
      console.error('DatabaseService: Shutdown failed:', error);
      throw error;
    }
  }

  // ========================================
  // Adapter Factory
  // ========================================

  /**
   * Create database adapter based on configuration
   * @private
   * @returns {DatabaseAdapter} Database adapter instance
   */
  _createAdapter() {
    const mode = databaseConfig.mode;

    console.log(`DatabaseService: Creating adapter for mode: ${mode}`);

    switch (mode) {
      case 'sqlite':
        return new SQLiteAdapter(databaseConfig.sqlite);

      case 'sheets':
        // TODO: Implement Google Sheets adapter in future
        throw new Error('Google Sheets adapter not yet implemented');

      case 'hybrid':
        // TODO: Implement hybrid adapter in future
        // For now, use SQLite as primary
        console.warn('DatabaseService: Hybrid mode not fully implemented, using SQLite');
        return new SQLiteAdapter(databaseConfig.sqlite);

      default:
        throw new Error(`Invalid database mode: ${mode}`);
    }
  }

  /**
   * Initialize models
   * @private
   * @returns {Promise<void>}
   */
  async _initializeModels() {
    try {
      // Create model instances
      this.models.user = new UserModel(this.adapter);
      this.models.section = new SectionModel(this.adapter);

      console.log('DatabaseService: Models initialized');
    } catch (error) {
      console.error('DatabaseService: Failed to initialize models:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   * @private
   * @returns {Promise<void>}
   */
  async _initializeTables() {
    try {
      console.log('DatabaseService: Initializing tables...');

      // Initialize each model's table
      await this.models.user.initialize();
      await this.models.section.initialize();

      console.log('DatabaseService: All tables initialized');
    } catch (error) {
      console.error('DatabaseService: Failed to initialize tables:', error);
      throw error;
    }
  }

  // ========================================
  // Model Accessors
  // ========================================

  /**
   * Get User model
   * @returns {UserModel}
   */
  getUserModel() {
    if (!this.models.user) {
      throw new Error('User model not initialized');
    }
    return this.models.user;
  }

  /**
   * Get Section model
   * @returns {SectionModel}
   */
  getSectionModel() {
    if (!this.models.section) {
      throw new Error('Section model not initialized');
    }
    return this.models.section;
  }

  /**
   * Get all models
   * @returns {Object} All models
   */
  getModels() {
    return this.models;
  }

  // ========================================
  // Direct Database Access (pass-through to adapter)
  // ========================================

  /**
   * Create record (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record
   */
  async create(table, data) {
    return await this.adapter.create(table, data);
  }

  /**
   * Find records (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Records array
   */
  async find(table, criteria = {}, options = {}) {
    return await this.adapter.find(table, criteria, options);
  }

  /**
   * Find one record (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object|null>} Record or null
   */
  async findOne(table, criteria) {
    return await this.adapter.findOne(table, criteria);
  }

  /**
   * Find by ID (pass-through to adapter)
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(table, id) {
    return await this.adapter.findById(table, id);
  }

  /**
   * Update records (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of updated records
   */
  async update(table, criteria, data) {
    return await this.adapter.update(table, criteria, data);
  }

  /**
   * Update by ID (pass-through to adapter)
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async updateById(table, id, data) {
    return await this.adapter.updateById(table, id, data);
  }

  /**
   * Delete records (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of deleted records
   */
  async delete(table, criteria) {
    return await this.adapter.delete(table, criteria);
  }

  /**
   * Delete by ID (pass-through to adapter)
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteById(table, id) {
    return await this.adapter.deleteById(table, id);
  }

  /**
   * Count records (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of records
   */
  async count(table, criteria = {}) {
    return await this.adapter.count(table, criteria);
  }

  /**
   * Execute raw query (pass-through to adapter)
   * @param {string} query - Query string
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async raw(query, params = []) {
    return await this.adapter.raw(query, params);
  }

  /**
   * Create table (pass-through to adapter)
   * @param {string} table - Table name
   * @param {Object} schema - Table schema
   * @returns {Promise<void>}
   */
  async createTable(table, schema) {
    return await this.adapter.createTable(table, schema);
  }

  /**
   * Drop table (pass-through to adapter)
   * @param {string} table - Table name
   * @returns {Promise<void>}
   */
  async dropTable(table) {
    return await this.adapter.dropTable(table);
  }

  /**
   * Check if table exists (pass-through to adapter)
   * @param {string} table - Table name
   * @returns {Promise<boolean>}
   */
  async tableExists(table) {
    return await this.adapter.tableExists(table);
  }

  // ========================================
  // Transaction Support
  // ========================================

  /**
   * Execute function within transaction
   * @param {Function} callback - Function to execute
   * @returns {Promise<any>} Result from callback
   */
  async transaction(callback) {
    return await this.adapter.transaction(callback);
  }

  /**
   * Begin transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    return await this.adapter.beginTransaction();
  }

  /**
   * Commit transaction
   * @returns {Promise<void>}
   */
  async commit() {
    return await this.adapter.commit();
  }

  /**
   * Rollback transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    return await this.adapter.rollback();
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Test database connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      if (!this.adapter) {
        return false;
      }
      return await this.adapter.testConnection();
    } catch (error) {
      console.error('DatabaseService: Connection test failed:', error);
      return false;
    }
  }

  /**
   * Check if service is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.adapter && this.adapter.isConnected();
  }

  /**
   * Get adapter name
   * @returns {string}
   */
  getAdapterName() {
    return this.adapter ? this.adapter.getName() : 'None';
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getStatistics() {
    try {
      const stats = {
        adapter: this.getAdapterName(),
        connected: this.isConnected(),
        models: Object.keys(this.models),
      };

      // Get statistics from each model
      if (this.models.user) {
        stats.users = await this.models.user.getStatistics();
      }

      if (this.models.section) {
        stats.sections = await this.models.section.getStatistics();
      }

      return stats;
    } catch (error) {
      console.error('DatabaseService: Failed to get statistics:', error);
      throw error;
    }
  }

  /**
   * Backup database (SQLite only)
   * @param {string} backupPath - Path for backup file
   * @returns {Promise<void>}
   */
  async backup(backupPath) {
    try {
      if (this.getAdapterName() !== 'SQLiteAdapter') {
        throw new Error('Backup only supported for SQLite');
      }

      // TODO: Implement backup functionality
      console.log(`DatabaseService: Backup to ${backupPath} - Not yet implemented`);
    } catch (error) {
      console.error('DatabaseService: Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup (SQLite only)
   * @param {string} backupPath - Path to backup file
   * @returns {Promise<void>}
   */
  async restore(backupPath) {
    try {
      if (this.getAdapterName() !== 'SQLiteAdapter') {
        throw new Error('Restore only supported for SQLite');
      }

      // TODO: Implement restore functionality
      console.log(`DatabaseService: Restore from ${backupPath} - Not yet implemented`);
    } catch (error) {
      console.error('DatabaseService: Restore failed:', error);
      throw error;
    }
  }

  /**
   * Validate database configuration
   * @returns {Object} Validation result
   */
  validateConfig() {
    return databaseConfig.validate();
  }

  /**
   * Get database configuration summary
   * @returns {Object} Configuration summary
   */
  getConfigSummary() {
    return databaseConfig.getSummary();
  }

  // ========================================
  // Event Handling
  // ========================================

  /**
   * Listen to adapter events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (this.adapter) {
      this.adapter.on(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (this.adapter) {
      this.adapter.off(event, callback);
    }
  }
}

// ========================================
// Singleton Instance
// ========================================

let instance = null;

/**
 * Get singleton instance of DatabaseService
 * @returns {DatabaseService}
 */
function getInstance() {
  if (!instance) {
    instance = new DatabaseService();
  }
  return instance;
}

/**
 * Initialize database service (singleton)
 * @returns {Promise<DatabaseService>}
 */
async function initializeDatabase() {
  const dbService = getInstance();
  
  if (!dbService.isConnected()) {
    await dbService.initialize();
  }
  
  return dbService;
}

/**
 * Shutdown database service (singleton)
 * @returns {Promise<void>}
 */
async function shutdownDatabase() {
  const dbService = getInstance();
  await dbService.shutdown();
  instance = null;
}

// ========================================
// Exports
// ========================================

module.exports = {
  DatabaseService,
  getInstance,
  initializeDatabase,
  shutdownDatabase,
};
