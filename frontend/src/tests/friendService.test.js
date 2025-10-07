// Tests for friendService
import { getFriendProfile } from '../services/friendService';

// Mock fetch
global.fetch = jest.fn();

describe('friendService Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getFriendProfile', () => {
    const mockUid = 'test-user-123';

    test('should fetch and return friend profile successfully', async () => {
      // Mock all three API calls
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              {
                id: 'hike-1',
                title: 'Mountain Trail',
                location: 'Rocky Mountains',
                distance: '10 miles',
                duration: '120 min',
                difficulty: 'Hard',
                createdAt: { _seconds: 1672531200 }
              },
              {
                id: 'hike-2',
                title: 'Forest Path',
                location: 'Pine Forest',
                distance: '5 miles',
                duration: '60 min',
                difficulty: 'Easy',
                createdAt: { _seconds: 1672444800 }
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            count: 15
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            totalDistance: 120,
            totalElevation: 5000
          })
        });

      const result = await getFriendProfile(mockUid, 2);

      expect(result.success).toBe(true);
      expect(result.totalHikes).toBe(15);
      expect(result.totalDistance).toBe(120);
      expect(result.totalElevation).toBe(5000);
      expect(result.recentHikes).toHaveLength(2);
      expect(result.recentHikes[0].title).toBe('Mountain Trail');
      
      // Verify API calls were made correctly
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenCalledWith(`http://localhost:3001/api/users/${mockUid}/hikes?limit=2`);
      expect(fetch).toHaveBeenCalledWith(`http://localhost:3001/api/users/${mockUid}/hikes/count`);
      expect(fetch).toHaveBeenCalledWith(`http://localhost:3001/api/users/${mockUid}/stats`);
    });

    test('should handle hikes with toDate() method', async () => {
      const mockDate = new Date('2023-01-01');
      
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              {
                id: 'hike-1',
                title: 'Test Hike',
                location: 'Test Location',
                createdAt: {
                  toDate: () => mockDate
                }
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 10, totalElevation: 100 })
        });

      const result = await getFriendProfile(mockUid, 1);

      expect(result.success).toBe(true);
      expect(result.recentHikes[0].createdAt).toEqual(mockDate);
    });

    test('should handle missing hike fields with defaults', async () => {
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              {
                id: 'hike-1',
                // Missing title, location, distance, etc.
                createdAt: new Date('2023-01-01')
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 0, totalElevation: 0 })
        });

      const result = await getFriendProfile(mockUid, 1);

      expect(result.success).toBe(true);
      expect(result.recentHikes[0].title).toBe('Untitled Hike');
      expect(result.recentHikes[0].location).toBe('Unknown Location');
      expect(result.recentHikes[0].distance).toBe('0 miles');
      expect(result.recentHikes[0].duration).toBe('0 min');
      expect(result.recentHikes[0].difficulty).toBe('Easy');
    });

    test('should return 0 values when API calls fail gracefully', async () => {
      fetch
        .mockResolvedValueOnce({
          json: async () => ({ success: false })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: false })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: false })
        });

      const result = await getFriendProfile(mockUid);

      expect(result.success).toBe(true);
      expect(result.totalHikes).toBe(0);
      expect(result.totalDistance).toBe(0);
      expect(result.totalElevation).toBe(0);
      expect(result.recentHikes).toEqual([]);
    });

    test('should handle fetch errors', async () => {
      const error = new Error('Network error');
      fetch.mockRejectedValue(error);

      const result = await getFriendProfile(mockUid);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should limit recent hikes to specified limit', async () => {
      const manyHikes = Array.from({ length: 10 }, (_, i) => ({
        id: `hike-${i}`,
        title: `Hike ${i}`,
        location: `Location ${i}`,
        distance: '5 miles',
        createdAt: { _seconds: 1672531200 - i * 86400 }
      }));

      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: manyHikes
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 10 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 50, totalElevation: 1000 })
        });

      const result = await getFriendProfile(mockUid, 3);

      expect(result.recentHikes).toHaveLength(3);
    });

    test('should sort hikes by createdAt in descending order', async () => {
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              {
                id: 'hike-1',
                title: 'Oldest',
                location: 'Location 1',
                distance: '5 miles',
                createdAt: '2023-01-01T00:00:00Z' // Oldest date
              },
              {
                id: 'hike-2',
                title: 'Newest',
                location: 'Location 2',
                distance: '10 miles',
                createdAt: '2023-01-03T00:00:00Z' // Newest date
              },
              {
                id: 'hike-3',
                title: 'Middle',
                location: 'Location 3',
                distance: '8 miles',
                createdAt: '2023-01-02T00:00:00Z' // Middle date
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 3 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 23, totalElevation: 500 })
        });

      const result = await getFriendProfile(mockUid, 3); // Request 3 hikes

      // Should be sorted by createdAt descending (newest first)
      expect(result.recentHikes).toHaveLength(3);
      expect(result.recentHikes[0].title).toBe('Newest');
      expect(result.recentHikes[1].title).toBe('Middle');
      expect(result.recentHikes[2].title).toBe('Oldest');
    });

    test('should use default limit of 2 when not specified', async () => {
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: []
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 0 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 0, totalElevation: 0 })
        });

      await getFriendProfile(mockUid);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:3001/api/users/${mockUid}/hikes?limit=2`);
    });

    test('should handle hikes without createdAt field', async () => {
      fetch
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              {
                id: 'hike-1',
                title: 'No Date Hike',
                location: 'Somewhere'
                // No createdAt field
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, totalDistance: 5, totalElevation: 100 })
        });

      const result = await getFriendProfile(mockUid);

      expect(result.success).toBe(true);
      expect(result.recentHikes[0].date).toBe('Unknown');
      expect(result.recentHikes[0].createdAt).toBeNull();
    });
  });
});
