// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpztRaIhsRMisykJgEZD_d0HDnIuKxyKw",
  authDomain: "yakrooms.firebaseapp.com",
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
  console.error('Firebase Auth Error:', error);
  
  const platform = detectPlatform();
  console.log(`Platform detected: ${platform}`);
  
  // Platform-specific error handling
  switch (platform) {
    case 'ie':
      console.log('Internet Explorer detected - limited auth features');
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('IE popup closed, redirect may be more reliable');
      }
      break;
    case 'safari':
      console.log('Safari detected - using Safari-specific handling');
      if (error.code === 'auth/popup-blocked') {
        console.log('Safari popup blocked, redirect required');
      }
      break;
    case 'firefox':
      console.log('Firefox detected - Firefox-specific handling');
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Firefox popup closed');
      }
      break;
    case 'pwa':
      console.log('PWA context detected - PWA-specific handling');
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          console.log('PWA popup closed, redirect recommended');
          break;
        case 'auth/popup-blocked':
          console.log('PWA popup blocked, redirect required');
          break;
        case 'auth/network-request-failed':
          console.log('PWA network request failed');
          break;
        default:
          console.log('Other PWA auth error:', error.code);
      }
      break;
    default:
      console.log('Chrome/Chromium detected - standard handling');
  }
  
  return error;
};

// Cross-platform auth state persistence
const configureAuthPersistence = () => {
  const platform = detectPlatform();
  
  // Different persistence strategies per platform
  switch (platform) {
    case 'ie':
      // IE has limited persistence support
      console.log('IE detected - using basic persistence');
      break;
    case 'safari':
      // Safari needs special handling for private browsing
      console.log('Safari detected - checking private browsing mode');
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('Safari localStorage available');
      } catch (e) {
        console.log('Safari private browsing detected');
      }
      break;
    case 'firefox':
      // Firefox has good persistence support
      console.log('Firefox detected - standard persistence');
      break;
    case 'pwa':
      // PWA persistence varies by platform
      console.log('PWA detected - enhanced persistence handling');
      break;
    default:
      console.log('Chrome detected - standard persistence');
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
  const developmentUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const productionUrl = import.meta.env.VITE_API_BASE_URL || "ezeeroom-be-production-9820.up.railway.app";
  
  // Force production URL for PWA installations and mobile contexts
  if (isPWA || !isDevelopment) {
    console.log('🌐 Using production API URL for cross-platform compatibility');
    return productionUrl;
  }
  
  console.log('🔧 Using development API URL');
  return developmentUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Debug helper for PWA registration and mobile debugging
if (typeof window !== 'undefined') {
  window.API_DEBUG_URL = API_BASE_URL;
  console.log('🔗 API Base URL configured:', API_BASE_URL);
}

export { auth, provider, API_BASE_URL, handleAuthError, detectPlatform };
