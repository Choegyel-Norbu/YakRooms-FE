import { enhancedApi } from "./Api";
import { API_BASE_URL } from "./firebaseConfig";

/**
 * Subscription Service
 * Handles all subscription-related API operations following the backend endpoint structure
 */
class SubscriptionService {
  /**
   * Create a new subscription
   * @param {Object} subscriptionData - The subscription data
   * @param {number} subscriptionData.userId - User ID
   * @param {string} subscriptionData.subscriptionPlan - Subscription plan (TRIAL, PRO)
   * @param {string} subscriptionData.paymentStatus - Payment status (PENDING, PAID, FAILED)
   * @param {string} subscriptionData.trialStartDate - Trial start date (ISO string)
   * @param {string} subscriptionData.trialEndDate - Trial end date (ISO string)
   * @param {string} subscriptionData.nextBillingDate - Next billing date (ISO string)
   * @param {string|null} subscriptionData.cancelDate - Cancel date (ISO string or null)
   * @param {string|null} subscriptionData.lastPaymentDate - Last payment date (ISO string or null)
   * @param {string} subscriptionData.notes - Additional notes
   * @returns {Promise<Object>} Response data
   */
  async createSubscription(subscriptionData) {
    try {
      console.log("📝 Creating subscription:", subscriptionData);
      const response = await enhancedApi.post("/subscriptions", subscriptionData);
      console.log("✅ Subscription created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscriptionByUserId(userId) {
    try {
      console.log("🔍 Fetching subscription for user:", userId);
      const response = await enhancedApi.get(`/subscriptions/user/${userId}`);
      console.log("✅ Subscription fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscriptionById(subscriptionId) {
    try {
      console.log("🔍 Fetching subscription by ID:", subscriptionId);
      const response = await enhancedApi.get(`/subscriptions/${subscriptionId}`);
      console.log("✅ Subscription fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch subscription by ID:", error);
      throw error;
    }
  }

  /**
   * Update subscription
   * @param {number} subscriptionId - Subscription ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated subscription data
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      console.log("📝 Updating subscription:", subscriptionId, updateData);
      const response = await enhancedApi.put(`/subscriptions/${subscriptionId}`, updateData);
      console.log("✅ Subscription updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update subscription:", error);
      throw error;
    }
  }

  /**
   * Initiate subscription payment
   * @param {Object} paymentRequest - Payment request data
   * @param {number} paymentRequest.hotelId - Hotel ID
   * @param {number} paymentRequest.userId - User ID
   * @param {string} paymentRequest.subscriptionPlan - Subscription plan (PRO)
   * @param {number} paymentRequest.amount - Payment amount
   * @param {string} paymentRequest.notes - Payment notes
   * @param {string} baseUrl - Base URL for payment callback (optional)
   * @returns {Promise<Object>} Payment initiation response
   */
  async initiateSubscriptionPayment(paymentRequest, baseUrl = "https://www.ezeeroom.bt") {
    try {
      console.log("💳 Initiating subscription payment:", paymentRequest);
      
      const params = new URLSearchParams();
      if (baseUrl) {
        params.append('baseUrl', baseUrl);
      }
      
      const url = `/payment/initiate${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await enhancedApi.post(url, paymentRequest);
      
      console.log("✅ Payment initiation successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to initiate payment:", error);
      throw error;
    }
  }

  /**
   * Handle payment callback/webhook
   * @param {Object} callbackData - Payment callback data
   * @returns {Promise<Object>} Callback processing result
   */
  async handlePaymentCallback(callbackData) {
    try {
      console.log("🔄 Processing payment callback:", callbackData);
      const response = await enhancedApi.post("/payment/callback", callbackData);
      console.log("✅ Payment callback processed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to process payment callback:", error);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      console.log("🔍 Checking payment status for transaction:", transactionId);
      const response = await enhancedApi.get(`/payment/status/${transactionId}`);
      console.log("✅ Payment status retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get payment status:", error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   * @param {number} subscriptionId - Subscription ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(subscriptionId, reason = "User requested cancellation") {
    try {
      console.log("❌ Cancelling subscription:", subscriptionId, reason);
      const response = await enhancedApi.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
      console.log("✅ Subscription cancelled successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to cancel subscription:", error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Reactivation result
   */
  async reactivateSubscription(subscriptionId) {
    try {
      console.log("🔄 Reactivating subscription:", subscriptionId);
      const response = await enhancedApi.post(`/subscriptions/${subscriptionId}/reactivate`);
      console.log("✅ Subscription reactivated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to reactivate subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription analytics/statistics
   * @param {number} userId - User ID (optional, for user-specific stats)
   * @returns {Promise<Object>} Subscription analytics
   */
  async getSubscriptionAnalytics(userId = null) {
    try {
      const url = userId ? `/subscriptions/analytics?userId=${userId}` : "/subscriptions/analytics";
      console.log("📊 Fetching subscription analytics:", url);
      const response = await enhancedApi.get(url);
      console.log("✅ Subscription analytics retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get subscription analytics:", error);
      throw error;
    }
  }

  /**
   * Get subscription history
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Subscription history
   */
  async getSubscriptionHistory(userId) {
    try {
      console.log("📜 Fetching subscription history for user:", userId);
      const response = await enhancedApi.get(`/subscriptions/user/${userId}/history`);
      console.log("✅ Subscription history retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get subscription history:", error);
      throw error;
    }
  }

  /**
   * Validate subscription status
   * @param {number} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Validation result
   */
  async validateSubscriptionStatus(subscriptionId) {
    try {
      console.log("🔍 Validating subscription status:", subscriptionId);
      const response = await enhancedApi.get(`/subscriptions/${subscriptionId}/validate`);
      console.log("✅ Subscription status validated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to validate subscription status:", error);
      throw error;
    }
  }

  /**
   * Get upcoming renewals (for admin/analytics)
   * @param {number} days - Number of days ahead to check (default: 7)
   * @returns {Promise<Array>} Upcoming renewals
   */
  async getUpcomingRenewals(days = 7) {
    try {
      console.log("📅 Fetching upcoming renewals for next", days, "days");
      const response = await enhancedApi.get(`/subscriptions/renewals/upcoming?days=${days}`);
      console.log("✅ Upcoming renewals retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get upcoming renewals:", error);
      throw error;
    }
  }

  /**
   * Send subscription reminder
   * @param {number} subscriptionId - Subscription ID
   * @param {string} reminderType - Type of reminder (EXPIRATION, PAYMENT_DUE, etc.)
   * @returns {Promise<Object>} Reminder result
   */
  async sendSubscriptionReminder(subscriptionId, reminderType = "EXPIRATION") {
    try {
      console.log("📧 Sending subscription reminder:", subscriptionId, reminderType);
      const response = await enhancedApi.post(`/subscriptions/${subscriptionId}/reminder`, { 
        reminderType 
      });
      console.log("✅ Subscription reminder sent:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to send subscription reminder:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;

// Also export the class for testing purposes
export { SubscriptionService };
