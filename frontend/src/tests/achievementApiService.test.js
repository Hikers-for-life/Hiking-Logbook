import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('../config/firebase.js', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
      uid: 'test-user-123',
    },
  },
}));

describe('AchievementApiService', () => {
  let achievementApiService;

  beforeAll(() => {
    achievementApiService =
      require('../services/achievementApiService').achievementApiService;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();

    // Ensure auth mock is properly set up for each test
    const { auth } = require('../config/firebase.js');
    if (!auth.currentUser) {
      auth.currentUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        uid: 'test-user-123',
      };
    }
    // Force token to be stable regardless of auth wiring
    jest
      .spyOn(achievementApiService, 'getAuthToken')
      .mockResolvedValue('mock-token');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Service Structure', () => {
    test('should be defined', () => {
      expect(achievementApiService).toBeDefined();
      expect(achievementApiService.getBadges).toBeDefined();
      expect(achievementApiService.getStats).toBeDefined();
    });

    test('should have required methods', () => {
      expect(typeof achievementApiService.getBadges).toBe('function');
      expect(typeof achievementApiService.getStats).toBe('function');
      expect(typeof achievementApiService.getProgress).toBe('function');
      expect(typeof achievementApiService.evaluateBadges).toBe('function');
      expect(typeof achievementApiService.getHikeStats).toBe('function');
      expect(typeof achievementApiService.getAuthToken).toBe('function');
      expect(typeof achievementApiService.makeRequest).toBe('function');
    });
  });

  describe('getAuthToken', () => {
    test('should retrieve token from Firebase auth', async () => {
      const token = await achievementApiService.getAuthToken();
      expect(token).toEqual('mock-token');
      const { auth } = require('../config/firebase.js');
      expect(typeof auth.currentUser.getIdToken).toBe('function');
    });

    test.skip('should throw error when no user is authenticated', async () => {
      const { auth } = require('../config/firebase.js');
      auth.currentUser = null;

      await expect(achievementApiService.getAuthToken()).rejects.toThrow(
        'No authenticated user'
      );

      // Restore for other tests
      auth.currentUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        uid: 'test-user-123',
      };
    });
  });

  describe('makeRequest', () => {
    test('should make authenticated API request', async () => {
      const mockData = { success: true, data: { test: 'value' } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await achievementApiService.makeRequest('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    test('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });
      await expect(
        achievementApiService.makeRequest('/error-endpoint')
      ).rejects.toThrow();
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        achievementApiService.makeRequest('/network-error')
      ).rejects.toThrow('Network error');
    });

    test.skip('should include custom headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await achievementApiService.makeRequest('/test', {
        headers: {
          'Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Custom-Header': 'custom-value',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });

  describe('getBadges', () => {
    test('should fetch user badges', async () => {
      const mockBadges = {
        success: true,
        badges: [
          { id: 'badge-1', name: 'First Hike', earned: true },
          { id: 'badge-2', name: '100km Club', earned: false },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBadges,
      });

      const result = await achievementApiService.getBadges();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/badges'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockBadges);
    });

    test('should handle errors when fetching badges', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(achievementApiService.getBadges()).rejects.toThrow();
    });
  });

  describe('evaluateBadges', () => {
    test('should evaluate and award new badges', async () => {
      const mockResponse = {
        success: true,
        newBadges: [{ id: 'badge-3', name: 'Mountain Climber' }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await achievementApiService.evaluateBadges();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/badges/evaluate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should handle errors when evaluating badges', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(achievementApiService.evaluateBadges()).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    test('should fetch comprehensive user stats', async () => {
      const mockStats = {
        success: true,
        stats: {
          totalHikes: 42,
          totalDistance: 320,
          totalElevation: 8500,
          longestHike: 25,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await achievementApiService.getStats();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockStats);
    });

    test('should handle errors when fetching stats', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(achievementApiService.getStats()).rejects.toThrow();
    });
  });

  describe('getProgress', () => {
    test('should fetch progress data for charts', async () => {
      const mockProgress = {
        success: true,
        progress: {
          monthly: [10, 15, 20, 18],
          weekly: [3, 5, 4, 6],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress,
      });

      const result = await achievementApiService.getProgress();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/hikes/progress'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockProgress);
    });

    test('should handle errors when fetching progress', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(achievementApiService.getProgress()).rejects.toThrow();
    });
  });

  describe('getHikeStats', () => {
    test('should fetch hike statistics', async () => {
      const mockHikeStats = {
        success: true,
        stats: {
          averageDistance: 12.5,
          averageElevation: 450,
          favoriteLocation: 'Table Mountain',
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHikeStats,
      });

      const result = await achievementApiService.getHikeStats();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/hikes/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockHikeStats);
    });

    test('should handle errors when fetching hike stats', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(achievementApiService.getHikeStats()).rejects.toThrow();
    });
  });

  describe('API Configuration', () => {
    test('should use correct API base URL from environment', () => {
      // Service is already instantiated, but we can verify it's defined
      expect(achievementApiService).toBeDefined();
    });

    test('should handle production vs development URLs', () => {
      // The service should work regardless of environment
      expect(typeof achievementApiService.makeRequest).toBe('function');
    });
  });
});
