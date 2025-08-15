import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
  }

  // Initialize STOMP connection
  async connect(url = 'http://localhost:8080/ws', options = {}) {
    try {
      // Create SockJS connection
      const socket = new SockJS(url);
      
      // Create STOMP client
      this.stompClient = Stomp.over(socket);
      
      // Configure STOMP client
      this.stompClient.reconnect_delay = this.reconnectDelay;
      this.stompClient.debug = options.debug || null; // Disable debug logs in production

      return new Promise((resolve, reject) => {
        this.stompClient.connect(
          options.headers || {},
          () => {
            console.log('STOMP WebSocket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            resolve(this.stompClient);
          },
          (error) => {
            console.error('STOMP connection error:', error);
            this.isConnected = false;
            this.handleReconnect();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error initializing STOMP connection:', error);
      throw error;
    }
  }

  // Subscribe to a topic
  subscribe(topic, callback, options = {}) {
    if (!this.stompClient || !this.isConnected) {
      console.warn('STOMP client not connected. Cannot subscribe to:', topic);
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data, message);
        } catch (error) {
          console.error('Error parsing message from topic:', topic, error);
          // Call callback with raw message if parsing fails
          callback(message.body, message);
        }
      }, options);

      // Store subscription for cleanup
      this.subscriptions.set(topic, subscription);
      console.log(`Subscribed to topic: ${topic}`);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to topic:', topic, error);
      return null;
    }
  }

  // Unsubscribe from a topic
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    }
  }

  // Send message to a destination
  send(destination, message, headers = {}) {
    if (!this.stompClient || !this.isConnected) {
      console.warn('STOMP client not connected. Cannot send message to:', destination);
      return false;
    }

    try {
      this.stompClient.send(destination, headers, JSON.stringify(message));
      console.log(`Message sent to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error('Error sending message to:', destination, error);
      return false;
    }
  }

  // Disconnect from STOMP broker
  disconnect() {
    if (this.stompClient) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription, topic) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Disconnect STOMP client
      this.stompClient.disconnect();
      this.stompClient = null;
      this.isConnected = false;
      console.log('STOMP WebSocket disconnected');
    }
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }

  // Subscribe to booking topics
  subscribeToBookingTopics(userId, callbacks = {}) {
    const subscriptions = {};

    // Subscribe to all booking events
    if (callbacks.allBookings) {
      subscriptions.allBookings = this.subscribe('/topic/bookings', callbacks.allBookings);
    }

    // Subscribe to user-specific booking events
    if (callbacks.userBookings && userId) {
      subscriptions.userBookings = this.subscribe(`/queue/users/${userId}/bookings`, callbacks.userBookings);
    }

    return subscriptions;
  }

  // Send booking-related messages
  sendBookingMessage(destination, messageType, payload) {
    const message = {
      type: messageType,
      payload,
      timestamp: new Date().toISOString()
    };

    return this.send(destination, message);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

// Export helper functions
export const createBookingSubscription = (userId, callbacks) => {
  return webSocketService.subscribeToBookingTopics(userId, callbacks);
};

export const sendBookingUpdate = (destination, payload) => {
  return webSocketService.sendBookingMessage(destination, 'BOOKING_UPDATE', payload);
};

export const sendBookingStatusChange = (destination, bookingId, newStatus, previousStatus) => {
  return webSocketService.sendBookingMessage(destination, 'BOOKING_STATUS_UPDATE', {
    bookingId,
    newStatus,
    previousStatus,
    timestamp: new Date().toISOString()
  });
}; 