import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/Api.jsx";
import { uploadFile } from "../lib/uploadService.jsx";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

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

import { FaHotel, FaUtensils } from "react-icons/fa";
import { useAuth } from "../services/AuthProvider.jsx";

const AddListingPage = () => {
  const [step, setStep] = useState(1);
  const { email, userId } = useAuth();
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
    hotelType: "",
    coordinates: { lat: "", lng: "" },
    numberOfRooms: "",
    roomTypesDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [field]: {
        file: file,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      },
    }));

    // Clear error if file is uploaded
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 5) {
      setErrors((prev) => ({ ...prev, photos: "Maximum 5 photos allowed" }));
      return;
    }

    const newPhotos = files.map((file) => ({
      file: file,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));

    // Clear error if photos are uploaded
    if (errors.photos) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photos;
        return newErrors;
      });
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
    setFormData((prev) => ({
      ...prev,
      amenities: [],
    }));
    // Clear listing type error if selected
    if (errors.listingType) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.listingType;
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

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

  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && !listingType) {
      newErrors.listingType = "Please select a listing type";
    }

    if (step === 2) {
      if (!formData.name) newErrors.name = "Business name is required";
      if (!formData.description)
        newErrors.description = "Description is required";
      if (!formData.district) newErrors.district = "District is required";
      if (!formData.village) newErrors.village = "Village/Town is required";
      // if (!formData.email) newErrors.email = "Email is required";
      // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      //   newErrors.email = "Please enter a valid email";
      // }
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (formData.photos.length === 0)
        newErrors.photos = "At least one photo is required";
    }

    if (step === 3) {
      if (!formData.license) newErrors.license = "Trade license is required";
      if (!formData.idProof) newErrors.idProof = "ID proof is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const submitFinalListing = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      const uploadPromises = [];

      if (formData.photos.length > 0) {
        formData.photos.forEach((photo) => {
          uploadPromises.push(uploadFile(photo.file, "photos"));
        });
      }

      if (formData.license?.file) {
        uploadPromises.push(uploadFile(formData.license.file, "license"));
      }

      if (formData.idProof?.file) {
        uploadPromises.push(uploadFile(formData.idProof.file, "idProof"));
      }

      const uploadResults = await Promise.all(uploadPromises);
      const updatedFormData = { ...formData, email: `${email}}` };

      uploadResults.forEach((result) => {
        if (result.field === "photos") {
          if (!updatedFormData.photoUrls) updatedFormData.photoUrls = [];
          updatedFormData.photoUrls.push(result.url);
        } else if (result.field === "license") {
          updatedFormData.licenseUrl = result.url;
        } else if (result.field === "idProof") {
          updatedFormData.idProofUrl = result.url;
        }
      });

      console.log("User ID: " + userId);
      const res = await api.post(`/hotels/${userId}`, updatedFormData);

      if (res.status === 200) {
        toast.success("Hotel Verified", {
          description: "The hotel has been successfully verified.",
          icon: <CheckCircle className="text-green-600" />,
        });
        localStorage.setItem("hotelId", res.data.id.toString());
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (isSubmitted) {
      const timeout = setTimeout(() => {
        setIsSubmitted(false);
        navigate("/");
      }, 3000);

      return () => clearTimeout(timeout); // cleanup if component unmounts early
    }
  }, [isSubmitted, navigate]);

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
                amenities: [],
                photos: [],
                license: null,
                idProof: null,
                notes: "",
                coordinates: { lat: "", lng: "" },
                numberOfRooms: "",
                roomTypesDescription: "",
              });
              setErrors({});
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-700 mb-2">
            Add Your Listing
          </h1>
          <p className="text-gray-600">
            Share your business with travelers in Bhutan
          </p>
        </div>

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

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="bg-white rounded-xl shadow-md p-6 md:p-8"
        >
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                What type of listing are you adding?
              </h2>
              {errors.listingType && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.listingType}
                </p>
              )}
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

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Business Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.district ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village/Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.village ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                  />
                  {errors.village && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.village}
                    </p>
                  )}
                </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    />
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="hotelType"
                      value={formData.hotelType}
                      onChange={handleChange}
                      required
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
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
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
                {errors.photos && (
                  <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
                )}
                {formData.photos.length >= 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 5 photos reached
                  </p>
                )}
              </div>

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
              </div>
            </div>
          )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade License <span className="text-red-500">*</span>
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
                  />
                </label>
                {errors.license && (
                  <p className="text-red-500 text-sm mt-1">{errors.license}</p>
                )}
                {formData.license && (
                  <div className="mt-4">
                    {formData.license.type === "application/pdf" ? (
                      <iframe
                        src={formData.license.url}
                        title="PDF Preview"
                        className="w-full h-64 border rounded-md"
                      ></iframe>
                    ) : (
                      <img
                        src={formData.license.url}
                        alt="Preview"
                        className="w-full max-w-xs mt-2 rounded-md shadow-md"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Proof (Citizen ID or Passport){" "}
                  <span className="text-red-500">*</span>
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
                  />
                </label>
                {errors.idProof && (
                  <p className="text-red-500 text-sm mt-1">{errors.idProof}</p>
                )}
                {formData.idProof && (
                  <div className="mt-4">
                    {formData.idProof.type === "application/pdf" ? (
                      <iframe
                        src={formData.idProof.url}
                        title="ID Proof Preview"
                        className="w-full h-64 border rounded-md"
                      ></iframe>
                    ) : (
                      <img
                        src={formData.idProof.url}
                        alt="ID Proof Preview"
                        className="w-full max-w-xs mt-2 rounded-md shadow-md"
                      />
                    )}
                  </div>
                )}
              </div>

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
                ></textarea>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b border-gray-200">
                    Review Your Listing
                  </h2>

                  <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    {/* Listing Type */}
                    <div className="pb-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Listing Type
                      </h3>
                      <p className="capitalize text-gray-600 bg-gray-50 px-3 py-2 rounded-md inline-block">
                        {listingType}
                      </p>
                    </div>

                    {/* Business Info */}
                    <div className="pb-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Name:
                            </span>
                            <span className="block mt-1 text-gray-600">
                              {formData.name}
                            </span>
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Description:
                            </span>
                            <span className="block mt-1 text-gray-600">
                              {formData.description}
                            </span>
                          </p>
                          {(listingType === "hotel" ||
                            listingType === "homestay") && (
                            <>
                              <p className="text-gray-700">
                                {/* <span className="font-medium text-gray-800">
                              Rooms:
                            </span> */}
                                <span className="block mt-1 text-gray-600">
                                  {formData.numberOfRooms}
                                </span>
                              </p>
                              {formData.roomTypesDescription && (
                                <p className="text-gray-700">
                                  <span className="font-medium text-gray-800">
                                    Room Types:
                                  </span>
                                  <span className="block mt-1 text-gray-600">
                                    {formData.roomTypesDescription}
                                  </span>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Location:
                            </span>
                            <span className="block mt-1 text-gray-600">
                              {formData.village}, {formData.district}
                            </span>
                          </p>
                          {formData.address && (
                            <p className="text-gray-700">
                              <span className="font-medium text-gray-800">
                                Address:
                              </span>
                              <span className="block mt-1 text-gray-600">
                                {formData.address}
                              </span>
                            </p>
                          )}
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Contact:
                            </span>
                            <span className="block mt-1 text-gray-600">
                              {email}
                            </span>
                            <span className="block text-gray-600">
                              {formData.phone}
                            </span>
                          </p>
                          {formData.amenities.length > 0 && (
                            <p className="text-gray-700">
                              <span className="font-medium text-gray-800">
                                Amenities:
                              </span>
                              <span className="block mt-1 text-gray-600">
                                {formData.amenities.join(", ")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification */}
                    <div className="pb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Verification Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Trade License:
                            </span>
                            <span
                              className={`block mt-1 ${
                                formData.license?.name
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {formData.license?.name || "Not uploaded"}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              ID Proof:
                            </span>
                            <span
                              className={`block mt-1 ${
                                formData.idProof?.name
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {formData.idProof?.name || "Not uploaded"}
                            </span>
                          </p>
                        </div>
                      </div>
                      {formData.notes && (
                        <div className="mt-4">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-800">
                              Additional Notes:
                            </span>
                            <span className="block mt-1 text-gray-600">
                              {formData.notes}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    {/* <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="terms"
                          className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-0.5"
                        />
                        <label
                          htmlFor="terms"
                          className="ml-3 text-sm text-gray-700"
                        >
                          I confirm that all information provided is accurate
                          and I agree to
                          <span className="text-amber-600 hover:text-amber-700">
                            {" "}
                            YakRooms' Terms of Service
                          </span>{" "}
                          and
                          <span className="text-amber-600 hover:text-amber-700">
                            {" "}
                            Privacy Policy
                          </span>
                          .
                        </label>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <Link
                to="/"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
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
                onClick={submitFinalListing}
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
