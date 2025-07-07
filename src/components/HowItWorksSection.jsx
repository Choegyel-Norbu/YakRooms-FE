import React from "react";
import { motion } from "framer-motion";
import { Typography, Card } from "@material-tailwind/react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: "🔍",
      title: "Search",
      description:
        "Quickly search verified hotels and restaurants by location or name.",
      color: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      icon: "📊",
      title: "Compare",
      description:
        "Browse listings, check reviews, prices, and availability in real-time.",
      color: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      icon: "✅",
      title: "Book",
      description: "Confirm your stay or meal booking with just a few clicks.",
      color: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 px-4 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <Typography variant="h3" className="text-center mb-12 text-gray-900">
          How YakRooms Works
        </Typography>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-6 md:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex-1"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full p-6 shadow-md rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  {/* Step number */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${step.color} mb-4`}
                  >
                    <Typography variant="h4" className={step.iconColor}>
                      {step.icon}
                    </Typography>
                  </div>

                  {/* Step title */}
                  <Typography variant="h5" className="mb-3 text-gray-900">
                    {step.title}
                  </Typography>

                  {/* Step description */}
                  <Typography variant="small" className="text-gray-600">
                    {step.description}
                  </Typography>

                  {/* Connector (mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden mt-6 w-1 h-8 bg-gray-200 rounded-full"></div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Horizontal connector (desktop) */}
        <div className="hidden md:flex justify-center -mt-8 px-12">
          <div className="flex items-center w-full max-w-2xl">
            {steps.map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-8 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center mx-2">
                    <Typography variant="small" className="text-gray-500">
                      {index + 1}
                    </Typography>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
