/**
 * Cross-Browser LocalStorage Utilities
 * Handles localStorage issues across different browsers, especially Safari
 */

// Cross-browser localStorage wrapper
class CrossBrowserStorage {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
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

  // Safe getter with cross-browser handling and type conversion
  getItem(key, defaultValue = '') {
    if (!this.storageAvailable) {
      return defaultValue;
    }

    try {
      const value = localStorage.getItem(key);
      
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
          console.error(`Failed to parse JSON for key ${key}:`, parseError);
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
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  // Safe setter with cross-browser handling
  setItem(key, value) {
    if (!this.storageAvailable) {
      return false;
    }

    try {
      // Handle null/undefined values
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return true;
      }

      // Handle complex objects
      if (typeof value === 'object') {
        const stringValue = JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
      }

      // Handle boolean values
      if (typeof value === 'boolean') {
        localStorage.setItem(key, value.toString());
        return true;
      }

      // Handle numbers
      if (typeof value === 'number') {
        localStorage.setItem(key, value.toString());
        return true;
      }

      // Default string handling
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in localStorage:`, error);
      return false;
    }
  }

  // Safe remover
  removeItem(key) {
    if (!this.storageAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }

  // Safe clearer
  clear() {
    if (!this.storageAvailable) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
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
