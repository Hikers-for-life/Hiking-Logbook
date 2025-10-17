// Tests for errorHandler middleware
const {
  notFoundHandler,
  errorHandler,
} = require('../middleware/errorHandler.js');

describe('Error Handler Middleware Tests', () => {
  // Mock request, response, and next objects
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      originalUrl: '/api/test',
      method: 'GET',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('notFoundHandler', () => {
    test('should return 404 status with correct error message', () => {
      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found',
        path: '/api/test',
        method: 'GET',
      });
    });

    test('should handle different HTTP methods', () => {
      mockReq.method = 'POST';
      mockReq.originalUrl = '/api/users';

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found',
        path: '/api/users',
        method: 'POST',
      });
    });

    test('should handle complex URLs', () => {
      mockReq.originalUrl = '/api/users/123/hikes?filter=recent';

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found',
        path: '/api/users/123/hikes?filter=recent',
        method: 'GET',
      });
    });
  });

  describe('errorHandler', () => {
    test('should handle ValidationError with 400 status', () => {
      const error = new Error('Invalid input data');
      error.name = 'ValidationError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid input data',
      });
    });

    test('should handle UnauthorizedError with 401 status', () => {
      const error = new Error('Token invalid');
      error.name = 'UnauthorizedError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });

    test('should handle ForbiddenError with 403 status', () => {
      const error = new Error('Access denied');
      error.name = 'ForbiddenError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden',
      });
    });

    test('should handle NotFoundError with 404 status', () => {
      const error = new Error('User not found');
      error.name = 'NotFoundError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Resource not found',
      });
    });

    test('should handle generic errors with 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    test('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        stack: 'Error: Test error\n    at test.js:1:1',
      });

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    test('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    test('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith('Global error handler:', error);

      consoleSpy.mockRestore();
    });

    test('should handle errors without name property', () => {
      const error = { message: 'Error without name' };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    test('should handle errors with unknown name', () => {
      const error = new Error('Custom error');
      error.name = 'CustomError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });

  describe('Integration scenarios', () => {
    test('should handle multiple error types consistently', () => {
      const errorTypes = [
        {
          name: 'ValidationError',
          expectedStatus: 400,
          expectedMessage: 'Test message',
        },
        {
          name: 'UnauthorizedError',
          expectedStatus: 401,
          expectedMessage: 'Unauthorized',
        },
        {
          name: 'ForbiddenError',
          expectedStatus: 403,
          expectedMessage: 'Forbidden',
        },
        {
          name: 'NotFoundError',
          expectedStatus: 404,
          expectedMessage: 'Resource not found',
        },
      ];

      errorTypes.forEach(({ name, expectedStatus, expectedMessage }) => {
        // Reset mocks
        mockRes.status.mockClear();
        mockRes.json.mockClear();

        const error = new Error('Test message');
        error.name = name;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: expectedMessage,
        });
      });
    });

    test('should preserve original error message for ValidationError', () => {
      const error = new Error('Email is required and must be valid');
      error.name = 'ValidationError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email is required and must be valid',
      });
    });
  });
});
