// RoomManager.jsx
import React, { useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import {
  FaBed,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaSwimmingPool,
} from "react-icons/fa";
// import RoomItemForm from "../components/RoomItemForm.jsx";

const RoomManager = ({ rooms, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    type: "",
    price: "",
    maxGuests: 2,
    isAvailable: true,
    description: "",
    images: [],
    amenities: [],
  });

  const standardAmenities = [
    { id: 1, name: "Single Bed", icon: <FaBed /> },
    { id: 2, name: "Double Bed", icon: <FaBed /> },
    { id: 3, name: "Queen Bed", icon: <FaBed /> },
    { id: 4, name: "King Bed", icon: <FaBed /> },
    { id: 5, name: "Smart TV", icon: <FaTv /> },
    { id: 6, name: "Normal TV", icon: <FaTv /> },
    { id: 7, name: "Wi-Fi", icon: <FaWifi /> },
    { id: 8, name: "Air Conditioning", icon: <FaSnowflake /> },
    { id: 9, name: "Swimming Pool Access", icon: <FaSwimmingPool /> },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm({
      ...roomForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setRoomForm({
      ...roomForm,
      images: [...roomForm.images, ...newImages],
    });
  };

  const removeImage = (index) => {
    setRoomForm({
      ...roomForm,
      images: roomForm.images.filter((_, i) => i !== index),
    });
  };

  const toggleAmenity = (amenity) => {
    const isSelected = roomForm.amenities.some((a) => a.id === amenity.id);
    if (isSelected) {
      setRoomForm({
        ...roomForm,
        amenities: roomForm.amenities.filter((a) => a.id !== amenity.id),
      });
    } else {
      setRoomForm({
        ...roomForm,
        amenities: [...roomForm.amenities, amenity],
      });
    }
  };

  const startEdit = (room) => {
    setEditingRoom(room.id);
    setRoomForm({
      type: room.type,
      price: room.price,
      maxGuests: room.maxGuests,
      isAvailable: room.isAvailable,
      description: room.description,
      images: [...room.images],
      amenities: [...room.amenities],
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setRoomForm({
      type: "",
      price: "",
      maxGuests: 2,
      isAvailable: true,
      description: "",
      images: [],
      amenities: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomForm.type || !roomForm.price || !roomForm.description) {
      alert("Please fill all required fields");
      return;
    }

    if (editingRoom) {
      onUpdate({ ...roomForm, id: editingRoom });
    } else {
      onAdd(roomForm);
    }

    cancelEdit();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Room Management</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRoom(null);
            resetForm();
          }}
          className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-lg text-sm"
        >
          <FiPlus /> Add Room
        </button>
      </div>

      {/* Room Form */}
      {showForm && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-md font-medium mb-3">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="type"
                  value={roomForm.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Room Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Double Room">Double Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Family Room">Family Room</option>
                </select>
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

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
                  Available for booking
                </label>
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Images
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {roomForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                  <FiPlus className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">Upload room images</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {standardAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                        roomForm.amenities.some((a) => a.id === amenity.id)
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
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                {editingRoom ? "Update Room" : "Add Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Room Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Max Guests
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No rooms added yet
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{room.type}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {room.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Nu. {room.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.maxGuests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        room.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => startEdit(room)}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(room.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManager;
