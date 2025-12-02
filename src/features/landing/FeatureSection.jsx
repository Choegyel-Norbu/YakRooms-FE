import React from "react";
import { motion } from "framer-motion";
import { Hotel, ArrowRight, CheckCircle, Sparkles, MapPin, Star, Users, Shield, UserPlus, Search, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

// ShadCN UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import { cn } from "@/shared/utils";

const FeatureSection = () => {
  const features = [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const trustIndicatorVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="px-4">
      <div className="max-w-6xl mx-auto">
        {/* Unified Hotel Booking Adventure Section */}
        <motion.div
          className="text-center pt-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="p-8 md:p-12 border border-border/50 rounded-2xl relative overflow-hidden"
              variants={scaleIn}
            >
              {/* Background Decorative Elements with animations */}
              <motion.div
                className="absolute top-4 left-4 w-20 h-20 bg-primary/1 rounded-full blur-xl"
                variants={pulseAnimation}
                animate="animate"
              ></motion.div>
              <motion.div
                className="absolute bottom-4 right-4 w-32 h-32 bg-yellow-500/5 rounded-full blur-xl"
                variants={pulseAnimation}
                animate="animate"
                transition={{ delay: 1 }}
              ></motion.div>
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/3 rounded-full blur-2xl"
                variants={pulseAnimation}
                animate="animate"
                transition={{ delay: 2 }}
              ></motion.div>
              
              <div className="relative z-10 space-y-8">
                {/* Adventure Header */}
                <motion.div className="space-y-4" variants={itemVariants}>
                  {/* <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-6 h-6 text-primary animate-bounce" />
                    <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                      🏔️ Ready for Your Bhutanese Adventure?
                    </Badge>
                  </div> */}
                  
                  <motion.h2
                    className="text-2xl font-bold text-foreground leading-tight"
                    variants={fadeInUp}
                  >
                    Start Your Journey with
                    <motion.span
                      className="block text-primary"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      Real-time Hotel Booking
                    </motion.span>
                  </motion.h2>
                  
                  <motion.p
                    className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                  >
                    Discover the perfect accommodation wherever your journey takes you. 
                    EzeeRoom connects you with authentic stays and comfortable rooms in unfamiliar destinations, 
                    making every adventure feel like home.
                  </motion.p>
                </motion.div>

                {/* Interactive Booking Preview */}
                <motion.div
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-border/30 max-w-6xl mx-auto"
                  variants={fadeInUp}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6"
                    variants={containerVariants}
                  >
                    {/* Step 1 */}
                    <motion.div variants={scaleIn}>
                      <Link to="/hotels" className="text-center space-y-2 group cursor-pointer">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Search className="w-6 h-6 text-white" />
                        </motion.div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Browse Hotels</h3>
                        <p className="text-xs text-muted-foreground max-w-24 group-hover:text-foreground transition-colors">Discover verified accommodations</p>
                      </Link>
                    </motion.div>
                    
                    {/* Arrow 1 */}
                    <motion.div
                      className="hidden md:flex"
                      variants={itemVariants}
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </motion.div>
                    
                    {/* Step 2 */}
                    <motion.div
                      className="text-center space-y-2 group"
                      variants={scaleIn}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ scale: 1.15, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CreditCard className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="text-sm font-semibold text-foreground">Book Instantly</h3>
                      <p className="text-xs text-muted-foreground max-w-24">Real-time availability</p>
                    </motion.div>
                    
                    {/* Arrow 2 */}
                    {/* <div className="hidden md:flex">
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                    </div> */}
                    
                    {/* Step 3 - Explore Hotels Now */}
                    {/* <div className="text-center space-y-2 group">
                      <Link to="/hotels">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl">
                          <Hotel className="w-6 h-6 text-white group-hover:animate-bounce" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Explore Hotels</h3>
                        <p className="text-xs text-muted-foreground max-w-24">Start your adventure</p>
                      </Link>
                    </div> */}
                  </motion.div>
                </motion.div>

                {/* Become a Host Button */}
                {/* <div className="flex justify-center">
                  <Link to="/addListing">
                    <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold group border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                      <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Become a Host</span>
                    </Button>
                  </Link>
                </div> */}

                {/* Trust Indicators with Animation */}
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/50"
                  variants={containerVariants}
                >
                  <motion.div
                    className="flex items-center space-x-2 group"
                    variants={trustIndicatorVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-muted-foreground">Secure Booking</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-2 group"
                    variants={trustIndicatorVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-muted-foreground">Verified Properties</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-2 group"
                    variants={trustIndicatorVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      whileHover={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Users className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-muted-foreground">24/7 Support</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-2 group"
                    variants={trustIndicatorVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      whileHover={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.5, repeat: 1 }}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-muted-foreground">Secure Payment</span>
                  </motion.div>
                </motion.div>

                {/* Fun Stats */}
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
                  variants={containerVariants}
                >
                  <motion.div
                    className="text-center"
                    variants={statVariants}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      1K+
                    </motion.div>
                    <div className="text-sm text-muted-foreground">Happy Travelers</div>
                  </motion.div>
                  <motion.div
                    className="text-center"
                    variants={statVariants}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      98%
                    </motion.div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </motion.div>
                  <motion.div
                    className="text-center"
                    variants={statVariants}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      24/7
                    </motion.div>
                    <div className="text-sm text-muted-foreground">Support Available</div>
                  </motion.div>
                  <motion.div
                    className="text-center"
                    variants={statVariants}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      10
                    </motion.div>
                    <div className="text-sm text-muted-foreground">Dzongkhags Covered</div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
