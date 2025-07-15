import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

// ShadCN UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Using Heroicons as an alternative to lucide-react
import {
  BuildingStorefrontIcon,
  CakeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"; // Outline icons for stats
import {
  LockClosedIcon,
  Cog6ToothIcon, // Adjusted to Cog6ToothIcon as CogIcon is usually in outline
  CloudIcon,
  HandRaisedIcon, // Using HandRaisedIcon as a general handshake alternative from heroicons
} from "@heroicons/react/24/solid"; // Solid icons for trust badges and handshake

const TrustIndicatorsSection = () => {
  const stats = [
    {
      id: 1,
      icon: <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />,
      value: 500,
      suffix: "+",
      label: "Hotels & Homestays Listed",
      emoji: "🏨",
    },
    {
      id: 2,
      icon: <CakeIcon className="h-8 w-8 text-amber-500" />, // Keeping CakeIcon as per original and adapting to 'meals discovered'
      value: 10000,
      suffix: "+",
      label: "Meals Discovered",
      emoji: "🍲",
    },
    {
      id: 3,
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />,
      value: 2500,
      suffix: "+",
      label: "Verified Reviews",
      emoji: "💬",
    },
    {
      id: 4,
      icon: <HandRaisedIcon className="h-8 w-8 text-indigo-500" />, // Using HandRaisedIcon as a suitable alternative for handshake
      value: 150,
      suffix: "+",
      label: "Local Partners Empowered",
      emoji: "🤝",
    },
  ];

  const trustBadges = [
    {
      icon: <LockClosedIcon className="h-4 w-4" />,
      label: "Secure with Firebase Auth",
      variant: "outline",
      className: "border-blue-400 text-blue-600",
    },
    {
      icon: <Cog6ToothIcon className="h-4 w-4" />, // Using Cog6ToothIcon (solid)
      label: "Built on Spring Boot",
      variant: "outline",
      className: "border-purple-400 text-purple-600",
    },
    {
      icon: <CloudIcon className="h-4 w-4" />,
      label: "Powered by PostgreSQL & Firebase",
      variant: "outline",
      className: "border-teal-400 text-teal-600",
    },
  ];

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-center text-3xl font-bold mb-4 text-gray-900">
            Trusted by Thousands
          </h3>
          <p className="text-center text-lg mb-12 text-gray-600 max-w-2xl mx-auto">
            Built for Bhutan, Backed by Technology
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="flex flex-col items-center text-center p-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                      {stat.icon}
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-1">
                      <CountUp
                        end={stat.value}
                        duration={2}
                        separator=","
                        suffix={stat.suffix}
                      />
                    </h3>
                    <p className="text-gray-600">
                      {stat.label} {stat.emoji}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Growing Text */}
          <p className="text-center text-sm text-gray-500 mb-8">
            And growing every day – thanks to our amazing community.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {trustBadges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant}
                className={`rounded-full border bg-white/80 backdrop-blur-sm px-4 py-2 ${badge.className}`}
              >
                <div className="flex items-center gap-2">
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicatorsSection;
