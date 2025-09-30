/**
 * Permissions Configuration
 * Role-based access control (RBAC) system with 5 levels
 * 
 * @module config/permissions.config
 */

module.exports = {
  // ========================================
  // Role Definitions (5 Levels)
  // ========================================
  roles: {
    SUPER_ADMIN: {
      name: 'super_admin',
      level: 5,
      displayName: {
        ar: '👑 المالك',
        en: '👑 Super Admin',
      },
      description: {
        ar: 'صلاحيات كاملة على النظام',
        en: 'Full system access',
      },
      color: '#FF0000', // Red
    },

    ADMIN: {
      name: 'admin',
      level: 4,
      displayName: {
        ar: '⭐ مشرف',
        en: '⭐ Admin',
      },
      description: {
        ar: 'إدارة المستخدمين والأقسام',
        en: 'User and section management',
      },
      color: '#FFA500', // Orange
    },

    MANAGER: {
      name: 'manager',
      level: 3,
      displayName: {
        ar: '💼 مدير',
        en: '💼 Manager',
      },
      description: {
        ar: 'إدارة البيانات والتقارير',
        en: 'Data and report management',
      },
      color: '#FFD700', // Gold
    },

    MODERATOR: {
      name: 'moderator',
      level: 2,
      displayName: {
        ar: '🛡️ منسق',
        en: '🛡️ Moderator',
      },
      description: {
        ar: 'مراجعة وتعديل البيانات',
        en: 'Review and edit data',
      },
      color: '#4169E1', // Royal Blue
    },

    USER: {
      name: 'user',
      level: 1,
      displayName: {
        ar: '👤 مستخدم',
        en: '👤 User',
      },
      description: {
        ar: 'استخدام أساسي',
        en: 'Basic usage',
      },
      color: '#808080', // Gray
    },
  },

  // ========================================
  // Permission Categories
  // ========================================
  categories: {
    // System permissions
    SYSTEM: {
      name: 'system',
      displayName: { ar: 'النظام', en: 'System' },
      permissions: [
        'system.config.view',
        'system.config.edit',
        'system.logs.view',
        'system.backup.create',
        'system.backup.restore',
        'system.stats.view',
      ],
    },

    // User management permissions
    USERS: {
      name: 'users',
      displayName: { ar: 'المستخدمين', en: 'Users' },
      permissions: [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.ban',
        'users.unban',
        'users.role.change',
        'users.export',
      ],
    },

    // Section management permissions
    SECTIONS: {
      name: 'sections',
      displayName: { ar: 'الأقسام', en: 'Sections' },
      permissions: [
        'sections.view',
        'sections.create',
        'sections.edit',
        'sections.delete',
        'sections.reorder',
        'sections.enable',
        'sections.disable',
      ],
    },

    // Workflow permissions
    WORKFLOWS: {
      name: 'workflows',
      displayName: { ar: 'العمليات', en: 'Workflows' },
      permissions: [
        'workflows.view',
        'workflows.create',
        'workflows.edit',
        'workflows.delete',
        'workflows.execute',
        'workflows.export',
      ],
    },

    // Data management permissions
    DATA: {
      name: 'data',
      displayName: { ar: 'البيانات', en: 'Data' },
      permissions: [
        'data.view.own',
        'data.view.all',
        'data.create',
        'data.edit.own',
        'data.edit.all',
        'data.delete.own',
        'data.delete.all',
        'data.export',
        'data.import',
      ],
    },

    // Report permissions
    REPORTS: {
      name: 'reports',
      displayName: { ar: 'التقارير', en: 'Reports' },
      permissions: [
        'reports.view',
        'reports.create',
        'reports.export',
        'reports.schedule',
      ],
    },

    // File permissions
    FILES: {
      name: 'files',
      displayName: { ar: 'الملفات', en: 'Files' },
      permissions: [
        'files.upload',
        'files.download',
        'files.delete',
        'files.view.all',
      ],
    },

    // Google Sheets permissions
    SHEETS: {
      name: 'sheets',
      displayName: { ar: 'جداول البيانات', en: 'Sheets' },
      permissions: [
        'sheets.view',
        'sheets.sync',
        'sheets.export',
        'sheets.config',
      ],
    },

    // Notification permissions
    NOTIFICATIONS: {
      name: 'notifications',
      displayName: { ar: 'الإشعارات', en: 'Notifications' },
      permissions: [
        'notifications.send.users',
        'notifications.send.groups',
        'notifications.send.all',
        'notifications.view.log',
      ],
    },
  },

  // ========================================
  // Role-Permission Mapping
  // ========================================
  rolePermissions: {
    // Super Admin: ALL permissions
    super_admin: ['*'],

    // Admin: Most permissions except system config
    admin: [
      'system.logs.view',
      'system.stats.view',
      'users.*',
      'sections.*',
      'workflows.*',
      'data.*',
      'reports.*',
      'files.*',
      'sheets.*',
      'notifications.*',
    ],

    // Manager: Data and report management
    manager: [
      'system.stats.view',
      'users.view',
      'users.export',
      'sections.view',
      'workflows.view',
      'workflows.execute',
      'workflows.export',
      'data.*',
      'reports.*',
      'files.upload',
      'files.download',
      'sheets.view',
      'sheets.sync',
      'sheets.export',
      'notifications.send.users',
    ],

    // Moderator: Limited data management
    moderator: [
      'users.view',
      'sections.view',
      'workflows.view',
      'workflows.execute',
      'data.view.all',
      'data.create',
      'data.edit.own',
      'data.delete.own',
      'reports.view',
      'reports.create',
      'files.upload',
      'files.download',
      'sheets.view',
    ],

    // User: Basic usage only
    user: [
      'sections.view',
      'workflows.view',
      'workflows.execute',
      'data.view.own',
      'data.create',
      'data.edit.own',
      'files.upload',
      'files.download',
    ],
  },

  // ========================================
  // Section-Level Permissions
  // ========================================
  sectionPermissions: {
    // Sections can override role permissions
    // Format: { sectionId: { rolePermissions } }
    // Example:
    // 'sales': {
    //   manager: ['view', 'create', 'edit'],
    //   moderator: ['view', 'create'],
    //   user: ['view']
    // }
  },

  // ========================================
  // Permission Groups (for easier assignment)
  // ========================================
  groups: {
    READ_ONLY: [
      'users.view',
      'sections.view',
      'workflows.view',
      'data.view.own',
      'reports.view',
      'files.download',
      'sheets.view',
    ],

    BASIC_OPERATIONS: [
      'workflows.execute',
      'data.create',
      'data.edit.own',
      'files.upload',
      'files.download',
    ],

    DATA_MANAGEMENT: [
      'data.view.all',
      'data.create',
      'data.edit.all',
      'data.delete.own',
      'data.export',
    ],

    FULL_DATA_ACCESS: [
      'data.*',
      'reports.*',
      'files.*',
    ],

    ADMIN_OPERATIONS: [
      'users.*',
      'sections.*',
      'workflows.*',
      'notifications.*',
    ],
  },

  // ========================================
  // Default Role Assignment
  // ========================================
  defaults: {
    // Default role for new users
    newUserRole: 'user',

    // Auto-promote users after X successful operations (optional)
    autoPromotion: {
      enabled: false,
      rules: [
        {
          fromRole: 'user',
          toRole: 'moderator',
          requiredActions: 50,
        },
      ],
    },
  },

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Get role by name
   * @param {string} roleName - Role name
   * @returns {Object|null}
   */
  getRole(roleName) {
    return Object.values(this.roles).find(role => role.name === roleName) || null;
  },

  /**
   * Get role by level
   * @param {number} level - Role level (1-5)
   * @returns {Object|null}
   */
  getRoleByLevel(level) {
    return Object.values(this.roles).find(role => role.level === level) || null;
  },

  /**
   * Check if role has permission
   * @param {string} roleName - Role name
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  hasPermission(roleName, permission) {
    const rolePerms = this.rolePermissions[roleName] || [];
    
    // Check for wildcard (super admin)
    if (rolePerms.includes('*')) return true;

    // Check for exact permission
    if (rolePerms.includes(permission)) return true;

    // Check for category wildcard (e.g., 'users.*')
    const category = permission.split('.')[0];
    if (rolePerms.includes(`${category}.*`)) return true;

    return false;
  },

  /**
   * Get all permissions for a role
   * @param {string} roleName - Role name
   * @returns {string[]}
   */
  getRolePermissions(roleName) {
    const rolePerms = this.rolePermissions[roleName] || [];
    
    // If super admin (wildcard), return all permissions
    if (rolePerms.includes('*')) {
      return this.getAllPermissions();
    }

    // Expand wildcards
    const expanded = [];
    rolePerms.forEach(perm => {
      if (perm.endsWith('.*')) {
        const category = perm.replace('.*', '');
        const categoryObj = Object.values(this.categories).find(cat => cat.name === category);
        if (categoryObj) {
          expanded.push(...categoryObj.permissions);
        }
      } else {
        expanded.push(perm);
      }
    });

    return [...new Set(expanded)];
  },

  /**
   * Get all permissions in the system
   * @returns {string[]}
   */
  getAllPermissions() {
    const allPerms = [];
    Object.values(this.categories).forEach(category => {
      allPerms.push(...category.permissions);
    });
    return allPerms;
  },

  /**
   * Compare role levels
   * @param {string} role1 - First role name
   * @param {string} role2 - Second role name
   * @returns {number} 1 if role1 > role2, -1 if role1 < role2, 0 if equal
   */
  compareRoles(role1, role2) {
    const r1 = this.getRole(role1);
    const r2 = this.getRole(role2);
    
    if (!r1 || !r2) return 0;
    
    if (r1.level > r2.level) return 1;
    if (r1.level < r2.level) return -1;
    return 0;
  },

  /**
   * Check if role1 is higher than role2
   * @param {string} role1 - First role name
   * @param {string} role2 - Second role name
   * @returns {boolean}
   */
  isHigherRole(role1, role2) {
    return this.compareRoles(role1, role2) > 0;
  },

  /**
   * Get roles sorted by level (descending)
   * @returns {Object[]}
   */
  getRolesSorted() {
    return Object.values(this.roles).sort((a, b) => b.level - a.level);
  },

  /**
   * Get roles accessible by a given role (lower levels)
   * @param {string} roleName - Role name
   * @returns {Object[]}
   */
  getManageableRoles(roleName) {
    const role = this.getRole(roleName);
    if (!role) return [];
    
    return Object.values(this.roles).filter(r => r.level < role.level);
  },
};
