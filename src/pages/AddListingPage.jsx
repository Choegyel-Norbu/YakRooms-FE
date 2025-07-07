import React, { useState } from "react";
import {
  FiHome,
  FiCoffee,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUpload,
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiArrowLeft,
} from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt, FaBed } from "react-icons/fa";

import { FaHotel, FaUtensils } from "react-icons/fa";

const AddListingPage = () => {
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    district: "",
    village: "",
    address: "",
    email: "",
    phone: "",
    price: "",
    amenities: [],
    photos: [],
    license: null,
    idProof: null,
    notes: "",
    coordinates: { lat: "", lng: "" },
    numberOfRooms: "",
    roomTypesDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const listingTypes = [
    {
      id: "hotel",
      label: "Hotel",
      icon: <FaHotel className="text-2xl text-amber-600" />,
    },
    {
      id: "homestay",
      label: "Homestay",
      icon: <FiHome className="text-2xl text-amber-600" />,
    },
    {
      id: "restaurant",
      label: "Restaurant",
      icon: <FaUtensils className="text-2xl text-amber-600" />,
    },
    {
      id: "cafe",
      label: "Café",
      icon: <FiCoffee className="text-2xl text-amber-600" />,
    },
  ];

  const amenitiesOptions = {
    hotel: [
      "WiFi",
      "Parking",
      "Air Conditioning",
      "Room Service",
      "TV",
      "Heater",
      "Hot Water",
      "Mountain View",
    ],
    homestay: [
      "WiFi",
      "Parking",
      "Home-cooked Meals",
      "Hot Water",
      "Heater",
      "Garden",
      "Traditional Decor",
    ],
    restaurant: [
      "Bhutanese Cuisine",
      "Western Food",
      "Vegetarian Options",
      "Vegan Options",
      "Outdoor Seating",
      "Parking",
      "WiFi",
    ],
    cafe: [
      "WiFi",
      "Outdoor Seating",
      "Coffee & Tea",
      "Snacks & Pastries",
      "Parking",
    ],
  };

  const currentAmenities = amenitiesOptions[listingType] || [];
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

  const handleListingTypeChange = (typeId) => {
    setListingType(typeId);
    // Reset amenities when type changes to avoid carrying over irrelevant ones
    setFormData((prev) => ({
      ...prev,
      amenities: [],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, name]
          : prev.amenities.filter((item) => item !== name),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value,
      },
    }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Listing Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your {listingType} listing has been submitted for review. We'll
            notify you once it's approved.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setStep(1);
              setFormData({
                name: "",
                description: "",
                district: "",
                village: "",
                address: "",
                email: "",
                phone: "",
                price: "",
                amenities: [],
                photos: [],
                license: null,
                idProof: null,
                notes: "",
                coordinates: { lat: "", lng: "" },
                numberOfRooms: "",
                roomTypesDescription: "",
              });
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition"
          >
            Add Another Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-700 mb-2">
            Add Your Listing
          </h1>
          <p className="text-gray-600">
            Share your business with travelers in Bhutan
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? "bg-amber-500 text-white"
                    : "bg-white border-2 border-amber-500 text-amber-500"
                }`}
              >
                {step > stepNumber ? <FiCheck /> : stepNumber}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step >= stepNumber
                    ? "text-amber-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {stepNumber === 1 && "Type"}
                {stepNumber === 2 && "Details"}
                {stepNumber === 3 && "Verification"}
                {stepNumber === 4 && "Submit"}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-1">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${(step - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 md:p-8"
        >
          {/* Step 1: Listing Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                What type of listing are you adding?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listingTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleListingTypeChange(type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      listingType === type.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Business Information
              </h2>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Tell travelers about your business..."
                ></textarea>
              </div>

              {/* Hotel/Homestay specific fields */}
              {(listingType === "hotel" || listingType === "homestay") && (
                <div className="space-y-6 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-800">
                    Accommodation Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms *
                    </label>
                    <input
                      type="number"
                      name="numberOfRooms"
                      value={formData.numberOfRooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Types (Optional)
                    </label>
                    <textarea
                      name="roomTypesDescription"
                      value={formData.roomTypesDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Describe the types of rooms available (e.g., Standard Double, Deluxe Suite with view, Family Room)."
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                    Village/Town *
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Street address if available"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {listingType === "hotel" || listingType === "homestay"
                    ? "Price per night (Nu.) *"
                    : "Average meal price range (Nu.) *"}
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder={
                    listingType === "hotel" || listingType === "homestay"
                      ? "e.g. 1500"
                      : "e.g. 300-500"
                  }
                />
              </div>

              {/* Amenities */}
              {currentAmenities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          name={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onChange={handleChange}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`amenity-${amenity}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos *
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.photos.map((photo, index) => (
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
                  <FiUpload className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">Upload photos (5 max)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={formData.photos.length >= 5}
                  />
                </label>
                {formData.photos.length >= 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 5 photos reached
                  </p>
                )}
              </div>

              {/* Coordinates */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Coordinates (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={formData.coordinates.lat}
                      onChange={handleCoordinateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g. 27.4728"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={formData.coordinates.lng}
                      onChange={handleCoordinateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g. 89.6393"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  If you know your exact coordinates, adding them will help
                  travelers find you more easily.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Verification Documents
              </h2>
              <p className="text-gray-600 mb-6">
                To ensure the quality of our platform, we require verification
                documents. Your listing will be reviewed within 2-3 business
                days.
              </p>

              {/* Trade License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade License *
                </label>
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                  <FiUpload className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.license
                      ? formData.license.name
                      : "Upload trade license (PDF or image)"}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, "license")}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* ID Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Proof (Citizen ID or Passport) *
                </label>
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                  <FiUpload className="text-amber-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.idProof
                      ? formData.idProof.name
                      : "Upload ID proof (PDF or image)"}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, "idProof")}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Any additional information for our review team..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Review Your Listing
              </h2>

              <div className="space-y-6">
                {/* Listing Type */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Listing Type
                  </h3>
                  <p className="capitalize">{listingType}</p>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Business Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span> {formData.name}
                    </p>
                    <p>
                      <span className="font-medium">Description:</span>{" "}
                      {formData.description}
                    </p>
                    {(listingType === "hotel" ||
                      listingType === "homestay") && (
                      <>
                        <p>
                          <span className="font-medium">Number of Rooms:</span>{" "}
                          {formData.numberOfRooms}
                        </p>
                        {formData.roomTypesDescription && (
                          <p>
                            <span className="font-medium">Room Types:</span>{" "}
                            {formData.roomTypesDescription}
                          </p>
                        )}
                      </>
                    )}
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {formData.village}, {formData.district}
                    </p>
                    {formData.address && (
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {formData.address}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Contact:</span>{" "}
                      {formData.email}, {formData.phone}
                    </p>
                    <p>
                      <span className="font-medium">Pricing:</span>{" "}
                      {formData.price} Nu.
                    </p>
                    {formData.amenities.length > 0 && (
                      <p>
                        <span className="font-medium">Amenities:</span>{" "}
                        {formData.amenities.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Verification */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Verification
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Trade License:</span>{" "}
                      {formData.license?.name || "Not uploaded"}
                    </p>
                    <p>
                      <span className="font-medium">ID Proof:</span>{" "}
                      {formData.idProof?.name || "Not uploaded"}
                    </p>
                    {formData.notes && (
                      <p>
                        <span className="font-medium">Notes:</span>{" "}
                        {formData.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="pt-4 border-t">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 text-sm text-gray-700"
                    >
                      I confirm that all information provided is accurate and I
                      agree to YakRooms' Terms of Service and Privacy Policy.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <FiArrowLeft /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !listingType}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition ${
                  step === 1 && !listingType
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                Next <FiArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition ${
                  isSubmitting
                    ? "bg-amber-400 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;
