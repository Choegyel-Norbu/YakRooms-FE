import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { uploadFile, deleteFileByUrl } from "../../shared/services/uploadService";
import { CheckCircle, XCircle, Upload, Plus, X } from "lucide-react";
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

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      const updateData = {
        ...values,
        contact: values.phone,
        amenities: selectedAmenities,
        id: formData.id,
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
                  ...hotel,
                  locality: hotel.locality || "",
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
