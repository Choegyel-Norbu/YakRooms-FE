import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../src/services/AuthProvider'

import API_BASE_URL from '../../config.js';

// The URL for the SockJS endpoint you configured in Spring Boot.
const SOCKET_URL = API_BASE_URL + '/ws';

/**
 * A React component that handles real-time notifications via WebSockets.
 * It should be placed in a high-level layout component so it's always active
 * when a user is logged in.
 */
const  NotificationsComponent  = () => {
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
                        console.log('STOMP: ' + str);
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
                            setNotifications(prev => [newNotification, ...prev]);
                        } catch (error) {
                            console.error("Could not parse notification message:", error);
                        }
                    });
                };

                client.onDisconnect = () => {
                    console.log("WebSocket Disconnected!");
                    setIsConnected(false);
                }

                client.onStompError = (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
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
                clientRef.current = null;
                setIsConnected(false);
            }
        };

    }, [isAuthenticated, userId]); // Effect dependencies ensure we connect/disconnect on auth changes.

    // Only render the notification UI if the user is authenticated.
    if (!isAuthenticated) {
        return null; // Or a placeholder like <p>Login to see notifications</p>
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                         <h1 className="text-2xl font-bold text-cyan-400">Real-Time Notifications</h1>
                         <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
                    </div>
                    <p className="text-gray-400 mb-6">
                        Listening for notifications for user: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{userId}</span>
                    </p>
                    
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No notifications yet. Waiting for new hotel bookings...</p>
                        ) : (
                            notifications.map((notif, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md animate-fade-in">
                                    <div className="flex justify-between items-start">
                                        <h2 className="font-semibold text-lg text-white">{notif.title}</h2>
                                        <span className="text-xs text-gray-400">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-300 mt-1">{notif.message}</p>
                                    <span className="inline-block bg-cyan-500 text-black text-xs font-bold mt-2 px-2 py-1 rounded-full">
                                        {notif.type}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotificationsComponent;
