import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../../features/authentication";
import { API_BASE_URL } from "../services/firebaseConfig";

// The URL for the SockJS endpoint you configured in Spring Boot.
const SOCKET_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + "/ws";

/**
 * A React component that handles real-time notifications via WebSockets.
 * It should be placed in a high-level layout component so it's always active
 * when a user is logged in.
 */
const NotificationsComponent = () => {
  const { userId, isAuthenticated } = useAuth(); // <-- Get user state from your auth context
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Use a ref to hold the client instance to prevent re-creation on re-renders.
  const clientRef = useRef(null);

  useEffect(() => {
    // Only attempt to connect if the user is authenticated and has a userId.
    if (isAuthenticated && userId) {
      // If there's no client instance, create one.
      if (!clientRef.current) {
        console.log("Creating new STOMP client...");
        const client = new Client({
          webSocketFactory: () => new SockJS(SOCKET_URL),
          reconnectDelay: 10000, // Automatically reconnect in 10 seconds
          debug: (str) => {
            console.log("STOMP: " + str);
          },
        });

        // This function is called when the client successfully connects to the server.
        client.onConnect = () => {
          console.log(`WebSocket Connected! Subscribing for user: ${userId}`);
          setIsConnected(true);

          // The topic the client will subscribe to, now using the dynamic userId.
          const subscriptionTopic = `/topic/notifications/${userId}`;

          // Subscribe to the user-specific topic.
          client.subscribe(subscriptionTopic, (message) => {
            try {
              const newNotification = JSON.parse(message.body);
              setNotifications((prev) => [newNotification, ...prev]);
            } catch (error) {
              console.error("Could not parse notification message:", error);
            }
          });
        };

        client.onDisconnect = () => {
          console.log("WebSocket Disconnected!");
          setIsConnected(false);
        };

        client.onStompError = (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
        };

        clientRef.current = client;
      }

      // Activate the client if it's not already active.
      if (!clientRef.current.active) {
        clientRef.current.activate();
      }
    }

    // Cleanup function: This will be called when the component unmounts
    // or when the dependencies (isAuthenticated, userId) change.
    return () => {
      if (clientRef.current && clientRef.current.active) {
        console.log("Deactivating WebSocket client...");
        clientRef.current.deactivate();
      }
    };
  }, [isAuthenticated, userId]);

  return null; // This component doesn't render anything visible
};

export default NotificationsComponent;
