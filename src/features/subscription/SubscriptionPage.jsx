import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Check, Loader2, ArrowLeft, CreditCard, Clock } from 'lucide-react';
import { enhancedApi } from '@/shared/services/Api';
import { useAuth } from '@/features/authentication/AuthProvider';
import { toast } from 'sonner';
import { calculateDaysUntil, formatDate } from '@/shared/utils/subscriptionUtils';
import { handlePaymentRedirect } from '@/shared/utils/paymentRedirect';
import { getStorageItem } from '@/shared/utils/safariLocalStorage';

const SubscriptionPage = () => {
  const { 
    userId,
    hotelId,
    selectedHotelId, 
    subscriptionIsActive, 
    subscriptionPlan,
    subscriptionNextBillingDate,
    subscriptionExpirationNotification,
    updateSubscriptionCache,
    fetchSubscriptionData
  } = useAuth();
  const navigate = useNavigate();
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Helper function to get hotelId from localStorage (not from cache)
  // Prioritizes newHotelId from sessionStorage (for newly created hotels),
  // then selectedHotelId if multiple hotels exist
  const getHotelIdFromStorage = () => {
    try {

      // Priority 1: Check for newly created hotel ID in sessionStorage
      const newHotelId = sessionStorage.getItem('newHotelId');
      if (newHotelId) {
        const parsedId = parseInt(newHotelId);
        if (!isNaN(parsedId)) {
          // Clear it after use so it doesn't interfere with future operations
          sessionStorage.removeItem('newHotelId');
          return parsedId;
        }
      }

      // Priority 2: Read directly from localStorage
      const storedSelectedHotelId = getStorageItem('selectedHotelId');
      const storedHotelIds = getStorageItem('hotelIds');
      const storedHotelId = getStorageItem('hotelId');

      // Parse hotelIds array to check if multiple hotels exist
      let hotelIdsArray = [];
      if (storedHotelIds) {
        if (Array.isArray(storedHotelIds)) {
          hotelIdsArray = storedHotelIds;
        } else if (typeof storedHotelIds === 'string' && storedHotelIds.trim() !== '') {
          try {
            hotelIdsArray = JSON.parse(storedHotelIds);
            if (!Array.isArray(hotelIdsArray)) {
              hotelIdsArray = [storedHotelIds];
            }
          } catch (e) {
            hotelIdsArray = [storedHotelIds];
          }
        } else if (typeof storedHotelIds === 'number' || typeof storedHotelIds === 'string') {
          hotelIdsArray = [storedHotelIds.toString()];
        }
      }

      // If multiple hotels exist, always use selectedHotelId (required)
      if (hotelIdsArray.length > 1) {
        if (storedSelectedHotelId) {
          const result = parseInt(storedSelectedHotelId);
          return result;
        }
        // If multiple hotels but no selectedHotelId, this is an error state
        console.warn('Multiple hotels found but no selectedHotelId in localStorage');
      }

      // Otherwise, use selectedHotelId if available, then fallback to hotelId
      if (storedSelectedHotelId) {
        const result = parseInt(storedSelectedHotelId);
        return result;
      }

      if (storedHotelId) {
        const result = parseInt(storedHotelId);
        return result;
      }

      // Fallback to context values as last resort (shouldn't normally happen)
      const result = parseInt(selectedHotelId || hotelId);
      return result;
    } catch (error) {
      // Fallback to context values
      const result = parseInt(selectedHotelId || hotelId);
      return result;
    }
  };

  // Refresh subscription data when component mounts or selectedHotelId changes
  useEffect(() => {
    const refreshSubscriptionData = async () => {
      if (userId && fetchSubscriptionData) {
        const hotelIdToUse = getHotelIdFromStorage();
        if (hotelIdToUse) {
          console.log("🔄 Refreshing subscription data for hotel:", hotelIdToUse);
          try {
            await fetchSubscriptionData(userId, true, hotelIdToUse);
          } catch (error) {
            console.error("Failed to refresh subscription data:", error);
          }
        }
      }
    };

    refreshSubscriptionData();
  }, [userId, selectedHotelId, fetchSubscriptionData]);

  // Determine subscription state based on both subscriptionIsActive and subscriptionPlan
  const isTrialActive = subscriptionIsActive === true && subscriptionPlan === 'TRIAL';
  const isProActive = subscriptionIsActive === true && subscriptionPlan === 'PRO';
  const isTrialExpired = subscriptionIsActive === false && (subscriptionPlan === 'TRIAL' || !subscriptionPlan);
  const isNoSubscription = !subscriptionIsActive && !subscriptionPlan;
  
  // Check if user has ever had PRO subscription (active or expired)
  const hasEverHadPro = subscriptionPlan === 'PRO';
  
  // Check if subscription expires tomorrow (1 day remaining)
  // On expiration date (daysUntilExpiration === 0), subscription is expired, so don't show renewal cards
  const daysUntilExpiration = calculateDaysUntil(subscriptionNextBillingDate);
  const expiresTomorrow = daysUntilExpiration === 1 && subscriptionExpirationNotification;
  const isActiveSubscription = subscriptionIsActive === true;

  const pricingPlans = [
    {
      id: 'free',
      name: isTrialExpired 
        ? 'Trial Expired' 
        : isTrialActive 
          ? 'Active Trial' 
          : 'Free Trial',
      price: isTrialExpired 
        ? 'Expired' 
        : isTrialActive 
          ? 'Active' 
          : 'Free',
      period: '2 months',
      description: isTrialExpired 
        ? 'Your free trial has expired. Subscribe to continue using EzeeRoom.' 
        : isTrialActive
          ? 'You are currently enjoying your free trial. Continue exploring all features!'
          : 'Perfect for getting started with EzeeRoom',
      features: [
        'Access to all platform features',
        'Hotel management dashboard',
        'Guest booking system',
        'Basic analytics & reports',
        'Mobile app access',
      ],
      buttonText: isTrialExpired 
        ? 'Trial expired' 
        : isTrialActive
          ? 'Continue to Dashboard'
          : 'Get Started Free',
      buttonVariant: 'default',
      popular: !isTrialExpired,
      savings: null,
      isExpired: isTrialExpired,
      isActive: isTrialActive,
      isProActive: isProActive
    },
    {
      id: 'subscription',
      name: isProActive 
        ? 'Pro Subscription' 
        : subscriptionPlan === 'PREMIUM' 
          ? 'Premium Subscription'
          : subscriptionPlan === 'BASIC'
            ? 'Basic Subscription'
            : 'Pro Subscription',
      price: 'Nu. 1,000',
      period: 'per month',
      description: isProActive 
        ? 'Your hotel listing is active and discoverable to guests worldwide.'
        : 'Subscribe to activate your hotel listing and let others discover your hotel.',
      features: [
        'Activate your hotel listing',
        'Make your hotel discoverable to guests',
        'Appear in search results',
        'Receive booking requests',
        'Manage guest reservations',
        'Access booking analytics',
        'Customer support',
        'Download reports',
      ],
      buttonText: isProActive ? 'Manage Subscription' : 'Subscribe Now',
      isDisabled: isProActive,
      buttonVariant: 'default',
      popular: false,
      savings: null,
      isExpired: false,
      isActive: isProActive,
      isSubscription: true,
      isProActive: isProActive
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!userId) {
      toast.error('User ID not found. Please ensure you are logged in.');
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Calculate trial dates (2 months from now)
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 2);
      
      // Determine subscription plan based on planId
      const subscriptionPlan = planId === 'free' ? 'TRIAL' : 'PRO';
      
      // Get hotelId from localStorage (not from cache)
      const hotelIdFromStorage = getHotelIdFromStorage();
      
      if (!hotelIdFromStorage) {
        toast.error('Hotel ID not found. Please ensure you have selected a hotel.');
        setIsSubscribing(false);
        return;
      }

      const subscriptionData = {
        userId: parseInt(userId),
        hotelId: hotelIdFromStorage,
        subscriptionPlan: subscriptionPlan,
        paymentStatus: "PENDING",
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        nextBillingDate: trialEndDate.toISOString(),
        cancelDate: null,
        lastPaymentDate: null,
        amount: 1000.0,
        notes: "Initial subscription setup for new user"
      };

      console.log('Creating subscription with data:', subscriptionData);
      
      const response = await enhancedApi.post('/subscriptions', subscriptionData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Free trial started successfully! Welcome to EzeeRoom.');
        console.log('Subscription created successfully:', response.data);
        
        // Update subscription cache with new data
        const newSubscriptionData = {
          id: response.data.id,
          subscriptionId: response.data.id,
          paymentStatus: response.data.paymentStatus,
          subscriptionPlan: response.data.subscriptionPlan,
          isActive: true, // New subscription is active
          nextBillingDate: response.data.nextBillingDate,
          expirationNotification: false
        };
        
        updateSubscriptionCache(newSubscriptionData);
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/hotelAdmin?refreshSubscription=1', { replace: true });
        }, 1000);
      } else {
        throw new Error('Unexpected response status');
      }
      
    } catch (error) {
      console.error('Failed to create subscription:', error);
      
      if (error.response?.status === 409) {
        toast.error('You already have an active subscription. Please check your account status.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid subscription data. Please try again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error('Failed to start free trial. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubscriptionCard = async () => {
    if (!userId) {
      toast.error('User ID not found. Please ensure you are logged in.');
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Calculate next billing date (1 month from now for PRO subscription)
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      
      // Get hotelId from localStorage (not from cache)
      const hotelIdFromStorage = getHotelIdFromStorage();
      
      if (!hotelIdFromStorage) {
        toast.error('Hotel ID not found. Please ensure you have selected a hotel.');
        setIsSubscribing(false);
        return;
      }

      const subscriptionData = {
        subscriptionPlan: 'PRO',
        amount: 1000.0,
        userId: userId,
        hotelId: hotelIdFromStorage
      };

      console.log('Initiating subscription payment with data:', subscriptionData);
      
      const response = await enhancedApi.post('/subscriptions/payment/initiate', subscriptionData, {
        params: {
          baseUrl: window.location.origin
        }
      });

      console.log('Subscription payment API response:', response);

      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        
        if (responseData.success && responseData.payment?.paymentUrl) {
          toast.success('Payment initiated successfully! Redirecting to RMA payment gateway...');
          console.log('Payment initiated successfully:', responseData);
          console.log('Transaction ID:', responseData.payment.transactionId);
          console.log('Order Number:', responseData.payment.orderNumber);
          console.log('Amount:', responseData.payment.amount, responseData.payment.currency);
          
          // Use proper form handling for payment redirect
          handlePaymentRedirect(responseData.payment, {
            gatewayName: 'RMA',
            onSuccess: (paymentData) => {
              toast.success("Redirecting to Payment Gateway", {
                description: "You are being redirected to RMA payment gateway for processing. Please complete the payment and you will be redirected back.",
                duration: 8000
              });
            },
            onError: (error) => {
              toast.error("Payment Redirect Failed", {
                description: "There was an error redirecting to the payment gateway. Please try again.",
                duration: 6000
              });
            }
          });
        } else {
          throw new Error('Invalid payment response: missing payment URL');
        }
      } else {
        throw new Error('Unexpected response status');
      }
      
    } catch (error) {
      console.error('Failed to update subscription:', error);
      
      if (error.response?.status === 404) {
        toast.error('Subscription not found. Please contact support.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid subscription data. Please try again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error('Failed to activate subscription. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubscriptionRenewal = async () => {
    if (!userId) {
      toast.error('User ID not found. Please ensure you are logged in.');
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Get hotelId from localStorage (not from cache)
      const hotelIdFromStorage = getHotelIdFromStorage();
      
      if (!hotelIdFromStorage) {
        toast.error('Hotel ID not found. Please ensure you have selected a hotel.');
        setIsSubscribing(false);
        return;
      }

      // If it's a trial expiring tomorrow, initiate payment flow instead of renewal
      if (subscriptionPlan === 'TRIAL' && expiresTomorrow) {
        const subscriptionData = {
          subscriptionPlan: 'PRO',
          amount: 1000.0,
          userId: userId,
          hotelId: hotelIdFromStorage
        };

        console.log('Initiating subscription payment for expiring trial:', subscriptionData);
        
        const response = await enhancedApi.post('/subscriptions/payment/initiate', subscriptionData, {
          params: {
            baseUrl: window.location.origin
          }
        });

        console.log('Subscription payment API response:', response);

        if (response.status === 200 || response.status === 201) {
          const responseData = response.data;
          
          if (responseData.success && responseData.payment?.paymentUrl) {
            toast.success('Payment initiated successfully! Redirecting to RMA payment gateway...');
            console.log('Payment initiated successfully:', responseData);
            
            // Use proper form handling for payment redirect
            handlePaymentRedirect(responseData.payment, {
              gatewayName: 'RMA',
              onSuccess: (paymentData) => {
                toast.success("Redirecting to Payment Gateway", {
                  description: "You are being redirected to RMA payment gateway for processing. Please complete the payment and you will be redirected back.",
                  duration: 8000
                });
              },
              onError: (error) => {
                toast.error("Payment Redirect Failed", {
                  description: "There was an error redirecting to the payment gateway. Please try again.",
                  duration: 6000
                });
              }
            });
          } else {
            throw new Error('Invalid payment response: missing payment URL');
          }
        } else {
          throw new Error('Unexpected response status');
        }
      } else {
        // For Pro subscriptions, use renewal flow
        // Calculate next billing date (1 month from current expiration date)
        const currentExpirationDate = new Date(subscriptionNextBillingDate);
        const nextBillingDate = new Date(currentExpirationDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        const subscriptionData = {
          hotelId: hotelIdFromStorage,
          subscriptionPlan: 'PRO',
          paymentStatus: 'PAID',
          nextBillingDate: nextBillingDate.toISOString(),
          lastPaymentDate: new Date().toISOString(),
          expirationNotification: false, // Reset notification flag
          notes: `Subscription renewed on ${new Date().toLocaleDateString()} - Extended for 1 month from expiration date ${formatDate(subscriptionNextBillingDate)}`
        };

        console.log('Renewing subscription with data:', subscriptionData);
        
        const response = await enhancedApi.post('/subscriptions', subscriptionData);
        
        if (response.status === 200 || response.status === 201) {
          toast.success('Subscription renewed successfully! Your hotel listing remains active.');
          console.log('Subscription renewed successfully:', response.data);
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/hotelAdmin');
          }, 2000);
        } else {
          throw new Error('Unexpected response status');
        }
      }
      
    } catch (error) {
      console.error('Failed to process subscription:', error);
      
      if (error.response?.status === 404) {
        toast.error('Subscription not found. Please contact support.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid subscription data. Please try again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        if (subscriptionPlan === 'TRIAL' && expiresTomorrow) {
          toast.error('Failed to initiate subscription payment. Please try again later.');
        } else {
          toast.error('Failed to renew subscription. Please try again later.');
        }
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4 sm:px-0 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        {!isNoSubscription && (
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/hotelAdmin?refreshSubscription=1')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        )}
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            {expiresTomorrow ? (
              <>
                Subscription <span className="text-orange-500">Expires Tomorrow</span>
              </>
            ) : isTrialExpired ? (
              <>
                Trial Period <span className="text-red-500">Expired</span>
              </>
            ) : isTrialActive ? (
              <>
                Your Trial is <span className="text-green-500">Active</span>
              </>
            ) : isProActive ? (
              <>
                {subscriptionPlan === 'PREMIUM' ? 'Premium' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} Subscription <span className="text-blue-600">Active</span>
              </>
            ) : hasEverHadPro ? (
              <>
                Pro Subscription <span className="text-gray-500">Inactive</span>
              </>
            ) : (
              <>
                Start Your Hotel Business 
              </>
            )}
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {expiresTomorrow 
              ? subscriptionPlan === 'TRIAL'
                ? `Your trial period expires tomorrow (${formatDate(subscriptionNextBillingDate)}). Subscribe now to continue enjoying all features and avoid service interruption.`
                : `Your ${subscriptionPlan === 'PREMIUM' ? 'Premium' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} subscription expires tomorrow (${formatDate(subscriptionNextBillingDate)}). Renew now to keep your hotel listing active and avoid service interruption.`
              : isTrialExpired 
                ? 'Your free trial has ended. Subscribe now to continue managing your hotel business with EzeeRoom.'
                : isTrialActive
                  ? 'You are currently in your free trial period. Make the most of all features before your trial ends.'
                  : isProActive
                    ? `Your ${subscriptionPlan === 'PREMIUM' ? 'Premium' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} subscription is active and your hotel listing is discoverable to guests worldwide. Manage your subscription below.`
                    : hasEverHadPro
                      ? 'Your Pro subscription is currently inactive. Reactivate below to restore your hotel listing visibility.'
                      : 'Get 2 months completely free to grow your hotel business with full access to all platform features.'
            }
          </p>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-8 max-w-4xl mx-auto items-stretch ${
          expiresTomorrow ? 'grid-cols-1 lg:grid-cols-2' : 
          (isProActive || hasEverHadPro) ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {/* Renewal Card - Show when subscription expires tomorrow */}
          {expiresTomorrow && (
            <Card className="relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col ring-2 ring-orange-500 shadow-lg scale-105">
              {/* Expires Tomorrow Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  <Clock className="w-3 h-3 mr-1 inline" />
                  Expires Tomorrow
                </div>
              </div>

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  {subscriptionPlan === 'TRIAL'
                    ? 'Trial Expires Tomorrow - Subscribe Now'
                    : subscriptionPlan === 'PREMIUM'
                      ? 'Premium Subscription Renewal'
                      : subscriptionPlan === 'BASIC'
                        ? 'Basic Subscription Renewal'
                        : 'Pro Subscription Renewal'}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {subscriptionPlan === 'TRIAL'
                    ? 'Your trial period expires tomorrow. Subscribe now to continue enjoying all features and avoid service interruption.'
                    : `Your ${subscriptionPlan === 'PREMIUM' ? 'Premium' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} subscription expires tomorrow. Renew now to keep your hotel listing active and avoid service interruption.`}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6 flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-extrabold text-orange-500">
                      Nu. 1,000
                    </span>
                    <span className="text-gray-600 ml-2 text-sm font-medium">
                      per month
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Next billing: {formatDate(new Date(new Date(subscriptionNextBillingDate).setMonth(new Date(subscriptionNextBillingDate).getMonth() + 1)))}
                  </p>
                </div>

                <ul className="space-y-3 text-left flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Keep your hotel listing active</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Maintain discoverability to guests</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Continue receiving booking requests</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Access all premium features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Priority customer support</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={handleSubscriptionRenewal}
                  variant="default"
                  size="lg"
                  disabled={isSubscribing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {subscriptionPlan === 'TRIAL' ? 'Subscribing...' : 'Renewing...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {subscriptionPlan === 'TRIAL' 
                        ? 'Subscribe Now' 
                        : subscriptionPlan === 'PREMIUM'
                          ? 'Renew Premium Subscription'
                          : subscriptionPlan === 'BASIC'
                            ? 'Renew Basic Subscription'
                            : 'Renew Pro Subscription'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Current Active Subscription Card - Show when subscription expires tomorrow */}
          {expiresTomorrow && (
            <Card className="relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col ring-2 ring-blue-500 shadow-lg scale-105">
              {/* Current Subscription Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Subscription
                </div>
              </div>

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  {subscriptionPlan === 'PRO' 
                    ? 'Pro Subscription' 
                    : subscriptionPlan === 'PREMIUM'
                      ? 'Premium Subscription'
                      : subscriptionPlan === 'BASIC'
                        ? 'Basic Subscription'
                        : subscriptionPlan === 'TRIAL'
                          ? 'Trial Subscription'
                          : 'Subscription'}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  Your current subscription is active until tomorrow. This is your existing subscription status.
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6 flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-extrabold text-blue-500">
                      {subscriptionPlan === 'PRO' || subscriptionPlan === 'PREMIUM' || subscriptionPlan === 'BASIC' 
                        ? 'Nu. 1,000' 
                        : 'Free'}
                    </span>
                    <span className="text-gray-600 ml-2 text-sm font-medium">
                      {subscriptionPlan === 'PRO' || subscriptionPlan === 'PREMIUM' || subscriptionPlan === 'BASIC'
                        ? 'per month' 
                        : 'trial'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires: {formatDate(subscriptionNextBillingDate)}
                  </p>
                </div>

                <ul className="space-y-3 text-left flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Hotel listing visibility</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Booking management</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Customer support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">Mobile app access</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => navigate('/hotelAdmin?refreshSubscription=1')}
                  variant="outline"
                  size="lg"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  Continue to Dashboard
                </Button>
              </CardFooter>
            </Card>
          )}

          {!expiresTomorrow && pricingPlans.filter(plan => {
            // Hide free trial card if user has ever had Pro subscription
            if (plan.id === 'free' && hasEverHadPro) {
              return false;
            }
            // Hide paid subscription card if user is currently in active TRIAL (not expired)
            if (plan.id === 'subscription' && subscriptionPlan === 'TRIAL' && subscriptionIsActive === true) {
              return false;
            }
            return true;
          }).map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col ${
                plan.isExpired
                  ? 'ring-2 ring-red-500 shadow-lg scale-105'
                  : plan.isActive
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                    : plan.isProActive
                      ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                      : plan.popular 
                        ? 'ring-2 ring-primary shadow-lg scale-105' 
                        : 'hover:shadow-lg'
              } ${plan.isSubscription ? 'mt-10 sm:mt-0' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && !plan.isExpired && !plan.isActive && !plan.isProActive && !plan.isSubscription && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Initial Trial
                  </div>
                </div>
              )}

              {/* Active Trial Badge */}
              {plan.isActive && !plan.isProActive && !plan.isSubscription && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Currently Active
                  </div>
                </div>
              )}

              {/* Pro Subscription Badge */}
              {plan.isProActive && plan.isSubscription && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Pro Subscription
                  </div>
                </div>
              )}

              {/* Regular Subscription Badge */}
              {plan.isSubscription && !plan.isProActive && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Subscription
                  </div>
                </div>
              )}

              {/* Expired Badge */}
              {plan.isExpired && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Trial Expired
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {plan.savings}
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6 flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className={`text-3xl font-extrabold ${
                      plan.isExpired 
                        ? 'text-red-500' 
                        : plan.isActive 
                          ? 'text-blue-500' 
                          : plan.isProActive
                            ? 'text-purple-500'
                            : 'text-yellow-500'
                    }`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2 text-sm font-medium">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 text-left flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => {
                    if (plan.isActive) {
                      navigate('/hotelAdmin?refreshSubscription=1');
                    } else if (plan.isProActive && plan.isSubscription) {
                      // Handle pro subscription management
                      navigate('/subscription-management');
                    } else if (plan.isSubscription) {
                      // Handle subscription management or creation
                      if (isProActive) {
                        // Navigate to subscription management for pro users
                        navigate('/subscription-management');
                      } else {
                        // Use separate API call for subscription card
                        handleSubscriptionCard();
                      }
                    } else {
                      handleSubscribe(plan.id);
                    }
                  }}
                  variant={plan.buttonVariant}
                  size="lg"
                  disabled={isSubscribing || plan.isDisabled}
                  className={`w-full ${
                    plan.isExpired
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : plan.isActive
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : plan.isProActive
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : plan.popular 
                            ? 'bg-primary hover:bg-primary/90 text-white' 
                            : ''
                  }`}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {plan.isExpired ? 'Processing...' : 'Starting Trial...'}
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;