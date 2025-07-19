import React, { useEffect, useState } from "react";
import { useAuth } from "../../services/AuthProvider";
import api from "../../services/Api";
import { uploadFile } from "../../lib/uploadService.jsx";
import { CheckCircle, XCircle, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  hotelType: z.string().min(1, "Hotel type is required"),
  district: z.string().min(1, "District is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  description: z.string().min(1, "Description is required"),
  photoUrls: z.array(z.string()).optional(),
  license: z.string().optional(),
});

const HotelInfoForm = ({ hotel, onUpdate }) => {
  const { email } = useAuth();
  const [formData, setFormData] = useState(hotel);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hotel.name || "",
      hotelType: hotel.hotelType || "",
      district: hotel.district || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      description: hotel.description || "",
      photoUrls: hotel.photoUrls || [],
      license: hotel.license || "",
    },
  });

  useEffect(() => {
    setFormData(hotel);
    form.reset({
      name: hotel.name || "",
      hotelType: hotel.hotelType || "",
      district: hotel.district || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      description: hotel.description || "",
      photoUrls: hotel.photoUrls || [],
      license: hotel.license || "",
    });
  }, [hotel, form]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
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
      toast.success("Images uploaded successfully.");
    } catch (err) {
      toast.error("Failed to upload images. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    const updatedPhotoUrls = formData.photoUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      photoUrls: updatedPhotoUrls,
    }));
    form.setValue("photoUrls", updatedPhotoUrls);
  };

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      const updateData = {
        ...values,
        contact: values.phone,
        id: formData.id,
      };

      const res = await api.put(`/hotels/${formData.id}`, updateData);
      if (res.status === 200) {
        onUpdate(res.data);
        setIsEditing(false);
        toast.success("Hotel details updated successfully.");
      }
    } catch (err) {
      toast.error("Failed to update hotel information.");
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
                form.reset(hotel);
                setFormData(hotel);
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
                      onValueChange={field.onChange}
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
                          className="absolute -top-2 -right-2 rounded-full w-5 h-5 flex items-center justify-center text-xs p-0"
                          variant="destructive"
                          disabled={isLoading}
                        >
                          ×
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

              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formData.license}</span>
                  {isEditing && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-amber-600 hover:text-amber-700"
                      disabled={isLoading}
                    >
                      <Upload className="inline mr-1 w-4 h-4" /> Replace
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HotelInfoForm;