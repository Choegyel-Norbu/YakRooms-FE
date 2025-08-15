import React from 'react';
import { useBookingContext } from '../../features/booking/BookingContext';
import HotelReviewSheet from '../../features/hotel/HotelReviewSheet';

const GlobalReviewSheet = () => {
  const { reviewSheet, closeReviewSheet } = useBookingContext();

  const handleSubmitSuccess = () => {
    closeReviewSheet();
    // You can add additional success handling here
    // For example, show a success toast or redirect
  };

  return (
    <HotelReviewSheet
      isOpen={reviewSheet.isOpen}
      userId={reviewSheet.userId}
      hotelId={reviewSheet.hotelId}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};

export default GlobalReviewSheet; 