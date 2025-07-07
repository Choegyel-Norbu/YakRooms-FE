import React from "react";
import { motion } from "framer-motion";
import { Typography, Button } from "@material-tailwind/react";

const CTASection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-16 px-4 lg:px-8 bg-gradient-to-br from-orange-50 to-amber-50"
    >
      <div className="container mx-auto text-center">
        {/* Bhutan-inspired decorative element */}
        <div className="flex justify-center mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-amber-500"
          >
            <path
              d="M12 3L5 10L12 17L19 10L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 10H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 17V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Headline */}
        <Typography
          variant="h2"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Ready to explore Bhutan?
        </Typography>
        <Typography
          variant="lead"
          className="text-xl md:text-2xl text-gray-700 mb-2"
        >
          Start your journey now.
        </Typography>

        {/* Subtext */}
        <Typography
          variant="paragraph"
          className="text-gray-600 max-w-2xl mx-auto mb-8"
        >
          Discover hidden gems, local cuisines, and cozy stays with just a
          click.
        </Typography>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              color="orange"
              className="rounded-full px-8 py-3 shadow-md hover:shadow-lg"
            >
              Explore Hotels
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outlined"
              color="orange"
              className="rounded-full px-8 py-3 border-2 hover:bg-orange-50/50"
            >
              View Restaurants
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CTASection;
