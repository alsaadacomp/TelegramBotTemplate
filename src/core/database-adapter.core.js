/**
 * Database Adapter Core
 * Abstract base class for database adapters (Adapter Pattern)
 * Provides unified interface for SQLite and Google Sheets
 * 
 * @module core/database-adapter
 */

const EventEmitter = require('events');

/**
 * Abstract Database Adapter
 * All database adapters must extend this class
 */
class DatabaseAdapter extends EventEmitter {
  constructor(config) {
    super();
    
    if (new.target === DatabaseAdapter) {
      throw new TypeError('Cannot construct DatabaseAdapter instances directly');
    }

    this.config = config;
    this.connected = false;
    this.name = 'DatabaseAdapter';
  }

  // ========================================
  // Connection Management (Must Implement)
  // ========================================

  /**
   * Connect to database
   * @returns {Promise<void>}
   * @abstract
   */
  async connect() {
    throw new Error('Method connect() must be implemented');
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   * @abstract
   */
  async disconnect() {
    throw new Error('Method disconnect() must be implemented');
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>}
   * @abstract
   */
  async testConnection() {
    throw new Error('Method testConnection() must be implemented');
  }

  // ========================================
  // CRUD Operations (Must Implement)
  // ========================================

  /**
   * Create new record
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record with ID
   * @abstract
   */
  async create(table, data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Find records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of records
   * @abstract
   */
  async find(table, criteria = {}, options = {}) {
    throw new Error('Method find() must be implemented');
  }

  /**
   * Find single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   * @abstract
   */
  async findById(table, id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Find single record by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object|null>} Record or null
   * @abstract
   */
  async findOne(table, criteria) {
    throw new Error('Method findOne() must be implemented');
  }

  /**
   * Update records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of updated records
   * @abstract
   */
  async update(table, criteria, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Update single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   * @abstract
   */
  async updateById(table, id, data) {
    throw new Error('Method updateById() must be implemented');
  }

  /**
   * Delete records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of deleted records
   * @abstract
   */
  async delete(table, criteria) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Delete single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} Success status
   * @abstract
   */
  async deleteById(table, id) {
    throw new Error('Method deleteById() must be implemented');
  }

  /**
   * Count records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of records
   * @abstract
   */
  async count(table, criteria = {}) {
    throw new Error('Method count() must be implemented');
  }

  // ========================================
  // Batch Operations (Must Implement)
  // ========================================

  /**
   * Insert multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} records - Records to insert
   * @returns {Promise<Array>} Created records
   * @abstract
   */
  async bulkCreate(table, records) {
    throw new Error('Method bulkCreate() must be implemented');
  }

  /**
   * Update multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} updates - Updates with criteria and data
   * @returns {Promise<number>} Number of updated records
   * @abstract
   */
  async bulkUpdate(table, updates) {
    throw new Error('Method bulkUpdate() must be implemented');
  }

  /**
   * Delete multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} criteriaList - List of criteria
   * @returns {Promise<number>} Number of deleted records
   * @abstract
   */
  async bulkDelete(table, criteriaList) {
    throw new Error('Method bulkDelete() must be implemented');
  }

  // ========================================
  // Transaction Support (Optional)
  // ========================================

  /**
   * Begin transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    // Optional - override if supported
    console.warn(`${this.name}: Transactions not supported`);
  }

  /**
   * Commit transaction
   * @returns {Promise<void>}
   */
  async commit() {
    // Optional - override if supported
  }

  /**
   * Rollback transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    // Optional - override if supported
  }

  /**
   * Execute function within transaction
   * @param {Function} callback - Function to execute
   * @returns {Promise<any>} Result from callback
   */
  async transaction(callback) {
    try {
      await this.beginTransaction();
      const result = await callback(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  // ========================================
  // Raw Query Support (Optional)
  // ========================================

  /**
   * Execute raw query
   * @param {string} query - Query string
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async raw(query, params = []) {
    throw new Error('Method raw() not supported by this adapter');
  }

  // ========================================
  // Table Management (Must Implement)
  // ========================================

  /**
   * Create table
   * @param {string} table - Table name
   * @param {Object} schema - Table schema
   * @returns {Promise<void>}
   * @abstract
   */
  async createTable(table, schema) {
    throw new Error('Method createTable() must be implemented');
  }

  /**
   * Drop table
   * @param {string} table - Table name
   * @returns {Promise<void>}
   * @abstract
   */
  async dropTable(table) {
    throw new Error('Method dropTable() must be implemented');
  }

  /**
   * Check if table exists
   * @param {string} table - Table name
   * @returns {Promise<boolean>}
   * @abstract
   */
  async tableExists(table) {
    throw new Error('Method tableExists() must be implemented');
  }

  /**
   * Get table schema
   * @param {string} table - Table name
   * @returns {Promise<Object>}
   * @abstract
   */
  async getTableSchema(table) {
    throw new Error('Method getTableSchema() must be implemented');
  }

  // ========================================
  // Utility Methods (Common)
  // ========================================

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get adapter name
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Get adapter configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Sanitize table name
   * @param {string} table - Table name
   * @returns {string} Sanitized table name
   */
  sanitizeTableName(table) {
    return table.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Validate criteria object
   * @param {Object} criteria - Criteria to validate
   * @throws {Error} If criteria is invalid
   */
  validateCriteria(criteria) {
    if (typeof criteria !== 'object' || criteria === null) {
      throw new Error('Criteria must be an object');
    }
  }

  /**
   * Validate data object
   * @param {Object} data - Data to validate
   * @throws {Error} If data is invalid
   */
  validateData(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('Data must be an object');
    }
  }

  /**
   * Emit event with error handling
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emitSafe(event, data) {
    try {
      this.emit(event, data);
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
    }
  }

  /**
   * Log operation
   * @param {string} operation - Operation name
   * @param {string} table - Table name
   * @param {*} data - Operation data
   */
  logOperation(operation, table, data) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      adapter: this.name,
      operation,
      table,
      data,
    };
    
    this.emitSafe('operation', log);
  }

  /**
   * Handle error
   * @param {Error} error - Error object
   * @param {string} operation - Operation name
   * @throws {Error} Enhanced error
   */
  handleError(error, operation) {
    const enhancedError = new Error(
      `${this.name} ${operation} failed: ${error.message}`
    );
    enhancedError.originalError = error;
    enhancedError.adapter = this.name;
    enhancedError.operation = operation;
    
    this.emitSafe('error', enhancedError);
    throw enhancedError;
  }

  // ========================================
  // Helper Methods for Subclasses
  // ========================================

  /**
   * Parse options for query
   * @param {Object} options - Query options
   * @returns {Object} Parsed options
   */
  parseQueryOptions(options = {}) {
    return {
      limit: options.limit || null,
      offset: options.offset || 0,
      orderBy: options.orderBy || null,
      orderDirection: options.orderDirection || 'ASC',
      select: options.select || null,
    };
  }

  /**
   * Build criteria string (helper for SQL)
   * @param {Object} criteria - Criteria object
   * @returns {Object} { where: string, params: Array }
   */
  buildWhereClause(criteria) {
    const conditions = [];
    const params = [];

    Object.entries(criteria).forEach(([key, value]) => {
      if (value === null) {
        conditions.push(`${key} IS NULL`);
      } else if (Array.isArray(value)) {
        conditions.push(`${key} IN (${value.map(() => '?').join(',')})`);
        params.push(...value);
      } else if (typeof value === 'object' && value.$like) {
        conditions.push(`${key} LIKE ?`);
        params.push(value.$like);
      } else {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    });

    return {
      where: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
      params,
    };
  }

  /**
   * Get current timestamp
   * @returns {string} ISO timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = DatabaseAdapter;
