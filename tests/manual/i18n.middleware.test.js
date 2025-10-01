/**
 * ===================================
 * Test Suite for i18n Middleware
 * ===================================
 * @test-suite middleware/i18n
 */

// ✅ تم تصحيح المسار هنا
const { i18nMiddleware } = require('../../src/middleware/i18n.middleware');

describe('i18n Middleware', () => {
  let ctx;
  let next;

  // إعادة تهيئة كائن السياق ودالة next قبل كل اختبار
  beforeEach(() => {
    ctx = {}; // كائن سياق فارغ
    next = jest.fn(); // دالة وهمية لتتبع ما إذا تم استدعاؤها
  });

  test('should attach helper functions to ctx', async () => {
    await i18nMiddleware(ctx, next);
    expect(ctx.toArabic).toBeInstanceOf(Function);
    expect(ctx.toEnglish).toBeInstanceOf(Function);
  });

  test('should normalize numbers in an incoming text message', async () => {
    ctx.message = { text: 'هذا هو الرقم ١٢٣' };
    await i18nMiddleware(ctx, next);
    expect(ctx.message.text).toBe('هذا هو الرقم 123');
  });

  test('should not fail if message or message.text is missing', async () => {
    ctx.message = {};
    // سيقوم باستدعاء الدالة بدون أن ينهار
    await expect(i18nMiddleware(ctx, next)).resolves.not.toThrow();
    
    ctx = {}; // إعادة التعيين لاختبار الحالة التالية
    await expect(i18nMiddleware(ctx, next)).resolves.not.toThrow();
  });

  test('should normalize numbers in callback_query data', async () => {
    ctx.callbackQuery = { data: 'confirm:order_١٢٣' };
    await i18nMiddleware(ctx, next);
    expect(ctx.callbackQuery.data).toBe('confirm:order_123');
  });
  
  test('should handle callback_query data without a separator', async () => {
    ctx.callbackQuery = { data: '١٢٣٤٥' };
    await i18nMiddleware(ctx, next);
    expect(ctx.callbackQuery.data).toBe('12345');
  });

  test('should not fail if callbackQuery or callbackQuery.data is missing', async () => {
    ctx.callbackQuery = {};
    await expect(i18nMiddleware(ctx, next)).resolves.not.toThrow();

    ctx = {}; // إعادة التعيين
    await expect(i18nMiddleware(ctx, next)).resolves.not.toThrow();
  });

  test('should call the next middleware function', async () => {
    await i18nMiddleware(ctx, next);
    // التأكد من أن `next()` قد تم استدعاؤها مرة واحدة بالضبط
    expect(next).toHaveBeenCalledTimes(1);
  });
});