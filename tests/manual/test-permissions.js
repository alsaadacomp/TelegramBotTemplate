/**
 * ====================================
 * Permission System Test Suite
 * ====================================
 * اختبار شامل لنظام الصلاحيات
 * * الاختبارات:
 * - التحقق من الصلاحيات الأساسية
 * - إدارة الأدوار
 * - الوصول للأقسام
 * - التسلسل الهرمي
 * - الكاش والأداء
 * * @test-suite permissions
 */

const { createInstance } = require('../../src/services/permission.service');
const dbService = require('../../src/services/database.service');
const cacheService = require('../../src/services/cache.service');
const { ROLES, PERMISSIONS } = require('../../config/permissions.config');

// ألوان للإخراج
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

let testsPassed = 0;
let testsFailed = 0;
let permissionService;

/**
 * طباعة نتيجة الاختبار
 */
function printTest(name, passed, message = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  const status = passed ? 'PASS' : 'FAIL';
  
  console.log(`${color}${icon} ${status}${colors.reset} - ${name}`);
  
  if (message) {
    console.log(`  ${colors.gray}${message}${colors.reset}`);
  }
  
  if (passed) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

/**
 * طباعة عنوان قسم
 */
function printSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * الانتظار لمدة معينة
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ====================================
 * إعداد بيئة الاختبار
 * ====================================
 */
async function setup() {
  printSection('🔧 SETUP - Initializing Test Environment');
  
  try {
    permissionService = createInstance();
    await permissionService.initialize();
    await dbService.initialize();
    
    const testUsers = [
      { telegram_id: 11111, username: 'super_admin_test', role: ROLES.SUPER_ADMIN },
      { telegram_id: 22222, username: 'admin_test', role: ROLES.ADMIN },
      { telegram_id: 33333, username: 'manager_test', role: ROLES.MANAGER },
      { telegram_id: 44444, username: 'moderator_test', role: ROLES.MODERATOR },
      { telegram_id: 55555, username: 'user_test', role: ROLES.USER }
    ];
    
    for (const userData of testUsers) {
      const existing = await dbService.getUserByTelegramId(userData.telegram_id);
      if (existing) await dbService.deleteUserByTelegramId(userData.telegram_id); // ✅ ضمان بيئة نظيفة
      await dbService.createUser(userData);
    }
    
    const testSection = {
      section_id: 'test_section',
      name: 'Test Section',
      type: 'main',
      enabled: 1,
      visible: 1,
      order_index: 0,
      permissions: JSON.stringify({
        view: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER, ROLES.MODERATOR, ROLES.SUPER_ADMIN],
        create: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN],
        edit: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        delete: [ROLES.SUPER_ADMIN]
      })
    };
    
    const existingSection = await dbService.getSection('test_section');
    if (existingSection) await dbService.deleteSection('test_section'); // ✅ ضمان بيئة نظيفة
    await dbService.createSection(testSection);
    
    console.log(`${colors.green}✓${colors.reset} Test environment initialized`);
    console.log(`${colors.gray}Created 5 test users and 1 test section${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Setup failed:${colors.reset}`, error);
    throw error;
  }
}

/**
 * ====================================
 * اختبار 1: التحقق من الصلاحيات الأساسية
 * ====================================
 */
async function testBasicPermissions() {
  printSection('📋 TEST 1 - Basic Permission Checks');
  
  try {
    const superAdminPerms = await permissionService.getUserPermissions(11111);
    printTest(
      '1.1 Super Admin has all permissions',
      superAdminPerms.length === Object.keys(PERMISSIONS).length,
      `Has ${superAdminPerms.length}/${Object.keys(PERMISSIONS).length} permissions`
    );
    
    const canManageSystem = await permissionService.checkPermission(55555, 'SYSTEM_MANAGE');
    printTest('1.2 Regular user cannot manage system', !canManageSystem, 'Permission correctly denied');
    
    const canViewUsers = await permissionService.checkPermission(22222, 'USERS_VIEW');
    printTest('1.3 Admin can view users', canViewUsers, 'Permission correctly granted');
    
    const canCreateData = await permissionService.checkPermission(33333, 'DATA_CREATE');
    printTest('1.4 Manager can create data', canCreateData, 'Permission correctly granted');
    
    const canViewData = await permissionService.checkPermission(44444, 'DATA_VIEW');
    const canDeleteData = await permissionService.checkPermission(44444, 'DATA_DELETE');
    printTest('1.5 Moderator can view but not delete data', canViewData && !canDeleteData, 'View: ✓, Delete: ✗');
    
  } catch (error) {
    printTest('Basic Permissions Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 2: إدارة الأدوار
 * ====================================
 */
async function testRoleManagement() {
  printSection('👥 TEST 2 - Role Management');
  
  try {
    const userRole = await permissionService.getUserRole(55555);
    printTest('2.1 Get user role', userRole === ROLES.USER, `Role: ${userRole}`);
    
    const assigned = await permissionService.assignRole(55555, ROLES.MODERATOR, 11111);
    const newRole = await permissionService.getUserRole(55555);
    printTest('2.2 Super Admin can assign moderator role', assigned && newRole === ROLES.MODERATOR, `New role: ${newRole}`);
    
    let failedCorrectly = false;
    try {
      await permissionService.assignRole(33333, ROLES.SUPER_ADMIN, 44444);
    } catch (error) {
      failedCorrectly = error.message.toLowerCase().includes('permission');
    }
    printTest('2.3 Moderator cannot assign super admin role', failedCorrectly, 'Hierarchy protection works');
    
    await permissionService.assignRole(55555, ROLES.USER, 11111);
    const promoted = await permissionService.promoteUser(55555, 11111);
    const promotedRole = await permissionService.getUserRole(55555);
    printTest('2.4 Promote user to next role', promoted && promotedRole === ROLES.MODERATOR, `Promoted to: ${promotedRole}`);
    
    const demoted = await permissionService.demoteUser(55555, 11111);
    const demotedRole = await permissionService.getUserRole(55555);
    printTest('2.5 Demote user to previous role', demoted && demotedRole === ROLES.USER, `Demoted to: ${demotedRole}`);
    
  } catch (error) {
    printTest('Role Management Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 3: الوصول للأقسام
 * ====================================
 */
async function testSectionAccess() {
  printSection('🗂️ TEST 3 - Section Access Control');
  
  try {
    const canView = await permissionService.canPerformAction(55555, 'test_section', 'view');
    printTest('3.1 Regular user can view section', canView, 'Section access granted');
    
    const canCreate = await permissionService.canPerformAction(33333, 'test_section', 'create');
    printTest('3.2 Manager can create in section', canCreate, 'Create action granted');
    
    const canEdit = await permissionService.canPerformAction(55555, 'test_section', 'edit');
    printTest('3.3 Regular user cannot edit section', !canEdit, 'Edit action correctly denied');
    
    const adminCanEdit = await permissionService.canPerformAction(22222, 'test_section', 'edit');
    printTest('3.4 Admin can edit section', adminCanEdit, 'Edit action granted');
    
    const userCanDelete = await permissionService.canPerformAction(55555, 'test_section', 'delete');
    const superAdminCanDelete = await permissionService.canPerformAction(11111, 'test_section', 'delete');
    printTest('3.5 Only super admin can delete section', !userCanDelete && superAdminCanDelete, 'Delete restricted to super admin');
    
  } catch (error) {
    printTest('Section Access Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 4: نظام الكاش
 * ====================================
 */
async function testCaching() {
  printSection('💾 TEST 4 - Permission Caching');
  
  try {
    cacheService.clearAll();
    
    const start1 = Date.now();
    await permissionService.checkPermission(22222, 'USERS_VIEW');
    const time1 = Date.now() - start1;
    await sleep(1); // انتظار بسيط لضمان فارق زمني
    
    const start2 = Date.now();
    await permissionService.checkPermission(22222, 'USERS_VIEW');
    const time2 = Date.now() - start2;
    
    printTest('4.1 Cache improves performance', time2 <= time1, `First: ${time1}ms, Cached: ${time2}ms`);
    
    await permissionService.assignRole(55555, ROLES.MANAGER, 11111);
    const cachedUser = cacheService.get('users', '55555');
    printTest('4.2 Cache invalidated after role change', !cachedUser, 'Cache cleared successfully');
    
    await permissionService.assignRole(55555, ROLES.USER, 11111);
    
  } catch (error) {
    printTest('Caching Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 5: الإحصائيات
 * ====================================
 */
async function testStatistics() {
  printSection('📊 TEST 5 - Role Statistics');
  
  try {
    const stats = await permissionService.getRoleStats();
    printTest('5.1 Get role statistics', stats && Object.keys(stats).length > 0, `Total roles tracked: ${Object.keys(stats).length}`);
    
    console.log(`${colors.gray}Role distribution:${colors.reset}`);
    for (const [role, count] of Object.entries(stats)) {
      console.log(`  ${role}: ${count} user(s)`);
    }
    
    const admins = await permissionService.getUsersByRole(ROLES.ADMIN);
    printTest('5.2 Get users by role', Array.isArray(admins), `Found ${admins.length} admin(s)`);
    
  } catch (error) {
    printTest('Statistics Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 6: صلاحيات متعددة
 * ====================================
 */
async function testMultiplePermissions() {
  printSection('🔀 TEST 6 - Multiple Permissions Check');
  
  try {
    const hasAll = await permissionService.checkPermissions(11111, ['USERS_VIEW', 'USERS_EDIT', 'USERS_DELETE']);
    printTest('6.1 Super admin has all user permissions', hasAll, 'All permissions verified');
    
    const hasAny = await permissionService.checkAnyPermission(44444, ['USERS_EDIT', 'DATA_VIEW']);
    printTest('6.2 Moderator has at least one permission', hasAny, 'Has DATA_VIEW permission');
    
    const userHasAdminPerms = await permissionService.checkAnyPermission(55555, ['USERS_EDIT', 'SYSTEM_MANAGE']); // ✅ تم التغيير إلى checkAnyPermission
    printTest('6.3 Regular user has no admin permissions', !userHasAdminPerms, 'Admin permissions correctly denied');
    
  } catch (error) {
    printTest('Multiple Permissions Test', false, error.message);
  }
}

/**
 * ====================================
 * اختبار 7: أداء النظام
 * ====================================
 */
async function testPerformance() {
  printSection('⚡ TEST 7 - Performance Testing');
  
  try {
    const iterations = 1000;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await permissionService.checkPermission(22222, 'USERS_VIEW');
    }
    
    const duration = Date.now() - start;
    const avgTime = duration / iterations;
    
    printTest('7.1 Permission check performance', avgTime < 5, `${iterations} checks in ${duration}ms (avg: ${avgTime.toFixed(3)}ms)`);
    
    // === START: التعديل المقترح ===
    const permissionCacheStats = cacheService.getStats('permissions');
    // التحقق من أن الإحصائيات موجودة وأن القيم أرقام
    const hits = (permissionCacheStats && typeof permissionCacheStats.hits === 'number') ? permissionCacheStats.hits : 0;
    const misses = (permissionCacheStats && typeof permissionCacheStats.misses === 'number') ? permissionCacheStats.misses : 0;
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    printTest(
      '7.2 Cache hit rate',
      hitRate > 95, // أكثر من 95%
      `Hit rate: ${hitRate.toFixed(2)}% (Hits: ${hits}, Misses: ${misses})`
    );
    // === END: التعديل المقترح ===
    
  } catch (error) {
    printTest('Performance Test', false, error.message);
  }
}

/**
 * ====================================
 * تنظيف بيئة الاختبار
 * ====================================
 */
async function cleanup() {
  printSection('🧹 CLEANUP - Cleaning Up Test Environment');
  
  try {
    const testUserIds = [11111, 22222, 33333, 44444, 55555];
    for (const userId of testUserIds) {
      await dbService.deleteUserByTelegramId(userId);
    }
    
    await dbService.deleteSection('test_section');
    cacheService.clearAll();
    
    // لا يوجد دالة cleanup في dbService، تم إزالتها لتجنب خطأ
    // await permissionService.cleanup();
    
    console.log(`${colors.green}✓${colors.reset} Test environment cleaned up`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Cleanup failed:${colors.reset}`, error.message);
  }
}

/**
 * ====================================
 * عرض النتائج النهائية
 * ====================================
 */
function showResults() {
  printSection('📊 TEST RESULTS SUMMARY');
  
  const total = testsPassed + testsFailed;
  if (total === 0) {
    console.log('No tests were run.');
    return;
  }
  const passRate = ((testsPassed / total) * 100).toFixed(2);
  
  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}⚠️  SOME TESTS FAILED${colors.reset}\n`);
  }
}

/**
 * ====================================
 * تشغيل جميع الاختبارات
 * ====================================
 */
async function runAllTests() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}Permission System Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.gray}Testing all permission features...${colors.reset}\n`);
  
  try {
    await setup();
    await testBasicPermissions();
    await testRoleManagement();
    await testSectionAccess();
    await testCaching();
    await testStatistics();
    await testMultiplePermissions();
    await testPerformance();
    
  } catch (error) {
    console.error(`${colors.red}A fatal error occurred during tests:${colors.reset}`, error);
    testsFailed++; // Ensure failure is recorded
  } finally {
    await cleanup();
    showResults();
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runAllTests();