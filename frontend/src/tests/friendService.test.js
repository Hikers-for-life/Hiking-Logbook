// services/__tests__/friendService.test.js
import { getFriendProfile } from '../services/friendService.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('friendService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getFriendProfile', () => {
    const mockUid = 'user123';

    it('should fetch and return complete friend profile data', async () => {
      // Mock responses
      const mockHikesResponse = {
        success: true,
        data: [
          {
            id: 'hike1',
            title: 'Mountain Trail',
            location: 'Rocky Mountains',
            distance: '5.2 miles',
            duration: '120 min',
            difficulty: 'Moderate',
            createdAt: { _seconds: 1704067200 } // Jan 1, 2024
          },
          {
            id: 'hike2',
            title: 'Forest Path',
            location: 'Pine Forest',
            distance: '3.1 miles',
            duration: '90 min',
            difficulty: 'Easy',
            createdAt: { _seconds: 1703980800 } // Dec 31, 2023
          }
        ]
      };

      const mockCountResponse = {
        success: true,
        count: 15
      };

      const mockStatsResponse = {
        success: true,
        totalDistance: 50.5,
        totalElevation: 2500
      };

      // Setup fetch mock to return different responses
      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCountResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockStatsResponse)
        });

      const result = await getFriendProfile(mockUid, 2);

      // Verify fetch was called with correct URLs
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/users/${mockUid}/hikes?limit=2`
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/users/${mockUid}/hikes/count`
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/users/${mockUid}/stats`
      );

      // Verify result structure
      expect(result.success).toBe(true);
      expect(result.totalHikes).toBe(15);
      expect(result.totalDistance).toBe(50.5);
      expect(result.totalElevation).toBe(2500);
      expect(result.recentHikes).toHaveLength(2);
      expect(result.recentHikes[0].title).toBe('Mountain Trail');
      expect(result.recentHikes[0].date).toBe('January 1st, 2024');
    });

    it('should handle hikes with toDate() method (Firestore Timestamp)', async () => {
      const mockDate = new Date('2024-06-15T10:30:00Z');
      const mockHikesResponse = {
        success: true,
        data: [
          {
            id: 'hike1',
            title: 'Lake Trail',
            location: 'Blue Lake',
            distance: '4 miles',
            duration: '100 min',
            difficulty: 'Easy',
            createdAt: {
              toDate: jest.fn().mockReturnValue(mockDate)
            }
          }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, totalDistance: 4, totalElevation: 100 })
        });

      const result = await getFriendProfile(mockUid);

      expect(result.recentHikes[0].date).toBe('June 15th, 2024');
      expect(mockHikesResponse.data[0].createdAt.toDate).toHaveBeenCalled();
    });

    it('should handle missing hike data with default values', async () => {
      const mockHikesResponse = {
        success: true,
        data: [
          {
            id: 'hike1',
            // Missing all optional fields
            createdAt: { _seconds: 1704067200 }
          }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, totalDistance: 0, totalElevation: 0 })
        });

      const result = await getFriendProfile(mockUid);

      expect(result.recentHikes[0].title).toBe('Untitled Hike');
      expect(result.recentHikes[0].location).toBe('Unknown Location');
      expect(result.recentHikes[0].distance).toBe('0 km');
      expect(result.recentHikes[0].duration).toBe('0 min');
      expect(result.recentHikes[0].difficulty).toBe('Easy');
    });

    it('should respect the limit parameter', async () => {
      const mockHikesResponse = {
        success: true,
        data: [
          { id: 'hike1', title: 'Hike 1', createdAt: { _seconds: 1704067200 } },
          { id: 'hike2', title: 'Hike 2', createdAt: { _seconds: 1703980800 } },
          { id: 'hike3', title: 'Hike 3', createdAt: { _seconds: 1703894400 } }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, count: 3 })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, totalDistance: 10, totalElevation: 500 })
        });

      const result = await getFriendProfile(mockUid, 1);

      expect(result.recentHikes).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/users/${mockUid}/hikes?limit=1`
      );
    });

    it('should handle API failures gracefully', async () => {
      const mockHikesResponse = { success: false };
      const mockCountResponse = { success: false };
      const mockStatsResponse = { success: false };

      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCountResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockStatsResponse)
        });

      const result = await getFriendProfile(mockUid);

      expect(result.success).toBe(true);
      expect(result.totalHikes).toBe(0);
      expect(result.totalDistance).toBe(0);
      expect(result.totalElevation).toBe(0);
      expect(result.recentHikes).toEqual([]);
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getFriendProfile(mockUid);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle missing createdAt field', async () => {
      const mockHikesResponse = {
        success: true,
        data: [
          {
            id: 'hike1',
            title: 'No Date Hike'
            // No createdAt field
          }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockHikesResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, totalDistance: 5, totalElevation: 200 })
        });

      const result = await getFriendProfile(mockUid);

      expect(result.recentHikes[0].date).toBe('Unknown');
      expect(result.recentHikes[0].createdAt).toBeNull();
    });

    it('should handle date ordinal suffixes correctly', async () => {
      const testCases = [
        { _seconds: new Date('2024-01-01').getTime() / 1000, expected: 'January 1st, 2024' },
        { _seconds: new Date('2024-01-02').getTime() / 1000, expected: 'January 2nd, 2024' },
        { _seconds: new Date('2024-01-03').getTime() / 1000, expected: 'January 3rd, 2024' },
        { _seconds: new Date('2024-01-04').getTime() / 1000, expected: 'January 4th, 2024' },
        { _seconds: new Date('2024-01-11').getTime() / 1000, expected: 'January 11th, 2024' },
        { _seconds: new Date('2024-01-21').getTime() / 1000, expected: 'January 21st, 2024' },
        { _seconds: new Date('2024-01-22').getTime() / 1000, expected: 'January 22nd, 2024' },
        { _seconds: new Date('2024-01-23').getTime() / 1000, expected: 'January 23rd, 2024' }
      ];

      for (const testCase of testCases) {
        global.fetch
          .mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue({
              success: true,
              data: [{ id: 'hike1', title: 'Test', createdAt: { _seconds: testCase._seconds } }]
            })
          })
          .mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue({ success: true, count: 1 })
          })
          .mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue({ success: true, totalDistance: 1, totalElevation: 1 })
          });

        const result = await getFriendProfile(mockUid);
        expect(result.recentHikes[0].date).toBe(testCase.expected);
        jest.clearAllMocks();
      }
    });

    it('should use default limit of 2 when not specified', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, count: 0 })
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ success: true, totalDistance: 0, totalElevation: 0 })
        });

      await getFriendProfile(mockUid);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/users/${mockUid}/hikes?limit=2`
      );
    });
  });
});