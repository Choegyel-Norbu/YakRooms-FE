import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";
import { shouldUseCrossDomainAuth, getAuthEndpoint, getAuthMethodDescription, shouldUseCredentials } from "../../shared/utils/authDetection";
import { storeTokens } from "../../shared/utils/tokenStorage";

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag, onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const processAuthentication = async (idToken, onLoginSuccess, onClose) => {
    try {
      const useCrossDomain = shouldUseCrossDomainAuth();
      const authEndpoint = getAuthEndpoint();
      
      // Use helper function to determine if credentials should be sent
      // macOS Safari supports SameSite=None; Secure cookies even in cross-domain
      // iOS devices need localStorage tokens for cross-domain (no credentials)
      const useCredentials = shouldUseCredentials();
      
      const res = await axios.post(
        `${API_BASE_URL}${authEndpoint}`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: useCredentials,
          timeout: 15000,
        }
      );

      if (res.status === 200) {
        // Handle cross-domain auth response (with token) - only for iOS devices
        // macOS Safari uses cookies even in cross-domain, so it won't receive tokens
        // Backend now sends a single 'token' field (or 'accessToken' for backward compatibility)
        const token = res.data.token || res.data.accessToken;
        
        if (useCrossDomain && token) {
          const tokenStored = storeTokens({
            token: token
          });
          
          if (!tokenStored) {
            throw new Error('Failed to store authentication token');
          }
        }
        
        // Pass user data to AuthProvider (same for both flows)
        await onLoginSuccess({
          email: res.data.user.email,
          userid: res.data.user.id,
          roles: res.data.user.roles || [],
          userName: res.data.user.name,
          pictureURL: res.data.user.profilePicUrl,
          flag: res.data.user.registerFlag || false,
          detailSet: res.data.user.detailSet || false,
          hotelIds: res.data.user.hotelIds || (res.data.user.hotelId ? [res.data.user.hotelId] : []),
          authMethod: useCrossDomain ? 'localStorage' : 'cookie',
        });
        
        // Close modal after successful login
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      onLoginStart?.();
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await processAuthentication(idToken, onLoginSuccess, onClose);
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
      onLoginComplete?.();
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
            Signing in...
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
