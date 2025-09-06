import React, { useState } from 'react';
import { csrfDebug } from '@/shared/services/Api';
import api from '@/shared/services/Api';

const CsrfDebugger = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const checkCsrfStatus = () => {
    const info = csrfDebug.checkCsrfStatus();
    setDebugInfo(info);
  };

  const refreshCsrfToken = async () => {
    const info = await csrfDebug.refreshCsrfToken();
    setDebugInfo(info);
  };

  const testPostRequest = async () => {
    try {
      setTestResult('Testing POST request...');
      console.log('🧪 [CSRF TEST] Making test POST request...');
      
      // Make a test POST request to see if CSRF token is working
      const response = await api.post('/auth/test-csrf', {
        test: 'csrf_token_test',
        timestamp: new Date().toISOString()
      });
      
      setTestResult(`✅ Success: ${response.status} - ${response.statusText}`);
      console.log('✅ [CSRF TEST] POST request successful:', response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setTestResult(`❌ Error: ${error.response?.status} - ${errorMsg}`);
      console.error('❌ [CSRF TEST] POST request failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🔒 CSRF Token Debugger</h3>
      
      <div className="space-y-3">
        <button
          onClick={checkCsrfStatus}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Check CSRF Status
        </button>
        
        <button
          onClick={refreshCsrfToken}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Refresh CSRF Token
        </button>
        
        <button
          onClick={testPostRequest}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          Test POST Request
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p><strong>Has Token:</strong> {debugInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Token:</strong> {debugInfo.token ? debugInfo.token.substring(0, 20) + '...' : 'None'}</p>
          <p><strong>Cookies:</strong> {debugInfo.cookies.join(', ')}</p>
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Test Result:</h4>
          <p className={testResult.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {testResult}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Check browser console for detailed logs</p>
        <p>Check Network tab for request headers</p>
      </div>
    </div>
  );
};

export default CsrfDebugger;
