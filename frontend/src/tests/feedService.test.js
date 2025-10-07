import { getAuth } from 'firebase/auth';
import {
  createFeed,
  fetchFeed,
  likeFeed,
  commentFeed,
  deleteCommentFeed,
  shareFeed,
  deleteFeed,
} from '../services/feed.js';
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

describe('Feed Service', () => {
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

  describe('createFeed', () => {
    const mockPostData = {
      action: 'completed',
      hike: 'Mount Washington',
      description: 'Amazing hike!',
      stats: { distance: '12.4 mi', elevation: '4,322 ft' },
      photo: 'https://example.com/photo.jpg',
    };

    const mockResponse = {
      id: 'feed123',
      ...mockPostData,
      createdAt: '2024-08-05T10:00:00Z',
    };

    it('creates a feed post successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await createFeed(mockPostData);

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(mockPostData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('includes authorization header with token', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await createFeed(mockPostData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('handles empty token gracefully', async () => {
      getAuth.mockReturnValue({ currentUser: null });
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await createFeed(mockPostData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: '',
          }),
        })
      );
    });

    it('throws error when creation fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad request'),
      });

      await expect(createFeed(mockPostData)).rejects.toThrow(
        'Failed to create feed: 400 Bad request'
      );
    });

    it('throws error on server error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal server error'),
      });

      await expect(createFeed(mockPostData)).rejects.toThrow(
        'Failed to create feed: 500 Internal server error'
      );
    });

    it('uses POST method', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await createFeed(mockPostData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('fetchFeed', () => {
    const mockFeedData = [
      {
        id: 'feed1',
        type: 'hike',
        user: 'John Doe',
        content: 'Completed Mount Washington',
      },
      {
        id: 'feed2',
        type: 'achievement',
        user: 'Jane Smith',
        content: 'Earned Summit Master badge',
      },
    ];

    it('fetches feed successfully with default pagination', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFeedData),
      });

      const result = await fetchFeed();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/feed?page=1&limit=10',
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        }
      );
      expect(result).toEqual(mockFeedData);
    });

    it('fetches feed with custom pagination', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFeedData),
      });

      await fetchFeed(2, 20);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/feed?page=2&limit=20',
        expect.any(Object)
      );
    });

    it('handles empty token', async () => {
      getAuth.mockReturnValue({ currentUser: null });
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFeedData),
      });

      await fetchFeed();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: '' },
        })
      );
    });

    it('handles 429 rate limit error specifically', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: jest.fn().mockResolvedValue('Rate limit exceeded'),
      });

      await expect(fetchFeed()).rejects.toThrow(
        'Failed to fetch feed: 429 Too many requests, please try again later.'
      );
    });

    it('throws error on fetch failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error'),
      });

      await expect(fetchFeed()).rejects.toThrow(
        'Failed to fetch feed: 500 Server error'
      );
    });

    it('returns empty array when no feed items', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await fetchFeed();

      expect(result).toEqual([]);
    });
  });

  describe('likeFeed', () => {
    const mockFeedId = 'feed123';
    const mockLikeResponse = {
      feedId: mockFeedId,
      likes: 10,
      userLiked: true,
    };

    it('likes a feed post successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLikeResponse),
      });

      const result = await likeFeed(mockFeedId, true);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/feed/${mockFeedId}/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ like: true }),
        }
      );
      expect(result).toEqual(mockLikeResponse);
    });

    it('unlikes a feed post successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ ...mockLikeResponse, userLiked: false }),
      });

      await likeFeed(mockFeedId, false);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ like: false }),
        })
      );
    });

    it('defaults to like when no parameter provided', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLikeResponse),
      });

      await likeFeed(mockFeedId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ like: true }),
        })
      );
    });

    it('throws error when like fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Feed not found'),
      });

      await expect(likeFeed(mockFeedId)).rejects.toThrow(
        'Failed to like feed: 404 Feed not found'
      );
    });
  });

  describe('commentFeed', () => {
    const mockFeedId = 'feed123';
    const mockContent = 'Great hike!';
    const mockCommentResponse = {
      id: 'comment123',
      feedId: mockFeedId,
      content: mockContent,
      user: 'John Doe',
      createdAt: '2024-08-05T10:00:00Z',
    };

    it('adds a comment successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCommentResponse),
      });

      const result = await commentFeed(mockFeedId, mockContent);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/feed/${mockFeedId}/comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ content: mockContent }),
        }
      );
      expect(result).toEqual(mockCommentResponse);
    });

    it('throws error for empty comment', async () => {
      await expect(commentFeed(mockFeedId, '')).rejects.toThrow(
        'Comment cannot be empty'
      );
    });

    it('throws error for whitespace-only comment', async () => {
      await expect(commentFeed(mockFeedId, '   ')).rejects.toThrow(
        'Comment cannot be empty'
      );
    });

    it('throws error for null comment', async () => {
      await expect(commentFeed(mockFeedId, null)).rejects.toThrow(
        'Comment cannot be empty'
      );
    });

    it('throws error for undefined comment', async () => {
      await expect(commentFeed(mockFeedId, undefined)).rejects.toThrow(
        'Comment cannot be empty'
      );
    });

    it('throws error when comment fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid comment'),
      });

      await expect(commentFeed(mockFeedId, mockContent)).rejects.toThrow(
        'Failed to add comment: 400 Invalid comment'
      );
    });

    it('does not call fetch for empty comment', async () => {
      await expect(commentFeed(mockFeedId, '')).rejects.toThrow();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('deleteCommentFeed', () => {
    const mockFeedId = 'feed123';
    const mockCommentId = 'comment456';
    const mockDeleteResponse = { success: true, message: 'Comment deleted' };

    it('deletes a comment successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      const result = await deleteCommentFeed(mockFeedId, mockCommentId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/feed/${mockFeedId}/comments/${mockCommentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockDeleteResponse);
    });

    it('uses DELETE method', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      await deleteCommentFeed(mockFeedId, mockCommentId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error when deletion fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(deleteCommentFeed(mockFeedId, mockCommentId)).rejects.toThrow(
        'Failed to delete comment: 403 Unauthorized'
      );
    });

    it('handles comment not found error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Comment not found'),
      });

      await expect(deleteCommentFeed(mockFeedId, mockCommentId)).rejects.toThrow(
        'Failed to delete comment: 404 Comment not found'
      );
    });
  });

  describe('shareFeed', () => {
    const mockFeedId = 'feed123';
    const mockPayload = {
      sharerId: 'user456',
      sharerName: 'Jane Doe',
      sharerAvatar: 'https://example.com/avatar.jpg',
      original: { id: mockFeedId, content: 'Original post' },
    };
    const mockShareResponse = {
      id: 'share789',
      type: 'share',
      ...mockPayload,
    };

    it('shares a feed post successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockShareResponse),
      });

      const result = await shareFeed(mockFeedId, mockPayload);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/feed/${mockFeedId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(mockPayload),
        }
      );
      expect(result).toEqual(mockShareResponse);
    });

    it('includes all payload data in request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockShareResponse),
      });

      await shareFeed(mockFeedId, mockPayload);

      const callArgs = fetch.mock.calls[0][1];
      expect(JSON.parse(callArgs.body)).toEqual(mockPayload);
    });

    it('throws error when share fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Cannot share this post'),
      });

      await expect(shareFeed(mockFeedId, mockPayload)).rejects.toThrow(
        'Failed to share feed: 400 Cannot share this post'
      );
    });

    it('handles duplicate share error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 409,
        text: jest.fn().mockResolvedValue('Already shared'),
      });

      await expect(shareFeed(mockFeedId, mockPayload)).rejects.toThrow(
        'Failed to share feed: 409 Already shared'
      );
    });
  });

  describe('deleteFeed', () => {
    const mockFeedId = 'feed123';
    const mockDeleteResponse = { success: true, message: 'Feed deleted' };

    it('deletes a feed post successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      const result = await deleteFeed(mockFeedId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.example.com/feed/${mockFeedId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockDeleteResponse);
    });

    it('uses DELETE method', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      await deleteFeed(mockFeedId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error when deletion fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Unauthorized to delete'),
      });

      await expect(deleteFeed(mockFeedId)).rejects.toThrow(
        'Failed to delete feed: 403 Unauthorized to delete'
      );
    });

    it('handles feed not found error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Feed not found'),
      });

      await expect(deleteFeed(mockFeedId)).rejects.toThrow(
        'Failed to delete feed: 404 Feed not found'
      );
    });
  });

  describe('Authentication scenarios', () => {
    it('handles expired token', async () => {
      mockUser.getIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(createFeed({})).rejects.toThrow('Token expired');
    });

    it('handles missing auth instance', async () => {
      getAuth.mockReturnValue(null);

      await expect(fetchFeed()).rejects.toThrow();
    });

    it('refreshes token for each request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await createFeed({});
      await fetchFeed();
      await likeFeed('feed1');

      expect(mockUser.getIdToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchFeed()).rejects.toThrow('Network error');
    });

    it('includes error status and text in error message', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal server error'),
      });

      await expect(createFeed({})).rejects.toThrow(
        'Failed to create feed: 500 Internal server error'
      );
    });
  });
});