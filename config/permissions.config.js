/**
 * Permissions Configuration
 * Role-based access control (RBAC) system with 3 levels
 * 
 * @module config/permissions.config
 */

const config = {
  // =======================================
  // Role Definitions (3 Levels - Simplified)
  // =======================================
  roles: {
    SUPER_ADMIN: {
      name: 'super_admin',
      level: 3,
      displayName: { ar: '👑 المالك', en: '👑 Super Admin' },
      description: { ar: 'صلاحيات كاملة - المالك الوحيد', en: 'Full system access - Owner only' },
    },
    ADMIN: {
      name: 'admin',
      level: 2,
      displayName: { ar: '⭐ مشرف معتمد', en: '⭐ Approved Admin' },
      description: { ar: 'مشرف معتمد - صلاحيات كاملة للعمل', en: 'Approved admin - Full work access' },
    },
    VISITOR: {
      name: 'visitor',
      level: 1,
      displayName: { ar: '👤 زائر', en: '👤 Visitor' },
      description: { ar: 'بدون صلاحيات - في انتظار الموافقة', en: 'No permissions - Pending approval' },
    },
  },

  // ========================================
  // Permission Categories (Simplified to 3)
  // ========================================
  categories: {
    GENERAL: {
      name: 'general',
      displayName: { ar: 'عام', en: 'General' },
      permissions: [
        'general.help',
        'general.menu',
        'general.profile',
        'general.stats',
      ],
    },
    ADMINISTRATION: {
      name: 'administration',
      displayName: { ar: 'إدارة', en: 'Administration' },
      permissions: [
        'administration.users',
        'administration.requests',
      ],
    },
    SYSTEM: {
      name: 'system',
      displayName: { ar: 'النظام', en: 'System' },
      permissions: [
        'system.settings',
        'system.logs',
        'system.backup',
      ],
    },
  },

  // ========================================
  // Role-Permission Mapping (Simplified)
  // ========================================
  rolePermissions: {
    super_admin: ['*'],
    admin: [
      'general.*',
      'administration.users', // Admins can view users but not manage requests
    ],
    visitor: [], // No permissions by default, handled by middleware
  },

  // ========================================
  // Default Role Assignment
  // ========================================
  defaults: {
    newUserRole: 'visitor',
    autoRegistration: false,
  },

  // =======================================
  // Helper Methods
  // =======================================

  getRole(roleName) {
    return Object.values(this.roles).find(role => role.name === roleName) || null;
  },

  hasPermission(roleName, permission) {
    const rolePerms = this.rolePermissions[roleName] || [];
    if (rolePerms.includes('*')) return true;
    if (rolePerms.includes(permission)) return true;
    const category = permission.split('.')[0];
    if (rolePerms.includes(`${category}.*`)) return true;
    return false;
  },

  isVisitor(roleName) {
    return roleName === this.roles.VISITOR.name;
  },

  isSuperAdmin(roleName) {
    return roleName === this.roles.SUPER_ADMIN.name;
  },

  isAdminOrHigher(roleName) {
    const role = this.getRole(roleName);
    return role && role.level >= this.roles.ADMIN.level;
  },
};

// =======================================
// Simplified Exports
// =======================================

// Constant for role names
const ROLES = Object.fromEntries(
  Object.values(config.roles).map(role => [role.name.toUpperCase(), role.name])
);

// All permissions flattened into a single object for easy lookup
const PERMISSIONS = Object.fromEntries(
  Object.values(config.categories).flatMap(category =>
    category.permissions.map(permission => {
      const key = permission.replace(/\./g, '_').toUpperCase();
      return [key, permission];
    })
  )
);

module.exports = {
  ...config,
  ROLES,
  PERMISSIONS,
};