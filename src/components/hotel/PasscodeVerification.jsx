import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, Calendar, MapPin, User, Bed, Clock } from 'lucide-react';
import api from '@/services/Api';

const PasscodeVerification = () => {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const verifyPasscode = async (e) => {
    e.preventDefault();
    
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }

    setLoading(true);
    setError('');
    setBookingData(null);

    try {
      const response = await api.get(`/passcode/verify?passcode=${encodeURIComponent(passcode.trim())}`);
      const data = response.data;

      if (data.valid) {
        setBookingData(data);
        setPasscode('');
      } else {
        setError(data.message || 'Invalid passcode or booking not found');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPasscode('');
    setError('');
    setBookingData(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Verify Your Booking</h1>
          <p className="text-sm text-muted-foreground">
            Enter your passcode to view your booking details
          </p>
        </div>

        {/* Verification Form */}
        {!bookingData && (
          <Card className="w-full">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg text-center">Passcode Verification</CardTitle>
              <CardDescription className="text-center text-sm">
                Enter the passcode you received with your booking confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Enter passcode (e.g., A7B9K2)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        verifyPasscode(e);
                      }
                    }}
                    className="text-center text-sm font-mono tracking-widest h-10"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  onClick={verifyPasscode}
                  className="w-full h-9 text-sm" 
                  disabled={loading || !passcode.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Passcode
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center text-sm">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetForm}
                className="ml-4 text-xs"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Booking Details */}
        {bookingData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                {bookingData.message}
              </AlertDescription>
            </Alert>

            <Card className="w-full">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Booking Details
                  </CardTitle>
                  <Badge variant={getStatusVariant(bookingData.status)} className="text-xs px-2 py-1">
                    {bookingData.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Booking ID: #{bookingData.bookingId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Information */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Guest Information</h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Guest Name</p>
                        <p className="text-sm font-medium">{bookingData.guestName}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Accommodation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hotel</p>
                          <p className="text-sm font-medium">{bookingData.hotelName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Room Number</p>
                          <p className="text-sm font-medium">Room {bookingData.roomNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Stay Duration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Check-in Date</p>
                          <p className="text-sm font-medium">{formatDate(bookingData.checkInDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Check-out Date</p>
                          <p className="text-sm font-medium">{formatDate(bookingData.checkOutDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Booking Information</h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Booking Created</p>
                        <p className="text-sm font-medium">{formatDateTime(bookingData.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  <Separator />
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1 h-9 text-sm"
                    >
                      Verify Another Passcode
                    </Button>
                    <Button 
                      className="flex-1 h-9 text-sm"
                      onClick={() => window.print()}
                    >
                      Print Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasscodeVerification;