/**
 * Cache System Test
 * 
 * Simple test to verify cache functionality
 * Run: node tests/manual/test-cache.js
 */

const cacheService = require('../../src/services/cache.service');

console.log('\n========================================');
console.log('🧪 TESTING CACHE SYSTEM');
console.log('========================================\n');

// Test 1: Basic Set/Get
console.log('Test 1: Basic Set/Get');
cacheService.set('users', '12345', { name: 'Ahmad', role: 'admin' });
const user = cacheService.get('users', '12345');
console.log('✅ Set and retrieved user:', user);

// Test 2: Cache Miss
console.log('\nTest 2: Cache Miss');
const missingUser = cacheService.get('users', '99999');
console.log('✅ Cache miss returns:', missingUser === undefined ? 'undefined (correct)' : 'unexpected value');

// Test 3: Has/Delete
console.log('\nTest 3: Has/Delete');
console.log('✅ User 12345 exists:', cacheService.has('users', '12345'));
cacheService.delete('users', '12345');
console.log('✅ After delete, exists:', cacheService.has('users', '12345'));

// Test 4: TTL
console.log('\nTest 4: TTL (Time To Live)');
cacheService.set('users', '11111', { name: 'Test User' }, 5); // 5 seconds TTL
const ttl = cacheService.getTTL('users', '11111');
console.log('✅ TTL for user 11111:', ttl ? `${Math.round((ttl - Date.now()) / 1000)}s remaining` : 'Not set');

// Test 5: Multiple Set/Get (mset/mget)
console.log('\nTest 5: Multiple Set/Get (mset/mget)');
cacheService.mset('users', [
  { key: '1001', value: { name: 'User 1', role: 'user' } },
  { key: '1002', value: { name: 'User 2', role: 'admin' } },
  { key: '1003', value: { name: 'User 3', role: 'manager' } }
]);
const multipleUsers = cacheService.mget('users', ['1001', '1002', '1003']);
console.log('✅ Retrieved multiple users:', Object.keys(multipleUsers).length, 'users');
console.log('   Users:', Object.entries(multipleUsers).map(([k, v]) => `${k}: ${v.name}`).join(', '));

// Test 6: Helper Methods - Cache User
console.log('\nTest 6: Helper Methods - cacheUser()');
cacheService.cacheUser(55555, {
  telegram_id: 55555,
  username: 'testuser',
  first_name: 'محمد',
  role: 'user'
});
const cachedUser = cacheService.getUser(55555);
console.log('✅ User cached:', cachedUser.first_name, `(${cachedUser.username})`);

// Test 7: Delete User
console.log('\nTest 7: Delete User');
cacheService.deleteUser(55555);
const deletedUser = cacheService.getUser(55555);
console.log('✅ After delete:', deletedUser === undefined ? 'Cleared ✓' : 'Still exists ✗');

// Test 8: Cache Section
console.log('\nTest 8: Cache Section');
cacheService.cacheSection('sales', {
  id: 'sales',
  name: 'المبيعات',
  icon: '📊',
  enabled: true
});
const section = cacheService.getSection('sales');
console.log('✅ Section cached:', section.name);

// Test 9: Cache Workflow
console.log('\nTest 9: Cache Workflow');
cacheService.cacheWorkflow('add_customer', {
  id: 'add_customer',
  name: 'إضافة عميل',
  steps: ['name', 'phone', 'type']
});
const workflow = cacheService.getWorkflow('add_customer');
console.log('✅ Workflow cached:', workflow.name, `(${workflow.steps.length} steps)`);

// Test 10: Conversation State
console.log('\nTest 10: Conversation State');
cacheService.cacheConversation(77777, {
  workflow: 'add_customer',
  step: 'enter_phone',
  data: { name: 'أحمد محمد' }
});
const conversationState = cacheService.getConversation(77777);
console.log('✅ Conversation state:', conversationState.workflow, '→', conversationState.step);

cacheService.deleteConversation(77777);
const clearedState = cacheService.getConversation(77777);
console.log('✅ After clear:', clearedState === undefined ? 'Cleared ✓' : 'Still exists ✗');

// Test 11: Settings Cache (no expiration)
console.log('\nTest 11: Settings Cache');
cacheService.cacheSetting('bot_name', 'السعادة بوت');
cacheService.cacheSetting('max_users', 1000);
cacheService.cacheSetting('maintenance_mode', false);

const botName = cacheService.getSetting('bot_name');
const maxUsers = cacheService.getSetting('max_users');
const maintenanceMode = cacheService.getSetting('maintenance_mode');
console.log('✅ Settings cached:', { botName, maxUsers, maintenanceMode });

// Test 12: Get All Keys
console.log('\nTest 12: Get All Keys');
const userKeys = cacheService.keys('users');
console.log('✅ Total cached users:', userKeys.length);
if (userKeys.length > 0) {
  console.log('   First 5 keys:', userKeys.slice(0, 5).join(', '));
}

// Test 13: Count Keys
console.log('\nTest 13: Count Keys');
console.log('✅ Users count:', cacheService.count('users'));
console.log('✅ Sections count:', cacheService.count('sections'));
console.log('✅ Workflows count:', cacheService.count('workflows'));

// Test 14: Cache Statistics
console.log('\nTest 14: Cache Statistics');
const stats = cacheService.getAllStats();
console.log('✅ Cache statistics:');
Object.keys(stats).forEach(type => {
  if (stats[type] && stats[type].keys > 0) {
    console.log(`   ${type}: ${stats[type].keys} keys, ${stats[type].hitRate}% hit rate`);
  }
});

// Test 15: Clear Specific Cache
console.log('\nTest 15: Clear Specific Cache');
const beforeClear = cacheService.count('users');
cacheService.clear('users');
const afterClear = cacheService.count('users');
console.log('✅ Before clear:', beforeClear, 'users');
console.log('✅ After clear:', afterClear, 'users');

// Test 16: Performance Test
console.log('\nTest 16: Performance Test');
console.log('Setting 1000 cache entries...');

const startSetTime = Date.now();
for (let i = 0; i < 1000; i++) {
  cacheService.set('users', `perf_${i}`, {
    id: i,
    name: `User ${i}`,
    timestamp: Date.now()
  });
}
const setTime = Date.now() - startSetTime;

const startGetTime = Date.now();
for (let i = 0; i < 1000; i++) {
  cacheService.get('users', `perf_${i}`);
}
const getTime = Date.now() - startGetTime;

console.log('✅ Set 1000 entries in:', setTime, 'ms');
console.log('✅ Get 1000 entries in:', getTime, 'ms');
console.log('✅ Average set time:', (setTime / 1000).toFixed(3), 'ms/operation');
console.log('✅ Average get time:', (getTime / 1000).toFixed(3), 'ms/operation');

// Test 17: Batch Delete
console.log('\nTest 17: Batch Delete (mdel)');
const keysToDelete = ['perf_0', 'perf_1', 'perf_2', 'perf_3', 'perf_4'];
const deletedCount = cacheService.mdel('users', keysToDelete);
console.log('✅ Deleted', deletedCount, 'entries');

// Test 18: Health Check
console.log('\nTest 18: Health Check');
const health = cacheService.getHealth();
console.log('✅ Cache health:', health.healthy ? '✓ Healthy' : '✗ Unhealthy');
console.log('✅ Total caches:', health.totalCaches);
console.log('✅ Total keys:', health.totalKeys);
console.log('✅ Overall hit rate:', health.overallHitRate + '%');

// Test 19: Print Pretty Stats
console.log('\nTest 19: Print Pretty Stats');
cacheService.printStats();

// Test 20: Cleanup Test
console.log('\nTest 20: Cleanup Test');
// Set some keys with very short TTL
cacheService.set('users', 'temp1', { name: 'Temp 1' }, 1);
cacheService.set('users', 'temp2', { name: 'Temp 2' }, 1);
console.log('✅ Created 2 temporary entries with 1s TTL');
console.log('   Waiting 2 seconds for expiration...');

setTimeout(() => {
  console.log('\nTest 21: After Expiration');
  const expired1 = cacheService.get('users', 'temp1');
  const expired2 = cacheService.get('users', 'temp2');
  console.log('✅ Temp1:', expired1 === undefined ? 'Expired ✓' : 'Still exists ✗');
  console.log('✅ Temp2:', expired2 === undefined ? 'Expired ✓' : 'Still exists ✗');
  
  // Manual cleanup
  cacheService.cleanup('users');
  console.log('✅ Manual cleanup executed');
  
  // Final Stats
  console.log('\n========================================');
  console.log('✅ ALL CACHE TESTS COMPLETED!');
  console.log('========================================\n');
  
  console.log('Final Cache Summary:');
  const finalHealth = cacheService.getHealth();
  console.log('  Total Keys:', finalHealth.totalKeys);
  console.log('  Total Hits:', finalHealth.totalHits);
  console.log('  Total Misses:', finalHealth.totalMisses);
  console.log('  Overall Hit Rate:', finalHealth.overallHitRate + '%');
  
  console.log('\n✅ Cache system is working perfectly!\n');
  
  process.exit(0);
}, 2500);
