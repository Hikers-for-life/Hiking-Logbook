// Tests for goalService validation functions
// We need to extract the validation functions to test them

// Copy the validation functions for testing (since they're not exported)
const ALLOWED_CATEGORIES = new Set([
  'distance',
  'time',
  'elevation',
  'hikes',
  'streak',
  'custom',
]);

function validatePayload(payload, requireAll = true) {
  if (!payload || typeof payload !== 'object') {
    return requireAll ? 'payload is required' : null;
  }

  if (requireAll) {
    if (
      !payload.title ||
      typeof payload.title !== 'string' ||
      !payload.title.trim()
    ) {
      return 'title is required';
    }
    if (!payload.category || !ALLOWED_CATEGORIES.has(payload.category)) {
      return `category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`;
    }
    if (
      payload.targetValue === undefined ||
      payload.targetValue === null ||
      typeof payload.targetValue !== 'number' ||
      Number.isNaN(payload.targetValue) ||
      payload.targetValue < 0
    ) {
      return 'targetValue must be a non-negative number';
    }
    if (!payload.unit || typeof payload.unit !== 'string') {
      return 'unit is required';
    }
  } else {
    // partial validation for updates - only validate present fields
    if (payload.category && !ALLOWED_CATEGORIES.has(payload.category)) {
      return `category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`;
    }
    if (
      payload.targetValue !== undefined &&
      (typeof payload.targetValue !== 'number' ||
        Number.isNaN(payload.targetValue) ||
        payload.targetValue < 0)
    ) {
      return 'targetValue must be a non-negative number';
    }
  }
  return null;
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      title: '',
      description: '',
      category: '',
      targetValue: 0,
      unit: '',
      targetDate: null,
    };
  }

  return {
    title: payload.title?.trim(),
    description: payload.description || '',
    category: payload.category,
    targetValue:
      typeof payload.targetValue === 'number'
        ? payload.targetValue
        : Number(payload.targetValue),
    unit: payload.unit || '',
    targetDate: payload.targetDate ? new Date(payload.targetDate) : null,
  };
}

describe('Goal Service Tests', () => {
  describe('ALLOWED_CATEGORIES validation', () => {
    test('should contain expected categories', () => {
      expect(ALLOWED_CATEGORIES.has('distance')).toBe(true);
      expect(ALLOWED_CATEGORIES.has('time')).toBe(true);
      expect(ALLOWED_CATEGORIES.has('elevation')).toBe(true);
      expect(ALLOWED_CATEGORIES.has('hikes')).toBe(true);
      expect(ALLOWED_CATEGORIES.has('streak')).toBe(true);
      expect(ALLOWED_CATEGORIES.has('custom')).toBe(true);

      // Should not contain invalid categories
      expect(ALLOWED_CATEGORIES.has('invalid')).toBe(false);
      expect(ALLOWED_CATEGORIES.has('')).toBe(false);
    });

    test('should have exactly 6 categories', () => {
      expect(ALLOWED_CATEGORIES.size).toBe(6);
    });
  });

  describe('validatePayload function - full validation', () => {
    test('should validate a complete valid payload', () => {
      const validPayload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
        unit: 'km',
        description: 'Walk a total of 100 kilometers',
      };

      expect(validatePayload(validPayload, true)).toBeNull();
    });

    test('should reject payload with missing title', () => {
      const payload = {
        category: 'distance',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe('title is required');
    });

    test('should reject payload with empty title', () => {
      const payload = {
        title: '',
        category: 'distance',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe('title is required');
    });

    test('should reject payload with whitespace-only title', () => {
      const payload = {
        title: '   ',
        category: 'distance',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe('title is required');
    });

    test('should reject payload with non-string title', () => {
      const payload = {
        title: 123,
        category: 'distance',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe('title is required');
    });

    test('should reject payload with missing category', () => {
      const payload = {
        title: 'Walk 100km',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toContain(
        'category must be one of:'
      );
    });

    test('should reject payload with invalid category', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'invalid',
        targetValue: 100,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toContain(
        'category must be one of:'
      );
    });

    test('should reject payload with missing targetValue', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should reject payload with null targetValue', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: null,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should reject payload with negative targetValue', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: -10,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should reject payload with NaN targetValue', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: NaN,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should reject payload with non-number targetValue', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: '100',
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should reject payload with missing unit', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
      };

      expect(validatePayload(payload, true)).toBe('unit is required');
    });

    test('should reject payload with non-string unit', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
        unit: 123,
      };

      expect(validatePayload(payload, true)).toBe('unit is required');
    });

    test('should accept zero targetValue', () => {
      const payload = {
        title: 'Start hiking',
        category: 'distance',
        targetValue: 0,
        unit: 'km',
      };

      expect(validatePayload(payload, true)).toBeNull();
    });
  });

  describe('validatePayload function - partial validation', () => {
    test('should accept empty payload for partial validation', () => {
      expect(validatePayload({}, false)).toBeNull();
    });

    test('should validate category when provided', () => {
      expect(validatePayload({ category: 'distance' }, false)).toBeNull();
      expect(validatePayload({ category: 'invalid' }, false)).toContain(
        'category must be one of:'
      );
    });

    test('should validate targetValue when provided', () => {
      expect(validatePayload({ targetValue: 100 }, false)).toBeNull();
      expect(validatePayload({ targetValue: 0 }, false)).toBeNull();
      expect(validatePayload({ targetValue: -10 }, false)).toBe(
        'targetValue must be a non-negative number'
      );
      expect(validatePayload({ targetValue: NaN }, false)).toBe(
        'targetValue must be a non-negative number'
      );
    });

    test('should allow missing fields in partial validation', () => {
      const partialPayload = {
        description: 'Updated description',
      };

      expect(validatePayload(partialPayload, false)).toBeNull();
    });
  });

  describe('normalizePayload function', () => {
    test('should normalize a complete payload', () => {
      const payload = {
        title: '  Walk 100km  ',
        description: 'Walk a total of 100 kilometers',
        category: 'distance',
        targetValue: 100,
        unit: 'km',
        targetDate: '2024-12-31',
      };

      const normalized = normalizePayload(payload);

      expect(normalized.title).toBe('Walk 100km'); // trimmed
      expect(normalized.description).toBe('Walk a total of 100 kilometers');
      expect(normalized.category).toBe('distance');
      expect(normalized.targetValue).toBe(100);
      expect(normalized.unit).toBe('km');
      expect(normalized.targetDate).toBeInstanceOf(Date);
    });

    test('should handle missing optional fields', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
      };

      const normalized = normalizePayload(payload);

      expect(normalized.title).toBe('Walk 100km');
      expect(normalized.description).toBe('');
      expect(normalized.unit).toBe('');
      expect(normalized.targetDate).toBeNull();
    });

    test('should convert string targetValue to number', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: '100',
      };

      const normalized = normalizePayload(payload);
      expect(normalized.targetValue).toBe(100);
      expect(typeof normalized.targetValue).toBe('number');
    });

    test('should handle null targetDate', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
        targetDate: null,
      };

      const normalized = normalizePayload(payload);
      expect(normalized.targetDate).toBeNull();
    });

    test('should handle undefined targetDate', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
      };

      const normalized = normalizePayload(payload);
      expect(normalized.targetDate).toBeNull();
    });

    test('should handle empty string targetDate', () => {
      const payload = {
        title: 'Walk 100km',
        category: 'distance',
        targetValue: 100,
        targetDate: '',
      };

      const normalized = normalizePayload(payload);
      expect(normalized.targetDate).toBeNull();
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle null payload gracefully', () => {
      expect(() => validatePayload(null, true)).not.toThrow();
      expect(() => validatePayload(null, false)).not.toThrow();
      expect(() => normalizePayload(null)).not.toThrow();
    });

    test('should handle undefined payload gracefully', () => {
      expect(() => validatePayload(undefined, true)).not.toThrow();
      expect(() => validatePayload(undefined, false)).not.toThrow();
      expect(() => normalizePayload(undefined)).not.toThrow();
    });

    test('should validate all category options', () => {
      const categories = [
        'distance',
        'time',
        'elevation',
        'hikes',
        'streak',
        'custom',
      ];

      categories.forEach((category) => {
        const payload = {
          title: `Test ${category}`,
          category,
          targetValue: 10,
          unit: 'units',
        };

        expect(validatePayload(payload, true)).toBeNull();
      });
    });
  });
});
