// Simple API key management for external access

const API_KEYS = new Map([
  // Format: [key, { name, permissions, createdAt, lastUsed }]
  ['demo-key-12345', {
    name: 'Demo API Key',
    permissions: ['read', 'write'],
    createdAt: new Date(),
    lastUsed: null,
    usageCount: 0
  }],
  ['readonly-key-67890', {
    name: 'Read-Only Demo Key', 
    permissions: ['read'],
    createdAt: new Date(),
    lastUsed: null,
    usageCount: 0
  }]
]);

export class ApiKeyManager {
  
  // Validate an API key
  static validateKey(apiKey) {
    if (!apiKey) {
      return { valid: false, error: 'API key is required' };
    }
    
    const keyData = API_KEYS.get(apiKey);
    if (!keyData) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    // Update usage statistics
    keyData.lastUsed = new Date();
    keyData.usageCount++;
    
    return { 
      valid: true, 
      keyData: {
        name: keyData.name,
        permissions: keyData.permissions
      }
    };
  }
  
  // Check if key has specific permission
  static hasPermission(apiKey, permission) {
    const validation = this.validateKey(apiKey);
    if (!validation.valid) {
      return false;
    }
    
    return validation.keyData.permissions.includes(permission);
  }
  
  // Generate a new API key (for admin use)
  static generateKey(name, permissions = ['read']) {
    const key = 'hike_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    API_KEYS.set(key, {
      name,
      permissions,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0
    });
    
    return key;
  }
  
  // Get API key usage statistics
  static getKeyStats(apiKey) {
    const keyData = API_KEYS.get(apiKey);
    if (!keyData) {
      return null;
    }
    
    return {
      name: keyData.name,
      permissions: keyData.permissions,
      createdAt: keyData.createdAt,
      lastUsed: keyData.lastUsed,
      usageCount: keyData.usageCount
    };
  }
  
  // List all API keys (for admin)
  static listKeys() {
    const keys = [];
    for (const [key, data] of API_KEYS) {
      keys.push({
        key: key.substring(0, 10) + '...', // Partially hide the key
        name: data.name,
        permissions: data.permissions,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        usageCount: data.usageCount
      });
    }
    return keys;
  }
}

// Export demo keys for documentation
export const DEMO_KEYS = {
  FULL_ACCESS: 'demo-key-12345',
  READ_ONLY: 'readonly-key-67890'
};

