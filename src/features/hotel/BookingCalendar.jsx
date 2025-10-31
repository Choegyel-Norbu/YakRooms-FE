import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import api from "../../shared/services/Api";
import { toast } from "sonner";

const BookingCalendar = ({ hotelId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Fetch bookings for the current month
  useEffect(() => {
    const fetchMonthlyBookings = async () => {
      if (!hotelId) return;

      console.log(`📅 Calendar: Fetching bookings for ${monthNames[currentMonth]} ${currentYear}, hotelId: ${hotelId}`);
      console.log(`🔧 Component is working! Current date state:`, currentDate);
      setLoading(true);
      try {
        // Try the monthly search endpoint first, fall back to regular endpoint if it doesn't exist
        const monthParam = currentMonth + 1; // API expects 1-12, not 0-11
        let response;
        
        try {
          // Try monthly endpoint first
          response = await api.get(`/bookings/search/month?year=${currentYear}&month=${monthParam}&hotelId=${hotelId}&size=1000`);
        } catch (monthlyError) {
          console.log("Monthly endpoint not available, using regular endpoint:", monthlyError.message);
          // Fall back to regular endpoint and filter on frontend
          response = await api.get(`/bookings/?hotelId=${hotelId}&size=1000`);
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

        // Debug: Log API data
        console.log("🚀 API response:", {
          month: `${monthNames[currentMonth]} ${currentYear}`,
          endpoint: response.config.url,
          totalBookings: monthlyBookings.length,
          usedFiltering: response.config.url.includes('/bookings/?')
        });
        console.log("🚀 Bookings affecting this month:", monthlyBookings.map(b => ({
          id: b.id,
          checkIn: b.checkInDate,
          checkOut: b.checkOutDate,
          guest: b.guestName,
          status: b.status
        })));

        setBookings(monthlyBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load booking calendar data", {
          duration: 6000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyBookings();
  }, [hotelId, currentMonth, currentYear, daysInMonth]);

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
    
    // Debug logging for date processing
    if (dateStr.endsWith('-31')) {
      console.log(`📋 All bookings available for ${dateStr}:`, bookings.map(b => ({
        id: b.id,
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        guest: b.guestName
      })));
    }
    
    const filteredBookings = bookings.filter(booking => {
      const checkInDate = booking.checkInDate;
      const checkOutDate = booking.checkOutDate;
      
      const isCheckInDate = dateStr === checkInDate;
      const isOngoingStay = dateStr > checkInDate && dateStr < checkOutDate;
      
      // Debug logging for date processing
      if (dateStr.endsWith('-31') || dateStr.endsWith('-01')) {
        console.log(`🗓️ Checking date ${dateStr}:`, {
          bookingId: booking.id,
          booking: `${booking.guestName || 'Guest'} - Room ${booking.roomNumber}`,
          checkInDate,
          checkOutDate,
          isCheckInDate,
          isOngoingStay,
          willBeMarkedBooked: isCheckInDate || isOngoingStay
        });
      }
      
      // Mark as booked if:
      // 1. It's a check-in date (includes same-day check-in/check-out)
      // 2. It's an ongoing stay (guests are present)
      // Do NOT mark if it's ONLY a check-out date
      return isCheckInDate || isOngoingStay;
    });

    // Debug logging for date processing
    if (dateStr.endsWith('-31') || dateStr.endsWith('-01')) {
      console.log(`🟢 Final result for ${dateStr}: ${filteredBookings.length} booked bookings found`);
    }

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

  // Get status styling
  const getStatusStyling = (status, isToday = false) => {
    const baseClasses = "relative w-full h-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105";
    
    if (isToday) {
      switch (status) {
        case "checked-in":
        case "confirmed":
        case "pending":
        case "booked":
          return `${baseClasses} bg-green-600 text-white ring-2 ring-green-300 shadow-lg`;
        default:
          return `${baseClasses} bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg`;
      }
    }
    
    switch (status) {
      case "checked-in":
      case "confirmed":
      case "pending":
      case "booked":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-300 hover:bg-green-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100`;
    }
  };

  // Handle date click
  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
        <div key={`empty-${i}`} className="aspect-square p-1">
          <div className="w-full h-full"></div>
        </div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      const status = getDateStatus(day);
      const dayBookings = getBookingsForDate(day);
      
      days.push(
        <div key={day} className="aspect-square p-1">
          <div
            className={getStatusStyling(status, isToday)}
            onClick={() => handleDateClick(day)}
          >
            <span className="relative z-10">{day}</span>
            {dayBookings.length > 0 && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-current rounded-full opacity-60"></div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-semibold text-foreground min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
              <div className="space-y-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm text-muted-foreground">Booked</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateBookings.length > 0 && (
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateBookings.map((booking, index) => {
              // Determine the activity type for this date
              const isCheckInDate = booking.checkInDate === selectedDate;
              const isCheckOutDate = booking.checkOutDate === selectedDate;
              const isOngoingStay = selectedDate > booking.checkInDate && selectedDate < booking.checkOutDate;
              
              let activityType = '';
              let activityIcon = null;
              if (isCheckInDate && isCheckOutDate) {
                activityType = 'Check-in & Check-out';
                activityIcon = <Calendar className="h-3 w-3" />;
              } else if (isCheckInDate) {
                activityType = 'Check-in';
                activityIcon = <Calendar className="h-3 w-3 text-green-600" />;
              } else if (isCheckOutDate) {
                activityType = 'Check-out';
                activityIcon = <Calendar className="h-3 w-3 text-red-600" />;
              } else if (isOngoingStay) {
                activityType = 'Ongoing stay';
                activityIcon = <Clock className="h-3 w-3 text-blue-600" />;
              }

              return (
                <div key={booking.id || index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{booking.guestName || 'Guest'}</span>
                      <span className="text-xs text-muted-foreground">Room {booking.roomNumber}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {activityIcon}
                        <span className="font-medium">{activityType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                    </div>
                    {booking.timeBased && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {booking.bookHour}h
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'CHECKED_IN' ? 'default' :
                      booking.status === 'CONFIRMED' ? 'secondary' :
                      booking.status === 'PENDING' ? 'outline' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {booking.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingCalendar;
