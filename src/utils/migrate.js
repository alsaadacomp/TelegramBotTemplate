/**
 * Database Migration Runner
 * 
 * This script applies database migrations to ensure the database schema is up to date.
 * It should be run during application startup.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const logger = require('./logger.util');
const dbService = require('../services/database.service');

const readdir = promisify(fs.readdir);

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrations = [];
    this.migrationsTable = 'schema_migrations';
  }

  /**
   * Initialize the migration system
   */
  async initialize() {
    try {
      // Create migrations table if it doesn't exist
      await this._createMigrationsTable();
      
      // Load all migration files
      await this._loadMigrations();
      
      // Run pending migrations
      await this.runMigrations();
      
      logger.info('Migrations completed successfully', 'Migration');
      return true;
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create the migrations table if it doesn't exist
   */
  async _createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await dbService.run(query);
  }

  /**
   * Load all migration files from the migrations directory
   */
  async _loadMigrations() {
    try {
      const files = await readdir(this.migrationsPath);
      
      // Filter and sort migration files
      this.migrations = files
        .filter(file => file.endsWith('.js') && file !== 'index.js')
        .sort()
        .map(file => ({
          name: file,
          path: path.join(this.migrationsPath, file)
        }));
      
      logger.info(`Loaded ${this.migrations.length} migration(s)`, 'Migration');
    } catch (error) {
      logger.error('Failed to load migrations:', error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    try {
      // Get already executed migrations
      const executedMigrations = await this._getExecutedMigrations();
      
      // Filter out already executed migrations
      const pendingMigrations = this.migrations.filter(
        m => !executedMigrations.includes(m.name)
      );
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to run', 'Migration');
        return [];
      }
      
      logger.info(`Found ${pendingMigrations.length} pending migration(s)`, 'Migration');
      
      // Run each migration
      const results = [];
      for (const migration of pendingMigrations) {
        try {
          logger.info(`Running migration: ${migration.name}`, 'Migration');
          
          // Load migration module
          const migrationModule = require(migration.path);
          
          // Run migration
          await dbService.run('BEGIN TRANSACTION');
          await migrationModule.up(dbService);
          
          // Record migration
          await this._recordMigration(migration.name);
          await dbService.run('COMMIT');
          
          results.push({
            name: migration.name,
            status: 'success'
          });
          
          logger.info(`Migration ${migration.name} completed successfully`, 'Migration');
        } catch (error) {
          await dbService.run('ROLLBACK');
          logger.error(`Migration ${migration.name} failed:`, error);
          
          results.push({
            name: migration.name,
            status: 'failed',
            error: error.message
          });
          
          // Stop on first failure
          break;
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Get list of already executed migrations
   */
  async _getExecutedMigrations() {
    try {
      const rows = await dbService.all(`
        SELECT name FROM ${this.migrationsTable} ORDER BY name
      `);
      return rows.map(row => row.name);
    } catch (error) {
      logger.error('Failed to get executed migrations:', error);
      return [];
    }
  }

  /**
   * Record a migration as executed
   */
  async _recordMigration(name) {
    await dbService.run(
      `INSERT INTO ${this.migrationsTable} (name) VALUES (?)`,
      [name]
    );
  }
}

// Export a singleton instance
module.exports = new MigrationRunner();
