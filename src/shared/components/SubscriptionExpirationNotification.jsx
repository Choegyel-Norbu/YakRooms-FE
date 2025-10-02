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
  className = "" 
}) => {
  // Don't render if no billing date
  if (!nextBillingDate) return null;

  const daysUntilExpiration = calculateDaysUntil(nextBillingDate);
  const timeUntilExpiration = getTimeUntilExpiration(nextBillingDate);
  const formattedDate = formatDate(nextBillingDate);

  // Don't show notification if more than 7 days away or if already expired
  if (daysUntilExpiration > 7 || daysUntilExpiration < 0) return null;

  // Determine notification type and styling
  const isExpiringSoon = daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  const isExpiringToday = daysUntilExpiration === 0;

  const getNotificationConfig = () => {
    if (isExpiringToday) {
      return {
        bgColor: "bg-orange-50 dark:bg-orange-950/20",
        borderColor: "border-orange-200 dark:border-orange-800",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
        titleColor: "text-orange-800 dark:text-orange-200",
        textColor: "text-orange-700 dark:text-orange-300",
        buttonColor: "bg-orange-600 hover:bg-orange-700",
        icon: Clock,
        title: "Subscription Expires Today",
        message: `Your ${subscriptionPlan} subscription expires today (${formattedDate}). Please renew to avoid service interruption.`,
        showButton: true
      };
    } else {
      return {
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-blue-800 dark:text-blue-200",
        textColor: "text-blue-700 dark:text-blue-300",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
        icon: Clock,
        title: "Upcoming Subscription Renewal",
        message: `Your ${subscriptionPlan} subscription will expire on ${formattedDate} (${timeUntilExpiration}).`,
        showButton: false
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
              <Badge 
                variant="secondary" 
                className={`${config.iconColor} ${config.bgColor} border-0`}
              >
                {timeUntilExpiration}
              </Badge>
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
                  Subscribe
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
