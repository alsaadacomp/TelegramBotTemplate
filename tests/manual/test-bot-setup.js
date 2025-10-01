/**
 * Bot Setup Test
 */

require('dotenv').config();
const dbService = require('../../src/services/database.service');
const CacheService = require('../../src/services/cache.service');
const logger = require('../../src/utils/logger.util');

console.log('🧪 Testing Bot Setup...\n');

async function test() {
  let passed = 0, failed = 0;
  
  function log(name, success, msg = '') {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (msg) console.log(`   ${msg}`);
    success ? passed++ : failed++;
  }
  
  try {
    // Test 1: Environment
    console.log('\n📋 Test 1: Environment');
    log('BOT_TOKEN', !!process.env.BOT_TOKEN);
    log('SUPER_ADMIN_ID', !!process.env.SUPER_ADMIN_ID);
    
    // Test 2: Database
    console.log('\n📋 Test 2: Database');
    const db = dbService;
    try {
      await db.initialize();
      log('Init', true);
      
      const stats = await db.models.user.getStatistics();
      log('Stats', true, `Users: ${stats.total}`);
      
      await db.disconnect();
      log('Shutdown', true);
    } catch (e) {
      log('Database', false, e.message);
    }
    
    // Test 3: Cache
    console.log('\n📋 Test 3: Cache');
    const cache = CacheService;
    try {
      cache.set('test', 'key', 'value');
      const val = cache.get('test', 'key');
      log('Set/Get', val === 'value');
      
      cache.delete('test', 'key');
      log('Delete', !cache.has('test', 'key'));
    } catch (e) {
      log('Cache', false, e.message);
    }
    
    // Test 4: Logger
    console.log('\n📋 Test 4: Logger');
    try {
      logger.info('TEST', 'Test message');
      log('Logger', true);
    } catch (e) {
      log('Logger', false, e.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(40));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(40) + '\n');
    
    if (failed === 0) {
      console.log('✅ All tests passed! Bot is ready.\n');
    } else {
      console.log('⚠️  Some tests failed. Check configuration.\n');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  }
}

test();
