import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  FiMapPin,
  FiStar,
  FiCalendar,
  FiUsers,
  FiArrowLeft,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaWifi,
  FaSwimmingPool,
  FaParking,
  FaUtensils,
  FaSnowflake,
} from "react-icons/fa";
import { FaBed } from "react-icons/fa";

// Dummy hotel data - in a real app this would come from an API
const hotels = [
  {
    id: 1,
    name: "Taj Tashi Thimphu",
    location: "Thimphu, Bhutan",
    price: 220,
    rating: 4.8,
    reviews: 128,
    availableRooms: [
      {
        id: "room101",
        type: "Deluxe King Room",
        price: 220,
        beds: "1 King Bed",
        guests: 2,
        image:
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room102",
        type: "Executive Suite",
        price: 350,
        beds: "1 King Bed, 1 Sofa Bed",
        guests: 3,
        image:
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room103",
        type: "Twin Room with View",
        price: 240,
        beds: "2 Twin Beds",
        guests: 2,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      },
    ],
    description:
      "A luxury hotel blending Bhutanese dzong architecture with contemporary design, offering panoramic views of Thimphu valley.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: [
      { name: "Free WiFi", icon: <FaWifi /> },
      { name: "Swimming Pool", icon: <FaSwimmingPool /> },
      { name: "Free Parking", icon: <FaParking /> },
      { name: "Restaurant", icon: <FaUtensils /> },
      { name: "Air Conditioning", icon: <FaSnowflake /> },
    ],
    rooms: [
      {
        type: "Deluxe Room",
        price: 220,
        size: "35 sqm",
        capacity: "2 adults",
        description: "Spacious room with king bed and mountain views",
        amenities: ["WiFi", "TV", "Minibar", "Safe"],
      },
      {
        type: "Suite",
        price: 350,
        size: "55 sqm",
        capacity: "2 adults + 1 child",
        description: "Luxurious suite with separate living area",
        amenities: ["WiFi", "TV", "Minibar", "Safe", "Bathtub"],
      },
    ],
  },
  // Other hotels would be here...
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

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(2);

  const hotel = hotels.find((h) => h.id === parseInt(id));

  if (!hotel) {
    return (
      <div className="container mx-auto py-8 text-center">Hotel not found</div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-amber-600 text-white py-4 shadow-md">
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
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
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
              {hotel.images.map((_, index) => (
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
                {hotel.name}
              </h1>
              <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                <FiStar className="text-amber-500 mr-1" />
                <span className="font-medium">{hotel.rating}</span>
                <span className="text-gray-500 ml-1">({hotel.reviews})</span>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <FiMapPin className="mr-2" />
              <span>{hotel.location}</span>
            </div>

            <StarRating rating={hotel.rating} />

            <p className="mt-4 text-gray-700">{hotel.description}</p>
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
                    <span className="text-amber-500 mr-2">{amenity.icon}</span>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Rooms
              </h2>
              <div className="space-y-6">
                {hotel.rooms.map((room, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition ${
                      selectedRoom === index
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                    onClick={() => setSelectedRoom(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {room.type}
                        </h3>
                        <p className="text-gray-600">
                          {room.size} • {room.capacity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">
                          ${room.price}
                        </p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{room.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {room.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Available Rooms Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Available Rooms
                </h2>
                <div className="space-y-4">
                  {hotel.availableRooms && hotel.availableRooms.length > 0 ? (
                    hotel.availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-col md:flex-row bg-white p-4 rounded-lg shadow-sm border border-gray-200 items-center"
                      >
                        <img
                          src={room.image}
                          alt={room.type}
                          className="w-full md:w-48 h-40 md:h-auto object-cover rounded-md"
                        />
                        <div className="flex-1 py-4 md:py-0 md:px-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {room.type}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                            <span className="flex items-center">
                              <FiUsers className="mr-2" /> {room.guests} Guests
                            </span>
                            <span className="flex items-center">
                              <FaBed className="mr-2" /> {room.beds}
                            </span>
                          </div>
                        </div>
                        <div className="w-full md:w-auto md:text-right">
                          <p className="text-xl font-bold text-amber-600">
                            ${room.price}
                            <span className="text-sm font-normal text-gray-500">
                              /night
                            </span>
                          </p>
                          <button
                            onClick={() =>
                              alert(
                                `Booking process for ${room.type} would start here.`
                              )
                            }
                            className="mt-2 w-full bg-amber-500 text-white py-2 px-6 rounded-lg hover:bg-amber-600 transition"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 bg-white p-4 rounded-lg">
                      No rooms are currently available for booking at this
                      hotel.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Book Your Stay
            </h2>

            <div className="space-y-4">
              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                  </select>
                  <FiUsers className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Selected Room */}
              {selectedRoom !== null && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Selected Room
                  </h3>
                  <div className="flex justify-between">
                    <span>{hotel.rooms[selectedRoom].type}</span>
                    <span className="font-semibold">
                      ${hotel.rooms[selectedRoom].price}
                    </span>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room price (3 nights)</span>
                  <span className="font-medium">
                    $
                    {selectedRoom !== null
                      ? hotel.rooms[selectedRoom].price * 3
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Taxes & fees</span>
                  <span className="font-medium">
                    $
                    {selectedRoom !== null
                      ? (hotel.rooms[selectedRoom].price * 3 * 0.1).toFixed(2)
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>
                    $
                    {selectedRoom !== null
                      ? (hotel.rooms[selectedRoom].price * 3 * 1.1).toFixed(2)
                      : "--"}
                  </span>
                </div>
              </div>

              <button
                disabled={
                  selectedRoom === null || !checkInDate || !checkOutDate
                }
                className={`w-full py-3 px-4 rounded-lg font-bold text-white mt-4 transition ${
                  selectedRoom === null || !checkInDate || !checkOutDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelDetailsPage;
