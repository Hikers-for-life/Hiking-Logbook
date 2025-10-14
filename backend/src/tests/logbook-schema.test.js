// Tests for logbookSchema.js - Schema validation and type checking
const { hikeSchema, waypointSchema, locationSchema, validateHikeData, validateWaypoint, validateLocation } = require('../models/logbookSchema.js');

describe('Logbook Schema Tests', () => {
  describe('hikeSchema structure', () => {
    test('should have all required fields defined', () => {
      expect(hikeSchema).toBeDefined();
      expect(typeof hikeSchema).toBe('object');
      
      // Basic information
      expect(hikeSchema.title).toBe('string');
      expect(hikeSchema.location).toBe('string');
      expect(hikeSchema.route).toBe('string');
      
      // Timing and dates
      expect(hikeSchema.date).toBe('timestamp');
      expect(hikeSchema.startTime).toBe('timestamp');
      expect(hikeSchema.endTime).toBe('timestamp');
      expect(hikeSchema.duration).toBe('number');
      
      // Physical metrics
      expect(hikeSchema.distance).toBe('number');
      expect(hikeSchema.elevation).toBe('number');
      expect(hikeSchema.difficulty).toBe('string');
      
      // Environmental conditions
      expect(hikeSchema.weather).toBe('string');
      
      // Additional details
      expect(hikeSchema.notes).toBe('string');
      
      // GPS and tracking data
      expect(hikeSchema.waypoints).toBe('array');
      expect(hikeSchema.startLocation).toBe('object');
      expect(hikeSchema.endLocation).toBe('object');
      
      // Route tracking
      expect(hikeSchema.routeMap).toBe('string');
      expect(hikeSchema.gpsTrack).toBe('array');
      
      // Metadata
      expect(hikeSchema.createdAt).toBe('timestamp');
      expect(hikeSchema.updatedAt).toBe('timestamp');
      expect(hikeSchema.userId).toBe('string');
      expect(hikeSchema.status).toBe('string');
      
      // New fields
      expect(hikeSchema.pinned).toBe('boolean');
      expect(hikeSchema.shared).toBe('boolean');
    });

    test('should have correct field count', () => {
      const fieldCount = Object.keys(hikeSchema).length;
      expect(fieldCount).toBe(23); // Total number of fields in schema (updated count)
    });

    test('should contain only valid data types', () => {
      const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'timestamp'];
      const schemaTypes = Object.values(hikeSchema);
      
      schemaTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('waypointSchema structure', () => {
    test('should have all required waypoint fields', () => {
      expect(waypointSchema).toBeDefined();
      expect(typeof waypointSchema).toBe('object');
      
      expect(waypointSchema.latitude).toBe('number');
      expect(waypointSchema.longitude).toBe('number');
      expect(waypointSchema.elevation).toBe('number'); // It's 'elevation' not 'altitude'
      expect(waypointSchema.timestamp).toBe('timestamp');
      expect(waypointSchema.description).toBe('string');
      expect(waypointSchema.type).toBe('string');
    });

    test('should have correct waypoint field count', () => {
      const fieldCount = Object.keys(waypointSchema).length;
      expect(fieldCount).toBe(6); // latitude, longitude, elevation, timestamp, description, type
    });
  });

  describe('locationSchema structure', () => {
    test('should have all required location fields', () => {
      expect(locationSchema).toBeDefined();
      expect(typeof locationSchema).toBe('object');
      
      expect(locationSchema.latitude).toBe('number');
      expect(locationSchema.longitude).toBe('number');
      expect(locationSchema.elevation).toBe('number'); // It's 'elevation' not 'altitude'
      expect(locationSchema.accuracy).toBe('number');
      expect(locationSchema.timestamp).toBe('timestamp');
    });

    test('should have correct location field count', () => {
      const fieldCount = Object.keys(locationSchema).length;
      expect(fieldCount).toBe(5);
    });
  });

  describe('validateHikeData function', () => {
    test('should validate complete valid hike data', () => {
      const validHike = {
        title: 'Mountain Trail Hike',
        location: 'Rocky Mountain National Park',
        route: 'Bear Lake Trail',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        duration: 3.5,
        distance: 8.2,
        elevation: 500,
        difficulty: 'Moderate',
        weather: 'Sunny',
        notes: 'Beautiful views',
        waypoints: [],
        startLocation: { latitude: 40.3428, longitude: -105.6836 },
        endLocation: { latitude: 40.3428, longitude: -105.6836 },
        routeMap: 'map-data-string',
        gpsTrack: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123',
        status: 'completed',
        pinned: false,
        shared: true
      };

      const result = validateHikeData(validHike);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate minimal hike data', () => {
      const minimalHike = {
        title: 'Quick Hike',
        location: 'Local Park'
      };

      const result = validateHikeData(minimalHike);
      expect(result.valid).toBe(true);
    });

    test('should reject hike data with wrong types', () => {
      const invalidHike = {
        title: 123, // should be string
        distance: 'not-a-number', // should be number
        pinned: 'yes' // should be boolean
      };

      const result = validateHikeData(invalidHike);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle null and undefined data', () => {
      expect(validateHikeData(null).valid).toBe(false);
      expect(validateHikeData(undefined).valid).toBe(false);
      expect(validateHikeData({}).valid).toBe(true); // Empty object should be valid
    });

    test('should validate difficulty values', () => {
      const validDifficulties = ['Easy', 'Moderate', 'Hard'];
      
      validDifficulties.forEach(difficulty => {
        const hike = { title: 'Test', difficulty };
        const result = validateHikeData(hike);
        expect(result.valid).toBe(true);
      });

      // Invalid difficulty (Extreme is actually valid in difficultyLevels)
      const invalidHike = { title: 'Test', difficulty: 'VeryHard' };
      const result = validateHikeData(invalidHike);
      expect(result.valid).toBe(false);
    });

    test('should validate status values', () => {
      const validStatuses = ['active', 'completed', 'paused'];
      
      validStatuses.forEach(status => {
        const hike = { title: 'Test', status };
        const result = validateHikeData(hike);
        expect(result.valid).toBe(true);
      });

      // Invalid status
      const invalidHike = { title: 'Test', status: 'cancelled' };
      const result = validateHikeData(invalidHike);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateWaypoint function', () => {
    test('should validate complete valid waypoint', () => {
      const validWaypoint = {
        latitude: 40.3428,
        longitude: -105.6836,
        elevation: 2500,
        timestamp: new Date(),
        description: 'Peak of the mountain',
        type: 'milestone'
      };

      const result = validateWaypoint(validWaypoint);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate minimal waypoint', () => {
      const minimalWaypoint = {
        latitude: 40.3428,
        longitude: -105.6836
      };

      const result = validateWaypoint(minimalWaypoint);
      expect(result.valid).toBe(true);
    });

    test('should reject waypoint with invalid coordinates', () => {
      const invalidWaypoint = {
        latitude: 'not-a-number',
        longitude: 200 // longitude should be -180 to 180
      };

      const result = validateWaypoint(invalidWaypoint);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate coordinate ranges', () => {
      // Valid coordinates
      expect(validateWaypoint({ latitude: 0, longitude: 0 }).valid).toBe(true);
      expect(validateWaypoint({ latitude: 90, longitude: 180 }).valid).toBe(true);
      expect(validateWaypoint({ latitude: -90, longitude: -180 }).valid).toBe(true);

      // Invalid coordinates
      expect(validateWaypoint({ latitude: 91, longitude: 0 }).valid).toBe(false);
      expect(validateWaypoint({ latitude: 0, longitude: 181 }).valid).toBe(false);
      expect(validateWaypoint({ latitude: -91, longitude: 0 }).valid).toBe(false);
      expect(validateWaypoint({ latitude: 0, longitude: -181 }).valid).toBe(false);
    });

    test('should handle null and undefined waypoint data', () => {
      expect(validateWaypoint(null).valid).toBe(false);
      expect(validateWaypoint(undefined).valid).toBe(false);
      expect(validateWaypoint({}).valid).toBe(false); // Empty waypoint should be invalid (needs coords)
    });
  });

  describe('validateLocation function', () => {
    test('should validate complete valid location', () => {
      const validLocation = {
        latitude: 40.3428,
        longitude: -105.6836,
        elevation: 2500,
        accuracy: 5.0,
        timestamp: new Date()
      };

      const result = validateLocation(validLocation);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate minimal location', () => {
      const minimalLocation = {
        latitude: 40.3428,
        longitude: -105.6836
      };

      const result = validateLocation(minimalLocation);
      expect(result.valid).toBe(true);
    });

    test('should reject location with invalid data', () => {
      const invalidLocation = {
        latitude: 'invalid',
        longitude: 200,
        accuracy: -1 // accuracy should be positive
      };

      const result = validateLocation(invalidLocation);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate accuracy values', () => {
      // Valid accuracy
      expect(validateLocation({ latitude: 0, longitude: 0, accuracy: 0 }).valid).toBe(true);
      expect(validateLocation({ latitude: 0, longitude: 0, accuracy: 100 }).valid).toBe(true);

      // Invalid accuracy
      expect(validateLocation({ latitude: 0, longitude: 0, accuracy: -1 }).valid).toBe(false);
    });
  });

  describe('Schema consistency and relationships', () => {
    test('should have consistent coordinate fields across schemas', () => {
      expect(waypointSchema.latitude).toBe(locationSchema.latitude);
      expect(waypointSchema.longitude).toBe(locationSchema.longitude);
      expect(waypointSchema.elevation).toBe(locationSchema.elevation);
      expect(waypointSchema.timestamp).toBe(locationSchema.timestamp);
    });

    test('should have consistent data types for similar fields', () => {
      // All coordinate fields should be numbers
      expect(waypointSchema.latitude).toBe('number');
      expect(waypointSchema.longitude).toBe('number');
      expect(waypointSchema.elevation).toBe('number');
      expect(locationSchema.latitude).toBe('number');
      expect(locationSchema.longitude).toBe('number');
      expect(locationSchema.elevation).toBe('number');

      // All timestamp fields should be timestamps
      expect(hikeSchema.createdAt).toBe('timestamp');
      expect(hikeSchema.updatedAt).toBe('timestamp');
      expect(waypointSchema.timestamp).toBe('timestamp');
      expect(locationSchema.timestamp).toBe('timestamp');
    });

    test('should have logical field relationships', () => {
      // Hike should contain waypoints and locations as objects/arrays
      expect(hikeSchema.waypoints).toBe('array');
      expect(hikeSchema.startLocation).toBe('object');
      expect(hikeSchema.endLocation).toBe('object');
      
      // GPS track should be an array
      expect(hikeSchema.gpsTrack).toBe('array');
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle empty arrays and objects', () => {
      const hikeWithEmptyArrays = {
        title: 'Test Hike',
        waypoints: [],
        gpsTrack: []
      };

      const result = validateHikeData(hikeWithEmptyArrays);
      expect(result.valid).toBe(true);
    });

    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const hikeWithLongStrings = {
        title: longString,
        notes: longString
      };

      const result = validateHikeData(hikeWithLongStrings);
      // Should still be valid (no length restrictions in schema)
      expect(result.valid).toBe(true);
    });

    test('should handle extreme coordinate values', () => {
      const extremeWaypoint = {
        latitude: 89.9999,
        longitude: 179.9999,
        elevation: 8848 // Mount Everest height
      };

      const result = validateWaypoint(extremeWaypoint);
      expect(result.valid).toBe(true);
    });

    test('should handle special numeric values', () => {
      // Test with zero values
      const zeroValueHike = {
        title: 'Zero Test',
        distance: 0,
        elevation: 0,
        duration: 0
      };

      const result = validateHikeData(zeroValueHike);
      expect(result.valid).toBe(true);
    });
  });
});
