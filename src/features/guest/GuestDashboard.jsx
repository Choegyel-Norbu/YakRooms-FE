import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Separator } from "@/shared/components/separator";
import { Button } from "@/shared/components/button";
import { Link } from "react-router-dom";
import api from "../../shared/services/Api";
import { useAuth } from "../authentication";
import { toast } from "sonner";
import { CustomDatePicker } from "../../shared/components";

// Number formatting function
const formatCurrency = (amount) => {
  return `Nu. ${amount.toLocaleString("en-IN")} /-`;
};

// Status configuration
const statusConfig = {
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
    actions: ["view", "directions", "extend"],
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
    actions: ["view", "directions", "extend"],
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: CheckCircle,
    actions: ["view", "directions"],
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
            <button
              onClick={openDirectionsWithAddress}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Navigation size={18} />
              Open Directions in Google Maps
              <ExternalLink size={16} />
            </button>

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

  // Get minimum date for new checkout (same day as current checkout or later)
  const getMinCheckOutDate = () => {
    if (!booking?.checkOutDate) return new Date();
    const currentCheckOut = new Date(booking.checkOutDate);
    // Allow selecting the same checkout date for same-day extensions (e.g., late checkout)
    return currentCheckOut;
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
    
    // Allow same-date extensions (0 nights) - useful for late checkout requests
    // Cost remains 0 for same-date extensions
    const cost = nights > 0 ? nights * pricePerNight : 0;
    
    return { 
      nights: nights >= 0 ? nights : 0, 
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

    // Format date to YYYY-MM-DD (this becomes the new checkout date)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateValue = `${year}-${month}-${day}`;
    
    setNewCheckOutDate(dateValue);
    setError("");

    // Check if there are any booked dates between current checkout and new checkout
    const currentCheckOut = new Date(booking.checkOutDate);
    const selectedDate = new Date(date);
    
    // Check for conflicts between current checkout and new checkout
    const conflictingDates = [];
    const hasConflict = bookedDates.some(blockedDate => {
      const blocked = new Date(blockedDate);
      if (blocked > currentCheckOut && blocked <= selectedDate) {
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
    // Allow same-date extensions (0 nights) for late checkout requests
    if (extension.nights < 0) {
      setError("Please select a valid extension date.");
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
      };

      const response = await api.put(`/bookings/${booking.id}/extend`, payload);
      
      if (response.status === 200) {
        const issameDayExtension = extension.nights === 0;
        toast.success(
          issameDayExtension ? "Same-day extension requested successfully!" : "Booking extended successfully!", 
          {
            description: issameDayExtension 
              ? `Your same-day extension request for ${new Date(newCheckOutDate).toLocaleDateString()} has been submitted.`
              : `Your stay has been extended until ${new Date(newCheckOutDate).toLocaleDateString()}.`,
            duration: 6000
          }
        );
        onExtend(response.data);
        onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              {extension.nights >= 0 && !error && newCheckOutDate && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    {extension.nights === 0 ? "Same-Day Extension Summary" : "Extension Summary"}
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
                        {extension.nights} {extension.nights === 0 ? "(Same day)" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-green-300">
                      <span>Additional cost:</span>
                      <span>{formatCurrency(extension.cost)}</span>
                    </div>
                    {extension.nights === 0 && (
                      <div className="text-xs text-green-600 mt-2 p-2 bg-green-100 rounded">
                        <strong>Note:</strong> Same-day extensions are typically used for late checkout requests and may not incur additional charges.
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
              disabled={!newCheckOutDate || extension.nights < 0 || error || isExtending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExtending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {extension.nights === 0 ? "Processing..." : "Extending..."}
                </span>
              ) : (
                extension.nights === 0 
                  ? "Request Same-Day Extension (Free)" 
                  : `Extend Stay (${formatCurrency(extension.cost)})`
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
}) => {
  const config = statusConfig[booking.status] || statusConfig.PENDING; // Fallback to PENDING if status not found
  const isDisabled = booking.status === "CANCELLED";
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

  return (
    <div
      className={`rounded-lg border p-4 sm:p-6 transition-all hover:shadow-md ${
        isCheckedOut 
          ? "bg-red-50 border-red-200 hover:bg-red-100" 
          : "bg-card"
      } ${isDisabled ? "opacity-60" : ""}`}
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
              <p className="text-sm text-muted-foreground mb-1">
                {booking.hotelDistrict && `${booking.hotelDistrict} District`}
              </p>
              <p className="text-xs text-muted-foreground">
                Room #{booking.roomNumber} • Booking ID: #{booking.id}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={booking.status} />
        </div>
      </div>

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
                {numberOfNights} night{numberOfNights !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator className="my-3" />
      </div>

      {/* Guest and Price Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p
              className={`text-base sm:text-lg font-bold ${
                isDisabled ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {formatCurrency(booking.totalPrice)}
            </p>
          </div>
        </div>
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

      {/* Mobile Separator */}
      <div className="block sm:hidden">
        <Separator className="my-3" />
      </div>

      {/* Booking Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground mb-4 gap-1">
        <span>Booked on {formatDate(booking.createdAt)}</span>
        <span>Room ID: {booking.roomId}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t">
        {config.actions.map((action) => (
          <ActionButton
            key={action}
            action={action}
            disabled={
              isDisabled && action !== "view" && action !== "directions"
            }
            onClick={() => {
              if (action === "view") onViewDetails(booking);
              else if (action === "directions") onDirections(booking);
              else if (action === "contact") onContact(booking);
              else if (action === "extend") onExtend(booking);
            }}
          />
        ))}
      </div>
    </div>
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
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Booking Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Booking ID: #{booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Room Info */}
          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Hotel className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {booking.hotelName || "Hotel"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.hotelDistrict && `${booking.hotelDistrict} District`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Room #{booking.roomNumber} • Room ID: {booking.roomId}
                </p>
                <div className="mt-2">
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground border-b pb-2">
              Stay Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" size={18} />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-in Date
                    </label>
                    <p className="text-foreground">
                      {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" size={18} />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-out Date
                    </label>
                    <p className="text-foreground">
                      {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="text-primary" size={18} />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </label>
                    <p className="text-foreground">
                      {numberOfNights} night{numberOfNights !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-primary" size={18} />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Guest Count
                    </label>
                    <p className="text-foreground">
                      {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground border-b pb-2">
              Booking Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Booking Date
                </label>
                <p className="text-foreground">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p className="text-foreground">#{booking.userId}</p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-muted/50 border rounded-md p-4 space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <CreditCard className="text-primary" size={18} />
              Pricing Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Price per night
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(pricePerNight)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {numberOfNights} night{numberOfNights !== 1 ? "s" : ""}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-foreground">
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
      Welcome to YakRooms! You haven't made any hotel bookings yet.
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  const handleCancel = async (booking) => {
    try {
      await api.delete(`/bookings/${booking.id}`);
      toast.success("Booking cancelled successfully", {
        duration: 6000,
      });
      // Refresh current page
      fetchBookings(currentPage);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again.", {
        duration: 6000,
      });
    }
  };

  const handleContact = (booking) => {
    // Open contact modal or redirect to contact page
    toast.info(`Contacting ${booking.hotelName}...`, {
      duration: 6000,
    });
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                My Bookings
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
    </div>
  );
};

export default GuestDashboard;
