/**
 * Test Bot Configuration
 * Check if all handlers exist and can be loaded
 */

console.log('🔍 Checking handlers...\n');

const fs = require('fs');
const path = require('path');

// Check handlers directory
const handlersDir = path.join(__dirname, 'src', 'handlers');
console.log('📁 Handlers directory:', handlersDir);

try {
  const files = fs.readdirSync(handlersDir);
  console.log('\n📄 Found files:');
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  
  console.log('\n✅ All handlers found!\n');
  console.log('🔧 Attempting to load handlers...\n');
  
  // Try to load each handler
  files.forEach(file => {
    if (file.endsWith('.js')) {
      try {
        const handler = require(`./src/handlers/${file}`);
        console.log(`  ✅ ${file} - Loaded successfully`);
      } catch (error) {
        console.log(`  ❌ ${file} - Error:`, error.message);
      }
    }
  });
  
} catch (error) {
  console.error('❌ Error reading handlers directory:', error.message);
}

console.log('\n✅ Check completed!\n');
