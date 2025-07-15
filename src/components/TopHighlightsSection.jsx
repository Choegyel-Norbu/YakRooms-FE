import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { StarIcon, MapPinIcon, HeartIcon } from "@heroicons/react/24/solid";

const TopHighlightsSection = () => {
  const [activeTab, setActiveTab] = useState("hotels");

  const listings = {
    hotels: [
      {
        id: 1,
        title: "Taj Tashi Thimphu",
        type: "Luxury Hotel",
        tag: "Editor's Pick",
        rating: 4.8,
        location: "Thimphu",
        price: "$220/night",
        image:
          "https://utfs.io/f/2a9c7b02-9519-4d3a-aa27-d6f05fc84d0a-1tf88.png",
      },
      {
        id: 2,
        title: "Zhiwa Ling Heritage",
        type: "Boutique Hotel",
        tag: "Most Booked",
        rating: 4.9,
        location: "Paro",
        price: "$190/night",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 3,
        title: "Amankora Punakha",
        type: "Resort",
        tag: "Luxury Stay",
        rating: 4.7,
        location: "Punakha",
        price: "$350/night",
        image:
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
    ],
    restaurants: [
      {
        id: 1,
        title: "Bhutanese Kitchen",
        type: "Local Cuisine",
        tag: "Trending",
        rating: 4.5,
        location: "Thimphu",
        price: "$15/person",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 2,
        title: "Cloud9 Café",
        type: "Café",
        tag: "Scenic Views",
        rating: 4.6,
        location: "Paro",
        price: "$10/person",
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
    ],
    editorPicks: [
      {
        id: 1,
        title: "Gangtey Lodge",
        type: "Eco Lodge",
        tag: "Hidden Gem",
        rating: 4.9,
        location: "Gangtey",
        price: "$180/night",
        image:
          "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 2,
        title: "Dochula Resort",
        type: "Mountain View",
        tag: "Sunrise Spot",
        rating: 4.7,
        location: "Dochula Pass",
        price: "$160/night",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      },
    ],
  };

  return (
    <section className="py-12 px-4 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <Typography variant="h3" className="text-center mb-8 text-gray-900">
          Top Bhutanese Highlights
        </Typography>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {[
              { id: "hotels", label: "Popular Stays" },
              { id: "restaurants", label: "Trending Eats" },
              { id: "editorPicks", label: "Editor's Picks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto pb-4">
          <div className="flex space-x-4 w-max">
            {listings[activeTab].map((item) => (
              <motion.div
                key={item.id}
                className="w-64 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ListingCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings[activeTab].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ListingCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ListingCard = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-xl border border-gray-100">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 rounded-b-none"
      >
        <div className="relative h-48 w-full">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm"
          >
            <HeartIcon
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500" : "fill-gray-400"
              }`}
            />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-bold">
            {item.tag}
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <Typography variant="h5" className="mb-1 text-gray-900">
          {item.title}
        </Typography>
        <Typography variant="small" className="text-gray-600 mb-2">
          {item.type}
        </Typography>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(item.rating)
                    ? "fill-amber-400"
                    : "fill-gray-300"
                }`}
              />
            ))}
          </div>
          <Typography variant="small" className="ml-1 text-gray-600">
            {item.rating}
          </Typography>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <Typography variant="small">{item.location}</Typography>
        </div>
      </CardBody>
      <CardFooter className="pt-0 px-4 pb-4">
        <div className="flex justify-between items-center">
          <Typography variant="h6" className="text-gray-900">
            {item.price}
          </Typography>
          <Button size="sm" color="amber" className="rounded-full">
            Book Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TopHighlightsSection;
