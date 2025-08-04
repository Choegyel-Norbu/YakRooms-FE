import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/Api.jsx";
import { uploadFile } from "../lib/uploadService.jsx";
import { toast } from "sonner";
import { 
  CheckCircle, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Hotel,
  Utensils,
  FileText,
  Camera,
  Shield,
  Navigation,
  Loader2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../services/AuthProvider.jsx";
import { getAmenitiesForType, getCategorizedAmenities } from "../utils/amenitiesHelper.js";

const AddListingPage = () => {
  const [step, setStep] = useState(1);
  const { email, userId, setHotelId, setRoles } = useAuth();
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
    latitude: "",
    longitude: "",
    numberOfRooms: "",
    roomTypesDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Geolocation state
  const [locationState, setLocationState] = useState({
    isGettingLocation: false,
    locationError: null,
    locationSuccess: false
  });
  
  const navigate = useNavigate();

  const listingTypes = [
    {
      id: "hotel",
      label: "Hotel",
      icon: Hotel,
      description: "Full-service accommodation with professional amenities"
    },
    // {
    //   id: "homestay",
    //   label: "Homestay",
    //   icon: Home,
    //   description: "Authentic family-run accommodation experience"
    // },
    {
      id: "restaurant",
      label: "Restaurant",
      icon: Utensils,
      description: "Full dining establishment with complete menu"
    },
    // {
    //   id: "cafe",
    //   label: "Café",
    //   icon: Coffee,
    //   description: "Casual dining spot for coffee, tea, and light meals"
    // },
  ];

  // Get amenities from JSON file based on listing type
  const currentAmenities = getAmenitiesForType(listingType);
  const categorizedAmenities = getCategorizedAmenities(listingType);

  /**
   * Handle getting user's current location using Geolocation API
   */
  const getCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationState({
        isGettingLocation: false,
        locationError: "Geolocation is not supported by this browser.",
        locationSuccess: false
      });
      return;
    }

    // Start loading state
    setLocationState({
      isGettingLocation: true,
      locationError: null,
      locationSuccess: false
    });

    // First try with high accuracy but shorter timeout
    const tryGetLocation = (useHighAccuracy = true, timeout = 15000) => {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`Location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          // Update form data with coordinates
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6), // Limit to 6 decimal places
            longitude: longitude.toFixed(6)
          }));

          // Update location state
          setLocationState({
            isGettingLocation: false,
            locationError: null,
            locationSuccess: true
          });

          // Clear success message after 3 seconds
          setTimeout(() => {
            setLocationState(prev => ({
              ...prev,
              locationSuccess: false
            }));
          }, 3000);
        },
        // Error callback
        (error) => {
          console.log(`Geolocation error: ${error.code} - ${error.message}`);
          
          // If high accuracy failed due to timeout, try with lower accuracy
          if (error.code === error.TIMEOUT && useHighAccuracy) {
            console.log("High accuracy timed out, trying with lower accuracy...");
            setLocationState(prev => ({
              ...prev,
              locationError: "High accuracy location timed out, trying approximate location..."
            }));
            
            // Retry with lower accuracy and longer timeout
            setTimeout(() => tryGetLocation(false, 30000), 1000);
            return;
          }
          
          let errorMessage = "Failed to get location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions in your browser settings and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please check your internet connection and GPS settings.";
              break;
            case error.TIMEOUT:
              errorMessage = `Location request timed out after ${timeout/1000} seconds. Please ensure you have a stable internet connection and GPS is enabled.`;
              break;
            default:
              errorMessage = `An unknown error occurred while getting location (Code: ${error.code}).`;
              break;
          }

          setLocationState({
            isGettingLocation: false,
            locationError: errorMessage,
            locationSuccess: false
          });
        },
        // Options
        {
          enableHighAccuracy: useHighAccuracy,
          timeout: timeout,
          maximumAge: useHighAccuracy ? 60000 : 600000 // Use fresher cache for high accuracy
        }
      );
    };

    // Start the location request
    tryGetLocation();
  };

  /**
   * Check if coordinates are valid
   */
  const areCoordinatesValid = () => {
    const { latitude, longitude } = formData;
    return latitude && longitude && !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
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

  const stepInfo = [
    { title: "Choose Type", description: "Select your business type", icon: Hotel },
    { title: "Business Details", description: "Tell us about your business", icon: FileText },
    { title: "Verification", description: "Upload required documents", icon: Shield },
    { title: "Review & Submit", description: "Final review before submission", icon: Check }
  ];

  const handleListingTypeChange = (typeId) => {
    setListingType(typeId);
    setFormData((prev) => ({
      ...prev,
      amenities: [],
    }));
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
      [name]: value,
    }));

    // Clear location messages when manually editing
    if (locationState.locationError || locationState.locationSuccess) {
      setLocationState({
        isGettingLocation: false,
        locationError: null,
        locationSuccess: false
      });
    }
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
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (formData.photos.length === 0)
        newErrors.photos = "At least one photo is required";
      if (listingType === "hotel" && !formData.hotelType) 
        newErrors.hotelType = "Hotel type is required";
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
        setHotelId(res.data.id);
        setRoles(['GUEST', 'HOTEL_ADMIN']);
        toast.success("Hotel submitted for verification", {
          description: "Your hotel listing has been submitted successfully and will be verified shortly before going live on YakRooms!",
        });
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

      return () => clearTimeout(timeout);
    }
  }, [isSubmitted, navigate]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600 h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Listing Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your {listingType} listing has been submitted for review. We'll
              notify you once it's approved.
            </p>
            <Button
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
                  latitude: "",
                  longitude: "",
                  numberOfRooms: "",
                  roomTypesDescription: "",
                });
                setErrors({});
              }}
              className="w-full"
            >
              Add Another Listing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2 font-sans">
            Add Your Listing
          </h1>
          <p className="text-muted-foreground text-sm font-sans">
            Share your business with travelers in Bhutan
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepInfo.map((info, index) => {
              const StepIcon = info.icon;
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              
              return (
                <div key={stepNumber} className="flex-1 flex flex-col items-center">
                  <div className={`
                    w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-200 mb-2
                    ${isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? <Check className="h-4 w-4 lg:h-5 lg:w-5" /> : <StepIcon className="h-4 w-4 lg:h-5 lg:w-5" />}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs lg:text-sm font-medium font-sans ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {info.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block font-sans">
                      {info.description}
                    </div>
                  </div>
                  {index < stepInfo.length - 1 && (
                    <div className={`
                      hidden md:block absolute w-full h-0.5 top-6 left-1/2 -z-10
                      ${step > stepNumber ? 'bg-primary' : 'bg-border'}
                    `} style={{ width: `${100 / stepInfo.length}%` }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full bg-border h-1 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        {/* <Card> */}
          <CardContent className="p-0 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
                    What type of listing are you adding?
                  </h2>
                  <p className="text-muted-foreground text-sm font-sans">
                    Choose the category that best describes your business
                  </p>
                </div>
                
                {errors.listingType && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    {errors.listingType}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listingTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          listingType === type.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleListingTypeChange(type.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`
                              p-3 rounded-lg 
                              ${listingType === type.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                              }
                            `}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">
                                {type.label}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
                    Business Information
                  </h2>
                  <p className="text-muted-foreground text-sm font-sans">
                    Provide details about your {listingType}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-destructive text-sm">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="district">
                      District <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, district: value }));
                        if (errors.district) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.district;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={errors.district ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-destructive text-sm">{errors.district}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">
                      Village/Town <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="village"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      className={errors.village ? "border-destructive" : ""}
                    />
                    {errors.village && (
                      <p className="text-destructive text-sm">{errors.village}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location Coordinates Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    
                    {/* Use Current Location Button */}
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationState.isGettingLocation}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {locationState.isGettingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Navigation className="text-sm h-4 w-4" />
                          Use Current Location
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Location Status Messages */}
                  {locationState.locationError && (
                    <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>{locationState.locationError}</p>
                          <div className="text-xs text-destructive/80">
                            <p><strong>Troubleshooting tips:</strong></p>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              <li>Make sure location/GPS is enabled on your device</li>
                              <li>Check that your browser has location permissions</li>
                              <li>Try refreshing the page and allowing location access</li>
                              <li>If indoors, try moving closer to a window</li>
                              <li>On mobile, ensure location services are enabled</li>
                            </ul>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {locationState.locationSuccess && (
                    <Alert className="border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Location captured successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Coordinate Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">
                        Latitude
                        <span className="text-muted-foreground text-xs ml-1">(Auto-filled)</span>
                      </Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleCoordinateChange}
                        placeholder="e.g., 27.4728"
                        className={formData.latitude ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">
                        Longitude
                        <span className="text-muted-foreground text-xs ml-1">(Auto-filled)</span>
                      </Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleCoordinateChange}
                        placeholder="e.g., 89.6386"
                        className={formData.longitude ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}
                      />
                    </div>
                  </div>

                  {/* Coordinates Display */}
                  {areCoordinatesValid() && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="text-primary font-medium">Location Coordinates:</p>
                          <p className="text-muted-foreground">
                            {formData.latitude}, {formData.longitude}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {listingType === "hotel" && (
                  <div className="space-y-2">
                    <Label htmlFor="hotelType">
                      Hotel Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.hotelType}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, hotelType: value }));
                        if (errors.hotelType) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.hotelType;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={errors.hotelType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select Hotel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONE_STAR">One Star</SelectItem>
                        <SelectItem value="TWO_STAR">Two Star</SelectItem>
                        <SelectItem value="THREE_STAR">Three Star</SelectItem>
                        <SelectItem value="FOUR_STAR">Four Star</SelectItem>
                        <SelectItem value="FIVE_STAR">Five Star</SelectItem>
                        <SelectItem value="BUDGET">Budget</SelectItem>
                        <SelectItem value="BOUTIQUE">Boutique</SelectItem>
                        <SelectItem value="RESORT">Resort</SelectItem>
                        <SelectItem value="HOMESTAY">Homestay</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.hotelType && (
                      <p className="text-destructive text-sm">{errors.hotelType}</p>
                    )}
                  </div>
                )}

                {currentAmenities.length > 0 && (
                  <div className="space-y-4">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentAmenities.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: [...prev.amenities, amenity]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: prev.amenities.filter(item => item !== amenity)
                                }));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm font-normal"
                          >
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>
                    Photos <span className="text-destructive">*</span>
                  </Label>
                  
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removePhoto(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <Label 
                        htmlFor="photos" 
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground text-center">
                          Upload photos (Maximum 5)
                        </span>
                        <Input
                          id="photos"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={formData.photos.length >= 5}
                        />
                      </Label>
                    </CardContent>
                  </Card>
                  
                  {errors.photos && (
                    <p className="text-destructive text-sm">{errors.photos}</p>
                  )}
                  {formData.photos.length >= 5 && (
                    <p className="text-muted-foreground text-xs">
                      Maximum 5 photos reached
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
                    Verification Documents
                  </h2>
                  <p className="text-muted-foreground text-sm font-sans">
                    Upload required documents for verification. Your listing will be reviewed within 2-3 business days.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>
                      Trade License <span className="text-destructive">*</span>
                    </Label>
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <Label 
                          htmlFor="license" 
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center">
                            {formData.license
                              ? formData.license.name
                              : "Upload trade license (PDF or image)"}
                          </span>
                          <Input
                            id="license"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "license")}
                            className="hidden"
                          />
                        </Label>
                      </CardContent>
                    </Card>
                    {errors.license && (
                      <p className="text-destructive text-sm">{errors.license}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>
                      ID Proof (Citizen ID or Passport) <span className="text-destructive">*</span>
                    </Label>
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <Label 
                          htmlFor="idProof" 
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center">
                            {formData.idProof
                              ? formData.idProof.name
                              : "Upload ID proof (PDF or image)"}
                          </span>
                          <Input
                            id="idProof"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "idProof")}
                            className="hidden"
                          />
                        </Label>
                      </CardContent>
                    </Card>
                    {errors.idProof && (
                      <p className="text-destructive text-sm">{errors.idProof}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any additional information about your business..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
                    Review Your Listing
                  </h2>
                  <p className="text-muted-foreground text-sm font-sans">
                    Please review all information before submitting
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Listing Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hotel className="h-5 w-5 text-primary" />
                        Listing Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {listingType.charAt(0).toUpperCase() + listingType.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Business Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-muted-foreground">Business Name</Label>
                            <p className="font-bold text-sm lg:text-base">{formData.name}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Location</Label>
                            <p className="font-bold text-sm lg:text-base">{formData.village}, {formData.district}</p>
                          </div>
                          {formData.address && (
                            <div>
                              <Label className="text-muted-foreground">Address</Label>
                              <p className="font-bold text-sm lg:text-base">{formData.address}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-muted-foreground">Contact</Label>
                            <p className="font-bold text-sm lg:text-base">{email}</p>
                            <p className="font-bold text-sm lg:text-base">{formData.phone}</p>
                          </div>
                          {formData.hotelType && (
                            <div>
                              <Label className="text-muted-foreground">Hotel Type</Label>
                              <p className="font-bold text-sm lg:text-base">{formData.hotelType.replace('_', ' ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-bold text-sm lg:text-base">{formData.description}</p>
                      </div>

                      {/* Location Coordinates in Review */}
                      {areCoordinatesValid() && (
                        <div>
                          <Label className="text-muted-foreground">Location Coordinates</Label>
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-primary mt-0.5" />
                              <div className="text-sm">
                                <p className="text-primary font-medium">GPS Coordinates:</p>
                                <p className="text-muted-foreground">
                                  Latitude: {formData.latitude}
                                </p>
                                <p className="text-muted-foreground">
                                  Longitude: {formData.longitude}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.amenities.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground">Amenities</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.photos.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground">Photos ({formData.photos.length})</Label>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                            {formData.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Verification Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Verification Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Trade License</Label>
                          <p className="font-bold text-sm lg:text-base">
                            {formData.license?.name || "Not uploaded"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">ID Proof</Label>
                          <p className="font-bold text-sm lg:text-base">
                            {formData.idProof?.name || "Not uploaded"}
                          </p>
                        </div>
                      </div>
                      
                      {formData.notes && (
                        <div>
                          <Label className="text-muted-foreground">Additional Notes</Label>
                          <p className="font-bold text-sm lg:text-base">{formData.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 border-t bg-muted/30">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/">Cancel</Link>
              </Button>
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !listingType}
                className="flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={submitFinalListing}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Listing
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        {/* </Card> */}
      </div>
    </div>
  );
};

export default AddListingPage;