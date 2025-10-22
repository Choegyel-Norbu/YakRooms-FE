import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
  Eye,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
  Hotel,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Navigation,
  ExternalLink,
  Home,
  CalendarPlus,
  RefreshCw,
  Bell,
  Star,
  MessageCircle,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Separator } from "@/shared/components/separator";
import { Button } from "@/shared/components/button";
import { Link } from "react-router-dom";
import api from "../../shared/services/Api";
import { useAuth } from "../authentication";
import { handlePaymentRedirect } from "../../shared/utils/paymentRedirect";
import { toast } from "sonner";
import { CustomDatePicker } from "../../shared/components";
import AuthTest from "../../components/AuthTest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";
import HotelReviewSheet from "../hotel/HotelReviewSheet";

// Number formatting function
const formatCurrency = (amount) => {
  return `Nu. ${amount.toLocaleString("en-IN")} /-`;
};

// Calculate extension days function
const calculateExtensionDays = (booking) => {
  if (!booking.extension || !booking.extendedAmount) {
    return 0;
  }
  
  // Calculate original nights
  const originalCheckIn = new Date(booking.checkInDate);
  const originalCheckOut = new Date(booking.checkOutDate);
  const originalNights = Math.ceil((originalCheckOut - originalCheckIn) / (1000 * 60 * 60 * 24));
  
  // Calculate original price per night
  const originalPricePerNight = booking.totalPrice / originalNights;
  
  // Calculate extension nights based on extended amount
  const extensionNights = Math.round(booking.extendedAmount / originalPricePerNight);
  
  return extensionNights;
};

// Status configuration
const statusConfig = {
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
    actions: ["view", "directions", "extend", "cancel"],
  },
  CANCELLATION_REQUESTED: {
    label: "Cancellation Requested",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: AlertCircle,
    actions: ["view", "directions"],
  },
  CANCELLATION_REJECTED: {
    label: "Cancellation Rejected",
    color: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: CheckCircle,
    actions: ["view", "directions", "extend"],
  },
  BOOKING_CANCELLATION_APPROVED: {
    label: "Cancellation Approved",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
    actions: ["view", "directions"],
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
    actions: ["view", "directions"],
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
    actions: ["view", "directions"],
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: CheckCircle,
    actions: ["view", "directions"],
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: CheckCircle,
    actions: ["view", "directions", "extend", "review"],
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: CheckCircle,
    actions: ["view", "directions", "review"],
  },
};

// Loading skeleton component
const BookingCardSkeleton = () => (
  <div className="bg-card rounded-lg border p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-48"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
      </div>
      <div className="h-6 bg-muted rounded w-20"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-9 bg-muted rounded w-20"></div>
      <div className="h-9 bg-muted rounded w-20"></div>
    </div>
  </div>
);

// Extension visual feedback component
const ExtensionBadge = ({ booking }) => {
  const extensionDays = calculateExtensionDays(booking);
  
  if (!booking.extension || extensionDays <= 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 p-2 rounded-full">
          <CalendarDays className="text-emerald-600" size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-emerald-600" size={14} />
            <span className="text-sm font-semibold text-emerald-800">
              Stay Extended!
            </span>
          </div>
          <div className="text-sm text-emerald-700">
            <span className="font-medium">{extensionDays}</span> additional day{extensionDays !== 1 ? 's' : ''} added to your stay
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            Extension cost: <span className="font-medium">{formatCurrency(booking.extendedAmount)}</span>
          </div>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-bold">
          +{extensionDays}
        </div>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.PENDING; // Fallback to PENDING if status not found
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <IconComponent size={12} />
      {config.label}
    </span>
  );
};

// Action button component
const ActionButton = ({ action, onClick, disabled = false }) => {
  const buttonConfig = {
    view: { label: "View", icon: Eye, variant: "outline" },
    directions: { label: "Directions", icon: Navigation, variant: "outline" },
    cancel: { label: "Cancel", icon: X, variant: "outline" },
    contact: { label: "Contact", icon: Phone, variant: "outline" },
    extend: { label: "Extend", icon: CalendarPlus, variant: "outline" },
    review: { label: "Review", icon: Star, variant: "outline" },
  };

  const config = buttonConfig[action];
  const IconComponent = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <IconComponent size={14} />
      {config.label}
    </button>
  );
};

// Google Maps Modal Component
const GoogleMapsModal = ({ booking, isOpen, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(true);
        }
      );
    }
  }, [isOpen]);

  const openInGoogleMaps = () => {
    if (userLocation && booking) {
      // Open Google Maps with directions from user location to hotel
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${booking.hotelLatitude},${booking.hotelLongitude}`;
      window.open(url, "_blank");
    } else if (booking) {
      // Open Google Maps with just the hotel location
      const url = `https://www.google.com/maps/search/?api=1&query=${booking.hotelLatitude},${booking.hotelLongitude}`;
      window.open(url, "_blank");
    }
  };

  const openDirectionsWithAddress = () => {
    if (booking) {
      const encodedAddress = encodeURIComponent(booking.address);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(url, "_blank");
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Get Directions
            </h2>
            <p className="text-sm text-muted-foreground">{booking.hotelName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Hotel Address */}
          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-muted-foreground mt-1" size={20} />
              <div>
                <h3 className="font-medium text-foreground">
                  {booking.hotelName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: {booking.hotelLatitude}, {booking.hotelLongitude}
                </p>
              </div>
            </div>
          </div>

          {/* Location Status */}
          {locationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Location access denied. You can still get directions by opening
                Google Maps.
              </p>
            </div>
          )}

          {userLocation && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                ✓ Your location detected. Ready for turn-by-turn directions.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* <button
              onClick={openDirectionsWithAddress}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Navigation size={18} />
              Open Directions in Google Maps
              <ExternalLink size={16} />
            </button> */}

            {userLocation && (
              <button
                onClick={openInGoogleMaps}
                className="w-full flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent px-4 py-3 rounded-md transition-colors cursor-pointer"
              >
                <MapPin size={18} />
                Directions from My Location
                <ExternalLink size={16} />
              </button>
            )}

            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${booking.hotelLatitude},${booking.hotelLongitude}`;
                window.open(url, "_blank");
              }}
              className="w-full flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent px-4 py-2 rounded-md transition-colors text-sm cursor-pointer"
            >
              <Hotel size={16} />
              View Hotel on Map
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Opens in Google Maps app or browser
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend Booking Modal Component
const ExtendBookingModal = ({ booking, isOpen, onClose, onExtend }) => {
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [error, setError] = useState("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewCheckOutDate("");
      setBookedDates([]);
      setError("");
      setAvailabilityChecked(false);
      if (booking) {
        fetchBookedDates();
      }
    }
  }, [isOpen, booking]);

  // Fetch booked dates for the room
  const fetchBookedDates = async () => {
    if (!booking?.roomId) return;
    
    setIsLoadingBookedDates(true);
    try {
      const response = await api.get(`/rooms/${booking.roomId}/booked-dates`);
      if (response.data && response.data.bookedDates) {
        setBookedDates(response.data.bookedDates);
        
        // Check if extension is possible (tomorrow is available)
        const currentCheckOut = new Date(booking.checkOutDate);
        const tomorrow = new Date(currentCheckOut);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowBlocked = response.data.bookedDates.some(blockedDate => {
          const blocked = new Date(blockedDate);
          return blocked.toDateString() === tomorrow.toDateString();
        });
        
        if (tomorrowBlocked) {
          setError("Unfortunately, your room is not available for extension as it's already booked from tomorrow onwards. We recommend making a new booking for your desired dates using our hotel search feature.");
        }
        
        setAvailabilityChecked(true);
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
      toast.error('Failed to load booking calendar', {
        description: 'Could not fetch booked dates. Please try again.',
        duration: 6000
      });
      setAvailabilityChecked(true);
    } finally {
      setIsLoadingBookedDates(false);
    }
  };

  // Get minimum date for new checkout (day after current checkout)
  const getMinCheckOutDate = () => {
    if (!booking?.checkOutDate) return new Date();
    const currentCheckOut = new Date(booking.checkOutDate);
    // Require at least one day extension - cannot select the same checkout date
    const minDate = new Date(currentCheckOut);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  // Calculate additional nights and cost
  const calculateExtension = () => {
    if (!newCheckOutDate || !booking?.checkOutDate) return { nights: 0, cost: 0 };
    
    // Calculate extension from current checkout to new checkout
    const currentCheckOut = new Date(booking.checkOutDate);
    const newCheckOut = new Date(newCheckOutDate);
    const diffTime = newCheckOut.getTime() - currentCheckOut.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate cost based on original booking's per-night rate
    const originalNights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const pricePerNight = booking.totalPrice / originalNights;
    
    // Require at least one night extension
    const cost = nights > 0 ? nights * pricePerNight : 0;
    
    return { 
      nights: nights > 0 ? nights : 0, 
      cost: cost >= 0 ? cost : 0
    };
  };

  // Calculate nights between two dates
  const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (!date) {
      setNewCheckOutDate("");
      setError("");
      return;
    }

    // Check if selected date is the same as current checkout date
    const currentCheckOut = new Date(booking.checkOutDate);
    const selectedDate = new Date(date);
    
    // Reset time to compare only dates
    currentCheckOut.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === currentCheckOut.getTime()) {
      setError("You cannot select the same checkout date. Please select a date after your current checkout date.");
      setNewCheckOutDate("");
      return;
    }

    // Format date to YYYY-MM-DD (this becomes the new checkout date)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateValue = `${year}-${month}-${day}`;
    
    setNewCheckOutDate(dateValue);
    setError("");

    // Check if there are any booked dates between current checkout and new checkout
    // Note: Checkout dates are exclusive - the room is available starting from checkout date
    const conflictingDates = [];
    const hasConflict = bookedDates.some(blockedDate => {
      const blocked = new Date(blockedDate);
      // Only check dates AFTER current checkout and BEFORE new checkout
      // The new checkout date itself should be available (exclusive checkout)
      if (blocked > currentCheckOut && blocked < selectedDate) {
        conflictingDates.push(blocked.toLocaleDateString());
        return true;
      }
      return false;
    });

    if (hasConflict) {
      // Check if tomorrow (first day after checkout) is blocked
      const tomorrow = new Date(currentCheckOut);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowBlocked = bookedDates.some(blockedDate => {
        const blocked = new Date(blockedDate);
        return blocked.toDateString() === tomorrow.toDateString();
      });

      if (tomorrowBlocked) {
        setError("You cannot select dates");
      } else {
        setError(`The selected extension period conflicts with existing bookings on: ${conflictingDates.join(', ')}. Please select a shorter extension period or make a new booking for your desired dates.`);
      }
    }
  };

  // Handle extend booking
  const handleExtendBooking = async () => {
    if (!newCheckOutDate || error) return;

    const extension = calculateExtension();
    // Require at least one night extension
    if (extension.nights <= 0) {
      setError("Please select a valid extension date (at least one day after your current checkout date).");
      return;
    }

    setIsExtending(true);
    try {
      const payload = {
        newCheckOutDate: newCheckOutDate,     
        guests: booking.guests,               
        phone: booking.phone,                 
        destination: booking.destination,     
        origin: booking.origin,               
        extension: true,
        extendedAmount: extension.cost != null ? extension.cost.toFixed(2) : undefined,
      };

      const response = await api.put(`/bookings/${booking.id}/extend`, payload);
      
      if (response.status === 200) {
        const extensionResponse = response.data;
        
        // Check if payment is required for the extension
        if (extensionResponse.success && extensionResponse.paymentUrl) {
          // Handle payment redirection for booking extension
          handleExtensionPaymentRedirect(extensionResponse);
        } else {
          // Direct extension without payment (fallback)
          toast.success("Booking extended successfully!", {
            description: `Your stay has been extended until ${new Date(newCheckOutDate).toLocaleDateString()}.`,
            duration: 6000
          });
          onExtend(extensionResponse);
          onClose();
        }
      }
    } catch (error) {
      console.error("Error extending booking:", error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError("The selected dates are no longer available. Please choose different dates.");
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid extension request. Please check your dates.");
      } else {
        toast.error("Failed to extend booking", {
          description: "There was an error processing your extension. Please try again.",
          duration: 6000
        });
      }
    } finally {
      setIsExtending(false);
    }
  };

  // Handle payment redirection for booking extension
  const handleExtensionPaymentRedirect = (extensionResponse) => {
    try {
      // Use the standardized payment redirect utility
      handlePaymentRedirect(extensionResponse, {
        gatewayName: 'BFS-Secure',
        onSuccess: (paymentData) => {
          toast.success("Redirecting to Payment Gateway", {
            description: `Payment initiated for booking extension. Complete payment to confirm your ${paymentData.additionalDays} day extension.`,
            duration: 8000
          });
          
          // Close the extension dialog
          onClose();
          
          // Set up payment status checking for extension
          checkExtensionPaymentStatus(extensionResponse.transactionId || extensionResponse.orderNumber);
        },
        onError: (error) => {
          toast.error("Payment Redirect Failed", {
            description: "There was an error redirecting to the payment gateway. Please try again.",
            duration: 6000
          });
        }
      });
      
    } catch (error) {
      console.error("Extension payment redirect failed:", error);
      toast.error("Payment Redirect Failed", {
        description: "There was an error redirecting to the payment gateway. Please try again.",
        duration: 6000
      });
    }
  };

  // Check extension payment status periodically
  const checkExtensionPaymentStatus = async (transactionId) => {
    if (!transactionId) return;
    
    const maxAttempts = 30; // Check for 5 minutes (30 * 10 seconds)
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const response = await api.get(`/bookings/payment-status/${transactionId}`);
        
        if (response.data?.paymentStatus === 'completed') {
          toast.success("Extension Payment Successful!", {
            description: "Your booking extension has been confirmed. You will receive a confirmation email shortly.",
            duration: 8000
          });
          
          // Refresh the booking data to show updated checkout date
          if (onExtend) {
            onExtend(response.data.booking);
          }
          return;
        }
        
        if (response.data?.paymentStatus === 'failed') {
          toast.error("Payment Failed", {
            description: "Your payment could not be processed. Please try extending your booking again.",
            duration: 8000
          });
          return;
        }
        
        // Continue checking if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          toast.info("Payment Status Unknown", {
            description: "Please check your booking status in your dashboard.",
            duration: 6000
          });
        }
        
      } catch (error) {
        console.error("Error checking extension payment status:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        }
      }
    };
    
    // Start checking after 30 seconds
    setTimeout(checkStatus, 30000);
  };

  // Check if extension is possible
  const canExtend = () => {
    if (!booking) return false;
    
    // Get today's date at midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get checkout date at midnight for accurate comparison
    const checkOutDate = new Date(booking.checkOutDate);
    checkOutDate.setHours(0, 0, 0, 0);
    
    // Can extend if checkout is today or in the future (including same day)
    return checkOutDate >= today;
  };

  if (!isOpen || !booking) return null;

  const extension = calculateExtension();
  const minDate = getMinCheckOutDate();

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Extend Your Stay
            </h2>
            <p className="text-sm text-muted-foreground">{booking.hotelName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!canExtend() && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                This booking cannot be extended as the checkout date has already passed.
              </p>
            </div>
          )}

          {canExtend() && (
            <>
              {/* Current Booking Info */}
              <div className="bg-muted/50 rounded-md p-4">
                <h3 className="font-medium text-foreground mb-2">Current Booking</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span>{new Date(booking.checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Check-out:</span>
                    <span>{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span>#{booking.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoadingBookedDates && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-700">Loading availability...</span>
                </div>
              )}

              {/* Date Picker */}
              {availabilityChecked && (
                <div className="space-y-2">
                  <CustomDatePicker
                    selectedDate={newCheckOutDate ? new Date(newCheckOutDate + 'T12:00:00') : null}
                    onDateSelect={handleDateSelect}
                    blockedDates={bookedDates}
                    minDate={minDate}
                    placeholder="Select new checkout date"
                    label="New Check-out Date *"
                    error={error}
                    disabled={isLoadingBookedDates}
                    className="w-full"
                  />
                </div>
              )}

              {/* Extension Summary */}
              {extension.nights > 0 && !error && newCheckOutDate && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    Extension Summary
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Current check-out:</span>
                      <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New check-out:</span>
                      <span className="font-medium">{new Date(newCheckOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional nights:</span>
                      <span className="font-medium">
                        {extension.nights}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-green-300">
                      <span>Additional cost:</span>
                      <span>{formatCurrency(extension.cost)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* No availability message */}
              {availabilityChecked && bookedDates.length > 0 && !error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Some dates may not be available due to existing bookings. 
                    If your desired extension dates are not available, consider making a new booking for alternative dates.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 mb-1">Extension Not Available</h4>
                      <p className="text-sm text-red-700 mb-3">{error}</p>
                      {error.includes("tomorrow onwards") && (
                        <div className="bg-white border border-red-300 rounded-md p-3">
                          <p className="text-sm text-red-800 font-medium mb-2">Alternative Options:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Search for available rooms at this hotel for your desired dates</li>
                            <li>• Browse other hotels in the same area</li>
                            <li>• Consider flexible dates for better availability</li>
                          </ul>
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <Link 
                              to="/hotel" 
                              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                              <ExternalLink size={14} />
                              Browse Available Hotels
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {canExtend() && (
          <div className="flex gap-2 p-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input bg-background hover:bg-accent rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExtendBooking}
              disabled={!newCheckOutDate || extension.nights <= 0 || error || isExtending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExtending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extending...
                </span>
              ) : (
                `Extend Stay (${formatCurrency(extension.cost)})`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({
  booking,
  onViewDetails,
  onCancel,
  onContact,
  onDirections,
  onExtend,
  onReview,
}) => {
  const config = statusConfig[booking.status] || statusConfig.PENDING; // Fallback to PENDING if status not found
  const isCancellationRequested = booking.status === "CANCELLATION_REQUESTED";
  const isCancellationRejected = booking.status === "CANCELLATION_REJECTED";
  const isCancellationApproved = booking.status === "BOOKING_CANCELLATION_APPROVED";
  const isDisabled = booking.status === "CANCELLED" || isCancellationRequested || isCancellationApproved;
  const isCheckedOut = booking.status === "CHECKED_OUT";

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateWithDay = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysDifference = (checkIn) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const diffTime = checkInDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights;
  };

  const daysUntilCheckIn = getDaysDifference(booking.checkInDate);
  const numberOfNights = calculateNights(
    booking.checkInDate,
    booking.checkOutDate
  );

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={`relative rounded-lg border p-4 sm:p-6 transition-all hover:shadow-md ${
        isCheckedOut
          ? "bg-red-50 border-red-200 hover:bg-red-100"
          : isCancellationRequested
            ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
            : isCancellationRejected
              ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
              : "bg-card"
      } ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg flex-shrink-0">
              <Hotel size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`text-base sm:text-lg font-semibold ${
                  isDisabled ? "text-muted-foreground" : "text-foreground"
                } mb-1`}
              >
                {booking.hotelName || "Hotel"}
              </h3>
              {/* Show hotel phone for specific statuses */}
              {(booking.status === "CONFIRMED" || 
                booking.status === "CHECKED_IN" || 
                booking.status === "CANCELLATION_REJECTED" || 
                booking.status === "BOOKING_CANCELLATION_APPROVED") && 
                booking.hotelPhone && (
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={14} className="text-green-600" />
                  <p className="text-sm font-medium text-green-700">
                    {booking.hotelPhone}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-1">
                {booking.hotelDistrict && `${booking.hotelDistrict} District`}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Room No: #{booking.roomNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Extension Badge */}
      <ExtensionBadge booking={booking} />

      {/* Stay Details */}
      <div className="bg-muted/30 rounded-lg p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          
          <div className="flex items-center gap-2">
            <Calendar className="text-primary flex-shrink-0" size={16} />
            
            
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p
                className={`text-sm font-medium ${
                  isDisabled ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {formatDateWithDay(booking.checkInDate)}
                {booking.timeBased && booking.checkInTime && (
                  <span className="ml-1 text-xs text-blue-600">
                    at {formatTime(booking.checkInTime)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary flex-shrink-0" size={16} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p
                className={`text-sm font-medium ${
                  isDisabled ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {formatDateWithDay(booking.checkOutDate)}
                {booking.timeBased && booking.checkOutTime && (
                  <span className="ml-1 text-xs text-blue-600">
                    at {formatTime(booking.checkOutTime)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-primary flex-shrink-0" size={16} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p
                className={`text-sm font-medium ${
                  isDisabled ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {booking.timeBased && booking.bookHour ? (
                  `${booking.bookHour} hour${booking.bookHour !== 1 ? "s" : ""}`
                ) : (
                  `${numberOfNights} night${numberOfNights !== 1 ? "s" : ""}`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator className="my-3" />
      </div>

      {/* Guest, Price, and Passcode Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground flex-shrink-0" size={16} />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Guests</p>
            <p
              className={`text-sm font-medium ${
                isDisabled ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard
            className="text-muted-foreground flex-shrink-0"
            size={16}
          />
          <div className="min-w-0">
            {booking.extension && booking.extendedAmount ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pricing Breakdown</p>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Original booking:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600">Extension fee:</span>
                    <span className="text-sm font-medium text-emerald-600">
                      +{formatCurrency(booking.extendedAmount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Total amount:</span>
                      <span className="text-base font-bold text-emerald-700">
                        {formatCurrency(booking.totalPrice + booking.extendedAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p
                  className={`text-base sm:text-lg font-bold ${
                    isDisabled ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {formatCurrency(booking.totalPrice)}
                </p>
              </div>
            )}
          </div>
        </div>
        {booking.passcode && (
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1 rounded flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Room Passcode</p>
              <p
                className={`text-sm font-mono font-bold tracking-wider ${
                  isDisabled ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {booking.passcode}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator className="my-3" />
      </div>

      {/* Upcoming booking indicator */}
      {booking.status === "CONFIRMED" &&
        daysUntilCheckIn <= 7 &&
        daysUntilCheckIn > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-800 font-medium">
                Check-in in {daysUntilCheckIn} day
                {daysUntilCheckIn !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

      {/* Today check-in indicator */}
      {booking.status === "CONFIRMED" && daysUntilCheckIn === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            <p className="text-sm text-green-800 font-medium">
              Check-in Today!
            </p>
          </div>
        </div>
      )}

      {/* Cancellation rejected indicator */}
      {booking.status === "CANCELLATION_REJECTED" && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-sm text-orange-800 font-medium mb-1">
                Cancellation Request Rejected
              </p>
              <p className="text-xs text-orange-700">
                Your cancellation request was not approved. Your booking remains active and you can proceed with your stay as planned.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation approved indicator */}
      {booking.status === "CANCELLED" && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-green-800 font-semibold">
                  Cancellation Approved
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-black">
                  Your cancellation request has been approved. Your booking has been cancelled.
                </p>
                
                {/* Contact Hotel Owner Message */}
                <div className="bg-green-100/50 border border-green-300 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-xs text-green-700">
                        <p className="text-xs text-black">
                          Please contact the hotel owner directly to claim your refund.
                        </p>
                        {booking.hotelPhone && (
                          <div className="mt-2 flex items-center gap-2">
                            <Phone size={12} className="text-green-600" />
                            <span className="text-xs text-black font-medium">
                              Contact: {booking.hotelPhone}
                            </span>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator className="my-3" />
      </div>

      {/* Booking Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground mb-4 gap-1">
        <span>Booked on {formatDate(booking.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t">
        {config.actions.map((action) => (
          <ActionButton
            key={action}
            action={action}
            disabled={isDisabled}
            onClick={() => {
              if (action === "view") onViewDetails(booking);
              else if (action === "directions") onDirections(booking);
              else if (action === "contact") onContact(booking);
              else if (action === "extend") onExtend(booking);
              else if (action === "cancel") onCancel(booking);
              else if (action === "review") onReview(booking);
            }}
          />
        ))}
      </div>

      {/* Floating WhatsApp Icon for specific statuses */}
      {(booking.status === "CONFIRMED" || 
        booking.status === "CHECKED_IN" || 
        booking.status === "CANCELLATION_REJECTED" || 
        booking.status === "BOOKING_CANCELLATION_APPROVED") && 
        booking.hotelPhone && !isDisabled && (
        <button
          onClick={() => onContact(booking)}
          className="absolute bottom-3 right-3 bg-[#25D366] hover:bg-[#20BA5A] text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label={`Contact ${booking.hotelName} on WhatsApp`}
        >
          {/* Official WhatsApp Icon SVG */}
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        </button>
      )}
    </div>
  );
};

// Cancellation Confirmation Dialog Component
const CancellationConfirmationDialog = ({ 
  booking, 
  isOpen, 
  onClose, 
  onConfirm, 
  isCancelling = false 
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysUntilCheckIn = () => {
    const today = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const diffTime = checkInDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilCheckIn = calculateDaysUntilCheckIn();

  // Parse the cancellation policy to extract refund information
  const parseCancellationPolicy = (policyText) => {
    if (!policyText) return null;
    
    // Extract refund percentages and timeframes
    const refundMatches = policyText.match(/(\d+)% refund ([^,]+)/g);
    const refunds = refundMatches ? refundMatches.map(match => {
      const [, percentage, timeframe] = match.match(/(\d+)% refund (.+)/);
      return { percentage, timeframe: timeframe.trim() };
    }) : [];
    
    return {
      originalText: policyText,
      refunds: refunds
    };
  };

  const policyInfo = parseCancellationPolicy(booking.cancellationPolicy);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Cancel Booking
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review the cancellation policy and confirm your cancellation request.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Booking Information */}
        <div className="bg-muted/50 rounded-md p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Hotel className="text-primary mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {booking.hotelName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Room #{booking.roomNumber} • {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
              </p>
              <p className="text-sm text-muted-foreground">
                Check-in in {daysUntilCheckIn} day{daysUntilCheckIn !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Cancellation Policy
          </h4>
          
          {booking.cancellationPolicy ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              {/* Policy Description */}
              <div>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {booking.cancellationPolicy}
                </p>
              </div>

              {/* Refund Breakdown */}
              {policyInfo && policyInfo.refunds.length > 0 && (
                <div className="bg-white/60 border border-amber-300 rounded-md p-3">
                  <h5 className="text-sm font-semibold text-amber-800 mb-2">Refund Breakdown:</h5>
                  <div className="space-y-1">
                    {policyInfo.refunds.map((refund, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-amber-700">{refund.timeframe}</span>
                        <span className="font-medium text-amber-800">{refund.percentage}% refund</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Situation */}
              <div className="bg-white/60 border border-amber-300 rounded-md p-3">
                <h5 className="text-sm font-semibold text-amber-800 mb-2">Your Situation:</h5>
                <div className="space-y-1 text-sm text-amber-700">
                  <div className="flex justify-between">
                    <span>Days until check-in:</span>
                    <span className="font-medium">{daysUntilCheckIn} day{daysUntilCheckIn !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected refund:</span>
                    <span className="font-medium">
                      {daysUntilCheckIn > 7 ? "100%" :
                       daysUntilCheckIn >= 3 ? "75%" :
                       daysUntilCheckIn >= 1 ? "50%" :
                       daysUntilCheckIn === 0 ? "25%" : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-100/50 border border-amber-300 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-700">
                    <p className="font-medium mb-1">Important:</p>
                    <p>This cancellation request will be reviewed by the hotel owner. Final refund amount may vary based on their specific policy implementation.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Cancellation Policy Not Available</p>
                  <p>No cancellation policy information available for this booking. Please contact the hotel directly for specific cancellation terms.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isCancelling} className="w-full sm:w-auto">
            Keep Booking
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isCancelling}
            className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            {isCancelling ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Submitting Request...
              </span>
            ) : (
              "Request Cancellation"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Booking details modal
const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights;
  };

  const numberOfNights = calculateNights(
    booking.checkInDate,
    booking.checkOutDate
  );
  const pricePerNight = booking.totalPrice / numberOfNights;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Booking Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Room Info */}
          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                <Hotel className="text-primary" size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm">
                  {booking.hotelName || "Hotel"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {booking.hotelDistrict && `${booking.hotelDistrict} District`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Room No: {booking.roomNumber}
                </p>
                <div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b pb-2">
              Stay Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                    <Calendar className="text-primary" size={16} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-in Date
                    </label>
                    <p className="text-sm text-foreground">
                      {formatDate(booking.checkInDate)}
                      {booking.timeBased && booking.checkInTime && (
                        <span className="ml-2 text-xs text-blue-600">
                          at {formatTime(booking.checkInTime)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                    <Calendar className="text-primary" size={16} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-out Date
                    </label>
                    <p className="text-sm text-foreground">
                      {formatDate(booking.checkOutDate)}
                      {booking.timeBased && booking.checkOutTime && (
                        <span className="ml-2 text-xs text-blue-600">
                          at {formatTime(booking.checkOutTime)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {booking.passcode && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Room Passcode
                      </label>
                      <p className="text-sm text-foreground font-mono font-bold tracking-wider text-primary">
                        {booking.passcode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use this code to access your room
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                    <Clock className="text-primary" size={16} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </label>
                    <p className="text-sm text-foreground">
                      {booking.timeBased && booking.bookHour ? (
                        `${booking.bookHour} hour${booking.bookHour !== 1 ? "s" : ""}`
                      ) : (
                        `${numberOfNights} night${numberOfNights !== 1 ? "s" : ""}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                    <User className="text-primary" size={16} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Guest Count
                    </label>
                    <p className="text-sm text-foreground">
                      {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground border-b pb-2">
              Booking Information
            </h4>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                <Calendar className="text-primary" size={16} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Booking Date
                </label>
                <p className="text-sm text-foreground">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-muted/50 border rounded-md p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="text-primary" size={18} />
              Pricing Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {booking.timeBased ? "Room Price" : "Price per night"}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(pricePerNight)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {booking.timeBased ? (
                    `Time-based booking (${booking.bookHour} hour${booking.bookHour !== 1 ? "s" : ""})`
                  ) : (
                    `${numberOfNights} night${numberOfNights !== 1 ? "s" : ""}`
                  )}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Total Amount
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ onRetry }) => (
  <div className="text-center py-12">
    <h3 className="mt-4 text-lg font-medium text-foreground">
      No bookings yet
    </h3>
    <p className="mt-2 text-sm text-muted-foreground">
      Welcome to Ezeeroom! You haven't made any hotel bookings yet.
      <br />
      Start exploring and book your first stay to see your reservations here.
    </p>
    <Button className="mt-4" asChild>
      <Link to="/hotel">Browse Hotels</Link>
    </Button>
    {onRetry && (
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Refresh
        </Button>
      </div>
    )}
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
    <h3 className="mt-4 text-lg font-medium text-foreground">
      Failed to load bookings
    </h3>
    <p className="mt-2 text-sm text-muted-foreground">
      {error?.message || "Something went wrong while fetching your bookings."}
    </p>
    <button
      onClick={onRetry}
      className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
    >
      <RefreshCw size={16} className="inline mr-1" />
      Try Again
    </button>
  </div>
);

// Enhanced pagination component with server-side support
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
          className="p-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((pageNum, index) =>
          pageNum === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                currentPage === pageNum
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {pageNum}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || loading}
          className="p-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Main dashboard component with server-side pagination
const GuestDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
  const [selectedBookingForDirections, setSelectedBookingForDirections] =
    useState(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedBookingForExtend, setSelectedBookingForExtend] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Review state
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [selectedHotelForReview, setSelectedHotelForReview] = useState(null);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  const { userId } = useAuth();

  const itemsPerPage = 5;

  // Fetch bookings from API with pagination
  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // API call - assuming your endpoint returns array directly
      const response = await api.get(`/bookings/user/${userId}`, {
        params: {
          page: page - 1, // Convert to 0-based indexing for backend
          size: itemsPerPage, // Sort by creation date descending
        },
      });

      const data = response.data;

      // Handle array response (your current format)
      if (Array.isArray(data)) {
        setBookings(data);
        // For now, we'll implement client-side pagination since your API returns array
        // You can modify this when you implement server-side pagination
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setTotalItems(data.length);
      } else if (data.content) {
        // Spring Boot Page format (for future use)
        setBookings(data.content);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalElements);
      } else {
        // Custom pagination format
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error);
      setBookings([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to load bookings. Please try again.", {
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchBookings(currentPage);
    }
  }, [userId, currentPage]);

  // Fetch all notifications from backend when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        setLoadingNotifications(true);
        const response = await api.get(`/notifications/user/${userId}`);
        const fetchedNotifications = response.data;

        // Filter notifications to show BOOKING_CREATED, BOOKING_CANCELLATION_REJECTED, and BOOKING_CANCELLATION_APPROVED types
        const filteredNotifications = fetchedNotifications.filter(
          (notif) => notif.type === "BOOKING_CREATED" || notif.type === "BOOKING_CANCELLATION_REJECTED" || notif.type === "BOOKING_CANCELLATION_APPROVED"
        );

        // Sort notifications by createdAt (newest first) and calculate unread count
        const sortedNotifications = filteredNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const unreadNotifications = sortedNotifications.filter(
          (notif) => !notif.isRead
        );

        setNotifications(sortedNotifications);
        setUnreadCount(unreadNotifications.length);

        console.log("[API] Fetched notifications:", sortedNotifications);
        console.log("[API] Unread count:", unreadNotifications.length);
      } catch (error) {
        console.error("[API] Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Mark all notifications as read via API
  const markAllNotificationsAsRead = async () => {
    try {
      await api.put(`/notifications/user/${userId}/markAllRead`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      console.log("[API] Successfully marked all notifications as read");
    } catch (error) {
      console.error("[API] Error marking notifications as read:", error);
    }
  };

  // Delete all notifications via API
  const deleteAllNotifications = async () => {
    try {
      await api.delete(`/notifications/user/${userId}`);

      // Update local state
      setNotifications([]);
      setUnreadCount(0);

      console.log("[API] Successfully deleted all notifications");
    } catch (error) {
      console.error("[API] Error deleting notifications:", error);
    }
  };

  // Note: Real-time notifications were previously handled via WebSocket
  // For now, notifications will need to be fetched manually or via polling

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Handle notification dropdown click
  const handleNotificationClick = async () => {
    setShowNotifications((prev) => !prev);

    // Mark all as read when opening dropdown (only if there are unread notifications)
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };


  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // fetchBookings will be called automatically by useEffect when currentPage changes
    }
  };

  // Retry function
  const handleRetry = () => {
    fetchBookings(currentPage);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancel = (booking) => {
    setSelectedBookingForCancel(booking);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBookingForCancel) return;

    console.log("Starting cancellation for booking:", selectedBookingForCancel.id);
    setIsCancelling(true);
    try {
      const response = await api.post(`/bookings/${selectedBookingForCancel.id}/request-cancellation`, null, {
        params: {
          userId: userId
        }
      });
      
      console.log("Cancellation response:", response);
      
      // Check if the request was successful (status 200-299)
      if ((response.status >= 200 && response.status < 300) && (response.data?.success === true || !('success' in response.data))) {
        toast.success("Cancellation Request Submitted", {
          description: response.data?.message || "Your cancellation request has been submitted successfully.",
          duration: 6000,
        });
        // Optimistically update the local booking status so the card becomes inactive immediately
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBookingForCancel.id
              ? { ...b, status: "CANCELLATION_REQUESTED" }
              : b
          )
        );
        // Close dialog
        setIsCancelDialogOpen(false);
        setSelectedBookingForCancel(null);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast.error("Failed to submit cancellation request. Please try again.", {
        description: "There was an error processing your request. Please contact support if the issue persists.",
        duration: 6000,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    if (!isCancelling) {
      setIsCancelDialogOpen(false);
      setSelectedBookingForCancel(null);
    }
  };

  const handleContact = (booking) => {
    if (!booking.hotelPhone) {
      toast.error('Hotel contact number not available', {
        duration: 4000,
      });
      return;
    }

    try {
      // Format phone number for WhatsApp (remove any non-digit characters and add country code if needed)
      let phoneNumber = booking.hotelPhone.replace(/\D/g, '');
      
      // If phone number doesn't start with country code, assume it's Bhutan (+975)
      if (!phoneNumber.startsWith('975')) {
        phoneNumber = '975' + phoneNumber;
      }
      
      // Create WhatsApp URL with a default message
      const message = encodeURIComponent(
        `Hi! I have a booking at ${booking.hotelName} (Booking ID: ${booking.id}, Room: ${booking.roomNumber}, Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}). I would like to get in touch regarding my reservation.`
      );
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      toast.success(`Opening WhatsApp to contact ${booking.hotelName}`, {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Failed to open WhatsApp. Please try again.', {
        duration: 4000,
      });
    }
  };

  const handleDirections = (booking) => {
    setSelectedBookingForDirections(booking);
    setIsDirectionsModalOpen(true);
  };

  const handleExtend = (booking) => {
    setSelectedBookingForExtend(booking);
    setIsExtendModalOpen(true);
  };

  const handleExtendSuccess = (updatedBooking) => {
    // Refresh the bookings list to show updated data
    fetchBookings(currentPage);
    setIsExtendModalOpen(false);
    setSelectedBookingForExtend(null);
  };

  // Review handlers
  const handleOpenReview = (booking) => {
    setSelectedHotelForReview({
      hotelId: booking.hotelId,
      hotelName: booking.hotelName
    });
    setIsReviewSheetOpen(true);
  };

  const handleReviewSubmitSuccess = () => {
    setIsReviewSheetOpen(false);
    setSelectedHotelForReview(null);
    // Note: Success toast is handled by HotelReviewSheet component itself
    // This callback is only for closing the sheet after successful submission
  };

  const handleReviewClose = () => {
    setIsReviewSheetOpen(false);
    setSelectedHotelForReview(null);
    // This callback is for closing the sheet without success (e.g., outside click)
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                My Bookings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                  disabled={loadingNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="fixed left-4 right-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 w-auto sm:w-80 bg-card border rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">
                          Notifications
                        </h3>
                      </div>
                    </div>
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 sm:p-6 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 sm:p-6 text-center">
                          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 sm:p-4 transition-colors ${
                                notification.isRead
                                  ? "hover:bg-muted/50"
                                  : notification.type === "BOOKING_CANCELLATION_APPROVED"
                                    ? "bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30"
                                    : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-sm flex-1 line-clamp-2">
                                        {notification.title}
                                      </p>
                                      {!notification.isRead && (
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                          notification.type === "BOOKING_CANCELLATION_APPROVED" 
                                            ? "bg-green-500" 
                                            : "bg-blue-500"
                                        }`}></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Enhanced display for cancellation approved notifications */}
                                {notification.type === "BOOKING_CANCELLATION_APPROVED" ? (
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      {notification.hotelName && (
                                        <p className="text-sm text-muted-foreground">
                                          <span className="font-medium">Hotel:</span> {notification.hotelName}
                                        </p>
                                      )}
                                      {notification.roomNumber && (
                                        <p className="text-sm text-muted-foreground">
                                          <span className="font-medium">Room:</span> {notification.roomNumber}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Refund Details Section */}
                                    <div className="bg-white/60 border border-green-300 rounded-lg p-3 space-y-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="text-green-600" size={14} />
                                        <span className="text-xs font-semibold text-green-800">Refund Information</span>
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-green-800">Refund Amount:</span>
                                          <span className="text-xs font-bold text-green-800">
                                            {notification.refundAmount ? formatCurrency(notification.refundAmount) : 'Contact hotel owner'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Contact Hotel Owner */}
                                    <div className="bg-green-100/50 border border-green-300 rounded-md p-2">
                                      <div className="flex items-start gap-2">
                                        <div className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <div className="text-xs text-green-700">
                                          <p className="font-medium mb-1">For refund details, contact the hotel owner directly.</p>
                                          <p className="text-xs text-green-600">
                                            The hotel owner will provide specific refund processing information and timeline.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* Standard notification display for other types */
                                  <div className="space-y-1">
                                    {notification.hotelName && (
                                      <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Hotel:</span> {notification.hotelName}
                                      </p>
                                    )}
                                    {notification.roomNumber && (
                                      <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Room:</span> {notification.roomNumber}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex justify-end">
                                  <span className="text-xs text-muted-foreground">
                                    {notification.displayTime ||
                                      new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex-shrink-0 p-0"
              >
                <Link to="/">Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator />
      </div>


      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : bookings.length === 0 ? (
          <EmptyState onRetry={handleRetry} />
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <div key={booking.id}>
                  <BookingCard
                    booking={booking}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancel}
                    onContact={handleContact}
                    onDirections={handleDirections}
                    onExtend={handleExtend}
                    onReview={handleOpenReview}
                  />
                  {/* Mobile Separator between cards */}
                  {index < bookings.length - 1 && (
                    <div className="block sm:hidden mt-4">
                      <Separator />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Separator before pagination */}
            <div className="block sm:hidden mt-6">
              <Separator />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Google Maps Directions Modal */}
      <GoogleMapsModal
        booking={selectedBookingForDirections}
        isOpen={isDirectionsModalOpen}
        onClose={() => setIsDirectionsModalOpen(false)}
      />

      {/* Extend Booking Modal */}
      <ExtendBookingModal
        booking={selectedBookingForExtend}
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        onExtend={handleExtendSuccess}
      />

      {/* Cancellation Confirmation Dialog */}
      <CancellationConfirmationDialog
        booking={selectedBookingForCancel}
        isOpen={isCancelDialogOpen}
        onClose={handleCancelDialogClose}
        onConfirm={handleConfirmCancellation}
        isCancelling={isCancelling}
      />

      {/* Hotel Review Sheet */}
      <HotelReviewSheet
        isOpen={isReviewSheetOpen}
        userId={userId}
        hotelId={selectedHotelForReview?.hotelId}
        onSubmitSuccess={handleReviewSubmitSuccess}
        onClose={handleReviewClose}
      />
    </div>
  );
};

export default GuestDashboard;
