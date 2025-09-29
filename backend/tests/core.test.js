// Core Backend Functionality Tests
// Tests business logic without external dependencies

describe('Core Backend Functions', () => {
  
  // Data parsing utilities
  const parseDistance = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/[^\d.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseElevation = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseDuration = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Validation functions
  const validateHikeData = (hikeData) => {
    const errors = [];
    
    if (!hikeData.title || hikeData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!hikeData.location || hikeData.location.trim() === '') {
      errors.push('Location is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Statistics calculation
  const calculateStats = (hikes) => {
    if (!hikes || hikes.length === 0) {
      return {
        totalHikes: 0,
        totalDistance: 0,
        totalElevation: 0,
        totalDuration: 0,
        byDifficulty: { Easy: 0, Moderate: 0, Hard: 0, Extreme: 0 },
        byStatus: { completed: 0, active: 0, paused: 0 }
      };
    }

    return {
      totalHikes: hikes.length,
      totalDistance: hikes.reduce((sum, hike) => sum + parseDistance(hike.distance), 0),
      totalElevation: hikes.reduce((sum, hike) => sum + parseElevation(hike.elevation), 0),
      totalDuration: hikes.reduce((sum, hike) => sum + parseDuration(hike.duration), 0),
      byDifficulty: hikes.reduce((acc, hike) => {
        if (hike.difficulty && acc[hike.difficulty] !== undefined) {
          acc[hike.difficulty]++;
        }
        return acc;
      }, { Easy: 0, Moderate: 0, Hard: 0, Extreme: 0 }),
      byStatus: hikes.reduce((acc, hike) => {
        if (hike.status && acc[hike.status] !== undefined) {
          acc[hike.status]++;
        }
        return acc;
      }, { completed: 0, active: 0, paused: 0 })
    };
  };

  describe('Data Parsing', () => {
    test('parseDistance should handle various inputs', () => {
      expect(parseDistance(5.5)).toBe(5.5);
      expect(parseDistance('10.2')).toBe(10.2);
      expect(parseDistance('5.5 km')).toBe(5.5);
      expect(parseDistance(null)).toBe(0);
      expect(parseDistance(undefined)).toBe(0);
      expect(parseDistance('invalid')).toBe(0);
    });

    test('parseElevation should handle various inputs', () => {
      expect(parseElevation(300)).toBe(300);
      expect(parseElevation('500')).toBe(500);
      expect(parseElevation('300m')).toBe(300);
      expect(parseElevation('-50')).toBe(-50);
      expect(parseElevation(null)).toBe(0);
      expect(parseElevation('invalid')).toBe(0);
    });

    test('parseDuration should handle various inputs', () => {
      expect(parseDuration(2.5)).toBe(2.5);
      expect(parseDuration('3.0')).toBe(3.0);
      expect(parseDuration('4')).toBe(4);
      expect(parseDuration(null)).toBe(0);
      expect(parseDuration('invalid')).toBe(0);
    });
  });

  describe('Data Validation', () => {
    test('validateHikeData should validate required fields', () => {
      const validHike = {
        title: 'Test Hike',
        location: 'Test Location'
      };
      
      const validation = validateHikeData(validHike);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('validateHikeData should catch missing title', () => {
      const invalidHike = {
        title: '',
        location: 'Test Location'
      };
      
      const validation = validateHikeData(invalidHike);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });

    test('validateHikeData should catch missing location', () => {
      const invalidHike = {
        title: 'Test Hike',
        location: ''
      };
      
      const validation = validateHikeData(invalidHike);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Location is required');
    });
  });

  describe('Statistics Calculation', () => {
    test('calculateStats should handle empty array', () => {
      const stats = calculateStats([]);
      
      expect(stats.totalHikes).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalElevation).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });

    test('calculateStats should calculate totals correctly', () => {
      const hikes = [
        {
          distance: 5.5,
          elevation: 300,
          duration: 2.5,
          difficulty: 'Easy',
          status: 'completed'
        },
        {
          distance: '10.2',
          elevation: '500',
          duration: '4.0',
          difficulty: 'Moderate',
          status: 'completed'
        }
      ];

      const stats = calculateStats(hikes);
      
      expect(stats.totalHikes).toBe(2);
      expect(stats.totalDistance).toBe(15.7);
      expect(stats.totalElevation).toBe(800);
      expect(stats.totalDuration).toBe(6.5);
      expect(stats.byDifficulty.Easy).toBe(1);
      expect(stats.byDifficulty.Moderate).toBe(1);
      expect(stats.byStatus.completed).toBe(2);
    });

    test('calculateStats should handle invalid data gracefully', () => {
      const hikes = [
        {
          distance: null,
          elevation: 'invalid',
          duration: undefined,
          difficulty: 'Unknown',
          status: 'invalid'
        }
      ];

      const stats = calculateStats(hikes);
      
      expect(stats.totalHikes).toBe(1);
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalElevation).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });
  });

  describe('Business Logic', () => {
    const processHikeData = (rawData) => {
      return {
        title: rawData.title || '',
        location: rawData.location || '',
        distance: parseDistance(rawData.distance),
        elevation: parseElevation(rawData.elevation),
        difficulty: rawData.difficulty || 'Easy',
        status: rawData.status || 'completed',
        createdAt: rawData.createdAt || new Date(),
        updatedAt: new Date()
      };
    };

    test('processHikeData should set defaults', () => {
      const rawData = {
        title: 'Test Hike',
        location: 'Test Location'
      };
      
      const processed = processHikeData(rawData);
      
      expect(processed.title).toBe('Test Hike');
      expect(processed.location).toBe('Test Location');
      expect(processed.distance).toBe(0);
      expect(processed.elevation).toBe(0);
      expect(processed.difficulty).toBe('Easy');
      expect(processed.status).toBe('completed');
      expect(processed.createdAt).toBeInstanceOf(Date);
      expect(processed.updatedAt).toBeInstanceOf(Date);
    });

    test('processHikeData should parse numeric strings', () => {
      const rawData = {
        title: 'Test Hike',
        location: 'Test Location',
        distance: '10.5 km',
        elevation: '500m'
      };
      
      const processed = processHikeData(rawData);
      
      expect(processed.distance).toBe(10.5);
      expect(processed.elevation).toBe(500);
    });
  });

  describe('Response Formatting', () => {
    const formatResponse = (success, data, message) => {
      return {
        success,
        data: data || null,
        message: message || (success ? 'Operation successful' : 'Operation failed'),
        timestamp: new Date().toISOString()
      };
    };

    test('formatResponse should create success response', () => {
      const data = { id: '123', name: 'Test' };
      const response = formatResponse(true, data, 'Data retrieved');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Data retrieved');
      expect(response.timestamp).toBeDefined();
    });

    test('formatResponse should create error response', () => {
      const response = formatResponse(false, null, 'Error occurred');
      
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Error occurred');
      expect(response.timestamp).toBeDefined();
    });

    test('formatResponse should use default messages', () => {
      const successResponse = formatResponse(true, {});
      expect(successResponse.message).toBe('Operation successful');
      
      const errorResponse = formatResponse(false);
      expect(errorResponse.message).toBe('Operation failed');
    });
  });

  describe('Integration Scenarios', () => {
    test('complete hike processing workflow', () => {
      // Raw input data
      const rawHike = {
        title: 'Mountain Trail',
        location: 'Rocky Mountains',
        distance: '12.5 km',
        elevation: '800m',
        difficulty: 'Moderate'
      };

      // Process the data
      const processHikeData = (rawData) => ({
        title: rawData.title || '',
        location: rawData.location || '',
        distance: parseDistance(rawData.distance),
        elevation: parseElevation(rawData.elevation),
        difficulty: rawData.difficulty || 'Easy',
        status: rawData.status || 'completed',
        createdAt: new Date()
      });

      const processed = processHikeData(rawHike);

      // Validate the processed data
      const validation = validateHikeData(processed);
      expect(validation.isValid).toBe(true);

      // Calculate stats for a collection including this hike
      const hikes = [processed];
      const stats = calculateStats(hikes);

      expect(stats.totalHikes).toBe(1);
      expect(stats.totalDistance).toBe(12.5);
      expect(stats.totalElevation).toBe(800);
      expect(stats.byDifficulty.Moderate).toBe(1);
      expect(stats.byStatus.completed).toBe(1);
    });

    test('error handling workflow', () => {
      // Invalid input data
      const invalidHike = {
        title: '',
        location: '',
        distance: 'invalid',
        elevation: 'invalid'
      };

      // Process the data (should handle gracefully)
      const processHikeData = (rawData) => ({
        title: rawData.title || '',
        location: rawData.location || '',
        distance: parseDistance(rawData.distance),
        elevation: parseElevation(rawData.elevation)
      });

      const processed = processHikeData(invalidHike);

      // Validate (should fail)
      const validation = validateHikeData(processed);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // Stats should still work with invalid data
      const stats = calculateStats([processed]);
      expect(stats.totalHikes).toBe(1);
      expect(stats.totalDistance).toBe(0); // Invalid distance becomes 0
      expect(stats.totalElevation).toBe(0); // Invalid elevation becomes 0
    });
  });
});
