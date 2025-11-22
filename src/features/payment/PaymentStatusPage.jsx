import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCurrentActiveRole } = useAuth();
  const [countdown, setCountdown] = useState(10);

  const type = searchParams.get('type') || 'booking';
  const bookingId = searchParams.get('bookingId');
  const subscriptionId = searchParams.get('subscriptionId');
  const status = searchParams.get('status') || 'UNKNOWN';
  const orderNumber = searchParams.get('orderNumber') || 'UNKNOWN';

  const id = bookingId || subscriptionId || 'unknown';

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleRedirect = () => {
    if (type === 'subscription') {
      navigate('/subscription');
    } else if (type === 'extension') {
      // Extensions are typically for guests
      navigate('/guestDashboard');
    } else {
      // For bookings, redirect based on user role
      const activeRole = getCurrentActiveRole();
      if (activeRole === 'GUEST') {
        navigate('/guestDashboard');
      } else if (['HOTEL_ADMIN', 'STAFF', 'MANAGER', 'FRONTDESK'].includes(activeRole)) {
        navigate('/hotelAdmin');
      } else {
        // Fallback to dashboard which will redirect based on role
        navigate('/dashboard');
      }
    }
  };

  const getStatusConfig = () => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return {
          icon: '✓',
          iconClass: 'text-green-500 bg-green-100',
          title: 'Payment Successful!',
          message: getSuccessMessage(),
          buttonText: 'View Details',
        };
      case 'FAILED':
        return {
          icon: '✕',
          iconClass: 'text-red-500 bg-red-100',
          title: 'Payment Failed',
          message: getFailureMessage(),
          buttonText: 'Try Again',
        };
      case 'CANCELLED':
        return {
          icon: '⏱',
          iconClass: 'text-orange-500 bg-orange-100',
          title: 'Payment Cancelled',
          message: getCancelledMessage(),
          buttonText: 'Go Back',
        };
      default:
        return {
          icon: '?',
          iconClass: 'text-gray-500 bg-gray-100',
          title: 'Payment Status Unknown',
          message: 'Unable to determine payment status. Please contact support.',
          buttonText: 'Go Back',
        };
    }
  };

  const getSuccessMessage = () => {
    if (type === 'subscription') {
      return 'Your subscription payment has been processed successfully. Your subscription is now active.';
    } else if (type === 'extension') {
      return 'Your booking extension payment has been processed successfully. Your booking has been extended.';
    }
    return 'Your payment has been processed successfully. You can see your booking details below.';
  };

  const getFailureMessage = () => {
    if (type === 'subscription') {
      return 'Your subscription payment could not be processed. Please try again or contact support.';
    } else if (type === 'extension') {
      return 'Your booking extension payment could not be processed. Your original booking remains unchanged.';
    }
    return 'Your payment could not be processed. Your booking has been cancelled.';
  };

  const getCancelledMessage = () => {
    if (type === 'subscription') {
      return 'Your subscription payment has been cancelled. You can try again when ready.';
    } else if (type === 'extension') {
      return 'Your booking extension payment has been cancelled. Your original booking remains unchanged.';
    }
    return 'Your payment has been cancelled. Your booking has been cancelled.';
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl ${config.iconClass} animate-scale-in`}>
          {config.icon}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {config.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {config.message}
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Order Number:</span>
              <span className="text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Payment Status:</span>
              <span className={`font-semibold ${
                status.toUpperCase() === 'PAID' ? 'text-green-600' : 
                status.toUpperCase() === 'FAILED' ? 'text-red-600' : 
                'text-orange-600'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
            {type && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Payment Type:</span>
                <span className="text-gray-900 capitalize">{type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRedirect}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
        >
          {config.buttonText}
        </button>

        {/* Auto-redirect message */}
        <p className="text-sm text-gray-500 mt-4">
          Redirecting automatically in <span className="font-semibold text-indigo-600">{countdown}</span> seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

