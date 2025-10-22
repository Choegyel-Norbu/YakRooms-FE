import { useState, useEffect } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { handlePaymentRedirect } from "@/shared/utils/paymentRedirect";

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
import { CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import LoginModal from "../authentication/LoginModal";
import { BookingSuccessModal, CustomDatePicker } from "../../shared/components";
import TimeBasedBookingDialog from "./TimeBasedBookingDialog";
import { toast } from "sonner"; // Using sonner for toasts

export default function RoomBookingCard({ room, hotelId, hotel }) {
  const { userId, isAuthenticated, getCurrentActiveRole, switchToRole, hasRole, setRedirectUrl } = useAuth();
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRoleSwitchDialog, setOpenRoleSwitchDialog] = useState(false);
  const [openBookingSuccessModal, setOpenBookingSuccessModal] = useState(false);
  const [openImmediateBookingDialog, setOpenImmediateBookingDialog] = useState(false);
  const [openTimeBasedBookingDialog, setOpenTimeBasedBookingDialog] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [pendingBookingType, setPendingBookingType] = useState(null); // Track which booking type was requested
  const [isImmediateBookingLoading, setIsImmediateBookingLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [timeBasedBookings, setTimeBasedBookings] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [hasCheckedBookings, setHasCheckedBookings] = useState(false);
  const [isTodayAvailable, setIsTodayAvailable] = useState(true);
  const [immediateBookingDetails, setImmediateBookingDetails] = useState({
    phone: "",
    cid: "",
    destination: "",
    origin: "",
    guests: 1,
    isBhutanese: true,
  });
  const [immediateBookingErrors, setImmediateBookingErrors] = useState({});
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    numberOfRooms: 1,
    phone: "",
    cid: "",
    destination: "",
    origin: "",
    isBhutanese: true,
  });
  const [errors, setErrors] = useState({});
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const bookingType = "regular"; // Define booking type for standard booking

  // Fetch booked dates for the room and check availability
  const fetchBookedDates = async () => {
    if (!room?.id) return;
    
    setIsLoadingBookedDates(true);
    try {
      // Fetch booked dates
      const bookedResponse = await api.get(`/rooms/${room.id}/booked-dates`);
      
      if (bookedResponse.data) {
        // Set regular booked dates
        setBookedDates(bookedResponse.data.bookedDates || []);
        
        // Set hourly bookings
        setTimeBasedBookings(bookedResponse.data.timeBasedBookings || []);
        
        // Check if today is available for immediate booking
        const today = new Date();
        const todayString = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0');
        
        // For immediate booking, only check regular booked dates (not hourly)
        const isTodayBooked = (bookedResponse.data.bookedDates || []).includes(todayString);
        setIsTodayAvailable(!isTodayBooked);
        setHasCheckedBookings(true);
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
      
      // Handle authentication errors gracefully for unauthenticated users
      if (error.response?.status === 401 || error.response?.status === 403) {
        // For unauthenticated users, show a message that they can view availability but need to login to book
        toast.info('Please login to view detailed availability', {
          description: 'You can still proceed with booking, but some dates may appear available when they are not.',
          duration: 4000
        });
      } else {
        // For other errors, show the standard error message
        toast.error('Failed to load booking calendar', {
          description: 'Could not fetch booked dates. Some dates may appear available when they are not.',
          duration: 4000
        });
      }
      
      // Still mark as checked even if there's an error
      setHasCheckedBookings(true);
      setIsTodayAvailable(true); // Assume available on error
    } finally {
      setIsLoadingBookedDates(false);
    }
  };

  // Handle check bookings button click
  const handleCheckBookings = async () => {
    await fetchBookedDates();
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

  // Helper function to check if the next day after check-in date is booked
  const isNextDayBooked = (checkInDateString) => {
    if (!checkInDateString || bookedDates.length === 0) return false;
    
    const checkInDate = new Date(checkInDateString);
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const nextDayString = nextDay.getFullYear() + '-' + 
      String(nextDay.getMonth() + 1).padStart(2, '0') + '-' + 
      String(nextDay.getDate()).padStart(2, '0');
    
    return bookedDates.includes(nextDayString);
  };

  // Helper function to check for time conflicts in hourly bookings
  const hasTimeConflict = (date, checkInTime, bookHours) => {
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

      // Calculate existing booking time range
      const [existingStartHours, existingStartMins] = booking.checkInTime.split(':').map(Number);
      const [existingEndHours, existingEndMins] = booking.checkOutTime.split(':').map(Number);
      
      const existingStartTotalMinutes = existingStartHours * 60 + existingStartMins;
      const existingEndTotalMinutes = existingEndHours * 60 + existingEndMins;

      // Check for overlap
      return (selectedStartMinutes < existingEndTotalMinutes && selectedEndMinutes > existingStartTotalMinutes);
    });
  };

  // Helper function to check if a time-based booking is in the afternoon (after 12 noon)
  const isAfternoonTimeBasedBooking = (booking) => {
    if (!booking.checkInTime) return false;
    
    // Handle different time formats (HH:MM:SS or HH:MM)
    let checkInTime = booking.checkInTime;
    if (checkInTime.includes(':') && checkInTime.split(':').length === 3) {
      checkInTime = checkInTime.substring(0, 5);
    }
    
    const [hours] = checkInTime.split(':').map(Number);
    return hours >= 12; // 12 noon and after
  };

  // Get blocked dates based on booking type
  const getBlockedDates = () => {
    // For regular booking, block regular booked dates and only dates with afternoon time-based bookings
    // This allows standard booking on dates that only have morning time-based bookings (before 12 noon)
    const afternoonTimeBasedDates = timeBasedBookings
      .filter(isAfternoonTimeBasedBooking)
      .map(booking => booking.date);
    
    // Remove duplicates and return combined blocked dates
    const allBlockedDates = [...bookedDates, ...afternoonTimeBasedDates];
    return [...new Set(allBlockedDates)]; // Remove duplicates
  };

  // Get minimum date for check-out (must be after check-in)
  const getMinCheckOutDate = () => {
    if (!bookingDetails.checkInDate) {
      // If no check-in date, minimum is tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // If check-in date is selected, minimum is day after check-in
    const checkIn = new Date(bookingDetails.checkInDate);
    const minCheckOut = new Date(checkIn);
    minCheckOut.setDate(minCheckOut.getDate() + 1);
    return minCheckOut;
  };

  // Check if checkout date picker should be hidden
  const shouldHideCheckoutDate = () => {
    if (!bookingDetails.checkInDate) return false;
    
    // Hide if check-in date is between two booked dates
    if (isDateBetweenBookedDates(bookingDetails.checkInDate)) {
      return true;
    }
    
    // Hide if the next day after check-in is already booked
    if (isNextDayBooked(bookingDetails.checkInDate)) {
      return true;
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
    
    // If the next day after check-in is booked, it's a single night stay
    if (isNextDayBooked(bookingDetails.checkInDate)) {
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


  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * room.price * bookingDetails.numberOfRooms;
  };

  // Helper function to scroll to and focus the first error field
  const scrollToFirstError = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) return;

    // Define field priority order for scrolling
    const fieldPriority = [
      'checkInDate',
      'checkOutDate',
      'checkInTime',
      'bookHours',
      'phone',
      'cid',
      'destination',
      'origin',
      'guests'
    ];

    // Find the first error field based on priority
    const firstErrorField = fieldPriority.find(field => errors[field]);
    
    if (firstErrorField) {
      // Small delay to ensure DOM is updated with error states
      setTimeout(() => {
        let elementToFocus = null;
        
        // Handle different field types
        if (firstErrorField === 'checkInDate' || firstErrorField === 'checkOutDate') {
          // For date pickers, try to find the input element
          elementToFocus = document.querySelector(`[data-field="${firstErrorField}"] input`) ||
                          document.querySelector(`[data-field="${firstErrorField}"] button`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        } else if (firstErrorField === 'guests') {
          // For select fields
          elementToFocus = document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`#${firstErrorField}`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        } else {
          // For regular input fields
          elementToFocus = document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`#${firstErrorField}`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        }

        if (elementToFocus) {
          // Scroll to the element
          elementToFocus.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Focus the element after scrolling
          setTimeout(() => {
            elementToFocus.focus();
          }, 300);
        }
      }, 100);
    }
  };

  const validateForm = () => {
    console.log("Validating form with data:", bookingDetails);
    const newErrors = {};
    const validateBhutanesePhone = (phone) => {
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
    };

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

    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // Comprehensive check-in date validation
    if (!bookingDetails.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    } else {
      const checkInDate = new Date(bookingDetails.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
      
      // Check if check-in date is in the past
      if (checkInDate < today) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      }

      // Check if it's too far in the future (optional business rule - 1 year max)
      else {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (checkInDate > oneYearFromNow) {
          newErrors.checkInDate = "Check-in date cannot be more than 1 year in advance";
        }
      }
    }
    
    // Comprehensive check-out date validation (skip if check-in is between booked dates or hourly booking)
    if (!shouldHideCheckoutDate() && !bookingDetails.checkOutDate && bookingType === "regular") {
      newErrors.checkOutDate = "Check-out date is required";
    } else if (bookingDetails.checkOutDate && bookingType === "regular") {
      const checkOutDate = new Date(bookingDetails.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
      
      // Check if check-out date is in the past or today
      if (checkOutDate <= today) {
        newErrors.checkOutDate = "Check-out date must be after today";
      }
      // Check if check-out is before or same as check-in
      else if (bookingDetails.checkInDate) {
        const checkInDate = new Date(bookingDetails.checkInDate);
        if (checkOutDate <= checkInDate) {
          newErrors.checkOutDate = "Check-out date must be after check-in date";
        }

        // Check for maximum stay duration (optional business rule - 30 days max)
        else {
          const diffTime = checkOutDate.getTime() - checkInDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 30) {
            newErrors.checkOutDate = "Maximum stay duration is 30 days";
          }
        }
      }

    }


    // Validate guest count
    if (!bookingDetails.guests || bookingDetails.guests < 1) {
      newErrors.guests = "Number of guests is required and must be at least 1";
    } else if (room.maxGuests > 0 && bookingDetails.guests > room.maxGuests) {
      newErrors.guests = `Maximum ${room.maxGuests} guests allowed for this room`;
    } else if (bookingDetails.guests > 6) {
      newErrors.guests = "Maximum 6 guests allowed";
    }
    
    console.log("Validation errors:", newErrors);
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setBookingDetails((prev) => ({
      ...prev,
      [name]:
        name === "numberOfRooms" || name === "guests" || name === "bookHours" ? parseInt(value) : value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle date selection from CustomDatePicker
  const handleDateSelect = async (name, date) => {
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
      
      // If selecting check-in date and the next day is booked, set checkout to next day
      if (name === "checkInDate" && dateValue && isNextDayBooked(dateValue)) {
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
    
    // Clear checkout date error if check-in is between booked dates or next day is booked
    if (name === "checkInDate" && dateValue && (isDateBetweenBookedDates(dateValue) || isNextDayBooked(dateValue))) {
      setErrors((prev) => ({
        ...prev,
        checkOutDate: undefined
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
      
      // Also validate checkout if it exists and check-in is not between booked dates or next day is not booked
      if (bookingDetails.checkOutDate && !isDateBetweenBookedDates(dateValue) && !isNextDayBooked(dateValue)) {
        const checkOutDate = new Date(bookingDetails.checkOutDate);
        if (checkOutDate <= date) {
          setErrors((prev) => ({
            ...prev,
            checkOutDate: "Check-out date must be after check-in date"
          }));
        }
      }
    }
    
    if (name === "checkOutDate" && date && bookingDetails.checkInDate) {
      const checkInDate = new Date(bookingDetails.checkInDate);
      
      if (date <= checkInDate) {
        setErrors((prev) => ({
          ...prev,
          checkOutDate: "Check-out date must be after check-in date"
        }));
      }
    }
  };



  const handleImmediateInputChange = (e) => {
    const { name, value } = e.target;
    
    setImmediateBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (immediateBookingErrors[name]) {
      setImmediateBookingErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Get immediate booking dates (fixed: today and tomorrow)
  const getImmediateBookingDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      checkInDate: formatDate(today),
      checkOutDate: formatDate(tomorrow),
      checkInDisplay: today.toLocaleDateString(),
      checkOutDisplay: tomorrow.toLocaleDateString()
    };
  };

  // Helper function to scroll to and focus the first error field for immediate booking
  const scrollToFirstImmediateError = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) return;

    // Define field priority order for scrolling (immediate booking specific)
    const fieldPriority = [
      'phone',
      'cid',
      'destination',
      'origin',
      'guests'
    ];

    // Find the first error field based on priority
    const firstErrorField = fieldPriority.find(field => errors[field]);
    
    if (firstErrorField) {
      // Small delay to ensure DOM is updated with error states
      setTimeout(() => {
        let elementToFocus = null;
        
        // Handle different field types for immediate booking
        if (firstErrorField === 'guests') {
          // For select fields
          elementToFocus = document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`#immediate${firstErrorField.charAt(0).toUpperCase() + firstErrorField.slice(1)}`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        } else {
          // For regular input fields (with immediate prefix)
          elementToFocus = document.querySelector(`#immediate${firstErrorField.charAt(0).toUpperCase() + firstErrorField.slice(1)}`) ||
                          document.querySelector(`[name="${firstErrorField}"]`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`);
        }

        if (elementToFocus) {
          // Scroll to the element
          elementToFocus.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Focus the element after scrolling
          setTimeout(() => {
            elementToFocus.focus();
          }, 300);
        }
      }, 100);
    }
  };

  const validateImmediateBooking = () => {
    const newErrors = {};
    
    // Validate phone number (Bhutanese format)
    const validateBhutanesePhone = (phone) => {
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
    };

    // Validate CID Number (only required for Bhutanese citizens)
    if (immediateBookingDetails.isBhutanese) {
      if (!immediateBookingDetails.cid.trim()) {
        newErrors.cid = "CID number is required for Bhutanese citizens";
      } else {
        const cid = immediateBookingDetails.cid.trim();
        if (!/^\d{11}$/.test(cid)) {
          newErrors.cid = "CID must be exactly 11 digits";
        } else {
          const dzongkhagCode = parseInt(cid.substring(0, 2), 10);
          if (dzongkhagCode < 1 || dzongkhagCode > 20) {
            newErrors.cid = "Invalid Dzongkhag code (must be 01–20)";
          } else if (/^0{11}$/.test(cid)) {
            newErrors.cid = "CID number cannot be all zeros";
          } else if (/^(\d)\1{10}$/.test(cid)) {
            newErrors.cid = "CID number cannot be all same digits";
          }
        }
      }
    }

    // Validate Destination
    if (!immediateBookingDetails.destination.trim()) {
      newErrors.destination = "Destination is required";
    } else if (immediateBookingDetails.destination.length < 2) {
      newErrors.destination = "Destination must be at least 2 characters long";
    } else if (immediateBookingDetails.destination.length > 50) {
      newErrors.destination = "Destination must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(immediateBookingDetails.destination)) {
      newErrors.destination = "Destination can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    // Validate Origin
    if (!immediateBookingDetails.origin.trim()) {
      newErrors.origin = "Origin is required";
    } else if (immediateBookingDetails.origin.length < 2) {
      newErrors.origin = "Origin must be at least 2 characters long";
    } else if (immediateBookingDetails.origin.length > 50) {
      newErrors.origin = "Origin must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(immediateBookingDetails.origin)) {
      newErrors.origin = "Origin can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    const phoneError = validateBhutanesePhone(immediateBookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // Validate guest count
    if (!immediateBookingDetails.guests || immediateBookingDetails.guests < 1) {
      newErrors.guests = "Number of guests is required and must be at least 1";
    } else if (room.maxGuests > 0 && immediateBookingDetails.guests > room.maxGuests) {
      newErrors.guests = `Maximum ${room.maxGuests} guests allowed for this room`;
    } else if (immediateBookingDetails.guests > 6) {
      newErrors.guests = "Maximum 6 guests allowed";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Standard booking form submitted, validating...");
    const formErrors = validateForm();
    console.log("Form validation result:", formErrors);
    if (Object.keys(formErrors).length > 0) {
      console.log("Setting errors:", formErrors);
      setErrors(formErrors);
      // Scroll to the first error field
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
        days: calculateDays(),
        adminBooking: false,
        initiatePayment: true,
        bookingType: "regular"
      };
      
      // Use advanced booking endpoint for detailed form submissions
      const res = await api.post("/bookings", payload);
      
      if (res.status === 200) {
        // Check if BFS-Secure payment response is present
        if (res.data?.paymentFormHtml) {
          // Handle BFS-Secure payment redirect
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
        toast.success("Standard Booking Successful!", {
          description: "Your room has been booked with standard details. QR code generated!",
          duration: 6000
        });
        
        // Reset form and close booking dialog
        setBookingDetails({
          checkInDate: "",
          checkOutDate: "",
          guests: 1,
          numberOfRooms: 1,
          phone: "",
          cid: "",
          destination: "",
          origin: "",
          isBhutanese: true,
        });
        setErrors({});
        
        
        setOpenBookingDialog(false);
      }
    } catch (error) {
      console.error("Standard booking failed:", error);
      toast.error("Standard Booking Failed", {
        description:
          "There was an error processing your standard booking. Please try again.",
        duration: 6000
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Handle immediate booking with minimal data
  const handleImmediateBooking = async () => {
    // Validate form first
    const formErrors = validateImmediateBooking();
    if (Object.keys(formErrors).length > 0) {
      setImmediateBookingErrors(formErrors);
      // Scroll to the first error field
      scrollToFirstImmediateError(formErrors);
      return;
    }

    setIsImmediateBookingLoading(true);
    try {
      // For immediate booking, use fixed dates (today and tomorrow)
      const { checkInDate, checkOutDate } = getImmediateBookingDates();
      const daysDiff = 1; // Always 1 night for immediate booking
      
      const immediatePayload = {
        roomId: room.id,
        hotelId: hotelId,
        userId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: immediateBookingDetails.guests,
        numberOfRooms: 1,
        totalPrice: daysDiff * room.price,
        days: daysDiff,
        // Use user input values
        phone: immediateBookingDetails.phone,
        cid: immediateBookingDetails.cid,
        destination: immediateBookingDetails.destination,
        origin: immediateBookingDetails.origin,
        adminBooking: false,
        initiatePayment: true,
        // Hourly booking fields (immediate booking is always regular)
        timeBased: false,
        bookHour: null,
        bookingType: "regular"
      };
      
      const res = await api.post("/bookings", immediatePayload);
      
      if (res.status === 200) {
        // Check if BFS-Secure payment response is present
        if (res.data?.paymentFormHtml) {
          // Handle BFS-Secure payment redirect
          handleBFSPaymentRedirect(res.data);
          return;
        }
        
        // Prepare booking data for success modal
        const bookingData = {
          ...immediatePayload,
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
        
        // Close the immediate booking dialog
        setOpenImmediateBookingDialog(false);
        
        // Reset form
        setImmediateBookingDetails({
          phone: "",
          cid: "",
          destination: "",
          origin: "",
          guests: 1,
          isBhutanese: true,
        });
        setImmediateBookingErrors({});
        
        
        // Show toast notification
        toast.success("Booking Successful!", {
          description: "Your room has been booked for tonight! QR code generated!",
          duration: 6000
        });
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
        duration: 6000
      });
    } finally {
      setIsImmediateBookingLoading(false);
    }
  };

  // Handle BFS-Secure payment redirect
  const handleBFSPaymentRedirect = (bookingResponse) => {
    try {
      // Use the standardized payment redirect utility
      handlePaymentRedirect(bookingResponse, {
        gatewayName: 'BFS-Secure',
        onSuccess: (paymentData) => {
          toast.success("Redirecting to Payment Gateway", {
            description: "You are being redirected to BFS-Secure for payment processing. Please complete the payment and you will be redirected back.",
            duration: 8000
          });
          
          // Close any open dialogs
          setOpenBookingDialog(false);
          setOpenImmediateBookingDialog(false);
          
          // Set up payment status checking
          checkPaymentStatus(bookingResponse.transactionId || bookingResponse.id);
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

  // Check payment status periodically
  const checkPaymentStatus = async (transactionId) => {
    if (!transactionId) return;
    
    const maxAttempts = 30; // Check for 5 minutes (30 * 10 seconds)
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const response = await api.get(`/bookings/payment-status/${transactionId}`);
        
        if (response.data?.paymentStatus === 'completed') {
          toast.success("Payment Successful!", {
            description: "Your payment has been processed successfully.",
            duration: 6000
          });
          return;
        }
        
        if (response.data?.paymentStatus === 'failed') {
          toast.error("Payment Failed", {
            description: "Your payment could not be processed. Please try again.",
            duration: 6000
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
        console.error("Error checking payment status:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        }
      }
    };
    
    // Start checking after 30 seconds
    setTimeout(checkStatus, 30000);
  };

  // --- Core logic change: Handle opening of modals ---
  const handleInstantBookingClick = async () => {
    if (!isAuthenticated) {
      // Store current URL for redirect after login
      setRedirectUrl(window.location.pathname + window.location.search);
      setOpenLoginModal(true);
      return;
    }

    const currentRole = getCurrentActiveRole();
    
    // Check if user is Admin (SUPER_ADMIN) - prevent booking
    if (currentRole === "SUPER_ADMIN") {
      setPendingBookingType("immediate");
      setOpenRoleSwitchDialog(true);
      return;
    }

    // If user is already in GUEST role, allow direct immediate booking
    if (currentRole === "GUEST") {
      // Open immediate booking dialog (no need to fetch booked dates for fixed booking)
      setOpenImmediateBookingDialog(true);
      return;
    }

    // For all other roles, show role switch dialog to switch to GUEST
    setPendingBookingType("immediate");
    setOpenRoleSwitchDialog(true);
  };

  // Handle advanced booking - opens the detailed booking form
  const handleAdvancedBookingClick = async () => {
    if (!isAuthenticated) {
      // Store current URL for redirect after login
      setRedirectUrl(window.location.pathname + window.location.search);
      setOpenLoginModal(true);
      return;
    }

    const currentRole = getCurrentActiveRole();
    
    // Check if user is Admin (SUPER_ADMIN) - prevent booking
    if (currentRole === "SUPER_ADMIN") {
      setPendingBookingType("advanced");
      setOpenRoleSwitchDialog(true);
      return;
    }

    // If user is already in GUEST role, allow direct booking
    if (currentRole === "GUEST") {
      setErrors({}); // Reset errors when opening dialog
      // Fetch booked dates before opening dialog for date picker functionality
      await fetchBookedDates();
      setOpenBookingDialog(true);
      return;
    }

    // For all other roles, show role switch dialog to switch to GUEST
    setPendingBookingType("advanced");
    setOpenRoleSwitchDialog(true);
  };

  // Handle hourly booking - opens the hourly booking dialog
  const handleTimeBasedBookingClick = async () => {
    if (!isAuthenticated) {
      // Store current URL for redirect after login
      setRedirectUrl(window.location.pathname + window.location.search);
      setOpenLoginModal(true);
      return;
    }

    const currentRole = getCurrentActiveRole();
    
    // Check if user is Admin (SUPER_ADMIN) - prevent booking
    if (currentRole === "SUPER_ADMIN") {
      setPendingBookingType("hourly");
      setOpenRoleSwitchDialog(true);
      return;
    }

    // If user is already in GUEST role, allow direct booking
    if (currentRole === "GUEST") {
      setOpenTimeBasedBookingDialog(true);
      return;
    }

    // For all other roles, show role switch dialog to switch to GUEST
    setPendingBookingType("timeBased");
    setOpenRoleSwitchDialog(true);
  };

  // Handle role switching to Guest
  const handleSwitchToGuest = () => {
    if (hasRole("GUEST")) {
      switchToRole("GUEST");
      setOpenRoleSwitchDialog(false);
      toast.success("Switched to Guest role", {
        description: "You can now book rooms.",
        duration: 6000
      });
      
      // Handle the pending booking type after role switch
      if (pendingBookingType === "immediate") {
        // Open immediate booking dialog after role switch
        setTimeout(() => {
          setOpenImmediateBookingDialog(true);
        }, 500);
      } else if (pendingBookingType === "advanced") {
        // Open advanced booking dialog after role switch
        setTimeout(async () => {
          setErrors({}); // Reset errors when opening dialog after role switch
          await fetchBookedDates();
          setOpenBookingDialog(true);
        }, 500);
      } else if (pendingBookingType === "hourly") {
        // Open hourly booking dialog after role switch
        setTimeout(() => {
          setOpenTimeBasedBookingDialog(true);
        }, 500);
      }
      
      // Reset pending booking type
      setPendingBookingType(null);
    }
  };

  // --- End of core logic change ---

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
          <span>
            Max Guests: {room.maxGuests > 0 ? room.maxGuests : "Not specified"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {!hasCheckedBookings ? (
            /* Check Bookings Button - Initial State */
            <Button 
              onClick={handleCheckBookings}
              disabled={isLoadingBookedDates || !room.active}
              className={`flex-1 text-xs sm:flex-none ${!room.active ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white'}`}
              title={!room.active ? "Room is currently inactive" : "Check room availability and booking options"}
            >
              <span className="flex items-center gap-2">
                {isLoadingBookedDates ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.646 9.646 8 0 0118 15.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                )}
                {isLoadingBookedDates ? "Checking Availability..." : !room.active ? "Room Inactive" : "Check available dates"}
              </span>
            </Button>
          ) : (
            /* Booking Options - After Check */
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 max-w-xs sm:max-w-none">
              {isTodayAvailable ? (
                /* Book Tonight Button - Available */
                <Button 
                  onClick={handleInstantBookingClick}
                  className="flex-1 sm:flex-none lg:flex-1 xl:flex-none text-xs min-w-0"
                  title="Book this room starting tonight"
                >
                  <span className="flex items-center gap-1 sm:gap-2 truncate">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="truncate">Book Tonight</span>
                  </span>
                </Button>
              ) : (
                /* Not Available Button - Disabled */
                <Button 
                  disabled={true}
                  variant="outline"
                  className="flex-1 text-xs sm:flex-none lg:flex-1 xl:flex-none border-red-300 text-red-500 cursor-not-allowed min-w-0"
                  title="Room not available for tonight"
                >
                  <span className="flex items-center gap-1 sm:gap-2 truncate">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span className="truncate">Not Available</span>
                  </span>
                </Button>
              )}
              
              {/* Standard Booking Button*/}
              <Button 
                onClick={handleAdvancedBookingClick}
                variant="outline"
                className="border-blue-600 text-xs text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none lg:flex-1 xl:flex-none min-w-0"
                title="Open standard booking form"
              >
                <span className="flex items-center gap-1 sm:gap-2 truncate">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  <span className="truncate">Standard</span>
                </span>
              </Button>

              {/* Hourly Booking Button - Only show if hotel supports hourly booking */}
              {hotel?.hasTimeBased && (
                <Button 
                  onClick={handleTimeBasedBookingClick}
                  variant="outline"
                  className="border-purple-600 text-xs text-purple-600 hover:bg-purple-50 flex-1 sm:flex-none lg:flex-1 xl:flex-none min-w-0"
                  title="Open hourly booking form"
                >
                  <span className="flex items-center gap-1 sm:gap-2 truncate">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">Hourly</span>
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Booking Dialog */}
      {/* This Dialog's `open` state is completely independent */}
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
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Standard Booking - {room.hotelName}</DialogTitle>
            <DialogDescription>Room {room.roomNumber} - Detailed Booking Form</DialogDescription>
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

              {/* Date Selection - Moved to top */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Select Your Dates
                </h3>
                
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

                {!shouldHideCheckoutDate() && (
                  <div className="grid gap-2">
                    <div data-field="checkOutDate">
                      <CustomDatePicker
                        selectedDate={bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate + 'T12:00:00') : null}
                        onDateSelect={(date) => handleDateSelect("checkOutDate", date)}
                        blockedDates={getBlockedDates()}
                        minDate={getMinCheckOutDate()}
                        placeholder="Select check-out date"
                        label="Check-out Date *"
                        error={errors.checkOutDate}
                        disabled={isLoadingBookedDates}
                        className="w-full"
                      />
                    </div>
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
                            {isDateBetweenBookedDates(bookingDetails.checkInDate) 
                              ? `This date is available for one night only as it falls between existing bookings. Checkout date is automatically set to ${bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate).toLocaleDateString() : 'the next day'}.`
                              : isNextDayBooked(bookingDetails.checkInDate)
                              ? `The next day (${bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate).toLocaleDateString() : 'tomorrow'}) is already booked, so this will be a single night stay. You have to checkout tomorrow.`
                              : `This date is available for one night only. Checkout date is automatically set to ${bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate).toLocaleDateString() : 'the next day'}.`
                            }
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
                    onValueChange={(value) => {
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
                    }}
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
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="font-medium">
                    Nu {room.price.toFixed(2)}
                  </span>
                </div>
                {days > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {days} {days === 1 ? "night" : "nights"} ×{" "}
                      {bookingDetails.numberOfRooms} room(s)
                    </span>
                    <span className="font-medium">
                      Nu {totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Price</span>
                  <span>Nu {totalPrice.toFixed(2)}</span>
                </div>
                {days === 0 &&
                    (bookingDetails.checkInDate || bookingDetails.checkOutDate) && (
                      <p className="text-sm text-amber-600">
                        {!bookingDetails.checkInDate && !bookingDetails.checkOutDate 
                          ? "Please select check-in and check-out dates."
                          : !bookingDetails.checkInDate 
                          ? "Please select a check-in date."
                          : "Please select a valid check-out date."
                        }
                      </p>
                    )}
                
                {/* Date validation helper */}
                {(errors.checkInDate || errors.checkOutDate) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-800">Date Selection Issues</p>
                        <p className="text-red-700 mt-1">
                          Please review your date selections and choose available dates that don't conflict with existing bookings.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingDetails(prev => ({
                              ...prev,
                              checkInDate: "",
                              checkOutDate: ""
                            }));
                            setErrors(prev => ({
                              ...prev,
                              checkInDate: undefined,
                              checkOutDate: undefined
                            }));
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                        >
                          Clear all dates and start over
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
                {isBookingLoading ? "Booking..." : "Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Modal (only rendered if needed) */}
      {/* This Dialog's `open` state is entirely separate */}
      {openLoginModal && (
        <LoginModal
          onClose={() => setOpenLoginModal(false)} // Allows LoginModal to close itself and update parent state
        />
      )}

      {/* Role Switch Dialog */}
      <Dialog open={openRoleSwitchDialog} onOpenChange={setOpenRoleSwitchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Switch to Guest Role
            </DialogTitle>
            <DialogDescription>
              {getCurrentActiveRole() === "SUPER_ADMIN" 
                ? "Admin users cannot book rooms. Please switch to Guest role to enable booking functionality."
                : "To book rooms, you need to be in Guest role. Would you like to switch to Guest role now?"
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenRoleSwitchDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSwitchToGuest}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Switch to Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Immediate Booking Dialog */}
      <Dialog 
        open={openImmediateBookingDialog} 
        onOpenChange={(open) => {
          setOpenImmediateBookingDialog(open);
          // Reset form when dialog closes
          if (!open) {
            setImmediateBookingDetails({
              phone: "",
              cid: "",
              destination: "",
              origin: "",
              guests: 1,
              isBhutanese: true,
            });
            setImmediateBookingErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Book Tonight - {room.hotelName}
            </DialogTitle>
            <DialogDescription>
              Room {room.roomNumber}
            </DialogDescription>
            {/* Note about required information */}
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2">
                <p><strong>Quick Booking:</strong> You're reserving this room for tonight through tomorrow morning.</p>
                <p className="mt-1 text-xs">Reserved at: {new Date().toLocaleTimeString()}</p>
              </div>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); handleImmediateBooking(); }}>
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {/* Loading indicator for booked dates */}
              {isLoadingBookedDates && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.646 9.646 8 0 0118 15.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700">Loading booking calendar...</span>
                </div>
              )}
              {/* Phone Number */}
              <div className="grid gap-2" data-field="phone">
                <Label htmlFor="immediatePhone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    +975
                  </span>
                  <Input
                    id="immediatePhone"
                    name="phone"
                    type="tel"
                    value={immediateBookingDetails.phone}
                    onChange={handleImmediateInputChange}
                    placeholder="17123456"
                    className={`pl-14 placeholder:text-muted-foreground/50 ${immediateBookingErrors.phone ? "border-destructive" : ""}`}
                  />
                </div>
                {immediateBookingErrors.phone && (
                  <p className="text-sm text-destructive">{immediateBookingErrors.phone}</p>
                )}
              </div>

              {/* Nationality Selection */}
              <div className="grid gap-2">
                <Label className="text-sm">Nationality</Label>
                <div className="flex items-center space-x-3">
                  {/* <span className="text-sm text-muted-foreground">Other</span> */}
                  <span className="text-sm text-muted-foreground">Bhutanese</span>
                  <Switch
                    checked={immediateBookingDetails.isBhutanese}
                    onCheckedChange={(checked) => {
                      setImmediateBookingDetails((prev) => ({
                        ...prev,
                        isBhutanese: checked,
                        // Clear CID when switching to non-Bhutanese
                        cid: checked ? prev.cid : ""
                      }));
                      // Clear CID error when switching nationality
                      if (immediateBookingErrors.cid) {
                        setImmediateBookingErrors((prev) => ({
                          ...prev,
                          cid: undefined
                        }));
                      }
                    }}
                  />
                  
                </div>
              </div>

              {/* CID Number - Only show for Bhutanese */}
              {immediateBookingDetails.isBhutanese && (
                <div className="grid gap-2" data-field="cid">
                  <Label htmlFor="immediateCid" className="text-sm">
                    CID Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="immediateCid"
                    name="cid"
                    type="text"
                    value={immediateBookingDetails.cid}
                    onChange={handleImmediateInputChange}
                    placeholder="11 digits"
                    maxLength={11}
                    className={`text-sm placeholder:text-muted-foreground/50 ${immediateBookingErrors.cid ? "border-destructive" : ""}`}
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
                  
                  {immediateBookingErrors.cid && (
                    <p className="text-sm text-destructive">{immediateBookingErrors.cid}</p>
                  )}
                </div>
              )}

              {/* Destination */}
              <div className="grid gap-2" data-field="destination">
                <Label htmlFor="immediateDestination" className="text-sm">
                  Destination <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="immediateDestination"
                  name="destination"
                  type="text"
                  value={immediateBookingDetails.destination}
                  onChange={handleImmediateInputChange}
                  placeholder="Enter destination"
                  className={`text-sm placeholder:text-muted-foreground/50 ${immediateBookingErrors.destination ? "border-destructive" : ""}`}
                />
                {immediateBookingErrors.destination && (
                  <p className="text-sm text-destructive">{immediateBookingErrors.destination}</p>
                )}
              </div>

              {/* Origin */}
              <div className="grid gap-2" data-field="origin">
                <Label htmlFor="immediateOrigin" className="text-sm">
                  Origin <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="immediateOrigin"
                  name="origin"
                  type="text"
                  value={immediateBookingDetails.origin}
                  onChange={handleImmediateInputChange}
                  placeholder="Enter origin"
                  className={`text-sm placeholder:text-muted-foreground/50 ${immediateBookingErrors.origin ? "border-destructive" : ""}`}
                />
                {immediateBookingErrors.origin && (
                  <p className="text-sm text-destructive">{immediateBookingErrors.origin}</p>
                )}
              </div>

              {/* Number of Guests */}
              <div className="grid gap-2" data-field="guests">
                <Label htmlFor="immediateGuests" className="text-sm">
                  Number of Guests <span className="text-destructive">*</span>
                </Label>
                <Select
                  name="guests"
                  value={String(immediateBookingDetails.guests)}
                  onValueChange={(value) => {
                    const numGuests = parseInt(value);
                    setImmediateBookingDetails((prev) => ({
                      ...prev,
                      guests: numGuests,
                    }));
                    // Clear error for this field
                    if (immediateBookingErrors.guests) {
                      setImmediateBookingErrors((prev) => ({
                        ...prev,
                        guests: undefined
                      }));
                    }
                  }}
                >
                  <SelectTrigger className={`text-sm ${immediateBookingErrors.guests ? "border-destructive" : ""}`}>
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
                {immediateBookingErrors.guests && (
                  <p className="text-sm text-destructive">{immediateBookingErrors.guests}</p>
                )}
                {room.maxGuests > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Maximum {room.maxGuests} guests allowed for this room
                  </p>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {getImmediateBookingDates().checkInDisplay} (Tonight)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {getImmediateBookingDates().checkOutDisplay} (Tomorrow)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{immediateBookingDetails.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">1 night</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per night</span>
                    <span className="font-medium">Nu {room.price.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Price</span>
                    <span>Nu {room.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setOpenImmediateBookingDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isImmediateBookingLoading}
              >
                {isImmediateBookingLoading ? (
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.646 9.646 8 0 0118 15.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {isImmediateBookingLoading ? "Booking..." : "Confirm Tonight's Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hourly Booking Dialog */}
      <TimeBasedBookingDialog
        isOpen={openTimeBasedBookingDialog}
        onClose={() => setOpenTimeBasedBookingDialog(false)}
        room={room}
        hotelId={hotelId}
        hotel={hotel}
        onBookingSuccess={(bookingData) => {
          // Handle successful hourly booking
          setSuccessBookingData(bookingData);
          setOpenBookingSuccessModal(true);
        }}
      />

      {/* Booking Success Modal with QR Code */}
      <BookingSuccessModal
        isOpen={openBookingSuccessModal}
        onClose={() => setOpenBookingSuccessModal(false)}
        bookingData={successBookingData}
      />
    </>
  );
}
