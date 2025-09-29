// ES Module coverage test
import {
  parseDistance,
  parseElevation,
  parseDuration,
  validateHikeData,
  validateUserData,
  calculateHikeStats,
  calculateStreaks,
  generateMonthlyActivity,
  formatSuccessResponse,
  formatErrorResponse,
  processHikeData,
  processUserData,
  evaluateBadges
} from '../testable-functions.js';

describe('ES Module Coverage Tests', () => {
  
  describe('Data Parsing Functions', () => {
    test('parseDistance works correctly', () => {
      expect(parseDistance(5.5)).toBe(5.5);
      expect(parseDistance('10.2 km')).toBe(10.2);
      expect(parseDistance('15')).toBe(15);
      expect(parseDistance(null)).toBe(0);
      expect(parseDistance(undefined)).toBe(0);
      expect(parseDistance('')).toBe(0);
      expect(parseDistance('invalid')).toBe(0);
    });

    test('parseElevation works correctly', () => {
      expect(parseElevation(300)).toBe(300);
      expect(parseElevation('500m')).toBe(500);
      expect(parseElevation('-100')).toBe(-100);
      expect(parseElevation(null)).toBe(0);
      expect(parseElevation(undefined)).toBe(0);
      expect(parseElevation('')).toBe(0);
    });

    test('parseDuration works correctly', () => {
      expect(parseDuration(2.5)).toBe(2.5);
      expect(parseDuration('3.5 hours')).toBe(3.5);
      expect(parseDuration(null)).toBe(0);
      expect(parseDuration(undefined)).toBe(0);
      expect(parseDuration('')).toBe(0);
    });
  });

  describe('Validation Functions', () => {
    test('validateHikeData validates correctly', () => {
      const validHike = {
        title: 'Mountain Trail',
        location: 'Rocky Mountains'
      };
      
      const validation = validateHikeData(validHike);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const invalidHike = {
        title: '',
        location: ''
      };
      
      const invalidValidation = validateHikeData(invalidHike);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors.length).toBeGreaterThan(0);

      const nullValidation = validateHikeData(null);
      expect(nullValidation.isValid).toBe(false);
    });

    test('validateUserData validates correctly', () => {
      const validUser = {
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      const validation = validateUserData(validUser);
      expect(validation.isValid).toBe(true);

      const invalidUser = {
        email: 'invalid-email',
        displayName: ''
      };
      
      const invalidValidation = validateUserData(invalidUser);
      expect(invalidValidation.isValid).toBe(false);
    });
  });

  describe('Statistics Functions', () => {
    test('calculateHikeStats calculates correctly', () => {
      const hikes = [
        { distance: 5.5, elevation: 300, difficulty: 'Easy' },
        { distance: 10.2, elevation: 500, difficulty: 'Moderate' },
        { distance: 8.3, elevation: 200, difficulty: 'Easy' }
      ];

      const stats = calculateHikeStats(hikes);
      expect(stats.totalHikes).toBe(3);
      expect(stats.totalDistance).toBeCloseTo(24, 1);
      expect(stats.totalElevation).toBe(1000);
      expect(stats.byDifficulty.Easy).toBe(2);
      expect(stats.byDifficulty.Moderate).toBe(1);

      const emptyStats = calculateHikeStats([]);
      expect(emptyStats.totalHikes).toBe(0);

      const nullStats = calculateHikeStats(null);
      expect(nullStats.totalHikes).toBe(0);
    });

    test('calculateStreaks calculates correctly', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const hikes = [
        { date: today.toISOString() },
        { date: yesterday.toISOString() }
      ];

      const streaks = calculateStreaks(hikes);
      expect(streaks).toHaveProperty('currentStreak');
      expect(streaks).toHaveProperty('longestStreak');

      const emptyStreaks = calculateStreaks([]);
      expect(emptyStreaks.currentStreak).toBe(0);
    });

    test('generateMonthlyActivity generates correctly', () => {
      const hikes = [
        { date: '2024-01-15', distance: 5 },
        { date: '2024-01-20', distance: 8 },
        { date: '2024-02-10', distance: 12 }
      ];

      const monthly = generateMonthlyActivity(hikes);
      expect(Array.isArray(monthly)).toBe(true);

      const emptyMonthly = generateMonthlyActivity([]);
      expect(emptyMonthly).toEqual([]);
    });
  });

  describe('Response Formatting', () => {
    test('formatSuccessResponse formats correctly', () => {
      const data = { id: '123', name: 'Test' };
      
      const response = formatSuccessResponse(data, 'Data retrieved');
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Data retrieved');
      expect(response.timestamp).toBeDefined();
    });

    test('formatErrorResponse formats correctly', () => {
      const error = new Error('Test error');
      const errorResponse = formatErrorResponse(error, 400);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Test error');
      expect(errorResponse.statusCode).toBe(400);
    });
  });

  describe('Data Processing', () => {
    test('processHikeData processes correctly', () => {
      const rawData = {
        title: 'Test Hike',
        location: 'Test Location',
        distance: '12.5',
        elevation: '800'
      };

      const processed = processHikeData(rawData);
      expect(processed.title).toBe('Test Hike');
      expect(processed.distance).toBe(12.5);
      expect(processed.elevation).toBe(800);

      const nullProcessed = processHikeData(null);
      expect(nullProcessed).toHaveProperty('title', '');
    });

    test('processUserData processes correctly', () => {
      const rawData = {
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const processed = processUserData(rawData);
      expect(processed.email).toBe('test@example.com');
      expect(processed.displayName).toBe('Test User');

      const nullProcessed = processUserData(null);
      expect(nullProcessed).toHaveProperty('email', '');
    });
  });

  describe('Badge Evaluation', () => {
    test('evaluateBadges evaluates correctly', () => {
      const userStats = {
        totalHikes: 15,
        totalDistance: 150,
        totalElevation: 2500
      };
      
      const badges = evaluateBadges(userStats);
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);

      const nullBadges = evaluateBadges({ totalHikes: 0, totalDistance: 0 });
      expect(nullBadges).toEqual([]);
    });
  });

  describe('Integration Workflow', () => {
    test('complete workflow works', () => {
      const rawHikeData = {
        title: 'Integration Test',
        location: 'Test Location',
        distance: '12.5',
        elevation: '800'
      };

      // Validate
      const validation = validateHikeData(rawHikeData);
      expect(validation.isValid).toBe(true);

      // Process
      const processed = processHikeData(rawHikeData);
      expect(processed.distance).toBe(12.5);

      // Calculate stats
      const stats = calculateHikeStats([processed]);
      expect(stats.totalDistance).toBe(12.5);

      // Evaluate badges
      const badges = evaluateBadges(stats);
      expect(Array.isArray(badges)).toBe(true);

      // Format response
      const response = formatSuccessResponse(stats);
      expect(response.success).toBe(true);
    });
  });
});
