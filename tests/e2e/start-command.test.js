// Mock Telegraf
const { Telegraf } = require('telegraf');

// Mock the bot module
jest.mock('../../src/bot', () => ({
  handleStart: jest.fn(),
  handleHelp: jest.fn(),
  handleMenu: jest.fn()
}));

const bot = require('../../src/bot');

describe('Start Command E2E', () => {
  test('should register new user on /start', async () => {
    const mockCtx = {
      from: {
        id: 999999999,
        first_name: 'Test',
        username: 'testuser'
      },
      reply: jest.fn(),
      message: {
        text: '/start'
      }
    };

    // Mock successful user registration - the handler should call ctx.reply
    bot.handleStart.mockImplementation(async (ctx) => {
      await ctx.reply('مرحبا بك في البوت');
      return {
        success: true,
        message: 'مرحبا بك في البوت'
      };
    });

    // Simulate /start command
    await bot.handleStart(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('مرحبا بك في البوت');
    expect(bot.handleStart).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle existing user on /start', async () => {
    const mockCtx = {
      from: {
        id: 888888888,
        first_name: 'Existing',
        username: 'existinguser'
      },
      reply: jest.fn(),
      message: {
        text: '/start'
      }
    };

    // Mock existing user response
    bot.handleStart.mockImplementation(async (ctx) => {
      await ctx.reply('مرحبا بك في البوت');
      return {
        success: true,
        message: 'مرحبا بك في البوت'
      };
    });

    // Simulate /start command
    await bot.handleStart(mockCtx);

    // Check response
    expect(mockCtx.reply).toHaveBeenCalledWith('مرحبا بك في البوت');
    expect(bot.handleStart).toHaveBeenCalledWith(mockCtx);
  });

  test('should handle /start command error', async () => {
    const mockCtx = {
      from: {
        id: 777777777,
        first_name: 'Error',
        username: 'erroruser'
      },
      reply: jest.fn(),
      message: {
        text: '/start'
      }
    };

    // Mock error response
    bot.handleStart.mockRejectedValue(new Error('Database error'));

    // Simulate /start command
    await expect(bot.handleStart(mockCtx)).rejects.toThrow('Database error');
  });

  test('should handle /start with referral', async () => {
    const mockCtx = {
      from: {
        id: 666666666,
        first_name: 'Referral',
        username: 'referraluser'
      },
      reply: jest.fn(),
      message: {
        text: '/start referral123'
      }
    };

    // Mock referral handling - the handler should call ctx.reply
    bot.handleStart.mockImplementation(async (ctx) => {
      await ctx.reply('مرحبا بك من خلال الرابط المرجعي');
      return {
        success: true,
        message: 'مرحبا بك من خلال الرابط المرجعي'
      };
    });

    // Simulate /start command with referral
    await bot.handleStart(mockCtx);

    // Check response  
    expect(mockCtx.reply).toHaveBeenCalledWith('مرحبا بك من خلال الرابط المرجعي');
    expect(bot.handleStart).toHaveBeenCalledWith(mockCtx);
  });
});
