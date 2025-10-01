/**
 * Database Initialization Script
 */

require('dotenv').config();
const dbService = require('../src/services/database.service');
const permissions = require('../config/permissions.config');

async function initDatabase() {
  console.log('🔧 Initializing database...\n');
  
  try {
    await dbService.initialize();
    console.log('✅ Database initialized\n');
    
    const superAdminId = process.env.SUPER_ADMIN_ID;
    
    if (superAdminId) {
      const existing = await dbService.getUserByTelegramId(parseInt(superAdminId));
      
      if (!existing) {
        await dbService.createUser({
          telegram_id: parseInt(superAdminId),
          username: 'admin',
          first_name: 'Super Admin',
          role: permissions.roles.SUPER_ADMIN.name,
          is_active: 1
        });
        console.log(`✅ Super admin created: ${superAdminId}\n`);
      } else {
        console.log(`ℹ️  Admin exists: ${superAdminId}\n`);
      }
    } else {
      console.log('⚠️  Set SUPER_ADMIN_ID in .env\n');
    }
    
    const stats = await dbService.models.user.getStatistics();
    console.log('📊 Stats:');
    console.log(`   Users: ${stats.total}`);
    console.log(`   Admins: ${stats.admins}\n`);
    
    console.log('✅ Ready! Run: npm start\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await dbService.disconnect();
  }
}

initDatabase();
