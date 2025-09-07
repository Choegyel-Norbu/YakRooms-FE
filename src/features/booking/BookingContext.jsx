import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext();

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [reviewSheet, setReviewSheet] = useState({
    isOpen: false,
    bookingId: null,
    hotelId: null,
    userId: null
  });
  const [lastStatusChange, setLastStatusChange] = useState(null);

  // Close review sheet
  const closeReviewSheet = useCallback(() => {
    setReviewSheet({
      isOpen: false,
      bookingId: null,
      hotelId: null,
      userId: null
    });
  }, []);

  // Manually open review sheet (for testing or manual triggers)
  const openReviewSheet = useCallback((bookingId, hotelId, userId) => {
    setReviewSheet({
      isOpen: true,
      bookingId,
      hotelId,
      userId
    });
  }, []);

  // Clear last status change
  const clearLastStatusChange = useCallback(() => {
    setLastStatusChange(null);
  }, []);

  // Trigger review sheet manually (for manual actions like checkout completion)
  const triggerReviewSheet = useCallback((bookingId, hotelId, userId) => {
    setReviewSheet({
      isOpen: true,
      bookingId,
      hotelId,
      userId
    });
  }, []);

  // Handle status changes manually (for API-driven updates)
  const handleStatusChange = useCallback((payload) => {
    const { bookingId, newStatus, hotelId, userId: bookingUserId } = payload;
    
    // Track the status change
    setLastStatusChange({
      bookingId,
      newStatus,
      timestamp: new Date().toISOString()
    });

    // If status changed to CHECKED_OUT, trigger review sheet
    if (newStatus === 'CHECKED_OUT') {
      setReviewSheet({
        isOpen: true,
        bookingId,
        hotelId,
        userId: bookingUserId
      });
    }
  }, []);

  const value = {
    reviewSheet,
    lastStatusChange,
    closeReviewSheet,
    openReviewSheet,
    clearLastStatusChange,
    triggerReviewSheet,
    handleStatusChange
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}; 