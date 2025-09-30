/**
 * Database Configuration
 * SQLite and Google Sheets settings with sync configuration
 * 
 * @module config/database.config
 */

require('dotenv').config();
const path = require('path');

module.exports = {
  // ========================================
  // Database Mode
  // ========================================
  mode: process.env.DB_MODE || 'sqlite', // 'sqlite' | 'sheets' | 'hybrid'

  // ========================================
  // SQLite Configuration
  // ========================================
  sqlite: {
    // Database file path
    path: process.env.SQLITE_PATH || path.join(__dirname, '../data/database/bot.db'),
    
    // Connection options
    options: {
      // Verbose mode for debugging
      verbose: process.env.DEBUG === 'true',
      
      // Enable foreign keys
      foreignKeys: true,
      
      // WAL mode for better concurrency
      journalMode: 'WAL',
      
      // Synchronous mode
      synchronous: 'NORMAL',
      
      // Cache size (pages)
      cacheSize: 2000,
      
      // Busy timeout (ms)
      busyTimeout: 5000,
    },

    // Connection pool settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,
    },

    // Backup settings
    backup: {
      enabled: process.env.SQLITE_BACKUP_ENABLED !== 'false',
      directory: process.env.BACKUP_DIRECTORY || path.join(__dirname, '../data/backups'),
      interval: parseInt(process.env.BACKUP_INTERVAL) || 86400000, // 24 hours
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
      autoBackupOnStartup: true,
    },
  },

  // ========================================
  // Google Sheets Configuration
  // ========================================
  googleSheets: {
    // Enable/disable Google Sheets
    enabled: process.env.GOOGLE_SHEETS_ENABLED === 'true',
    
    // Spreadsheet ID
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    
    // Service account credentials
    credentials: {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      privateKey: process.env.GOOGLE_PRIVATE_KEY 
        ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : '',
    },

    // Sheet names for different data types
    sheets: {
      users: 'Users',
      sections: 'Sections',
      workflows: 'Workflows',
      conversations: 'Conversations',
      settings: 'Settings',
      logs: 'Logs',
    },

    // API settings
    api: {
      // Request timeout (ms)
      timeout: 30000,
      
      // Retry settings
      retry: {
        attempts: 3,
        delay: 1000, // Initial delay
        backoff: 2, // Exponential backoff multiplier
      },

      // Rate limiting
      rateLimit: {
        requestsPerSecond: 10,
        requestsPerMinute: 100,
      },
    },

    // Cache settings for Sheets data
    cache: {
      enabled: true,
      ttl: parseInt(process.env.CACHE_TTL_SHEETS_DATA) || 1800, // 30 minutes
    },
  },

  // ========================================
  // Sync Configuration (for Hybrid mode)
  // ========================================
  sync: {
    // Enable auto sync
    enabled: process.env.AUTO_SYNC_ENABLED === 'true',
    
    // Sync strategy: 'immediate' | 'queue' | 'scheduled'
    strategy: process.env.SYNC_STRATEGY || 'queue',
    
    // Sync direction: 'sqlite_to_sheets' | 'sheets_to_sqlite' | 'bidirectional'
    direction: 'sqlite_to_sheets', // SQLite is source of truth
    
    // Queue settings (for 'queue' strategy)
    queue: {
      // Process queue every X ms
      interval: parseInt(process.env.AUTO_SYNC_INTERVAL) || 300000, // 5 minutes
      
      // Batch size for processing
      batchSize: 50,
      
      // Max retry attempts for failed syncs
      maxRetries: 3,
      
      // Retry delay (ms)
      retryDelay: 5000,
    },

    // Scheduled sync settings (for 'scheduled' strategy)
    schedule: {
      // Cron pattern (every 5 minutes by default)
      pattern: '*/5 * * * *',
      
      // Sync specific tables
      tables: ['users', 'sections', 'workflows'],
    },

    // Conflict resolution
    conflictResolution: {
      // Strategy: 'sqlite_wins' | 'sheets_wins' | 'latest_wins' | 'manual'
      strategy: 'sqlite_wins', // SQLite is source of truth
      
      // Log conflicts for manual review
      logConflicts: true,
    },

    // Sync status tracking
    tracking: {
      // Track sync status in SQLite
      enabled: true,
      
      // Table name for sync tracking
      tableName: 'sync_status',
      
      // Statuses: 'pending' | 'syncing' | 'synced' | 'failed'
      defaultStatus: 'pending',
    },
  },

  // ========================================
  // Tables Configuration
  // ========================================
  tables: {
    // Users table
    users: {
      name: 'users',
      primaryKey: 'telegram_id',
      syncEnabled: true,
      syncPriority: 1, // High priority
    },

    // Sections table
    sections: {
      name: 'sections',
      primaryKey: 'id',
      syncEnabled: true,
      syncPriority: 2,
    },

    // Workflows table
    workflows: {
      name: 'workflows',
      primaryKey: 'id',
      syncEnabled: true,
      syncPriority: 2,
    },

    // Conversations table
    conversations: {
      name: 'conversations',
      primaryKey: 'id',
      syncEnabled: false, // Don't sync conversations (too large)
      syncPriority: 3,
    },

    // Settings table
    settings: {
      name: 'settings',
      primaryKey: 'key',
      syncEnabled: true,
      syncPriority: 1,
    },

    // Sync status table (internal, not synced)
    syncStatus: {
      name: 'sync_status',
      primaryKey: 'id',
      syncEnabled: false,
    },
  },

  // ========================================
  // Performance Settings
  // ========================================
  performance: {
    // Enable query logging
    logQueries: process.env.DEBUG === 'true',
    
    // Slow query threshold (ms)
    slowQueryThreshold: 1000,
    
    // Enable query caching
    cacheQueries: true,
    
    // Connection timeout (ms)
    connectionTimeout: 10000,
  },

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Check if hybrid mode is enabled
   * @returns {boolean}
   */
  isHybridMode() {
    return this.mode === 'hybrid';
  },

  /**
   * Check if Google Sheets is enabled
   * @returns {boolean}
   */
  isSheetsEnabled() {
    return this.mode === 'sheets' || (this.mode === 'hybrid' && this.googleSheets.enabled);
  },

  /**
   * Check if SQLite is enabled
   * @returns {boolean}
   */
  isSQLiteEnabled() {
    return this.mode === 'sqlite' || this.mode === 'hybrid';
  },

  /**
   * Get sync-enabled tables
   * @returns {string[]}
   */
  getSyncEnabledTables() {
    return Object.values(this.tables)
      .filter(table => table.syncEnabled)
      .sort((a, b) => a.syncPriority - b.syncPriority)
      .map(table => table.name);
  },

  /**
   * Validate database configuration
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Validate mode
    if (!['sqlite', 'sheets', 'hybrid'].includes(this.mode)) {
      errors.push('DB_MODE must be one of: sqlite, sheets, hybrid');
    }

    // Validate SQLite settings
    if (this.isSQLiteEnabled()) {
      if (!this.sqlite.path) {
        errors.push('SQLITE_PATH is required when using SQLite');
      }
    }

    // Validate Google Sheets settings
    if (this.isSheetsEnabled()) {
      if (!this.googleSheets.spreadsheetId) {
        errors.push('GOOGLE_SPREADSHEET_ID is required when using Google Sheets');
      }
      
      if (!this.googleSheets.credentials.email) {
        errors.push('GOOGLE_SERVICE_ACCOUNT_EMAIL is required when using Google Sheets');
      }
      
      if (!this.googleSheets.credentials.privateKey) {
        errors.push('GOOGLE_PRIVATE_KEY is required when using Google Sheets');
      }
    }

    // Validate sync settings for hybrid mode
    if (this.isHybridMode() && this.sync.enabled) {
      if (!['immediate', 'queue', 'scheduled'].includes(this.sync.strategy)) {
        errors.push('SYNC_STRATEGY must be one of: immediate, queue, scheduled');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get configuration summary for logging
   * @returns {Object}
   */
  getSummary() {
    return {
      mode: this.mode,
      sqliteEnabled: this.isSQLiteEnabled(),
      sheetsEnabled: this.isSheetsEnabled(),
      hybridMode: this.isHybridMode(),
      syncEnabled: this.sync.enabled,
      syncStrategy: this.sync.strategy,
      syncTables: this.getSyncEnabledTables(),
      backupEnabled: this.sqlite.backup.enabled,
    };
  },
};
