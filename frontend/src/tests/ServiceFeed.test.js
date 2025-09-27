import { getAuth } from "firebase/auth";
import { fetchFeed, likeFeed, commentFeed, deleteCommentFeed, shareFeed, deleteFeed } from '../services/feed.js';

// Mock Firebase auth and fetch
jest.mock("firebase/auth");
jest.mock('../api/api.js', () => ({
  API_BASE: 'http://localhost:3001/api'
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Feed Service', () => {
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
    it('should return token when user is logged in', async () => {
      const auth = getAuth();
      auth.currentUser = mockUser;

      // Since getToken is not exported, we test it through exported functions
      // We'll verify it works by checking the Authorization header in other tests
      expect(auth.currentUser).toBe(mockUser);
    });

    it('should return null when no user is logged in', async () => {
      const auth = getAuth();
      auth.currentUser = null;

      // Test through fetchFeed which uses getToken internally
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: [] })
      });

      await fetchFeed();
      
      // Verify fetch was called without Authorization header
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: ''
          })
        })
      );
    });
  });

  describe('fetchFeed', () => {
    it('should fetch feed successfully', async () => {
      const mockFeed = { activities: [{ id: 1, type: 'post' }] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeed
      });

      const result = await fetchFeed(2, 5);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed?page=2&limit=5',
        {
          headers: { Authorization: `Bearer ${mockToken}` }
        }
      );
      expect(result).toEqual(mockFeed);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      await expect(fetchFeed()).rejects.toThrow('Failed to fetch feed: 500 Internal Server Error');
    });

    it('should use default parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: [] })
      });

      await fetchFeed();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed?page=1&limit=10',
        expect.any(Object)
      );
    });
  });

  describe('likeFeed', () => {
    it('should like a feed item successfully', async () => {
      const mockResponse = { likes: 5, liked: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await likeFeed('feed123', true);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123/like',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ like: true })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should unlike a feed item successfully', async () => {
      const mockResponse = { likes: 4, liked: false };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await likeFeed('feed123', false);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123/like',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ like: false })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when like fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Feed not found'
      });

      await expect(likeFeed('invalid-id')).rejects.toThrow('Failed to like feed: 404 Feed not found');
    });
  });

  describe('commentFeed', () => {
    it('should add comment successfully', async () => {
      const mockComment = { id: 'comment1', content: 'Great post!' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment
      });

      const result = await commentFeed('feed123', 'Great post!');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123/comment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ content: 'Great post!' })
        }
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw error for empty comment', async () => {
      await expect(commentFeed('feed123', '   ')).rejects.toThrow('Comment cannot be empty');
      await expect(commentFeed('feed123', '')).rejects.toThrow('Comment cannot be empty');
      await expect(commentFeed('feed123', null)).rejects.toThrow('Comment cannot be empty');
    });

    it('should throw error when comment fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid content'
      });

      await expect(commentFeed('feed123', 'test')).rejects.toThrow('Failed to add comment: 400 Invalid content');
    });
  });

  describe('deleteCommentFeed', () => {
    it('should delete comment successfully', async () => {
      const mockResponse = { deleted: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deleteCommentFeed('feed123', 'comment456');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123/comments/comment456',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when delete fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Not authorized'
      });

      await expect(deleteCommentFeed('feed123', 'comment456')).rejects.toThrow('Failed to delete comment: 403 Not authorized');
    });
  });

  describe('shareFeed', () => {
    it('should share feed successfully', async () => {
      const mockSharePayload = {
        sharerId: 'user123',
        sharerName: 'John Doe',
        sharerAvatar: 'avatar.jpg',
        original: { id: 'original123' }
      };
      const mockResponse = { id: 'share123', ...mockSharePayload };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await shareFeed('feed123', mockSharePayload);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123/share',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify(mockSharePayload)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when share fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Share failed'
      });

      await expect(shareFeed('feed123', {})).rejects.toThrow('Failed to share feed: 500 Share failed');
    });
  });

  describe('deleteFeed', () => {
    it('should delete feed successfully', async () => {
      const mockResponse = { deleted: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deleteFeed('feed123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/feed/feed123',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when delete fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Feed not found'
      });

      await expect(deleteFeed('invalid-id')).rejects.toThrow('Failed to delete feed: 404 Feed not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchFeed()).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(fetchFeed()).rejects.toThrow('Invalid JSON');
    });
  });
});