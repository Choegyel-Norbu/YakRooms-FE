import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { uploadFile } from "../lib/uploadService";
import {
  FaBed,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaSwimmingPool,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../services/AuthProvider";
import api from "../services/Api";
import { CheckCircle, XCircle } from "lucide-react";

const RoomManager = () => {
  const { hotelId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [verifyAlert, setVerifyAlert] = useState(false);
  const [roomAdded, setRoomAdded] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const formRef = useRef(null);

  // Form state
  const [roomForm, setRoomForm] = useState({
    roomType: "",
    price: "",
    roomNumber: "",
    available: true,
    description: "",
    images: [],
    amenities: [],
  });
  const [errors, setErrors] = useState({});

  // Constants
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

  const roomTypeOptions = [
    "SINGLE",
    "DOUBLE",
    "DELUXE",
    "SUITE",
    "FAMILY",
    "TWIN",
    "KING",
    "QUEEN",
  ];

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "roomType":
        return value ? "" : "Room type is required";
      case "price":
        if (!value) return "Price is required";
        if (isNaN(value) || value <= 0)
          return "Price must be a positive number";
        return "";
      case "roomNumber":
        return value ? "" : "Room number is required";
      case "description":
        return value.length >= 20
          ? ""
          : "Description must be at least 20 characters";
      case "images":
        return value.length > 0 ? "" : "At least one image is required";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.roomType = validateField("roomType", roomForm.roomType);
    newErrors.price = validateField("price", roomForm.price);
    newErrors.roomNumber = validateField("roomNumber", roomForm.roomNumber);
    newErrors.description = validateField("description", roomForm.description);
    newErrors.images = validateField("images", roomForm.images);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/rooms/hotel/${hotelId || 20}`);
        setRooms(response.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms.");
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId]);

  // Initialize form when editing
  useEffect(() => {
    if (editingRoom) {
      const roomToEdit = rooms.find((room) => room.id === editingRoom);
      if (roomToEdit) {
        setRoomForm({
          roomType: roomToEdit.roomType || "",
          price: roomToEdit.price || "",
          roomNumber: roomToEdit.roomNumber || "",
          available: roomToEdit.available !== false,
          description: roomToEdit.description || "",
          images:
            roomToEdit.imageUrl?.map((url, index) => ({
              url,
              name: `existing-${index}`,
              isExisting: true,
            })) || [],
          amenities:
            roomToEdit.amenities?.map(
              (name) =>
                standardAmenities.find((a) => a.name === name) || {
                  name,
                  id: Date.now(),
                }
            ) || [],
        });
      }
    } else if (showForm) {
      resetForm();
    }
  }, [editingRoom, showForm, rooms]);

  const resetForm = () => {
    setRoomForm({
      roomType: "",
      price: "",
      roomNumber: "",
      available: true,
      description: "",
      images: [],
      amenities: [],
    });
    setErrors({});
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setRoomForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue),
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const existingImages = roomForm.images || [];
    const remainingSlots = 5 - existingImages.length;

    if (remainingSlots <= 0) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    try {
      const newImages = filesToAdd.map((file) => ({
        file,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        isNew: true,
      }));

      setRoomForm((prev) => ({
        ...prev,
        images: [...existingImages, ...newImages],
      }));

      // Clear image validation error if images are added
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    } catch (error) {
      toast.error("Failed to process images");
    }
  };

  const removeImage = (index) => {
    setRoomForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity) => {
    setRoomForm((prev) => {
      const exists = prev.amenities.some((a) => a.id === amenity.id);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a.id !== amenity.id)
          : [...prev.amenities, amenity],
      };
    });
  };

  const startEdit = (room) => {
    setEditingRoom(room.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setShowForm(false);
    setErrors({});
  };

  const scrollToFirstError = () => {
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      const element = formRef.current?.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      scrollToFirstError();
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload new images
      const imageUploadPromises = roomForm.images
        .filter((img) => img.isNew && img.file)
        .map((img) => uploadFile(img.file, "photos"));

      const uploadResults = await Promise.all(imageUploadPromises);

      // Combine existing and new image URLs
      const existingImageUrls = roomForm.images
        .filter((img) => img.isExisting)
        .map((img) => img.url);

      const newImageUrls = uploadResults
        .filter((res) => res.field === "photos" && res.url)
        .map((res) => res.url);

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Prepare payload
      const payload = {
        ...roomForm,
        imageUrl: allImageUrls,
        amenities: roomForm.amenities.map((a) => a.name),
      };

      // Submit form
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom}`, payload);
        toast.success("Room updated successfully!");

        // Update local state
        setRooms((prev) =>
          prev.map((room) =>
            room.id === editingRoom
              ? {
                  ...room,
                  ...payload,
                  id: editingRoom,
                  amenities: payload.amenities,
                }
              : room
          )
        );
      } else {
        const response = await api.post(
          `/rooms/hotel/${hotelId || 20}`,
          payload
        );
        toast.success("Room added successfully!");

        // Add new room to local state
        setRooms((prev) => [...prev, response.data]);
        setRoomAdded(true);
        setVerifyAlert(true);
        setTimeout(() => setVerifyAlert(false), 3000);
      }

      cancelEdit();
    } catch (error) {
      console.error("Error submitting room:", error);

      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          serverErrors[key] = error.response.data.errors[key].join(", ");
        });
        setErrors(serverErrors);
        scrollToFirstError();
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to save room. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    setIsDeleting(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Room Management</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRoom(null);
          }}
          className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
        >
          <FiPlus /> Add Room
        </button>
      </div>

      {/* Room Form */}
      {showForm && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50" ref={formRef}>
          {verifyAlert && (
            <div
              className={`w-full p-4 rounded-md flex items-center space-x-3 mb-4 ${
                roomAdded
                  ? "bg-green-100 border border-green-300 text-green-800"
                  : "bg-red-100 border border-red-300 text-red-800"
              }`}
            >
              {roomAdded ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p className="font-medium">
                {roomAdded
                  ? "Room added successfully!"
                  : "Something went wrong. Please try again later."}
              </p>
            </div>
          )}

          <h4 className="text-md font-medium mb-3">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="roomType"
                  value={roomForm.roomType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.roomType
                      ? "border-red-500"
                      : roomForm.roomType
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Room Type</option>
                  {roomTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.roomType && (
                  <p className="mt-1 text-sm text-red-500">{errors.roomType}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per night (Nu.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={roomForm.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.price
                      ? "border-red-500"
                      : roomForm.price
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={roomForm.roomNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.roomNumber
                      ? "border-red-500"
                      : roomForm.roomNumber
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.roomNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.roomNumber}
                  </p>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={roomForm.available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="available"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Available for booking
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={roomForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.description
                      ? "border-red-500"
                      : roomForm.description?.length >= 20
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Room Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Images <span className="text-red-500">*</span>
                </label>

                {/* Image Preview */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {roomForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Room ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Area */}
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                  <FiPlus className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload room images (max 5)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {errors.images && (
                  <p className="mt-1 text-sm text-red-500">{errors.images}</p>
                )}
              </div>

              {/* Amenities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {standardAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition border ${
                        roomForm.amenities.some((a) => a.id === amenity.id)
                          ? "bg-amber-100 border-amber-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
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

            {/* Form Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center min-w-24 ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {editingRoom ? "Updating..." : "Adding..."}
                  </>
                ) : editingRoom ? (
                  "Update Room"
                ) : (
                  "Add Room"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Room No.</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Amenities</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{room.roomNumber}</td>
                <td className="py-3 px-4">{room.roomType}</td>
                <td className="py-3 px-4 max-w-xs truncate">
                  {room.description}
                </td>
                <td className="py-3 px-4">Nu {room.price?.toFixed(2)}</td>
                <td className="py-3 px-4 max-w-xs truncate">
                  {Array.isArray(room.amenities)
                    ? room.amenities.join(", ")
                    : room.amenities}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      room.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {room.available ? "Available" : "Not Available"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => startEdit(room)}
                    className=" text-blue-500 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    disabled={isDeleting === room.id}
                    className={`text-red-600 px-3 py-1 rounded text-sm transition-colors ${
                      isDeleting === room.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isDeleting === room.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoomManager;
