import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  User, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// ShadCN UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Separator } from '@/shared/components/separator';

import { roomDeletionService } from '../services/roomDeletionService';

/**
 * Booking Details Component
 * Shows detailed information about blocking bookings
 */
const BookingDetailsCard = ({ booking }) => {
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CHECKED_IN':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="pt-4 text-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Booking #{booking.bookingId}</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(booking.status)}`}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(booking.status)}
                {booking.status}
              </span>
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="font-medium text-sm">{booking.guestName}</span>
          </div>
          
          {booking.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{booking.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Booking Summary Component
 * Shows summary statistics of blocking bookings
 */
const BookingSummary = ({ deletionStatus }) => {
  const { totalActiveBookings, pendingBookings, confirmedBookings, checkedInBookings } = deletionStatus;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="text-xl font-bold text-red-600">{totalActiveBookings}</div>
        <div className="text-xs text-red-700 font-medium">Total Active</div>
      </div>
      
      {pendingBookings > 0 && (
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-xl font-bold text-yellow-600">{pendingBookings}</div>
          <div className="text-xs text-yellow-700 font-medium">Pending</div>
        </div>
      )}
      
      {confirmedBookings > 0 && (
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xl font-bold text-green-600">{confirmedBookings}</div>
          <div className="text-xs text-green-700 font-medium">Confirmed</div>
        </div>
      )}
      
      {checkedInBookings > 0 && (
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xl font-bold text-blue-600">{checkedInBookings}</div>
          <div className="text-xs text-blue-700 font-medium">Checked In</div>
        </div>
      )}
    </div>
  );
};

/**
 * Room Deletion Dialog Component
 * Comprehensive dialog for safe room deletion with booking validation
 */
const RoomDeletionDialog = ({ 
  isOpen, 
  onClose, 
  room, 
  onDeleteSuccess 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [error, setError] = useState(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen && room) {
      setDeletionStatus(null);
      setError(null);
      checkDeletionStatus();
    } else {
      setDeletionStatus(null);
      setError(null);
    }
  }, [isOpen, room]);

  const checkDeletionStatus = async () => {
    if (!room?.id) return;

    setIsChecking(true);
    setError(null);

    try {
      const result = await roomDeletionService.checkDeletionStatus(room.id);
      
      if (result.success) {
        setDeletionStatus(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to check room deletion status. Please try again.');
      console.error('Error checking deletion status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!room?.id || !deletionStatus?.canDelete) return;

    setIsDeleting(true);

    try {
      const result = await roomDeletionService.deleteRoom(room.id);
      
      if (result.success) {
        toast.success(`Room ${room.roomNumber} deleted successfully!`, {
          duration: 6000
        });
        onDeleteSuccess(room.id);
        onClose();
      } else {
        toast.error(result.error || 'Failed to delete room', {
          duration: 6000
        });
      }
    } catch (err) {
      toast.error('An unexpected error occurred while deleting the room', {
        duration: 6000
      });
      console.error('Error deleting room:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isChecking && !isDeleting) {
      onClose();
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            Delete Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Checking if room can be safely deleted...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isChecking && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Checking room status...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold text-sm">Error</span>
                </div>
                <p className="text-red-600 mt-2 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkDeletionStatus}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Deletion Status Results */}
          {deletionStatus && (
            <>
              {/* Safe to Delete */}
              {deletionStatus.canDelete ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold text-sm">Safe to Delete</span>
                    </div>
                    <p className="text-green-600 text-sm">{deletionStatus.message}</p>
                  </CardContent>
                </Card>
              ) : (
                /* Cannot Delete - Show Blocking Bookings */
                <>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold text-sm">Cannot Delete Room</span>
                      </div>
                      <p className="text-red-600 text-sm">{deletionStatus.message}</p>
                    </CardContent>
                  </Card>

                  {/* Booking Summary */}
                  <BookingSummary deletionStatus={deletionStatus} />

                  {/* Blocking Bookings Details */}
                  {deletionStatus.blockingBookings && deletionStatus.blockingBookings.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Active Bookings ({deletionStatus.blockingBookings.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {deletionStatus.blockingBookings.map((booking) => (
                            <BookingDetailsCard key={booking.bookingId} booking={booking} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-blue-700">
                          <p className="font-semibold text-sm mb-1">Next Steps:</p>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Cancel or complete all active bookings</li>
                            <li>Wait for guests to check out</li>
                            <li>Try deleting the room again</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isChecking || isDeleting}
          >
            {deletionStatus?.canDelete ? 'Cancel' : 'Close'}
          </Button>
          
          {deletionStatus?.canDelete && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Room
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDeletionDialog;
