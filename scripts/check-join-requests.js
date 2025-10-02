/**
 * Check Join Requests Script
 * Display all join requests in the database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database/bot.db');

console.log('🔍 Checking join requests in database...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
});

db.all('SELECT * FROM join_requests ORDER BY requested_at DESC', [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying database:', err);
    db.close();
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('⚠️  No join requests found in database.');
    db.close();
    process.exit(0);
  }

  console.log(`✅ Found ${rows.length} join request(s):\n`);
  console.log('='.repeat(80));

  rows.forEach((row, index) => {
    console.log(`\n📝 Request #${index + 1}:`);
    console.log(`   ID: ${row.id}`);
    console.log(`   Name: ${row.full_name}`);
    console.log(`   Phone: ${row.phone}`);
    console.log(`   Telegram ID: ${row.telegram_id}`);
    console.log(`   Username: @${row.username || 'N/A'}`);
    console.log(`   Status: ${row.status}`);
    console.log(`   Requested At: ${row.requested_at}`);
    
    if (row.reviewed_by) {
      console.log(`   Reviewed By: ${row.reviewed_by}`);
      console.log(`   Reviewed At: ${row.reviewed_at}`);
    }
    
    if (row.rejection_reason) {
      console.log(`   Rejection Reason: ${row.rejection_reason}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Total: ${rows.length} request(s)`);
  
  const pendingCount = rows.filter(r => r.status === 'pending').length;
  const approvedCount = rows.filter(r => r.status === 'approved').length;
  const rejectedCount = rows.filter(r => r.status === 'rejected').length;
  
  console.log(`   • Pending: ${pendingCount}`);
  console.log(`   • Approved: ${approvedCount}`);
  console.log(`   • Rejected: ${rejectedCount}`);

  db.close();
});
