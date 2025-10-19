// Simple smoke tests for chatService
describe('chatService', () => {
  beforeAll(() => {
    // Suppress console output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('chatService module can be imported', () => {
    const chatService = require('../services/chatService');
    expect(chatService).toBeDefined();
  });

  test('chatService exports required functions', () => {
    const chatService = require('../services/chatService');
    expect(chatService.getConversations).toBeDefined();
    expect(chatService.getConversation).toBeDefined();
    expect(chatService.getMessages).toBeDefined();
    expect(chatService.sendMessage).toBeDefined();
    expect(chatService.markMessagesAsRead).toBeDefined();
    expect(chatService.getUnreadCount).toBeDefined();
  });

  test('chatService default export exists', () => {
    const chatService = require('../services/chatService');
    expect(chatService.chatService).toBeDefined();
    expect(chatService.default).toBeDefined();
  });
});
