import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../authentication';
import { API_BASE_URL } from '../../shared/services/firebaseConfig';

const BookingContext = createContext();

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [reviewSheet, setReviewSheet] = useState({
    isOpen: false,
    bookingId: null,
    hotelId: null,
    userId: null
  });
  const [lastStatusChange, setLastStatusChange] = useState(null);
  const { isAuthenticated, userId } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    // Create WebSocket connection using API_BASE_URL from config
    const wsUrl =  `${API_BASE_URL}/ws/bookings`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected for booking updates');
      // Send authentication message if needed
      newSocket.send(JSON.stringify({
        type: 'AUTH',
        userId: userId
      }));
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (isAuthenticated) {
          setSocket(null); // This will trigger a new connection
        }
      }, 5000);
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [isAuthenticated, userId]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'BOOKING_STATUS_UPDATE':
        handleBookingStatusUpdate(data.payload);
        break;
      case 'BOOKING_CREATED':
        // Handle new booking creation if needed
        break;
      case 'BOOKING_CANCELLED':
        // Handle booking cancellation if needed
        break;
      case 'CONNECTION_URL_UPDATE':
        // Listen for connection URL updates
        handleConnectionUrlUpdate(data.payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Handle booking status updates
  const handleBookingStatusUpdate = useCallback((payload) => {
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

  // Handle connection URL updates
  const handleConnectionUrlUpdate = useCallback((payload) => {
    const { connectionUrl, hotelId, userId: bookingUserId, bookingId } = payload;
    
    // Check if connection URL is not null and trigger HotelReviewSheet
    if (connectionUrl && connectionUrl !== null && connectionUrl !== 'null') {
      console.log('Connection URL received, triggering HotelReviewSheet:', connectionUrl);
      
      setReviewSheet({
        isOpen: true,
        bookingId: bookingId || null,
        hotelId,
        userId: bookingUserId
      });
    } else {
      console.log('Connection URL is null, not triggering HotelReviewSheet');
    }
  }, []);

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

  const value = {
    reviewSheet,
    lastStatusChange,
    closeReviewSheet,
    openReviewSheet,
    clearLastStatusChange,
    socket
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}; 