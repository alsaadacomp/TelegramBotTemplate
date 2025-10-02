/**
 * Delete Pending Join Requests Script
 * Removes all pending join requests from the database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database/bot.db');

console.log('🗑️  Deleting pending join requests...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
});

// First, show pending requests
db.all("SELECT * FROM join_requests WHERE status = 'pending'", [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying database:', err);
    db.close();
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('✅ No pending requests found.');
    db.close();
    process.exit(0);
  }

  console.log(`Found ${rows.length} pending request(s):\n`);
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id} | Name: ${row.full_name} | Telegram ID: ${row.telegram_id}`);
  });

  console.log('\n🗑️  Deleting all pending requests...');

  // Delete all pending requests
  db.run("DELETE FROM join_requests WHERE status = 'pending'", [], function(err) {
    if (err) {
      console.error('❌ Error deleting requests:', err);
      db.close();
      process.exit(1);
    }

    console.log(`✅ Successfully deleted ${this.changes} pending request(s)!`);
    console.log('\n📝 You can now test the join request flow again.\n');

    // Also delete conversation states to reset the workflow
    db.run("DELETE FROM conversation_states", [], function(err) {
      if (err) {
        console.warn('⚠️  Warning: Could not delete conversation states:', err.message);
      } else {
        console.log(`✅ Also deleted ${this.changes} conversation state(s).\n`);
      }
      
      db.close();
      console.log('✅ Done! Bot is ready for testing.');
    });
  });
});
