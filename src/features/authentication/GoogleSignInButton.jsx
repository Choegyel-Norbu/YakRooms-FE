import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";
import { shouldUseCrossDomainAuth, getAuthEndpoint, getAuthMethodDescription } from "../../shared/utils/authDetection";
import { storeTokens } from "../../shared/utils/tokenStorage";

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag, onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const processAuthentication = async (idToken, onLoginSuccess, onClose) => {
    try {
      const useCrossDomain = shouldUseCrossDomainAuth();
      const authEndpoint = getAuthEndpoint();
      
      console.log('🔑 Processing authentication:', getAuthMethodDescription());
      
      const res = await axios.post(
        `${API_BASE_URL}${authEndpoint}`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: !useCrossDomain, // Only send cookies for same-domain
          timeout: 15000,
        }
      );

      if (res.status === 200) {
        console.log("✅ Authentication successful:", res.data);
        
        // Handle cross-domain auth response (with tokens)
        if (useCrossDomain && res.data.accessToken && res.data.refreshToken) {
          console.log('📱 iOS Safari cross-domain: Storing tokens in localStorage');
          
          const tokenStored = storeTokens({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            accessTokenExpiresIn: res.data.accessTokenExpiresIn,
            refreshTokenExpiresIn: res.data.refreshTokenExpiresIn
          });
          
          if (!tokenStored) {
            throw new Error('Failed to store authentication tokens');
          }
          
          if (res.data.warning) {
            console.warn('⚠️ Backend warning:', res.data.warning);
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
          authMethod: useCrossDomain ? 'localStorage' : 'cookie', // Add auth method info
        });
        
        // Close modal after successful login
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Authentication processing error:', error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      onLoginStart?.();
      
      console.log('Starting Google popup authentication...');
      
      const result = await signInWithPopup(auth, provider);
      console.log('Google popup authentication successful');
      
      const idToken = await result.user.getIdToken();
      await processAuthentication(idToken, onLoginSuccess, onClose);
      
    } catch (error) {
      console.error('Google authentication error:', error);
      
      // Simple error handling
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          console.log('User closed popup');
          break;
        case 'auth/popup-blocked':
          console.log('Popup blocked by browser');
          break;
        case 'auth/network-request-failed':
          console.log('Network request failed');
          break;
        default:
          console.log('Authentication error:', error.code);
      }
      
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
