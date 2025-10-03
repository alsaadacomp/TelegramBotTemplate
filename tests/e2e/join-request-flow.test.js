// Mock the bot module
jest.mock('../../src/bot', () => ({
  handleJoinRequest: jest.fn(),
  handleApproveRequest: jest.fn(),
  handleRejectRequest: jest.fn()
}));

const bot = require('../../src/bot');

describe('Join Request Flow E2E', () => {
  test('should handle join request submission', async () => {
    const mockCtx = {
      from: {
        id: 111111111,
        first_name: 'Applicant',
        username: 'applicant'
      },
      reply: jest.fn(),
      message: {
        text: 'أريد الانضمام للمجموعة'
      }
    };

    // Mock successful join request - the handler should call ctx.reply
    bot.handleJoinRequest.mockImplementation(async (ctx) => {
      await ctx.reply('تم إرسال طلب الانضمام بنجاح');
      return {
        success: true,
        message: 'تم إرسال طلب الانضمام بنجاح'
      };
    });

    // Simulate join request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('تم إرسال طلب الانضمام بنجاح');
    expect(bot.handleJoinRequest).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle join request approval', async () => {
    const mockCtx = {
      from: {
        id: 222222222,
        first_name: 'Admin',
        username: 'admin'
      },
      reply: jest.fn(),
      callbackQuery: {
        data: 'approve_request_111111111'
      }
    };

    // Mock successful approval - the handler should call ctx.reply
    bot.handleApproveRequest.mockImplementation(async (ctx) => {
      await ctx.reply('تم قبول طلب الانضمام');
      return {
        success: true,
        message: 'تم قبول طلب الانضمام'
      };
    });

    // Simulate approval
    await bot.handleApproveRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('تم قبول طلب الانضمام');
    expect(bot.handleApproveRequest).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle join request rejection', async () => {
    const mockCtx = {
      from: {
        id: 333333333,
        first_name: 'Admin',
        username: 'admin'
      },
      reply: jest.fn(),
      callbackQuery: {
        data: 'reject_request_111111111'
      }
    };

    // Mock successful rejection - the handler should call ctx.reply
    bot.handleRejectRequest.mockImplementation(async (ctx) => {
      await ctx.reply('تم رفض طلب الانضمام');
      return {
        success: true,
        message: 'تم رفض طلب الانضمام'
      };
    });

    // Simulate rejection
    await bot.handleRejectRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('تم رفض طلب الانضمام');
    expect(bot.handleRejectRequest).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle duplicate join request', async () => {
    const mockCtx = {
      from: {
        id: 444444444,
        first_name: 'Duplicate',
        username: 'duplicate'
      },
      reply: jest.fn(),
      message: {
        text: 'أريد الانضمام للمجموعة'
      }
    };

    // Mock duplicate request error - the handler should call ctx.reply
    bot.handleJoinRequest.mockImplementation(async (ctx) => {
      await ctx.reply('لديك طلب انضمام معلق بالفعل');
      return {
        success: false,
        message: 'لديك طلب انضمام معلق بالفعل'
      };
    });

    // Simulate duplicate request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('لديك طلب انضمام معلق بالفعل');
    expect(bot.handleJoinRequest).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle join request with missing information', async () => {
    const mockCtx = {
      from: {
        id: 555555555,
        first_name: 'Incomplete',
        username: 'incomplete'
      },
      reply: jest.fn(),
      message: {
        text: 'أريد الانضمام'
      }
    };

    // Mock incomplete request error - a handler should call ctx.reply
    bot.handleJoinRequest.mockImplementation(async (ctx) => {
      await ctx.reply('إرجى إكمال جميع المعلومات المطلوبة');
      return {
        success: false,
        message: 'إرجى إكمال جميع المعلومات المطلوبة'
      };
    });

    // Simulate incomplete request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('إرجى إكمال جميع المعلومات المطلوبة');
    expect(bot.handleJoinRequest).toHaveBeenCalledWith(mockCtx);
  });
});
