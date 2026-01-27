import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dialog";
import api from "../../shared/services/Api";
import { toast } from "sonner";

// Format time to 12-hour format
const formatTime = (timeString) => {
  if (!timeString) return "";
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    
    return "";
  }
};

const BookingCalendar = ({ hotelId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch rooms for the hotel
  useEffect(() => {
    const fetchRooms = async () => {
      if (!hotelId) return;

      setLoadingRooms(true);
      try {
        const response = await api.get(`/rooms/hotel/${hotelId}`);
        const roomsData = response.data || [];
        setRooms(roomsData);
      } catch (error) {
        
        toast.error("Failed to load rooms", { duration: 4000 });
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [hotelId]);

  // Fetch bookings for the current month
  useEffect(() => {
    const fetchMonthlyBookings = async () => {
      if (!hotelId) return;

      setLoading(true);
      try {
        // Use the monthly search endpoint with optional room filtering
        const monthParam = currentMonth + 1; // API expects 1-12, not 0-11
        let apiUrl = `/bookings/search/month?year=${currentYear}&month=${monthParam}&hotelId=${hotelId}&size=1000`;
        
        // Add room filter if a specific room is selected
        if (selectedRoomId !== "all") {
          apiUrl += `&roomId=${selectedRoomId}`;
        }
        
        let response;
        try {
          // Try monthly endpoint first
          response = await api.get(apiUrl);
        } catch (monthlyError) {
          // Fall back to regular endpoint and filter on frontend
          let fallbackUrl = `/bookings/?hotelId=${hotelId}&size=1000`;
          if (selectedRoomId !== "all") {
            fallbackUrl += `&roomId=${selectedRoomId}`;
          }
          response = await api.get(fallbackUrl);
        }
        
        let allBookings = [];
        if (response.data.content) {
          allBookings = response.data.content;
        } else if (Array.isArray(response.data)) {
          allBookings = response.data;
        }

        // If we used the fallback endpoint, filter by month on frontend
        let monthlyBookings = allBookings;
        if (response.config.url.includes('/bookings/?')) {
          // Filter bookings that affect the current month
          monthlyBookings = allBookings.filter(booking => {
            const checkInDate = new Date(booking.checkInDate);
            const checkOutDate = new Date(booking.checkOutDate);
            const monthStart = new Date(currentYear, currentMonth, 1);
            const monthEnd = new Date(currentYear, currentMonth + 1, 0);
            
            // Include booking if:
            // 1. Check-in is in current month
            // 2. Check-out is in current month  
            // 3. Booking spans the entire month (starts before, ends after)
            // 4. Booking starts in current month and extends beyond
            // 5. Booking started before current month but ends in current month or later
            return (
              (checkInDate >= monthStart && checkInDate <= monthEnd) ||
              (checkOutDate >= monthStart && checkOutDate <= monthEnd) ||
              (checkInDate < monthStart && checkOutDate > monthEnd) ||
              (checkInDate <= monthEnd && checkOutDate > monthEnd) ||
              (checkInDate < monthStart && checkOutDate >= monthStart)
            );
          });
        }

        setBookings(monthlyBookings);
      } catch (error) {
        
        toast.error("Failed to load booking calendar data", {
          duration: 6000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyBookings();
  }, [hotelId, currentMonth, currentYear, daysInMonth, selectedRoomId]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  // Get bookings for a specific date (for display purposes)
  const getBookingsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return bookings.filter(booking => {
      const checkInDate = booking.checkInDate;
      const checkOutDate = booking.checkOutDate;
      
      // Check if the date is either:
      // 1. A check-in date (exact match)
      // 2. A check-out date (exact match)  
      // 3. Falls within the booking period (between check-in and check-out)
      return dateStr === checkInDate || 
             dateStr === checkOutDate || 
             (dateStr > checkInDate && dateStr < checkOutDate);
    });
  };

  // Get bookings that make a date "booked" (excluding check-out only dates)
  const getBookedBookingsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const filteredBookings = bookings.filter(booking => {
      const checkInDate = booking.checkInDate;
      const checkOutDate = booking.checkOutDate;
      
      const isCheckInDate = dateStr === checkInDate;
      const isOngoingStay = dateStr > checkInDate && dateStr < checkOutDate;
      
      // Mark as booked if:
      // 1. It's a check-in date (includes same-day check-in/check-out)
      // 2. It's an ongoing stay (guests are present)
      // Do NOT mark if it's ONLY a check-out date
      return isCheckInDate || isOngoingStay;
    });

    return filteredBookings;
  };

  // Get status color for a date based on bookings
  const getDateStatus = (day) => {
    const dayBookings = getBookedBookingsForDate(day);
    
    if (dayBookings.length === 0) return "available";
    
    // Check for different statuses
    const hasConfirmed = dayBookings.some(b => b.status === "CONFIRMED");
    const hasCheckedIn = dayBookings.some(b => b.status === "CHECKED_IN");
    const hasPending = dayBookings.some(b => b.status === "PENDING");
    
    if (hasCheckedIn) return "checked-in";
    if (hasConfirmed) return "confirmed";
    if (hasPending) return "pending";
    
    return "booked";
  };

  // Check if date is in the future
  const isFutureDate = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Get status styling
  const getStatusStyling = (status, isToday = false) => {
    const baseClasses = "relative w-full h-full rounded-lg transition-colors duration-200 cursor-pointer";
    
    if (isToday) {
      switch (status) {
        case "checked-in":
        case "confirmed":
        case "pending":
        case "booked":
          return `${baseClasses} bg-gradient-to-br from-green-500 to-green-600 text-white ring-2 ring-green-300 ring-offset-1 shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg`;
        default:
          return `${baseClasses} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white ring-2 ring-yellow-300 ring-offset-1 shadow-md hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg`;
      }
    }
    
    switch (status) {
      case "checked-in":
      case "confirmed":
      case "pending":
      case "booked":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:shadow-md`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:shadow-md`;
    }
  };

  // Handle date click
  const handleDateClick = (day, event) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Get the click position relative to the viewport
    if (event && event.target) {
      const rect = event.target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setClickedPosition({ x, y });
    } else {
      // Fallback to center if we can't get the position
      setClickedPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    
    setSelectedDate(dateStr);
  };

  // Get selected date bookings
  const selectedDateBookings = selectedDate ? getBookingsForDate(parseInt(selectedDate.split('-')[2])) : [];

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-0.5 md:p-1">
          <div className="w-full h-full"></div>
        </div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      const status = getDateStatus(day);
      const dayBookings = getBookingsForDate(day);
      const isBooked = status !== "available";
      
      days.push(
        <div key={day} className="aspect-square p-0.5 md:p-1.5">
          <div
            className={getStatusStyling(status, isToday)}
            onClick={(e) => handleDateClick(day, e)}
          >
            {/* Date number - top right corner, responsive size */}
            {isToday ? (
              <span className="absolute top-1 right-1 md:top-2 md:right-2 text-xs md:text-lg font-bold z-[1] flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm">
                {day}
              </span>
            ) : (
              <span className="absolute top-1 right-1 md:top-2 md:right-2 text-xs md:text-lg font-bold z-[1]">{day}</span>
            )}
            
            {/* Status label - center bottom (hidden on small devices) */}
            {isBooked && (
              <span className="hidden sm:block absolute bottom-1.5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-current opacity-90 whitespace-nowrap">
                BOOKED
              </span>
            )}
            {!isBooked && !isToday && (
              <span className="hidden sm:block absolute bottom-1.5 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500 opacity-70 whitespace-nowrap">
                Available
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <>
      {/* Custom animation styles for dialog expanding from clicked position */}
      <style>{`
        @keyframes dialog-expand {
          0% {
            transform: translate(-50%, -50%) scale(0) translate(calc(var(--click-x) - 50vw), calc(var(--click-y) - 50vh));
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translate(0, 0);
            opacity: 1;
          }
        }
        
        @keyframes dialog-shrink {
          0% {
            transform: translate(-50%, -50%) scale(1) translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0) translate(calc(var(--click-x) - 50vw), calc(var(--click-y) - 50vh));
            opacity: 0;
          }
        }
        
        .dialog-animate-in {
          animation: dialog-expand 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .dialog-animate-out {
          animation: dialog-shrink 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        /* Remove border from dialog close button */
        [data-slot="dialog-close"] {
          border: none !important;
          outline: none !important;
        }
        
        [data-slot="dialog-close"]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <div className="space-y-4 relative z-0">
        <Card className="shadow-sm border-border/50 relative z-0">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-md">
              Booking Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </Button>
              <div className="text-base font-bold text-foreground min-w-[140px] text-center tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          </div>
          
          {/* Room Filter */}
          <div className="flex items-center gap-2 mt-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedRoomId}
              onValueChange={setSelectedRoomId}
              disabled={loadingRooms}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    Room {room.roomNumber} - {room.roomType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoomId !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRoomId("all")}
                className="h-8 px-2 text-xs"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading calendar...</span>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="space-y-3 w-full md:w-[90%] md:mx-auto">
                {/* Day headers - Styled as gradient buttons */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-3">
                  {dayNames.map(day => (
                    <div 
                      key={day} 
                      className="text-center text-xs md:text-sm font-bold text-white py-2 md:py-3 uppercase tracking-wide"
                      style={{ backgroundColor: '#7B7F85' }}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {generateCalendarDays()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-5 border-t border-border/50">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Booked</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Today</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog - Appears when date is clicked */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => {
        if (!open) setSelectedDate(null);
      }}>
        <DialogContent 
          className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto !animate-none"
          style={{
            '--click-x': `${clickedPosition.x}px`,
            '--click-y': `${clickedPosition.y}px`,
            animation: selectedDate ? 'dialog-expand 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
              {selectedDateBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedDateBookings.length} {selectedDateBookings.length === 1 ? 'booking' : 'bookings'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-2.5">
                {selectedDateBookings.map((booking, index) => {
                  // Normalize dates by extracting just the date part (YYYY-MM-DD)
                  const checkInDateOnly = booking.checkInDate ? booking.checkInDate.split('T')[0] : '';
                  const checkOutDateOnly = booking.checkOutDate ? booking.checkOutDate.split('T')[0] : '';
                  
                  // Determine the activity type for this date
                  const isCheckInDate = checkInDateOnly === selectedDate;
                  const isCheckOutDate = checkOutDateOnly === selectedDate;
                  const isOngoingStay = selectedDate > checkInDateOnly && selectedDate < checkOutDateOnly;
                  
                  let activityType = '';

                  return (
                    <div 
                      key={booking.id || index} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-sm truncate">
                            {booking.guestName || 'Guest'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              Room {booking.roomNumber}
                            </span>
                            {activityType && (
                              <span className="text-xs text-muted-foreground">• {activityType}</span>
                            )}
                            {/* Show times for hourly bookings */}
                            {booking.timeBased && booking.checkInTime && booking.checkOutTime && (
                              <span className="text-xs text-primary font-medium">
                                • {formatTime(booking.checkInTime)} - {formatTime(booking.checkOutTime)}
                              </span>
                            )}
                            {/* Booking type for larger screens */}
                            <div className="hidden lg:inline">
                              <Badge 
                                variant={booking.timeBased ? 'secondary' : 'outline'}
                                className="text-xs font-medium ml-1"
                              >
                                {booking.timeBased ? 'hourly' : 'standard'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          booking.status === 'CHECKED_IN' ? 'default' :
                          booking.status === 'CONFIRMED' ? 'secondary' :
                          booking.status === 'PENDING' ? 'outline' : 'destructive'
                        }
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {booking.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No bookings for this date
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default BookingCalendar;
