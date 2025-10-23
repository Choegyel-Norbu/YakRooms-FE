import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/features/authentication/AuthProvider";
import subscriptionService from "@/shared/services/subscriptionService";
import { toast } from "sonner";

// === Subscription Context Setup ===
const SubscriptionContext = createContext(null);

// === Subscription Plans Configuration ===
export const SUBSCRIPTION_PLANS = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Free Trial',
    price: 0,
    currency: 'Nu.',
    duration: 2, // months
    features: [
      'Access to all platform features',
      'Hotel management dashboard',
      'Guest booking system',
      'Basic analytics & reports',
      'Mobile app access',
    ],
    limitations: [
      'Limited to trial period',
      'No premium support',
    ]
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Subscription',
    price: 1000,
    currency: 'Nu.',
    duration: 1, // month
    features: [
      'Activate your hotel listing',
      'Make your hotel discoverable to guests',
      'Appear in search results',
      'Receive booking requests',
      'Manage guest reservations',
      'Access booking analytics',
      'Priority customer support',
      'Download reports',
      'Advanced analytics',
      'Marketing tools',
    ],
    limitations: []
  }
};

// === Payment Status Constants ===
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// === Subscription Status Constants ===
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  TRIAL: 'TRIAL'
};

const defaultSubscriptionState = {
  subscription: null,
  paymentHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const SubscriptionProvider = ({ children }) => {
  const { 
    userId, 
    hotelId, 
    isAuthenticated,
    roles,
    subscriptionId,
    subscriptionPaymentStatus,
    subscriptionPlan,
    subscriptionIsActive,
    subscriptionNextBillingDate,
    subscriptionExpirationNotification,
    fetchSubscriptionData,
    updateSubscriptionCache
  } = useAuth();

  const [subscriptionState, setSubscriptionState] = useState(defaultSubscriptionState);

  // === GET SUBSCRIPTION DETAILS FROM CACHE ===
  const fetchSubscriptionDetails = useCallback(async (forceRefresh = false) => {
    if (!userId || !isAuthenticated) return null;

    // Check if user has permission to access subscription data
    // Only HOTEL_ADMIN (hotel owner) and MANAGER roles can access subscription data
    const allowedRoles = ['HOTEL_ADMIN', 'MANAGER'];
    const hasPermission = roles.some(role => allowedRoles.includes(role));
    
    if (!hasPermission) {
      console.log("🚫 User role does not have permission to access subscription data. Required roles: HOTEL_ADMIN or MANAGER");
      console.log("👤 Current user roles:", roles);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Access denied: Subscription data is only available for hotel owners and managers',
        subscription: null
      }));
      
      return null;
    }

    // Use cached data from AuthProvider (localStorage)
    const cachedSubscriptionData = {
      id: subscriptionId,
      subscriptionId: subscriptionId,
      paymentStatus: subscriptionPaymentStatus,
      subscriptionPlan: subscriptionPlan,
      isActive: subscriptionIsActive,
      nextBillingDate: subscriptionNextBillingDate,
      expirationNotification: subscriptionExpirationNotification
    };

    // Only fetch from API if forcing refresh or no cached data exists
    if (forceRefresh || !subscriptionId) {
      console.log("🔄 Fetching subscription data from API (force refresh or no cache)");
      const apiData = await fetchSubscriptionData(userId, forceRefresh);
      
      if (apiData) {
        setSubscriptionState(prev => ({
          ...prev,
          subscription: apiData,
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        }));
        return apiData;
      }
    }

    // Use cached data
    console.log("🔄 Using cached subscription data");
    setSubscriptionState(prev => ({
      ...prev,
      subscription: cachedSubscriptionData,
      isLoading: false,
      error: null,
      lastUpdated: Date.now()
    }));
    
    return cachedSubscriptionData;
  }, [userId, isAuthenticated, subscriptionId, subscriptionPaymentStatus, subscriptionPlan, subscriptionIsActive, subscriptionNextBillingDate, subscriptionExpirationNotification, fetchSubscriptionData, roles]);

  // === FETCH PAYMENT HISTORY (memoized) ===
  const fetchPaymentHistory = useCallback(async () => {
    if (!userId || !isAuthenticated) return [];

    try {
      console.log("📜 Fetching payment history for user:", userId);
      const history = await subscriptionService.getSubscriptionHistory(userId);
      
      setSubscriptionState(prev => ({
        ...prev,
        paymentHistory: Array.isArray(history) ? history : []
      }));

      return history;
    } catch (error) {
      console.error("❌ Failed to fetch payment history:", error);
      toast.error("Failed to load payment history.");
      return [];
    }
  }, [userId, isAuthenticated]);

  // === CREATE SUBSCRIPTION (memoized) ===
  const createSubscription = useCallback(async (subscriptionData) => {
    if (!userId || !isAuthenticated) {
      throw new Error("User must be authenticated to create subscription");
    }

    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("📝 Creating new subscription:", subscriptionData);
      
      const newSubscription = await subscriptionService.createSubscription({
        ...subscriptionData,
        userId: parseInt(userId)
      });

      setSubscriptionState(prev => ({
        ...prev,
        subscription: newSubscription,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      }));

      // Note: AuthProvider subscription data will be updated automatically
      // through the session-based caching mechanism when needed

      toast.success("Subscription created successfully!");
      return newSubscription;
    } catch (error) {
      console.error("❌ Failed to create subscription:", error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to create subscription'
      }));

      const errorMessage = error.response?.data?.message || "Failed to create subscription. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  }, [userId, isAuthenticated, fetchSubscriptionData]);

  // === INITIATE PAYMENT (memoized) ===
  const initiatePayment = useCallback(async (paymentData, baseUrl = "https://www.ezeeroom.bt") => {
    if (!userId || !hotelId) {
      throw new Error("User ID and Hotel ID are required for payment initiation");
    }

    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("💳 Initiating payment with data:", {
        userId,
        hotelId,
        paymentData,
        baseUrl
      });
      
      const paymentRequest = {
        hotelId: parseInt(hotelId),
        userId: parseInt(userId),
        subscriptionPlan: paymentData.subscriptionPlan || 'PRO',
        amount: paymentData.amount || 1000.00,
        notes: paymentData.notes || "Subscription payment"
      };

      console.log("📤 Sending payment request:", paymentRequest);
      const paymentResponse = await subscriptionService.initiateSubscriptionPayment(paymentRequest, baseUrl);
      console.log("📥 Received payment response:", paymentResponse);

      setSubscriptionState(prev => ({ ...prev, isLoading: false }));

      // Handle payment redirect - don't redirect automatically, return response for handling
      if (paymentResponse.success) {
        console.log("✅ Payment initiation successful");
        
        // Update subscription data if provided in response
        if (paymentResponse.subscription) {
          setSubscriptionState(prev => ({
            ...prev,
            subscription: paymentResponse.subscription,
            lastUpdated: Date.now()
          }));
          
          // Note: AuthProvider subscription data will be updated automatically
          // through the session-based caching mechanism when needed
        }
      }

      return paymentResponse;
    } catch (error) {
      console.error("❌ Failed to initiate payment:", error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initiate payment'
      }));

      // Provide more specific error messages based on error type
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid payment request. Please check your information and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in and try again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Payment service not available. Please try again later.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please try again later or contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [userId, hotelId, fetchSubscriptionData]);

  // === UPDATE SUBSCRIPTION (memoized) ===
  const updateSubscription = useCallback(async (subscriptionId, updateData) => {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required for update");
    }

    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("📝 Updating subscription:", subscriptionId, updateData);
      
      const updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, updateData);

      setSubscriptionState(prev => ({
        ...prev,
        subscription: updatedSubscription,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      }));

      // Note: AuthProvider subscription data will be updated automatically
      // through the session-based caching mechanism when needed

      toast.success("Subscription updated successfully!");
      return updatedSubscription;
    } catch (error) {
      console.error("❌ Failed to update subscription:", error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to update subscription'
      }));

      const errorMessage = error.response?.data?.message || "Failed to update subscription. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchSubscriptionData, userId]);

  // === CANCEL SUBSCRIPTION (memoized) ===
  const cancelSubscription = useCallback(async (subscriptionId, reason = "User requested cancellation") => {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required for cancellation");
    }

    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("❌ Cancelling subscription:", subscriptionId, reason);
      
      const cancellationResult = await subscriptionService.cancelSubscription(subscriptionId, reason);

      // Refresh subscription data after cancellation
      await fetchSubscriptionDetails(true);

      toast.success("Subscription cancelled successfully!");
      return cancellationResult;
    } catch (error) {
      console.error("❌ Failed to cancel subscription:", error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to cancel subscription'
      }));

      const errorMessage = error.response?.data?.message || "Failed to cancel subscription. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchSubscriptionDetails]);

  // === REACTIVATE SUBSCRIPTION (memoized) ===
  const reactivateSubscription = useCallback(async (subscriptionId) => {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required for reactivation");
    }

    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("🔄 Reactivating subscription:", subscriptionId);
      
      const reactivationResult = await subscriptionService.reactivateSubscription(subscriptionId);

      // Refresh subscription data after reactivation
      await fetchSubscriptionDetails(true);

      toast.success("Subscription reactivated successfully!");
      return reactivationResult;
    } catch (error) {
      console.error("❌ Failed to reactivate subscription:", error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to reactivate subscription'
      }));

      const errorMessage = error.response?.data?.message || "Failed to reactivate subscription. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchSubscriptionDetails]);

  // === GET PAYMENT STATUS (memoized) ===
  const getPaymentStatus = useCallback(async (transactionId) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    try {
      console.log("🔍 Checking payment status for transaction:", transactionId);
      const paymentStatus = await subscriptionService.getPaymentStatus(transactionId);
      return paymentStatus;
    } catch (error) {
      console.error("❌ Failed to get payment status:", error);
      throw error;
    }
  }, []);

  // === UTILITY FUNCTIONS (memoized) ===
  const getSubscriptionStatus = useCallback(() => {
    if (!subscriptionPlan) return SUBSCRIPTION_STATUS.INACTIVE;
    
    if (subscriptionIsActive === true) {
      return subscriptionPlan === 'TRIAL' ? SUBSCRIPTION_STATUS.TRIAL : SUBSCRIPTION_STATUS.ACTIVE;
    } else if (subscriptionIsActive === false) {
      return SUBSCRIPTION_STATUS.EXPIRED;
    }
    
    return SUBSCRIPTION_STATUS.INACTIVE;
  }, [subscriptionPlan, subscriptionIsActive]);

  const isSubscriptionActive = useCallback(() => {
    return subscriptionIsActive === true;
  }, [subscriptionIsActive]);

  const isTrialActive = useCallback(() => {
    return subscriptionIsActive === true && subscriptionPlan === 'TRIAL';
  }, [subscriptionIsActive, subscriptionPlan]);

  const isProActive = useCallback(() => {
    return subscriptionIsActive === true && subscriptionPlan === 'PRO';
  }, [subscriptionIsActive, subscriptionPlan]);

  const isExpired = useCallback(() => {
    return subscriptionIsActive === false && subscriptionPlan;
  }, [subscriptionIsActive, subscriptionPlan]);

  const getDaysUntilExpiration = useCallback(() => {
    if (!subscriptionNextBillingDate) return null;
    
    const expirationDate = new Date(subscriptionNextBillingDate);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [subscriptionNextBillingDate]);

  const getSubscriptionPlan = useCallback((planId) => {
    return SUBSCRIPTION_PLANS[planId] || null;
  }, []);

  // === AUTO-FETCH SUBSCRIPTION DATA (only if no cached data) ===
  useEffect(() => {
    if (userId && isAuthenticated && !subscriptionId && !subscriptionState.subscription) {
      console.log("🔄 No cached subscription data found, fetching from API");
      fetchSubscriptionDetails();
    } else if (userId && isAuthenticated && subscriptionId && !subscriptionState.subscription) {
      console.log("🔄 Using cached subscription data");
      fetchSubscriptionDetails();
    }
  }, [userId, isAuthenticated, subscriptionId, fetchSubscriptionDetails, subscriptionState.subscription]);

  // === MEMOIZED CONTEXT VALUE ===
  const contextValue = useMemo(() => ({
    // State
    subscription: subscriptionState.subscription,
    paymentHistory: subscriptionState.paymentHistory,
    isLoading: subscriptionState.isLoading,
    error: subscriptionState.error,
    lastUpdated: subscriptionState.lastUpdated,

    // Auth-based subscription data
    subscriptionId,
    subscriptionPaymentStatus,
    subscriptionPlan,
    subscriptionIsActive,
    subscriptionNextBillingDate,
    subscriptionExpirationNotification,

    // Actions
    fetchSubscriptionDetails,
    fetchPaymentHistory,
    createSubscription,
    initiatePayment,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    getPaymentStatus,
    updateSubscriptionCache,

    // Utility functions
    getSubscriptionStatus,
    isSubscriptionActive,
    isTrialActive,
    isProActive,
    isExpired,
    getDaysUntilExpiration,
    getSubscriptionPlan,

    // Constants
    SUBSCRIPTION_PLANS,
    PAYMENT_STATUS,
    SUBSCRIPTION_STATUS,
  }), [
    subscriptionState,
    subscriptionId,
    subscriptionPaymentStatus,
    subscriptionPlan,
    subscriptionIsActive,
    subscriptionNextBillingDate,
    subscriptionExpirationNotification,
    fetchSubscriptionDetails,
    fetchPaymentHistory,
    createSubscription,
    initiatePayment,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    getPaymentStatus,
    getSubscriptionStatus,
    isSubscriptionActive,
    isTrialActive,
    isProActive,
    isExpired,
    getDaysUntilExpiration,
    getSubscriptionPlan,
  ]);

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    console.error("useSubscription must be used within a SubscriptionProvider. Make sure the component is wrapped in <SubscriptionProvider>");
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export default SubscriptionContext;
