import React from 'react';
import { useBookingContext } from '../context/BookingContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const WebSocketStatus = () => {
  const { isConnected, getConnectionStatus } = useBookingContext();
  const [connectionDetails, setConnectionDetails] = React.useState(null);

  React.useEffect(() => {
    const updateConnectionDetails = () => {
      const status = getConnectionStatus();
      setConnectionDetails(status);
    };

    updateConnectionDetails();
    const interval = setInterval(updateConnectionDetails, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getConnectionStatus]);

  const getStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="h-4 w-4 text-green-600" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'Connected';
    } else {
      return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (isConnected) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const handleReconnect = () => {
    // This would trigger a reconnection attempt
    // The WebSocket service handles reconnection automatically
    console.log('Manual reconnection attempt');
    window.location.reload(); // Simple approach for now
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="text-xs font-medium">
                {getStatusText()}
              </span>
            </Badge>
            
            {!isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReconnect}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">
              WebSocket Status: {getStatusText()}
            </div>
            {connectionDetails && (
              <div className="text-xs space-y-1">
                <div>
                  Reconnect Attempts: {connectionDetails.reconnectAttempts}
                </div>
                {connectionDetails.subscriptions.length > 0 && (
                  <div>
                    Subscriptions: {connectionDetails.subscriptions.length}
                  </div>
                )}
                <div className="text-gray-500">
                  URL: ws://localhost:8080/ws
                </div>
              </div>
            )}
            {!isConnected && (
              <div className="text-xs text-red-600">
                Attempting to reconnect automatically...
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WebSocketStatus;
