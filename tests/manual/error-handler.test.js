/**
 * ===================================
 * Test Suite for Error Handling Utility
 * ===================================
 * @test-suite utils/error-handler
 */

const {
  AppError,
  ValidationError,
  DatabaseError,
  PermissionError,
  NotFoundError,
  ErrorHandler,
  wrapAsync
} = require('../../src/utils/error-handler.util');

describe('Error Handling Utilities', () => {

  describe('Error Classes', () => {
    test('ValidationError should have correct properties', () => {
      const error = new ValidationError('رسالة للمستخدم', 'رسالة للمطور', { field: 'email' });
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400); // Bad Request
      expect(error.userMessage).toBe('رسالة للمستخدم');
      expect(error.details).toEqual({ field: 'email' });
    });

    test('DatabaseError should have correct properties', () => {
      const error = new DatabaseError('رسالة قاعدة البيانات');
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('DatabaseError');
      expect(error.statusCode).toBe(500); // Internal Server Error
    });

    test('PermissionError should have correct properties', () => {
        const error = new PermissionError('ممنوع الوصول');
        expect(error).toBeInstanceOf(AppError);
        expect(error.name).toBe('PermissionError');
        expect(error.statusCode).toBe(403); // Forbidden
    });

    test('NotFoundError should have correct properties', () => {
        const error = new NotFoundError('غير موجود');
        expect(error).toBeInstanceOf(AppError);
        expect(error.name).toBe('NotFoundError');
        expect(error.statusCode).toBe(404); // Not Found
    });
  });

  describe('ErrorHandler', () => {
    test('handle() should send userMessage to ctx.reply', async () => {
      const error = new ValidationError('البيانات غير صحيحة');
      const mockCtx = {
        reply: jest.fn() // إنشاء دالة وهمية لتتبع الاستدعاءات
      };

      await ErrorHandler.handle(error, mockCtx);
      
      // ✅ تم التعديل: إضافة الوسيط الثاني الذي يتوقعه الكود
      expect(mockCtx.reply).toHaveBeenCalledWith(
        'البيانات غير صحيحة',
        { parse_mode: 'HTML' }
      );
    });
  });
  
  describe('wrapAsync', () => {
    test('should catch errors from async functions and pass them to ErrorHandler', async () => {
      // تعديل ErrorHandler مؤقتًا للتجسس على دالة handle
      const handleSpy = jest.spyOn(ErrorHandler, 'handle').mockImplementation(() => {});

      const failingAsyncFn = async (ctx) => {
        throw new Error('Something failed');
      };

      const wrappedFn = wrapAsync(failingAsyncFn);
      const mockCtx = { from: { id: 123 } };

      await wrappedFn(mockCtx);

      // تحقق من أن ErrorHandler.handle تم استدعاؤه
      expect(handleSpy).toHaveBeenCalledTimes(1);
      
      // استعادة الدالة الأصلية
      handleSpy.mockRestore();
    });
  });
});