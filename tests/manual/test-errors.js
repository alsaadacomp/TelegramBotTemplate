/**
 * Manual Test for Error Handling System
 * 
 * @description Tests all error classes, messages, and logging
 * @author Alsaada Bot Template
 * @version 1.0.0
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const {
  AppError,
  ValidationError,
  DatabaseError,
  PermissionError,
  NotFoundError,
  ConfigError,
  ExternalServiceError,
  RateLimitError,
  FileOperationError,
  BusinessLogicError,
  ErrorHandler,
  wrapAsync
} = require('../../src/utils/error-handler.util');

console.log('\n' + '='.repeat(60));
console.log('🧪 Starting Error Handling System Tests');
console.log('='.repeat(60) + '\n');

/**
 * Test a specific error class
 */
async function testErrorClass(ErrorClass, name, testData) {
  console.log(`\n📝 Test: ${name}`);
  console.log('-'.repeat(50));
  
  try {
    const error = new ErrorClass(
      testData.userMessage,
      testData.consoleMessage,
      testData.details
    );
    
    console.log('✅ Error created successfully');
    console.log(`   User Message (AR): ${error.userMessage}`);
    console.log(`   Console Message (EN): ${error.consoleMessage}`);
    console.log(`   Type: ${error.name}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Status Code: ${error.statusCode}`);
    
    if (error.details) {
      console.log(`   Details: ${JSON.stringify(error.details)}`);
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Test failed: ${err.message}`);
    return false;
  }
}

/**
 * Test ErrorHandler.handle
 */
async function testErrorHandler() {
  console.log('\n📝 Test: ErrorHandler.handle()');
  console.log('-'.repeat(50));
  
  try {
    const error = new ValidationError(
      'البيانات المدخلة غير صحيحة',
      'Invalid input data',
      { field: 'username', value: '' }
    );
    
    const mockCtx = {
      from: { id: 123456, first_name: 'Test User' },
      chat: { id: 123456 },
      reply: async (message) => {
        console.log('📤 User message:', message);
      }
    };
    
    await ErrorHandler.handle(error, mockCtx);
    console.log('✅ Error handled successfully');
    return true;
  } catch (err) {
    console.log(`❌ Test failed: ${err.message}`);
    return false;
  }
}

/**
 * Test wrapAsync
 */
async function testWrapAsync() {
  console.log('\n📝 Test: wrapAsync()');
  console.log('-'.repeat(50));
  
  try {
    const asyncFunction = async (ctx) => {
      throw new ValidationError('خطأ في التحقق', 'Validation failed');
    };
    
    const wrapped = wrapAsync(asyncFunction);
    
    const mockCtx = {
      from: { id: 123456, first_name: 'Test User' },
      chat: { id: 123456 },
      reply: async (message) => {
        console.log('📤 User message:', message);
      }
    };
    
    await wrapped(mockCtx);
    console.log('✅ wrapAsync tested successfully');
    return true;
  } catch (err) {
    console.log(`❌ Test failed: ${err.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const results = [];
  
  // 1. Test ValidationError
  results.push(await testErrorClass(
    ValidationError,
    'ValidationError - Data Validation Error',
    {
      userMessage: 'البيانات المدخلة غير صحيحة',
      consoleMessage: 'Invalid input data',
      details: { field: 'email', value: 'invalid-email' }
    }
  ));
  
  // 2. Test DatabaseError
  results.push(await testErrorClass(
    DatabaseError,
    'DatabaseError - Database Operation Error',
    {
      userMessage: 'حدث خطأ في قاعدة البيانات',
      consoleMessage: 'Database connection failed',
      details: { query: 'SELECT * FROM users', errno: 1045 }
    }
  ));
  
  // 3. Test PermissionError
  results.push(await testErrorClass(
    PermissionError,
    'PermissionError - Permission Denied',
    {
      userMessage: 'ليس لديك صلاحية للقيام بهذا الإجراء',
      consoleMessage: 'Permission denied for user',
      details: { userId: 123, requiredRole: 'admin', userRole: 'user' }
    }
  ));
  
  // 4. Test NotFoundError
  results.push(await testErrorClass(
    NotFoundError,
    'NotFoundError - Resource Not Found',
    {
      userMessage: 'العنصر المطلوب غير موجود',
      consoleMessage: 'Resource not found',
      details: { resource: 'user', id: 999 }
    }
  ));
  
  // 5. Test ConfigError
  results.push(await testErrorClass(
    ConfigError,
    'ConfigError - Configuration Error',
    {
      userMessage: 'حدث خطأ في إعدادات النظام',
      consoleMessage: 'Missing required configuration',
      details: { config: 'BOT_TOKEN', file: '.env' }
    }
  ));
  
  // 6. Test ExternalServiceError
  results.push(await testErrorClass(
    ExternalServiceError,
    'ExternalServiceError - External Service Error',
    {
      userMessage: 'الخدمة غير متاحة حالياً',
      consoleMessage: 'External API request failed',
      details: { service: 'Google Sheets', endpoint: '/v4/spreadsheets', statusCode: 503 }
    }
  ));
  
  // 7. Test RateLimitError
  results.push(await testErrorClass(
    RateLimitError,
    'RateLimitError - Rate Limit Exceeded',
    {
      userMessage: 'لقد تجاوزت الحد المسموح من الطلبات',
      consoleMessage: 'Rate limit exceeded',
      details: { userId: 123, limit: 10, window: '1 minute' }
    }
  ));
  
  // 8. Test FileOperationError
  results.push(await testErrorClass(
    FileOperationError,
    'FileOperationError - File Operation Failed',
    {
      userMessage: 'حدث خطأ أثناء معالجة الملف',
      consoleMessage: 'File operation failed',
      details: { operation: 'read', path: '/data/users.db', error: 'ENOENT' }
    }
  ));
  
  // 9. Test BusinessLogicError
  results.push(await testErrorClass(
    BusinessLogicError,
    'BusinessLogicError - Business Rule Violation',
    {
      userMessage: 'لا يمكن إكمال هذا الإجراء',
      consoleMessage: 'Business rule violation',
      details: { rule: 'user_must_be_verified', userId: 123 }
    }
  ));
  
  // 10. Test AppError
  results.push(await testErrorClass(
    AppError,
    'AppError - Generic Application Error',
    {
      userMessage: 'حدث خطأ غير متوقع',
      consoleMessage: 'Unexpected application error',
      details: { source: 'unknown' }
    }
  ));
  
  // 11. Test ErrorHandler
  results.push(await testErrorHandler());
  
  // 12. Test wrapAsync
  results.push(await testWrapAsync());
  
  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${((passed/total) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed successfully!');
  } else {
    console.log('\n⚠️ Some tests failed!');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Fatal error in tests:', error);
  process.exit(1);
});
