import React, { useState } from "react";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dialog";
import { CheckCircle, CreditCard, KeyRound } from "lucide-react";
import { toast } from "sonner";
import CIDVerification from "./CIDVerification";
import PasscodeVerification from "./PasscodeVerification";

const METHODS = [
  { key: "cid", label: "CID", icon: CreditCard },
  { key: "passcode", label: "Passcode", icon: KeyRound },
];

const BookingVerificationDialog = ({ isDisabled = false }) => {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("cid");

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (isDisabled) {
            toast.error(
              "Subscription expired. Please renew your subscription to verify bookings.",
              { duration: 6000 }
            );
            return;
          }
          setOpen(true);
        }}
        disabled={isDisabled}
        className="w-auto cursor-pointer"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Verify Booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Booking Verification
            </DialogTitle>
            <DialogDescription>
              {method === "cid"
                ? "Enter the guest's CID number to verify their booking"
                : "Enter the room passcode to verify the guest booking"}
            </DialogDescription>
          </DialogHeader>

          {/* Compact inline verification bar */}
          <div className="space-y-4">
            {/* Segmented method toggle */}
            <div className="inline-flex rounded-lg border bg-muted/50 p-1">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>

            {method === "cid" ? (
              <CIDVerification compact />
            ) : (
              <PasscodeVerification compact />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingVerificationDialog;
