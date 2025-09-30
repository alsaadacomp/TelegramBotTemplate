/**
 * Logger System Test
 * 
 * Simple test to verify logger functionality
 * Run: node tests/manual/test-logger.js
 */

const Logger = require('../../src/utils/logger.util');

console.log('\n=== Testing Logger System ===\n');

// Test 1: Basic Logging Levels
console.log('Test 1: Basic Logging Levels');
Logger.error('This is an ERROR message');
Logger.warn('This is a WARN message');
Logger.info('This is an INFO message');
Logger.debug('This is a DEBUG message');
Logger.verbose('This is a VERBOSE message');

// Test 2: Categorized Logging
console.log('\nTest 2: Categorized Logging');
Logger.system('info', 'System started successfully');
Logger.database('info', 'Database connected', { host: 'localhost', port: 3306 });
Logger.auth('info', 'User authenticated', { userId: 12345, username: 'testuser' });

// Test 3: User Action Logging
console.log('\nTest 3: User Action Logging');
Logger.userAction(12345, 'login', 'User logged in successfully', {
  username: 'testuser',
  ip: '192.168.1.1'
});

Logger.userAction(67890, 'add_customer', 'User added a new customer', {
  username: 'admin',
  customerName: 'أحمد محمد'
});

// Test 4: Command Logging
console.log('\nTest 4: Command Logging');
Logger.command(12345, '/start', { username: 'testuser' });
Logger.command(67890, '/users list', { username: 'admin' });

// Test 5: Security Logging
console.log('\nTest 5: Security Logging');
Logger.security('warn', 'Failed login attempt', {
  userId: 99999,
  attempts: 3
});

Logger.security('error', 'Unauthorized access attempt', {
  userId: 11111,
  resource: 'admin_panel'
});

// Test 6: Error with Stack Trace
console.log('\nTest 6: Error with Stack Trace');
try {
  throw new Error('Test error for logging');
} catch (error) {
  Logger.error('Caught an error during testing', {
    error: error.message,
    stack: error.stack
  });
}

// Test 7: Custom Category
console.log('\nTest 7: Custom Category');
Logger.custom('PAYMENT', 'info', 'Payment processed successfully', {
  orderId: 'ORD-12345',
  amount: 150.50,
  currency: 'SAR'
});

console.log('\n=== Logger Test Completed ===');
console.log('\nCheck the following locations:');
console.log('1. Console output (you should see colored logs above)');
console.log('2. data/logs/combined.log (all logs in JSON format)');
console.log('3. data/logs/error.log (only error logs)');
console.log('4. data/logs/access.log (user actions)');
console.log('\n');

// Wait a bit for logs to be written
setTimeout(() => {
  console.log('✓ All logs should be written now. You can exit with Ctrl+C\n');
}, 1000);
