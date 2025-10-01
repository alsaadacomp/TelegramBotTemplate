const { authMiddleware, requireRole } = require('../../src/middleware/auth.middleware');
const dbService = require('../../src/services/database.service');

// محاكاة الخدمات الخارجية
jest.mock('../../src/services/database.service');

describe('Auth Middleware', () => {
  let next;

  beforeEach(() => {
    // إعادة تعيين الدالة الوهمية قبل كل اختبار
    next = jest.fn();
    // مسح استدعاءات الدوال الوهمية السابقة
    dbService.getUserByTelegramId.mockClear();
    dbService.createUser.mockClear();
  });

  test('should create a new user if they do not exist', async () => {
    const ctx = { from: { id: 123, username: 'newuser' } };
    dbService.getUserByTelegramId.mockResolvedValue(null); // المستخدم غير موجود
    dbService.createUser.mockResolvedValue({ id: 1, ...ctx.from, role: 'user' }); // إرجاع مستخدم جديد

    await authMiddleware(ctx, next);

    expect(dbService.createUser).toHaveBeenCalledTimes(1); // التأكد من أنه تم استدعاء دالة إنشاء مستخدم
    expect(ctx.user).toBeDefined(); // التأكد من إضافة المستخدم إلى السياق
    expect(next).toHaveBeenCalledTimes(1); // التأكد من أنه أكمل للخطوة التالية
  });

  test('should retrieve an existing user', async () => {
    const ctx = { from: { id: 456, username: 'existinguser' } };
    dbService.getUserByTelegramId.mockResolvedValue({ id: 2, ...ctx.from, role: 'admin' });

    await authMiddleware(ctx, next);

    expect(dbService.createUser).not.toHaveBeenCalled(); // التأكد من أنه لم يقم بإنشاء مستخدم جديد
    expect(ctx.user.role).toBe('admin');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should block a banned user', async () => {
    const ctx = { 
      from: { id: 789 },
      reply: jest.fn()
    };
    dbService.getUserByTelegramId.mockResolvedValue({ id: 3, status: 'banned' });

    await authMiddleware(ctx, next);

    expect(ctx.reply).toHaveBeenCalledWith('⛔ تم حظرك من استخدام البوت');
    expect(next).not.toHaveBeenCalled(); // التأكد من أنه لم يكمل للخطوة التالية
  });
});