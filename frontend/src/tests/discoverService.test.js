import { getAuth } from 'firebase/auth';
import {
  discoverFriends,
  sendFriendRequest,
  getUserDetails,
  getIncomingRequests,
  respondToRequest,
  checkFriendStatus,
} from '../services/discover.js';

// Mock Firebase auth and fetch
jest.mock('firebase/auth');
jest.mock('../api/api.js', () => ({
  API_BASE: 'http://localhost:3001/api',
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
      currentUser: mockUser,
    });
  });

  describe('getToken', () => {
    it('should use token for authenticated requests', async () => {
      const mockSuggestions = [
        {
          id: 'user1',
          name: 'John Doe',
          avatar: 'avatar1.jpg',
          mutualFriends: 3,
          commonTrails: 2,
        },
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      await discoverFriends();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover', // Fixed URL
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        }
      );
    });

    it('should handle unauthenticated requests', async () => {
      const auth = getAuth();
      auth.currentUser = null;

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(discoverFriends()).rejects.toThrow(
        'Failed to fetch suggestions'
      );
    });
  });

  describe('discoverFriends', () => {
    it('should fetch suggested friends successfully', async () => {
      const mockSuggestions = [
        {
          id: 'user1',
          name: 'John Doe',
          avatar: 'avatar1.jpg',
          mutualFriends: 3,
          commonTrails: 2,
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          avatar: 'avatar2.jpg',
          mutualFriends: 1,
          commonTrails: 5,
        },
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const result = await discoverFriends();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover', // Fixed URL
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        }
      );
      expect(result).toEqual(mockSuggestions);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(discoverFriends()).rejects.toThrow(
        'Failed to fetch suggestions'
      );
    });

    it('should use forceRefresh parameter to add cache busting', async () => {
      const mockSuggestions = [
        {
          id: 'user1',
          name: 'John Doe',
          avatar: 'avatar1.jpg',
          mutualFriends: 3,
          commonTrails: 2,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      await discoverFriends(true);

      // Check that the URL includes timestamp for cache busting
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/http:\/\/localhost:3001\/api\/discover\?t=\d+/),
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        }
      );
    });

    it('should use default cache when forceRefresh is false', async () => {
      const mockSuggestions = [
        {
          id: 'user1',
          name: 'John Doe',
          avatar: 'avatar1.jpg',
          mutualFriends: 3,
          commonTrails: 2,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      await discoverFriends(false);

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/discover', // match actual URL
          { headers: { Authorization: `Bearer ${mockToken}` } } // match actual headers
        );
      });
  });

  describe('sendFriendRequest', () => {
    it('should send friend request and return updated suggestions', async () => {
      const mockResponse = { success: true, requestId: 'req123' };
      const mockUpdatedSuggestions = [
        {
          id: 'user2',
          name: 'Jane Smith',
          avatar: 'avatar2.jpg',
          mutualFriends: 1,
          commonTrails: 5,
        },
      ];

      // Mock the friend request response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock the updated suggestions response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedSuggestions,
      });

      const result = await sendFriendRequest('user123');

      // Check that both API calls were made
      expect(fetch).toHaveBeenCalledTimes(2);

      // Check the friend request call
      expect(fetch).toHaveBeenNthCalledWith(1,
        'http://localhost:3001/api/discover/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ friendId: 'user123' }),
        }
      );

      // Check the updated suggestions call
      expect(fetch).toHaveBeenNthCalledWith(2,
        expect.stringMatching(/http:\/\/localhost:3001\/api\/discover\?t=\d+/),
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        }
      );

      expect(result).toEqual({
        ...mockResponse,
        updatedSuggestions: mockUpdatedSuggestions
      });
    });

    it('should throw error when friend request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      await expect(sendFriendRequest('user123')).rejects.toThrow(
        'Failed to send request: 400 Bad request'
      );
    });

    it('should handle error when fetching updated suggestions fails', async () => {
      const mockResponse = { success: true, requestId: 'req123' };

      // Mock successful friend request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock failed suggestions fetch
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(sendFriendRequest('user123')).rejects.toThrow(
        'Failed to fetch suggestions: 500 Server error'
      );
    });
  });

  describe('getIncomingRequests', () => {
    it('should fetch incoming friend requests successfully', async () => {
      const mockRequests = [
        {
          id: 'req1',
          from: 'user1',
          fromName: 'John Doe',
          fromAvatar: 'J',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'req2',
          from: 'user2',
          fromName: 'Jane Smith',
          fromAvatar: 'J',
          createdAt: '2024-01-14T15:30:00Z',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests,
      });

      const result = await getIncomingRequests();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/requests/incoming',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      expect(result).toEqual(mockRequests);
    });

    it('should throw error when fetching incoming requests fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(getIncomingRequests()).rejects.toThrow(
        'Failed to fetch incoming requests: 500 Server error'
      );
    });
  });

  describe('respondToRequest', () => {
    it('should accept friend request successfully', async () => {
      const mockResponse = { success: true, message: 'Request accepted' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await respondToRequest('req123', 'accept');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/requests/req123/respond',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ action: 'accept' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should decline friend request successfully', async () => {
      const mockResponse = { success: true, message: 'Request declined' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await respondToRequest('req123', 'decline');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/requests/req123/respond',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ action: 'decline' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid action', async () => {
      await expect(respondToRequest('req123', 'invalid')).rejects.toThrow(
        'Invalid action. Must be "accept" or "decline"'
      );
    });

    it('should throw error when respond to request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Request not found',
      });

      await expect(respondToRequest('invalid-req', 'accept')).rejects.toThrow(
        'Failed to respond: 404 Request not found'
      );
    });
  });

  describe('checkFriendStatus', () => {
    it('should check friend status successfully - friends', async () => {
      const mockStatus = { status: 'friends' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await checkFriendStatus('user123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/status/user123',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      expect(result).toEqual(mockStatus);
    });

    it('should check friend status successfully - request sent', async () => {
      const mockStatus = {
        status: 'request_sent',
        requestId: 'req123'
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await checkFriendStatus('user123');

      expect(result).toEqual(mockStatus);
    });

    it('should check friend status successfully - request received', async () => {
      const mockStatus = {
        status: 'request_received',
        requestId: 'req456'
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await checkFriendStatus('user123');

      expect(result).toEqual(mockStatus);
    });

    it('should check friend status successfully - none', async () => {
      const mockStatus = { status: 'none' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await checkFriendStatus('user123');

      expect(result).toEqual(mockStatus);
    });

    it('should throw error when checking friend status fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(checkFriendStatus('user123')).rejects.toThrow(
        'Failed to check friend status: 500 Server error'
      );
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details successfully', async () => {
      const mockUserDetails = {
        id: 'user123',
        name: 'John Doe',
        avatar: 'avatar.jpg',
        bio: 'Hiking enthusiast',
        trailCount: 15,
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserDetails,
      });

      const result = await getUserDetails('user123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/user123',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      expect(result).toEqual(mockUserDetails);
    });

    it('should throw error when getUserDetails fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'User not found',
      });

      await expect(getUserDetails('invalid-user')).rejects.toThrow(
        'Failed to fetch user details: 404 User not found'
      );
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
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover',
        expect.any(Object)
      );

      // Test sendFriendRequest endpoint
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await sendFriendRequest('user123');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/add',
        expect.any(Object)
      );

      // Test getIncomingRequests endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getIncomingRequests();
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/requests/incoming',
        expect.any(Object)
      );

      // Test respondToRequest endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
      await respondToRequest('req123', 'accept');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/requests/req123/respond',
        expect.any(Object)
      );

      // Test checkFriendStatus endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'none' }) });
      await checkFriendStatus('user123');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/status/user123',
        expect.any(Object)
      );

      // Test getUserDetails endpoint
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      await getUserDetails('user123');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/discover/user123',
        expect.any(Object)
      );
    });
  });
});
