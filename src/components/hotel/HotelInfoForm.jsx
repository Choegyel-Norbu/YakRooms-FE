// HotelInfoForm.jsx
import React, { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiUpload, FiSave } from "react-icons/fi";

const HotelInfoForm = ({ hotel, onUpdate }) => {
  const [formData, setFormData] = useState(hotel);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        [name]: value,
      },
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Hotel Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(hotel);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <FiSave size={14} /> Save
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="Luxury Hotel">Luxury Hotel</option>
              <option value="Boutique Hotel">Boutique Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Guest House">Guest House</option>
              <option value="Homestay">Homestay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District *
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="Thimphu">Thimphu</option>
              <option value="Paro">Paro</option>
              <option value="Punakha">Punakha</option>
              <option value="Bumthang">Bumthang</option>
              <option value="Wangdue">Wangdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.contact.phone}
                    onChange={handleContactChange}
                    required
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                  <FiPhone className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.contact.email}
                    onChange={handleContactChange}
                    required
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            ></textarea>
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Images
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Hotel ${index}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                <FiUpload className="text-amber-500 text-2xl mb-2" />
                <p className="text-sm text-gray-600">Upload hotel images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Documents */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documents
            </label>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-gray-400" />
              <span className="text-sm">{formData.documents.license}</span>
              {isEditing && (
                <button className="text-sm text-amber-600 hover:text-amber-700">
                  <FiUpload className="inline mr-1" /> Replace
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HotelInfoForm;
