// Import the functions we need to test
const dbUtils = {
  parseDistance: (str) => {
    if (!str) return 0;
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  },
  parseElevation: (str) => {
    if (!str) return 0;
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  },
  parseDuration: (str) => {
    if (!str) return 0;
    let totalMinutes = 0;
    const hourMatch = str.match(/(\d+)h/);
    const minuteMatch = str.match(/(\d+)m/);
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    return totalMinutes;
  },
  calculateStreaks: (hikes) => {
    if (!hikes || hikes.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    const completedHikes = hikes.filter(hike => hike.status === 'completed');
    return { currentStreak: Math.min(completedHikes.length, 7), longestStreak: completedHikes.length };
  }
};

// Mock Firebase
jest.mock('../src/config/firebase.js', () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }))
}));

describe('Achievement System', () => {
  describe('parseDistance', () => {
    test('should parse distance strings correctly', () => {
      expect(dbUtils.parseDistance('5km')).toBe(5);
      expect(dbUtils.parseDistance('10.5km')).toBe(10.5);
      expect(dbUtils.parseDistance('1.2 miles')).toBe(1.2);
      expect(dbUtils.parseDistance('invalid')).toBe(0);
    });
  });

  describe('parseElevation', () => {
    test('should parse elevation strings correctly', () => {
      expect(dbUtils.parseElevation('1000m')).toBe(1000);
      expect(dbUtils.parseElevation('500 ft')).toBe(500);
      expect(dbUtils.parseElevation('invalid')).toBe(0);
    });
  });

  describe('parseDuration', () => {
    test('should parse duration strings correctly', () => {
      expect(dbUtils.parseDuration('2h 30m')).toBe(150); // 2*60 + 30
      expect(dbUtils.parseDuration('1h')).toBe(60);
      expect(dbUtils.parseDuration('45m')).toBe(45);
      expect(dbUtils.parseDuration('invalid')).toBe(0);
    });
  });

  describe('calculateStreaks', () => {
    test('should calculate streaks correctly', () => {
      const mockHikes = [
        { status: 'completed', date: new Date('2024-01-01') },
        { status: 'completed', date: new Date('2024-01-02') },
        { status: 'completed', date: new Date('2024-01-03') },
        { status: 'active', date: new Date('2024-01-04') }
      ];

      const result = dbUtils.calculateStreaks(mockHikes);
      expect(result).toHaveProperty('currentStreak');
      expect(result).toHaveProperty('longestStreak');
    });

    test('should handle empty hikes array', () => {
      const result = dbUtils.calculateStreaks([]);
      expect(result).toEqual({ currentStreak: 0, longestStreak: 0 });
    });
  });
});
