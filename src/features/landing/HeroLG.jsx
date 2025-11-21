import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils";
import EzeeroomHero from "@/assets/images/erHero-optimized.jpg";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Separator } from "@/shared/components/separator";
import { Badge } from "@/shared/components/badge";
import { SearchButton } from "@/shared/components";
import {
  MapPin,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";

const HeroLG = () => {
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();

  // Simple fade-in animation for header and description
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const validateAndSearch = () => {
    setSearchError("");

    if (!searchDistrict || searchDistrict.trim() === "") {
      setSearchError("Please enter a district to search");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(searchDistrict.trim())) {
      setSearchError("District must contain only letters");
      return;
    }

    const searchParams = new URLSearchParams({
      district: searchDistrict.trim(),
    });

    navigate(`/hotels?${searchParams.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      validateAndSearch();
    }
  };

  const handleStartExploring = () => {
    // Navigate to hotel listing page without filters
    navigate("/hotels");
  };

  return (
    <section 
      className="relative flex min-h-screen w-full items-center justify-center px-4 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${EzeeroomHero})`,
      }}
    >
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center space-y-8 text-center">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Badge 
              variant="secondary" 
              className="px-3 py-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#0f172a',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <MapPin className="mr-1 h-3 w-3" />
              EzeeRoom
            </Badge>
          </div>

          <motion.h1 
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{
              color: '#ffffff',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.25)',
            }}
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            Discover Authentic Stays in
            <span 
              className="block"
              style={{
                color: '#facc15',
              }}
            >
              Bhutan with EzeeRoom
            </span>
          </motion.h1>

          <motion.p 
            className="mx-auto max-w-2xl text-14 sm:text-xl"
            style={{
              color: '#ffffff',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 0, 0, 0.25)',
            }}
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            Find your perfect stay anywhere in the country. 
            Discover authentic accommodations in unfamiliar destinations with confidence and ease.
          </motion.p>
        </div>

        <Separator 
          className="w-24"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Features Section */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 hidden sm:grid">
          <div 
            className="flex items-center justify-center space-x-2 text-sm"
            style={{
              color: '#ffffff',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Clock className="h-4 w-4" />
            <span>Real-time availability</span>
          </div>
          <div 
            className="flex items-center justify-center space-x-2 text-sm"
            style={{
              color: '#ffffff',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Shield className="h-4 w-4" />
            <span>Verified accommodations</span>
          </div>
          <div 
            className="flex items-center justify-center space-x-2 text-sm"
            style={{
              color: '#ffffff',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            <MapPin className="h-4 w-4" />
            <span>Local recommendations</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <MapPin 
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 z-10"
                style={{
                  color: '#1a1a1a',
                }}
              />
              <Input
                type="text"
                placeholder="Search district (e.g., Mongar, Samdrup Jongkhar, Trashigang)"
                className={cn(
                  "h-10 sm:h-12 pl-10 text-sm sm:text-base",
                  searchError && "border-red-500 focus:border-red-500"
                )}
                style={{
                  color: '#1a1a1a',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                }}
                value={searchDistrict}
                onChange={(e) => {
                  setSearchDistrict(e.target.value);
                  if (searchError) setSearchError(""); // Clear error when user starts typing
                }}
                onKeyPress={handleKeyPress}
              />
              {searchError && (
                <p className="mt-2 text-sm text-red-500 text-left">{searchError}</p>
              )}
            </div>

            <SearchButton
              size="lg"
              className="h-10 sm:h-12 text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
              onClick={validateAndSearch}
            >
              Search Hotels
            </SearchButton>
          </div>
        </div>

        <Separator 
          className="w-full max-w-2xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Call to Action */}
        <div className="space-y-4">
          <p 
            className="text-sm"
            style={{
              color: '#ffffff',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.4)',
            }}
          >
            Need a comfortable stay anywhere in Bhutan?
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="group border-white/30 text-black hover:bg-white/10 hover:text-white hover:border-white/50 cursor-pointer"
            onClick={handleStartExploring}
          >
            Start Exploring
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroLG;