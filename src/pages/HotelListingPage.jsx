import React, { useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

// Dummy hotel data
const hotels = [
  {
    id: 1,
    name: "Taj Tashi Thimphu",
    location: "Thimphu",
    price: 220,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Luxury Hotel",
    reviews: 128,
  },
  {
    id: 2,
    name: "Zhiwa Ling Heritage",
    location: "Paro",
    price: 190,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Boutique Hotel",
    reviews: 95,
  },
  {
    id: 3,
    name: "Amankora Punakha",
    location: "Punakha",
    price: 350,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Luxury Resort",
    reviews: 87,
  },
  {
    id: 4,
    name: "Gangtey Lodge",
    location: "Gangtey",
    price: 180,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Eco Lodge",
    reviews: 64,
  },
  {
    id: 5,
    name: "Dochula Resort",
    location: "Dochula Pass",
    price: 160,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Mountain View",
    reviews: 52,
  },
  {
    id: 6,
    name: "Riverside Homestay",
    location: "Wangdue",
    price: 80,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    type: "Homestay",
    reviews: 43,
  },
];

// Star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-amber-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-amber-400" />);
    }
  }

  return <div className="flex space-x-1">{stars}</div>;
};

const HotelListingPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Toggle hotel type filter
  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Sort hotels based on selected option
  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews; // Default: popularity
  });

  // Filter hotels based on selected filters
  const filteredHotels = sortedHotels.filter((hotel) => {
    return (
      hotel.price >= priceRange[0] &&
      hotel.price <= priceRange[1] &&
      hotel.rating >= minRating &&
      (selectedTypes.length === 0 || selectedTypes.includes(hotel.type))
    );
  });

  // Unique hotel types for filter
  const hotelTypes = [...new Set(hotels.map((hotel) => hotel.type))];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-amber-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">YakRooms</h1>
          <p className="text-amber-100">Discover authentic Bhutanese stays</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Mobile Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 bg-amber-500 text-white py-2 px-4 rounded-lg shadow hover:bg-amber-600 transition"
          >
            <FiFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-md`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Search & Filter
            </h2>

            {/* Location Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where in Bhutan?"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dates
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Check-in"
                />
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Check-out"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option>1 guest</option>
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4+ guests</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full mb-2"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Hotel Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Type
              </label>
              <div className="space-y-2">
                {hotelTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center space-x-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      minRating === rating
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rating === 0 ? "Any" : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg shadow transition">
              <FiSearch className="inline mr-2" />
              Search
            </button>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            {/* Sorting Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredHotels.length} Stays in Bhutan
              </h2>
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Hotel Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {hotel.type}
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center">
                        <FiStar className="text-amber-400 mr-1" />
                        <span className="font-medium">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <FiMapPin className="mr-1" />
                      <span>{hotel.location}</span>
                    </div>

                    <StarRating rating={hotel.rating} />

                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <span className="text-gray-600 text-sm">From</span>
                        <p className="text-xl font-bold text-amber-600">
                          ${hotel.price}
                          <span className="text-sm font-normal text-gray-500">
                            /night
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/hotel/${hotel.id}`}
                        className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredHotels.length > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-amber-600 font-medium">
                    1
                  </button>
                  <button className="px-3 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* No Results */}
            {filteredHotels.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No hotels match your filters
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria
                </p>
                <button
                  onClick={() => {
                    setPriceRange([0, 500]);
                    setSelectedTypes([]);
                    setMinRating(0);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelListingPage;
