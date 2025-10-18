/**
 * Payment Redirect Utility
 * 
 * This utility provides robust payment redirect handling for various payment gateways.
 * It supports multiple redirect methods:
 * - Form-based redirects (BFS-Secure, etc.)
 * - URL-based redirects (RMA, etc.)
 * - POST form redirects with custom data
 * 
 * @author YakRooms Development Team
 * @version 1.0.0
 */

/**
 * Main payment redirect handler that determines the appropriate redirect method
 * @param {Object} paymentData - Payment data from the server response
 * @param {Object} options - Additional options for the redirect
 * @param {Function} options.onSuccess - Callback for successful redirect initiation
 * @param {Function} options.onError - Callback for redirect errors
 * @param {string} options.gatewayName - Name of the payment gateway for user feedback
 */
export const handlePaymentRedirect = (paymentData, options = {}) => {
  const {
    onSuccess,
    onError,
    gatewayName = 'payment gateway'
  } = options;

  try {
    console.log("🔄 Processing payment redirect:", paymentData);
    
    // Check if we have form HTML data (like BFS-Secure)
    if (paymentData.paymentFormHtml) {
      handleFormBasedRedirect(paymentData, gatewayName);
    } 
    // Check if we have a direct payment URL (like RMA)
    else if (paymentData.paymentUrl) {
      handleUrlBasedRedirect(paymentData, gatewayName);
    } 
    // Check if we have form data fields for POST submission
    else if (paymentData.formData) {
      handlePostFormRedirect(paymentData, gatewayName);
    }
    else {
      throw new Error('No valid payment redirect method found in response');
    }
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess(paymentData);
    }
    
  } catch (error) {
    console.error("❌ Payment redirect failed:", error);
    
    // Call error callback if provided
    if (onError) {
      onError(error);
    } else {
      // Default error handling - you might want to use your toast system here
      console.error("Payment Redirect Failed:", error.message);
    }
    
    throw error;
  }
};

/**
 * Handle form-based redirect (for BFS-Secure and similar gateways)
 * @param {Object} paymentData - Payment data containing HTML form
 * @param {string} gatewayName - Name of the payment gateway
 */
const handleFormBasedRedirect = (paymentData, gatewayName) => {
  try {
    // Create a temporary div to parse the HTML form
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = paymentData.paymentFormHtml;
    
    // Find the form element
    const form = tempDiv.querySelector('form');
    if (!form) {
      throw new Error('Payment form not found in response');
    }
    
    // Log payment form details for debugging
    console.log("📋 Payment Form Details:", {
      action: form.action,
      method: form.method,
      transactionId: paymentData.transactionId,
      orderNumber: paymentData.orderNumber
    });
    
    // Create a temporary form element and append it to the body
    const paymentForm = document.createElement('form');
    paymentForm.method = form.method || 'POST';
    paymentForm.action = form.action;
    paymentForm.style.display = 'none';
    
    // Copy all form inputs
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      const newInput = document.createElement('input');
      newInput.type = input.type;
      newInput.name = input.name;
      newInput.value = input.value;
      paymentForm.appendChild(newInput);
    });
    
    // Append form to body and submit
    document.body.appendChild(paymentForm);
    paymentForm.submit();
    
    console.log("✅ Form-based redirect initiated successfully");
    
  } catch (error) {
    console.error("❌ Form-based redirect failed:", error);
    throw error;
  }
};

/**
 * Handle URL-based redirect (for RMA and similar gateways)
 * @param {Object} paymentData - Payment data containing URL and optional form data
 * @param {string} gatewayName - Name of the payment gateway
 */
const handleUrlBasedRedirect = (paymentData, gatewayName) => {
  try {
    console.log("🔗 Redirecting to payment URL:", paymentData.paymentUrl);
    
    // Create a temporary form for POST submission if needed
    if (paymentData.method === 'POST' && paymentData.formData) {
      const paymentForm = document.createElement('form');
      paymentForm.method = 'POST';
      paymentForm.action = paymentData.paymentUrl;
      paymentForm.style.display = 'none';
      
      // Add form data fields
      Object.entries(paymentData.formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        paymentForm.appendChild(input);
      });
      
      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } else {
      // Direct URL redirect for GET requests
      window.location.href = paymentData.paymentUrl;
    }
    
    console.log("✅ URL-based redirect initiated successfully");
    
  } catch (error) {
    console.error("❌ URL-based redirect failed:", error);
    throw error;
  }
};

/**
 * Handle POST form redirect (for gateways that require POST data)
 * @param {Object} paymentData - Payment data containing form data and action URL
 * @param {string} gatewayName - Name of the payment gateway
 */
const handlePostFormRedirect = (paymentData, gatewayName) => {
  try {
    console.log("📤 Submitting POST form data:", paymentData.formData);
    
    const paymentForm = document.createElement('form');
    paymentForm.method = 'POST';
    paymentForm.action = paymentData.action || paymentData.paymentUrl;
    paymentForm.style.display = 'none';
    
    // Add form data fields
    Object.entries(paymentData.formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      paymentForm.appendChild(input);
    });
    
    document.body.appendChild(paymentForm);
    paymentForm.submit();
    
    console.log("✅ POST form redirect initiated successfully");
    
  } catch (error) {
    console.error("❌ POST form redirect failed:", error);
    throw error;
  }
};

/**
 * Validate payment data structure
 * @param {Object} paymentData - Payment data to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePaymentData = (paymentData) => {
  if (!paymentData || typeof paymentData !== 'object') {
    return false;
  }
  
  // Check for at least one valid redirect method
  const hasFormHtml = paymentData.paymentFormHtml && typeof paymentData.paymentFormHtml === 'string';
  const hasPaymentUrl = paymentData.paymentUrl && typeof paymentData.paymentUrl === 'string';
  const hasFormData = paymentData.formData && typeof paymentData.formData === 'object';
  
  return hasFormHtml || hasPaymentUrl || hasFormData;
};

/**
 * Create a standardized payment redirect response
 * @param {Object} paymentData - Raw payment data from server
 * @param {string} gatewayName - Name of the payment gateway
 * @returns {Object} Standardized payment redirect data
 */
export const standardizePaymentData = (paymentData, gatewayName = 'payment gateway') => {
  return {
    ...paymentData,
    gatewayName,
    timestamp: new Date().toISOString(),
    isValid: validatePaymentData(paymentData)
  };
};

export default {
  handlePaymentRedirect,
  validatePaymentData,
  standardizePaymentData
};
