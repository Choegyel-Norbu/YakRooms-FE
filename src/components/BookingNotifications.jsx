import React from 'react';
import { useBookingContext } from '../context/BookingContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const BookingNotifications = () => {
  const { 
    bookingNotifications, 
    removeNotification, 
    clearNotifications,
    isConnected 
  } = useBookingContext();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (bookingNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <div className="text-center">
          <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No booking notifications</p>
          {!isConnected && (
            <Badge variant="outline" className="mt-2">
              WebSocket disconnected
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Booking Notifications ({bookingNotifications.length})
        </h3>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <Badge variant="outline" className="text-xs">
              Disconnected
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {bookingNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  {notification.payload?.bookingId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Booking ID: {notification.payload.bookingId}
                    </p>
                  )}
                  {notification.payload?.hotelId && (
                    <p className="text-xs text-gray-500">
                      Hotel ID: {notification.payload.hotelId}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingNotifications; 