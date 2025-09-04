/**
 * Cross-Platform LocalStorage Utilities
 * Handles localStorage issues across different browsers and platforms
 */

// Cross-browser localStorage wrapper
class CrossBrowserStorage {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
    this.platform = this.detectPlatform();
    this.isPWA = this.checkPWAContext();
    this.isAndroid = this.checkAndroidDevice();
    this.isIOS = this.checkIOSDevice();
  }

  // Detect platform
  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (this.isPWA) return 'pwa';
    if (userAgent.includes('msie') || userAgent.includes('trident')) return 'ie';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('edge')) return 'edge';
    if (userAgent.includes('chrome')) return 'chrome';
    
    return 'unknown';
  }

  // Check if localStorage is available and working
  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage not available:', error);
      return false;
    }
  }

  // Check if we're in a PWA context
  checkPWAContext() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Check if we're on Android
  checkAndroidDevice() {
    return /Android/.test(navigator.userAgent);
  }

  // Check if we're on iOS
  checkIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  // Platform-specific storage strategies
  getStorageStrategy() {
    switch (this.platform) {
      case 'ie':
        return {
          primary: 'localStorage',
          fallback: 'sessionStorage',
          backup: 'memory',
          reason: 'IE has limited storage support'
        };
      
      case 'safari':
        if (this.isIOS) {
          return {
            primary: 'localStorage',
            fallback: 'sessionStorage',
            backup: 'memory',
            reason: 'iOS Safari has private browsing restrictions'
          };
        } else {
          return {
            primary: 'localStorage',
            fallback: 'sessionStorage',
            backup: 'memory',
            reason: 'macOS Safari has good storage support'
          };
        }
      
      case 'firefox':
        return {
          primary: 'localStorage',
          fallback: 'sessionStorage',
          backup: 'memory',
          reason: 'Firefox has excellent storage support'
        };
      
      case 'pwa':
        return {
          primary: 'localStorage',
          fallback: 'sessionStorage',
          backup: 'memory',
          reason: 'PWA storage varies by platform'
        };
      
      case 'chrome':
      case 'edge':
      default:
        return {
          primary: 'localStorage',
          fallback: 'sessionStorage',
          backup: 'memory',
          reason: 'Chrome/Edge have excellent storage support'
        };
    }
  }

  // Memory storage fallback
  memoryStorage = new Map();

  // Safe getter with cross-platform handling and type conversion
  getItem(key, defaultValue = '') {
    const strategy = this.getStorageStrategy();
    
    if (!this.storageAvailable) {
      console.warn(`localStorage not available for key: ${key} on ${this.platform}`);
      
      // Try sessionStorage fallback
      try {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue !== null) {
          console.log(`Recovered value from sessionStorage for key: ${key}`);
          return this.parseValue(sessionValue, defaultValue);
        }
      } catch (sessionError) {
        console.error('SessionStorage fallback failed:', sessionError);
      }
      
      // Try memory storage as last resort
      if (this.memoryStorage.has(key)) {
        console.log(`Recovered value from memory storage for key: ${key}`);
        return this.memoryStorage.get(key);
      }
      
      return defaultValue;
    }

    try {
      const value = localStorage.getItem(key);
      return this.parseValue(value, defaultValue);
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage on ${this.platform}:`, error);
      
      // Platform-specific error recovery
      return this.handleStorageError(key, defaultValue, strategy);
    }
  }

  // Parse value with type conversion
  parseValue(value, defaultValue) {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // Handle empty strings
    if (value === '') {
      return defaultValue;
    }

    // Handle JSON parsing
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch (parseError) {
        console.error(`Failed to parse JSON:`, parseError);
        return defaultValue;
      }
    }

    // Handle boolean values
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }

    // Handle number values
    if (!isNaN(value) && value !== '') {
      const num = Number(value);
      if (Number.isInteger(num)) {
        return num;
      }
      if (!Number.isNaN(num)) {
        return num;
      }
    }

    return value;
  }

  // Handle storage errors with platform-specific recovery
  handleStorageError(key, defaultValue, strategy) {
    console.log(`Attempting ${strategy.fallback} recovery for key: ${key}`);
    
    // Try sessionStorage fallback
    if (strategy.fallback === 'sessionStorage') {
      try {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue !== null) {
          console.log(`Recovered value from sessionStorage for key: ${key}`);
          return this.parseValue(sessionValue, defaultValue);
        }
      } catch (sessionError) {
        console.error('SessionStorage recovery failed:', sessionError);
      }
    }
    
    // Try memory storage as last resort
    if (strategy.backup === 'memory' && this.memoryStorage.has(key)) {
      console.log(`Recovered value from memory storage for key: ${key}`);
      return this.memoryStorage.get(key);
    }
    
    return defaultValue;
  }

  // Safe setter with cross-platform handling
  setItem(key, value) {
    const strategy = this.getStorageStrategy();
    
    if (!this.storageAvailable) {
      console.warn(`localStorage not available for setting key: ${key} on ${this.platform}`);
      return this.setItemFallback(key, value, strategy);
    }

    try {
      const stringValue = this.stringifyValue(value);
      localStorage.setItem(key, stringValue);
      
      // Platform-specific backup strategies
      this.createBackup(key, stringValue, strategy);
      
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in localStorage on ${this.platform}:`, error);
      return this.setItemFallback(key, value, strategy);
    }
  }

  // Stringify value for storage
  stringifyValue(value) {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }

    // Handle complex objects
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value.toString();
    }

    // Handle numbers
    if (typeof value === 'number') {
      return value.toString();
    }

    // Default string handling
    return String(value);
  }

  // Create backup copies
  createBackup(key, value, strategy) {
    // SessionStorage backup
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.setItem(key, value);
      } catch (sessionError) {
        console.warn('Failed to backup to sessionStorage:', sessionError);
      }
    }
    
    // Memory backup
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.set(key, this.parseValue(value));
      } catch (memoryError) {
        console.warn('Failed to backup to memory storage:', memoryError);
      }
    }
  }

  // Fallback setter
  setItemFallback(key, value, strategy) {
    const stringValue = this.stringifyValue(value);
    
    // Try sessionStorage fallback
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.setItem(key, stringValue);
        console.log(`Successfully stored in sessionStorage as fallback`);
        return true;
      } catch (sessionError) {
        console.error('SessionStorage fallback failed:', sessionError);
      }
    }
    
    // Try memory storage as last resort
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.set(key, this.parseValue(stringValue));
        console.log(`Successfully stored in memory storage as fallback`);
        return true;
      } catch (memoryError) {
        console.error('Memory storage fallback failed:', memoryError);
      }
    }
    
    return false;
  }

  // Safe remover
  removeItem(key) {
    const strategy = this.getStorageStrategy();
    
    if (!this.storageAvailable) {
      console.warn(`localStorage not available for removing key: ${key} on ${this.platform}`);
      return this.removeItemFallback(key, strategy);
    }

    try {
      localStorage.removeItem(key);
      
      // Remove from all backup storages
      this.removeFromBackups(key, strategy);
      
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage on ${this.platform}:`, error);
      return this.removeItemFallback(key, strategy);
    }
  }

  // Remove from backup storages
  removeFromBackups(key, strategy) {
    // Remove from sessionStorage
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.removeItem(key);
      } catch (sessionError) {
        console.warn('Failed to remove from sessionStorage:', sessionError);
      }
    }
    
    // Remove from memory storage
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.delete(key);
      } catch (memoryError) {
        console.warn('Failed to remove from memory storage:', memoryError);
      }
    }
  }

  // Fallback remover
  removeItemFallback(key, strategy) {
    // Try sessionStorage fallback
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (sessionError) {
        console.error('SessionStorage removal failed:', sessionError);
      }
    }
    
    // Try memory storage
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.delete(key);
        return true;
      } catch (memoryError) {
        console.error('Memory storage removal failed:', memoryError);
      }
    }
    
    return false;
  }

  // Safe clearer
  clear() {
    const strategy = this.getStorageStrategy();
    
    if (!this.storageAvailable) {
      console.warn(`localStorage not available for clearing on ${this.platform}`);
      return this.clearFallback(strategy);
    }

    try {
      localStorage.clear();
      
      // Clear all backup storages
      this.clearBackups(strategy);
      
      return true;
    } catch (error) {
      console.error(`Failed to clear localStorage on ${this.platform}:`, error);
      return this.clearFallback(strategy);
    }
  }

  // Clear backup storages
  clearBackups(strategy) {
    // Clear sessionStorage
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.clear();
      } catch (sessionError) {
        console.warn('Failed to clear sessionStorage:', sessionError);
      }
    }
    
    // Clear memory storage
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.clear();
      } catch (memoryError) {
        console.warn('Failed to clear memory storage:', memoryError);
      }
    }
  }

  // Fallback clearer
  clearFallback(strategy) {
    // Try sessionStorage fallback
    if (strategy.fallback === 'sessionStorage') {
      try {
        sessionStorage.clear();
        return true;
      } catch (sessionError) {
        console.error('SessionStorage clear failed:', sessionError);
      }
    }
    
    // Try memory storage
    if (strategy.backup === 'memory') {
      try {
        this.memoryStorage.clear();
        return true;
      } catch (memoryError) {
        console.error('Memory storage clear failed:', memoryError);
      }
    }
    
    return false;
  }

  // Get all items (for debugging)
  getAllItems() {
    if (!this.storageAvailable) {
      return {};
    }

    try {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = this.getItem(key);
        }
      }
      return items;
    } catch (error) {
      console.error('Failed to get all localStorage items:', error);
      return {};
    }
  }

  // Check if key exists
  hasItem(key) {
    if (!this.storageAvailable) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Failed to check if ${key} exists:`, error);
      return false;
    }
  }

  // Get storage size
  getStorageSize() {
    if (!this.storageAvailable) {
      return 0;
    }

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          size += key.length + (value ? value.length : 0);
        }
      }
      return size;
    } catch (error) {
      console.error('Failed to get localStorage size:', error);
      return 0;
    }
  }

  // Cross-platform storage validation
  validateStorage() {
    const strategy = this.getStorageStrategy();
    
    try {
      const testKey = '__cross_platform_test__';
      const testValue = 'cross_platform_test_value';
      
      // Test primary storage
      this.setItem(testKey, testValue);
      const retrieved = this.getItem(testKey);
      this.removeItem(testKey);
      
      if (retrieved !== testValue) {
        return { 
          valid: false, 
          reason: `${strategy.primary} not working properly on ${this.platform}`,
          strategy 
        };
      }
      
      return { 
        valid: true, 
        reason: `Cross-platform storage working correctly on ${this.platform}`,
        strategy 
      };
    } catch (error) {
      return { 
        valid: false, 
        reason: `Cross-platform storage validation failed on ${this.platform}: ${error.message}`,
        strategy 
      };
    }
  }

  // Get platform information
  getPlatformInfo() {
    return {
      platform: this.platform,
      isPWA: this.isPWA,
      isAndroid: this.isAndroid,
      isIOS: this.isIOS,
      storageAvailable: this.storageAvailable,
      strategy: this.getStorageStrategy()
    };
  }
}

// Create singleton instance
const crossBrowserStorage = new CrossBrowserStorage();

// Export utility functions
export const getStorageItem = (key, defaultValue = '') => {
  return crossBrowserStorage.getItem(key, defaultValue);
};

export const setStorageItem = (key, value) => {
  return crossBrowserStorage.setItem(key, value);
};

export const removeStorageItem = (key) => {
  return crossBrowserStorage.removeItem(key);
};

export const clearStorage = () => {
  return crossBrowserStorage.clear();
};

export const getAllStorageItems = () => {
  return crossBrowserStorage.getAllItems();
};

export const hasStorageItem = (key) => {
  return crossBrowserStorage.hasItem(key);
};

export const getStorageSize = () => {
  return crossBrowserStorage.getStorageSize();
};

export const validateStorage = () => {
  return crossBrowserStorage.validateStorage();
};

export const getPlatformInfo = () => {
  return crossBrowserStorage.getPlatformInfo();
};

// Authentication storage helpers
export const getAuthData = () => {
  const authKeys = ['token', 'userId', 'email', 'roles', 'activeRole', 'userName', 'pictureURL', 'registerFlag', 'clientDetailSet', 'hotelId', 'topHotelIds'];
  const authData = {};
  
  authKeys.forEach(key => {
    authData[key] = getStorageItem(key);
  });
  
  return authData;
};

export const setAuthData = (authData) => {
  Object.entries(authData).forEach(([key, value]) => {
    setStorageItem(key, value);
  });
};

export const clearAuthData = () => {
  const authKeys = ['token', 'userId', 'email', 'roles', 'activeRole', 'userName', 'pictureURL', 'registerFlag', 'clientDetailSet', 'hotelId', 'topHotelIds'];
  
  authKeys.forEach(key => {
    removeStorageItem(key);
  });
};

export default crossBrowserStorage;
