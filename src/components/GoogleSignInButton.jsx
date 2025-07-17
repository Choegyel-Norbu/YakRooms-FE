import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../config/firebaseConfig";
import axios from "axios";
import API_BASE_URL from "../../config";

const GoogleSignInButton = ({ onLoginSuccess, onClose, flag }) => {
  const [message, setMessage] = useState("");
  const handleGoogleSignIn = async () => {
    try {
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
        onLoginSuccess({
          token: res.data.token,
          email: res.data.user.email,
          userid: res.data.user.id,
          role: res.data.user.role,
          userName: res.data.user.name,
          pictureURL: res.data.user.pictureURL,
          flag: res.data.user.registerFlag,
          detailSet: res.data.user.detailSet,
          hotelId: res.data.user.hotelId,
          flag,
        });
        onClose();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center cursor-pointer justify-center gap-2 text-black text-sm font-medium py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out focus:outline-none border border-transparent hover:border-[#cccccc]"
      style={{ color: "#333333" }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </button>
  );
};

export default GoogleSignInButton;
