import React, { useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiImage,
  FiWifi,
  FiCoffee,
  FiTv,
} from "react-icons/fi";
import {
  FaBed,
  FaBath,
  FaSnowflake,
  FaLock,
  FaFireExtinguisher,
} from "react-icons/fa";
import {
  MdBalcony,
  MdChargingStation,
  MdTableRestaurant,
  MdChair,
} from "react-icons/md";
import { IoVolumeMute } from "react-icons/io5";
import Footer from "../components/Footer";

const RoomManagement = () => {
  // Sample hotel data - in real app this would come from props or API
  const [hotel, setHotel] = useState({
    id: 1,
    name: "Taj Tashi Thimphu",
    location: "Thimphu, Bhutan",
    rooms: [
      {
        id: 1,
        type: "Deluxe Room",
        description: "Spacious room with king bed and mountain views",
        price: 220,
        maxGuests: 2,
        isAvailable: true,
        photos: [
          "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        ],
        amenities: [
          { id: 1, name: "King Bed", icon: "bed", type: "bed" },
          { id: 2, name: "Smart TV", icon: "tv", type: "electronics" },
          { id: 3, name: "Wi-Fi", icon: "wifi", type: "electronics" },
          { id: 4, name: "Attached Bathroom", icon: "bath", type: "bathroom" },
        ],
      },
      {
        id: 2,
        type: "Suite",
        description: "Luxurious suite with separate living area",
        price: 350,
        maxGuests: 3,
        isAvailable: true,
        photos: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        ],
        amenities: [
          { id: 1, name: "King Bed", icon: "bed", type: "bed" },
          { id: 5, name: "Air Conditioning", icon: "ac", type: "comfort" },
          { id: 6, name: "Safe Locker", icon: "safe", type: "security" },
          { id: 7, name: "Balcony", icon: "balcony", type: "view" },
        ],
      },
    ],
  });

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    type: "",
    description: "",
    price: "",
    maxGuests: 1,
    isAvailable: true,
    photos: [],
    amenities: [],
  });
  const [newAmenity, setNewAmenity] = useState({
    name: "",
    icon: "",
    type: "",
  });
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Standard amenities with icons
  const standardAmenities = [
    { id: 1, name: "Single Bed", icon: <FaBed />, type: "bed" },
    { id: 2, name: "Double Bed", icon: <FaBed />, type: "bed" },
    { id: 3, name: "Queen Bed", icon: <FaBed />, type: "bed" },
    { id: 4, name: "King Bed", icon: <FaBed />, type: "bed" },
    { id: 5, name: "Smart TV", icon: <FiTv />, type: "electronics" },
    { id: 6, name: "Normal TV", icon: <FiTv />, type: "electronics" },
    { id: 7, name: "Wi-Fi", icon: <FiWifi />, type: "electronics" },
    { id: 8, name: "Attached Bathroom", icon: <FaBath />, type: "bathroom" },
    { id: 9, name: "Electric Kettle", icon: <FiCoffee />, type: "comfort" },
    {
      id: 10,
      name: "Air Conditioning",
      icon: <FaSnowflake />,
      type: "comfort",
    },
    {
      id: 11,
      name: "Charging Ports",
      icon: <MdChargingStation />,
      type: "electronics",
    },
    { id: 12, name: "Mirror", icon: <MdTableRestaurant />, type: "bathroom" },
    {
      id: 13,
      name: "Wardrobe/Closet",
      icon: <MdTableRestaurant />,
      type: "furniture",
    },
    {
      id: 14,
      name: "Table & Chairs",
      icon: <MdTableRestaurant />,
      type: "furniture",
    },
    { id: 15, name: "Towel/Toiletries", icon: <MdBalcony />, type: "bathroom" },
    { id: 16, name: "Safe Locker", icon: <FaLock />, type: "security" },
    {
      id: 17,
      name: "Fire Extinguisher",
      icon: <FaFireExtinguisher />,
      type: "security",
    },
    { id: 18, name: "Balcony", icon: <MdBalcony />, type: "view" },
    { id: 19, name: "Soundproofing", icon: <IoVolumeMute />, type: "comfort" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm({
      ...roomForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAmenityChange = (e) => {
    const { name, value } = e.target;
    setNewAmenity({
      ...newAmenity,
      [name]: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => URL.createObjectURL(file));
    setRoomForm({
      ...roomForm,
      photos: [...roomForm.photos, ...newPhotos],
    });
  };

  const removePhoto = (index) => {
    setRoomForm({
      ...roomForm,
      photos: roomForm.photos.filter((_, i) => i !== index),
    });
  };

  const toggleAmenity = (amenity) => {
    const isSelected = roomForm.amenities.some((a) => a.name === amenity.name);
    if (isSelected) {
      setRoomForm({
        ...roomForm,
        amenities: roomForm.amenities.filter((a) => a.name !== amenity.name),
      });
    } else {
      setRoomForm({
        ...roomForm,
        amenities: [...roomForm.amenities, amenity],
      });
    }
  };

  const addCustomAmenity = () => {
    if (newAmenity.name.trim() === "") return;

    setRoomForm({
      ...roomForm,
      amenities: [
        ...roomForm.amenities,
        {
          id: Date.now(),
          name: newAmenity.name,
          icon: "custom",
          type: newAmenity.type || "other",
        },
      ],
    });

    setNewAmenity({ name: "", icon: "", type: "" });
    setShowAmenityForm(false);
  };

  const startEditRoom = (room) => {
    setEditingRoom(room.id);
    setRoomForm({
      type: room.type,
      description: room.description,
      price: room.price,
      maxGuests: room.maxGuests,
      isAvailable: room.isAvailable,
      photos: [...room.photos],
      amenities: [...room.amenities],
    });
    setShowRoomForm(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setShowRoomForm(false);
    resetForm();
  };

  const resetForm = () => {
    setRoomForm({
      type: "",
      description: "",
      price: "",
      maxGuests: 1,
      isAvailable: true,
      photos: [],
      amenities: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!roomForm.type || !roomForm.description || !roomForm.price) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (editingRoom) {
      // Update existing room
      const updatedRooms = hotel.rooms.map((room) =>
        room.id === editingRoom ? { ...roomForm, id: editingRoom } : room
      );
      setHotel({ ...hotel, rooms: updatedRooms });
      showToast("Room updated successfully", "success");
    } else {
      // Add new room
      const newRoom = {
        ...roomForm,
        id: Date.now(),
      };
      setHotel({ ...hotel, rooms: [...hotel.rooms, newRoom] });
      showToast("Room added successfully", "success");
    }

    cancelEdit();
  };

  const deleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      setHotel({
        ...hotel,
        rooms: hotel.rooms.filter((room) => room.id !== id),
      });
      showToast("Room deleted successfully", "success");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "bed":
        return <FaBed />;
      case "tv":
        return <FiTv />;
      case "wifi":
        return <FiWifi />;
      case "bath":
        return <FaBath />;
      case "ac":
        return <FaSnowflake />;
      case "safe":
        return <FaLock />;
      case "balcony":
        return <MdBalcony />;
      case "charging":
        return <MdChargingStation />;
      case "mirror":
        return <GiWardrobe />;
      case "wardrobe":
        return <GiWardrobe />;
      case "table":
        return <MdTableRestaurant />;
      case "towel":
        return <FaFireExtinguisher />;
      case "fire":
        return <FaFireExtinguisher />;
      case "sound":
        return <IoVolumeMute />;
      case "kettle":
        return <FiCoffee />;
      default:
        return <FiCheck />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Hotel Info Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{hotel.name}</h1>
        <p className="text-gray-600 flex items-center">
          <MdTableRestaurant className="mr-1" /> {hotel.location}
        </p>
      </div>

      {/* Add/Edit Room Form */}
      {showRoomForm ? (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="type"
                  value={roomForm.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select Room Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Double Room">Double Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Executive Room">Executive Room</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per night (Nu.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={roomForm.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter price"
                />
              </div>

              {/* Max Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests *
                </label>
                <input
                  type="number"
                  name="maxGuests"
                  value={roomForm.maxGuests}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={roomForm.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isAvailable"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Currently Available
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={roomForm.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Describe the room features, view, size, etc."
                ></textarea>
              </div>

              {/* Photos */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {roomForm.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Preview ${index}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                  <FiImage className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload room photos (5 max)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={roomForm.photos.length >= 5}
                  />
                </label>
                {roomForm.photos.length >= 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 5 photos reached
                  </p>
                )}
              </div>

              {/* Amenities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Amenities
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {standardAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                        roomForm.amenities.some((a) => a.name === amenity.name)
                          ? "bg-amber-100 border-amber-300"
                          : "bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span className="text-amber-500 mr-2">
                        {amenity.icon}
                      </span>
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>

                {/* Custom Amenity */}
                {showAmenityForm ? (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newAmenity.name}
                          onChange={handleAmenityChange}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg"
                          placeholder="e.g., Mini Fridge"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Type
                        </label>
                        <select
                          name="type"
                          value={newAmenity.type}
                          onChange={handleAmenityChange}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Type</option>
                          <option value="furniture">Furniture</option>
                          <option value="electronics">Electronics</option>
                          <option value="bathroom">Bathroom</option>
                          <option value="comfort">Comfort</option>
                          <option value="view">View</option>
                          <option value="security">Security</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={addCustomAmenity}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAmenityForm(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAmenityForm(true)}
                    className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                  >
                    <FiPlus /> Add Custom Amenity
                  </button>
                )}

                {/* Selected Amenities */}
                {roomForm.amenities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {roomForm.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-amber-50 px-3 py-1 rounded-full text-sm"
                        >
                          {amenity.icon !== "custom" ? (
                            <span className="text-amber-500 mr-1">
                              {getIconComponent(amenity.icon)}
                            </span>
                          ) : (
                            <span className="text-amber-500 mr-1">
                              <FiCheck />
                            </span>
                          )}
                          {amenity.name}
                          <button
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
              >
                {editingRoom ? "Update Room" : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => {
            setShowRoomForm(true);
            setEditingRoom(null);
            resetForm();
          }}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
        >
          <FiPlus /> Add New Room
        </button>
      )}

      {/* Existing Rooms List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">
          Your Rooms ({hotel.rooms.length})
        </h2>

        {hotel.rooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No rooms added yet. Click "Add New Room" to get started.
          </div>
        ) : (
          <div className="divide-y">
            {hotel.rooms.map((room) => (
              <div key={room.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Room Photo */}
                  {room.photos.length > 0 && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0">
                      <img
                        src={room.photos[0]}
                        alt={room.type}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Room Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {room.type}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {room.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-amber-600">
                          Nu. {room.price}
                        </p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 5).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {amenity.icon !== "custom" ? (
                                <span className="text-amber-500 mr-1">
                                  {getIconComponent(amenity.icon)}
                                </span>
                              ) : null}
                              {amenity.name}
                            </div>
                          ))}
                          {room.amenities.length > 5 && (
                            <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{room.amenities.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        {/* <FiUsers className="mr-1" /> {room.maxGuests}{" "} */}
                        {room.maxGuests > 1 ? "guests" : "guest"}
                      </div>
                      <div
                        className={`flex items-center ${
                          room.isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {room.isAvailable ? (
                          <>
                            <FiCheck className="mr-1" /> Available
                          </>
                        ) : (
                          <>
                            <FiX className="mr-1" /> Not Available
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-start md:self-center">
                    <button
                      onClick={() => startEditRoom(room)}
                      className="p-2 text-gray-600 hover:text-amber-600 transition"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RoomManagement;
