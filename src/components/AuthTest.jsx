import React, { useState } from 'react';
import api from '@/shared/services/Api';
import { useAuth } from '@/features/authentication';

const AuthTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userId, isAuthenticated } = useAuth();

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log('=== TESTING AUTHENTICATION ===');
      console.log('Is Authenticated:', isAuthenticated);
      console.log('User ID:', userId);
      console.log('Cookies:', document.cookie);
      
      const response = await api.get('/auth/me');
      console.log('✅ Auth test successful:', response.data);
      
      setResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      console.log('❌ Auth test failed:', error.response?.status, error.response?.data);
      setResult({
        success: false,
        error: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const testBookings = async () => {
    if (!userId) {
      setResult({
        success: false,
        error: 'No user ID available'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== TESTING BOOKINGS ===');
      console.log('User ID:', userId);
      
      const response = await api.get(`/bookings/user/${userId}`, {
        params: {
          page: 0,
          size: 5
        }
      });
      
      console.log('✅ Bookings test successful:', response.data);
      
      setResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      console.log('❌ Bookings test failed:', error.response?.status, error.response?.data);
      setResult({
        success: false,
        error: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">🔐 Authentication Test</h3>
      
      <div className="space-y-4">
        <div>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User ID:</strong> {userId || 'None'}</p>
          <p><strong>Cookies:</strong> {document.cookie || 'None'}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={testAuth}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Test Auth
          </button>
          <button
            onClick={testBookings}
            disabled={loading || !userId}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Test Bookings
          </button>
        </div>

        {result && (
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Result:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;
