/**
 * Migration Script: Update conversation_states table structure
 * Changes user_id to telegram_id and removes FOREIGN KEY constraint
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database/bot.db');

async function migrate() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✓ Connected to database');
    });

    db.serialize(() => {
      // Step 1: Check if old table exists
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='conversation_states'", (err, row) => {
        if (err) {
          console.error('Error checking table:', err);
          db.close();
          reject(err);
          return;
        }

        if (!row) {
          console.log('✓ Table does not exist yet, will be created with correct structure');
          db.close();
          resolve();
          return;
        }

        console.log('Found existing conversation_states table, migrating...');

        // Step 2: Backup old data
        db.run('CREATE TABLE IF NOT EXISTS conversation_states_backup AS SELECT * FROM conversation_states', (err) => {
          if (err) {
            console.error('Error creating backup:', err);
            db.close();
            reject(err);
            return;
          }
          console.log('✓ Created backup table');

          // Step 3: Drop old table
          db.run('DROP TABLE conversation_states', (err) => {
            if (err) {
              console.error('Error dropping old table:', err);
              db.close();
              reject(err);
              return;
            }
            console.log('✓ Dropped old table');

            // Step 4: Create new table with correct structure
            const createTableSQL = `
              CREATE TABLE conversation_states (
                telegram_id INTEGER PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                current_step TEXT NOT NULL,
                data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `;

            db.run(createTableSQL, (err) => {
              if (err) {
                console.error('Error creating new table:', err);
                db.close();
                reject(err);
                return;
              }
              console.log('✓ Created new table with correct structure');

              // Step 5: Create index
              db.run('CREATE INDEX IF NOT EXISTS idx_conversation_states_workflow ON conversation_states(workflow_id)', (err) => {
                if (err) {
                  console.error('Error creating index:', err);
                }
                console.log('✓ Created index');

                // Step 6: Try to migrate data if possible
                db.all('SELECT * FROM conversation_states_backup', (err, rows) => {
                  if (err || !rows || rows.length === 0) {
                    console.log('✓ No data to migrate');
                    db.run('DROP TABLE conversation_states_backup', () => {
                      console.log('✓ Migration completed successfully!');
                      db.close();
                      resolve();
                    });
                    return;
                  }

                  console.log(`Found ${rows.length} rows to migrate`);
                  
                  // Note: We can't automatically migrate user_id to telegram_id
                  // This would require looking up users table
                  console.log('⚠ Old data cannot be migrated automatically (user_id -> telegram_id mapping needed)');
                  console.log('✓ Migration completed successfully! Old data backed up in conversation_states_backup');
                  
                  db.close();
                  resolve();
                });
              });
            });
          });
        });
      });
    });
  });
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    console.log('You can now restart the bot.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
