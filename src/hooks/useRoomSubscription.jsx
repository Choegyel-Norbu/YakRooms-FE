import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import API_BASE_URL from '../../config.js';

export function useRoomSubscription(hotelId, onRoomUpdate) {
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!hotelId) {
      console.log('No hotelId provided, skipping WebSocket connection');
      return;
    }

    console.log('Setting up WebSocket connection for hotel:', hotelId);
    console.log('API_BASE_URL:', API_BASE_URL);

    // Create SockJS connection
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {},
      debug: function (str) {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame) => {
        console.log('✅ Connected to WebSocket server:', frame);
        
        try {
          const subscription = stompClient.subscribe(`/topic/rooms/${hotelId}`, (message) => {
            console.log('📨 Received WebSocket message:', message);
            try {
              const updatedRooms = JSON.parse(message.body);
              console.log('🏨 Parsed room updates:', updatedRooms);
              onRoomUpdate(updatedRooms);
            } catch (parseError) {
              console.error('❌ Error parsing WebSocket message:', parseError);
              console.error('Raw message body:', message.body);
            }
          });
          
          console.log('✅ Successfully subscribed to:', `/topic/rooms/${hotelId}`);
          
          // Test the connection by sending a ping
          if (stompClient.connected) {
            console.log('🔍 Testing WebSocket connection...');
            // You can uncomment this line to test if your server responds
            // stompClient.publish({destination: '/app/hello', body: JSON.stringify({name: 'test'})});
          }
          
        } catch (subscriptionError) {
          console.error('❌ Error setting up subscription:', subscriptionError);
        }
      },
      
      onDisconnect: (frame) => {
        console.log('🔌 Disconnected from WebSocket:', frame);
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP protocol error:', frame);
        console.error('Error details:', frame.headers);
        console.error('Error body:', frame.body);
      },
      
      onWebSocketError: (error) => {
        console.error('❌ WebSocket connection error:', error);
      },
      
      onWebSocketClose: (event) => {
        console.log('🔌 WebSocket connection closed:', event);
      }
    });

    // Store reference for cleanup
    stompClientRef.current = stompClient;

    // Activate the client
    try {
      stompClient.activate();
      console.log('🚀 WebSocket client activated');
    } catch (activationError) {
      console.error('❌ Error activating WebSocket client:', activationError);
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket connection for hotel:', hotelId);
      if (stompClientRef.current && stompClientRef.current.active) {
        try {
          stompClientRef.current.deactivate();
          console.log('✅ WebSocket connection cleaned up');
        } catch (cleanupError) {
          console.error('❌ Error during WebSocket cleanup:', cleanupError);
        }
      }
      stompClientRef.current = null;
    };
  }, [hotelId, onRoomUpdate]);

  // Return a function to manually test the connection
  return {
    testConnection: () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log('🧪 Testing WebSocket connection...');
        try {
          stompClientRef.current.publish({
            destination: '/app/hello',
            body: JSON.stringify({name: 'Frontend Test'})
          });
          console.log('✅ Test message sent');
        } catch (testError) {
          console.error('❌ Error sending test message:', testError);
        }
      } else {
        console.log('❌ WebSocket not connected, cannot test');
      }
    }
  };
}