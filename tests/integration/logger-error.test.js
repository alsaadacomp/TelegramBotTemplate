const logger = require('../../src/utils/logger.util');
const errorHandler = require('../../src/utils/error-handler.util');

describe('Logger + Error Handler Integration', () => {
  test('should log error with proper format', () => {
    const error = new Error('Test error');
    const context = { userId: 123, action: 'test' };
    
    // Mock console methods to capture output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Log error
    logger.error('Test error occurred', { error: error.message, context });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should handle error through error handler', () => {
    const error = new Error('Database connection failed');
    error.name = 'DatabaseError';
    
    // Mock console methods
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Handle error
    const result = errorHandler.handleError(error);
    
    expect(result).toBeDefined();
    expect(result.message).toContain('قاعدة البيانات');
    
    consoleSpy.mockRestore();
  });

  test('should log different error types', () => {
    const errors = [
      { error: new Error('Validation failed'), name: 'ValidationError' },
      { error: new Error('Network timeout'), name: 'NetworkError' },
      { error: new Error('Database error'), name: 'DatabaseError' }
    ];
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    errors.forEach(({ error, name }) => {
      error.name = name;
      logger.error(`${name} occurred`, { error: error.message });
    });
    
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    consoleSpy.mockRestore();
  });

  test('should handle error with context', () => {
    const error = new Error('Test error');
    const context = { 
      userId: 123, 
      action: 'create_user',
      timestamp: new Date().toISOString()
    };
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Format and log error
    const formattedError = errorHandler.formatError(error, context);
    logger.error('Error occurred', formattedError);
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should handle retryable errors', () => {
    const networkError = new Error('Network timeout');
    networkError.name = 'NetworkError';
    
    const isRetryable = errorHandler.isRetryableError(networkError);
    expect(isRetryable).toBe(true);
    
    // Log retryable error
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.warn('Retryable error occurred', { 
      error: networkError.message, 
      retryable: true 
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should handle non-retryable errors', () => {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    
    const isRetryable = errorHandler.isRetryableError(validationError);
    expect(isRetryable).toBe(false);
    
    // Log non-retryable error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    logger.error('Non-retryable error occurred', { 
      error: validationError.message, 
      retryable: false 
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
