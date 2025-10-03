const messageService = require('../../src/services/message.service');
const cacheService = require('../../src/services/cache.service');

describe('Message Service Integration', () => {
  beforeEach(() => {
    cacheService.clearAll();
  });

  test('should send message and cache conversation state', async () => {
    const userId = 123456789;
    const message = 'مرحبا بك في البوت';
    
    // Mock Telegram context
    const mockCtx = {
      from: { id: userId },
      reply: jest.fn()
    };
    
    // Send message
    await messageService.sendMessage(mockCtx, message);
    
    // Check if reply was called
    expect(mockCtx.reply).toHaveBeenCalledWith(message, {});
    
    // Check if conversation state was cached
    const conversationState = cacheService.getConversation(userId);
    expect(conversationState).toBeDefined();
  });

  test('should handle message with keyboard', async () => {
    const userId = 987654321;
    const message = 'اختر خياراً:';
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'خيار 1', callback_data: 'option1' }],
          [{ text: 'خيار 2', callback_data: 'option2' }]
        ]
      }
    };
    
    // Mock Telegram context
    const mockCtx = {
      from: { id: userId },
      reply: jest.fn()
    };
    
    // Send message with keyboard
    await messageService.sendMessage(mockCtx, message, keyboard);
    
    // Check if reply was called with keyboard
    expect(mockCtx.reply).toHaveBeenCalledWith(message, keyboard);
  });

  test('should handle message sending errors', async () => {
    const userId = 555666777;
    const message = 'رسالة تجريبية';
    
    // Mock Telegram context with error
    const mockCtx = {
      from: { id: userId },
      reply: jest.fn().mockRejectedValue(new Error('Telegram API error'))
    };
    
    // Send message (should handle error gracefully)
    await expect(messageService.sendMessage(mockCtx, message)).rejects.toThrow('Telegram API error');
  });

  test('should update conversation state', async () => {
    const userId = 111222333;
    const workflow = 'add_customer';
    const step = 'enter_name';
    const data = { previousStep: 'start' };
    
    // Update conversation state
    await messageService.updateConversationState(userId, workflow, step, data);
    
    // Check if state was updated in cache
    const conversationState = cacheService.getConversation(userId);
    expect(conversationState.workflow).toBe(workflow);
    expect(conversationState.step).toBe(step);
    expect(conversationState.data).toEqual(data);
  });

  test('should clear conversation state', async () => {
    const userId = 444555666;
    
    // Set initial conversation state
    await messageService.updateConversationState(userId, 'test_workflow', 'test_step');
    
    // Clear conversation state
    await messageService.clearConversationState(userId);
    
    // Check if state was cleared
    const conversationState = cacheService.getConversation(userId);
    expect(conversationState).toBeUndefined();
  });

  test('should handle message formatting', async () => {
    const userId = 777888999;
    const message = 'مرحبا {{name}}، مرحبا بك في {{botName}}';
    const variables = { name: 'أحمد', botName: 'بوت السعادة' };
    
    // Mock Telegram context
    const mockCtx = {
      from: { id: userId },
      reply: jest.fn()
    };
    
    // Send formatted message
    await messageService.sendFormattedMessage(mockCtx, message, variables);
    
    // Check if message was formatted correctly
    const expectedMessage = 'مرحبا أحمد، مرحبا بك في بوت السعادة';
    expect(mockCtx.reply).toHaveBeenCalledWith(expectedMessage, {});
  });
});
