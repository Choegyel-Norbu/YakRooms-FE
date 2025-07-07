import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Typography, Chip, Card } from "@material-tailwind/react";
import {
  BuildingStorefrontIcon,
  CakeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
// import { HandshakeIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon, CogIcon, CloudIcon } from "@heroicons/react/24/solid";

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
      icon: <CakeIcon className="h-8 w-8 text-amber-500" />,
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
      icon: "",
      //   icon: <HandshakeIcon className="h-8 w-8 text-indigo-500" />,
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
      color: "blue",
    },
    {
      icon: <CogIcon className="h-4 w-4" />,
      label: "Built on Spring Boot",
      color: "purple",
    },
    {
      icon: <CloudIcon className="h-4 w-4" />,
      label: "Powered by PostgreSQL & Firebase",
      color: "teal",
    },
  ];

  return (
    <section className="py-16 px-4 lg:px-8 bg-[#f6f9fc]">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" className="text-center mb-4 text-gray-900">
            Trusted by Thousands
          </Typography>
          <Typography
            variant="lead"
            className="text-center mb-12 text-gray-600 max-w-2xl mx-auto"
          >
            Built for Bhutan, Backed by Technology
          </Typography>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                      {stat.icon}
                    </div>
                    <Typography
                      variant="h3"
                      className="text-4xl font-bold text-gray-900 mb-1"
                    >
                      <CountUp
                        end={stat.value}
                        duration={2}
                        separator=","
                        suffix={stat.suffix}
                      />
                    </Typography>
                    <Typography variant="paragraph" className="text-gray-600">
                      {stat.label} {stat.emoji}
                    </Typography>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Growing Text */}
          <Typography
            variant="small"
            className="text-center text-gray-500 mb-8"
          >
            And growing every day – thanks to our amazing community.
          </Typography>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {trustBadges.map((badge, index) => (
              <Chip
                key={index}
                value={
                  <div className="flex items-center gap-2">
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                }
                color={badge.color}
                variant="outlined"
                className="rounded-full border-1 bg-white/80 backdrop-blur-sm"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicatorsSection;
