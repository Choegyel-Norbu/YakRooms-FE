import React, { useState } from 'react';
import { useBookingContext } from '../context/BookingContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const WebSocketTestPanel = () => {
  const { sendMessage, isConnected, lastStatusChange, bookingNotifications } = useBookingContext();
  const [testBookingId, setTestBookingId] = useState('TEST-001');
  const [testHotelId, setTestHotelId] = useState('HOTEL-001');
  const [testUserId, setTestUserId] = useState('USER-001');
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED');

  const bookingStatuses = [
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'REJECTED',
    'PAYMENT_REQUIRED'
  ];

  const messageTypes = [
    'BOOKING_STATUS_UPDATE',
    'BOOKING_CREATED',
    'BOOKING_CANCELLED',
    'BOOKING_MODIFIED',
    'BOOKING_CONFIRMED',
    'BOOKING_REJECTED',
    'PAYMENT_REQUIRED',
    'CHECK_IN_REMINDER',
    'CHECK_OUT_REMINDER'
  ];

  const [selectedMessageType, setSelectedMessageType] = useState('BOOKING_STATUS_UPDATE');

  const sendTestMessage = (type, payload) => {
    if (!isConnected) {
      alert('WebSocket not connected!');
      return;
    }

    const message = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    // Send to both topics for testing
    sendMessage('/topic/bookings', message);
    sendMessage(`/queue/users/${testUserId}/bookings`, message);
    
    console.log('Test message sent:', message);
  };

  const sendStatusUpdate = () => {
    const payload = {
      bookingId: testBookingId,
      hotelId: testHotelId,
      userId: testUserId,
      newStatus: selectedStatus,
      previousStatus: 'PENDING',
      timestamp: new Date().toISOString()
    };

    sendTestMessage('BOOKING_STATUS_UPDATE', payload);
  };

  const sendCustomMessage = () => {
    const payload = {
      bookingId: testBookingId,
      hotelId: testHotelId,
      userId: testUserId,
      message: 'Test message',
      timestamp: new Date().toISOString()
    };

    sendTestMessage(selectedMessageType, payload);
  };

  const sendRandomEvent = () => {
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const randomStatus = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
    
    const payload = {
      bookingId: `TEST-${Math.floor(Math.random() * 1000)}`,
      hotelId: testHotelId,
      userId: testUserId,
      newStatus: randomStatus,
      previousStatus: 'PENDING',
      timestamp: new Date().toISOString()
    };

    sendTestMessage(randomType, payload);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WebSocket Test Panel
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test WebSocket functionality and simulate booking events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Connection Status</Label>
            <div className="text-sm text-gray-600">
              {isConnected ? 'Connected to WebSocket' : 'Disconnected'}
            </div>
          </div>
          <div>
            <Label>Notifications</Label>
            <div className="text-sm text-gray-600">
              {bookingNotifications.length} active notifications
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Data Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input
              id="bookingId"
              value={testBookingId}
              onChange={(e) => setTestBookingId(e.target.value)}
              placeholder="TEST-001"
            />
          </div>
          <div>
            <Label htmlFor="hotelId">Hotel ID</Label>
            <Input
              id="hotelId"
              value={testHotelId}
              onChange={(e) => setTestHotelId(e.target.value)}
              placeholder="HOTEL-001"
            />
          </div>
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              placeholder="USER-001"
            />
          </div>
        </div>

        <Separator />

        {/* Status Update Test */}
        <div>
          <Label>Test Status Update</Label>
          <div className="flex gap-2 mt-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bookingStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={sendStatusUpdate} disabled={!isConnected}>
              Send Status Update
            </Button>
          </div>
        </div>

        <Separator />

        {/* Custom Message Test */}
        <div>
          <Label>Test Custom Message</Label>
          <div className="flex gap-2 mt-2">
            <Select value={selectedMessageType} onValueChange={setSelectedMessageType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={sendCustomMessage} disabled={!isConnected}>
              Send Custom Message
            </Button>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div>
          <Label>Quick Actions</Label>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={sendRandomEvent} 
              disabled={!isConnected}
            >
              Send Random Event
            </Button>
            <Button 
              variant="outline" 
              onClick={() => sendTestMessage('BOOKING_CREATED', {
                bookingId: testBookingId,
                hotelId: testHotelId,
                userId: testUserId
              })} 
              disabled={!isConnected}
            >
              Simulate New Booking
            </Button>
          </div>
        </div>

        {/* Last Status Change Display */}
        {lastStatusChange && (
          <>
            <Separator />
            <div>
              <Label>Last Status Change</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div><strong>Booking ID:</strong> {lastStatusChange.bookingId}</div>
                  <div><strong>Status:</strong> {lastStatusChange.previousStatus} → {lastStatusChange.newStatus}</div>
                  <div><strong>Time:</strong> {new Date(lastStatusChange.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WebSocketTestPanel; 