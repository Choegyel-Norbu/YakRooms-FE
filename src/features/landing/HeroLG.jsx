import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils";
const EzeeroomHero = "/images/erHero.webp";
const EzeeroomHeroMobile = "/images/heroIMG.webp";
import { toast } from "sonner";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Separator } from "@/shared/components/separator";
import { Badge } from "@/shared/components/badge";

import { MapPin, Clock, Shield, Search } from "lucide-react";

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

  const handleSearchNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Please use a device that supports location services.",
        duration: 6000,
      });
      return;
    }

    const loadingToast = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        toast.dismiss(loadingToast);

        const searchParams = new URLSearchParams({
          lat: coords.latitude.toString(),
          lon: coords.longitude.toString(),
          radius: "0.5",
        });

        navigate(`/hotels?${searchParams.toString()}`);
      },
      (error) => {
        toast.dismiss(loadingToast);

        let description = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            description = "Enable location permissions to search nearby stays.";
            break;
          case error.POSITION_UNAVAILABLE:
            description = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            description = "Location request timed out. Please try again.";
            break;
          default:
            description =
              "We couldn't get a very precise location. Nearby stays might not be exact.";
        }

        toast.error("Location accuracy is a bit low", {
          description,
          duration: 6000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <style>
        {`
          .hero-section-responsive {
            background-image: url(${EzeeroomHeroMobile});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          
          @media (min-width: 768px) {
            .hero-section-responsive {
              background-image: url(${EzeeroomHero});
            }
          }
        `}
      </style>
      <section 
        className="hero-section-responsive relative flex min-h-screen w-full items-center justify-center px-4 overflow-hidden"
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

        {/* Search Section (NEW) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <div className="relative rounded-3xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-2xl ring-1 ring-black/5">
            <div className="flex flex-row gap-2">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-300 group-focus-within:text-white transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Where do you want to go? (e.g., Thimphu, Paro)"
                  className={cn(
                    "h-12 pl-11 pr-4 w-full rounded-2xl text-base",
                    "bg-white/10 text-white placeholder:text-gray-300",
                    "border-transparent focus:border-white/30 focus:bg-white/20",
                    "focus:ring-0 transition-all duration-300",
                    searchError && "border-red-400 focus:border-red-400"
                  )}
                  value={searchDistrict}
                  onChange={(e) => {
                    setSearchDistrict(e.target.value);
                    if (searchError) setSearchError("");
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <Button
                className={cn(
                  "h-12 w-12 sm:w-auto px-0 sm:px-8 rounded-3xl font-bold text-base tracking-wide flex items-center justify-center",
                  "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600",
                  "text-white shadow-lg hover:shadow-yellow-500/25",
                  "transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={validateAndSearch}
              >
                <Search className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {searchError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex items-center justify-center gap-2 text-red-300 bg-red-900/30 py-2 px-4 rounded-lg backdrop-blur-sm border border-red-500/30 mx-auto w-fit"
            >
              <span className="text-lg">⚠</span>
              <span className="text-sm font-medium">{searchError}</span>
            </motion.div>
          )}

          {/* Popular Destinations */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-white/70 mr-2">Popular:</span>
            {['Mongar', 'Trashigang', 'Thimphu', 'Punakha'].map((district) => (
              <button
                key={district}
                onClick={() => {
                  setSearchDistrict(district);
                  setSearchError("");
                }}
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 backdrop-blur-sm"
              >
                {district}
              </button>
            ))}
          </div>
        </motion.div>

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
              color: "#ffffff",
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.4)",
            }}
          >
            Need a comfortable stay anywhere in Bhutan?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleStartExploring}
              className="px-7 py-5 text-sm font-semibold rounded-full bg-white/95 text-slate-900 border border-white/80 shadow-md shadow-black/25 transition-all duration-200 hover:bg-transparent hover:text-white hover:border-white hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Exploring
            </Button>
            <Button
              type="button"
              onClick={handleSearchNearby}
              className="px-7 py-5 text-sm font-semibold rounded-full bg-white/95 text-slate-900 border border-white/80 shadow-md shadow-black/25 transition-all duration-200 hover:bg-transparent hover:text-white hover:border-white hover:shadow-lg hover:-translate-y-0.5"
            >
              Find nearby
            </Button>
          </div>
        </div>
        </div>
      </section>
    </>
  );
};

export default HeroLG;
