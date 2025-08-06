# WebSocket Implementation for Booking Status Changes

## Overview

This implementation provides real-time WebSocket communication for booking status changes using STOMP protocol. The system connects to a WebSocket server at `ws://localhost:8080/ws` and subscribes to specific topics for booking events.

## Features

- **Real-time booking status updates** via WebSocket
- **STOMP protocol** for reliable message handling
- **Automatic reconnection** with exponential backoff
- **User-specific notifications** for personalized updates
- **Notification system** with different types (success, error, warning, info)
- **Connection status monitoring** with visual indicators

## WebSocket Topics

### 1. All Booking Events
```
/topic/bookings
```
- Broadcasts all booking-related events to all connected clients
- Used for general booking updates, new bookings, cancellations, etc.

### 2. User-Specific Events
```
/queue/users/{userId}/bookings
```
- Sends user-specific booking events to individual users
- Replace `{userId}` with the actual user ID
- Used for personalized notifications like booking confirmations, payment reminders, etc.

## Message Types

The system handles various message types:

### Booking Status Updates
- `BOOKING_STATUS_UPDATE` - Status changes (PENDING → CONFIRMED, etc.)
- `BOOKING_CREATED` - New booking created
- `BOOKING_CANCELLED` - Booking cancelled
- `BOOKING_MODIFIED` - Booking details modified

### User-Specific Events
- `BOOKING_CONFIRMED` - Booking confirmed for user
- `BOOKING_REJECTED` - Booking rejected
- `PAYMENT_REQUIRED` - Payment required for booking
- `CHECK_IN_REMINDER` - Check-in reminder
- `CHECK_OUT_REMINDER` - Check-out reminder

## Components

### 1. BookingContext (`src/context/BookingContext.jsx`)
Main context provider that manages WebSocket connections and booking state.

**Key Features:**
- Automatic WebSocket connection management
- Message handling and routing
- Notification management
- Review sheet triggering for check-out events

**Usage:**
```jsx
import { useBookingContext } from '../context/BookingContext';

const MyComponent = () => {
  const { 
    isConnected, 
    bookingNotifications, 
    lastStatusChange,
    sendMessage 
  } = useBookingContext();
  
  // Use the context values
};
```

### 2. WebSocket Service (`src/lib/websocketService.js`)
Service class for managing STOMP WebSocket connections.

**Key Features:**
- Connection management with automatic reconnection
- Topic subscription management
- Message sending and receiving
- Error handling

**Usage:**
```jsx
import webSocketService from '../lib/websocketService';

// Connect to WebSocket
await webSocketService.connect();

// Subscribe to topics
webSocketService.subscribe('/topic/bookings', (data) => {
  console.log('Received booking update:', data);
});

// Send message
webSocketService.send('/topic/bookings', { type: 'TEST', data: 'message' });
```

### 3. BookingNotifications (`src/components/BookingNotifications.jsx`)
Component to display booking notifications received via WebSocket.

**Features:**
- Real-time notification display
- Different notification types (success, error, warning, info)
- Timestamp formatting
- Notification management (clear, remove individual)

### 4. WebSocketStatus (`src/components/WebSocketStatus.jsx`)
Component to show WebSocket connection status.

**Features:**
- Visual connection status indicator
- Connection details tooltip
- Manual reconnection option
- Real-time status updates

### 5. WebSocketTestPanel (`src/components/WebSocketTestPanel.jsx`)
Test component for simulating WebSocket events.

**Features:**
- Send test messages
- Simulate booking status changes
- Test different message types
- Monitor connection status

## Setup and Usage

### 1. Environment Configuration
Make sure your backend WebSocket server is running on `ws://localhost:8080/ws`.

### 2. Provider Setup
Wrap your app with the BookingProvider:

```jsx
import { BookingProvider } from './context/BookingContext';

function App() {
  return (
    <BookingProvider>
      {/* Your app components */}
    </BookingProvider>
  );
}
```

### 3. Using Components
Add the components to your pages:

```jsx
import BookingNotifications from './components/BookingNotifications';
import WebSocketStatus from './components/WebSocketStatus';
import WebSocketTestPanel from './components/WebSocketTestPanel';

function Dashboard() {
  return (
    <div>
      <WebSocketStatus />
      <BookingNotifications />
      <WebSocketTestPanel /> {/* For testing only */}
    </div>
  );
}
```

## Message Format

### Incoming Messages
```json
{
  "type": "BOOKING_STATUS_UPDATE",
  "payload": {
    "bookingId": "BOOKING-123",
    "hotelId": "HOTEL-456",
    "userId": "USER-789",
    "newStatus": "CONFIRMED",
    "previousStatus": "PENDING",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Outgoing Messages
```json
{
  "type": "BOOKING_UPDATE",
  "payload": {
    "bookingId": "BOOKING-123",
    "action": "status_change",
    "data": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Status Types

- `PENDING` - Booking is pending confirmation
- `CONFIRMED` - Booking has been confirmed
- `CANCELLED` - Booking has been cancelled
- `CHECKED_IN` - Guest has checked in
- `CHECKED_OUT` - Guest has checked out
- `REJECTED` - Booking has been rejected
- `PAYMENT_REQUIRED` - Payment is required

## Error Handling

The system includes comprehensive error handling:

- **Connection failures** - Automatic reconnection with exponential backoff
- **Message parsing errors** - Graceful handling of malformed messages
- **Subscription errors** - Logging and recovery
- **Network issues** - Connection status monitoring

## Testing

Use the `WebSocketTestPanel` component to test the WebSocket functionality:

1. Ensure the WebSocket server is running
2. Open the test panel in your app
3. Send test messages to verify functionality
4. Monitor notifications and status changes

## Dependencies

The implementation uses these packages:
- `@stomp/stompjs` - STOMP protocol client
- `sockjs-client` - WebSocket client with fallback support

Both are already included in your `package.json`.

## Troubleshooting

### Connection Issues
1. Check if the WebSocket server is running on `ws://localhost:8080/ws`
2. Verify network connectivity
3. Check browser console for error messages
4. Use the WebSocketStatus component to monitor connection

### Message Issues
1. Verify message format matches expected structure
2. Check topic subscriptions are correct
3. Monitor browser console for parsing errors
4. Use the test panel to send test messages

### Performance Issues
1. Monitor notification count (limited to 10 active notifications)
2. Check for memory leaks in long-running connections
3. Verify automatic cleanup on component unmount

## Future Enhancements

- **Message queuing** for offline scenarios
- **Message persistence** for missed notifications
- **Advanced filtering** for specific booking types
- **Push notifications** integration
- **Message encryption** for sensitive data 