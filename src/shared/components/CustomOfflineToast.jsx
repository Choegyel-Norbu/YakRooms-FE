import React, { useState, useEffect } from 'react';

const CustomOfflineToast = ({ isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 right-8 z-50 max-w-md">
      <div
        className={`
          bg-white border border-gray-200 rounded-2xl backdrop-blur-xl
          transform transition-all duration-700 ease-out shadow-xl
          ${isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-8 opacity-0 scale-95'
          }
        `}
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-semibold text-lg mb-1">
                  No Internet Connection
                </h3>
                <p className="text-gray-600 text-sm">
                  Check your internet connection and try again
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 group ml-4"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Impact Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-700 font-medium">Booking System</p>
                <p className="text-xs text-red-600">Unavailable</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-700 font-medium">Local Data</p>
                <p className="text-xs text-amber-600">Will sync later</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {isOnline ? (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Reconnect Now
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Please check your internet connection</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOfflineToast;