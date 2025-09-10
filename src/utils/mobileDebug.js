/**
 * Mobile Authentication Debug Helper
 * Provides comprehensive debugging information for mobile authentication issues
 */

import { isMobileDevice, isPWAContext, API_BASE_URL } from '@/shared/services/firebaseConfig';

export const getMobileDebugInfo = () => {
  const info = {
    // Device Detection
    device: {
      isMobile: isMobileDevice(),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    },

    // PWA Detection
    pwa: {
      isPWAContext: isPWAContext(),
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      standalone: window.navigator.standalone,
      installPromptAvailable: 'beforeinstallprompt' in window,
      referrer: document.referrer
    },

    // Network Information
    network: {
      online: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : 'Not available',
      protocol: window.location.protocol
    },

    // Browser Capabilities
    capabilities: {
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof(Storage) !== "undefined",
      sessionStorage: typeof(sessionStorage) !== "undefined",
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      touchEvents: 'ontouchstart' in window,
      orientationChange: 'onorientationchange' in window
    },

    // API Configuration
    api: {
      baseUrl: API_BASE_URL,
      debugUrl: window.API_DEBUG_URL,
      environment: import.meta.env.DEV ? 'development' : 'production',
      hostname: window.location.hostname,
      port: window.location.port,
      fullUrl: window.location.href
    },

    // Authentication State
    auth: {
      hasAuthData: Boolean(localStorage.getItem('userId')),
      lastAuthCheck: localStorage.getItem('lastAuthCheck'),
      activeRole: localStorage.getItem('activeRole'),
      cookieString: document.cookie ? 'Present' : 'None'
    }
  };

  return info;
};

export const logMobileDebugInfo = () => {
  const info = getMobileDebugInfo();
  
  console.group('🔍 Mobile Authentication Debug Information');
  console.log('📱 Device Info:', info.device);
  console.log('🚀 PWA Info:', info.pwa);
  console.log('🌐 Network Info:', info.network);
  console.log('🔧 Browser Capabilities:', info.capabilities);
  console.log('🔗 API Configuration:', info.api);
  console.log('🔐 Authentication State:', info.auth);
  console.groupEnd();

  return info;
};

export const testMobileAuthentication = async () => {
  console.group('🧪 Mobile Authentication Test');
  
  try {
    // Test API connectivity
    console.log('Testing API connectivity...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('API Health Check:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Test authentication endpoint
    console.log('Testing auth status endpoint...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Auth Status Check:', {
      status: authResponse.status,
      statusText: authResponse.statusText,
      headers: Object.fromEntries(authResponse.headers.entries())
    });

  } catch (error) {
    console.error('Mobile Authentication Test Error:', error);
  }
  
  console.groupEnd();
};

// Make functions available globally for manual testing
if (typeof window !== 'undefined') {
  window.getMobileDebugInfo = getMobileDebugInfo;
  window.logMobileDebugInfo = logMobileDebugInfo;
  window.testMobileAuthentication = testMobileAuthentication;
}

export default {
  getMobileDebugInfo,
  logMobileDebugInfo,
  testMobileAuthentication
};
