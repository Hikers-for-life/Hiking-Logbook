import { getAuth } from 'firebase/auth';
import { discoverFriends, addFriend, getUserDetails } from '../services/discover.js';
import { API_BASE } from '../api/api.js';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock API_BASE
jest.mock('../api/api.js', () => ({
  API_BASE: 'https://api.example.com',
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Discover Service', () => {
  const mockToken = 'mock-firebase-token-123';
  let mockUser;
  let mockAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mocks for each test
    mockUser = {
      getIdToken: jest.fn().mockResolvedValue(mockToken),
    };
    
    mockAuth = {
      currentUser: mockUser,
    };
    
    getAuth.mockReturnValue(mockAuth);
    fetch.mockClear();
  });

  describe('getToken helper', () => {
    it('returns token when user is authenticated', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      
      await discoverFriends();
      expect(mockUser.getIdToken).toHaveBeenCalled();
    });

    it('returns null when user is not authenticated', async () => {
      getAuth.mockReturnValue({ currentUser: null });
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(discoverFriends()).rejects.toThrow();
    });
  });

  describe('discoverFriends', () => {
    const mockFriendsData = [
      {
        id: 'user1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
        mutualFriends: 5,
        commonTrails: 3,
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        avatar: 'https://example.com/avatar2.jpg',
        mutualFriends: 2,
        commonTrails: 1,
      },
    ];

    it('fetches friend suggestions successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFriendsData),
      });

      const result = await discoverFriends();

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/discover', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockFriendsData);
    });

    it('includes authorization header with token', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFriendsData),
      });

      await discoverFriends();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
    });

    it('throws error when fetch fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(discoverFriends()).rejects.toThrow(
        'Failed to fetch suggestions'
      );
    });

    it('throws error when network request fails', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(discoverFriends()).rejects.toThrow('Network error');
    });

    it('returns empty array when no suggestions available', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await discoverFriends();

      expect(result).toEqual([]);
    });

    it('handles 401 unauthorized error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(discoverFriends()).rejects.toThrow(
        'Failed to fetch suggestions'
      );
    });
  });

  describe('addFriend', () => {
    const mockFriendId = 'friend123';
    const mockSuccessResponse = { success: true };

    it('adds a friend successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      });

      const result = await addFriend(mockFriendId);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/discover/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ friendId: mockFriendId }),
        }
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('sends correct request body', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      });

      await addFriend(mockFriendId);

      const callArgs = fetch.mock.calls[0][1];
      expect(JSON.parse(callArgs.body)).toEqual({ friendId: mockFriendId });
    });

    it('includes authorization and content-type headers', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      });

      await addFriend(mockFriendId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('throws error when add friend fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(addFriend(mockFriendId)).rejects.toThrow(
        'Failed to add friend'
      );
    });

    it('handles duplicate friend request error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 409,
      });

      await expect(addFriend(mockFriendId)).rejects.toThrow(
        'Failed to add friend'
      );
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network connection failed'));

      await expect(addFriend(mockFriendId)).rejects.toThrow(
        'Network connection failed'
      );
    });

    it('uses POST method', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      });

      await addFriend(mockFriendId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('getUserDetails', () => {
    const mockUserId = 'user456';
    const mockUserDetails = {
      id: 'user456',
      name: 'Bob Wilson',
      avatar: 'https://example.com/avatar3.jpg',
      bio: 'Hiking enthusiast',
      totalHikes: 42,
      friends: 15,
      achievements: ['Summit Master', 'Trail Blazer'],
    };

    it('fetches user details successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserDetails),
      });

      const result = await getUserDetails(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/discover/${mockUserId}`,
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        }
      );
      expect(result).toEqual(mockUserDetails);
    });

    it('includes authorization header', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserDetails),
      });

      await getUserDetails(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
    });

    it('constructs correct URL with userId', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserDetails),
      });

      await getUserDetails(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/discover/${mockUserId}`,
        expect.any(Object)
      );
    });

    it('throws error when fetch fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getUserDetails(mockUserId)).rejects.toThrow(
        'Failed to fetch user details'
      );
    });

    it('handles user not found error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getUserDetails(mockUserId)).rejects.toThrow(
        'Failed to fetch user details'
      );
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Connection timeout'));

      await expect(getUserDetails(mockUserId)).rejects.toThrow(
        'Connection timeout'
      );
    });

    it('handles different user IDs', async () => {
      const differentUserId = 'user789';
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ ...mockUserDetails, id: differentUserId }),
      });

      await getUserDetails(differentUserId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/discover/${differentUserId}`,
        expect.any(Object)
      );
    });
  });

  describe('Authentication scenarios', () => {
    it('handles expired token gracefully', async () => {
      mockUser.getIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(discoverFriends()).rejects.toThrow('Token expired');
    });

    it('handles missing auth instance', async () => {
      getAuth.mockReturnValue(null);

      await expect(discoverFriends()).rejects.toThrow();
    });

    it('refreshes token for each request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await discoverFriends();
      await addFriend('friend1');
      await getUserDetails('user1');

      expect(mockUser.getIdToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('API endpoint construction', () => {
    it('uses correct base URL for all endpoints', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await discoverFriends();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com/discover'),
        expect.any(Object)
      );

      await addFriend('friend1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com/discover/add'),
        expect.any(Object)
      );

      await getUserDetails('user1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com/discover/user1'),
        expect.any(Object)
      );
    });
  });
});