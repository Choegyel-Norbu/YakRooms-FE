import React, { useState, useEffect } from 'react';
import { HiWifi, HiSignalSlash } from 'react-icons/hi2';
import { HiXMark } from 'react-icons/hi2';

const CustomOfflineToast = ({ isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    <div className="fixed top-6 right-6 z-50 max-w-sm">
      <div
        className={`
          bg-white border border-gray-200 rounded-xl shadow-2xl backdrop-blur-sm
          transform transition-all duration-500 ease-out
          ${isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
        `}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <HiSignalSlash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Connection Lost
                </h4>
                <p className="text-white/80 text-xs">
                  Yakrooms is offline
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors duration-200 group"
              aria-label="Close notification"
            >
              <HiXMark className="w-4 h-4 text-white/80 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                You're currently offline. Hotel bookings and real-time features are temporarily unavailable.
              </p>
              
              {/* Status indicators */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-500">Booking system unavailable</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-500">Local data will be synced when online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reconnection status */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-500">Attempting to reconnect...</span>
            </div>
            
            {isOnline && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Refresh now
              </button>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-b-xl">
          <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 animate-pulse rounded-b-xl opacity-70"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomOfflineToast;