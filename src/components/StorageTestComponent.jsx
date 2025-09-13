/**
 * Storage Test Component
 * 
 * A React component for testing and demonstrating cross-browser storage functionality.
 * This component can be used to validate storage compatibility in different browsers.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { 
  runStorageCompatibilityTest, 
  runQuickStorageTest,
  logStorageDebugInfo 
} from '@/shared/utils/storageCompatibilityTest';
import { 
  getPlatformInfo,
  getStorageInfo,
  isPrivateBrowsing,
  cleanupStorage
} from '@/shared/utils/safariLocalStorage';

const StorageTestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load initial platform and storage information
    const loadInitialInfo = async () => {
      try {
        const platform = getPlatformInfo();
        setPlatformInfo(platform);
        
        const storage = await getStorageInfo();
        setStorageInfo(storage);
      } catch (error) {
        console.error('Failed to load initial info:', error);
      }
    };

    loadInitialInfo();
  }, []);

  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      const results = await runQuickStorageTest();
      setTestResults({ ...results, type: 'quick' });
    } catch (error) {
      setTestResults({ error: error.message, type: 'quick' });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const results = await runStorageCompatibilityTest();
      setTestResults({ ...results.getSummary(), type: 'full', details: results });
    } catch (error) {
      setTestResults({ error: error.message, type: 'full' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = () => {
    try {
      cleanupStorage();
      alert('Storage cleanup completed');
    } catch (error) {
      alert('Storage cleanup failed: ' + error.message);
    }
  };

  const handleDebugLog = () => {
    logStorageDebugInfo();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'POOR';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Cross-Browser Storage Compatibility Test
          </CardTitle>
          <p className="text-gray-600">
            Test localStorage compatibility across different browsers and platforms
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={runQuickTest} 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? 'Testing...' : 'Quick Test'}
            </Button>
            <Button 
              onClick={runFullTest} 
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isLoading ? 'Testing...' : 'Full Test Suite'}
            </Button>
            <Button 
              onClick={handleCleanup}
              variant="outline"
            >
              Cleanup Storage
            </Button>
            <Button 
              onClick={handleDebugLog}
              variant="outline"
            >
              Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Information */}
      {platformInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-medium text-gray-700">Browser</p>
                <p className="text-lg">{platformInfo.browser} {platformInfo.browserVersion}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Platform</p>
                <p className="text-lg">{platformInfo.platform}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Storage Available</p>
                <Badge className={platformInfo.storageAvailable ? 'bg-green-500' : 'bg-red-500'}>
                  {platformInfo.storageAvailable ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-700">Private Browsing</p>
                <Badge className={platformInfo.isPrivateBrowsing ? 'bg-yellow-500' : 'bg-green-500'}>
                  {platformInfo.isPrivateBrowsing ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {platformInfo.isPWA && (
              <div className="mt-4">
                <Badge className="bg-blue-500">PWA Mode Detected</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Information */}
      {storageInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-medium text-gray-700">Total Quota</p>
                <p className="text-lg">
                  {typeof storageInfo.quota === 'number' 
                    ? `${Math.round(storageInfo.quota / 1024 / 1024)} MB`
                    : storageInfo.quota
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Used</p>
                <p className="text-lg">
                  {typeof storageInfo.usage === 'number' 
                    ? `${Math.round(storageInfo.usage / 1024 / 1024)} MB`
                    : storageInfo.usage
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Available</p>
                <p className="text-lg">
                  {typeof storageInfo.available === 'number' 
                    ? `${Math.round(storageInfo.available / 1024 / 1024)} MB`
                    : storageInfo.available
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Usage %</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg">{storageInfo.usagePercent}%</p>
                  {typeof storageInfo.usagePercent === 'number' && (
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          storageInfo.usagePercent > 80 ? 'bg-red-500' :
                          storageInfo.usagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(storageInfo.usagePercent, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              Test Results ({testResults.type === 'quick' ? 'Quick Test' : 'Full Test Suite'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Test Failed</p>
                <p className="text-red-600">{testResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Summary */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-xl font-bold ${getScoreColor(testResults.score)}`}>
                      {testResults.score}%
                    </div>
                    <p className="mt-2 font-medium">{getScoreText(testResults.score)}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{testResults.passedTests || 0}</p>
                      <p className="text-sm text-gray-600">Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{testResults.failedTests || 0}</p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{testResults.totalTests || 0}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                {testResults.performance && Object.keys(testResults.performance).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Performance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {Object.entries(testResults.performance).map(([test, duration]) => (
                        <div key={test} className="flex justify-between">
                          <span className="capitalize">{test.replace(/_/g, ' ')}:</span>
                          <span className={duration > 100 ? 'text-red-600' : 'text-green-600'}>
                            {duration.toFixed(2)}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors and Warnings */}
                {(testResults.errors > 0 || testResults.warnings > 0) && (
                  <div className="space-y-2">
                    {testResults.errors > 0 && (
                      <Badge className="bg-red-500">
                        {testResults.errors} Error{testResults.errors !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {testResults.warnings > 0 && (
                      <Badge className="bg-yellow-500">
                        {testResults.warnings} Warning{testResults.warnings !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p><strong>Quick Test:</strong> Runs basic storage operations to verify core functionality</p>
          <p><strong>Full Test Suite:</strong> Comprehensive testing including data types, performance, and error handling</p>
          <p><strong>Cleanup Storage:</strong> Removes old/temporary data to free up space</p>
          <p><strong>Debug Info:</strong> Logs detailed storage information to browser console</p>
          <p className="mt-4 p-3 bg-blue-50 rounded">
            <strong>Note:</strong> This component tests the cross-browser localStorage utilities that ensure 
            compatibility across Safari, Chrome, Firefox, Edge, and other browsers, including private browsing modes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageTestComponent;
