import React, { useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";

// iOS Detection Utility
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Check if we're in a PWA context
const isPWAContext = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Check if popup is likely to be blocked
const isPopupBlocked = () => {
  return isIOSDevice() || isPWAContext();
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
      
      let result;
      
      // Use redirect for iOS/PWA, popup for others
      if (isPopupBlocked()) {
        console.log('Using redirect authentication for iOS/PWA');
        await signInWithRedirect(auth, provider);
        // Note: The actual authentication will be handled in the useEffect above
        // when the user returns from the redirect
        return; // Exit early, redirect will handle the rest
      } else {
        console.log('Using popup authentication for desktop/Android');
        result = await signInWithPopup(auth, provider);
      }
      
      // Process authentication for popup flow
      if (result) {
        const idToken = await result.user.getIdToken();
        await processAuthentication(idToken, onLoginSuccess, onClose);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // If popup fails and we're not on iOS, try redirect as fallback
      if (!isIOSDevice() && error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, falling back to redirect');
        try {
          await signInWithRedirect(auth, provider);
          return; // Exit early, redirect will handle the rest
        } catch (redirectError) {
          console.error('Redirect fallback failed:', redirectError);
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
