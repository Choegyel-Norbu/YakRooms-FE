import { useState, useEffect } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { handlePaymentRedirect } from "@/shared/utils/paymentRedirect";
import { useTimeBasedBooking } from "../../shared/hooks/useTimeBasedBooking";

import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/shared/components/dialog";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { Separator } from "@/shared/components/separator";
import { Switch } from "@/shared/components/switch";
import { AlertTriangle } from "lucide-react";
import { BookingSuccessModal, CustomDatePicker } from "../../shared/components";
import { toast } from "sonner";

export default function TimeBasedBookingDialog({ 
  isOpen, 
  onClose, 
  room, 
  hotelId, 
  hotel,
  onBookingSuccess 
}) {
  const { userId } = useAuth();
  const [openBookingSuccessModal, setOpenBookingSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [timeBasedBookings, setTimeBasedBookings] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Use the custom hook for time-based booking logic
  const {
    bookingDetails,
    errors,
    setErrors,
    handleInputChange,
    handleDateSelect,
    handleNationalityChange,
    handleGuestsChange,
    handleBookHoursChange,
    resetForm,
    calculateCheckOutTime,
    calculateTotalPrice,
    validateForm,
    getExistingBookingsForDate,
    getBlockedTimeSlots,
    isTimeSlotAvailable,
  } = useTimeBasedBooking(room, timeBasedBookings);

  // Fetch booked dates for the room
  const fetchBookedDates = async () => {
    if (!room?.id) return;
    
    setIsLoadingBookedDates(true);
    try {
      const bookedResponse = await api.get(`/rooms/${room.id}/booked-dates`);
      
      if (bookedResponse.data) {
        setBookedDates(bookedResponse.data.bookedDates || []);
        setTimeBasedBookings(bookedResponse.data.timeBasedBookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.info('Please login to view detailed availability', {
          description: 'You can still proceed with booking, but some dates may appear available when they are not.',
          duration: 4000
        });
      } else {
        toast.error('Failed to load booking calendar', {
          description: 'Could not fetch booked dates. Some dates may appear available when they are not.',
          duration: 4000
        });
      }
    } finally {
      setIsLoadingBookedDates(false);
    }
  };

  // Get blocked dates for hourly booking (only block dates that have regular bookings)
  const getBlockedDates = () => {
    const hourlyDates = timeBasedBookings.map(booking => booking.date);
    return bookedDates.filter(date => !hourlyDates.includes(date));
  };

  // Helper function to scroll to and focus the first error field
  const scrollToFirstError = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) return;

    const fieldPriority = [
      'checkInDate',
      'checkInTime',
      'bookHours',
      'phone',
      'cid',
      'destination',
      'origin',
      'guests'
    ];

    const firstErrorField = fieldPriority.find(field => errors[field]);
    
    if (firstErrorField) {
      setTimeout(() => {
        let elementToFocus = null;
        
        if (firstErrorField === 'checkInDate') {
          elementToFocus = document.querySelector(`[data-field="${firstErrorField}"] input`) ||
                          document.querySelector(`[data-field="${firstErrorField}"] button`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        } else if (firstErrorField === 'guests') {
          elementToFocus = document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`#${firstErrorField}`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        } else {
          elementToFocus = document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`#${firstErrorField}`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        }

        if (elementToFocus) {
          elementToFocus.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          setTimeout(() => {
            elementToFocus.focus();
          }, 300);
        }
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      scrollToFirstError(formErrors);
      return;
    }

    try {
      setIsBookingLoading(true);
      const payload = {
        ...bookingDetails,
        roomId: room.id,
        hotelId: hotelId,
        totalPrice: calculateTotalPrice(),
        userId,
        days: Math.ceil(bookingDetails.bookHours / 24), // Convert hours to days for pricing
        adminBooking: false,
        initiatePayment: true,
        bookingType: "hourly",
        hourly: true,
        bookHour: bookingDetails.bookHours,
        checkOutTime: calculateCheckOutTime(),
        durationHours: bookingDetails.bookHours
      };
      
      const res = await api.post("/bookings", payload);
      
      if (res.status === 200) {
        // Check if BFS-Secure payment response is present
        if (res.data?.paymentFormHtml) {
          handleBFSPaymentRedirect(res.data);
          return;
        }
        
        // Prepare booking data for success modal
        const bookingData = {
          ...payload,
          id: res.data?.id || res.data?.bookingId || `booking_${Date.now()}`,
          hotelName: room.hotelName,
          roomNumber: room.roomNumber,
          room: room,
          bookingTime: new Date().toISOString(),
          paymentStatus: res.data?.paymentStatus || 'pending',
          passcode: res.data?.passcode
        };
        
        // Set success data and show modal
        setSuccessBookingData(bookingData);
        setOpenBookingSuccessModal(true);
        
        // Show toast notification
        toast.success("Hourly Booking Successful!", {
          description: "Your room has been booked with hourly details. QR code generated!",
          duration: 6000
        });
        
        // Reset form and close dialog
        resetForm();
        
        onClose();
        
        // Call success callback if provided
        if (onBookingSuccess) {
          onBookingSuccess(bookingData);
        }
      }
    } catch (error) {
      console.error("Hourly booking failed:", error);
      toast.error("Hourly Booking Failed", {
        description: "There was an error processing your hourly booking. Please try again.",
        duration: 6000
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Handle BFS-Secure payment redirect
  const handleBFSPaymentRedirect = (bookingResponse) => {
    try {
      handlePaymentRedirect(bookingResponse, {
        gatewayName: 'BFS-Secure',
        onSuccess: (paymentData) => {
          toast.success("Redirecting to Payment Gateway", {
            description: "You are being redirected to BFS-Secure for payment processing. Please complete the payment and you will be redirected back.",
            duration: 8000
          });
          
          onClose();
        },
        onError: (error) => {
          toast.error("Payment Redirect Failed", {
            description: "There was an error redirecting to the payment gateway. Please try again.",
            duration: 6000
          });
        }
      });
      
    } catch (error) {
      console.error("BFS Payment redirect failed:", error);
      toast.error("Payment Redirect Failed", {
        description: "There was an error redirecting to the payment gateway. Please try again.",
        duration: 6000
      });
    }
  };

  // Fetch booked dates when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchBookedDates();
    }
  }, [isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const totalPrice = calculateTotalPrice();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Hourly Booking - {room.hotelName}</DialogTitle>
            <DialogDescription>Room {room.roomNumber} - Hourly Booking</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[50vh] overflow-y-auto pr-2">
              {/* Loading indicator for booked dates */}
              {isLoadingBookedDates && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.646 9.646 8 0 0118 15.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700">Loading booking calendar...</span>
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Select Your Date & Time</h3>
                
                <div className="grid gap-2">
                  <div data-field="checkInDate">
                    <CustomDatePicker
                      selectedDate={bookingDetails.checkInDate ? new Date(bookingDetails.checkInDate + 'T12:00:00') : null}
                      onDateSelect={(date) => handleDateSelect("checkInDate", date)}
                      blockedDates={getBlockedDates()}
                      minDate={new Date()}
                      placeholder="Select check-in date"
                      label="Check-in Date *"
                      error={errors.checkInDate}
                      disabled={isLoadingBookedDates}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Hourly booking fields */}
                <div className="grid gap-4">
                  <div className="grid gap-2" data-field="checkInTime">
                    <Label htmlFor="checkInTime" className="text-sm">
                      Check-in Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      value={bookingDetails.checkInTime}
                      onChange={handleInputChange}
                      className={`text-sm ${
                        errors.checkInTime 
                          ? "border-destructive" 
                          : bookingDetails.checkInDate && bookingDetails.checkInTime && bookingDetails.bookHours && 
                            !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                    />
                    {errors.checkInTime && (
                      <p className="text-sm text-destructive">{errors.checkInTime}</p>
                    )}
                  </div>

                  <div className="grid gap-2" data-field="bookHours">
                    <Label htmlFor="bookHours" className="text-sm">
                      Duration (Hours) <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      name="bookHours"
                      value={String(bookingDetails.bookHours)}
                      onValueChange={handleBookHoursChange}
                    >
                      <SelectTrigger className={`text-sm ${
                        errors.bookHours 
                          ? "border-destructive" 
                          : bookingDetails.checkInDate && bookingDetails.checkInTime && bookingDetails.bookHours && 
                            !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 4 }, (_, i) => i + 1).map((hours) => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} {hours === 1 ? "hour" : "hours"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bookHours && (
                      <p className="text-sm text-destructive">{errors.bookHours}</p>
                    )}
                  </div>

                  {/* Existing hourly bookings for selected date */}
                  {bookingDetails.checkInDate && (() => {
                    const blockedTimeSlots = getBlockedTimeSlots(bookingDetails.checkInDate);
                    
                    return blockedTimeSlots.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div className="text-sm">
                            <p className="font-medium text-amber-800">Blocked Time Slots</p>
                            <div className="text-amber-700 mt-1 space-y-1">
                              {blockedTimeSlots.map((slot, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span>
                                    {slot.startTime} - {slot.endTime} ({slot.duration} {slot.duration === 1 ? 'hour' : 'hours'})
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    slot.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    slot.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    slot.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {slot.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 mt-2">
                              Please choose a different time slot to avoid conflicts with existing bookings.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Hourly booking summary */}
                  {bookingDetails.checkInTime && bookingDetails.bookHours && (
                    <div className={`p-3 border rounded-lg ${
                      bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        <div className="text-sm">
                          <p className={`font-medium ${
                            bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                              ? 'text-red-800'
                              : 'text-blue-800'
                          }`}>
                            {bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                              ? 'Time Slot Conflict Detected'
                              : 'Your Hourly Booking'
                            }
                          </p>
                          <p className={`mt-1 ${
                            bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}>
                            Check-in: {bookingDetails.checkInTime} | 
                            Duration: {bookingDetails.bookHours} {bookingDetails.bookHours === 1 ? "hour" : "hours"} | 
                            Check-out: {calculateCheckOutTime()}
                          </p>
                          {bookingDetails.checkInDate && !isTimeSlotAvailable(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours) && (
                            <p className="text-xs text-red-600 mt-2">
                              This time slot conflicts with an existing booking. Please choose a different time or duration.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Guest Information</h3>
                
                <div className="grid gap-2" data-field="phone">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +975
                    </span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      placeholder="17123456"
                      className={`pl-14 placeholder:text-muted-foreground/50 ${errors.phone ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Nationality Selection */}
                <div className="grid gap-2">
                  <Label className="text-sm">Nationality </Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">Bhutanese</span>
                    <Switch
                      checked={bookingDetails.isBhutanese}
                      onCheckedChange={handleNationalityChange}
                    />
                  </div>
                </div>

                {/* CID Number - Only show for Bhutanese */}
                {bookingDetails.isBhutanese && (
                  <div className="grid gap-2" data-field="cid">
                    <Label htmlFor="cid" className="text-sm">CID Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="cid"
                      name="cid"
                      type="text"
                      value={bookingDetails.cid}
                      onChange={handleInputChange}
                      placeholder="11 digits"
                      maxLength={11}
                      className={`text-sm placeholder:text-muted-foreground/50 ${errors.cid ? "border-destructive" : ""}`}
                    />
                    
                    {/* CID Warning Message */}
                    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-xs text-amber-800">
                        <strong>Important:</strong> Please enter your correct CID number as you will need to present it during check-in for verification.
                      </p>
                    </div>
                    
                    {errors.cid && (
                      <p className="text-sm text-destructive">{errors.cid}</p>
                    )}
                  </div>
                )}

                <div className="grid gap-2" data-field="destination">
                  <Label htmlFor="destination" className="text-sm">Destination <span className="text-destructive">*</span></Label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    value={bookingDetails.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination"
                    className={`text-sm placeholder:text-muted-foreground/50 ${errors.destination ? "border-destructive" : ""}`}
                  />
                  {errors.destination && (
                    <p className="text-sm text-destructive">{errors.destination}</p>
                  )}
                </div>

                <div className="grid gap-2" data-field="origin">
                  <Label htmlFor="origin" className="text-sm">Origin <span className="text-destructive">*</span></Label>
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    value={bookingDetails.origin}
                    onChange={handleInputChange}
                    placeholder="Enter origin"
                    className={`text-sm placeholder:text-muted-foreground/50 ${errors.origin ? "border-destructive" : ""}`}
                  />
                  {errors.origin && (
                    <p className="text-sm text-destructive">{errors.origin}</p>
                  )}
                </div>

                <div className="grid gap-2" data-field="guests">
                  <Label htmlFor="guests" className="text-sm">
                    Number of Guests <span className="text-destructive">*</span>
                  </Label>
                    <Select
                      name="guests"
                      value={String(bookingDetails.guests)}
                      onValueChange={handleGuestsChange}
                    >
                    <SelectTrigger className={`text-sm ${errors.guests ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const maxGuests = room.maxGuests > 0 ? Math.min(room.maxGuests, 6) : 6;
                        return Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {errors.guests && (
                    <p className="text-sm text-destructive">{errors.guests}</p>
                  )}
                  {room.maxGuests > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Maximum {room.maxGuests} guests allowed for this room
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2 text-sm">
                {bookingDetails.checkInDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in Date</span>
                    <span className="font-medium">
                      {new Date(bookingDetails.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Price</span>
                  <span className="font-medium">
                    Nu {room.price.toFixed(2)}
                  </span>
                </div>
                {bookingDetails.numberOfRooms > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {bookingDetails.numberOfRooms} room(s)
                    </span>
                    <span className="font-medium">
                      Nu {(room.price * bookingDetails.numberOfRooms).toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Price</span>
                  <span>Nu {totalPrice.toFixed(2)}</span>
                </div>
                {(!bookingDetails.checkInDate || !bookingDetails.checkInTime || !bookingDetails.bookHours) && (
                  <p className="text-sm text-amber-600">
                    {!bookingDetails.checkInDate 
                      ? "Please select a check-in date."
                      : !bookingDetails.checkInTime
                      ? "Please select a check-in time."
                      : !bookingDetails.bookHours
                      ? "Please select booking duration."
                      : "Please complete all required fields."
                    }
                  </p>
                )}
                
                {/* Date validation helper */}
                {(errors.checkInDate || errors.checkInTime || errors.bookHours) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-800">Hourly Booking Issues</p>
                        <p className="text-red-700 mt-1">
                          Please review your date and time selections for hourly booking.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingDetails(prev => ({
                              ...prev,
                              checkInDate: "",
                              checkInTime: "",
                              bookHours: 1
                            }));
                            setErrors(prev => ({
                              ...prev,
                              checkInDate: undefined,
                              checkInTime: undefined,
                              bookHours: undefined
                            }));
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                        >
                          Clear all date/time and start over
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isBookingLoading}>
                {isBookingLoading ? "Booking..." : "Book Hourly"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Success Modal with QR Code */}
      <BookingSuccessModal
        isOpen={openBookingSuccessModal}
        onClose={() => setOpenBookingSuccessModal(false)}
        bookingData={successBookingData}
      />
    </>
  );
}
