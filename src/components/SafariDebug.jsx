import React from 'react';
import {
  testCookieSupport,
  testHttpOnlyCookieSupport,
  getSafariAuthStrategy,
  getPlatformInfo
} from '@/shared/utils/safariLocalStorage';
import { API_BASE_URL } from '@/shared/services/firebaseConfig';

const SafariDebug = () => {
  const [debugInfo, setDebugInfo] = React.useState({});
  const [isTesting, setIsTesting] = React.useState(false);

  const runTests = async () => {
    setIsTesting(true);
    try {
      const platformInfo = getPlatformInfo();
      const safariStrategy = getSafariAuthStrategy();
      const basicCookieSupport = testCookieSupport();
      const httpOnlySupport = await testHttpOnlyCookieSupport(API_BASE_URL);

      setDebugInfo({
        platformInfo,
        safariStrategy,
        basicCookieSupport,
        httpOnlySupport,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug test failed:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  React.useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4">🍎 Safari Authentication Debug</h2>

      <button
        onClick={runTests}
        disabled={isTesting}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Run Tests'}
      </button>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Platform Info:</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo.platformInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Safari Strategy:</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo.safariStrategy, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Cookie Support:</h3>
          <p>Basic Cookies: {debugInfo.basicCookieSupport ? '✅' : '❌'}</p>
          <p>HTTP-Only Cookies: {debugInfo.httpOnlySupport ? '✅' : '❌'}</p>
        </div>

        {debugInfo.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafariDebug;
