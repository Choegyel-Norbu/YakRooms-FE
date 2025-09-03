import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.subscriptions = new Map();
  }

  // Initialize STOMP connection
  async connect(url = 'ws://localhost:8080/ws', options = {}) {
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
      console.error('WebSocket not connected');
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing message:', error);
          callback(message.body);
        }
      }, options);

      this.subscriptions.set(topic, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return null;
    }
  }

  // Unsubscribe from a topic
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  // Send message to a destination
  send(destination, message) {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.stompClient.send(destination, {}, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Disconnect
  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
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

// Export utility functions
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

export default webSocketService;
