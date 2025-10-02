/**
 * SQLite Database Adapter
 * Implementation of DatabaseAdapter for SQLite
 * 
 * @module adapters/sqlite
 */

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const DatabaseAdapter = require('../core/database-adapter.core');

/**
 * SQLite Adapter Class
 * @extends DatabaseAdapter
 */
class SQLiteAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    
    this.name = 'SQLiteAdapter';
    this.db = null;
    this.dbPath = config.path || path.join(__dirname, '../../data/database/bot.db');
    this.options = config.options || {};
  }

  // ========================================
  // Connection Management
  // ========================================

  /**
   * Connect to SQLite database
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected) {
      console.log('SQLiteAdapter: Already connected');
      return;
    }

    try {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Connect to database
      this.db = await this._openDatabase();

      // Mark as connected BEFORE configuration (so raw() works)
      this.connected = true;

      // Configure database
      await this._configureDatabase();

      this.emitSafe('connected', { adapter: this.name, path: this.dbPath });
      
      console.log(`SQLiteAdapter: Connected to ${this.dbPath}`);
    } catch (error) {
      // Reset connection state on error
      this.connected = false;
      this.db = null;
      this.handleError(error, 'connect');
    }
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.connected || !this.db) {
      return;
    }

    try {
      await promisify(this.db.close.bind(this.db))();
      this.db = null;
      this.connected = false;
      this.emitSafe('disconnected', { adapter: this.name });
      
      console.log('SQLiteAdapter: Disconnected');
    } catch (error) {
      this.handleError(error, 'disconnect');
    }
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      if (!this.connected) {
        return false;
      }

      await this.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('SQLiteAdapter: Connection test failed:', error);
      return false;
    }
  }

  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Create new record
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record with ID
   */
  async create(table, data) {
    this.validateData(data);
    
    try {
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(',');
      const values = Object.values(data);

      const sql = `
        INSERT INTO ${this.sanitizeTableName(table)} (${columns.join(',')})
        VALUES (${placeholders})
      `;

      const result = await this.raw(sql, values);
      const insertedId = result.lastID;

      this.logOperation('create', table, { id: insertedId, data });
      
      return { id: insertedId, ...data };
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Find records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async find(table, criteria = {}, options = {}) {
    this.validateCriteria(criteria);

    try {
      const { where, params } = this.buildWhereClause(criteria);
      const opts = this.parseQueryOptions(options);

      let sql = `SELECT * FROM ${this.sanitizeTableName(table)} WHERE ${where}`;

      // Add ORDER BY
      if (opts.orderBy) {
        sql += ` ORDER BY ${opts.orderBy} ${opts.orderDirection}`;
      }

      // Add LIMIT and OFFSET
      if (opts.limit) {
        sql += ` LIMIT ${opts.limit}`;
      }
      if (opts.offset) {
        sql += ` OFFSET ${opts.offset}`;
      }

      const result = await this.raw(sql, params);
      
      this.logOperation('find', table, { criteria, count: result.length });
      
      return result;
    } catch (error) {
      this.handleError(error, 'find');
    }
  }

  /**
   * Find single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(table, id) {
    try {
      const sql = `SELECT * FROM ${this.sanitizeTableName(table)} WHERE id = ? LIMIT 1`;
      const result = await this.raw(sql, [id]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Find single record by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object|null>} Record or null
   */
  async findOne(table, criteria) {
    const results = await this.find(table, criteria, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of updated records
   */
  async update(table, criteria, data) {
    this.validateCriteria(criteria);
    this.validateData(data);

    try {
      const setClause = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      const setValues = Object.values(data);

      const { where, params } = this.buildWhereClause(criteria);
      const allParams = [...setValues, ...params];

      const sql = `
        UPDATE ${this.sanitizeTableName(table)}
        SET ${setClause}
        WHERE ${where}
      `;

      const result = await this.raw(sql, allParams);
      
      this.logOperation('update', table, { criteria, changes: result.changes });
      
      return result.changes;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * Update single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async updateById(table, id, data) {
    const changes = await this.update(table, { id }, data);
    return changes > 0;
  }

  /**
   * Delete records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of deleted records
   */
  async delete(table, criteria) {
    this.validateCriteria(criteria);

    try {
      const { where, params } = this.buildWhereClause(criteria);

      const sql = `DELETE FROM ${this.sanitizeTableName(table)} WHERE ${where}`;

      const result = await this.raw(sql, params);
      
      this.logOperation('delete', table, { criteria, changes: result.changes });
      
      return result.changes;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  /**
   * Delete single record by ID
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteById(table, id) {
    const changes = await this.delete(table, { id });
    return changes > 0;
  }

  /**
   * Count records by criteria
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of records
   */
  async count(table, criteria = {}) {
    this.validateCriteria(criteria);

    try {
      const { where, params } = this.buildWhereClause(criteria);

      const sql = `SELECT COUNT(*) as count FROM ${this.sanitizeTableName(table)} WHERE ${where}`;

      const result = await this.raw(sql, params);
      
      return result[0].count;
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  // ========================================
  // Batch Operations
  // ========================================

  /**
   * Insert multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} records - Records to insert
   * @returns {Promise<Array>} Created records with IDs
   */
  async bulkCreate(table, records) {
    if (!Array.isArray(records) || records.length === 0) {
      return [];
    }

    try {
      const results = [];
      
      await this.beginTransaction();

      for (const record of records) {
        const created = await this.create(table, record);
        results.push(created);
      }

      await this.commit();
      
      this.logOperation('bulkCreate', table, { count: results.length });
      
      return results;
    } catch (error) {
      await this.rollback();
      this.handleError(error, 'bulkCreate');
    }
  }

  /**
   * Update multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} updates - Updates with criteria and data
   * @returns {Promise<number>} Number of updated records
   */
  async bulkUpdate(table, updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return 0;
    }

    try {
      let totalChanges = 0;
      
      await this.beginTransaction();

      for (const { criteria, data } of updates) {
        const changes = await this.update(table, criteria, data);
        totalChanges += changes;
      }

      await this.commit();
      
      this.logOperation('bulkUpdate', table, { totalChanges });
      
      return totalChanges;
    } catch (error) {
      await this.rollback();
      this.handleError(error, 'bulkUpdate');
    }
  }

  /**
   * Delete multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} criteriaList - List of criteria
   * @returns {Promise<number>} Number of deleted records
   */
  async bulkDelete(table, criteriaList) {
    if (!Array.isArray(criteriaList) || criteriaList.length === 0) {
      return 0;
    }

    try {
      let totalChanges = 0;
      
      await this.beginTransaction();

      for (const criteria of criteriaList) {
        const changes = await this.delete(table, criteria);
        totalChanges += changes;
      }

      await this.commit();
      
      this.logOperation('bulkDelete', table, { totalChanges });
      
      return totalChanges;
    } catch (error) {
      await this.rollback();
      this.handleError(error, 'bulkDelete');
    }
  }

  // ========================================
  // Transaction Support
  // ========================================

  /**
   * Begin transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    await this.raw('BEGIN TRANSACTION');
  }

  /**
   * Commit transaction
   * @returns {Promise<void>}
   */
  async commit() {
    await this.raw('COMMIT');
  }

  /**
   * Rollback transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    await this.raw('ROLLBACK');
  }

  // ========================================
  // Raw Query Support
  // ========================================

  /**
   * Execute raw SQL query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async raw(sql, params = []) {
    if (!this.connected || !this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

      if (isSelect) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(new Error(`SQL Error: ${err.message}\nQuery: ${sql}`));
          } else {
            resolve(rows);
          }
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) {
            reject(new Error(`SQL Error: ${err.message}\nQuery: ${sql}`));
          } else {
            resolve(this);
          }
        });
      }
    });
  }

  async queryOne(sql, params = []) {
    const rows = await this.raw(sql, params);
    return rows[0];
  }

  // ========================================
  // Table Management
  // ========================================

  /**
   * Create table
   * @param {string} table - Table name
   * @param {Object} schema - Table schema
   * @returns {Promise<void>}
   */
  async createTable(table, schema) {
    try {
      const columns = Object.entries(schema)
        .map(([name, definition]) => `${name} ${definition}`)
        .join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS ${this.sanitizeTableName(table)} (${columns})`;

      await this.raw(sql);
      
      this.logOperation('createTable', table, { schema });
    } catch (error) {
      this.handleError(error, 'createTable');
    }
  }

  /**
   * Drop table
   * @param {string} table - Table name
   * @returns {Promise<void>}
   */
  async dropTable(table) {
    try {
      const sql = `DROP TABLE IF EXISTS ${this.sanitizeTableName(table)}`;
      await this.raw(sql);
      
      this.logOperation('dropTable', table, {});
    } catch (error) {
      this.handleError(error, 'dropTable');
    }
  }

  /**
   * Check if table exists
   * @param {string} table - Table name
   * @returns {Promise<boolean>}
   */
  async tableExists(table) {
    try {
      const sql = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `;
      
      const result = await this.raw(sql, [this.sanitizeTableName(table)]);
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'tableExists');
    }
  }

  /**
   * Get table schema
   * @param {string} table - Table name
   * @returns {Promise<Object>}
   */
  async getTableSchema(table) {
    try {
      const sql = `PRAGMA table_info(${this.sanitizeTableName(table)})`;
      const result = await this.raw(sql);
      
      return result;
    } catch (error) {
      this.handleError(error, 'getTableSchema');
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Open database connection
   * @private
   * @returns {Promise<sqlite3.Database>}
   */
  _openDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(db);
        }
      });
    });
  }

  /**
   * Configure database settings
   * @private
   * @returns {Promise<void>}
   */
  async _configureDatabase() {
    const config = this.options;

    // Enable foreign keys
    if (config.foreignKeys !== false) {
      await this.raw('PRAGMA foreign_keys = ON');
    }

    // Set journal mode (WAL for better concurrency)
    if (config.journalMode) {
      await this.raw(`PRAGMA journal_mode = ${config.journalMode}`);
    }

    // Set synchronous mode
    if (config.synchronous) {
      await this.raw(`PRAGMA synchronous = ${config.synchronous}`);
    }

    // Set cache size
    if (config.cacheSize) {
      await this.raw(`PRAGMA cache_size = ${config.cacheSize}`);
    }

    // Set busy timeout
    if (config.busyTimeout) {
      await this.raw(`PRAGMA busy_timeout = ${config.busyTimeout}`);
    }

    console.log('SQLiteAdapter: Database configured');
  }
}

module.exports = SQLiteAdapter;
