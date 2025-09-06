import React, { useState } from 'react';
import api from '@/shared/services/Api';

const CsrfTest = () => {
  const [result, setResult] = useState('');

  const testCsrfToken = () => {
    // Test the getCsrfToken function directly
    const cookies = document.cookie.split(';');
    const csrfCookieNames = [
      'XSRF-TOKEN',
      'XSRF_TOKEN', 
      'CSRF-TOKEN',
      'CSRF_TOKEN',
      '_csrf',
      'csrfToken'
    ];
    
    let foundToken = null;
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      const cookieName = name.trim();
      
      if (csrfCookieNames.includes(cookieName)) {
        foundToken = decodeURIComponent(value);
        break;
      }
    }
    
    setResult(`CSRF Token Found: ${foundToken || 'None'}`);
    console.log('🔍 [CSRF TEST] Direct cookie check:', {
      cookies: cookies.map(c => c.trim().split('=')[0]),
      foundToken: foundToken
    });
  };

  const testApiRequest = async () => {
    try {
      setResult('Making test request...');
      console.log('🧪 [CSRF TEST] Making test POST request...');
      
      // This should trigger the interceptor and show CSRF token handling
      const response = await api.post('/auth/test-csrf', {
        test: 'csrf_token_test',
        timestamp: new Date().toISOString()
      });
      
      setResult(`✅ Success: ${response.status}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setResult(`❌ Error: ${error.response?.status} - ${errorMsg}`);
      console.error('❌ [CSRF TEST] Request failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-lg font-semibold mb-3">🔒 CSRF Test</h3>
      
      <div className="space-y-2">
        <button
          onClick={testCsrfToken}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Check CSRF Token
        </button>
        
        <button
          onClick={testApiRequest}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Test API Request
        </button>
      </div>

      {result && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
          {result}
        </div>
      )}
    </div>
  );
};

export default CsrfTest;
