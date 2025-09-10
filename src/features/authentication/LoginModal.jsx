import React, { useRef, useState, useEffect } from "react";
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
import { YakRoomsText } from "@/shared/components";

const LoginModal = ({ onClose, flag }) => {
  const modalRef = useRef(null);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authType, setAuthType] = useState(null); // 'popup' or 'redirect'
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useOutsideClick(modalRef, isLoggingIn ? () => {} : onClose);

  const handleLoginStart = (type = 'popup') => {
    setIsLoggingIn(true);
    setAuthType(type);
    setError("");
    setMessage("");
    
    // Set appropriate message based on auth type
    if (type === 'redirect') {
      setMessage("Redirecting to Google for secure authentication...");
    } else {
      setMessage("Opening Google sign-in...");
    }
  };

  const handleLoginComplete = () => {
    setIsLoggingIn(false);
    setAuthType(null);
    setMessage("");
  };

  const handleLoginSuccess = async (authData) => {
    try {
      await login(authData);
      setMessage("Login successful! Redirecting...");
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
    }
  };

  // Countdown effect for redirect authentication
  useEffect(() => {
    let interval;
    if (authType === 'redirect' && isLoggingIn && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            setMessage("Redirecting now...");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authType, isLoggingIn, redirectCountdown]);

  // Reset countdown when auth type changes
  useEffect(() => {
    if (authType === 'redirect') {
      setRedirectCountdown(5);
    }
  }, [authType]);

  return (
    <Dialog open={true} onOpenChange={isLoggingIn ? () => {} : onClose}>
      <DialogContent 
        ref={modalRef}
        className="sm:max-w-md w-full p-0 gap-0"
      >
        {/* Custom close button to match original design */}
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
              <YakRoomsText size="default" />
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {isLoggingIn && authType === 'redirect' ? (
                "Please wait while we redirect you to Google for secure authentication..."
              ) : (
                "We'll sign you in or create an account if you don't have one yet."
              )}
              
              {/* Show platform-specific guidance */}
              {!isLoggingIn && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">
                    📱 iPhone/iPad Users:
                  </p>
                  <p className="text-xs text-blue-700">
                    You'll be redirected to Google for secure authentication. 
                    After signing in, you'll return to YakRooms automatically.
                  </p>
                </div>
              )}
              
              {/* Show redirect guidance during authentication */}
              {isLoggingIn && authType === 'redirect' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-xs font-medium mb-1">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Secure Authentication in Progress
                  </div>
                  <p className="text-xs text-blue-700">
                    📱 Your browser will open Google's secure login page. Sign in there and you'll return here automatically.
                  </p>
                </div>
              )}
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
              <Alert className={`${
                authType === 'redirect' && isLoggingIn
                  ? "border-blue-200 bg-blue-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}>
                <AlertDescription className={`text-sm ${
                  authType === 'redirect' && isLoggingIn
                    ? "text-blue-700"
                    : "text-emerald-600"
                }`}>
                  <div className="flex items-center gap-2">
                    {isLoggingIn && authType === 'redirect' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Redirecting to Google...</span>
                      </div>
                    )}
                    {isLoggingIn && authType === 'popup' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>{message}</span>
                      </div>
                    )}
                    {!isLoggingIn && (
                      <span>{message}</span>
                    )}
                  </div>
                  {authType === 'redirect' && isLoggingIn && redirectCountdown > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      <div className="flex items-center justify-between">
                        <span>You'll be redirected in {redirectCountdown} seconds...</span>
                        <div className="w-16 bg-blue-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${((5 - redirectCountdown) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="mt-1 text-blue-500">
                        After signing in with Google, you'll return to YakRooms automatically.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <GoogleSignInButton 
              onClose={onClose} 
              onLoginSuccess={handleLoginSuccess}
              onLoginStart={handleLoginStart}
              onLoginComplete={handleLoginComplete}
              flag={flag}
            />

            <p className="text-xs text-center text-muted-foreground">
              By signing up or signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;