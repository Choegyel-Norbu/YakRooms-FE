import React, { useRef, useState, useEffect } from "react";
import useOutsideClick from "../hooks/useOutsideClick";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "../services/AuthProvider";

const LoginModal = ({ onClose }) => {
  const modalRef = useRef(null);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useOutsideClick(modalRef, onClose);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative"
      >
        {/* Close button (×) */}
        <button
          onClick={onClose}
          className="absolute top-0 right-3 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">Chogyal</h2>
          <p className="text-gray-500 mt-1 text-sm">
            We'll sign you in or create an account if you don't have one yet.
          </p>
        </div>

        {error && (
          <div className="text-red-500 bg-red-100 py-2 px-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="text-emerald-500 bg-emerald-100 py-2 px-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {/* Continue with Google */}
        <GoogleSignInButton onClose={onClose} onLoginSuccess={login} />

        <p className="text-xs text-center text-gray-400 mt-4">
          By signing up or signing in, you agree to our{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
