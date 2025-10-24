import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { uploadFile, deleteFileByUrl } from "../../shared/services/uploadService";
import { CheckCircle, XCircle, Upload, Plus, X, MapPin, Loader2, Facebook, Instagram, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components";
import { Button } from "@/shared/components";
import { Input } from "@/shared/components";
import { Label } from "@/shared/components";
import { Textarea } from "@/shared/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components";
import { Badge } from "@/shared/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getCategorizedAmenities } from "../../shared/utils/amenitiesHelper";
import { districts, getLocalitiesForDistrict, BankType, getBankOptions } from "../../shared/constants";

// Custom TikTok icon component
const TikTokIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.349-2.019-1.349-3.338h-3.064v13.925a3.649 3.649 0 1 1-2.676-3.51V8.307a6.593 6.593 0 0 0-2.676.563 6.65 6.65 0 0 0-4.854 6.4c0 3.676 2.974 6.65 6.65 6.65s6.65-2.974 6.65-6.65V9.412a9.193 9.193 0 0 0 5.321 1.674V8.022a6.196 6.196 0 0 1-2.422-2.46z"/>
  </svg>
);

const formSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  hotelType: z.string().min(1, "Hotel type is required"),
  district: z.string().min(1, "District is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  description: z.string().min(1, "Description is required"),
  photoUrls: z.array(z.string()).optional(),
  license: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cancellationPolicy: z.string().min(1, "Cancellation policy is required"),
  hasTimeBased: z.boolean().optional(),
  // Check-in and Check-out Times (backend field names)
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().min(1, "Check-out time is required"),
  // Social Media Links
  facebookUrl: z.string().url("Please enter a valid Facebook URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Please enter a valid Instagram URL").optional().or(z.literal("")),
  tiktokUrl: z.string().url("Please enter a valid TikTok URL").optional().or(z.literal("")),
  // Bank Account Information
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankType: z.string().optional(),
});

const HotelInfoForm = ({ hotel, onUpdate }) => {
  const { email } = useAuth();
  const [formData, setFormData] = useState({
    ...hotel,
    locality: hotel.locality || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState(hotel.amenities || []);
  const [availableAmenities] = useState(getCategorizedAmenities("hotel"));
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [policySelectionType, setPolicySelectionType] = useState("predefined"); // "predefined" or "custom"

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hotel.name || "",
      hotelType: hotel.hotelType || "",
      district: hotel.district || "",
      locality: hotel.locality || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      description: hotel.description || "",
      photoUrls: hotel.photoUrls || [],
      license: hotel.license || "",
      amenities: hotel.amenities || [],
      latitude: hotel.latitude || undefined,
      longitude: hotel.longitude || undefined,
      cancellationPolicy: hotel.cancellationPolicy || "",
      hasTimeBased: hotel.hasTimeBased || false,
      checkInTime: hotel.checkinTime || "01:00:00",
      checkOutTime: hotel.checkoutTime || "13:00:00",
      facebookUrl: hotel.facebookUrl || "",
      instagramUrl: hotel.instagramUrl || "",
      tiktokUrl: hotel.tiktokUrl || "",
      accountNumber: hotel.accountNumber || "",
      accountHolderName: hotel.accountHolderName || "",
      bankType: hotel.bankType || "",
    },
  });

  useEffect(() => {
    setFormData({
      ...hotel,
      locality: hotel.locality || "",
    });
    setSelectedAmenities(hotel.amenities || []);
    form.reset({
      name: hotel.name || "",
      hotelType: hotel.hotelType || "",
      district: hotel.district || "",
      locality: hotel.locality || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      description: hotel.description || "",
      photoUrls: hotel.photoUrls || [],
      license: hotel.license || "",
      amenities: hotel.amenities || [],
      latitude: hotel.latitude || undefined,
      longitude: hotel.longitude || undefined,
      cancellationPolicy: hotel.cancellationPolicy || "",
      hasTimeBased: hotel.hasTimeBased || false,
      checkInTime: hotel.checkinTime || "01:00:00",
      checkOutTime: hotel.checkoutTime || "01:00:00",
      facebookUrl: hotel.facebookUrl || "",
      instagramUrl: hotel.instagramUrl || "",
      tiktokUrl: hotel.tiktokUrl || "",
      accountNumber: hotel.accountNumber || "",
      accountHolderName: hotel.accountHolderName || "",
      bankType: hotel.bankType || "",
    });
  }, [hotel, form]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (4MB limit per file)
    const maxFileSize = 4 * 1024 * 1024; // 4MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(file => file.name).join(', ');
      toast.error(`File size too large: ${fileNames}`, {
        description: "Each image must be smaller than 4MB. Please compress your images and try again.",
        duration: 8000
      });
      return;
    }

    setIsLoading(true);

    try {
      const uploadPromises = files.map((file) => uploadFile(file, "photos"));
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map((result) => result.url);

      const updatedPhotoUrls = [...formData.photoUrls, ...newImageUrls];
      setFormData((prev) => ({
        ...prev,
        photoUrls: updatedPhotoUrls,
      }));
      form.setValue("photoUrls", updatedPhotoUrls);
      toast.success("Images uploaded successfully.", {
        duration: 6000
      });
    } catch (err) {
      toast.error("Failed to upload images. Please try again.", {
        duration: 6000
      });
      console.error("Image upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async (index) => {
    const imageUrl = formData.photoUrls[index];
    
    if (!imageUrl) {
      toast.error("No image URL found to delete");
      return;
    }

    setDeletingImageIndex(index);
    
    try {
      // Delete the file from backend
      const result = await deleteFileByUrl(imageUrl);
      
      if (result.success) {
        // Remove from local state only after successful deletion
        const updatedPhotoUrls = formData.photoUrls.filter((_, i) => i !== index);
        setFormData((prev) => ({
          ...prev,
          photoUrls: updatedPhotoUrls,
        }));
        form.setValue("photoUrls", updatedPhotoUrls);
        
        toast.success(result.message || "Image deleted successfully", {
          duration: 6000
        });
      } else {
        toast.error(result.message || "Failed to delete image", {
          duration: 6000
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.", {
        duration: 6000
      });
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(updatedAmenities);
    form.setValue("amenities", updatedAmenities);
  };

  const handleDistrictChange = (value) => {
    // Reset locality when district changes
    form.setValue("locality", "");
    form.setValue("district", value);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.", {
        duration: 6000
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update form values
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        
        toast.success("Location obtained successfully!", {
          description: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
          duration: 6000
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Failed to get location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
            break;
        }
        
        toast.error(errorMessage, {
          duration: 8000
        });
        
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      const updateData = {
        ...values,
        contact: values.phone,
        amenities: selectedAmenities,
        id: formData.id,
        latitude: values.latitude,
        longitude: values.longitude,
        // Include check-in and check-out times (backend expects lowercase 'i' and 'o')
        checkinTime: values.checkInTime,
        checkoutTime: values.checkOutTime,
        // Include social media URLs with exact DTO field names
        facebookUrl: values.facebookUrl || null,
        instagramUrl: values.instagramUrl || null,
        tiktokUrl: values.tiktokUrl || null,
        // Include bank account information
        accountNumber: values.accountNumber || null,
        accountHolderName: values.accountHolderName || null,
        bankType: values.bankType || null,
        // Include hourly booking setting
        hasTimeBased: values.hasTimeBased || false,
      };

      const res = await api.put(`/hotels/${formData.id}`, updateData);
      if (res.status === 200) {
        onUpdate(res.data);
        setIsEditing(false);
        toast.success("Hotel details updated successfully.", {
          duration: 6000
        });
      }
    } catch (err) {
      toast.error("Failed to update hotel information.", {
        duration: 6000
      });
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Hotel Information</CardTitle>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="text-sm">
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                form.reset({
                  name: hotel.name || "",
                  hotelType: hotel.hotelType || "",
                  district: hotel.district || "",
                  locality: hotel.locality || "",
                  address: hotel.address || "",
                  phone: hotel.phone || "",
                  description: hotel.description || "",
                  photoUrls: hotel.photoUrls || [],
                  license: hotel.license || "",
                  amenities: hotel.amenities || [],
                  latitude: hotel.latitude || undefined,
                  longitude: hotel.longitude || undefined,
                  cancellationPolicy: hotel.cancellationPolicy || "",
                  hasTimeBased: hotel.hasTimeBased || false,
                  checkInTime: hotel.checkinTime || "14:00",
                  checkOutTime: hotel.checkoutTime || "11:00",
                  facebookUrl: hotel.facebookUrl || "",
                  instagramUrl: hotel.instagramUrl || "",
                  tiktokUrl: hotel.tiktokUrl || "",
                  accountNumber: hotel.accountNumber || "",
                  accountHolderName: hotel.accountHolderName || "",
                  bankType: hotel.bankType || "",
                });
                setFormData({
                  ...hotel,
                  locality: hotel.locality || "",
                });
                setSelectedAmenities(hotel.amenities || []);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hotelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hotel Type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={handleDistrictChange}
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locality</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Locality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getLocalitiesForDistrict(form.watch("district")).map((locality) => (
                          <SelectItem key={locality} value={locality}>
                            {locality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location Coordinates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any"
                            placeholder="e.g., 27.7172"
                            disabled={!isEditing}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any"
                            placeholder="e.g., 85.3240"
                            disabled={!isEditing}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {isEditing && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="w-full md:w-auto"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Get Current Location
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click to automatically detect your hotel's location using GPS
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="text-base font-semibold mb-3">
                  Contact Information
                </h4>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Check-in and Check-out Times Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      Check-in & Check-out Times
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Set your hotel's standard check-in and check-out times
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Check-in Time</p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {hotel.checkinTime || "01:00:00"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Check-out Time</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {hotel.checkoutTime || "01:00:00"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            Check-in Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            Check-out Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Check-in & Check-out Guidelines
                        </h5>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Set your preferred check-in and check-out times</li>
                          <li>• Default times are set to 01:00:00 (1:00 AM)</li>
                          <li>• These times help ensure room cleaning and preparation</li>
                          <li>• Guests will be informed of these times during booking</li>
                          <li>• Consider your cleaning schedule when setting these times</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Links Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      Social Media Links
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with your guests on social platforms
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="space-y-3">
                    {(hotel.facebookUrl || hotel.instagramUrl || hotel.tiktokUrl) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {hotel.facebookUrl && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                              <Facebook className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Facebook</p>
                              <a
                                href={hotel.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                              >
                                {hotel.facebookUrl}
                              </a>
                            </div>
                          </div>
                        )}

                        {hotel.instagramUrl && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              <Instagram className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Instagram</p>
                              <a
                                href={hotel.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline truncate block"
                              >
                                {hotel.instagramUrl}
                              </a>
                            </div>
                          </div>
                        )}

                        {hotel.tiktokUrl && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                              <TikTokIcon className="h-4 w-4 text-white dark:text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">TikTok</p>
                              <a
                                href={hotel.tiktokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-600 dark:text-gray-400 hover:underline truncate block"
                              >
                                {hotel.tiktokUrl}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                        <div className="flex justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                            <Instagram className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                            <TikTokIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No social media links added yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click Edit to add your social media profiles
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <Facebook className="h-3 w-3 text-white" />
                            </div>
                            Facebook Page URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="url"
                              placeholder="https://facebook.com/yourhotel"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              <Instagram className="h-3 w-3 text-white" />
                            </div>
                            Instagram Profile URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="url"
                              placeholder="https://instagram.com/yourhotel"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tiktokUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center">
                              <TikTokIcon className="h-3 w-3 text-white dark:text-black" />
                            </div>
                            TikTok Profile URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="url"
                              placeholder="https://tiktok.com/@yourhotel"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Social Media Tips
                          </h5>
                          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Use your complete profile URLs (e.g., https://facebook.com/yourhotel)</li>
                            <li>• Keep your social media profiles active and engaging</li>
                            <li>• Share photos of your hotel, amenities, and local attractions</li>
                            <li>• Respond to guest comments and messages promptly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Account Information Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      Bank Account Information
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Provide your bank account details for payment processing
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="space-y-3">
                    {(hotel.accountNumber || hotel.accountHolderName || hotel.bankType) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {hotel.bankType && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Bank</p>
                              <p className="text-xs text-green-600 dark:text-green-400 truncate">
                                {hotel.bankType}
                              </p>
                            </div>
                          </div>
                        )}

                        {hotel.accountHolderName && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Account Holder</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                {hotel.accountHolderName}
                              </p>
                            </div>
                          </div>
                        )}

                        {hotel.accountNumber && (
                          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Account Number</p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                                {hotel.accountNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                        <div className="flex justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No bank account information added yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click Edit to add your bank account details
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            Bank Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Bank" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            Account Holder Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter account holder name"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            Account Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter account number"
                              className="pl-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                            Bank Account Security
                          </h5>
                          <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                            <li>• Your bank account information is encrypted and securely stored</li>
                            <li>• This information is only used for payment processing</li>
                            <li>• Ensure the account holder name matches your business registration</li>
                            <li>• Double-check your account number before saving</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cancellation Policy Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="text-base font-semibold mb-3">
                  Cancellation Policy
                </h4>
                
                {!isEditing ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      {hotel.cancellationPolicy || "No cancellation policy set"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Policy Selection Type */}
                    <div className="space-y-3">
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
                              // Clear custom policy when switching to predefined
                              if (e.target.value === "predefined") {
                                form.setValue("cancellationPolicy", "");
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
                              // Clear predefined policy when switching to custom
                              if (e.target.value === "custom") {
                                form.setValue("cancellationPolicy", "");
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
                            value={(() => {
                              const currentPolicy = form.watch("cancellationPolicy");
                              const matchingOption = cancellationPolicyOptions.find(
                                option => option.description === currentPolicy
                              );
                              return matchingOption?.id || "";
                            })()}
                            onValueChange={(value) => {
                              const selectedPolicy = cancellationPolicyOptions.find(option => option.id === value);
                              if (selectedPolicy) {
                                // Replace the existing policy with the selected one
                                form.setValue("cancellationPolicy", selectedPolicy.description);
                                // Clear any custom policy text if switching from custom to predefined
                                if (policySelectionType === "custom") {
                                  setPolicySelectionType("predefined");
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a cancellation policy">
                                {(() => {
                                  const currentPolicy = form.watch("cancellationPolicy");
                                  const matchingOption = cancellationPolicyOptions.find(
                                    option => option.description === currentPolicy
                                  );
                                  return matchingOption ? matchingOption.label : "Select a cancellation policy";
                                })()}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[60vh] overflow-y-auto w-full max-w-[90vw] sm:max-w-md">
                              {cancellationPolicyOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id} className="py-3 px-3">
                                  <div className="space-y-2 w-full min-w-0">
                                    <div className="font-medium text-sm leading-tight break-words">{option.label}</div>
                                    <div className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-3">
                                      {option.description}
                                    </div>
                                    {option.refundBreakdown && (
                                      <div className="flex flex-wrap gap-1">
                                        {option.refundBreakdown.map((item, index) => (
                                          <span key={index} className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
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
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Custom Policy Input */}
                      {policySelectionType === "custom" && (
                        <div className="space-y-4 sm:space-y-3">
                          <FormField
                            control={form.control}
                            name="cancellationPolicy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Cancellation Policy</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    rows={4}
                                    placeholder="e.g., Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours of check-in will be charged 50% of the total booking amount. No-shows will be charged the full amount."
                                    className="text-sm"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
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
                  </div>
                )}
              </div>

              {/* Hourly Booking Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="text-base font-semibold mb-3">
                  Booking Options
                </h4>
                
                {!isEditing ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        hotel.hasTimeBased 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <svg className={`h-4 w-4 ${
                          hotel.hasTimeBased 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Hourly Booking: {hotel.hasTimeBased ? "Enabled" : "Disabled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hotel.hasTimeBased 
                            ? "Guests can book rooms for specific hours instead of full days"
                            : "Only daily bookings are available"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasTimeBased"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Hourly Booking
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow guests to book rooms for specific hours instead of full days
                            </div>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("hasTimeBased") && (
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
                )}
              </div>

              {/* Amenities Section */}
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  Hotel Amenities
                </Label>
                
                {/* Selected Amenities Display */}
                {selectedAmenities.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Selected Amenities:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {amenity}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleAmenityToggle(amenity)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities Selection */}
                {isEditing && (
                  <div className="space-y-4">
                    {Object.entries(availableAmenities).map(([category, amenities]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {amenities.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => handleAmenityToggle(amenity)}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                                selectedAmenities.includes(amenity)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-accent border-border"
                              }`}
                            >
                              {selectedAmenities.includes(amenity) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Read-only view when not editing */}
                {!isEditing && selectedAmenities.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No amenities selected
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Images
                </Label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.photoUrls?.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Hotel ${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      {isEditing && (
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs p-0"
                          variant="destructive"
                          disabled={isLoading || deletingImageIndex === index}
                        >
                          {deletingImageIndex === index ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
                    {isLoading ? (
                      <div className="text-amber-500">Uploading images...</div>
                    ) : (
                      <>
                        <Upload className="text-amber-500 text-2xl mb-2" />
                        <p className="text-sm text-gray-600">
                          Upload hotel images
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </>
                    )}
                  </Label>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HotelInfoForm;
