import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../../shared/services/Api";
import { uploadFile } from "../../shared/services/uploadService";
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
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/ios-spinner";

import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";
import { Badge } from "@/shared/components/badge";
import { Checkbox } from "@/shared/components/checkbox";
import { Alert, AlertDescription } from "@/shared/components/alert";
import { TimePicker } from "@/shared/components/TimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { useAuth } from "../authentication";
import { getAmenitiesForType, getCategorizedAmenities } from "../../shared/utils/amenitiesHelper";
import { districts, getLocalitiesForDistrict, getBankOptions, validateBankAccountNumber, getMaxAccountNumberLength } from "../../shared/constants";
import { setStorageItem } from "../../shared/utils/safariLocalStorage";

const AddListingPage = () => {
  const [step, setStep] = useState(1);
  const {
    email,
    userId,
    setHotelId,
    setSelectedHotelId,
    setRoles,
  } = useAuth();
  const [listingType, setListingType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    district: "",
    locality: "",
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
    cid: "",
    destination: "",
    origin: "",
    checkinTime: "",
    checkoutTime: "",
    cancellationPolicy: "",
    hasTimeBased: false,
    // Bank Account Information
    accountNumber: "",
    accountHolderName: "",
    bankType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [policySelectionType, setPolicySelectionType] = useState(""); // "predefined" or "custom"
  
  // Geolocation state
  const [locationState, setLocationState] = useState({
    isGettingLocation: false,
    locationError: null,
    locationSuccess: false
  });
  
  const navigate = useNavigate();

  // Predefined cancellation policy options
  const cancellationPolicyOptions = [
    {
      id: "free_24h",
      label: "Free cancellation up to 24 hours",
      description: "Guests can cancel free of charge up to 24 hours before check-in. No refund for cancellations within 24 hours.",
      refundBreakdown: [
        { timeframe: "24+ hours before check-in", refund: "100%" },
        { timeframe: "Within 24 hours", refund: "0%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "free_48h",
      label: "Free cancellation up to 48 hours", 
      description: "Guests can cancel free of charge up to 48 hours before check-in. No refund for cancellations within 48 hours.",
      refundBreakdown: [
        { timeframe: "48+ hours before check-in", refund: "100%" },
        { timeframe: "Within 48 hours", refund: "0%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "free_7days",
      label: "Free cancellation up to 7 days",
      description: "Guests can cancel free of charge up to 7 days before check-in. No refund for cancellations within 7 days.",
      refundBreakdown: [
        { timeframe: "7+ days before check-in", refund: "100%" },
        { timeframe: "Within 7 days", refund: "0%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "partial_24h",
      label: "Partial refund within 24 hours",
      description: "Free cancellation up to 24 hours before check-in. 50% refund for cancellations within 24 hours. No refund for no-shows.",
      refundBreakdown: [
        { timeframe: "24+ hours before check-in", refund: "100%" },
        { timeframe: "Within 24 hours", refund: "50%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "partial_48h", 
      label: "Partial refund within 48 hours",
      description: "Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours. No refund for no-shows.",
      refundBreakdown: [
        { timeframe: "48+ hours before check-in", refund: "100%" },
        { timeframe: "Within 48 hours", refund: "50%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "graduated_refund",
      label: "Graduated refund policy",
      description: "Progressive refund structure: 100% refund 7+ days, 75% refund 3-7 days, 50% refund 1-3 days, 25% refund within 24 hours, 0% for no-shows.",
      refundBreakdown: [
        { timeframe: "7+ days before check-in", refund: "100%" },
        { timeframe: "3-7 days before check-in", refund: "75%" },
        { timeframe: "1-3 days before check-in", refund: "50%" },
        { timeframe: "Within 24 hours", refund: "25%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "strict_no_refund",
      label: "Strict - No refund policy",
      description: "No refunds for any cancellations or no-shows. Full payment required regardless of cancellation timing.",
      refundBreakdown: [
        { timeframe: "Any time before check-in", refund: "0%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    },
    {
      id: "seasonal_policy",
      label: "Seasonal policy",
      description: "Free cancellation up to 7 days before check-in during off-season. No refunds during peak season (Dec-Mar, Jun-Aug).",
      refundBreakdown: [
        { timeframe: "Off-season: 7+ days before check-in", refund: "100%" },
        { timeframe: "Off-season: Within 7 days", refund: "0%" },
        { timeframe: "Peak season: Any time", refund: "0%" },
        { timeframe: "No-show", refund: "0%" }
      ]
    }
  ];

  const listingTypes = [
    {
      id: "hotel",
      label: "Hotel",
      icon: Hotel,
      description: "Premium hospitality experiences with curated amenities and personalized guest services"
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
      description: "Full dining establishment with complete menu",
      disabled: true
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
          // If high accuracy failed due to timeout, try with lower accuracy
          if (error.code === error.TIMEOUT && useHighAccuracy) {
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

    // Validate file size (4MB limit per file)
    const maxFileSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxFileSize) {
      setErrors((prev) => ({ 
        ...prev, 
        [field]: `File size too large: ${file.name}. File must be smaller than 4MB. Please compress your file and try again.`
      }));
      return;
    }

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

    // Validate file sizes (4MB limit per file)
    const maxFileSize = 4 * 1024 * 1024; // 4MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(file => file.name).join(', ');
      setErrors((prev) => ({ 
        ...prev, 
        photos: `File size too large: ${fileNames}. Each image must be smaller than 4MB. Please compress your images and try again.`
      }));
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
      // Special handling for accountNumber to enforce digits-only and max length per bank
      if (name === "accountNumber") {
        const bankCode = formData.bankType;
        const maxLen = getMaxAccountNumberLength(bankCode) || 20;
        const digitsOnly = (value || "").replace(/\D/g, "").slice(0, maxLen);
        setFormData((prev) => ({
          ...prev,
          accountNumber: digitsOnly,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
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

  const getValidationErrors = () => {
    const newErrors = {};

    if (step === 1 && !listingType) {
      newErrors.listingType = "Please select a listing type";
    }

    if (step === 2) {
      if (!formData.name) newErrors.name = "Business name is required";
      if (!formData.description)
        newErrors.description = "Description is required";
      if (!formData.district) newErrors.district = "District is required";
      if (!formData.locality) newErrors.locality = "Locality/Town is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (formData.photos.length === 0)
        newErrors.photos = "At least one photo is required";
      if (listingType === "hotel") {
        if (!formData.hotelType) newErrors.hotelType = "Hotel type is required";
        if (!formData.checkinTime) newErrors.checkinTime = "Check-in time is required";
        if (!formData.checkoutTime) newErrors.checkoutTime = "Check-out time is required";
        if (!policySelectionType) {
          newErrors.cancellationPolicy = "Please choose how you want to set your cancellation policy";
        } else if (!formData.cancellationPolicy) {
          newErrors.cancellationPolicy = policySelectionType === "predefined" 
            ? "Please select a cancellation policy" 
            : "Please write your cancellation policy";
        }
      }
      
      // Bank Information Validations (bank-specific)
      if (!formData.bankType) {
        newErrors.bankType = "Bank type is required";
      }
      if (!formData.accountHolderName) {
        newErrors.accountHolderName = "Account holder name is required";
      } else if (formData.accountHolderName.trim().length < 2) {
        newErrors.accountHolderName = "Account holder name must be at least 2 characters";
      } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.accountHolderName.trim())) {
        newErrors.accountHolderName = "Account holder name can only contain letters, spaces, hyphens, apostrophes, and periods";
      }
      if (!formData.accountNumber) {
        newErrors.accountNumber = "Account number is required";
      } else if (!/^\d+$/.test(formData.accountNumber.trim())) {
        newErrors.accountNumber = "Account number must contain only numbers";
      } else if (formData.bankType) {
        const result = validateBankAccountNumber(formData.accountNumber.trim(), formData.bankType);
        if (!result.isValid) {
          newErrors.accountNumber = result.error;
        }
      }
    }

    if (step === 3) {
      if (!formData.license) newErrors.license = "Trade license is required";
      if (!formData.idProof) newErrors.idProof = "ID proof is required";
    }

    return newErrors;
  };

  const validateStep = () => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const validationErrors = getValidationErrors();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      // Wait a bit for state to update and DOM to render error messages before scrolling
      setTimeout(() => {
        scrollToFirstError(validationErrors);
      }, 150);
      return;
    }
    
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const scrollToFirstError = (errorFields) => {
    // Find the first field with an error
    if (!errorFields || Object.keys(errorFields).length === 0) return;

    const firstErrorField = Object.keys(errorFields)[0];
    let elementToScroll = null;

    // Try to find the input element by ID or name first
    elementToScroll = document.getElementById(firstErrorField) || 
                     document.querySelector(`[name="${firstErrorField}"]`) ||
                     document.querySelector(`input[id="${firstErrorField}"]`) ||
                     document.querySelector(`select[id="${firstErrorField}"]`);

    // For Select components or wrapped inputs, try to find by label
    if (!elementToScroll) {
      const labelElement = document.querySelector(`label[for="${firstErrorField}"]`);
      if (labelElement) {
        // Find the parent container that holds the input/select
        const parentContainer = labelElement.closest('.space-y-2');
        if (parentContainer) {
          // Try to find any input, select, textarea, or button (for Select triggers)
          elementToScroll = parentContainer.querySelector('input, select, textarea, button[role="combobox"]');
          
          // If still not found, look for SelectTrigger button specifically
          if (!elementToScroll) {
            const selectContent = parentContainer.querySelector('[data-radix-collection-item]')?.closest('div');
            if (selectContent) {
              const selectTrigger = selectContent.parentElement?.querySelector('button');
              if (selectTrigger) elementToScroll = selectTrigger;
            }
          }
        }
      }
    }

    // If found, scroll to it
    if (elementToScroll) {
      elementToScroll.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Focus the element after scrolling
      setTimeout(() => {
        if (elementToScroll.tagName === 'BUTTON') {
          // For Select components, focus/click to show the validation state
          elementToScroll.focus();
          // Small delay to ensure the error styling is visible
          setTimeout(() => {
            if (elementToScroll.getAttribute('aria-expanded') === 'false') {
              // Optionally open the select to show the error state (but this might be annoying)
              // elementToScroll.click();
            }
          }, 100);
        } else {
          elementToScroll.focus();
          // Try to focus the actual input if it's inside a wrapper
          if (elementToScroll.tagName !== 'INPUT' && elementToScroll.tagName !== 'SELECT' && elementToScroll.tagName !== 'TEXTAREA') {
            const innerInput = elementToScroll.querySelector('input, select, textarea');
            if (innerInput) {
              innerInput.focus();
            }
          }
        }
      }, 300);
    } else {
      // Fallback: scroll to the label's container if input not found
      const labelElement = document.querySelector(`label[for="${firstErrorField}"]`);
      if (labelElement) {
        const container = labelElement.closest('.space-y-2') || labelElement.parentElement;
        if (container) {
          container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    }
  };

  const submitFinalListing = async (e) => {
    e.preventDefault();

    // Get validation errors
    const validationErrors = getValidationErrors();
    
    // Set errors and scroll if validation failed
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // Wait a bit for state to update and DOM to render error messages before scrolling
      setTimeout(() => {
        scrollToFirstError(validationErrors);
      }, 150);
      return;
    }

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
      const updatedFormData = { ...formData, email: `${email}` };

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

      const res = await api.post(`/hotels/${userId}`, updatedFormData);

      if (res.status === 200) {
        const newHotelId = res.data.id;
        setHotelId(newHotelId);
        setSelectedHotelId(newHotelId); // Also set as selected hotel
        setRoles(['GUEST', 'HOTEL_ADMIN']);

        // Set hotelIds array for the new hotel (first hotel for this user)
        setStorageItem('hotelIds', JSON.stringify([newHotelId]));

        // Store the new hotel ID for subscription page
        sessionStorage.setItem('newHotelId', newHotelId.toString());
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

        // Always redirect to subscription page for new hotel listings
        // This ensures users set up their subscription before accessing the dashboard
        navigate("/subscription");
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
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner size="sm" />
              <span>Redirecting...</span>
            </div>
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
          <h1 className="text-xl font-semibold text-foreground mb-2 font-sans">
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
                    const isDisabled = type.disabled;
                    return (
                      <Card
                        key={type.id}
                        className={`transition-all ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed bg-muted/50"
                            : `cursor-pointer hover:shadow-md ${
                                listingType === type.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`
                        }`}
                        onClick={() => !isDisabled && handleListingTypeChange(type.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`
                              p-3 rounded-lg 
                              ${isDisabled 
                                ? 'bg-muted/50 text-muted-foreground/50'
                                : listingType === type.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className={`font-semibold mb-1 ${
                                isDisabled ? 'text-muted-foreground/50' : 'text-foreground'
                              }`}>
                                {type.label}
                                {isDisabled && (
                                  <span className="ml-2 text-xs font-normal">
                                    (Coming Soon)
                                  </span>
                                )}
                              </h3>
                              <p className={`text-sm ${
                                isDisabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
                              }`}>
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
              <div className="space-y-8">
                {/* Section Header */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
                    Business Information
                  </h2>
                  <p className="text-muted-foreground text-sm font-sans">
                    Provide comprehensive details about your {listingType}
                  </p>
                </div>

                {/* 1. Basic Business Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Basic Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Core details about your business
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Business Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full ${errors.name ? "border-destructive" : ""}`}
                        placeholder="Enter your business name"
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Business Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full ${errors.description ? "border-destructive" : ""}`}
                        placeholder="Describe your business, services, and what makes it unique..."
                      />
                      {errors.description && (
                        <p className="text-destructive text-sm">{errors.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Location & Contact Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Location & Contact
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Where your business is located and how customers can reach you
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Contact Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-10 ${errors.phone ? "border-destructive" : ""}`}
                          placeholder="Enter your contact number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-destructive text-sm">{errors.phone}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="district">
                          District <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              district: value,
                              locality: "" // Clear locality when district changes
                            }));
                            if (errors.district) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.district;
                                return newErrors;
                              });
                            }
                            if (errors.locality) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.locality;
                                return newErrors;
                              });
                            }
                          }}
                        >
                          <SelectTrigger className={`w-full ${errors.district ? "border-destructive" : ""}`}>
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
                        <Label htmlFor="locality">
                          Town/Locality <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.locality}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, locality: value }));
                            if (errors.locality) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.locality;
                                return newErrors;
                              });
                            }
                          }}
                          disabled={!formData.district}
                        >
                          <SelectTrigger className={`w-full ${errors.locality ? "border-destructive" : ""}`}>
                            <SelectValue placeholder={formData.district ? "Select Town/Locality" : "Please select your locality"} />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.district && getLocalitiesForDistrict(formData.district).map((locality) => (
                              <SelectItem key={locality} value={locality}>
                                {locality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.locality && (
                          <p className="text-destructive text-sm">{errors.locality}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Detailed Address (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-10"
                          placeholder="Enter street address, building name, or landmarks"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* GPS Coordinates Section */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      GPS Location
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Precise location coordinates for better guest navigation
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">Automatic Location Detection</p>
                        <p className="text-xs text-muted-foreground">
                          Use your device's GPS to automatically fill coordinates
                        </p>
                      </div>
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
                            <Spinner size="sm" />
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
                          className={`w-full ${formData.latitude ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}`}
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
                          className={`w-full ${formData.longitude ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}`}
                        />
                      </div>
                    </div>

                    {/* Manual Entry Message */}
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground italic">
                        💡 Tip: Enter coordinates manually for more accuracy
                      </p>
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
                  </CardContent>
                </Card>

                {listingType === "hotel" && (
                  <>
                    {/* 3. Hotel-Specific Details */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          Hotel Details
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Specific information for hotel operations
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
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
                            <SelectTrigger className={`w-full ${errors.hotelType ? "border-destructive" : ""}`}>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="checkinTime">
                              Check-in Time <span className="text-destructive">*</span>
                            </Label>
                            <TimePicker
                              id="checkinTime"
                              name="checkinTime"
                              value={formData.checkinTime}
                              onChange={handleChange}
                              placeholder="Select check-in time"
                              format24h={false}
                              error={!!errors.checkinTime}
                            />
                            {errors.checkinTime && (
                              <p className="text-destructive text-sm">{errors.checkinTime}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="checkoutTime">
                              Check-out Time <span className="text-destructive">*</span>
                            </Label>
                            <TimePicker
                              id="checkoutTime"
                              name="checkoutTime"
                              value={formData.checkoutTime}
                              onChange={handleChange}
                              placeholder="Select check-out time"
                              format24h={false}
                              error={!!errors.checkoutTime}
                            />
                            {errors.checkoutTime && (
                              <p className="text-destructive text-sm">{errors.checkoutTime}</p>
                            )}
                          </div>
                        </div>

                        {/* Hourly Booking Option */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="hasTimeBased"
                              className="h-5 w-5 border border-muted-foreground/50 dark:border-muted-foreground/70 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              checked={formData.hasTimeBased}
                              onCheckedChange={(checked) => {
                                setFormData(prev => ({ ...prev, hasTimeBased: checked }));
                                if (errors.hasTimeBased) {
                                  setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.hasTimeBased;
                                    return newErrors;
                                  });
                                }
                              }}
                            />
                            <div className="space-y-1">
                              <Label htmlFor="hasTimeBased" className="text-sm font-medium cursor-pointer">
                                Enable Hourly Booking
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Allow guests to book rooms for specific hours instead of full days
                              </p>
                            </div>
                          </div>
                          
                          {formData.hasTimeBased && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    Hourly Booking Features
                                  </h5>
                                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• Guests can book rooms for specific hours (1-24 hours)</li>
                                    <li>• Pricing calculated per hour instead of per day</li>
                                    <li>• Flexible check-in and check-out times</li>
                                    <li>• Ideal for short stays, meetings, or day use</li>
                                    <li>• Can be used alongside regular daily bookings</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 4. Policies & Operations */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          Policies & Operations
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Business rules and operational policies
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="cancellationPolicy" className="text-base font-medium">
                            Cancellation Policy <span className="text-destructive">*</span>
                          </Label>
                          
                          {/* Policy Selection Type */}
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="predefined-policy"
                                  name="policyType"
                                  value="predefined"
                                  checked={policySelectionType === "predefined"}
                                  onChange={(e) => {
                                    setPolicySelectionType(e.target.value);
                                    if (errors.cancellationPolicy) {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.cancellationPolicy;
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 text-primary flex-shrink-0"
                                />
                                <Label htmlFor="predefined-policy" className="text-sm font-normal cursor-pointer">
                                  Choose from common policies
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="custom-policy"
                                  name="policyType"
                                  value="custom"
                                  checked={policySelectionType === "custom"}
                                  onChange={(e) => {
                                    setPolicySelectionType(e.target.value);
                                    if (errors.cancellationPolicy) {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.cancellationPolicy;
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 text-primary flex-shrink-0"
                                />
                                <Label htmlFor="custom-policy" className="text-sm font-normal cursor-pointer">
                                  Write custom policy
                                </Label>
                              </div>
                            </div>

                        {/* Predefined Policy Selection */}
                        {policySelectionType === "predefined" && (
                          <div className="space-y-3">
                            <Select
                              value={formData.cancellationPolicy}
                              onValueChange={(value) => {
                                const selectedPolicy = cancellationPolicyOptions.find(option => option.id === value);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  cancellationPolicy: selectedPolicy ? selectedPolicy.description : value
                                }));
                                if (errors.cancellationPolicy) {
                                  setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.cancellationPolicy;
                                    return newErrors;
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className={`w-full ${errors.cancellationPolicy ? "border-destructive" : ""}`}>
                                <SelectValue placeholder="Select a cancellation policy" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[60vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
                                {cancellationPolicyOptions.map((option) => (
                                  <SelectItem key={option.id} value={option.id} className="py-3">
                                    <div className="space-y-1 w-full min-w-0">
                                      <div className="font-medium text-sm leading-tight">{option.label}</div>
                                      <div className="text-xs text-muted-foreground leading-relaxed pr-2">
                                        {option.description}
                                      </div>
                                      {option.refundBreakdown && (
                                        <div className="mt-2 overflow-x-auto">
                                          <div className="flex gap-1 min-w-max">
                                            {option.refundBreakdown.map((item, index) => (
                                              <span key={index} className={`text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                                                item.refund === "100%" 
                                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                                  : item.refund === "0%" 
                                                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                                              }`}>
                                                {item.refund}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Selected Policy Preview */}
                            {formData.cancellationPolicy && (
                              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
                                <div className="flex items-start gap-2 mb-3">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="text-sm min-w-0">
                                    <p className="text-primary font-medium">Selected Policy:</p>
                                    <p className="text-muted-foreground mt-1 leading-relaxed break-words">{formData.cancellationPolicy}</p>
                                  </div>
                                </div>
                                
                                {/* Refund Breakdown Table */}
                                {(() => {
                                  const selectedOption = cancellationPolicyOptions.find(option => 
                                    option.description === formData.cancellationPolicy
                                  );
                                  
                                  if (selectedOption && selectedOption.refundBreakdown) {
                                    return (
                                      <div className="mt-3">
                                        <p className="text-primary font-medium text-sm mb-2">Refund Breakdown:</p>
                                        <div className="bg-background/50 rounded-lg p-3 overflow-x-auto">
                                          <div className="space-y-2 min-w-0">
                                            {selectedOption.refundBreakdown.map((item, index) => (
                                              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-xs min-w-max sm:min-w-0">
                                                <span className="text-muted-foreground text-left leading-relaxed break-words">{item.timeframe}</span>
                                                <span className={`font-medium px-2 py-1 rounded text-center flex-shrink-0 w-fit whitespace-nowrap ${
                                                  item.refund === "100%" 
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : item.refund === "0%" 
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                }`}>
                                                  {item.refund}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Custom Policy Input */}
                        {policySelectionType === "custom" && (
                          <div className="space-y-4 sm:space-y-3">
                            <Textarea
                              id="cancellationPolicy"
                              name="cancellationPolicy"
                              value={formData.cancellationPolicy}
                              onChange={handleChange}
                              rows={4}
                              placeholder="e.g., Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours of check-in will be charged 50% of the total booking amount. No-shows will be charged the full amount."
                              className={`text-sm ${errors.cancellationPolicy ? "border-destructive" : ""}`}
                            />
                            <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                              <p className="font-medium">Tips for writing effective policies:</p>
                              <ul className="list-disc list-inside space-y-1 ml-2 leading-relaxed">
                                <li>Be specific about timeframes (hours, days)</li>
                                <li>Clearly state refund percentages (e.g., "50% refund", "Full refund")</li>
                                <li>Include no-show policies</li>
                                <li>Consider seasonal variations</li>
                                <li className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                  <strong>Example:</strong> "Free cancellation up to 48 hours (100% refund). 50% refund within 48 hours. No refund for no-shows."
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                        </div>

                        {errors.cancellationPolicy && (
                          <p className="text-destructive text-sm">{errors.cancellationPolicy}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  </>
                )}

                {/* 5. Amenities & Features */}
                {currentAmenities.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        Amenities & Features
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Select the amenities and features your business offers
                      </p>
                    </CardHeader>
                    <CardContent>
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
                              className="text-sm font-normal cursor-pointer"
                            >
                              {amenity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 6. Financial Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Financial Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Bank account details for payment processing
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bankType">
                          Bank Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.bankType}
                          onValueChange={(value) => {
                            const maxLen = getMaxAccountNumberLength(value) || 20;
                            setFormData(prev => ({ 
                              ...prev, 
                              bankType: value,
                              accountNumber: (prev.accountNumber || "").slice(0, maxLen)
                            }));
                            if (errors.bankType) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.bankType;
                                return newErrors;
                              });
                            }
                          }}
                        >
                          <SelectTrigger className={`w-full ${errors.bankType ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Select Bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {getBankOptions().map((bank) => (
                              <SelectItem key={bank.value} value={bank.value}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{bank.label}</span>
                                  <span className="text-xs text-muted-foreground">{bank.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bankType && (
                          <p className="text-destructive text-sm">{errors.bankType}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">
                          Account Holder Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="accountHolderName"
                          name="accountHolderName"
                          value={formData.accountHolderName}
                          onChange={handleChange}
                          placeholder="Enter account holder name"
                          className={`w-full ${errors.accountHolderName ? "border-destructive" : ""}`}
                        />
                        {errors.accountHolderName && (
                          <p className="text-destructive text-sm">{errors.accountHolderName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">
                          Account Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={getMaxAccountNumberLength(formData.bankType) || 20}
                          value={formData.accountNumber}
                          onChange={handleChange}
                          placeholder="Enter account number"
                          className={`w-full ${errors.accountNumber ? "border-destructive" : ""}`}
                        />
                        {errors.accountNumber && (
                          <p className="text-destructive text-sm">{errors.accountNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Bank Account Information
                          </h5>
                          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Your bank account information is encrypted and securely stored</li>
                            <li>• This information is only used for payment processing</li>
                            <li>• You can add or update this information later in your hotel dashboard</li>
                            <li>• Ensure the account holder name matches your business registration</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 7. Media & Documentation */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Photos & Media
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload photos to showcase your business
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Business Photos <span className="text-destructive">*</span>
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
                              Upload photo
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
                  </CardContent>
                </Card>
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
                            <p className="font-bold text-sm lg:text-base">{formData.locality}, {formData.district}</p>
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
                              <p className="font-bold text-sm lg:text-base">{formData.hotelType.replace(/_/g, " ")}</p>
                            </div>
                          )}
                          {(formData.checkinTime || formData.checkoutTime) && (
                            <div>
                              <Label className="text-muted-foreground">Check-in/Check-out Times</Label>
                              <div className="space-y-1">
                                {formData.checkinTime && (
                                  <p className="font-bold text-sm lg:text-base">
                                    Check-in: {formData.checkinTime}
                                  </p>
                                )}
                                {formData.checkoutTime && (
                                  <p className="font-bold text-sm lg:text-base">
                                    Check-out: {formData.checkoutTime}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {formData.cancellationPolicy && (
                            <div>
                              <Label className="text-muted-foreground">Cancellation Policy</Label>
                              <p className="font-bold text-sm lg:text-base">{formData.cancellationPolicy}</p>
                            </div>
                          )}
                          {formData.hasTimeBased !== undefined && (
                            <div>
                              <Label className="text-muted-foreground">Hourly Booking</Label>
                              <p className="font-bold text-sm lg:text-base">
                                {formData.hasTimeBased ? "Enabled" : "Disabled"}
                              </p>
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