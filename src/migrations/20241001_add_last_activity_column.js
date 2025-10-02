/**
 * Migration: Add last_activity column to users table
 */

module.exports = {
  up: async (db) => {
    try {
      // Check if the column already exists
      const columnExists = await db.get(`
        SELECT * FROM pragma_table_info('users') 
        WHERE name = 'last_activity'
      `);

      if (!columnExists) {
        // Add the column if it doesn't exist
        await db.run(`
          ALTER TABLE users 
          ADD COLUMN last_activity TEXT
        `);
        
        console.log('✅ Added last_activity column to users table');
      } else {
        console.log('✅ last_activity column already exists');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },
  
  down: async (db) => {
    // This migration doesn't support rollback as it's not safe to drop a column
    // that might contain data
    console.warn('⚠️ Migration does not support rollback');
    return true;
  }
};
