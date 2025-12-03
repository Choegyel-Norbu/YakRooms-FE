import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useOutsideClick from "../../shared/hooks/useOutsideClick";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "./AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components";
import { Button } from "@/shared/components";
import { Alert, AlertDescription } from "@/shared/components";
import { X } from "lucide-react";
import logoER from "@/assets/images/logoER.png";

const LoginModal = ({ onClose, flag }) => {
  const modalRef = useRef(null);
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useOutsideClick(modalRef, isLoggingIn ? () => {} : onClose);

  const handleLoginStart = () => {
    setIsLoggingIn(true);
    setError("");
    setMessage("");
  };

  const handleLoginComplete = () => {
    setIsLoggingIn(false);
  };

  const handleLoginSuccess = async (authData) => {
    try {
      await login(authData);
      setMessage("Login successful!");
    } catch (error) {
      setError("Login failed. Please try again.");
      
    }
  };

  return (
    <Dialog open={true} onOpenChange={isLoggingIn ? () => {} : onClose}>
      <DialogContent 
        ref={modalRef}
        className="sm:max-w-md w-full p-0 gap-0"
      >
        <Button
          onClick={onClose}
          disabled={isLoggingIn}
          variant="ghost"
          size="icon"
          className={`absolute right-2 top-2 h-8 w-8 rounded-full ${
            isLoggingIn ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="p-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-center">
              <div className="flex justify-center items-center">
                <img 
                  src={logoER} 
                  alt="EzeeRoom Logo" 
                  className="h-8 w-auto"
                />
              </div>
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              We'll sign you in or create an account if you don't have one yet.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-emerald-200 block text-center">
              <AlertDescription className="block text-sm text-emerald-600 text-center w-full col-start-1 col-span-2">
                {message}
              </AlertDescription>
            </Alert>
            )}

            {!isAuthenticated && (
              <GoogleSignInButton 
                onClose={onClose} 
                onLoginSuccess={handleLoginSuccess}
                onLoginStart={handleLoginStart}
                onLoginComplete={handleLoginComplete}
                flag={flag}
              />
            )}

            <p className="text-xs text-center text-muted-foreground">
              By signing up or signing in, you agree to our{" "}
              <Link to="/terms-and-conditions" className="text-primary hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;