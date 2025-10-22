import { useState, useCallback } from 'react';

/**
 * Custom hook for hourly booking functionality
 * Provides state management, validation, and calculation utilities
 */
export const useTimeBasedBooking = (room, timeBasedBookings = []) => {
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkInTime: "",
    bookHours: 1,
    guests: 1,
    numberOfRooms: 1,
    phone: "",
    cid: "",
    destination: "",
    origin: "",
    isBhutanese: true,
  });
  
  const [errors, setErrors] = useState({});

  // Helper function to check for time conflicts in hourly bookings
  const hasTimeConflict = useCallback((date, checkInTime, bookHours) => {
    if (!date || !checkInTime || !bookHours || timeBasedBookings.length === 0) {
      return false;
    }

    const selectedDate = new Date(date);
    const selectedDateString = selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');

    // Calculate selected booking time range
    const [selectedHours, selectedMinutes] = checkInTime.split(':').map(Number);
    const selectedStartMinutes = selectedHours * 60 + selectedMinutes;
    const selectedEndMinutes = selectedStartMinutes + (bookHours * 60);

    // Check against existing hourly bookings for the same date
    return timeBasedBookings.some(booking => {
      if (booking.date !== selectedDateString) {
        return false;
      }

      // Handle different time formats (HH:MM:SS or HH:MM)
      let existingStartTime = booking.checkInTime;
      let existingEndTime = booking.checkOutTime;
      
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
      return (selectedStartMinutes < existingEndWithBuffer && selectedEndMinutes > existingStartTotalMinutes);
    });
  }, [timeBasedBookings]);

  // Calculate checkout time based on check-in time and duration
  const calculateCheckOutTime = useCallback(() => {
    if (!bookingDetails.checkInTime || !bookingDetails.bookHours) {
      return "";
    }
    
    const [hours, minutes] = bookingDetails.checkInTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (bookingDetails.bookHours * 60);
    const checkoutHours = Math.floor(totalMinutes / 60) % 24;
    const checkoutMinutes = totalMinutes % 60;
    
    return `${checkoutHours.toString().padStart(2, '0')}:${checkoutMinutes.toString().padStart(2, '0')}`;
  }, [bookingDetails.checkInTime, bookingDetails.bookHours]);

  // Calculate total price for hourly booking - now uses full room price
  const calculateTotalPrice = useCallback(() => {
    if (!room?.price) return 0;
    // Use full room price instead of calculating hourly rate
    return room.price * bookingDetails.numberOfRooms;
  }, [room?.price, bookingDetails.numberOfRooms]);

  // Validate phone number (Bhutanese format)
  const validateBhutanesePhone = useCallback((phone) => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!cleanPhone) return "Phone number is required";
    if (!/^\d+$/.test(cleanPhone))
      return "Phone number should contain only digits";
    if (cleanPhone.length !== 8)
      return "Phone number must be exactly 8 digits";
    const mobilePattern = /^(16|17|77)\d{6}$/;
    if (!mobilePattern.test(cleanPhone))
      return "Invalid Bhutanese mobile number. Must start with 16, 17, or 77.";
    return null;
  }, []);

  // Validate CID Number (only required for Bhutanese citizens)
  const validateCID = useCallback((cid) => {
    if (!cid.trim()) {
      return "CID number is required for Bhutanese citizens";
    }
    
    const trimmedCid = cid.trim();
    if (!/^\d{11}$/.test(trimmedCid)) {
      return "CID must be exactly 11 digits";
    }
    
    const dzongkhagCode = parseInt(trimmedCid.substring(0, 2), 10);
    if (dzongkhagCode < 1 || dzongkhagCode > 20) {
      return "Invalid Dzongkhag code (must be 01–20)";
    }
    
    if (/^0{11}$/.test(trimmedCid)) {
      return "CID number cannot be all zeros";
    }
    
    if (/^(\d)\1{10}$/.test(trimmedCid)) {
      return "CID number cannot be all same digits";
    }
    
    return null;
  }, []);

  // Validate destination
  const validateDestination = useCallback((destination) => {
    if (!destination.trim()) {
      return "Destination is required";
    }
    if (destination.length < 2) {
      return "Destination must be at least 2 characters long";
    }
    if (destination.length > 50) {
      return "Destination must not exceed 50 characters";
    }
    if (!/^[a-zA-Z\s\-_.,]+$/.test(destination)) {
      return "Destination can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }
    return null;
  }, []);

  // Validate origin
  const validateOrigin = useCallback((origin) => {
    if (!origin.trim()) {
      return "Origin is required";
    }
    if (origin.length < 2) {
      return "Origin must be at least 2 characters long";
    }
    if (origin.length > 50) {
      return "Origin must not exceed 50 characters";
    }
    if (!/^[a-zA-Z\s\-_.,]+$/.test(origin)) {
      return "Origin can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }
    return null;
  }, []);

  // Validate hourly booking form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate CID Number (only required for Bhutanese citizens)
    if (bookingDetails.isBhutanese) {
      const cidError = validateCID(bookingDetails.cid);
      if (cidError) newErrors.cid = cidError;
    }

    // Validate Destination
    const destinationError = validateDestination(bookingDetails.destination);
    if (destinationError) newErrors.destination = destinationError;

    // Validate Origin
    const originError = validateOrigin(bookingDetails.origin);
    if (originError) newErrors.origin = originError;

    // Validate phone number
    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // Validate check-in date
    if (!bookingDetails.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    } else {
      const checkInDate = new Date(bookingDetails.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      } else {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (checkInDate > oneYearFromNow) {
          newErrors.checkInDate = "Check-in date cannot be more than 1 year in advance";
        }
      }
    }
    
    // Validate check-in time
    if (!bookingDetails.checkInTime) {
      newErrors.checkInTime = "Check-in time is required for hourly booking";
    } else {
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(bookingDetails.checkInTime)) {
        newErrors.checkInTime = "Please enter a valid time in HH:MM format";
      }
    }

    // Validate book hours
    if (!bookingDetails.bookHours || bookingDetails.bookHours < 1) {
      newErrors.bookHours = "Booking duration must be at least 1 hour";
    } else if (bookingDetails.bookHours > 4) {
      newErrors.bookHours = "Maximum booking duration is 4 hours";
    }

    // Check for time conflicts with existing hourly bookings
    if (bookingDetails.checkInDate && bookingDetails.checkInTime && bookingDetails.bookHours) {
      if (hasTimeConflict(bookingDetails.checkInDate, bookingDetails.checkInTime, bookingDetails.bookHours)) {
        newErrors.checkInTime = "This time slot conflicts with an existing hourly booking";
      }
    }

    // Validate guest count
    if (!bookingDetails.guests || bookingDetails.guests < 1) {
      newErrors.guests = "Number of guests is required and must be at least 1";
    } else if (room?.maxGuests > 0 && bookingDetails.guests > room.maxGuests) {
      newErrors.guests = `Maximum ${room.maxGuests} guests allowed for this room`;
    } else if (bookingDetails.guests > 6) {
      newErrors.guests = "Maximum 6 guests allowed";
    }
    
    return newErrors;
  }, [bookingDetails, room?.maxGuests, hasTimeConflict, validateCID, validateDestination, validateOrigin, validateBhutanesePhone]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setBookingDetails((prev) => ({
      ...prev,
      [name]: name === "numberOfRooms" || name === "guests" || name === "bookHours" ? parseInt(value) : value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  // Handle date selection
  const handleDateSelect = useCallback((name, date) => {
    let dateValue = '';
    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0);
      const year = normalizedDate.getFullYear();
      const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
      const day = String(normalizedDate.getDate()).padStart(2, '0');
      dateValue = `${year}-${month}-${day}`;
    }
    
    setBookingDetails((prev) => ({
      ...prev,
      [name]: dateValue,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Real-time validation for date fields
    if (name === "checkInDate" && date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        setErrors((prev) => ({
          ...prev,
          checkInDate: "Check-in date cannot be in the past"
        }));
      }
    }
  }, [errors]);

  // Handle nationality change
  const handleNationalityChange = useCallback((checked) => {
    setBookingDetails((prev) => ({
      ...prev,
      isBhutanese: checked,
      cid: checked ? prev.cid : ""
    }));
    
    // Clear CID error when switching nationality
    if (errors.cid) {
      setErrors((prev) => ({
        ...prev,
        cid: undefined
      }));
    }
  }, [errors.cid]);

  // Handle guests change
  const handleGuestsChange = useCallback((value) => {
    const numGuests = parseInt(value);
    setBookingDetails((prev) => ({
      ...prev,
      guests: numGuests,
    }));
    
    // Clear error for this field
    if (errors.guests) {
      setErrors((prev) => ({
        ...prev,
        guests: undefined
      }));
    }
  }, [errors.guests]);

  // Handle book hours change
  const handleBookHoursChange = useCallback((value) => {
    const hours = parseInt(value);
    setBookingDetails((prev) => ({
      ...prev,
      bookHours: hours,
    }));
    
    // Clear error for this field
    if (errors.bookHours) {
      setErrors((prev) => ({
        ...prev,
        bookHours: undefined
      }));
    }
  }, [errors.bookHours]);

  // Reset form
  const resetForm = useCallback(() => {
    setBookingDetails({
      checkInDate: "",
      checkInTime: "",
      bookHours: 1,
      guests: 1,
      numberOfRooms: 1,
      phone: "",
      cid: "",
      destination: "",
      origin: "",
      isBhutanese: true,
    });
    setErrors({});
  }, []);

  // Clear specific errors
  const clearErrors = useCallback((fieldNames) => {
    if (Array.isArray(fieldNames)) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        fieldNames.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [fieldNames]: undefined
      }));
    }
  }, []);

  // Get existing hourly bookings for a specific date
  const getExistingBookingsForDate = useCallback((date) => {
    if (!date) return [];
    
    const selectedDate = new Date(date);
    const selectedDateString = selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');
    
    return timeBasedBookings.filter(booking => booking.date === selectedDateString);
  }, [timeBasedBookings]);

  // Get blocked time slots for a specific date (returns array of time ranges)
  const getBlockedTimeSlots = useCallback((date) => {
    if (!date) return [];
    
    const existingBookings = getExistingBookingsForDate(date);
    
    return existingBookings.map(booking => {
      // Handle different time formats (HH:MM:SS or HH:MM)
      let startTime = booking.checkInTime;
      let endTime = booking.checkOutTime;
      
      // Remove seconds if present (e.g., "19:00:00" -> "19:00")
      if (startTime.includes(':') && startTime.split(':').length === 3) {
        startTime = startTime.substring(0, 5);
      }
      if (endTime.includes(':') && endTime.split(':').length === 3) {
        endTime = endTime.substring(0, 5);
      }

      return {
        startTime,
        endTime,
        duration: booking.bookHour || booking.durationHours || 1,
        status: booking.status,
        bookingId: booking.id || booking.bookingId
      };
    });
  }, [getExistingBookingsForDate]);

  // Check if a specific time slot is available
  const isTimeSlotAvailable = useCallback((date, checkInTime, bookHours) => {
    return !hasTimeConflict(date, checkInTime, bookHours);
  }, [hasTimeConflict]);

  return {
    // State
    bookingDetails,
    errors,
    
    // Actions
    setBookingDetails,
    setErrors,
    handleInputChange,
    handleDateSelect,
    handleNationalityChange,
    handleGuestsChange,
    handleBookHoursChange,
    resetForm,
    clearErrors,
    
    // Computed values
    calculateCheckOutTime,
    calculateTotalPrice,
    validateForm,
    hasTimeConflict,
    getExistingBookingsForDate,
    getBlockedTimeSlots,
    isTimeSlotAvailable,
    
    // Validation helpers
    validateBhutanesePhone,
    validateCID,
    validateDestination,
    validateOrigin,
  };
};
