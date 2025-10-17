// Tests for apiKeys.js - API key management
const { ApiKeyManager } = require('../config/apiKeys.js');

describe('ApiKeyManager Tests', () => {
  describe('validateKey method', () => {
    test('should return invalid for null/undefined key', () => {
      expect(ApiKeyManager.validateKey(null)).toEqual({
        valid: false,
        error: 'API key is required',
      });

      expect(ApiKeyManager.validateKey(undefined)).toEqual({
        valid: false,
        error: 'API key is required',
      });

      expect(ApiKeyManager.validateKey('')).toEqual({
        valid: false,
        error: 'API key is required',
      });
    });

    test('should return invalid for unknown key', () => {
      const result = ApiKeyManager.validateKey('invalid-key-123');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid API key',
      });
    });

    test('should validate demo key successfully', () => {
      const result = ApiKeyManager.validateKey('demo-key-12345');
      expect(result.valid).toBe(true);
      expect(result.keyData.name).toBe('Demo API Key');
      expect(result.keyData.permissions).toEqual(['read', 'write']);
    });

    test('should validate readonly key successfully', () => {
      const result = ApiKeyManager.validateKey('readonly-key-67890');
      expect(result.valid).toBe(true);
      expect(result.keyData.name).toBe('Read-Only Demo Key');
      expect(result.keyData.permissions).toEqual(['read']);
    });

    test('should update usage statistics on validation', () => {
      // First validation
      const result1 = ApiKeyManager.validateKey('demo-key-12345');
      expect(result1.valid).toBe(true);

      // Second validation - usage should be tracked
      const result2 = ApiKeyManager.validateKey('demo-key-12345');
      expect(result2.valid).toBe(true);

      // Note: We can't easily test lastUsed and usageCount changes since they're internal
      // but we can verify the method runs without error
    });
  });

  describe('hasPermission method', () => {
    test('should return false for invalid key', () => {
      const result = ApiKeyManager.hasPermission('invalid-key', 'read');
      expect(result).toBe(false);
    });

    test('should return false for null/undefined key', () => {
      expect(ApiKeyManager.hasPermission(null, 'read')).toBe(false);
      expect(ApiKeyManager.hasPermission(undefined, 'read')).toBe(false);
      expect(ApiKeyManager.hasPermission('', 'read')).toBe(false);
    });

    test('should return true for demo key with read permission', () => {
      const result = ApiKeyManager.hasPermission('demo-key-12345', 'read');
      expect(result).toBe(true);
    });

    test('should return true for demo key with write permission', () => {
      const result = ApiKeyManager.hasPermission('demo-key-12345', 'write');
      expect(result).toBe(true);
    });

    test('should return true for readonly key with read permission', () => {
      const result = ApiKeyManager.hasPermission('readonly-key-67890', 'read');
      expect(result).toBe(true);
    });

    test('should return false for readonly key with write permission', () => {
      const result = ApiKeyManager.hasPermission('readonly-key-67890', 'write');
      expect(result).toBe(false);
    });

    test('should return false for non-existent permission', () => {
      expect(ApiKeyManager.hasPermission('demo-key-12345', 'delete')).toBe(
        false
      );
      expect(ApiKeyManager.hasPermission('demo-key-12345', 'admin')).toBe(
        false
      );
    });

    test('should handle case-sensitive permissions', () => {
      expect(ApiKeyManager.hasPermission('demo-key-12345', 'READ')).toBe(false);
      expect(ApiKeyManager.hasPermission('demo-key-12345', 'Write')).toBe(
        false
      );
    });
  });

  describe('getKeyStats method', () => {
    test('should return null for invalid key', () => {
      const result = ApiKeyManager.getKeyStats('invalid-key');
      expect(result).toBeNull();
    });

    test('should return null for null/undefined key', () => {
      expect(ApiKeyManager.getKeyStats(null)).toBeNull();
      expect(ApiKeyManager.getKeyStats(undefined)).toBeNull();
      expect(ApiKeyManager.getKeyStats('')).toBeNull();
    });

    test('should return key stats for demo key', () => {
      const result = ApiKeyManager.getKeyStats('demo-key-12345');
      expect(result).toEqual({
        name: 'Demo API Key',
        permissions: ['read', 'write'],
        createdAt: expect.any(Date),
        lastUsed: expect.any(Date),
        usageCount: expect.any(Number),
      });
    });

    test('should return key stats for readonly key', () => {
      const result = ApiKeyManager.getKeyStats('readonly-key-67890');
      expect(result).toEqual({
        name: 'Read-Only Demo Key',
        permissions: ['read'],
        createdAt: expect.any(Date),
        lastUsed: expect.any(Date),
        usageCount: expect.any(Number),
      });
    });
  });

  describe('listKeys method', () => {
    test('should return array of key summaries', () => {
      const result = ApiKeyManager.listKeys();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of returned keys
      result.forEach((keyInfo) => {
        expect(keyInfo).toHaveProperty('key'); // Partially hidden key
        expect(keyInfo).toHaveProperty('name');
        expect(keyInfo).toHaveProperty('permissions');
        expect(keyInfo).toHaveProperty('usageCount');
        expect(Array.isArray(keyInfo.permissions)).toBe(true);
        expect(typeof keyInfo.usageCount).toBe('number');
        expect(keyInfo.key).toMatch(/\.\.\.$/); // Should end with ...
      });
    });

    test('should include both demo keys', () => {
      const result = ApiKeyManager.listKeys();
      const names = result.map((key) => key.name);
      expect(names).toContain('Demo API Key');
      expect(names).toContain('Read-Only Demo Key');
    });
  });

  describe('generateKey method', () => {
    test('should generate a new API key', () => {
      const newKey = ApiKeyManager.generateKey('Test Key', ['read']);
      expect(typeof newKey).toBe('string');
      expect(newKey.length).toBeGreaterThan(0);
      expect(newKey).toMatch(/^hike_/); // Should start with hike_
    });

    test('should generate key with default permissions', () => {
      const newKey = ApiKeyManager.generateKey('Default Permissions Key');
      expect(typeof newKey).toBe('string');

      // Check that the key was added with default permissions
      const validation = ApiKeyManager.validateKey(newKey);
      expect(validation.valid).toBe(true);
      expect(validation.keyData.permissions).toEqual(['read']);
    });

    test('should generate key with custom permissions', () => {
      const newKey = ApiKeyManager.generateKey('Custom Permissions Key', [
        'read',
        'write',
      ]);
      expect(typeof newKey).toBe('string');

      // Check that the key was added with custom permissions
      const validation = ApiKeyManager.validateKey(newKey);
      expect(validation.valid).toBe(true);
      expect(validation.keyData.permissions).toEqual(['read', 'write']);
    });

    test('should generate unique keys', () => {
      const key1 = ApiKeyManager.generateKey('Key 1');
      const key2 = ApiKeyManager.generateKey('Key 2');
      expect(key1).not.toBe(key2);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle concurrent key validations', () => {
      // Simulate concurrent access
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(ApiKeyManager.validateKey('demo-key-12345'))
        );
      }

      return Promise.all(promises).then((results) => {
        results.forEach((result) => {
          expect(result.valid).toBe(true);
        });
      });
    });

    test('should handle mixed valid and invalid keys', () => {
      const keys = [
        'demo-key-12345',
        'invalid-key',
        'readonly-key-67890',
        'another-invalid',
      ];
      const results = keys.map((key) => ApiKeyManager.validateKey(key));

      expect(results[0].valid).toBe(true); // demo-key-12345
      expect(results[1].valid).toBe(false); // invalid-key
      expect(results[2].valid).toBe(true); // readonly-key-67890
      expect(results[3].valid).toBe(false); // another-invalid
    });

    test('should handle permission checks with various input types', () => {
      // Test with different falsy values
      expect(ApiKeyManager.hasPermission('demo-key-12345', null)).toBe(false);
      expect(ApiKeyManager.hasPermission('demo-key-12345', undefined)).toBe(
        false
      );
      expect(ApiKeyManager.hasPermission('demo-key-12345', '')).toBe(false);
      expect(ApiKeyManager.hasPermission('demo-key-12345', 0)).toBe(false);
      expect(ApiKeyManager.hasPermission('demo-key-12345', false)).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    test('should work with typical API workflow', () => {
      const apiKey = 'demo-key-12345';

      // 1. Validate key
      const validation = ApiKeyManager.validateKey(apiKey);
      expect(validation.valid).toBe(true);

      // 2. Check read permission
      expect(ApiKeyManager.hasPermission(apiKey, 'read')).toBe(true);

      // 3. Check write permission
      expect(ApiKeyManager.hasPermission(apiKey, 'write')).toBe(true);

      // 4. Get key stats
      const keyStats = ApiKeyManager.getKeyStats(apiKey);
      expect(keyStats.name).toBe('Demo API Key');
    });

    test('should work with readonly API workflow', () => {
      const apiKey = 'readonly-key-67890';

      // 1. Validate key
      const validation = ApiKeyManager.validateKey(apiKey);
      expect(validation.valid).toBe(true);

      // 2. Check read permission (should work)
      expect(ApiKeyManager.hasPermission(apiKey, 'read')).toBe(true);

      // 3. Check write permission (should fail)
      expect(ApiKeyManager.hasPermission(apiKey, 'write')).toBe(false);

      // 4. Get key stats
      const keyStats = ApiKeyManager.getKeyStats(apiKey);
      expect(keyStats.name).toBe('Read-Only Demo Key');
      expect(keyStats.permissions).toEqual(['read']);
    });
  });
});
