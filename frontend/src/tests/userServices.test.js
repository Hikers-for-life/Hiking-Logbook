// Simple smoke tests for userServices
describe('userServices', () => {
  beforeAll(() => {
    // Suppress console output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('userServices module can be imported', () => {
    const userServices = require('../services/userServices');
    expect(userServices).toBeDefined();
  });

  test('userServices exports required functions', () => {
    const userServices = require('../services/userServices');
    expect(userServices.searchUsers).toBeDefined();
    expect(userServices.getUserHikeCount).toBeDefined();
    expect(userServices.getUserProfile).toBeDefined();
  });
});
