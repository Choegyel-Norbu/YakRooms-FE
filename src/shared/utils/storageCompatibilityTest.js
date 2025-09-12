/**
 * Cross-Browser Storage Compatibility Test Suite
 * 
 * This test suite validates localStorage compatibility across all major browsers
 * and provides debugging information for storage-related issues.
 */

import { 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem,
  getPlatformInfo,
  validateStorage,
  getStorageInfo,
  cleanupStorage,
  isPrivateBrowsing,
  testStorageCompatibility
} from './safariLocalStorage';

// Test data for storage operations
const TEST_DATA = {
  simple: 'test-value',
  number: 42,
  boolean: true,
  object: { name: 'test', nested: { value: 123 } },
  array: [1, 2, 3, 'test'],
  special: 'test with special chars: 中文 🚀 ñoño',
  large: 'x'.repeat(1000) // 1KB string
};

// Storage compatibility test results
class CompatibilityTestResults {
  constructor() {
    this.platform = null;
    this.browserInfo = null;
    this.testResults = {};
    this.errors = [];
    this.warnings = [];
    this.performance = {};
  }

  addResult(test, success, details = {}) {
    this.testResults[test] = {
      success,
      details,
      timestamp: Date.now()
    };
  }

  addError(error) {
    this.errors.push({
      error: error.message || error,
      timestamp: Date.now()
    });
  }

  addWarning(warning) {
    this.warnings.push({
      warning,
      timestamp: Date.now()
    });
  }

  getScore() {
    const total = Object.keys(this.testResults).length;
    const passed = Object.values(this.testResults).filter(r => r.success).length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  getSummary() {
    return {
      platform: this.platform,
      browser: this.browserInfo,
      score: this.getScore(),
      totalTests: Object.keys(this.testResults).length,
      passedTests: Object.values(this.testResults).filter(r => r.success).length,
      failedTests: Object.values(this.testResults).filter(r => !r.success).length,
      errors: this.errors.length,
      warnings: this.warnings.length,
      performance: this.performance
    };
  }
}

// Main compatibility test suite
export class StorageCompatibilityTester {
  constructor() {
    this.results = new CompatibilityTestResults();
  }

  async runFullTestSuite() {
    console.log('🧪 Starting comprehensive storage compatibility tests...');
    
    try {
      // Get platform information
      await this.testPlatformDetection();
      
      // Basic functionality tests
      await this.testBasicOperations();
      
      // Data type handling tests
      await this.testDataTypes();
      
      // Error handling tests
      await this.testErrorHandling();
      
      // Performance tests
      await this.testPerformance();
      
      // Storage capacity tests
      await this.testStorageCapacity();
      
      // Cross-tab synchronization tests
      await this.testCrossTabSync();
      
      // Private browsing tests
      await this.testPrivateBrowsing();
      
      console.log('✅ Storage compatibility tests completed');
      return this.results;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.results.addError(error);
      return this.results;
    }
  }

  async testPlatformDetection() {
    try {
      const platformInfo = getPlatformInfo();
      this.results.platform = platformInfo;
      this.results.browserInfo = {
        browser: platformInfo.browser,
        version: platformInfo.browserVersion,
        platform: platformInfo.platform
      };
      
      this.results.addResult('platform_detection', true, platformInfo);
      console.log('✅ Platform detection successful:', platformInfo);
    } catch (error) {
      this.results.addResult('platform_detection', false, { error: error.message });
      this.results.addError(error);
    }
  }

  async testBasicOperations() {
    console.log('🔍 Testing basic storage operations...');
    
    // Test set operation
    try {
      const success = setStorageItem('test_basic', 'test_value');
      this.results.addResult('basic_set', success);
    } catch (error) {
      this.results.addResult('basic_set', false, { error: error.message });
      this.results.addError(error);
    }

    // Test get operation
    try {
      const value = getStorageItem('test_basic');
      const success = value === 'test_value';
      this.results.addResult('basic_get', success, { retrieved: value });
    } catch (error) {
      this.results.addResult('basic_get', false, { error: error.message });
      this.results.addError(error);
    }

    // Test remove operation
    try {
      const success = removeStorageItem('test_basic');
      const stillExists = getStorageItem('test_basic');
      this.results.addResult('basic_remove', success && !stillExists);
    } catch (error) {
      this.results.addResult('basic_remove', false, { error: error.message });
      this.results.addError(error);
    }
  }

  async testDataTypes() {
    console.log('🔍 Testing data type handling...');
    
    for (const [key, value] of Object.entries(TEST_DATA)) {
      try {
        // Store the value
        const setSuccess = setStorageItem(`test_${key}`, value);
        
        // Retrieve the value
        const retrieved = getStorageItem(`test_${key}`);
        
        // Compare values (handle different data types)
        let isEqual = false;
        if (typeof value === 'object') {
          isEqual = JSON.stringify(value) === JSON.stringify(retrieved);
        } else {
          isEqual = value === retrieved;
        }
        
        this.results.addResult(`datatype_${key}`, setSuccess && isEqual, {
          original: value,
          retrieved: retrieved,
          originalType: typeof value,
          retrievedType: typeof retrieved
        });
        
        // Cleanup
        removeStorageItem(`test_${key}`);
        
      } catch (error) {
        this.results.addResult(`datatype_${key}`, false, { error: error.message });
        this.results.addError(error);
      }
    }
  }

  async testErrorHandling() {
    console.log('🔍 Testing error handling...');
    
    // Test invalid key handling
    try {
      const value = getStorageItem(null);
      this.results.addResult('error_null_key', value === '', { value });
    } catch (error) {
      this.results.addResult('error_null_key', false, { error: error.message });
    }

    // Test setting invalid values
    try {
      const circular = {};
      circular.self = circular;
      const success = setStorageItem('test_circular', circular);
      this.results.addResult('error_circular_object', !success);
      removeStorageItem('test_circular');
    } catch (error) {
      this.results.addResult('error_circular_object', true, { 
        message: 'Correctly handled circular reference' 
      });
    }
  }

  async testPerformance() {
    console.log('🔍 Testing storage performance...');
    
    const performanceTests = {
      'small_write': () => setStorageItem('perf_small', 'x'.repeat(100)),
      'small_read': () => getStorageItem('perf_small'),
      'medium_write': () => setStorageItem('perf_medium', 'x'.repeat(10000)),
      'medium_read': () => getStorageItem('perf_medium'),
      'json_write': () => setStorageItem('perf_json', { data: 'x'.repeat(1000) }),
      'json_read': () => getStorageItem('perf_json')
    };

    for (const [testName, testFn] of Object.entries(performanceTests)) {
      try {
        const start = performance.now();
        const result = testFn();
        const end = performance.now();
        const duration = end - start;
        
        this.results.performance[testName] = duration;
        this.results.addResult(`performance_${testName}`, true, { 
          duration: `${duration.toFixed(2)}ms`,
          success: !!result
        });
        
        if (duration > 100) {
          this.results.addWarning(`Slow ${testName}: ${duration.toFixed(2)}ms`);
        }
        
      } catch (error) {
        this.results.addResult(`performance_${testName}`, false, { error: error.message });
        this.results.addError(error);
      }
    }

    // Cleanup performance test data
    ['perf_small', 'perf_medium', 'perf_json'].forEach(key => {
      try { removeStorageItem(key); } catch (e) { /* ignore */ }
    });
  }

  async testStorageCapacity() {
    console.log('🔍 Testing storage capacity...');
    
    try {
      const storageInfo = await getStorageInfo();
      this.results.addResult('storage_info', true, storageInfo);
      
      if (storageInfo.usagePercent > 80) {
        this.results.addWarning(`High storage usage: ${storageInfo.usagePercent}%`);
      }
      
    } catch (error) {
      this.results.addResult('storage_info', false, { error: error.message });
    }
  }

  async testCrossTabSync() {
    console.log('🔍 Testing cross-tab synchronization...');
    
    try {
      // This test is limited as we can't actually open new tabs in a test
      // But we can test the storage event setup
      setStorageItem('test_cross_tab', 'initial_value');
      
      // Simulate storage change
      const event = new StorageEvent('storage', {
        key: 'test_cross_tab',
        newValue: 'changed_value',
        oldValue: 'initial_value'
      });
      
      const hasEventListener = typeof window.addEventListener === 'function';
      this.results.addResult('cross_tab_support', hasEventListener, {
        hasEventListener,
        eventType: typeof event
      });
      
      removeStorageItem('test_cross_tab');
      
    } catch (error) {
      this.results.addResult('cross_tab_support', false, { error: error.message });
      this.results.addError(error);
    }
  }

  async testPrivateBrowsing() {
    console.log('🔍 Testing private browsing detection...');
    
    try {
      const isPrivate = isPrivateBrowsing();
      const validationResult = testStorageCompatibility();
      
      this.results.addResult('private_browsing_detection', true, {
        isPrivate,
        validation: validationResult
      });
      
      if (isPrivate) {
        this.results.addWarning('Private browsing mode detected - storage may be limited');
      }
      
    } catch (error) {
      this.results.addResult('private_browsing_detection', false, { error: error.message });
      this.results.addError(error);
    }
  }

  // Quick test for essential functionality
  static async quickTest() {
    console.log('🚀 Running quick storage compatibility test...');
    
    const tester = new StorageCompatibilityTester();
    
    try {
      await tester.testPlatformDetection();
      await tester.testBasicOperations();
      
      const summary = tester.results.getSummary();
      console.log('📊 Quick test results:', summary);
      
      if (summary.score >= 80) {
        console.log('✅ Storage compatibility: GOOD');
      } else if (summary.score >= 60) {
        console.log('⚠️ Storage compatibility: FAIR');
      } else {
        console.log('❌ Storage compatibility: POOR');
      }
      
      return summary;
      
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      return { score: 0, error: error.message };
    }
  }
}

// Export test utilities
export const runStorageCompatibilityTest = () => {
  const tester = new StorageCompatibilityTester();
  return tester.runFullTestSuite();
};

export const runQuickStorageTest = () => {
  return StorageCompatibilityTester.quickTest();
};

// Utility function to log detailed storage information
export const logStorageDebugInfo = async () => {
  console.group('🔧 Storage Debug Information');
  
  try {
    const platformInfo = getPlatformInfo();
    console.log('Platform Info:', platformInfo);
    
    const storageInfo = await getStorageInfo();
    console.log('Storage Info:', storageInfo);
    
    const validation = validateStorage();
    console.log('Validation:', validation);
    
    const isPrivate = isPrivateBrowsing();
    console.log('Private Browsing:', isPrivate);
    
  } catch (error) {
    console.error('Failed to get debug info:', error);
  }
  
  console.groupEnd();
};

export default StorageCompatibilityTester;
