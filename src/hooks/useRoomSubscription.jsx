import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import API_BASE_URL from '../../config.js';

export function useRoomSubscription(hotelId, onRoomUpdate) {
  useEffect(() => {
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/rooms/${hotelId}`, (message) => {
          const updatedRooms = JSON.parse(message.body);
          onRoomUpdate(updatedRooms);
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [hotelId, onRoomUpdate]);
}
