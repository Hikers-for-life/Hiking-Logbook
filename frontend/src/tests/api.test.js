/**
 * @jest-environment node
 */

describe('API Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and clear cache
    jest.resetModules();
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('API_BASE configuration', () => {
    test('should use REACT_APP_API_URL when set', () => {
      // Arrange
      process.env.REACT_APP_API_URL = 'https://production-api.example.com/api';

      // Act - require the module after setting env var
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(API_BASE).toBe('https://production-api.example.com/api');
    });

    test('should use localhost URL when REACT_APP_API_URL is not set', () => {
      // Arrange
      delete process.env.REACT_APP_API_URL;

      // Act - require the module after deleting env var
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(API_BASE).toBe('http://localhost:3001/api');
    });

    test('should use localhost URL when REACT_APP_API_URL is empty string', () => {
      // Arrange
      process.env.REACT_APP_API_URL = '';

      // Act
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(API_BASE).toBe('http://localhost:3001/api');
    });

    // FIXED: Use different approach for undefined and null
    test('should use localhost URL when REACT_APP_API_URL is not defined', () => {
      // Arrange - Simply don't set the variable (already handled by delete in beforeEach)
      delete process.env.REACT_APP_API_URL;

      // Act
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(API_BASE).toBe('http://localhost:3001/api');
    });

    // Remove the null test since process.env values are always strings or undefined
  });

  describe('API_BASE export', () => {
    test('should export API_BASE as a string', () => {
      // Arrange - Ensure we have a valid environment
      delete process.env.REACT_APP_API_URL;

      // Arrange & Act
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(typeof API_BASE).toBe('string');
      expect(API_BASE).toBeDefined();
    });

    test('API_BASE should be a valid URL format', () => {
      // Arrange - Ensure we have a valid environment
      delete process.env.REACT_APP_API_URL;

      // Arrange & Act
      const { API_BASE } = require('../api/api.js');

      // Assert
      expect(API_BASE).toMatch(/^https?:\/\/.+/);
    });
  });
});
