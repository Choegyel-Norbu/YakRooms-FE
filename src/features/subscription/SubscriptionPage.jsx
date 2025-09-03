import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Check, Star, Zap, Crown, ChevronDown, ChevronUp } from 'lucide-react';

const SubscriptionPage = () => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

 
  const faqData = [
    {
      question: "Is the Free Trial really free?",
      answer: "Yes. YakRooms offers a full 6-month Premium Free Trial with no upfront charges and no credit card required. During this time, you’ll have access to all Premium features, including advanced hotel search, instant booking confirmations, and AI-powered recommendations. The Free Trial is designed to help travelers and hoteliers experience the platform without any barriers before deciding to subscribe."
    },
    {
      question: "What happens after the trial ends?",
      answer: "Once the 6-month Free Trial ends, your account will automatically continue on our free basic tier with limited features such as browsing hotels and viewing availability. To keep access to Premium benefits—like faster booking confirmations, priority customer support, and AI-assisted trip planning—you can upgrade to a paid plan at Nu 400 per month or Nu 4,000 per year. You will always be notified before the trial ends so you can choose whether to upgrade or continue on the free plan."
    },
    {
      question: "What do I get with Premium?",
      answer: "YakRooms Premium is designed for travelers and hotel owners who want more convenience, speed, and insights. Premium users get: priority hotel confirmations, AI-assisted search and recommendations based on location and preferences, early access to new YakRooms features, and priority support with faster response times. Annual Premium members also receive dedicated onboarding assistance and access to advanced analytics dashboards to track bookings and performance over time."
    },
    {
      question: "Which payment methods are supported?",
      answer: "We support multiple payment options to make subscribing easy. International users can pay via Visa, Mastercard, and PayPal, while local Bhutanese users can pay through bank transfers or mobile wallets supported in Bhutan. All transactions are processed through secure, PCI-compliant providers, and no sensitive payment information is stored directly on YakRooms servers."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Subscriptions are flexible—there are no lock-in contracts or long-term commitments. You can cancel directly from your YakRooms account dashboard at any time. If you cancel a monthly plan, you’ll retain access until the end of your billing cycle. Annual subscribers who cancel early will continue to have access until the end of the paid year."
    },
    {
      question: "Is my booking and personal data secure?",
      answer: "Absolutely. Protecting your data is a top priority at YakRooms. All booking details, personal information, and payment transactions are encrypted both in transit and at rest using industry-standard protocols. Our infrastructure is regularly monitored for security compliance, and we follow best practices in data protection to keep your information safe at all times."
    }
  ];
  
  

  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 'Free',
      period: '6 months',
      description: 'Perfect for getting started with YakRooms',
      features: [
        'Full access to all platform features',
        'Unlimited room bookings',
        'Hotel management dashboard',
        'Guest booking system',
        'Basic analytics & reports',
        'Email notifications',
        'Mobile app access',
        'Standard customer support'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'default',
      popular: true,
      savings: null
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 'Nu 1,000',
      period: 'per month',
      description: 'For established hotel businesses',
      features: [
        'Everything in Free Plan',
        'Advanced analytics & insights',
        'Priority customer support',
        'Custom branding options',
        'API access & integrations',
        'Bulk booking management',
        'Revenue optimization tools',
        '24/7 phone support',
        'Dedicated account manager'
      ],
      buttonText: 'Upgrade to Premium',
      buttonVariant: 'outline',
      popular: false,
      savings: null
    }
  ];

  const handleSubscribe = (planId) => {
    // TODO: Implement subscription logic
    console.log(`Subscribing to plan: ${planId}`);
    // This would typically integrate with your payment processor
    // (Stripe, PayPal, etc.) and user management system
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            Start Your Hotel Business <span className="text-primary">Free</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get 6 months completely free to grow your hotel business. After that, 
            continue with our affordable Nu 1,000/month premium plan for advanced features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : 'hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Initial Trial
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
                <CardDescription className="text-gray-600 text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-yellow-500">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2 text-sm">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-white' 
                      : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group"
                >
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors duration-200">
                    {faq.question}
                  </h4>
                  <div className="flex-shrink-0 ml-4">
                    {openAccordion === index ? (
                      <ChevronUp className="h-5 w-5 text-primary transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-primary transition-all duration-200" />
                    )}
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openAccordion === index 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50/30">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
