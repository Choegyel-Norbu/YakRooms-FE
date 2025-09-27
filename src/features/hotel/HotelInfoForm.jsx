import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { uploadFile, deleteFileByUrl } from "../../shared/services/uploadService";
import { CheckCircle, XCircle, Upload, Plus, X, MapPin, Loader2 } from "lucide-react";
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
import { districts, getLocalitiesForDistrict } from "../../shared/constants";

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
