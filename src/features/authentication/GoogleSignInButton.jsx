import React, { useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";

// Enhanced iOS Detection Utility
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Check if we're in Safari
const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Check if we're in a PWA context
const isPWAContext = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Check if popup is likely to be blocked
const isPopupBlocked = () => {
  return isIOSDevice() || isPWAContext() || (isIOSDevice() && isSafari());
};

// Check if we're in production
const isProduction = () => {
  return window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1');
};

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag, onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle redirect result on component mount (for iOS)
  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          onLoginStart?.();
          
          const idToken = await result.user.getIdToken();
          await processAuthentication(idToken, onLoginSuccess, onClose);
        }
      } catch (error) {
        console.error('Redirect authentication error:', error);
      } finally {
        setIsLoading(false);
        onLoginComplete?.();
      }
    };

    // Only check for redirect result on iOS or PWA
    if (isPopupBlocked()) {
      handleRedirectResult();
    }
  }, [onLoginSuccess, onClose, onLoginStart, onLoginComplete]);

  const processAuthentication = async (idToken, onLoginSuccess, onClose) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/firebase`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        console.log("Authentication successful");
        await onLoginSuccess({
          token: res.data.token,
          email: res.data.user.email,
          userid: res.data.user.id,
          roles: res.data.user.roles || [res.data.user.role],
          userName: res.data.user.name,
          pictureURL: res.data.user.profilePicUrl,
          flag: res.data.user.registerFlag,
          detailSet: res.data.user.detailSet,
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
      onLoginStart?.(); // Notify parent that login has started
      
      console.log('Authentication attempt:', {
        isIOS: isIOSDevice(),
        isSafari: isSafari(),
        isPWA: isPWAContext(),
        isProduction: isProduction(),
        userAgent: navigator.userAgent
      });
      
      let result;
      
      // Force redirect for iOS Safari (most reliable method)
      if (isIOSDevice() && isSafari()) {
        console.log('Using redirect authentication for iOS Safari');
        await signInWithRedirect(auth, provider);
        return; // Exit early, redirect will handle the rest
      }
      // Use redirect for PWA context
      else if (isPWAContext()) {
        console.log('Using redirect authentication for PWA');
        await signInWithRedirect(auth, provider);
        return; // Exit early, redirect will handle the rest
      }
      // Try popup for other platforms
      else {
        console.log('Using popup authentication for desktop/Android');
        try {
          result = await signInWithPopup(auth, provider);
        } catch (popupError) {
          console.log('Popup failed, falling back to redirect:', popupError);
          // Fallback to redirect if popup fails
          await signInWithRedirect(auth, provider);
          return; // Exit early, redirect will handle the rest
        }
      }
      
      // Process authentication for popup flow
      if (result) {
        const idToken = await result.user.getIdToken();
        await processAuthentication(idToken, onLoginSuccess, onClose);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Enhanced error handling for iOS Safari
      if (isIOSDevice() && isSafari()) {
        console.log('iOS Safari authentication failed, attempting redirect fallback');
        try {
          await signInWithRedirect(auth, provider);
          return; // Exit early, redirect will handle the rest
        } catch (redirectError) {
          console.error('iOS Safari redirect fallback failed:', redirectError);
        }
      }
      
      // Re-throw error for parent component to handle
      throw error;
    } finally {
      setIsLoading(false);
      onLoginComplete?.(); // Notify parent that login process is complete
    }
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
            {isPopupBlocked() ? 'Redirecting to Google...' : 'Signing in...'}
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
