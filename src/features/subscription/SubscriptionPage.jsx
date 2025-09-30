import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { enhancedApi } from '@/shared/services/Api';
import { useAuth } from '@/features/authentication/AuthProvider';
import { toast } from 'sonner';

const SubscriptionPage = () => {
  const { hotelId, subscriptionId, subscriptionIsActive, subscriptionPlan } = useAuth();
  const navigate = useNavigate();
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Determine subscription state based on both subscriptionIsActive and subscriptionPlan
  const isTrialActive = subscriptionIsActive === true && subscriptionPlan === 'TRIAL';
  const isProActive = subscriptionIsActive === true && subscriptionPlan === 'PRO';
  const isTrialExpired = subscriptionIsActive === false && (subscriptionPlan === 'TRIAL' || !subscriptionPlan);
  const isNoSubscription = !subscriptionIsActive && !subscriptionPlan;
  
  // Check if user has ever had PRO subscription (active or expired)
  const hasEverHadPro = subscriptionPlan === 'PRO';

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
      name: isProActive ? 'Active Pro Subscription' : 'Paid subscription',
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
    if (!hotelId) {
      toast.error('Hotel ID not found. Please ensure you are logged in and have a hotel associated with your account.');
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
      
      const subscriptionData = {
        hotelId: parseInt(hotelId),
        subscriptionPlan: subscriptionPlan,
        paymentStatus: "PENDING",
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        nextBillingDate: trialEndDate.toISOString(),
        cancelDate: null,
        lastPaymentDate: null,
        notes: "Initial subscription setup for new hotel"
      };

      console.log('Creating subscription with data:', subscriptionData);
      
      const response = await enhancedApi.post('/subscriptions', subscriptionData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Free trial started successfully! Welcome to EzeeRoom.');
        console.log('Subscription created successfully:', response.data);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/hotelAdmin');
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
    if (!hotelId) {
      toast.error('Hotel ID not found. Please ensure you are logged in and have a hotel associated with your account.');
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Calculate next billing date (1 month from now for PRO subscription)
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      
      const subscriptionData = {
        subscriptionPlan: 'PRO',
        paymentStatus: 'PAID',
        nextBillingDate: nextBillingDate.toISOString()
      };

      console.log('Updating subscription with data:', subscriptionData);
      
      const response = await enhancedApi.put(`/subscriptions/hotel/${hotelId}`, subscriptionData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Subscription activated successfully! Your hotel is now discoverable.');
        console.log('Subscription updated successfully:', response.data);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/hotelAdmin');
        }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4 sm:px-0 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/hotelAdmin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            {isTrialExpired ? (
              <>
                Trial Period <span className="text-red-500">Expired</span>
              </>
            ) : isTrialActive ? (
              <>
                Your Trial is <span className="text-green-500">Active</span>
              </>
            ) : isProActive ? (
              <>
                Pro Subscription <span className="text-blue-600">Active</span>
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
            {isTrialExpired 
              ? 'Your free trial has ended. Subscribe now to continue managing your hotel business with EzeeRoom.'
              : isTrialActive
                ? 'You are currently in your free trial period. Make the most of all features before your trial ends.'
                : isProActive
                  ? 'Your hotel listing is active and discoverable to guests worldwide. Manage your subscription below.'
                  : hasEverHadPro
                    ? 'Your Pro subscription is currently inactive. Reactivate below to restore your hotel listing visibility.'
                    : 'Get 2 months completely free to grow your hotel business with full access to all platform features.'
            }
          </p>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-8 max-w-4xl mx-auto items-stretch ${
          (isProActive || hasEverHadPro) ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {pricingPlans.filter(plan => {
            // Hide free trial card if user has ever had Pro subscription
            if (plan.id === 'free' && hasEverHadPro) {
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
                      navigate('/hotelAdmin');
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
