import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../shared/services/firebaseConfig";
import axios from "axios";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag, onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      onLoginStart?.(); // Notify parent that login has started
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

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
        console.log("Success");
        await onLoginSuccess({
          token: res.data.token,
          email: res.data.user.email,
          userid: res.data.user.id,
          roles: res.data.user.roles || [res.data.user.role], // Handle both roles array and single role
          userName: res.data.user.name,
          pictureURL: res.data.user.profilePicUrl,
          flag: res.data.user.registerFlag,
          detailSet: res.data.user.detailSet,
          hotelId: res.data.user.hotelId,
        });
        
        // Close modal after successful login
        setTimeout(() => {
          onClose();
        }, 1000); // Close after 1 second
      }
    } catch (error) {
      console.log(error.message);
      // Error handling is now managed by the parent LoginModal
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
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-5 rounded-xl shadow-md transition duration-200 ease-in-out focus:outline-none border ${
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
