import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import RoomBookingCard from "../components/cards/RoomBookingCard.jsx";
import {
  FiMapPin,
  FiStar,
  FiArrowLeft,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import api from "../services/Api";
import Footer from "../components/Footer";
import YakRoomsAdCard from "../components/cards/YakRoomsAdCard";

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

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookindDialog, setBookingDialog] = useState(false);

  useEffect(() => {
    console.log("HotelId: " + id);
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/hotels/details/${id}`);
        setHotel(response.data);
        const res = await api.get(`/rooms/available/${id}`);
        setAvailableRooms(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load hotel details");
        console.error("Error fetching hotel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  const nextImage = () => {
    if (hotel?.photoUrls?.length) {
      setCurrentImageIndex((prev) =>
        prev === hotel.photoUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hotel?.photoUrls?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? hotel.photoUrls.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {error || "Hotel not found"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Transform API data to match our UI structure
  const transformedHotel = {
    ...hotel,
    images: hotel.photoUrls || [
      "https://via.placeholder.com/1000x600?text=No+Hotel+Image",
    ],

    rooms: [
      {
        type: "Standard Room",
        price: 100,
        size: "25 sqm",
        capacity: "2 adults",
        description: "Comfortable room with basic amenities",
        amenities: ["WiFi", "TV", "AC"],
      },
      {
        type: "Deluxe Room",
        price: 150,
        size: "35 sqm",
        capacity: "2 adults + 1 child",
        description: "Spacious room with premium amenities",
        amenities: ["WiFi", "TV", "Minibar", "Safe"],
      },
    ],
    availableRooms: [
      {
        id: "room101",
        type: "Standard Room",
        price: 100,
        beds: "1 Queen Bed",
        guests: 2,
        image:
          hotel.photoUrls?.[0] ||
          "https://via.placeholder.com/600x400?text=No+Room+Image",
      },
      {
        id: "room102",
        type: "Deluxe Room",
        price: 150,
        beds: "1 King Bed",
        guests: 2,
        image:
          hotel.photoUrls?.[1] ||
          "https://via.placeholder.com/600x400?text=No+Room+Image",
      },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="text-black py-4 shadow-md sticky top-0 z-1 bg-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-amber-200 transition"
          >
            <FiArrowLeft /> Back to listings
          </button>
          <h1 className="text-xl font-bold">YakRooms</h1>
          <div className="flex gap-4">
            <button className="hover:text-amber-200 transition">
              <FiShare2 />
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`hover:text-amber-200 transition ${
                isFavorite ? "text-amber-200" : ""
              }`}
            >
              <FiHeart fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hotel Info Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img
              src={transformedHotel.images[currentImageIndex]}
              alt={transformedHotel.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition"
            >
              &larr;
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition"
            >
              &rarr;
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {transformedHotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentImageIndex === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {transformedHotel.name}
              </h1>
              <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                <FiStar className="text-amber-500 mr-1" />
                <span className="font-medium">4.5</span>
                <span className="text-gray-500 ml-1">(128)</span>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <FiMapPin className="mr-2" />
              <span>{transformedHotel.district}, Bhutan</span>
            </div>

            <StarRating rating={4.5} />

            <p className="mt-4 text-gray-700">{transformedHotel.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Amenities and Details */}
          <div className="lg:col-span-2">
            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-amber-500 mr-2">-</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Available Rooms Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Available Rooms
                </h2>
                <div className="space-y-4">
                  {availableRooms.map((room) => (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Room Image */}
                        <div className="md:w-1/2 relative">
                          <img
                            src={
                              room.imageUrl[0] ||
                              "https://via.placeholder.com/500x300?text=No+Image"
                            }
                            alt={room.roomNumber}
                            className="w-full h-64 md:h-full object-cover"
                          />
                          {/* <div className="absolute top-3 right-3 flex space-x-2">
                            <button className="bg-white/90 p-2 rounded-full shadow hover:bg-white transition">
                              <FiHeart className="text-gray-600 hover:text-red-500" />
                            </button>
                            <button className="bg-white/90 p-2 rounded-full shadow hover:bg-white transition">
                              <FiShare2 className="text-gray-600 hover:text-blue-500" />
                            </button>
                          </div> */}
                          {room.available && (
                            <div className="absolute bottom-3 left-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                              <FiCheckCircle className="mr-1" /> Available
                            </div>
                          )}
                        </div>

                        {/* Room Details */}
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                {room.roomType}: {room.roomNumber}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                {room.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-amber-600">
                                Nu {room.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">per night</p>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-800 mb-2">
                              Amenities
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {room.amenities.map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center bg-gray-50 px-3 py-1 rounded-full"
                                >
                                  <span className="text-amber-500 mr-2">-</span>
                                  <span className="text-sm text-gray-700">
                                    {amenity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Booking Action */}
                          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <RoomBookingCard room={room} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="hidden lg:block">
            <YakRoomsAdCard />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelDetailsPage;
