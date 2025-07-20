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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/Api";

const TopHighlightsSection = () => {
  const [activeTab, setActiveTab] = useState("hotels");
  const [hotelsData, setHotelsData] = useState([]);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [editorPicksData, setEditorPicksData] = useState([]);
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

    const fetchRestaurants = async () => {
      // For now, using mock data for restaurants
      setRestaurantsData(
        [
          {
            id: 1,
            name: "Bhutanese Kitchen",
            type: "Local Cuisine",
            tag: "Trending",
            district: "Thimphu",
            price: "$15/person",
            photoUrls: [
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
            ],
          },
          {
            id: 2,
            name: "Cloud9 Café",
            type: "Café",
            tag: "Scenic Views",
            district: "Paro",
            price: "$10/person",
            photoUrls: [
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
            ],
          },
          {
            id: 3,
            name: "Gelephu Delights",
            type: "Fast Food",
            tag: "Popular",
            district: "Gelephu",
            price: "$8/person",
            photoUrls: [
              "https://images.unsplash.com/photo-1571065518464-9ed31e5088f1?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ],
          },
        ].slice(0, 3)
      ); // Limit to max 3 cards
    };

    const fetchEditorPicks = async () => {
      // For now, using mock data for editor's picks
      setEditorPicksData(
        [
          {
            id: 1,
            name: "Gangtey Lodge",
            hotelType: "Eco Lodge",
            tag: "Hidden Gem",
            district: "Gangtey",
            price: "$180/night",
            photoUrls: [
              "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
            ],
          },
          {
            id: 2,
            name: "Dochula Resort",
            hotelType: "Mountain View",
            tag: "Sunrise Spot",
            district: "Dochula Pass",
            price: "$160/night",
            photoUrls: [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
            ],
          },
          {
            id: 3,
            name: "Phobjikha Homestay",
            hotelType: "Farm Stay",
            tag: "Authentic Experience",
            district: "Phobjikha",
            price: "$90/night",
            photoUrls: [
              "https://images.unsplash.com/photo-1579298245100-3f4a3d21c3c9?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            ],
          },
        ].slice(0, 3)
      ); // Limit to max 3 cards
    };

    if (activeTab === "hotels") {
      fetchHotels();
    } else if (activeTab === "restaurants") {
      fetchRestaurants();
    } else if (activeTab === "editorPicks") {
      fetchEditorPicks();
    }
  }, [activeTab]);

  const getListingsForActiveTab = () => {
    switch (activeTab) {
      case "hotels":
        return hotelsData;
      case "restaurants":
        return restaurantsData;
      case "editorPicks":
        return editorPicksData;
      default:
        return [];
    }
  };

  const currentListings = getListingsForActiveTab();

  return (
    <section className="py-5 lg:py-12 lg:mt-10 px-4 lg:px-8 lg:w-[70%] m-auto">
      <div className="container mx-auto">
        <h3 className="text-center text-3xl font-bold mb-8 text-gray-900">
          Top Bhutanese Highlights
        </h3>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs defaultValue="hotels" onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger
                value="hotels"
                className="px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-900 hover:bg-yellow-600 data-[state=active]:hover:bg-yellow-600 data-[state=active]:shadow-sm"
              >
                Popular Stays
              </TabsTrigger>
              <TabsTrigger
                value="restaurants"
                className="px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-900 hover:bg-yellow-600 data-[state=active]:hover:bg-yellow-600 data-[state=active]:shadow-sm"
              >
                Trending Eats
              </TabsTrigger>
              <TabsTrigger
                value="editorPicks"
                className="px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-900 hover:bg-yellow-600 data-[state=active]:hover:bg-yellow-600 data-[state=active]:shadow-sm"
              >
                Editor's Picks
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && currentListings.length === 0 && (
          <p className="text-center text-gray-600">
            No listings found for this category.
          </p>
        )}

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto pb-4">
          <div className="flex space-x-4 w-max">
            {currentListings.map((item) => (
              <motion.div
                key={item.id}
                className="w-48 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ListingCard item={item} activeTab={activeTab} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentListings.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ListingCard item={item} activeTab={activeTab} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ListingCard = ({ item, activeTab }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine image URL based on the item structure
  const imageUrl =
    item.photoUrls && item.photoUrls.length > 0
      ? item.photoUrls
      : "https://via.placeholder.com/400x300?text=No+Image";

  // Determine title and type/description based on activeTab
  let id = item.id;
  let title = item.name;
  let typeOrDescription = "";
  let location = item.district || item.address;
  let priceDisplay = item.lowestPrice || item.price || null;

  if (activeTab === "hotels") {
    typeOrDescription = item.hotelType || item.description;
  } else if (activeTab === "restaurants") {
    typeOrDescription = item.type || item.description;
  } else if (activeTab === "editorPicks") {
    typeOrDescription = item.hotelType || item.type || item.description;
  }

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
    <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-xl border border-gray-100">
      <CardHeader className="p-0 flex-grow-0">
        <div className="relative h-32 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover rounded-t-xl"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-1 right-1 p-1 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
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
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-yellow-500 text-slate-900 text-xs font-bold">
              {item.tag}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <CardTitle className="mb-0.5 text-base font-semibold text-gray-900 line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-600 mb-1 line-clamp-1">
          {typeOrDescription}
        </CardDescription>
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-3 w-3 mr-1" />
          <p className="text-xs line-clamp-1">{location}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-gray-50">
        <div className="w-full flex justify-between items-center">
          <p className="text-14 text-gray-900">
            {getPriceDisplay()}
          </p>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-full px-3 py-1.5 text-xs cursor-pointer"
          >
            <Link to={`/hotel/${id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TopHighlightsSection;
