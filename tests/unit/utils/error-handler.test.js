const errorHandler = require('../../../src/utils/error-handler.util');

describe('Error Handler Utility', () => {
  describe('handleError', () => {
    test('should handle generic error', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('خطأ');
    });

    test('should handle validation error', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('البيانات المدخلة غير صحيحة');
    });

    test('should handle database error', () => {
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('قاعدة البيانات');
    });

    test('should handle network error', () => {
      const error = new Error('Network timeout');
      error.name = 'NetworkError';
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('شبكة');
    });

    test('should handle unknown error', () => {
      const error = new Error('Unknown error');
      error.name = 'UnknownError';
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('حدث خطأ غير متوقع');
    });
  });

  describe('formatError', () => {
    test('should format error with context', () => {
      const error = new Error('Test error');
      const context = { userId: 123, action: 'test' };
      const result = errorHandler.formatError(error, context);
      
      expect(result).toBeDefined();
      expect(result.context).toEqual(context);
    });

    test('should format error without context', () => {
      const error = new Error('Test error');
      const result = errorHandler.formatError(error);
      
      expect(result).toBeDefined();
      expect(result.context).toBeUndefined();
    });
  });

  describe('isRetryableError', () => {
    test('should identify retryable errors', () => {
      const networkError = new Error('Network timeout');
      networkError.name = 'NetworkError';
      
      expect(errorHandler.isRetryableError(networkError)).toBe(true);
    });

    test('should identify non-retryable errors', () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      expect(errorHandler.isRetryableError(validationError)).toBe(false);
    });
  });

  describe('getErrorCode', () => {
    test('should return error code for known errors', () => {
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';
      
      const code = errorHandler.getErrorCode(error);
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
    });

    test('should return default code for unknown errors', () => {
      const error = new Error('Unknown error');
      error.name = 'UnknownError';
      
      const code = errorHandler.getErrorCode(error);
      expect(code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('logError', () => {
    test('should log error with proper format', () => {
      const error = new Error('Test error');
      const context = { userId: 123 };
      
      // Mock the Logger.error method
      const Logger = require('../../../src/utils/logger.util');
      const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();
      
      errorHandler.logError(error, context);
      
      expect(loggerSpy).toHaveBeenCalledWith('Error occurred', expect.objectContaining({
        name: 'Error',
        message: 'Test error',
        context: { userId: 123 }
      }));
      
      loggerSpy.mockRestore();
    });
  });
});
