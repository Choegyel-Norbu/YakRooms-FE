import React, { useState } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Alert, AlertDescription } from "@/shared/components/alert";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Bed,
  Clock,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";

const CIDVerification = () => {
  const { hotelId } = useAuth();
  const [cidNumber, setCidNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState("");
  const [checkInMessage, setCheckInMessage] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "default";
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "CHECKED_IN":
        return "default";
      case "CHECKED_OUT":
        return "secondary";
      default:
        return "outline";
    }
  };

  const validateCID = (cid) => {
    const trimmedCid = cid.trim();
    
    // Rule 1: Must be exactly 11 digits
    if (!/^\d{11}$/.test(trimmedCid)) {
      return "CID must be exactly 11 digits";
    }
    
    // Rule 2: Dzongkhag code must be 01–20
    const dzongkhagCode = parseInt(trimmedCid.substring(0, 2), 10);
    if (dzongkhagCode < 1 || dzongkhagCode > 20) {
      return "Invalid Dzongkhag code (must be 01–20)";
    }
    
    // Rule 3: Check if it's not all zeros or all same digits
    if (/^0{11}$/.test(trimmedCid)) {
      return "CID number cannot be all zeros";
    }
    
    if (/^(\d)\1{10}$/.test(trimmedCid)) {
      return "CID number cannot be all same digits";
    }
    
    return null; // Valid CID
  };

  const checkIn = async () => {
    if (!bookingData?.bookingId) {
      setError("No booking data available");
      return;
    }

    setCheckingIn(true);
    setError("");
    setCheckInMessage("");

    try {
      const response = await api.put(
        `/bookings/${bookingData.bookingId}/status/checked_in`
      );

      // Handle the response from ResponseEntity.ok("Booking status updated successfully.")
      if (response.status === 200) {
        // Update the local booking data with new status
        setBookingData((prev) => ({
          ...prev,
          status: "CHECKED_IN",
        }));
        setCheckInMessage("Check-in successful! Guest has been checked in.");

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setCheckInMessage("");
        }, 3000);
      } else {
        setError("Failed to check in");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError("Booking not found");
      } else if (err.response?.status === 400) {
        setError("Invalid status value");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to perform this action");
      } else if (err.response?.status === 409) {
        setError("Cannot check in. The booking may be in an invalid state.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const verifyCID = async (e) => {
    e.preventDefault();

    if (!cidNumber.trim()) {
      setError("Please enter a CID number");
      return;
    }

    if (!hotelId) {
      setError("Hotel ID not available. Please refresh the page.");
      return;
    }

    // Validate CID format
    const cidError = validateCID(cidNumber);
    if (cidError) {
      setError(cidError);
      return;
    }

    setLoading(true);
    setError("");
    setBookingData(null);

    try {
      const response = await api.get(
        `/passcode/verify-by-cid?cid=${encodeURIComponent(cidNumber.trim())}&hotelId=${hotelId}`
      );
      const data = response.data;

      if (data.valid) {
        setBookingData(data);
        setCidNumber("");
      } else {
        setError(data.message || "No booking found for this CID number");
      }
    } catch (err) {
      console.error("CID verification error:", err);
      if (err.response?.status === 404) {
        setError("No booking found for this CID number");
      } else if (err.response?.status === 400) {
        setError("Invalid CID number format");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCidNumber("");
    setError("");
    setBookingData(null);
  };

  const handleCIDChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 11) {
      setCidNumber(value);
    }
  };

  return (
    <div className="h-auto w-full flex items-center justify-center sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Verification Form */}
        {!bookingData && (
          <Card className="w-full">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg text-center">
                CID Number Verification
              </CardTitle>
              <CardDescription className="text-center text-sm">
                Enter the guest's CID number to verify their booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Enter CID number (e.g., 10901001065)"
                    value={cidNumber}
                    onChange={handleCIDChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        verifyCID(e);
                      }
                    }}
                    className="text-center text-sm font-mono tracking-widest h-10"
                    maxLength={11}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    11-digit Bhutanese CID number
                  </p>
                </div>

                <Button
                  onClick={verifyCID}
                  className="w-full h-9 text-sm"
                  disabled={loading || !cidNumber.trim() || cidNumber.length !== 11}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Verify CID
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center text-sm">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="ml-4 text-xs"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Update Message */}
        {checkInMessage && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {checkInMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Booking Details */}
        {bookingData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                {bookingData.message}
              </AlertDescription>
            </Alert>

            <Card className="w-full">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Booking Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(bookingData.status)}
                      className="text-xs px-2 py-1"
                    >
                      {bookingData.status}
                    </Badge>
                    {checkingIn && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Booking ID: #{bookingData.bookingId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Information */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Guest Information</h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Guest Name
                        </p>
                        <p className="text-sm font-medium truncate">
                          {bookingData.guestName}
                        </p>
                      </div>
                    </div>
                    
                    {bookingData.cid && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            CID Number
                          </p>
                          <p className="text-sm font-medium font-mono">
                            {bookingData.cid}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Accommodation Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Hotel</p>
                          <p className="text-sm font-medium truncate">
                            {bookingData.hotelName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Bed className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Room Number
                          </p>
                          <p className="text-sm font-medium">
                            Room {bookingData.roomNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Stay Duration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Check-in Date
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(bookingData.checkInDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Check-out Date
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(bookingData.checkOutDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Booking Information
                    </h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Booking Created
                        </p>
                        <p className="text-sm font-medium">
                          {formatDateTime(bookingData.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  <Separator />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 h-9 text-sm"
                      disabled={checkingIn}
                    >
                      Verify Another CID
                    </Button>
                    <Button
                      className="flex-1 h-9 text-sm"
                      onClick={checkIn}
                      disabled={
                        checkingIn || bookingData?.status === "CHECKED_IN"
                      }
                    >
                      {checkingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking In...
                        </>
                      ) : bookingData?.status === "CHECKED_IN" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Checked In
                        </>
                      ) : (
                        "Check in"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CIDVerification;
