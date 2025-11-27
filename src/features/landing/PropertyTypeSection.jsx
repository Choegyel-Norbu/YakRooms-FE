import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils";

const PropertyTypeSection = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // CDN base URL - can be configured via VITE_CDN_BASE_URL environment variable
  // Falls back to using the current origin if not set
  const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || window.location.origin;

  // Property types arranged from lowest to highest standard/priority
  const propertyTypes = [
    {
      id: "ONE_STAR",
      label: "One Star",
      image: `${CDN_BASE_URL}/images/onestar.jpg`,
      description: "Basic accommodations"
    },
    {
      id: "TWO_STAR",
      label: "Two Star",
      image: `${CDN_BASE_URL}/images/twostar.jpg`,
      description: "Comfortable stays"
    },
    {
      id: "BUDGET",
      label: "Budget Hotels",
      image: `${CDN_BASE_URL}/images/budget1.jpg`,
      description: "Affordable accommodations"
    },
    {
      id: "THREE_STAR",
      label: "Three Star",
      image: `${CDN_BASE_URL}/images/threestar.avif`,
      description: "Quality mid-range stays"
    },
    {
      id: "HOMESTAY",
      label: "Homestays",
      image: `${CDN_BASE_URL}/images/homestay.jpg`,
      description: "Authentic local experiences"
    },
    {
      id: "FOUR_STAR",
      label: "Four Star",
      image: `${CDN_BASE_URL}/images/four.jpg`,
      description: "Upscale accommodations"
    },
    {
      id: "FIVE_STAR",
      label: "Five Star",
      image: `${CDN_BASE_URL}/images/fivestar.jpeg`,
      description: "Premium luxury stays"
    },
    {
      id: "BOUTIQUE",
      label: "Boutique Hotels",
      image: `${CDN_BASE_URL}/images/suite.jpg`,
      description: "Unique boutique experiences"
    },
    {
      id: "RESORT",
      label: "Resorts",
      image: `${CDN_BASE_URL}/images/resort.jpg`,
      description: "Luxury resort experiences"
    },
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  const handlePropertyTypeClick = (propertyType) => {
    navigate(`/hotels?hotelType=${propertyType.id}`);
  };

  // Check scroll position on mount and resize
  React.useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, []);

  return (
    <section className="pt-12 md:pb-12 px-4 bg-white dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
            Browse by property type
          </h1>
          
          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10",
                !canScrollLeft && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10",
                !canScrollRight && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Property Type Cards */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={handleScroll}
          >
            {propertyTypes.map((property) => {
              return (
                <div
                  key={property.id}
                  onClick={() => handlePropertyTypeClick(property)}
                  className="flex-shrink-0 w-64 md:w-72 cursor-pointer group"
                >
                  <div className="relative h-48 md:h-56 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                    {/* Image */}
                    <img
                      src={property.image}
                      alt={property.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails
                        e.target.src = `${CDN_BASE_URL}/images/suite.jpg`;
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg md:text-xl">
                        {property.label}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {property.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover Indicator Bar */}
                  <div className="mt-2 h-1 w-0 mx-auto bg-primary transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Hint */}
        <div className="md:hidden text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Swipe to see more property types
          </p>
        </div>
      </div>
    </section>
  );
};

export default PropertyTypeSection;

