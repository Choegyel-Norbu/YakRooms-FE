import React, { useState, useEffect } from "react";
import { FiSearch, FiMapPin, FiStar, FiFilter, FiHome } from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import api from "../services/Api";

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
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalPages: 1,
    totalElements: 0,
  });
  const [searchParams, setSearchParams] = useState({
    district: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    hotelType: "",
  });

  const [formErrors, setFormErrors] = useState({ district: "", hotelType: "" });
  const validateForm = () => {
    let errors = { district: "", hotelType: "" };
    let isValid = true;

    // Validate district (required and must be letters only)
    if (!searchParams.district || searchParams.district.trim() === "") {
      errors.district = "District is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(searchParams.district.trim())) {
      errors.district = "District must contain only letters";
      isValid = false;
    }

    //  Validate hotelType (required and must be one of allowed values)
    if (
      searchParams.hotelType &&
      !allowedHotelTypes.includes(searchParams.hotelType)
    ) {
      errors.hotelType = "Invalid hotel type selected";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSearchClick = (e) => {
    console.log(validateForm());
    e.preventDefault();
    if (validateForm()) {
      handleSearch(); // only proceed if valid
    }
  };

  // Fetch hotels from API
  const fetchHotels = async (page = 0) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/hotels?page=${page}&size=${pagination.size}`
      );
      setHotels(response.data.content);
      setPagination({
        page: response.data.pageable.pageNumber,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const filterHotels = async (page = 0) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/hotels/search?district=${searchParams.district}&hotelType=${searchParams.hotelType}&page=${page}&size=${pagination.size}`
      );
      setHotels(response.data.content);
      setPagination({
        page: response.data.pageable.pageNumber,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to match UI structure
  const transformHotelData = (hotel) => ({
    id: hotel.id,
    name: hotel.name,
    district: hotel.district,
    price: Math.floor(Math.random() * 400) + 80, // Generate random price since API doesn't provide
    rating: 4 + Math.random(), // Generate random rating between 4-5
    image:
      hotel.photoUrls?.[0] ||
      "https://via.placeholder.com/600x400?text=No+Image",
    type: hotel.hotelType || "Standard Hotel",
    reviews: Math.floor(Math.random() * 100) + 20, // Generate random reviews
  });

  // Sort hotels based on selected option
  const sortedHotels = [...hotels].map(transformHotelData).sort((a, b) => {
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
      (selectedTypes.length === 0 || selectedTypes.includes(hotel.type)) &&
      (searchParams.district === "" ||
        hotel.district
          .toLowerCase()
          .includes(searchParams.district.toLowerCase()))
    );
  });

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchHotels(newPage);
    }
  };

  // Handle search
  const handleSearch = () => {
    console.log(
      "Selected values: " + searchParams.district + " " + searchParams.hotelType
    );
    filterHotels(0); // Reset to first page when searching
  };

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
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-md`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Search & Filter
            </h2>

            {/* district Search - unchanged */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where in Bhutan?"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={searchParams.district}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      district: e.target.value,
                    })
                  }
                />
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              </div>
              {formErrors.district && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.district}
                </p>
              )}
            </div>

            {/* Hotel Type - changed to select dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={searchParams.hotelType} // Using first item since it's now single-select
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    hotelType: e.target.value,
                  })
                }
              >
                <option value="">All Hotel Types</option>
                <option value="ONE_STAR">One Star</option>
                <option value="TWO_STAR">Two Star</option>
                <option value="THREE_STAR">Three Star</option>
                <option value="FOUR_STAR">Four Star</option>
                <option value="FIVE_STAR">Five Star</option>
                <option value="BUDGET">Budget</option>
                <option value="BOUTIQUE">Boutique</option>
                <option value="RESORT">Resort</option>
                <option value="HOMESTAY">Homestay</option>
              </select>
              {formErrors.hotelType && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.hotelType}
                </p>
              )}
            </div>

            {/* Search button - unchanged */}
            <button
              onClick={onSearchClick}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg shadow transition"
            >
              <FiSearch className="inline mr-2" />
              Search
            </button>
            <Link to="/" className="text-amber-500 ">
              <FiHome className="inline mr-2 my-8" />
              <span>Home</span>
            </Link>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            {/* Sorting Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {loading
                  ? "Loading..."
                  : `${filteredHotels.length} Stays in Bhutan`}
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            )}

            {/* Hotel Listings */}
            {!loading && (
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
                          <span className="font-medium">
                            {hotel.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <FiMapPin className="mr-1" />
                        <span>{hotel.district}</span>
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
            )}

            {/* Pagination */}
            {!loading && filteredHotels.length > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages).keys()].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 border-t border-b border-gray-300 ${
                        pageNum === pagination.page
                          ? "bg-amber-100 text-amber-600 font-medium"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages - 1}
                    className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredHotels.length === 0 && (
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
    </div>
  );
};

export default HotelListingPage;
