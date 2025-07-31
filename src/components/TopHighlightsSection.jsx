import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPinIcon, HeartIcon } from "lucide-react"; // Using lucide-react for icons
import { Link } from "react-router-dom";
// ShadCN UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/Api";
import YakRoomsLoader from "@/components/loader/YakRoomsLoader";

const TopHighlightsSection = () => {
  const [hotelsData, setHotelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/hotels/topThree");
        if (!response.status === 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setHotelsData(response.data);
      } catch (e) {
        console.error("Failed to fetch hotels:", e);
        setError("Failed to load hotels. Please try again later.");
        setHotelsData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <>
      <style>
        {`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .overflow-x-auto {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
      {/* Adjusted for consistent section padding and width across sizes */}
      <section className="py-5 lg:py-12 lg:mt-10 px-4 lg:px-8 lg:w-[70%] m-auto">
        <div className="container mx-auto">
          {/* Adjusted heading size for better hierarchy */}
          <h3 className="text-center text-3xl font-bold mb-8 text-gray-900">
            Top Listed Hotels
          </h3>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <YakRoomsLoader 
                size={80} 
                showTagline={false} 
                loadingText=""
                className="mb-4"
              />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && hotelsData.length === 0 && (
            <p className="text-center text-gray-600">
              No hotels found.
            </p>
          )}

          {/* Mobile Carousel - Now with fixed card width for consistency */}
          <div className="md:hidden overflow-x-auto pb-4">
            {/* Added horizontal padding for consistent breathing room on mobile */}
            <div className="flex space-x-4 w-max px-4">
              {hotelsData.map((item) => (
                <motion.div
                  key={item.id}
                  // Ensured consistent card width across all screen sizes
                  className="w-72 flex-shrink-0" // Keeping consistent with the desired large card size
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ListingCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Grid - Now with fixed card width for consistency and horizontal scroll on overflow */}
          {/* Added overflow-x-auto for md and lg screens to enable horizontal scrolling if content exceeds layout */}
          <div className="hidden md:block overflow-x-auto">
            {/* Adjusted grid for responsiveness, gap, and centering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-none justify-items-center md:w-max md:mx-auto"> {/* Added md:w-max and md:mx-auto to allow content to dictate width and center if wider than viewport */}
              {hotelsData.map((item) => (
                <motion.div
                  key={item.id}
                  // Ensured consistent card width across all screen sizes
                  className="w-72" // Keeping consistent with the desired large card size
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ListingCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ListingCard = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine image URL based on the item structure
  const imageUrl =
    item.photoUrls && item.photoUrls.length > 0
      ? item.photoUrls
      : "https://via.placeholder.com/400x300?text=No+Image";

  // Hotel-specific data
  const id = item.id;
  const title = item.name;
  const typeOrDescription = item.hotelType || item.description;
  const location = item.district || item.address;
  const priceDisplay = item.lowestPrice || item.price || null;

  // Determine price display message
  const getPriceDisplay = () => {
    if (priceDisplay && priceDisplay !== "-" && priceDisplay !== "null") {
      return (
        <>
          <span className="text-yellow-600">From - </span>
          <span className="font-bold">Nu. {priceDisplay}</span> /night
        </>
      );
    } else {
      return (
        <span className="text-gray-500 italic">Contact for pricing</span>
      );
    }
  };

  return (
    // Ensured consistent card height and shadow for visual appeal
    <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-xl border border-gray-100">
      <CardHeader className="p-0 flex-grow-0">
        {/* Adjusted image height to be consistent with larger card size */}
        <div className="relative h-44 w-full"> {/* Increased height from h-32 to h-44 for consistency */}
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover rounded-t-xl"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            // Adjusted positioning and padding of favorite button for consistency
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <HeartIcon
              className={`h-4 w-4 ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "fill-gray-400 text-gray-400"
              }`}
            />
          </Button>
          {item.tag && (
            // Adjusted positioning and padding of tag for consistency
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-yellow-500 text-slate-900 text-xs font-bold">
              {item.tag}
            </div>
          )}
        </div>
      </CardHeader>
      {/* Adjusted content padding for better visual spacing */}
      <CardContent className="p-3 flex-grow">
        {/* Adjusted title font size for consistency */}
        <CardTitle className="mb-0.5 text-base font-semibold text-gray-900 line-clamp-1">
          {title}
        </CardTitle>
        {/* Adjusted description font size for consistency */}
        <CardDescription className="text-sm text-gray-600 mb-1 line-clamp-1">
          {typeOrDescription}
        </CardDescription>
        {/* Adjusted map icon and location text sizes for consistency */}
        <div className="flex items-center text-gray-600 mb-1">
          <MapPinIcon className="h-3.5 w-3.5 mr-1" /> {/* Increased icon size */}
          <p className="text-sm line-clamp-1">{location}</p> {/* Increased text size */}
        </div>
      </CardContent>
      {/* Adjusted footer padding for consistent spacing */}
      <CardFooter className="p-3 border-t bg-gray-50">
        <div className="w-full flex justify-between items-center">
          {/* Adjusted price display font size for consistency */}
          <p className="text-sm text-gray-900"> {/* Changed from text-14 to text-sm */}
            {getPriceDisplay()}
          </p>
          {/* Adjusted button padding and text size for consistency */}
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-full px-4 py-2 text-sm cursor-pointer" // Increased px and py for larger button
          >
            <Link to={`/hotel/${id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TopHighlightsSection;