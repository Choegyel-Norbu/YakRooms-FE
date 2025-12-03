import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
} from 'lucide-react';
import { Spinner } from "@/components/ui/ios-spinner";
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

import { roomDeletionService } from '../services/roomDeletionService';

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
                <Spinner size="md" className="text-primary" />
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
                <>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold text-sm">Cannot Delete Room</span>
                      </div>
                      <p className="text-red-600 text-sm">
                        This room has {deletionStatus.totalActiveBookings || 0} active booking{deletionStatus.totalActiveBookings !== 1 ? 's' : ''}. 
                        Please cancel or complete all bookings before deleting the room.
                      </p>
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
                  <Spinner size="sm" className="mr-2" />
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
