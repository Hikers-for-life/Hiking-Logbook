// Simple CommonJS test for coverage
const functions = require('../testable-functions.js');

describe('Simple Coverage Tests', () => {
  test('functions are available', () => {
    expect(functions).toBeDefined();
    expect(typeof functions.parseDistance).toBe('function');
    expect(typeof functions.parseElevation).toBe('function');
    expect(typeof functions.validateHikeData).toBe('function');
    expect(typeof functions.calculateHikeStats).toBe('function');
  });

  test('parseDistance works', () => {
    expect(functions.parseDistance(5.5)).toBe(5.5);
    expect(functions.parseDistance('10.2')).toBe(10.2);
    expect(functions.parseDistance(null)).toBe(0);
    expect(functions.parseDistance(undefined)).toBe(0);
  });

  test('parseElevation works', () => {
    expect(functions.parseElevation(300)).toBe(300);
    expect(functions.parseElevation('500')).toBe(500);
    expect(functions.parseElevation(null)).toBe(0);
  });

  test('validateHikeData works', () => {
    const validHike = {
      title: 'Test Hike',
      location: 'Test Location',
    };

    const validation = functions.validateHikeData(validHike);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('calculateHikeStats works', () => {
    const hikes = [
      { distance: 5, elevation: 300, difficulty: 'Easy' },
      { distance: 10, elevation: 500, difficulty: 'Moderate' },
    ];

    const stats = functions.calculateHikeStats(hikes);
    expect(stats.totalHikes).toBe(2);
    expect(stats.totalDistance).toBe(15);
    expect(stats.totalElevation).toBe(800);
  });

  test('formatSuccessResponse works', () => {
    const data = { test: 'data' };
    const response = functions.formatSuccessResponse(data, 'Test message');

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.message).toBe('Test message');
  });

  test('all functions execute without errors', () => {
    expect(() => functions.parseDistance('5.5')).not.toThrow();
    expect(() => functions.parseElevation('300')).not.toThrow();
    expect(() => functions.parseDuration('2.5')).not.toThrow();
    expect(() =>
      functions.validateHikeData({ title: 'Test', location: 'Test' })
    ).not.toThrow();
    expect(() =>
      functions.validateUserData({
        email: 'test@test.com',
        displayName: 'Test',
      })
    ).not.toThrow();
    expect(() =>
      functions.calculateHikeStats([{ distance: 5, elevation: 100 }])
    ).not.toThrow();
    expect(() =>
      functions.calculateStreaks([{ date: new Date().toISOString() }])
    ).not.toThrow();
    expect(() =>
      functions.generateMonthlyActivity([{ date: '2024-01-01', distance: 5 }])
    ).not.toThrow();
    expect(() => functions.formatSuccessResponse({ test: true })).not.toThrow();
    expect(() =>
      functions.formatErrorResponse(new Error('test'))
    ).not.toThrow();
    expect(() => functions.processHikeData({ title: 'Test' })).not.toThrow();
    expect(() =>
      functions.processUserData({ email: 'test@test.com' })
    ).not.toThrow();
    expect(() =>
      functions.evaluateBadges({ totalHikes: 1, totalDistance: 10 })
    ).not.toThrow();
  });
});
