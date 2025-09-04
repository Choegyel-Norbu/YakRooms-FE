import { useState, useEffect } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
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
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { CustomDatePicker } from "../../shared/components";

export default function AdminBookingForm({ hotelId, onBookingSuccess }) {
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [selectedRoomForDates, setSelectedRoomForDates] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    roomNumber: "",
    hotelId: hotelId,
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    phone: "",
    guestName: "",
    cid: "",
    destination: "",
    origin: "",
    isBhutanese: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hotelId) {
      fetchAvailableRooms();
    }
  }, [hotelId]);

  const fetchAvailableRooms = async (showErrorToast = true) => {
    try {
      setLoading(true);
      const response = await api.get(`/rooms/available/${hotelId}?page=0&size=50`);
      setAvailableRooms(response.data.content || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      if (showErrorToast) {
        toast.error("Failed to fetch available rooms", {
          duration: 6000
        });
      }
      throw error; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  };

  // Fetch booked dates for the selected room
  const fetchBookedDates = async (roomId) => {
    if (!roomId) return;
    
    setIsLoadingBookedDates(true);
    try {
      const response = await api.get(`/rooms/${roomId}/booked-dates`);
      if (response.data && response.data.bookedDates) {
        setBookedDates(response.data.bookedDates);
        setSelectedRoomForDates(roomId);
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
      toast.error('Failed to load booking calendar', {
        description: 'Could not fetch booked dates. Some dates may appear available when they are not.',
        duration: 4000
      });
      // Reset to empty array on error to show all dates as available
      setBookedDates([]);
    } finally {
      setIsLoadingBookedDates(false);
    }
  };

  // Helper function to check if a date is between two booked dates
  const isDateBetweenBookedDates = (dateString) => {
    if (!dateString || bookedDates.length === 0) return false;
    
    const selectedDate = new Date(dateString);
    const selectedDateString = selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');
    
    // Sort booked dates to find consecutive bookings
    const sortedBookedDates = [...bookedDates].sort();
    
    for (let i = 0; i < sortedBookedDates.length; i++) {
      const currentBookedDate = new Date(sortedBookedDates[i]);
      const nextDay = new Date(currentBookedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const nextDayString = nextDay.getFullYear() + '-' + 
        String(nextDay.getMonth() + 1).padStart(2, '0') + '-' + 
        String(nextDay.getDate()).padStart(2, '0');
      
      // Check if selected date is the day after a booked date
      if (selectedDateString === nextDayString) {
        // Check if the day after selected date is also booked
        const dayAfterSelected = new Date(selectedDate);
        dayAfterSelected.setDate(dayAfterSelected.getDate() + 1);
        const dayAfterSelectedString = dayAfterSelected.getFullYear() + '-' + 
          String(dayAfterSelected.getMonth() + 1).padStart(2, '0') + '-' + 
          String(dayAfterSelected.getDate()).padStart(2, '0');
        
        if (bookedDates.includes(dayAfterSelectedString)) {
          return true; // Selected date is between two booked dates
        }
      }
    }
    
    return false;
  };

  const calculateDays = () => {
    if (!bookingDetails.checkInDate) {
      return 0;
    }
    
    // If check-in date is between booked dates, it's a single night stay
    if (isDateBetweenBookedDates(bookingDetails.checkInDate)) {
      return 1;
    }
    
    if (!bookingDetails.checkOutDate) {
      return 0;
    }
    
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Check if checkout date picker should be hidden
  const shouldHideCheckoutDate = () => {
    return bookingDetails.checkInDate && isDateBetweenBookedDates(bookingDetails.checkInDate);
  };

  const getSelectedRoom = () => {
    return availableRooms.find(room => room.roomNumber === bookingDetails.roomNumber);
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    const selectedRoom = getSelectedRoom();
    if (!selectedRoom) return 0;
    return days * selectedRoom.price;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingDetails.roomNumber) newErrors.roomNumber = "Room number is required";
    // Removed userId validation - now optional for third-party bookings
    if (!bookingDetails.guestName) newErrors.guestName = "Guest name is required";
    
    // Validate check-in date
    if (!bookingDetails.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    } else {
      const checkInDate = new Date(bookingDetails.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      }
    }
    
    // Validate check-out date (skip if check-in is between booked dates)
    if (!shouldHideCheckoutDate() && !bookingDetails.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required";
    } else if (bookingDetails.checkOutDate) {
      const checkOutDate = new Date(bookingDetails.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkOutDate <= today) {
        newErrors.checkOutDate = "Check-out date must be after today";
      } else if (bookingDetails.checkInDate) {
        const checkInDate = new Date(bookingDetails.checkInDate);
        if (checkOutDate <= checkInDate) {
          newErrors.checkOutDate = "Check-out date must be after check-in date";
        }
      }
    }

    // Validate CID Number (only required for Bhutanese citizens)
    if (bookingDetails.isBhutanese) {
      if (!bookingDetails.cid.trim()) {
        newErrors.cid = "CID number is required for Bhutanese citizens";
      } else {
        const cid = bookingDetails.cid.trim();
        
        // Rule 1: Must be exactly 11 digits
        if (!/^\d{11}$/.test(cid)) {
          newErrors.cid = "CID must be exactly 11 digits";
        } else {
          // Rule 2: Dzongkhag code must be 01–20
          const dzongkhagCode = parseInt(cid.substring(0, 2), 10);
          if (dzongkhagCode < 1 || dzongkhagCode > 20) {
            newErrors.cid = "Invalid Dzongkhag code (must be 01–20)";
          }
          // Additional validation: Check if it's not all zeros or all same digits
          else if (/^0{11}$/.test(cid)) {
            newErrors.cid = "CID number cannot be all zeros";
          } else if (/^(\d)\1{10}$/.test(cid)) {
            newErrors.cid = "CID number cannot be all same digits";
          }
          // CID is valid if it passes all the above checks
        }
      }
    }

    // Validate Destination
    if (!bookingDetails.destination.trim()) {
      newErrors.destination = "Destination is required";
    } else if (bookingDetails.destination.length < 2) {
      newErrors.destination = "Destination must be at least 2 characters long";
    } else if (bookingDetails.destination.length > 50) {
      newErrors.destination = "Destination must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(bookingDetails.destination)) {
      newErrors.destination = "Destination can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    // Validate Origin
    if (!bookingDetails.origin.trim()) {
      newErrors.origin = "Origin is required";
    } else if (bookingDetails.origin.length < 2) {
      newErrors.origin = "Origin must be at least 2 characters long";
    } else if (bookingDetails.origin.length > 50) {
      newErrors.origin = "Origin must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(bookingDetails.origin)) {
      newErrors.origin = "Origin can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    const validateBhutanesePhone = (phone) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      if (!cleanPhone) return "Phone number is required";
      if (!/^\d+$/.test(cleanPhone)) return "Phone number should contain only digits";
      if (cleanPhone.length !== 8) return "Phone number must be exactly 8 digits";
      const mobilePattern = /^(16|17|77)\d{6}$/;
      if (!mobilePattern.test(cleanPhone)) return "Invalid Bhutanese mobile number. Must start with 16, 17, or 77.";
      return null;
    };

    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value,
    }));
  };

  // Handle date selection from CustomDatePicker
  const handleDateSelect = (name, date) => {
    let dateValue = '';
    if (date) {
      // Create a new date normalized to avoid timezone issues
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0);
      // Use toLocaleDateString with specific format to avoid timezone issues
      const year = normalizedDate.getFullYear();
      const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
      const day = String(normalizedDate.getDate()).padStart(2, '0');
      dateValue = `${year}-${month}-${day}`;
    }
    
    setBookingDetails((prev) => {
      const newDetails = {
        ...prev,
        [name]: dateValue,
      };
      
      // If selecting check-in date and it's between booked dates, set checkout to next day
      if (name === "checkInDate" && dateValue && isDateBetweenBookedDates(dateValue)) {
        const checkInDate = new Date(dateValue);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
        
        const checkOutDateString = checkOutDate.getFullYear() + '-' + 
          String(checkOutDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(checkOutDate.getDate()).padStart(2, '0');
        
        newDetails.checkOutDate = checkOutDateString;
      }
      
      return newDetails;
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear checkout date error if check-in is between booked dates
    if (name === "checkInDate" && dateValue && isDateBetweenBookedDates(dateValue)) {
      setErrors((prev) => ({
        ...prev,
        checkOutDate: undefined
      }));
    }
  };

  // Handle room selection change to fetch booked dates
  const handleRoomSelect = (roomNumber) => {
    setBookingDetails(prev => ({ ...prev, roomNumber }));
    
    // Find the selected room and fetch its booked dates
    const selectedRoom = availableRooms.find(room => room.roomNumber === roomNumber);
    if (selectedRoom && selectedRoom.id) {
      // Only fetch if we haven't already fetched for this room
      if (selectedRoomForDates !== selectedRoom.id) {
        fetchBookedDates(selectedRoom.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const selectedRoom = getSelectedRoom();
      if (!selectedRoom) {
        toast.error("Selected room not found", {
          duration: 6000
        });
        return;
      }

      const payload = {
        ...bookingDetails,
        roomId: selectedRoom.id,
        hotelId: hotelId,
        totalPrice: calculateTotalPrice(),
        days: calculateDays(),
        // Set userId to null for all third-party bookings
        userId: null,
      };
      
      const res = await api.post("/bookings", payload);
      if (res.status === 200) {
        toast.success("Booking Successful!", {
          description: `Room ${bookingDetails.roomNumber} has been booked for ${bookingDetails.guestName}.`,
          duration: 6000
        });
        
        setBookingDetails({
          roomNumber: "",
          hotelId: hotelId,
          checkInDate: "",
          checkOutDate: "",
          guests: 1,
          phone: "",
          guestName: "",
          cid: "",
          destination: "",
          origin: "",
          isBhutanese: true,
        });
        setErrors({});
        setOpenBookingDialog(false);
        
        // Only call onBookingSuccess to refresh data - avoid multiple API calls
        if (onBookingSuccess) {
          try {
            onBookingSuccess();
          } catch (error) {
            console.error("Error in onBookingSuccess callback:", error);
          }
        }
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description: "There was an error processing the booking. Please try again.",
        duration: 6000
      });
    }
  };

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();
  const selectedRoom = getSelectedRoom();

  return (
    <>
      <Button 
        onClick={() => setOpenBookingDialog(true)}
        className="w-auto cursor-pointer ml-4 sm:ml-0"
        disabled={loading}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {loading ? "Loading..." : "Create New Booking"}
      </Button>

      <Dialog 
        open={openBookingDialog} 
        onOpenChange={(open) => {
          setOpenBookingDialog(open);
          // Reset all validation errors when dialog closes
          if (!open) {
            setErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Book a room for a customer (registered user or walk-in guest)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 overflow-y-auto max-h-[60vh]">
              {/* Loading indicator for booked dates */}
              {isLoadingBookedDates && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.646 9.646 8 0 0118 15.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700">Loading booking calendar...</span>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="roomNumber">Room Number <span className="text-destructive">*</span></Label>
                <Select
                  value={bookingDetails.roomNumber}
                  onValueChange={handleRoomSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.length > 0 ? (
                      availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.roomNumber}>
                          Room {room.roomNumber} - {room.roomType} (Nu. {room.price}/night)
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No rooms available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.roomNumber && <p className="text-sm text-destructive">{errors.roomNumber}</p>}
              </div>

              {/* Date Selection - Moved to top after room selection */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Select Booking Dates</h3>
                
                <div className="grid gap-2">
                  <CustomDatePicker
                    selectedDate={bookingDetails.checkInDate ? new Date(bookingDetails.checkInDate + 'T12:00:00') : null}
                    onDateSelect={(date) => handleDateSelect("checkInDate", date)}
                    blockedDates={bookedDates}
                    minDate={new Date()}
                    placeholder="Select check-in date"
                    label="Check-in Date *"
                    error={errors.checkInDate}
                    disabled={isLoadingBookedDates}
                    className="w-full"
                  />
                </div>

                {!shouldHideCheckoutDate() && (
                  <div className="grid gap-2">
                    <CustomDatePicker
                      selectedDate={bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate + 'T12:00:00') : null}
                      onDateSelect={(date) => handleDateSelect("checkOutDate", date)}
                      blockedDates={bookedDates}
                      minDate={bookingDetails.checkInDate ? new Date(new Date(bookingDetails.checkInDate).getTime() + 24 * 60 * 60 * 1000) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                      placeholder="Select check-out date"
                      label="Check-out Date *"
                      error={errors.checkOutDate}
                      disabled={isLoadingBookedDates}
                      className="w-full"
                    />
                  </div>
                )}
                
                {shouldHideCheckoutDate() && (
                  <div className="grid gap-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">Single Night Stay</p>
                          <p className="text-blue-700 mt-1">
                            This date is available for one night only. Checkout date is automatically set to {bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate).toLocaleDateString() : 'the next day'}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Guest Information</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="guestName">Guest Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="guestName"
                    name="guestName"
                    type="text"
                    value={bookingDetails.guestName}
                    onChange={handleInputChange}
                    placeholder="Enter guest name"
                  />
                  {errors.guestName && <p className="text-sm text-destructive">{errors.guestName}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+975</span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      placeholder="17123456"
                      className="pl-14"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                {/* Nationality Selection */}
                <div className="grid gap-2">
                  <Label className="text-sm">Nationality <span className="text-destructive">*</span></Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">Bhutanese</span>
                    <Switch
                      checked={bookingDetails.isBhutanese}
                      onCheckedChange={(checked) => {
                        setBookingDetails((prev) => ({
                          ...prev,
                          isBhutanese: checked,
                          // Clear CID when switching to non-Bhutanese
                          cid: checked ? prev.cid : ""
                        }));
                        // Clear CID error when switching nationality
                        if (errors.cid) {
                          setErrors((prev) => ({
                            ...prev,
                            cid: undefined
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* CID Number - Only show for Bhutanese */}
                {bookingDetails.isBhutanese && (
                  <div className="grid gap-2">
                    <Label htmlFor="cid" className="text-sm">CID Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="cid"
                      name="cid"
                      type="text"
                      value={bookingDetails.cid}
                      onChange={handleInputChange}
                      placeholder="11 digits (e.g., 10901001065)"
                      maxLength={11}
                      className={`text-sm ${errors.cid ? "border-destructive" : ""}`}
                    />
                    
                    {errors.cid && (
                      <p className="text-sm text-destructive">{errors.cid}</p>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="destination" className="text-sm">Destination <span className="text-destructive">*</span></Label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    value={bookingDetails.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination"
                    className={`text-sm ${errors.destination ? "border-destructive" : ""}`}
                  />
                  {errors.destination && (
                    <p className="text-sm text-destructive">{errors.destination}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="origin" className="text-sm">Origin <span className="text-destructive">*</span></Label>
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    value={bookingDetails.origin}
                    onChange={handleInputChange}
                    placeholder="Enter origin"
                    className={`text-sm ${errors.origin ? "border-destructive" : ""}`}
                  />
                  {errors.origin && (
                    <p className="text-sm text-destructive">{errors.origin}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select
                    name="guests"
                    value={String(bookingDetails.guests)}
                    onValueChange={(value) => setBookingDetails(prev => ({ ...prev, guests: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-2" />

              {selectedRoom && (
                              <div className="space-y-2 text-sm">
                {bookingDetails.checkInDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {new Date(bookingDetails.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {bookingDetails.checkOutDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {new Date(bookingDetails.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium">{selectedRoom.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="font-medium">Nu {selectedRoom.price.toFixed(2)}</span>
                </div>
                {days > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{days} {days === 1 ? "night" : "nights"}</span>
                    <span className="font-medium">Nu {totalPrice.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Price</span>
                  <span>Nu {totalPrice.toFixed(2)}</span>
                </div>
                {days === 0 && (bookingDetails.checkInDate || bookingDetails.checkOutDate) && (
                  <p className="text-sm text-amber-600">
                    {!bookingDetails.checkInDate && !bookingDetails.checkOutDate 
                      ? "Please select check-in and check-out dates."
                      : !bookingDetails.checkInDate 
                      ? "Please select a check-in date."
                      : "Please select a valid check-out date."
                    }
                  </p>
                )}
              </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 