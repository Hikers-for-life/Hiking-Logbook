// Tests for statistics service
import { getUserStats } from '../services/statistics';
import { collection, getDocs } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn()
}));

jest.mock('../config/firebase.js', () => ({
  db: {}
}));

describe('statistics service Tests', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    test('should calculate total distance and elevation correctly', async () => {
      const mockHikes = [
        { distance: '10km', elevation: '500ft' },
        { distance: '15km', elevation: '800ft' },
        { distance: '5km', elevation: '200ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(30); // 10 + 15 + 5
      expect(result.totalElevation).toBe(1500); // 500 + 800 + 200
    });

    test('should handle hikes with missing distance', async () => {
      const mockHikes = [
        { distance: '10km', elevation: '500ft' },
        { elevation: '300ft' }, // No distance
        { distance: '5km', elevation: '100ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(15); // 10 + 0 + 5
      expect(result.totalElevation).toBe(900); // 500 + 300 + 100
    });

    test('should handle hikes with missing elevation', async () => {
      const mockHikes = [
        { distance: '10km', elevation: '500ft' },
        { distance: '8km' }, // No elevation
        { distance: '5km', elevation: '100ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(23); // 10 + 8 + 5
      expect(result.totalElevation).toBe(600); // 500 + 0 + 100
    });

    test('should handle empty hike collection', async () => {
      const mockSnapshot = {
        forEach: (callback) => {
          // No hikes
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(0);
      expect(result.totalElevation).toBe(0);
    });

    test('should handle hikes with all fields missing', async () => {
      const mockHikes = [
        {}, // No distance or elevation
        {}, // No distance or elevation
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(0);
      expect(result.totalElevation).toBe(0);
    });

    test('should parse distance correctly by removing last 2 characters', async () => {
      const mockHikes = [
        { distance: '12.5km', elevation: '0ft' },
        { distance: '7.8km', elevation: '0ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBeCloseTo(20.3, 1); // 12.5 + 7.8
    });

    test('should parse elevation correctly by removing last 2 characters', async () => {
      const mockHikes = [
        { distance: '0km', elevation: '125.5ft' },
        { distance: '0km', elevation: '274.5ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalElevation).toBe(400); // 125.5 + 274.5
    });

    test('should call Firebase with correct parameters', async () => {
      const mockSnapshot = {
        forEach: () => {}
      };

      const mockDb = {};
      const mockCollectionRef = 'mock-collection-ref';
      
      collection.mockReturnValue(mockCollectionRef);
      getDocs.mockResolvedValue(mockSnapshot);

      await getUserStats(mockUserId);

      expect(collection).toHaveBeenCalledWith(mockDb, 'users', mockUserId, 'hikes');
      expect(getDocs).toHaveBeenCalledWith(mockCollectionRef);
    });

    test('should handle single hike', async () => {
      const mockHikes = [
        { distance: '10km', elevation: '500ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(10);
      expect(result.totalElevation).toBe(500);
    });

    test('should handle large numbers', async () => {
      const mockHikes = [
        { distance: '1000km', elevation: '10000ft' },
        { distance: '2500km', elevation: '25000ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBe(3500);
      expect(result.totalElevation).toBe(35000);
    });

    test('should handle decimal values', async () => {
      const mockHikes = [
        { distance: '10.25km', elevation: '500.75ft' },
        { distance: '5.5km', elevation: '250.25ft' }
      ];

      const mockSnapshot = {
        forEach: (callback) => {
          mockHikes.forEach((hike) => {
            callback({
              data: () => hike
            });
          });
        }
      };

      collection.mockReturnValue('mock-collection-ref');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getUserStats(mockUserId);

      expect(result.totalDistance).toBeCloseTo(15.75, 2);
      expect(result.totalElevation).toBe(751);
    });
  });
});
