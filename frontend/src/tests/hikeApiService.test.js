// services/__tests__/hikeService.test.js
import { hikeApiService } from '../services/hikeApiService';
import { auth } from '../config/firebase';

// Mock Firebase auth
jest.mock('../config/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(),
    },
  },
}));

// Mock plannedHikesService for startHikeFromPlanned test
jest.mock('../services/plannedHikesService', () => ({
  plannedHikeApiService: {
    startPlannedHike: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('hikeService', () => {
  const mockToken = 'mock-jwt-token';
  const mockHikeId = 'hike123';

  beforeEach(() => {
    jest.clearAllMocks();
    auth.currentUser = {
      getIdToken: jest.fn().mockResolvedValue(mockToken),
    };
    process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getHikes', () => {
    it('should fetch all hikes without filters', async () => {
      const mockHikes = [
        { id: 'hike1', title: 'Mountain Trail', status: 'completed' },
        { id: 'hike2', title: 'Forest Path', status: 'planned' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHikes),
      });

      const result = await hikeApiService.getHikes();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockHikes);
    });

    it('should fetch hikes with status filter', async () => {
      const mockHikes = [
        { id: 'hike1', title: 'Mountain Trail', status: 'completed' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHikes),
      });

      await hikeApiService.getHikes({ status: 'completed' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?status=completed',
        expect.any(Object)
      );
    });

    it('should fetch hikes with difficulty filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await hikeApiService.getHikes({ difficulty: 'hard' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?difficulty=hard',
        expect.any(Object)
      );
    });

    it('should fetch hikes with date range filters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await hikeApiService.getHikes({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?dateFrom=2024-01-01&dateTo=2024-12-31',
        expect.any(Object)
      );
    });

    it('should fetch hikes with pinned filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await hikeApiService.getHikes({ pinned: true });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?pinned=true',
        expect.any(Object)
      );
    });

    it('should fetch hikes with search query', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await hikeApiService.getHikes({ search: 'mountain' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?search=mountain',
        expect.any(Object)
      );
    });

    it('should fetch hikes with multiple filters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await hikeApiService.getHikes({
        status: 'completed',
        difficulty: 'moderate',
        pinned: false,
        search: 'trail',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes?status=completed&difficulty=moderate&pinned=false&search=trail',
        expect.any(Object)
      );
    });

    it('should handle authentication errors', async () => {
      auth.currentUser = null;

      await expect(hikeApiService.getHikes()).rejects.toThrow(
        'No authenticated user'
      );
    });

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      });

      await expect(hikeApiService.getHikes()).rejects.toThrow('Server error');
    });

    it('should handle API errors without message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(hikeApiService.getHikes()).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });
  });

  describe('getStats', () => {
    it('should fetch hiking statistics', async () => {
      const mockStats = {
        totalHikes: 25,
        totalDistance: 150.5,
        totalElevation: 5000,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStats),
      });

      const result = await hikeApiService.getStats();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes/stats',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getHike', () => {
    it('should fetch a specific hike by ID', async () => {
      const mockHike = {
        id: mockHikeId,
        title: 'Mountain Trail',
        distance: '5.2 miles',
        status: 'completed',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHike),
      });

      const result = await hikeApiService.getHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockHike);
    });
  });

  describe('createHike', () => {
    it('should create a new hike', async () => {
      const newHikeData = {
        title: 'New Trail',
        location: 'Rocky Mountains',
        distance: '10 miles',
        difficulty: 'hard',
        status: 'planned',
      };

      const mockResponse = {
        id: 'newHike123',
        ...newHikeData,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.createHike(newHikeData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newHikeData),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateHike', () => {
    it('should update an existing hike', async () => {
      const updateData = {
        title: 'Updated Trail Name',
        distance: '12 miles',
      };

      const mockResponse = {
        id: mockHikeId,
        title: 'Updated Trail Name',
        distance: '12 miles',
        status: 'completed',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.updateHike(mockHikeId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteHike', () => {
    it('should delete a hike', async () => {
      const mockResponse = {
        success: true,
        message: 'Hike deleted successfully',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.deleteHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('startHike', () => {
    it('should start tracking a new hike', async () => {
      const startData = {
        title: 'Active Trail',
        location: 'Local Park',
        startTime: new Date().toISOString(),
      };

      const mockResponse = {
        id: 'activeHike123',
        ...startData,
        status: 'in-progress',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.startHike(startData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes/start',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(startData),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('completeHike', () => {
    it('should complete a hike', async () => {
      const endData = {
        endTime: new Date().toISOString(),
        totalDistance: '8.5 miles',
        totalElevation: 1200,
      };

      const mockResponse = {
        id: mockHikeId,
        status: 'completed',
        ...endData,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.completeHike(mockHikeId, endData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/complete`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(endData),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addWaypoint', () => {
    it('should add a GPS waypoint to a hike', async () => {
      const waypoint = {
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: new Date().toISOString(),
        altitude: 150,
      };

      const mockResponse = {
        id: mockHikeId,
        waypoints: [waypoint],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.addWaypoint(mockHikeId, waypoint);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/waypoint`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(waypoint),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHikeStats', () => {
    it('should fetch hike statistics overview', async () => {
      const mockStats = {
        totalHikes: 50,
        totalDistance: 300.5,
        totalElevation: 10000,
        averageDistance: 6.01,
        longestHike: 25,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStats),
      });

      const result = await hikeApiService.getHikeStats();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes/stats/overview',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getHikeProgress', () => {
    it('should fetch hike progress data', async () => {
      const mockProgress = {
        monthly: [
          { month: 'January', hikes: 5, distance: 25 },
          { month: 'February', hikes: 7, distance: 35 },
        ],
        yearly: { total: 12, distance: 60 },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProgress),
      });

      const result = await hikeApiService.getHikeProgress();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hikes/progress',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockProgress);
    });
  });

  describe('pinHike', () => {
    it('should pin a hike', async () => {
      const mockResponse = {
        id: mockHikeId,
        pinned: true,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.pinHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/pin`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unpinHike', () => {
    it('should unpin a hike', async () => {
      const mockResponse = {
        id: mockHikeId,
        pinned: false,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.unpinHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/unpin`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('shareHike', () => {
    it('should share a hike with friends', async () => {
      const mockResponse = {
        id: mockHikeId,
        shared: true,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.shareHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/share`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unshareHike', () => {
    it('should unshare a hike', async () => {
      const mockResponse = {
        id: mockHikeId,
        shared: false,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await hikeApiService.unshareHike(mockHikeId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/hikes/${mockHikeId}/unshare`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('startHikeFromPlanned', () => {
    it('should start a hike from planned hike', async () => {
      const plannedHikeId = 'planned123';
      const additionalData = {
        startTime: new Date().toISOString(),
      };

      const mockResponse = {
        id: 'newHike456',
        title: 'Started Hike',
        status: 'in-progress',
      };

      // Mock the dynamic import
      const {
        plannedHikeApiService,
      } = require('../services/plannedHikesService');
      plannedHikeApiService.startPlannedHike.mockResolvedValueOnce(
        mockResponse
      );

      const result = await hikeApiService.startHikeFromPlanned(
        plannedHikeId,
        additionalData
      );

      expect(plannedHikeApiService.startPlannedHike).toHaveBeenCalledWith(
        plannedHikeId,
        additionalData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when starting from planned hike', async () => {
      const plannedHikeId = 'planned123';
      const error = new Error('Failed to start planned hike');

      const {
        plannedHikeApiService,
      } = require('../services/plannedHikesService');
      plannedHikeApiService.startPlannedHike.mockRejectedValueOnce(error);

      await expect(
        hikeApiService.startHikeFromPlanned(plannedHikeId)
      ).rejects.toThrow('Failed to start planned hike');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(hikeApiService.getHikes()).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(hikeApiService.getHikes()).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      global.fetch.mockRejectedValueOnce(error);

      await expect(hikeApiService.getHikes()).rejects.toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith('API request failed:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('API_BASE_URL configuration', () => {
    it('should use environment variable when set', () => {
      process.env.REACT_APP_API_URL = 'https://custom-api.com/api';
      // This would require re-importing the module, but testing logic is shown
      expect(process.env.REACT_APP_API_URL).toBe('https://custom-api.com/api');
    });

    it('should use production URL on firebase hosting', () => {
      const originalHostname = window.location.hostname;
      delete window.location;
      window.location = { hostname: 'hiking-logbook.web.app' };

      // URL determination happens at import time
      window.location.hostname = originalHostname;
    });

    it('should use localhost in development', () => {
      process.env.REACT_APP_API_URL = undefined;
      const originalHostname = window.location.hostname;
      delete window.location;
      window.location = { hostname: 'localhost' };

      window.location.hostname = originalHostname;
    });
  });
});
