import React, { useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider, handleAuthError, detectPlatform } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";

// Enhanced Cross-Platform Detection Utilities
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isAndroidDevice = () => {
  return /Android/.test(navigator.userAgent);
};

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
};

const isFirefox = () => {
  return /Firefox/.test(navigator.userAgent);
};

const isInternetExplorer = () => {
  return /MSIE|Trident/.test(navigator.userAgent);
};

const isEdge = () => {
  return /Edge/.test(navigator.userAgent);
};

// Enhanced PWA context detection
const isPWAContext = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         window.location.search.includes('source=pwa') ||
         document.referrer.includes('android-app://');
};

// Cross-platform authentication strategy
const getAuthStrategy = () => {
  const platform = detectPlatform();
  const isPWA = isPWAContext();
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  // Platform-specific strategies
  switch (platform) {
    case 'ie':
      // Internet Explorer - use redirect only
      return {
        primary: 'redirect',
        fallback: 'redirect',
        reason: 'IE has limited popup support'
      };
    
    case 'safari':
      if (isIOS) {
        // iOS Safari - redirect is most reliable
        return {
          primary: 'redirect',
          fallback: 'redirect',
          reason: 'iOS Safari has popup restrictions'
        };
      } else {
        // macOS Safari - try popup first, fallback to redirect
        return {
          primary: 'popup',
          fallback: 'redirect',
          reason: 'macOS Safari popup support varies'
        };
      }
    
    case 'firefox':
      // Firefox - popup works well, redirect as fallback
      return {
        primary: 'popup',
        fallback: 'redirect',
        reason: 'Firefox has good popup support'
      };
    
    case 'pwa':
      // PWA contexts - redirect is most reliable
      return {
        primary: 'redirect',
        fallback: 'popup',
        reason: 'PWA contexts have popup restrictions'
      };
    
    case 'chrome':
    default:
      // Chrome and Chromium-based browsers - popup first, redirect fallback
      return {
        primary: 'popup',
        fallback: 'redirect',
        reason: 'Chrome has excellent popup support'
      };
  }
};

// Check if we're in production
const isProduction = () => {
  return window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1');
};

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag, onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle redirect result on component mount
  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect result found:', result);
          setIsLoading(true);
          onLoginStart?.();
          
          const idToken = await result.user.getIdToken();
          await processAuthentication(idToken, onLoginSuccess, onClose);
        } else {
          console.log('No redirect result found');
        }
      } catch (error) {
        console.error('Redirect authentication error:', error);
        // Don't throw here, just log the error
      } finally {
        setIsLoading(false);
        onLoginComplete?.();
      }
    };

    // Check for redirect result on all platforms
    handleRedirectResult();
  }, [onLoginSuccess, onClose, onLoginStart, onLoginComplete]);

  const processAuthentication = async (idToken, onLoginSuccess, onClose) => {
    try {
      console.log('Processing authentication with token...');
      const res = await axios.post(
        `${API_BASE_URL}/auth/firebase`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Enable cookies for HTTP-only authentication
          timeout: 15000, // 15 second timeout for cross-platform compatibility
        }
      );

      if (res.status === 200) {
        console.log("Authentication successful:", res.data);
        
        // Handle HTTP-only cookie authentication
        // Since tokens are stored in secure cookies, we don't need to pass token to AuthProvider
        // The backend will handle token validation via cookies
        await onLoginSuccess({
          email: res.data.user.email,
          userid: res.data.user.id,
          roles: res.data.user.roles || [],
          userName: res.data.user.name,
          pictureURL: res.data.user.profilePicUrl,
          flag: res.data.user.registerFlag || false,
          detailSet: res.data.user.detailSet || false,
          hotelId: res.data.user.hotelId,
        });
        
        // Close modal after successful login
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Authentication processing error:', error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      onLoginStart?.();
      
      // Get platform-specific authentication strategy
      const strategy = getAuthStrategy();
      const platform = detectPlatform();
      
      // Enhanced debugging information
      const debugInfo = {
        platform,
        strategy,
        isIOS: isIOSDevice(),
        isAndroid: isAndroidDevice(),
        isSafari: isSafari(),
        isChrome: isChrome(),
        isFirefox: isFirefox(),
        isIE: isInternetExplorer(),
        isEdge: isEdge(),
        isPWA: isPWAContext(),
        isProduction: isProduction(),
        userAgent: navigator.userAgent,
        displayMode: window.matchMedia('(display-mode: standalone)').matches,
        standalone: window.navigator.standalone,
        referrer: document.referrer,
        url: window.location.href
      };
      
      console.log('Cross-platform authentication attempt:', debugInfo);
      
      let result;
      
      // Execute authentication strategy
      if (strategy.primary === 'redirect') {
        console.log(`Using ${strategy.primary} authentication (${strategy.reason})`);
        try {
          await signInWithRedirect(auth, provider);
          return; // Exit early, redirect will handle the rest
        } catch (redirectError) {
          console.error(`${strategy.primary} authentication failed:`, redirectError);
          handleAuthError(redirectError);
          
          // Try fallback if different from primary
          if (strategy.fallback !== strategy.primary) {
            console.log(`Trying fallback: ${strategy.fallback}`);
            if (strategy.fallback === 'popup') {
              try {
                result = await signInWithPopup(auth, provider);
                console.log('Fallback popup authentication successful');
              } catch (popupError) {
                console.error('Fallback popup also failed:', popupError);
                handleAuthError(popupError);
                throw popupError;
              }
            }
          } else {
            throw redirectError;
          }
        }
      } else {
        // Primary strategy is popup
        console.log(`Using ${strategy.primary} authentication (${strategy.reason})`);
        try {
          result = await signInWithPopup(auth, provider);
          console.log('Primary popup authentication successful');
        } catch (popupError) {
          console.log('Primary popup failed, trying fallback:', popupError);
          handleAuthError(popupError);
          
          // Try fallback if different from primary
          if (strategy.fallback !== strategy.primary) {
            console.log(`Trying fallback: ${strategy.fallback}`);
            if (strategy.fallback === 'redirect') {
              try {
                await signInWithRedirect(auth, provider);
                return; // Exit early, redirect will handle the rest
              } catch (redirectError) {
                console.error('Fallback redirect also failed:', redirectError);
                handleAuthError(redirectError);
                throw redirectError;
              }
            }
          } else {
            throw popupError;
          }
        }
      }
      
      // Process authentication for popup flow
      if (result) {
        const idToken = await result.user.getIdToken();
        await processAuthentication(idToken, onLoginSuccess, onClose);
      }
    } catch (error) {
      console.error('Cross-platform authentication error:', error);
      
      // Enhanced cross-platform error handling
      const platform = detectPlatform();
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          console.log(`User closed popup on ${platform}`);
          if (platform === 'ie' || platform === 'safari') {
            console.log('Redirect may be more reliable for this platform');
          }
          break;
        case 'auth/popup-blocked':
          console.log(`Popup blocked on ${platform}, redirect recommended`);
          break;
        case 'auth/network-request-failed':
          console.log(`Network request failed on ${platform}`);
          break;
        case 'auth/operation-not-allowed':
          console.log(`Operation not allowed on ${platform}`);
          break;
        default:
          console.log(`Other auth error on ${platform}:`, error.code);
      }
      
      // Re-throw error for parent component to handle
      throw error;
    } finally {
      setIsLoading(false);
      onLoginComplete?.();
    }
  };

  // Get loading text based on platform and strategy
  const getLoadingText = () => {
    const strategy = getAuthStrategy();
    const platform = detectPlatform();
    
    if (isLoading) {
      if (strategy.primary === 'redirect') {
        return 'Redirecting to Google...';
      } else {
        return 'Signing in...';
      }
    }
    return 'Continue with Google';
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-5 rounded-xl shadow-md transition duration-200 ease-in-out focus:outline-none border cursor-pointer ${
          isLoading 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "text-black hover:shadow-lg border-transparent hover:border-[#cccccc]"
        }`}
        style={{ color: isLoading ? "#9CA3AF" : "#333333" }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            {getLoadingText()}
          </>
        ) : (
          <>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleSignInButton;
