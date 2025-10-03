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

    // Mock successful join request
    bot.handleJoinRequest.mockResolvedValue({
      success: true,
      message: 'تم إرسال طلب الانضمام بنجاح'
    });

    // Simulate join request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalled();
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

    // Mock successful approval
    bot.handleApproveRequest.mockResolvedValue({
      success: true,
      message: 'تم قبول طلب الانضمام'
    });

    // Simulate approval
    await bot.handleApproveRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalled();
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

    // Mock successful rejection
    bot.handleRejectRequest.mockResolvedValue({
      success: true,
      message: 'تم رفض طلب الانضمام'
    });

    // Simulate rejection
    await bot.handleRejectRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalled();
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

    // Mock duplicate request error
    bot.handleJoinRequest.mockResolvedValue({
      success: false,
      message: 'لديك طلب انضمام معلق بالفعل'
    });

    // Simulate duplicate request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalled();
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

    // Mock incomplete request error
    bot.handleJoinRequest.mockResolvedValue({
      success: false,
      message: 'يرجى إكمال جميع المعلومات المطلوبة'
    });

    // Simulate incomplete request
    await bot.handleJoinRequest(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalled();
    expect(bot.handleJoinRequest).toHaveBeenCalledWith(mockCtx);
  });
});
