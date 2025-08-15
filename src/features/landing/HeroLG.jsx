import React, { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils";
import YakRoomHero from "@/assets/images/YakRoomHero.png";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Calendar } from "@/shared/components/calendar";
import { Separator } from "@/shared/components/separator";
import { Badge } from "@/shared/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/popover";
import {
  CalendarIcon,
  Search,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";

const HeroLG = () => {
  const [date, setDate] = useState(new Date());
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();

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
        className="relative flex min-h-screen w-full items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${YakRoomHero})`,
        }}
      >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center space-y-8 text-center">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1 bg-white/90 text-slate-900 border-white/20">
              <MapPin className="mr-1 h-3 w-3" />
              Gateway to Bhutan
            </Badge>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">
            Discover Authentic Stays in
            <span className="block text-yellow-400">Bhutan with YakRooms</span>
          </h1>

          <p className="mx-auto max-w-2xl text-14 text-white/90 sm:text-xl">
            Your convenient way to book locally. Discover hotels and restaurants
            in Bhutan with just a few taps.
          </p>
        </div>

        <Separator className="w-24 bg-white/30" />

        {/* Features Section */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 hidden sm:grid">
          <div className="flex items-center justify-center space-x-2 text-sm text-white/80">
            <Clock className="h-4 w-4" />
            <span>Real-time availability</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-white/80">
            <Shield className="h-4 w-4" />
            <span>Verified accommodations</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-white/80">
            <MapPin className="h-4 w-4" />
            <span>Local recommendations</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search district (e.g., Mongar, Samdrup Jongkhar, Trashigang)"
                className={cn(
                  "h-10 sm:h-12 pl-10 text-sm sm:text-base text-white",
                  searchError && "border-red-500 focus:border-red-500"
                )}
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

            <Button
              size="lg"
              className="h-10 sm:h-12 text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-slate-900 cursor-pointer"
              onClick={validateAndSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Hotels
            </Button>
          </div>
        </div>

        <Separator className="w-full max-w-2xl bg-white/30" />

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-sm text-white/90">
            Ready to explore Bhutan's cultural heart?
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