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

describe('userApiService', () => {
  let userApiService;

  beforeAll(() => {
    userApiService = require('../services/userService').userApiService;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Service Structure', () => {
    test('should export userApiService object', () => {
      expect(userApiService).toBeDefined();
      expect(typeof userApiService).toBe('object');
    });

    test('should have all required methods', () => {
      expect(typeof userApiService.getCurrentProfile).toBe('function');
      expect(typeof userApiService.getUserProfile).toBe('function');
      expect(typeof userApiService.createProfile).toBe('function');
      expect(typeof userApiService.updateProfile).toBe('function');
      expect(typeof userApiService.deleteAccount).toBe('function');
      expect(typeof userApiService.getUserHikes).toBe('function');
      expect(typeof userApiService.getUserPlannedHikes).toBe('function');
      expect(typeof userApiService.getUserStats).toBe('function');
      expect(typeof userApiService.getUserAchievements).toBe('function');
      expect(typeof userApiService.searchUsers).toBe('function');
      expect(typeof userApiService.followUser).toBe('function');
      expect(typeof userApiService.unfollowUser).toBe('function');
    });
  });

  describe('getCurrentProfile', () => {
    test('should make authenticated GET request for current user profile', async () => {
      const mockProfile = {
        uid: 'test-user-123',
        displayName: 'Test User',
        email: 'test@example.com',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProfile }),
      });

      const result = await userApiService.getCurrentProfile();

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toMatch(/^Bearer /);
      expect(result.data).toEqual(mockProfile);
    });
  });

  describe('getUserProfile', () => {
    test('should make public GET request for specific user profile', async () => {
      const userId = 'user-456';
      const mockProfile = {
        uid: userId,
        displayName: 'Other User',
        bio: 'Hiking enthusiast',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProfile }),
      });

      const result = await userApiService.getUserProfile(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result.data).toEqual(mockProfile);
    });
  });

  describe('createProfile', () => {
    test('should make authenticated POST request to create profile', async () => {
      const profileData = {
        displayName: 'New User',
        bio: 'Love hiking!',
        location: 'Cape Town',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { uid: 'new-user', ...profileData },
        }),
      });

      const result = await userApiService.createProfile(profileData);

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/users/create-profile');
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify(profileData));
      expect(typeof options.headers.Authorization).toBe('string');
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfile', () => {
    test('should make authenticated PATCH request to update profile', async () => {
      const userId = 'user-123';
      const updateData = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { uid: userId, ...updateData },
        }),
      });

      const result = await userApiService.updateProfile(userId, updateData);

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain(`/users/${userId}`);
      expect(options.method).toBe('PATCH');
      expect(typeof options.headers.Authorization).toBe('string');
      expect(options.body).toBe(JSON.stringify(updateData));
      expect(result.success).toBe(true);
    });
  });

  describe('deleteAccount', () => {
    test('should make authenticated DELETE request to remove account', async () => {
      const userId = 'user-123';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Account deleted' }),
      });

      const result = await userApiService.deleteAccount(userId);

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain(`/users/${userId}`);
      expect(options.method).toBe('DELETE');
      expect(typeof options.headers.Authorization).toBe('string');
      expect(result.success).toBe(true);
    });
  });

  describe('getUserHikes', () => {
    test('should make public GET request for user hikes', async () => {
      const userId = 'user-123';
      const mockHikes = [
        { id: 'hike-1', title: 'Mountain Trail' },
        { id: 'hike-2', title: 'Coastal Walk' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockHikes }),
      });

      const result = await userApiService.getUserHikes(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/hikes`),
        expect.any(Object)
      );

      expect(result.data).toEqual(mockHikes);
    });

    test('should include query parameters when provided', async () => {
      const userId = 'user-123';
      const options = {
        limit: 10,
        offset: 5,
        status: 'completed',
        difficulty: 'moderate',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await userApiService.getUserHikes(userId, options);

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('limit=10');
      expect(callUrl).toContain('offset=5');
      expect(callUrl).toContain('status=completed');
      expect(callUrl).toContain('difficulty=moderate');
    });
  });

  describe('getUserPlannedHikes', () => {
    test('should make public GET request for planned hikes', async () => {
      const userId = 'user-123';
      const mockPlannedHikes = [{ id: 'plan-1', title: 'Future Hike' }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockPlannedHikes }),
      });

      const result = await userApiService.getUserPlannedHikes(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/planned-hikes`),
        expect.any(Object)
      );

      expect(result.data).toEqual(mockPlannedHikes);
    });

    test('should include query parameters for planned hikes', async () => {
      const userId = 'user-123';
      const options = {
        limit: 5,
        status: 'upcoming',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await userApiService.getUserPlannedHikes(userId, options);

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('limit=5');
      expect(callUrl).toContain('status=upcoming');
    });
  });

  describe('getUserStats', () => {
    test('should make public GET request for user statistics', async () => {
      const userId = 'user-123';
      const mockStats = {
        totalHikes: 25,
        totalDistance: 150,
        totalElevation: 5000,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      });

      const result = await userApiService.getUserStats(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/stats`),
        expect.any(Object)
      );

      expect(result.data).toEqual(mockStats);
    });
  });

  describe('getUserAchievements', () => {
    test('should make public GET request for user achievements', async () => {
      const userId = 'user-123';
      const mockAchievements = [
        { id: 'badge-1', name: 'First Hike' },
        { id: 'badge-2', name: '100km Club' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAchievements }),
      });

      const result = await userApiService.getUserAchievements(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/achievements`),
        expect.any(Object)
      );

      expect(result.data).toEqual(mockAchievements);
    });
  });

  describe('searchUsers', () => {
    test('should make public GET request to search users', async () => {
      const query = 'john';
      const mockResults = [
        { uid: 'user-1', displayName: 'John Doe' },
        { uid: 'user-2', displayName: 'Johnny Smith' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResults }),
      });

      const result = await userApiService.searchUsers(query);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/search'),
        expect.any(Object)
      );

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('q=john');

      expect(result.data).toEqual(mockResults);
    });

    test('should include filters in search query', async () => {
      const query = 'hiker';
      const filters = {
        location: 'Cape Town',
        difficulty: 'advanced',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await userApiService.searchUsers(query, filters);

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('q=hiker');
      // Accept either encoded space or plus depending on URL encoding
      expect(callUrl).toMatch(/location=(Cape%20Town|Cape\+Town)/);
      expect(callUrl).toContain('difficulty=advanced');
    });

    test('should work with empty query', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await userApiService.searchUsers('');

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe.skip('followUser', () => {
    test('should make authenticated POST request to follow user', async () => {
      const userId = 'user-456';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'User followed' }),
      });

      const result = await userApiService.followUser(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/follow`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result.success).toBe(true);
    });
  });

  describe.skip('unfollowUser', () => {
    test('should make authenticated DELETE request to unfollow user', async () => {
      const userId = 'user-456';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'User unfollowed' }),
      });

      const result = await userApiService.unfollowUser(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userId}/follow`),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(userApiService.getUserProfile('user-123')).rejects.toThrow(
        'Network error'
      );
    });

    test('should handle authentication errors', async () => {
      const { auth } = require('../config/firebase.js');
      auth.currentUser.getIdToken.mockRejectedValueOnce(
        new Error('Auth failed')
      );

      await expect(userApiService.getCurrentProfile()).rejects.toThrow(
        'Auth failed'
      );
    });

    test('should handle HTTP errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'User not found' }),
      });

      await expect(userApiService.getUserProfile('invalid-id')).rejects.toThrow(
        'User not found'
      );
    });
  });
});
