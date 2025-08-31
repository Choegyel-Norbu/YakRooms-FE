// RoomItemForm.jsx
import React, { useState } from "react";
import { FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import {
  FaBed,
  FaTv,
  FaWifi,
  FaSnowflake,
  FaSwimmingPool,
  FaParking,
  FaCoffee,
  FaShower,
  FaUser,
  FaEye,
} from "react-icons/fa";
import { GiDesk } from "react-icons/gi";
import { MdBalcony, MdElectricalServices } from "react-icons/md";

const RoomItemForm = ({ room = null, onSave, onCancel, isEditing = false }) => {
  // Initial form state
  const initialFormState = {
    type: "",
    price: "",
    maxGuests: 2,
    isAvailable: true,
    description: "",
    images: [],
    amenities: [],
  };

  // Form state
  const [formData, setFormData] = useState(room || initialFormState);
  const [newAmenity, setNewAmenity] = useState({
    name: "",
    icon: "custom",
  });

  // Standard amenities with icons
  const standardAmenities = [
    { id: "single-bed", name: "Single Bed", icon: <FaBed /> },
    { id: "double-bed", name: "Double Bed", icon: <FaBed /> },
    { id: "king-bed", name: "King Bed", icon: <FaBed /> },
    { id: "smart-tv", name: "Smart TV", icon: <FaTv /> },
    { id: "wifi", name: "Wi-Fi", icon: <FaWifi /> },
    { id: "ac", name: "Air Conditioning", icon: <FaSnowflake /> },
    { id: "pool", name: "Pool Access", icon: <FaSwimmingPool /> },
    { id: "parking", name: "Parking", icon: <FaParking /> },
    { id: "kettle", name: "Electric Kettle", icon: <FaCoffee /> },
    { id: "shower", name: "Hot Shower", icon: <FaShower /> },
    { id: "wardrobe", name: "Wardrobe", icon: <FaUser /> },
    { id: "mirror", name: "Mirror", icon: <FaEye /> },
    { id: "desk", name: "Work Desk", icon: <GiDesk /> },
    { id: "balcony", name: "Balcony", icon: <MdBalcony /> },
    { id: "outlets", name: "Power Outlets", icon: <MdElectricalServices /> },
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (4MB limit per file)
    const maxFileSize = 4 * 1024 * 1024; // 4MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(file => file.name).join(', ');
      alert(`File size too large: ${fileNames}\n\nEach image must be smaller than 4MB. Please compress your images and try again.`);
      return;
    }

    const newImages = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    });
  };

  // Remove an image
  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  // Toggle standard amenity
  const toggleAmenity = (amenity) => {
    const isSelected = formData.amenities.some((a) => a.id === amenity.id);

    if (isSelected) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a.id !== amenity.id),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  // Handle custom amenity input
  const handleCustomAmenityChange = (e) => {
    setNewAmenity({
      ...newAmenity,
      name: e.target.value,
    });
  };

  // Add custom amenity
  const addCustomAmenity = () => {
    if (!newAmenity.name.trim()) return;

    const amenityToAdd = {
      id: `custom-${Date.now()}`,
      name: newAmenity.name,
      icon: newAmenity.icon,
    };

    setFormData({
      ...formData,
      amenities: [...formData.amenities, amenityToAdd],
    });

    setNewAmenity({
      name: "",
      icon: "custom",
    });
  };

  // Remove amenity
  const removeAmenity = (id) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a.id !== id),
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.type || !formData.price || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    // Call the save function with form data
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Room" : "Add New Room"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Room Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select Room Type</option>
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Suite">Suite</option>
              <option value="Family Room">Family Room</option>
              <option value="Executive Room">Executive Room</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night (Nu.) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Max Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Guests *
            </label>
            <input
              type="number"
              name="maxGuests"
              value={formData.maxGuests}
              onChange={handleInputChange}
              required
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isAvailable"
              className="ml-2 block text-sm text-gray-700"
            >
              Available for Booking
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe the room features, size, view, etc."
            ></textarea>
          </div>
        </div>

        {/* Room Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Images
          </label>

          {/* Image Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Room Preview ${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Image Upload */}
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
            <FiPlus className="text-amber-500 text-2xl mb-2" />
            <p className="text-sm text-gray-600">Upload Room Images (Max 5)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={formData.images.length >= 5}
            />
          </label>
          {formData.images.length >= 5 && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum 5 images reached
            </p>
          )}
        </div>

        {/* Amenities Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Room Amenities & Facilities
          </label>

          {/* Standard Amenities */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Standard Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {standardAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer border ${
                    formData.amenities.some((a) => a.id === amenity.id)
                      ? "bg-amber-50 border-amber-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="text-amber-500 mr-2">{amenity.icon}</span>
                  <span className="text-sm">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Amenities */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Custom Amenities
            </h4>

            {/* Selected Amenities */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center bg-amber-50 px-3 py-1 rounded-full text-sm"
                >
                  {amenity.icon === "custom" ? (
                    <FiPlus className="text-amber-500 mr-1" />
                  ) : (
                    <span className="text-amber-500 mr-1">
                      {standardAmenities.find((a) => a.id === amenity.id)?.icon}
                    </span>
                  )}
                  {amenity.name}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity.id)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Amenity */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity.name}
                onChange={handleCustomAmenityChange}
                placeholder="Add custom amenity..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
          >
            <FiSave /> {isEditing ? "Update Room" : "Save Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomItemForm;
