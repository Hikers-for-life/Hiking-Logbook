import { getAuth } from "firebase/auth";
import { discoverFriends, addFriend, getUserDetails } from '../services/discover.js';

// Mock Firebase auth and fetch
jest.mock("firebase/auth");
jest.mock('../api/api.js', () => ({
  API_BASE: 'http://localhost:3001/api'
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Discover Service', () => {
  const mockToken = 'mock-firebase-token';
  const mockUser = { getIdToken: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser.getIdToken.mockResolvedValue(mockToken);
    getAuth.mockReturnValue({
      currentUser: mockUser
    });
  });

  describe('getToken', () => {
    it('should use token for authenticated requests', async () => {
      const mockSuggestions = [
        { id: 'user1', name: 'John Doe', avatar: 'avatar1.jpg', mutualFriends: 3, commonTrails: 2 }
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions
      });

      await discoverFriends();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover',  // Fixed URL
        {
          headers: { Authorization: `Bearer ${mockToken}` }
        }
      );
    });

    it('should handle unauthenticated requests', async () => {
      const auth = getAuth();
      auth.currentUser = null;

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(discoverFriends()).rejects.toThrow('Failed to fetch suggestions');
    });
  });

  describe('discoverFriends', () => {
    it('should fetch suggested friends successfully', async () => {
      const mockSuggestions = [
        { id: 'user1', name: 'John Doe', avatar: 'avatar1.jpg', mutualFriends: 3, commonTrails: 2 },
        { id: 'user2', name: 'Jane Smith', avatar: 'avatar2.jpg', mutualFriends: 1, commonTrails: 5 }
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions
      });

      const result = await discoverFriends();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover',  // Fixed URL
        {
          headers: { Authorization: `Bearer ${mockToken}` }
        }
      );
      expect(result).toEqual(mockSuggestions);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(discoverFriends()).rejects.toThrow('Failed to fetch suggestions');
    });
  });

  describe('addFriend', () => {
    it('should add friend successfully', async () => {
      const mockResponse = { success: true, friendId: 'user123' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await addFriend('user123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/add',  // Fixed URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ friendId: 'user123' })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when add friend fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(addFriend('user123')).rejects.toThrow('Failed to add friend');
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details successfully', async () => {
      const mockUserDetails = {
        id: 'user123',
        name: 'John Doe',
        avatar: 'avatar.jpg',
        bio: 'Hiking enthusiast',
        trailCount: 15
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserDetails
      });

      const result = await getUserDetails('user123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/user123',  // Fixed URL
        {
          headers: { Authorization: `Bearer ${mockToken}` }
        }
      );
      expect(result).toEqual(mockUserDetails);
    });

    it('should throw error when getUserDetails fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getUserDetails('invalid-user')).rejects.toThrow('Failed to fetch user details');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors in getUserDetails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getUserDetails('user123')).rejects.toThrow('Network error');
    });
  });

  describe('API URL Construction', () => {
    it('should construct proper endpoints for each function', async () => {
      // Test discoverFriends endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await discoverFriends();
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/discover', expect.any(Object));

      // Test addFriend endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
      await addFriend('user123');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/discover/add', expect.any(Object));

      // Test getUserDetails endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      await getUserDetails('user123');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/discover/user123', expect.any(Object));
    });
  });
});