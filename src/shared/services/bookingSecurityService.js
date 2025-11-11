/**
 * Booking Security Service
 * 
 * Provides secure booking operations with built-in protection against
 * price manipulation and other security vulnerabilities.
 * 
 * 🔐 Security Features:
 * - Removes client-calculated prices from requests
 * - Adds request integrity verification
 * - Implements rate limiting
 * - Logs suspicious activities
 * - Validates server responses
 * 
 * ⚠️ IMPORTANT: This is defense-in-depth. PRIMARY security MUST be on backend.
 */

import api from './Api.jsx';
import {
  generateTransactionId,
  sanitizeBookingPayload,
  validateServerPricing,
  createSecurityHeaders,
  detectSuspiciousPattern,
  logSecurityEvent,
  checkRateLimit,
  clearRateLimit
} from '../utils/securityUtils';

/**
 * Creates a secure booking with automatic price manipulation protection
 * 
 * @param {Object} bookingData - Booking details (WITHOUT prices)
 * @param {Object} displayPricing - Prices calculated for display only (optional)
 * @returns {Promise<Object>} Booking response from server
 */
export const createSecureBooking = async (bookingData, displayPricing = {}) => {
  const transactionId = generateTransactionId();
  
  try {
    // Step 1: Rate limit check (prevent abuse)
    const rateLimitKey = `booking_${bookingData.userId || 'guest'}`;
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      throw new Error('Too many booking attempts. Please wait a moment and try again.');
    }
    
    // Step 2: Detect suspicious patterns (early warning)
    const suspicionCheck = detectSuspiciousPattern(bookingData);
    if (suspicionCheck.suspicious) {
      logSecurityEvent('SUSPICIOUS_BOOKING_ATTEMPT', {
        transactionId,
        reasons: suspicionCheck.reasons,
        bookingData
      });
      // Don't block - let backend make final decision
      console.warn('[Security] Suspicious booking pattern detected:', suspicionCheck.reasons);
    }
    
    // Step 3: Sanitize payload (remove client prices)
    // ⚠️ CRITICAL: Remove totalPrice and txnTotalPrice
    // Backend will recalculate these from database
    const sanitizedPayload = sanitizeBookingPayload(bookingData);
    
    // Add transaction tracking
    sanitizedPayload.clientTransactionId = transactionId;
    
    // Step 4: Create security headers
    const securityHeaders = createSecurityHeaders(sanitizedPayload);
    
    // Step 5: Log the booking attempt
    logSecurityEvent('BOOKING_ATTEMPT', {
      transactionId,
      roomId: bookingData.roomId,
      hotelId: bookingData.hotelId,
      displayPrice: displayPricing.totalPrice, // For comparison
      sanitized: true
    });
    
    // Step 6: Make the API request
    console.log('[Security] Creating secure booking:', {
      transactionId,
      hasClientPrice: false, // Prices removed
      fingerprint: sanitizedPayload.clientFingerprint
    });
    
    const response = await api.post('/bookings', sanitizedPayload, {
      headers: securityHeaders
    });
    
    // Step 7: Validate server response
    if (response.status === 200 && response.data) {
      // Check if server returned pricing information
      const serverPrice = response.data.totalPrice || response.data.txnTotalPrice;
      
      if (displayPricing.totalPrice && serverPrice) {
        const validation = validateServerPricing(response.data, displayPricing.totalPrice);
        
        if (!validation.isValid) {
          // Price mismatch detected (could be business logic change or error)
          logSecurityEvent('PRICE_MISMATCH', {
            transactionId,
            expected: displayPricing.totalPrice,
            received: serverPrice,
            discrepancy: validation.discrepancy,
            message: validation.message
          });
          
          // Don't fail - show warning to user
          console.warn('[Security] Price discrepancy:', validation.message);
        } else {
          console.log('[Security] Price validation passed ✓');
        }
      }
      
      // Clear rate limit on success
      clearRateLimit(rateLimitKey);
      
      // Log success
      logSecurityEvent('BOOKING_SUCCESS', {
        transactionId,
        bookingId: response.data.bookingId || response.data.id,
        serverPrice: response.data.totalPrice
      });
    }
    
    return response;
    
  } catch (error) {
    // Log the failure
    logSecurityEvent('BOOKING_FAILED', {
      transactionId,
      error: error.message,
      bookingData: {
        roomId: bookingData.roomId,
        hotelId: bookingData.hotelId
      }
    });
    
    // Re-throw for caller to handle
    throw error;
  }
};

/**
 * Creates a secure booking extension with price protection
 * 
 * @param {number} bookingId - ID of booking to extend
 * @param {Object} extensionData - Extension details (WITHOUT prices)
 * @param {Object} displayPricing - Prices calculated for display only (optional)
 * @returns {Promise<Object>} Extension response from server
 */
export const createSecureExtension = async (bookingId, extensionData, displayPricing = {}) => {
  const transactionId = generateTransactionId();
  
  try {
    // Rate limit check
    const rateLimitKey = `extension_${extensionData.userId || bookingId}`;
    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      throw new Error('Too many extension attempts. Please wait a moment and try again.');
    }
    
    // Sanitize payload (remove client prices)
    const sanitizedPayload = sanitizeBookingPayload({
      ...extensionData,
      extension: true
    });
    
    sanitizedPayload.clientTransactionId = transactionId;
    
    // Create security headers
    const securityHeaders = createSecurityHeaders(sanitizedPayload);
    
    logSecurityEvent('EXTENSION_ATTEMPT', {
      transactionId,
      bookingId,
      displayPrice: displayPricing.extendedAmount
    });
    
    // Make the API request
    const response = await api.put(`/bookings/${bookingId}/extend`, sanitizedPayload, {
      headers: securityHeaders
    });
    
    if (response.status === 200) {
      clearRateLimit(rateLimitKey);
      
      logSecurityEvent('EXTENSION_SUCCESS', {
        transactionId,
        bookingId
      });
    }
    
    return response;
    
  } catch (error) {
    logSecurityEvent('EXTENSION_FAILED', {
      transactionId,
      bookingId,
      error: error.message
    });
    
    throw error;
  }
};

/**
 * Validates a booking before submission (client-side pre-flight check)
 * This doesn't replace server validation - just improves UX
 * 
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} { valid, errors[] }
 */
export const validateBookingData = (bookingData) => {
  const errors = [];
  
  // Required fields check
  if (!bookingData.roomId) errors.push('Room ID is required');
  if (!bookingData.hotelId) errors.push('Hotel ID is required');
  if (!bookingData.guests || bookingData.guests < 1) errors.push('At least 1 guest is required');
  
  // Date validation
  if (!bookingData.timeBased) {
    if (!bookingData.checkInDate) errors.push('Check-in date is required');
    if (!bookingData.checkOutDate) errors.push('Check-out date is required');
    
    if (bookingData.checkInDate && bookingData.checkOutDate) {
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      
      if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }
    }
  } else {
    // Time-based booking validation
    if (!bookingData.checkInDate) errors.push('Check-in date is required');
    if (!bookingData.checkInTime) errors.push('Check-in time is required');
    if (!bookingData.bookHour || bookingData.bookHour < 1) errors.push('Booking duration is required');
  }
  
  // Contact information
  if (!bookingData.phone) errors.push('Phone number is required');
  if (!bookingData.cid) errors.push('CID is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calculates display pricing (for UI only, NOT for submission)
 * 
 * ⚠️ IMPORTANT: These prices are NEVER sent to the server
 * Backend will recalculate from database
 * 
 * @param {Object} room - Room data with price
 * @param {Object} bookingDetails - Booking details
 * @returns {Object} { totalPrice, serviceTax, txnTotalPrice, breakdown }
 */
export const calculateDisplayPricing = (room, bookingDetails) => {
  if (!room?.price) {
    return { totalPrice: 0, serviceTax: 0, txnTotalPrice: 0 };
  }
  
  let basePrice = 0;
  
  if (bookingDetails.timeBased) {
    // Hourly booking: price is per hour
    basePrice = room.price * (bookingDetails.numberOfRooms || 1);
  } else {
    // Regular booking: price is per night
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    basePrice = room.price * days * (bookingDetails.numberOfRooms || 1);
  }
  
  const totalPrice = Math.ceil(basePrice);
  const serviceTax = Math.ceil(basePrice * 0.03); // 3% service tax
  const txnTotalPrice = totalPrice + serviceTax;
  
  return {
    totalPrice,
    serviceTax,
    txnTotalPrice,
    breakdown: {
      basePrice,
      numberOfRooms: bookingDetails.numberOfRooms || 1,
      nights: bookingDetails.timeBased ? null : calculateNights(bookingDetails),
      hours: bookingDetails.timeBased ? bookingDetails.bookHour : null
    }
  };
};

/**
 * Calculates number of nights for display
 * 
 * @param {Object} bookingDetails - Booking details with dates
 * @returns {number} Number of nights
 */
const calculateNights = (bookingDetails) => {
  if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
  
  const checkIn = new Date(bookingDetails.checkInDate);
  const checkOut = new Date(bookingDetails.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  return Math.max(1, nights);
};

/**
 * Gets security audit logs for a user (if backend supports it)
 * Useful for debugging and transparency
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Security audit logs
 */
export const getSecurityAuditLogs = async (userId) => {
  try {
    const response = await api.get(`/security/audit/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch security audit logs:', error);
    return [];
  }
};

/**
 * Reports a suspected security issue to the backend
 * 
 * @param {string} issueType - Type of security issue
 * @param {Object} details - Issue details
 * @returns {Promise<void>}
 */
export const reportSecurityIssue = async (issueType, details) => {
  try {
    await api.post('/security/report', {
      issueType,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    console.log('[Security] Issue reported:', issueType);
  } catch (error) {
    console.error('Failed to report security issue:', error);
  }
};

export default {
  createSecureBooking,
  createSecureExtension,
  validateBookingData,
  calculateDisplayPricing,
  getSecurityAuditLogs,
  reportSecurityIssue
};

