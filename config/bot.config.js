/**
 * Bot Configuration
 * Main bot settings and credentials
 * 
 * @module config/bot.config
 */

require('dotenv').config();

module.exports = {
  // ========================================
  // Bot Credentials
  // ========================================
  bot: {
    token: process.env.BOT_TOKEN || '',
    username: process.env.BOT_USERNAME || '',
    
    // Webhook settings (optional)
    webhook: {
      enabled: process.env.USE_WEBHOOK === 'true',
      domain: process.env.WEBHOOK_DOMAIN || '',
      port: parseInt(process.env.WEBHOOK_PORT) || 8443,
      path: process.env.WEBHOOK_PATH || '/webhook',
    },
  },

  // ========================================
  // Admin Configuration
  // ========================================
  admins: {
    // Super Admin (required) - has all permissions
    superAdminId: parseInt(process.env.SUPER_ADMIN_ID) || 0,
    
    // Additional Admin IDs (comma-separated in .env)
    adminIds: process.env.ADMIN_IDS 
      ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [],
  },

  // ========================================
  // Application Settings
  // ========================================
  app: {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Port for webhook or health check
    port: parseInt(process.env.PORT) || 3000,
    
    // Timezone
    timezone: process.env.TIMEZONE || 'Asia/Riyadh',
    
    // Default language
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'ar',
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'ar').split(','),
  },

  // ========================================
  // Security Settings
  // ========================================
  security: {
    // Session configuration
    session: {
      secret: process.env.SESSION_SECRET || 'change-this-secret-key',
      ttl: parseInt(process.env.SESSION_TTL) || 86400000, // 24 hours in ms
    },

    // Rate limiting
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
      maxRequestsUser: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_USER) || 20,
      maxRequestsAdmin: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_ADMIN) || 60,
    },

    // Request timeout
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 seconds
  },

  // ========================================
  // File Upload Settings
  // ========================================
  upload: {
    // Maximum file size in bytes (default 5MB)
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    
    // Allowed MIME types
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 
      'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
    ).split(',').map(type => type.trim()),
    
    // Upload directory
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    
    // Auto cleanup
    autoCleanup: {
      enabled: process.env.AUTO_CLEANUP_ENABLED !== 'false',
      days: parseInt(process.env.AUTO_CLEANUP_DAYS) || 7,
    },
  },

  // ========================================
  // Feature Flags
  // ========================================
  features: {
    workflows: process.env.FEATURE_WORKFLOWS_ENABLED !== 'false',
    sections: process.env.FEATURE_SECTIONS_ENABLED !== 'false',
    excelExport: process.env.FEATURE_EXCEL_EXPORT_ENABLED !== 'false',
    googleSheets: process.env.FEATURE_GOOGLE_SHEETS_ENABLED === 'true',
    notifications: process.env.FEATURE_NOTIFICATIONS_ENABLED !== 'false',
    analytics: process.env.FEATURE_ANALYTICS_ENABLED === 'true',
  },

  // ========================================
  // Notification Settings
  // ========================================
  notifications: {
    notifyAdminsOnError: process.env.NOTIFY_ADMINS_ON_ERROR !== 'false',
    notifyAdminsOnNewUser: process.env.NOTIFY_ADMINS_ON_NEW_USER === 'true',
    notifyAdminsOnCritical: process.env.NOTIFY_ADMINS_ON_CRITICAL !== 'false',
  },

  // ========================================
  // Development Settings
  // ========================================
  debug: {
    enabled: process.env.DEBUG === 'true',
    verboseLogging: process.env.VERBOSE_LOGGING === 'true',
    skipPermissionCheck: process.env.SKIP_PERMISSION_CHECK === 'true',
  },

  // ========================================
  // Helper Methods
  // ========================================
  
  /**
   * Check if user is Super Admin
   * @param {number} userId - Telegram user ID
   * @returns {boolean}
   */
  isSuperAdmin(userId) {
    return userId === this.admins.superAdminId;
  },

  /**
   * Check if user is Admin (including Super Admin)
   * @param {number} userId - Telegram user ID
   * @returns {boolean}
   */
  isAdmin(userId) {
    return this.isSuperAdmin(userId) || this.admins.adminIds.includes(userId);
  },

  /**
   * Get all admin IDs (including Super Admin)
   * @returns {number[]}
   */
  getAllAdminIds() {
    return [this.admins.superAdminId, ...this.admins.adminIds].filter(id => id > 0);
  },

  /**
   * Validate bot configuration
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Check required fields
    if (!this.bot.token) {
      errors.push('BOT_TOKEN is required');
    }

    if (!this.admins.superAdminId || this.admins.superAdminId === 0) {
      errors.push('SUPER_ADMIN_ID is required');
    }

    if (this.bot.webhook.enabled && !this.bot.webhook.domain) {
      errors.push('WEBHOOK_DOMAIN is required when webhook is enabled');
    }

    if (this.features.googleSheets && !process.env.GOOGLE_SPREADSHEET_ID) {
      errors.push('GOOGLE_SPREADSHEET_ID is required when Google Sheets is enabled');
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
      environment: this.app.env,
      botUsername: this.bot.username,
      webhookEnabled: this.bot.webhook.enabled,
      superAdminConfigured: this.admins.superAdminId > 0,
      adminCount: this.admins.adminIds.length,
      featuresEnabled: Object.keys(this.features).filter(key => this.features[key]),
      timezone: this.app.timezone,
      language: this.app.defaultLanguage,
    };
  },
};
