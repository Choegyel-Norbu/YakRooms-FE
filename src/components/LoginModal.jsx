import React, { useRef, useState, useEffect } from "react";
import useOutsideClick from "../hooks/useOutsideClick";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "../services/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

// YakRooms Text Logo Component
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    // Optimized mobile-first text sizes
    small: "text-lg font-semibold",
    default: "text-xl font-semibold",
    large: "text-2xl font-semibold"
  };

  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const LoginModal = ({ onClose, flag }) => {
  const modalRef = useRef(null);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useOutsideClick(modalRef, onClose);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef}
        className="sm:max-w-md w-full p-0 gap-0"
      >
        {/* Custom close button to match original design */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full"
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
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription className="text-sm text-emerald-600">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <GoogleSignInButton 
              onClose={onClose} 
              onLoginSuccess={login} 
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