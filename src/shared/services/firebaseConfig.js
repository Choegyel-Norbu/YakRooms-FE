// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpztRaIhsRMisykJgEZD_d0HDnIuKxyKw",
  authDomain: "ezeeroom.bt",
  projectId: "yakrooms",
  storageBucket: "yakrooms.appspot.com",
  messagingSenderId: "165341953510",
  appId: "1:165341953510:web:e85c4b7fa8d584e8ee2a27",
  measurementId: "G-C7PMXXLLVL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Cross-platform provider configuration
provider.addScope('email');
provider.addScope('profile');
provider.addScope('openid');

// Platform-specific provider settings
const platformConfig = {
  // Internet Explorer compatibility
  ie: {
    prompt: 'select_account',
    // IE doesn't support modern auth features well
    auth_type: 'signin'
  },
  // Safari (iOS and macOS)
  safari: {
    prompt: 'select_account',
    // Safari-specific settings for better compatibility
    auth_type: 'reauthenticate'
  },
  // Firefox
  firefox: {
    prompt: 'select_account',
    // Firefox-specific settings
    auth_type: 'signin'
  },
  // Chrome and Chromium-based browsers
  chrome: {
    prompt: 'select_account',
    // Chrome supports all modern features
    auth_type: 'reauthenticate'
  },
  // PWA contexts
  pwa: {
    prompt: 'select_account',
    // PWA-specific settings for better redirect handling
    auth_type: 'reauthenticate'
  }
};

// Detect platform and apply appropriate settings
const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true ||
                document.referrer.includes('android-app://');

  if (isPWA) return 'pwa';
  if (userAgent.includes('msie') || userAgent.includes('trident')) return 'ie';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('chrome')) return 'chrome';
  
  return 'chrome'; // Default fallback
};

const currentPlatform = detectPlatform();
const platformSettings = platformConfig[currentPlatform] || platformConfig.chrome;

// Apply platform-specific settings
provider.setCustomParameters(platformSettings);

// Enhanced error handling for cross-platform compatibility
const handleAuthError = (error) => {
  return error;
};

// Cross-platform auth state persistence
const configureAuthPersistence = () => {
  const platform = detectPlatform();
  
  // Different persistence strategies per platform
  switch (platform) {
    case 'safari':
      // Safari needs special handling for private browsing
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch (e) {
        // Private browsing mode detected
      }
      break;
    default:
      // Standard persistence for other platforms
      break;
  }
};

// Initialize platform-specific configurations
configureAuthPersistence();

// API configuration - Environment-based URL selection
const getApiBaseUrl = () => {
  // Check if we're in development environment
  const isDevelopment = import.meta.env.DEV || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  // Check if running in PWA mode (installed app)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true ||
                document.referrer.includes('android-app://');
  
  // Use environment variable if available, otherwise use defaults
  const developmentUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
  const productionUrl = import.meta.env.VITE_API_BASE_URL || "https://ezeeroom-production.up.railway.app";
  
  // Force production URL for PWA installations and mobile contexts
  if (isPWA || !isDevelopment) {
    return productionUrl;
  }
  
  return developmentUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Debug helper for PWA registration and mobile debugging
if (typeof window !== 'undefined') {
  window.API_DEBUG_URL = API_BASE_URL;
}

export { auth, provider, API_BASE_URL, handleAuthError, detectPlatform };
