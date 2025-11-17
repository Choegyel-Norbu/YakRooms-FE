import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
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
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/shared/utils";
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
  const originalPricePerNight = (booking.txnTotalPrice || booking.totalPrice) / originalNights;
  
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
    actions: ["directions", "extend", "cancel"],
  },
  CANCELLATION_REQUESTED: {
    label: "Cancellation Requested",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: AlertCircle,
    actions: ["directions"],
  },
  CANCELLATION_REJECTED: {
    label: "Cancellation Rejected",
    color: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: CheckCircle,
    actions: ["directions", "extend"],
  },
  BOOKING_CANCELLATION_APPROVED: {
    label: "Cancellation Approved",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
    actions: ["directions"],
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
    actions: ["directions"],
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
    actions: ["directions"],
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: CheckCircle,
    actions: ["directions"],
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: CheckCircle,
    actions: ["directions", "extend", "review"],
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: CheckCircle,
    actions: ["directions", "review"],
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
    <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full border animate-in zoom-in-95 duration-200">
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
  const [newCheckOutTime, setNewCheckOutTime] = useState("");
  const [extensionHours, setExtensionHours] = useState(1);
  const [bookedDates, setBookedDates] = useState([]);
  const [timeBasedBookings, setTimeBasedBookings] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [error, setError] = useState("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAutoFilledDate, setIsAutoFilledDate] = useState(false);
  const [openPaymentRedirectDialog, setOpenPaymentRedirectDialog] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewCheckOutDate("");
      setNewCheckOutTime("");
      setExtensionHours(1);
      setBookedDates([]);
      setTimeBasedBookings([]);
      setError("");
      setAvailabilityChecked(false);
      setIsAutoFilledDate(false);
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
      if (response.data) {
        setBookedDates(response.data.bookedDates || []);
        setTimeBasedBookings(response.data.timeBasedBookings || []);
        
        // Check if extension is possible
        // Note: bookedDates contains check-in dates (when bookings start)
        // Checkout dates are EXCLUSIVE - meaning if you checkout on date X, the room is available starting from date X
        // So having a check-in on date Y doesn't prevent checkout on date Y
        // We can extend to any date that doesn't have a check-in BETWEEN current checkout and new checkout
        // Example: Checkout 4 -> Checkout 5 is allowed even if there's a check-in on 5
        // Example: Checkout 4 -> Checkout 5 is NOT allowed if there's a check-in on 4 (overlap)
        
        // Auto-fill checkout date if there's a check-in the day after current checkout
        const currentCheckOut = new Date(booking.checkOutDate);
        currentCheckOut.setHours(0, 0, 0, 0);
        
        // Check if there's a check-in on the day after current checkout
        const nextDay = new Date(currentCheckOut);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        
        // Check if the immediate next day has time-based bookings
        const hasTimeBasedBookingNextDay = response.data.timeBasedBookings?.some(booking => booking.date === nextDayString);
        
        if (hasTimeBasedBookingNextDay) {
          // If the very next day has time-based bookings, extension is not possible
          setError("Extension for this booking is not available as the next day has existing time-based bookings.");
          setAvailabilityChecked(true);
          return;
        }
        
        const hasCheckInNextDay = response.data.bookedDates?.some(blockedDate => {
          const checkInDate = new Date(blockedDate);
          checkInDate.setHours(0, 0, 0, 0);
          return checkInDate.toDateString() === nextDay.toDateString();
        });
        
        if (hasCheckInNextDay) {
          // Automatically set new checkout to the day after current checkout
          const year = nextDay.getFullYear();
          const month = String(nextDay.getMonth() + 1).padStart(2, '0');
          const day = String(nextDay.getDate()).padStart(2, '0');
          const dateValue = `${year}-${month}-${day}`;
          setNewCheckOutDate(dateValue);
          setIsAutoFilledDate(true);
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
  // Since checkout dates are EXCLUSIVE, we can allow same-day extensions
  // (checkout today means leaving today, so room available starting today)
  const getMinCheckOutDate = () => {
    if (!booking?.checkOutDate) return new Date();
    const currentCheckOut = new Date(booking.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if checkout is today
    currentCheckOut.setHours(0, 0, 0, 0);
    const isCheckoutToday = currentCheckOut.getTime() === today.getTime();
    
    if (isCheckoutToday) {
      // Allow same-day extension (checkout today -> checkout today = extending to tomorrow)
      // Check if there are any check-ins TODAY (which would conflict)
      const checkInToday = bookedDates.some(blockedDate => {
        const blocked = new Date(blockedDate);
        blocked.setHours(0, 0, 0, 0);
        return blocked.toDateString() === today.toDateString();
      });
      
      // If no check-in today, allow same-day extension
      if (!checkInToday) {
        return new Date(currentCheckOut);
      }
    }
    
    // Otherwise, require at least one day extension
    const minDate = new Date(currentCheckOut);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  // Calculate additional nights/hours and cost
  const calculateExtension = () => {
    if (!booking?.checkOutDate) return { nights: 0, hours: 0, cost: 0, priceBreakdown: null };
    
    if (booking.timeBased) {
      // Time-based booking extension using selected hours
      if (!extensionHours || extensionHours <= 0) return { nights: 0, hours: 0, cost: 0, priceBreakdown: null };
      
      // Price per hour = roomPrice / original hours (for time-based bookings, roomPrice is total for original hours)
      const originalHours = booking.bookHour || 1;
      const pricePerHour = booking.roomPrice / originalHours;
      
      // Calculate extension cost: additional hours × price per hour
      const extensionCost = extensionHours * pricePerHour;
      
      // Price breakdown
      const priceBreakdown = {
        roomPrice: booking.roomPrice,  // Original room price for the time period
        pricePerHour: pricePerHour,
        extensionHours: extensionHours,
        extendedAmount: extensionCost,  // Cost for extension only (hours × pricePerHour)
        serviceTax: extensionCost * 0.03,  // 3% service tax on extension
        totalAmount: extensionCost + (extensionCost * 0.03)  // Total with service tax
      };
      
      return { 
        nights: 0, 
        hours: extensionHours, 
        cost: extensionCost >= 0 ? extensionCost : 0,
        priceBreakdown: priceBreakdown
      };
    } else {
      // Regular booking extension
      if (!newCheckOutDate) return { nights: 0, hours: 0, cost: 0, priceBreakdown: null };
      
      // Calculate extension from current checkout to new checkout
      const currentCheckOut = new Date(booking.checkOutDate);
      const newCheckOut = new Date(newCheckOutDate);
      const diffTime = newCheckOut.getTime() - currentCheckOut.getTime();
      let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If same-day extension (selecting today when checkout is today), it extends to tomorrow (1 night)
      if (nights === 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentCheckOut.setHours(0, 0, 0, 0);
        const isCheckoutToday = currentCheckOut.getTime() === today.getTime();
        
        if (isCheckoutToday) {
          nights = 1; // Same-day extension means extending to tomorrow
        }
      }
      
      // roomPrice is the price PER NIGHT
      const pricePerNight = booking.roomPrice;
      
      // Calculate extension cost: nights × price per night
      const extensionCost = nights > 0 ? nights * pricePerNight : 0;
      
      // Price breakdown
      const priceBreakdown = {
        roomPrice: booking.roomPrice,  // Price per night
        pricePerNight: pricePerNight,
        extensionNights: nights,
        extendedAmount: extensionCost,  // Cost for extension only (nights × pricePerNight)
        serviceTax: extensionCost * 0.03,  // 3% service tax on extension
        totalAmount: extensionCost + (extensionCost * 0.03)  // Total with service tax
      };
      
      return { 
        nights: nights > 0 ? nights : 0, 
        hours: 0,
        cost: extensionCost >= 0 ? extensionCost : 0,
        priceBreakdown: priceBreakdown
      };
    }
  };

  // Calculate nights between two dates
  const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights;
  };

  // Calculate new checkout time based on extension hours
  const calculateNewCheckOutTime = () => {
    if (!booking.timeBased || !booking.checkOutTime) return "";
    
    const currentCheckOutTime = booking.checkOutTime;
    const [hours, minutes] = currentCheckOutTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (extensionHours * 60);
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
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
    const today = new Date();
    
    // Reset time to compare only dates
    currentCheckOut.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const isCheckoutToday = currentCheckOut.getTime() === today.getTime();
    const isSameDate = selectedDate.getTime() === currentCheckOut.getTime();
    
    // Allow same-day extension only if:
    // 1. Today is checkout day  
    // 2. No check-in TODAY (which would create overlap)
    if (isSameDate) {
      if (isCheckoutToday) {
        // Check if there's a check-in TODAY (which would create overlap)
        const checkInToday = bookedDates.some(blockedDate => {
          const blocked = new Date(blockedDate);
          blocked.setHours(0, 0, 0, 0);
          return blocked.toDateString() === today.toDateString();
        });
        
        if (checkInToday) {
          setError("You cannot extend your stay today as another guest is already checking in today. Please make a new booking for your desired dates.");
          setNewCheckOutDate("");
          return;
        }
        // If no check-in today, allow same-day extension
      } else {
        setError("You cannot select the same checkout date. Please select a date after your current checkout date.");
        setNewCheckOutDate("");
        return;
      }
    }

    // Format date to YYYY-MM-DD (this becomes the new checkout date)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateValue = `${year}-${month}-${day}`;
    
    // Note: Time-based booking conflicts are now handled at the booking level
    // If we reach this point, the extension is already determined to be possible

    // If same-day extension, we need to check conflicts up to tomorrow (the actual checkout date)
    let endDateForConflictCheck = selectedDate;
    if (isCheckoutToday && isSameDate) {
      const tomorrow = new Date(selectedDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDateForConflictCheck = tomorrow;
    }

    // Check if there are any check-ins BETWEEN current checkout and new checkout
    // CRITICAL: Checkout dates are EXCLUSIVE - checkout on date X means room available starting FROM date X
    // So having a check-in on date Y doesn't prevent checkout on date Y (they can coexist)
    // We only block if there's a check-in STRICTLY AFTER current checkout and STRICTLY BEFORE new checkout
    const conflictingDates = [];
    const hasConflict = bookedDates.some(blockedDate => {
      const checkInDate = new Date(blockedDate);
      checkInDate.setHours(0, 0, 0, 0);
      endDateForConflictCheck.setHours(0, 0, 0, 0);
      
      // Only check if check-in is STRICTLY BETWEEN checkout dates
      // Example: Checkout 4 -> Checkout 5 allows check-in on 5, but blocks check-in on 4
      // block if: checkIn > currentCheckOut && checkIn < endDateForConflictCheck
      const isBetween = checkInDate > currentCheckOut && checkInDate < endDateForConflictCheck;
      if (isBetween) {
        conflictingDates.push(checkInDate.toLocaleDateString());
      }
      return isBetween;
    });

    if (hasConflict) {
      setError(`The selected extension period conflicts with existing bookings on: ${conflictingDates.join(', ')}. Please select a shorter extension period or make a new booking for your desired dates.`);
      setNewCheckOutDate("");
      return;
    }
    
    // If we reach here, the date is valid
    setNewCheckOutDate(dateValue);
    setIsAutoFilledDate(false); // Clear auto-fill flag when user manually selects a date
    setError("");
  };

  // Handle extension hours change for time-based bookings
  const handleExtensionHoursChange = (hours) => {
    const numHours = parseInt(hours);
    setExtensionHours(numHours);
    setError("");

    // Check for time conflicts with existing time-based bookings
    if (booking.timeBased && booking.checkOutDate && numHours > 0) {
      const currentCheckOutTime = booking.checkOutTime || "12:00";
      const [currentHours, currentMinutes] = currentCheckOutTime.split(':').map(Number);
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      
      // Calculate new checkout time based on extension hours
      const newTotalMinutes = currentTotalMinutes + (numHours * 60);
      
      // Get existing bookings for the same date
      const selectedDate = new Date(booking.checkOutDate);
      const selectedDateString = selectedDate.getFullYear() + '-' + 
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(selectedDate.getDate()).padStart(2, '0');

      const existingBookings = timeBasedBookings.filter(booking => booking.date === selectedDateString);
      
      // Check for time conflicts
      const hasTimeConflict = existingBookings.some(existingBooking => {
        // Handle different time formats (HH:MM:SS or HH:MM)
        let existingStartTime = existingBooking.checkInTime;
        let existingEndTime = existingBooking.checkOutTime;
        
        // Remove seconds if present (e.g., "19:00:00" -> "19:00")
        if (existingStartTime.includes(':') && existingStartTime.split(':').length === 3) {
          existingStartTime = existingStartTime.substring(0, 5);
        }
        if (existingEndTime.includes(':') && existingEndTime.split(':').length === 3) {
          existingEndTime = existingEndTime.substring(0, 5);
        }

        // Calculate existing booking time range
        const [existingStartHours, existingStartMins] = existingStartTime.split(':').map(Number);
        const [existingEndHours, existingEndMins] = existingEndTime.split(':').map(Number);
        
        const existingStartTotalMinutes = existingStartHours * 60 + existingStartMins;
        const existingEndTotalMinutes = existingEndHours * 60 + existingEndMins;

        // Add 1-hour buffer (60 minutes) to existing booking end time
        const existingEndWithBuffer = existingEndTotalMinutes + 60;

        // Check for overlap with buffer - two time ranges overlap if one starts before the other ends (with buffer)
        return (currentTotalMinutes < existingEndWithBuffer && newTotalMinutes > existingStartTotalMinutes);
      });

      if (hasTimeConflict) {
        setError(`This ${numHours}-hour extension conflicts with an existing hourly booking. Please choose fewer hours or a different time.`);
      }
    }
  };

  // Handle extend booking
  const handleExtendBooking = async () => {
    if (booking.timeBased) {
      // Time-based booking extension
      if (!extensionHours || extensionHours <= 0 || error) return;
      
      const extension = calculateExtension();
      // Require at least one hour extension
      if (extension.hours <= 0) {
        setError("Please select a valid extension duration (at least one hour).");
        return;
      }
    } else {
      // Regular booking extension
      if (!newCheckOutDate || error) return;
      
      const extension = calculateExtension();
      // Require at least one night extension (or same-day extension if tomorrow is free)
      if (extension.nights <= 0) {
        setError("Please select a valid extension date.");
        return;
      }
    }

    setIsExtending(true);
    try {
      const extension = calculateExtension();
      const breakdown = extension.priceBreakdown;
      
      if (!breakdown) {
        setError("Unable to calculate extension cost. Please try again.");
        return;
      }
      
      // 🔐 SECURITY FIX: Calculate prices for DISPLAY only
      // These are NOT sent to backend - server recalculates from database
      const displayExtendedAmount = Math.ceil(breakdown.extendedAmount);
      const displayTotalPrice = Math.ceil(breakdown.extendedAmount);
      const displayTxnTotalPrice = Math.ceil(breakdown.totalAmount);
      
      // Security: Display prices calculated (NOT sent to server)
      
      const payload = {
        guests: booking.guests,               
        phone: booking.phone,                 
        destination: booking.destination,     
        origin: booking.origin,               
        extension: true,
        // ❌ REMOVED: Pricing fields (extendedAmount, totalPrice, txnTotalPrice)
        // Backend will recalculate these from database to prevent price manipulation
        // Old code (vulnerable):
        // extendedAmount: extendedAmount.toString(),
        // totalPrice: totalPrice.toString(),
        // txnTotalPrice: txnTotalPrice.toString(),
      };

      // Add time-based or date-based extension fields
      if (booking.timeBased) {
        payload.newCheckOutTime = calculateNewCheckOutTime();
        payload.timeBased = true;
        payload.bookHour = extension.hours;
      } else {
        // If same-day extension (selecting today when checkout is today), send tomorrow's date
        const currentCheckOut = new Date(booking.checkOutDate);
        const selected = new Date(newCheckOutDate);
        const today = new Date();
        
        currentCheckOut.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const isCheckoutToday = currentCheckOut.getTime() === today.getTime();
        const isSameDate = selected.getTime() === currentCheckOut.getTime();
        
        if (isCheckoutToday && isSameDate) {
          // Same-day extension means extending to tomorrow
          const tomorrow = new Date(currentCheckOut);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const year = tomorrow.getFullYear();
          const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
          const day = String(tomorrow.getDate()).padStart(2, '0');
          payload.newCheckOutDate = `${year}-${month}-${day}`;
        } else {
          payload.newCheckOutDate = newCheckOutDate;
        }
      }

      const response = await api.put(`/bookings/${booking.id}/extend`, payload);
      
      if (response.status === 200) {
        const extensionResponse = response.data;
        
        // Check if payment is required for the extension
        if (extensionResponse.success && extensionResponse.paymentUrl) {
          // Handle payment redirection for booking extension
          handleExtensionPaymentRedirect(extensionResponse);
        } else {
          // Direct extension without payment (fallback)
          // Calculate the actual checkout date for the message
          let actualCheckoutDate = newCheckOutDate;
          const currentCheckOut = new Date(booking.checkOutDate);
          const selected = new Date(newCheckOutDate);
          const today = new Date();
          
          currentCheckOut.setHours(0, 0, 0, 0);
          selected.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          const isCheckoutToday = currentCheckOut.getTime() === today.getTime();
          const isSameDate = selected.getTime() === currentCheckOut.getTime();
          
          if (isCheckoutToday && isSameDate) {
            // Same-day extension means extending to tomorrow
            const tomorrow = new Date(currentCheckOut);
            tomorrow.setDate(tomorrow.getDate() + 1);
            actualCheckoutDate = tomorrow.toISOString().split('T')[0];
          }
          
          const extensionDescription = booking.timeBased 
            ? `Your hourly booking has been extended by ${extension.hours} hour${extension.hours !== 1 ? 's' : ''} until ${calculateNewCheckOutTime()}.`
            : `Your stay has been extended until ${new Date(actualCheckoutDate).toLocaleDateString()}.`;
            
          toast.success("Booking extended successfully!", {
            description: extensionDescription,
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
        setError("The selected dates/times are no longer available. Please choose different dates/times.");
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid extension request. Please check your dates/times.");
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
      // Close the extension dialog
      onClose();
      
      // Show payment redirect dialog
      setOpenPaymentRedirectDialog(true);
      
      // Use the standardized payment redirect utility
      handlePaymentRedirect(extensionResponse, {
        gatewayName: 'BFS-Secure',
        onSuccess: (paymentData) => {
          // Set up payment status checking for extension
          checkExtensionPaymentStatus(extensionResponse.transactionId || extensionResponse.orderNumber);
          // Dialog will remain open until redirect happens
        },
        onError: (error) => {
          // Close redirect dialog on error
          setOpenPaymentRedirectDialog(false);
          toast.error("Payment Redirect Failed", {
            description: "There was an error redirecting to the payment gateway. Please try again.",
            duration: 6000
          });
        }
      });
      
    } catch (error) {
      console.error("Extension payment redirect failed:", error);
      // Close redirect dialog on error
      setOpenPaymentRedirectDialog(false);
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
    <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border animate-in zoom-in-95 duration-200">
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

              {/* Date Picker for regular bookings */}
              {availabilityChecked && !booking.timeBased && (
                <div className="space-y-2">
                  <CustomDatePicker
                    selectedDate={newCheckOutDate ? new Date(newCheckOutDate + 'T12:00:00') : null}
                    onDateSelect={handleDateSelect}
                    blockedDates={bookedDates}
                    timeBasedBookings={timeBasedBookings}
                    minDate={minDate}
                    placeholder="Select new checkout date"
                    label="New Check-out Date *"
                    error={error}
                    disabled={isLoadingBookedDates}
                    className="w-full"
                  />
                  {isAutoFilledDate && newCheckOutDate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium"></span> Checkout extended to {new Date(newCheckOutDate).toLocaleDateString()} because another guest is checking in that day.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Hour Selection for time-based bookings */}
              {availabilityChecked && booking.timeBased && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Extension Duration *
                  </label>
                  <select
                    value={extensionHours}
                    onChange={(e) => handleExtensionHoursChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      error ? "border-red-500 bg-red-50" : "border-input bg-background"
                    }`}
                    disabled={isLoadingBookedDates}
                  >
                    {Array.from({ length: 4 }, (_, i) => i + 1).map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} hour{hours !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Current checkout time: {booking.checkOutTime || "12:00"}
                    {extensionHours > 0 && (
                      <span className="ml-2 text-blue-600">
                        → New checkout: {calculateNewCheckOutTime()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Extension Summary */}
              {((booking.timeBased && extension.hours > 0 && !error && extensionHours > 0) || 
                (!booking.timeBased && extension.nights > 0 && !error && newCheckOutDate)) && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    Extension Summary
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    {booking.timeBased ? (
                      <>
                        <div className="flex justify-between">
                          <span>Current check-out time:</span>
                          <span className="font-medium">{booking.checkOutTime || "12:00"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New check-out time:</span>
                          <span className="font-medium">{calculateNewCheckOutTime()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Additional hours:</span>
                          <span className="font-medium">
                            {extension.hours} hour{extension.hours !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
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
                            {extension.nights} night{extension.nights !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Price Breakdown */}
                    {extension.priceBreakdown && (
                      <div className="pt-2 border-t border-green-300 space-y-2">
                        <div className="font-semibold text-green-800 mb-2">Pricing Breakdown:</div>
                        {booking.timeBased ? (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-green-700">
                              <span>Original room price:</span>
                              <span>{formatCurrency(extension.priceBreakdown.roomPrice)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                              <span>Price per hour:</span>
                              <span>{formatCurrency(extension.priceBreakdown.pricePerHour)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                              <span>Extension ({extension.hours} hour{extension.hours !== 1 ? 's' : ''}):</span>
                              <span>{formatCurrency(extension.priceBreakdown.extendedAmount)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-green-700">
                              <span>Original room price:</span>
                              <span>{formatCurrency(extension.priceBreakdown.roomPrice)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                              <span>Extension ({extension.nights} night{extension.nights !== 1 ? 's' : ''}):</span>
                              <span>{formatCurrency(extension.priceBreakdown.extendedAmount)}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between text-green-700">
                          <span>Service tax (3%):</span>
                          <span>{formatCurrency(Math.ceil(extension.priceBreakdown.serviceTax))}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-800 pt-1 border-t border-green-300">
                          <span>Total amount:</span>
                          <span>{formatCurrency(Math.ceil(extension.priceBreakdown.totalAmount))}</span>
                        </div>
                      </div>
                    )}
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
              disabled={
                (booking.timeBased ? !extensionHours || extensionHours <= 0 : !newCheckOutDate) || 
                (booking.timeBased ? extension.hours <= 0 : extension.nights <= 0) || 
                error || 
                isExtending
              }
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExtending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extending...
                </span>
              ) : (
                `Extend ${booking.timeBased ? 'Time' : 'Stay'} (${formatCurrency(extension.priceBreakdown?.totalAmount || extension.cost)})`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Payment Redirect Dialog */}
      <Dialog open={openPaymentRedirectDialog} onOpenChange={() => {}}>
        <DialogPortal>
          <DialogOverlay className="bg-black/30" />
          <DialogPrimitive.Content
            className={cn(
              "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-md"
            )}
          >
            <div className="flex flex-col items-center justify-center py-8 px-6">
              {/* Spinner */}
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              
              {/* Title */}
              <DialogTitle className="text-xl font-semibold text-center mb-2">
                Redirecting to Payment
              </DialogTitle>
              
              {/* Description */}
              <DialogDescription className="text-center text-sm text-muted-foreground max-w-sm">
                Please complete the payment and you will be redirected back to your booking.
              </DialogDescription>
              
              {/* Additional Info */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-green-800">
                    <p className="font-medium mb-1">Please wait...</p>
                    <p className="text-green-700">Do not close this window or refresh the page.</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

const BookingCard = ({
  booking,
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
                {!booking.timeBased && booking.hotelCheckinTime && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (Hotel check-in: {formatTime(booking.hotelCheckinTime)})
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
                {!booking.timeBased && booking.hotelCheckoutTime && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (Hotel check-out: {formatTime(booking.hotelCheckoutTime)})
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
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p
                className={`text-base sm:text-lg font-bold ${
                  isDisabled ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {formatCurrency(booking.txnTotalPrice || booking.totalPrice)}
              </p>
            </div>
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
        {config.actions
          .filter(action => {
            // Hide extend button for time-based bookings
            if (action === "extend" && booking.timeBased) {
              return false;
            }
            return true;
          })
          .map((action) => (
          <ActionButton
            key={action}
            action={action}
            disabled={isDisabled}
            onClick={() => {
              if (action === "directions") onDirections(booking);
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

      } catch (error) {
        // Error handled silently
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

      // Notifications deleted
    } catch (error) {
      // Error handled silently
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

  const handleCancel = (booking) => {
    setSelectedBookingForCancel(booking);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBookingForCancel) return;

    setIsCancelling(true);
    try {
      const response = await api.post(`/bookings/${selectedBookingForCancel.id}/request-cancellation`, null, {
        params: {
          userId: userId
        }
      });
      
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
        `Hi! I have a booking at ${booking.hotelName} (Room: ${booking.roomNumber}, Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}). I would like to get in touch regarding my reservation.`
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
