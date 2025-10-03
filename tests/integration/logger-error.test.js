const logger = require('../../src/utils/logger.util');
const errorHandler = require('../../src/utils/error-handler.util');

describe('Logger + Error Handler Integration', () => {
  test('should log error with proper format', () => {
    const error = new Error('Test error');
    const context = { userId: 123, action: 'test' };
    
    // Mock Winston logger transport
    const mockTransport = {
      log: jest.fn(),
      write: jest.fn()
    };
    
    // Create spy for the logger's error method
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation((message, meta) => {
      mockTransport.log(message, meta);
    });
    
    // Log error
    logger.error('Test error occurred', { error: error.message, context });
    
    expect(mockTransport.log).toHaveBeenCalledWith('Test error occurred', { error: error.message, context });
    loggerSpy.mockRestore();
  });

  test('should handle error through error handler', () => {
    const error = new Error('Database connection failed');
    error.name = 'DatabaseError';
    
    // Handle error
    const result = errorHandler.handleError(error);
    
    expect(result).toBeDefined();
    expect(result.message).toContain('قاعدة البيانات');
  });

  test('should log different error types', () => {
    const errors = [
      { error: new Error('Validation failed'), name: 'ValidationError' },
      { error: new Error('Network timeout'), name: 'NetworkError' },
      { error: new Error('Database error'), name: 'DatabaseError' }
    ];
    
    // Mock Winston logger transport
    const mockTransport = {
      log: jest.fn(),
      write: jest.fn()
    };
    
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation((message, meta) => {
      mockTransport.log(message, meta);
    });
    
    errors.forEach(({ error, name }) => {
      error.name = name;
      logger.error(`${name} occurred`, { error: error.message });
    });
    
    expect(mockTransport.log).toHaveBeenCalledTimes(3);
    loggerSpy.mockRestore();
  });

  test('should handle error with context', () => {
    const error = new Error('Test error');
    const context = { 
      userId: 123, 
      action: 'create_user',
      timestamp: new Date().toISOString()
    };
    
    // Mock Winston logger transport
    const mockTransport = {
      log: jest.fn(),
      write: jest.fn()
    };
    
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation((message, meta) => {
      mockTransport.log(message, meta);
    });
    
    // Format and log error
    const formattedError = errorHandler.formatError(error, context);
    logger.error('Error occurred', formattedError);
    
    expect(mockTransport.log).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  test('should handle retryable errors', () => {
    const networkError = new Error('Network timeout');
    networkError.name = 'NetworkError';
    
    const isRetryable = errorHandler.isRetryableError(networkError);
    expect(isRetryable).toBe(true);
    
    // Mock Winston logger transport
    const mockTransport = {
      log: jest.fn(),
      write: jest.fn()
    };
    
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation((message, meta) => {
      mockTransport.log(message, meta);
    });
    
    // Log retryable error
    logger.warn('Retryable error occurred', { 
      error: networkError.message, 
      retryable: true 
    });
    
    expect(mockTransport.log).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  test('should handle non-retryable errors', () => {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    
    const isRetryable = errorHandler.isRetryableError(validationError);
    expect(isRetryable).toBe(false);
    
    // Mock Winston logger transport
    const mockTransport = {
      log: jest.fn(),
      write: jest.fn()
    };
    
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation((message, meta) => {
      mockTransport.log(message, meta);
    });
    
    // Log non-retryable error
    logger.error('Non-retryable error occurred', { 
      error: validationError.message, 
      retryable: false 
    });
    
    expect(mockTransport.log).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});
