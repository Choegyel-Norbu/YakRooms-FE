// HotelInfoForm.jsx
import React, { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiUpload, FiSave } from "react-icons/fi";
import { useAuth } from "../../services/AuthProvider";
import api from "../../services/Api";
import { uploadFile } from "../../lib/uploadService.jsx";
import { CheckCircle, XCircle } from "lucide-react";

const HotelInfoForm = ({ hotel, onUpdate }) => {
  const { email } = useAuth();
  const [formData, setFormData] = useState(hotel);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyAlert, setVerifyAlert] = useState(false);
  const [updated, setUpdated] = useState(false);
  const districts = [
    "Thimphu",
    "Paro",
    "Punakha",
    "Wangdue",
    "Bumthang",
    "Trongsa",
    "Gasa",
    "Haa",
    "Samtse",
    "Chukha",
    "Dagana",
    "Tsirang",
    "Sarpang",
    "Zhemgang",
    "Trashigang",
    "Mongar",
    "Pemagatshel",
    "Lhuentse",
    "Samdrup Jongkhar",
    "Trashiyangtse",
  ];

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
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsLoading(true);
    setError(null);

    try {
      // Upload each file and get the URLs
      const uploadPromises = files.map((file) => uploadFile(file, "photos"));

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map((result) => result.url);

      setFormData({
        ...formData,
        photoUrls: [...formData.photoUrls, ...newImageUrls],
      });
    } catch (err) {
      setError("Failed to upload images. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      photoUrls: formData.photoUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        ...formData,
        contact: formData.phone,
      };
      console.log("Form data: " + formData.id);
      const res = await api.put(`/hotels/${formData.id}`, updateData);
      if (res.status === 200) {
        setUpdated(true);
        setVerifyAlert(true);
        setTimeout(() => {
          setVerifyAlert(false);
        }, 3000);
      }
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update hotel information. Please try again.");
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {verifyAlert && (
        <>
          {updated ? (
            <div className="w-full bg-green-100 border border-green-300 text-green-800 p-4 rounded-md flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-medium">
                Hotel details have been updated successfully.
              </p>
            </div>
          ) : (
            <div className="w-full bg-red-100 border border-red-300 text-red-800 p-4 rounded-md flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="font-medium">
                Something went wrong. Please try again later.
              </p>
            </div>
          )}
        </>
      )}
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
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-70"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <FiSave size={14} /> Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name
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
              Hotel Type
            </label>
            <select
              name="hotelType"
              value={formData.hotelType}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select Hotel Type</option>
              <option value="ONE_STAR">One Star</option>
              <option value="TWO_STAR">Two Star</option>
              <option value="THREE_STAR">Three Star</option>
              <option value="FOUR_STAR">Four Star</option>
              <option value="FIVE_STAR">Five Star</option>
              <option value="BUDGET">Budget</option>
              <option value="BOUTIQUE">Boutique</option>
              <option value="RESORT">Resort</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
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
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleContactChange}
                    required
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                  <FiPhone className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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
              {formData.photoUrls?.map((image, index) => (
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
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                {isLoading ? (
                  <div className="text-amber-500">Uploading images...</div>
                ) : (
                  <>
                    <FiUpload className="text-amber-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-600">Upload hotel images</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </>
                )}
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
              <span className="text-sm">{formData.license}</span>
              {isEditing && (
                <button
                  className="text-sm text-amber-600 hover:text-amber-700"
                  disabled={isLoading}
                >
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
