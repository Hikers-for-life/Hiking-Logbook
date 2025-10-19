import {
  formatTimeAgo,
  formatAbsoluteTime,
  formatTime,
} from '../utils/timeUtils';

// Mock Date.now() for consistent testing
const MOCK_NOW = new Date('2024-01-15T12:00:00Z');

describe('timeUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatTimeAgo', () => {
    test('should return "Unknown time" for null/undefined input', () => {
      expect(formatTimeAgo(null)).toBe('Unknown time');
      expect(formatTimeAgo(undefined)).toBe('Unknown time');
      expect(formatTimeAgo('')).toBe('Unknown time');
    });

    test('should return "Invalid time" for invalid timestamps', () => {
      expect(formatTimeAgo('not-a-date')).toBe('Invalid time');
      expect(formatTimeAgo('invalid')).toBe('Invalid time');
    });

    test('should return "Just now" for times less than 60 seconds ago', () => {
      const thirtySecondsAgo = new Date(MOCK_NOW.getTime() - 30 * 1000);
      expect(formatTimeAgo(thirtySecondsAgo)).toBe('Just now');

      const fiftyNineSecondsAgo = new Date(MOCK_NOW.getTime() - 59 * 1000);
      expect(formatTimeAgo(fiftyNineSecondsAgo)).toBe('Just now');

      const oneSecondAgo = new Date(MOCK_NOW.getTime() - 1000);
      expect(formatTimeAgo(oneSecondAgo)).toBe('Just now');
    });

    test('should format minutes correctly', () => {
      const oneMinuteAgo = new Date(MOCK_NOW.getTime() - 60 * 1000);
      expect(formatTimeAgo(oneMinuteAgo)).toBe('1 minute ago');

      const twoMinutesAgo = new Date(MOCK_NOW.getTime() - 2 * 60 * 1000);
      expect(formatTimeAgo(twoMinutesAgo)).toBe('2 minutes ago');

      const thirtyMinutesAgo = new Date(MOCK_NOW.getTime() - 30 * 60 * 1000);
      expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30 minutes ago');

      const fiftyNineMinutesAgo = new Date(MOCK_NOW.getTime() - 59 * 60 * 1000);
      expect(formatTimeAgo(fiftyNineMinutesAgo)).toBe('59 minutes ago');
    });

    test('should format hours correctly', () => {
      const oneHourAgo = new Date(MOCK_NOW.getTime() - 60 * 60 * 1000);
      expect(formatTimeAgo(oneHourAgo)).toBe('1 hour ago');

      const twoHoursAgo = new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');

      const twentyThreeHoursAgo = new Date(
        MOCK_NOW.getTime() - 23 * 60 * 60 * 1000
      );
      expect(formatTimeAgo(twentyThreeHoursAgo)).toBe('23 hours ago');
    });

    test('should format days correctly', () => {
      const oneDayAgo = new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(oneDayAgo)).toBe('1 day ago');

      const twoDaysAgo = new Date(MOCK_NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoDaysAgo)).toBe('2 days ago');

      const sixDaysAgo = new Date(MOCK_NOW.getTime() - 6 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(sixDaysAgo)).toBe('6 days ago');
    });

    test('should format weeks correctly', () => {
      const oneWeekAgo = new Date(MOCK_NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(oneWeekAgo)).toBe('1 week ago');

      const twoWeeksAgo = new Date(
        MOCK_NOW.getTime() - 14 * 24 * 60 * 60 * 1000
      );
      expect(formatTimeAgo(twoWeeksAgo)).toBe('2 weeks ago');

      const fourWeeksAgo = new Date(
        MOCK_NOW.getTime() - 28 * 24 * 60 * 60 * 1000
      );
      expect(formatTimeAgo(fourWeeksAgo)).toBe('4 weeks ago');
    });

    test('should accept Date objects', () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 60 * 1000);
      expect(formatTimeAgo(date)).toBe('5 minutes ago');
    });

    test('should accept ISO string timestamps', () => {
      const isoString = new Date(
        MOCK_NOW.getTime() - 2 * 60 * 60 * 1000
      ).toISOString();
      expect(formatTimeAgo(isoString)).toBe('2 hours ago');
    });
  });

  describe('formatAbsoluteTime', () => {
    test('should return "Unknown time" for null/undefined input', () => {
      expect(formatAbsoluteTime(null)).toBe('Unknown time');
      expect(formatAbsoluteTime(undefined)).toBe('Unknown time');
      expect(formatAbsoluteTime('')).toBe('Unknown time');
    });

    test('should return "Invalid time" for invalid timestamps', () => {
      expect(formatAbsoluteTime('not-a-date')).toBe('Invalid time');
      expect(formatAbsoluteTime('invalid')).toBe('Invalid time');
    });

    test('should format valid timestamps in absolute format', () => {
      const testDate = new Date('2023-12-15T14:30:00Z');
      const formatted = formatAbsoluteTime(testDate);

      // The exact format depends on locale, but should contain these elements
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2023');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Time like "2:30" or "14:30"
    });

    test('should accept Date objects', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const formatted = formatAbsoluteTime(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('1');
      expect(formatted).toContain('2023');
    });

    test('should accept ISO string timestamps', () => {
      const isoString = '2023-06-15T18:45:00Z';
      const formatted = formatAbsoluteTime(isoString);

      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2023');
    });
  });

  describe('formatTime', () => {
    test('should return "Unknown time" for null/undefined input', () => {
      expect(formatTime(null)).toBe('Unknown time');
      expect(formatTime(undefined)).toBe('Unknown time');
      expect(formatTime('')).toBe('Unknown time');
    });

    test('should return "Invalid time" for invalid timestamps', () => {
      expect(formatTime('not-a-date')).toBe('Invalid time');
      expect(formatTime('invalid')).toBe('Invalid time');
    });

    test('should format valid timestamps showing only time', () => {
      const testDate = new Date('2023-12-15T14:30:00Z');
      const formatted = formatTime(testDate);

      // Should contain time but NOT date
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Time like "2:30"
      expect(formatted).not.toContain('Dec');
      expect(formatted).not.toContain('2023');
    });

    test('should accept Date objects', () => {
      const date = new Date('2023-01-01T09:15:00Z');
      const formatted = formatTime(date);

      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    test('should accept ISO string timestamps', () => {
      const isoString = '2023-06-15T18:45:00Z';
      const formatted = formatTime(isoString);

      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    test('should include AM/PM indicator', () => {
      const morningDate = new Date('2023-01-01T08:00:00Z');
      const morningFormatted = formatTime(morningDate);
      expect(morningFormatted).toMatch(/AM|PM/);

      const eveningDate = new Date('2023-01-01T20:00:00Z');
      const eveningFormatted = formatTime(eveningDate);
      expect(eveningFormatted).toMatch(/AM|PM/);
    });
  });
});
