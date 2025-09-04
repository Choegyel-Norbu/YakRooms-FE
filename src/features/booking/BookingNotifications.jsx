import React from 'react';
import { useBookingContext } from './BookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Bell, X } from 'lucide-react';

const BookingNotifications = () => {
  const {
    bookingNotifications,
    clearNotifications,
    removeNotification,
    isConnected
  } = useBookingContext();

  const getNotificationColor = () => {
    return 'border-blue-200 bg-blue-50';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (!bookingNotifications || bookingNotifications.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            Booking Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm py-4">
            No notifications yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            Booking Notifications
            <Badge variant="secondary" className="text-xs">
              {bookingNotifications.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className="text-xs"
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookingNotifications.map((notification, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getNotificationColor()}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                
                                  <div className="flex-1 min-w-0">
                    {/* <div className="font-medium text-sm">
                      {notification.title}
                    </div> */}
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    {notification.username && (
                      <div><span className="font-medium">User:</span> {notification.username}</div>
                    )}
                    {notification.roomNumber && (
                      <div><span className="font-medium">Room:</span> {notification.roomNumber}</div>
                    )}
                    {notification.payload && (
                      <>
                        {notification.payload.bookingId && (
                          <div><span className="font-medium">Booking:</span> {notification.payload.bookingId}</div>
                        )}
                        {notification.payload.newStatus && (
                          <div><span className="font-medium">Status:</span> {notification.payload.newStatus}</div>
                        )}
                        {notification.payload.guestName && (
                          <div><span className="font-medium">Guest:</span> {notification.payload.guestName}</div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(index)}
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BookingNotifications;
