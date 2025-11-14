import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { calculateDaysUntil, formatDate, getTimeUntilExpiration } from '@/shared/utils/subscriptionUtils';

/**
 * Subscription Expiration Notification Component
 * Displays a warning when subscription is expiring soon
 */
const SubscriptionExpirationNotification = ({ 
  nextBillingDate, 
  subscriptionPlan,
  subscriptionIsActive,
  className = "" 
}) => {
  // Don't render if no billing date
  if (!nextBillingDate) return null;

  const daysUntilExpiration = calculateDaysUntil(nextBillingDate);
  const timeUntilExpiration = getTimeUntilExpiration(nextBillingDate);
  const formattedDate = formatDate(nextBillingDate);

  // Don't show notification if more than 7 days away, if already expired (daysUntilExpiration < 0), 
  // or on the expiration date itself (daysUntilExpiration === 0) - subscription is expired on that date
  // Note: We check the actual date, not just subscriptionIsActive, because a subscription is valid until the expiration date
  if (daysUntilExpiration > 7 || daysUntilExpiration <= 0) return null;

  // Determine notification type and styling
  const isTrial = subscriptionPlan === 'TRIAL';
  const isPro = subscriptionPlan === 'PRO' || subscriptionPlan === 'PREMIUM' || subscriptionPlan === 'BASIC';
  const isExpiringSoon = daysUntilExpiration === 1; // Expires tomorrow

  const getNotificationConfig = () => {
    // Upcoming renewal/expiration - show notifications until expiration date (when daysUntilExpiration > 0)
    if (isTrial) {
      return {
        bgColor: isExpiringSoon 
          ? "bg-orange-50 dark:bg-orange-950/20"
          : "bg-blue-50 dark:bg-blue-950/20",
        borderColor: isExpiringSoon
          ? "border-orange-200 dark:border-orange-800"
          : "border-blue-200 dark:border-blue-800",
        iconBg: isExpiringSoon
          ? "bg-orange-100 dark:bg-orange-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
        iconColor: isExpiringSoon
          ? "text-orange-600 dark:text-orange-400"
          : "text-blue-600 dark:text-blue-400",
        titleColor: isExpiringSoon
          ? "text-orange-800 dark:text-orange-200"
          : "text-blue-800 dark:text-blue-200",
        textColor: isExpiringSoon
          ? "text-orange-700 dark:text-orange-300"
          : "text-blue-700 dark:text-blue-300",
        buttonColor: isExpiringSoon
          ? "bg-orange-600 hover:bg-orange-700"
          : "bg-blue-600 hover:bg-blue-700",
        icon: Clock,
        title: isExpiringSoon ? "Trial Expires Tomorrow" : "Trial Expiring Soon",
        message: isExpiringSoon
          ? `Your trial period expires tomorrow (${formattedDate}). Subscribe now to continue enjoying all features and avoid service interruption.`
          : `Your trial period will expire on ${formattedDate} (${timeUntilExpiration}).`,
        showButton: isExpiringSoon
      };
    } else if (isPro) {
      return {
        bgColor: isExpiringSoon
          ? "bg-orange-50 dark:bg-orange-950/20"
          : "bg-blue-50 dark:bg-blue-950/20",
        borderColor: isExpiringSoon
          ? "border-orange-200 dark:border-orange-800"
          : "border-blue-200 dark:border-blue-800",
        iconBg: isExpiringSoon
          ? "bg-orange-100 dark:bg-orange-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
        iconColor: isExpiringSoon
          ? "text-orange-600 dark:text-orange-400"
          : "text-blue-600 dark:text-blue-400",
        titleColor: isExpiringSoon
          ? "text-orange-800 dark:text-orange-200"
          : "text-blue-800 dark:text-blue-200",
        textColor: isExpiringSoon
          ? "text-orange-700 dark:text-orange-300"
          : "text-blue-700 dark:text-blue-300",
        buttonColor: isExpiringSoon
          ? "bg-orange-600 hover:bg-orange-700"
          : "bg-blue-600 hover:bg-blue-700",
        icon: Clock,
        title: isExpiringSoon 
          ? `Upcoming ${subscriptionPlan === 'PRO' ? '' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} Subscription Renewal`
          : "Upcoming Subscription Renewal",
        message: isExpiringSoon
          ? `Your ${subscriptionPlan === 'PRO' ? '' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} subscription will expire tomorrow (${formattedDate}). Please renew your subscription to continue using all features without interruption.`
          : `Your ${subscriptionPlan === 'PRO' ? '' : subscriptionPlan === 'BASIC' ? 'Basic' : 'Pro'} subscription will renew on ${formattedDate} (${timeUntilExpiration}). Ensure your payment method is up to date.`,
        showButton: isExpiringSoon
      };
    } else {
      // Fallback for unknown plan types
      return {
        bgColor: isExpiringSoon
          ? "bg-orange-50 dark:bg-orange-950/20"
          : "bg-blue-50 dark:bg-blue-950/20",
        borderColor: isExpiringSoon
          ? "border-orange-200 dark:border-orange-800"
          : "border-blue-200 dark:border-blue-800",
        iconBg: isExpiringSoon
          ? "bg-orange-100 dark:bg-orange-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
        iconColor: isExpiringSoon
          ? "text-orange-600 dark:text-orange-400"
          : "text-blue-600 dark:text-blue-400",
        titleColor: isExpiringSoon
          ? "text-orange-800 dark:text-orange-200"
          : "text-blue-800 dark:text-blue-200",
        textColor: isExpiringSoon
          ? "text-orange-700 dark:text-orange-300"
          : "text-blue-700 dark:text-blue-300",
        buttonColor: isExpiringSoon
          ? "bg-orange-600 hover:bg-orange-700"
          : "bg-blue-600 hover:bg-blue-700",
        icon: Clock,
        title: isExpiringSoon ? "Subscription Expires Tomorrow" : "Upcoming Subscription Renewal",
        message: isExpiringSoon
          ? `Your subscription will renew tomorrow (${formattedDate}). Please ensure your payment method is up to date.`
          : `Your subscription will renew on ${formattedDate} (${timeUntilExpiration}).`,
        showButton: isExpiringSoon
      };
    }
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-base font-semibold ${config.titleColor}`}>
                {config.title}
              </h4>
            </div>
            <p className={`text-sm ${config.textColor} leading-relaxed ${config.showButton ? 'mb-3' : 'mb-0'}`}>
              {config.message}
            </p>
            {config.showButton && (
              <Link to="/subscription">
                <Button 
                  variant="default" 
                  size="sm"
                  className={`${config.buttonColor} text-white`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isTrial 
                    ? (isExpiringSoon ? 'Subscribe Now' : 'Subscribe to Continue')
                    : (isExpiringSoon ? 'Renew Now' : 'Manage Subscription')
                  }
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpirationNotification;
