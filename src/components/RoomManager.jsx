import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Check, X, Upload, Bed, Wifi, Tv, Snowflake, Waves } from "lucide-react";
import { uploadFile } from "../lib/uploadService";
import { toast } from "sonner";
import { useAuth } from "../services/AuthProvider";
import api from "../services/Api";

// ShadCN UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RoomManager = () => {
  const { hotelId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomAdded, setRoomAdded] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const formRef = useRef(null);

  // Form state
  const [roomForm, setRoomForm] = useState({
    roomType: "",
    price: "",
    roomNumber: "",
    available: true,
    description: "",
    images: [],
    amenities: [],
  });
  const [errors, setErrors] = useState({});

  // Constants
  const standardAmenities = [
    { id: 1, name: "Single Bed", icon: Bed },
    { id: 2, name: "Double Bed", icon: Bed },
    { id: 3, name: "Queen Bed", icon: Bed },
    { id: 4, name: "King Bed", icon: Bed },
    { id: 5, name: "Smart TV", icon: Tv },
    { id: 6, name: "Normal TV", icon: Tv },
    { id: 7, name: "Wi-Fi", icon: Wifi },
    { id: 8, name: "Air Conditioning", icon: Snowflake },
    { id: 9, name: "Swimming Pool Access", icon: Waves },
  ];

  const roomTypeOptions = [
    "SINGLE",
    "DOUBLE",
    "DELUXE",
    "SUITE",
    "FAMILY",
    "TWIN",
    "KING",
    "QUEEN",
  ];

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "roomType":
        return value ? "" : "Room type is required";
      case "price":
        if (!value) return "Price is required";
        if (isNaN(value) || value <= 0)
          return "Price must be a positive number";
        return "";
      case "roomNumber":
        return value ? "" : "Room number is required";
      case "description":
        return value.length >= 20
          ? ""
          : "Description must be at least 20 characters";
      case "images":
        return value.length > 0 ? "" : "At least one image is required";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.roomType = validateField("roomType", roomForm.roomType);
    newErrors.price = validateField("price", roomForm.price);
    newErrors.roomNumber = validateField("roomNumber", roomForm.roomNumber);
    newErrors.description = validateField("description", roomForm.description);
    newErrors.images = validateField("images", roomForm.images);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Fetch rooms
  useEffect(() => {
    console.log("Hotel ID from RoomManager:", hotelId);
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/rooms/hotel/${hotelId}`);
        setRooms(response.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "hotelId") {
        console.log("hotelId changed in localStorage:", e.newValue);
        // Optionally refetch rooms when hotelId changes
        // fetchRooms();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Initialize form when editing
  useEffect(() => {
    if (editingRoom) {
      const roomToEdit = rooms.find((room) => room.id === editingRoom);
      if (roomToEdit) {
        setRoomForm({
          roomType: roomToEdit.roomType || "",
          price: roomToEdit.price || "",
          roomNumber: roomToEdit.roomNumber || "",
          available: roomToEdit.available !== false,
          description: roomToEdit.description || "",
          images:
            roomToEdit.imageUrl?.map((url, index) => ({
              url,
              name: `existing-${index}`,
              isExisting: true,
            })) || [],
          amenities:
            roomToEdit.amenities?.map(
              (name) =>
                standardAmenities.find((a) => a.name === name) || {
                  name,
                  id: Date.now(),
                }
            ) || [],
        });
      }
    } else if (showForm) {
      resetForm();
    }
  }, [editingRoom, showForm, rooms]);

  const resetForm = () => {
    setRoomForm({
      roomType: "",
      price: "",
      roomNumber: "",
      available: true,
      description: "",
      images: [],
      amenities: [],
    });
    setErrors({});
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setRoomForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue),
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setRoomForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const existingImages = roomForm.images || [];
    const remainingSlots = 5 - existingImages.length;

    if (remainingSlots <= 0) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    try {
      const newImages = filesToAdd.map((file) => ({
        file,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        isNew: true,
      }));

      setRoomForm((prev) => ({
        ...prev,
        images: [...existingImages, ...newImages],
      }));

      // Clear image validation error if images are added
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    } catch (error) {
      toast.error("Failed to process images");
    }
  };

  const removeImage = (index) => {
    setRoomForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity) => {
    setRoomForm((prev) => {
      const exists = prev.amenities.some((a) => a.id === amenity.id);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a.id !== amenity.id)
          : [...prev.amenities, amenity],
      };
    });
  };

  const startEdit = (room) => {
    setEditingRoom(room.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setShowForm(false);
    setErrors({});
  };

  const scrollToFirstError = () => {
    const firstError = Object.keys(errors).find((key) => errors[key]);
    if (firstError) {
      const element = formRef.current?.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      scrollToFirstError();
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload new images
      const imageUploadPromises = roomForm.images
        .filter((img) => img.isNew && img.file)
        .map((img) => uploadFile(img.file, "photos"));

      const uploadResults = await Promise.all(imageUploadPromises);

      // Combine existing and new image URLs
      const existingImageUrls = roomForm.images
        .filter((img) => img.isExisting)
        .map((img) => img.url);

      const newImageUrls = uploadResults
        .filter((res) => res.field === "photos" && res.url)
        .map((res) => res.url);

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Prepare payload
      const payload = {
        ...roomForm,
        imageUrl: allImageUrls,
        amenities: roomForm.amenities.map((a) => a.name),
      };

      // Submit form
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom}`, payload);
        toast.success("Room updated successfully!");

        // Update local state
        setRooms((prev) =>
          prev.map((room) =>
            room.id === editingRoom
              ? {
                  ...room,
                  ...payload,
                  id: editingRoom,
                  amenities: payload.amenities,
                }
              : room
          )
        );
      } else {
        const response = await api.post(
          `/rooms/hotel/${hotelId}`,
          payload
        );
        toast.success("Room added successfully!");

        // Add new room to local state
        setRooms((prev) => [...prev, response.data]);
        setRoomAdded(true);
        setTimeout(() => setRoomAdded(false), 3000);
      }

      cancelEdit();
    } catch (error) {
      console.error("Error submitting room:", error);

      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          serverErrors[key] = error.response.data.errors[key].join(", ");
        });
        setErrors(serverErrors);
        scrollToFirstError();
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to save room. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (roomId) => {
    setIsDeleting(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 sm:py-8">
      {/* Responsive Header - Only Add Room button remains, with spacing */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-0 mb-2 sm:mb-4">
        <Button 
          onClick={() => { setShowForm(true); setEditingRoom(null); }}
          className="w-[90%] m-auto sm:w-auto sm:text-base text-sm"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Add Room</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Room Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room information below." : "Fill in the details to add a new room."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room Type */}
              <div className="space-y-2">
                <Label htmlFor="roomType">
                  Room Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={roomForm.roomType}
                  onValueChange={(value) => handleSelectChange("roomType", value)}
                >
                  <SelectTrigger className={errors.roomType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomType && (
                  <p className="text-sm text-destructive">{errors.roomType}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price per night (Nu.) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={roomForm.price}
                  onChange={handleInputChange}
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              {/* Room Number */}
              <div className="space-y-2">
                <Label htmlFor="roomNumber">
                  Room Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={roomForm.roomNumber}
                  onChange={handleInputChange}
                  className={errors.roomNumber ? "border-destructive" : ""}
                />
                {errors.roomNumber && (
                  <p className="text-sm text-destructive">{errors.roomNumber}</p>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={roomForm.available}
                  onCheckedChange={(checked) => 
                    setRoomForm(prev => ({ ...prev, available: checked }))
                  }
                />
                <Label htmlFor="available">Available for booking</Label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={roomForm.description}
                onChange={handleInputChange}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Room Images */}
            <div className="space-y-4">
              <Label>
                Room Images <span className="text-destructive">*</span>
              </Label>

              {/* Image Preview */}
              {roomForm.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {roomForm.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Room ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <Card className="border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Upload room images (max 5)
                    </span>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                </CardContent>
              </Card>
              {errors.images && (
                <p className="text-sm text-destructive">{errors.images}</p>
              )}
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {standardAmenities.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = roomForm.amenities.some((a) => a.id === amenity.id);
                  return (
                    <Card
                      key={amenity.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      <CardContent className="flex items-center p-3">
                        <Icon className={`h-4 w-4 mr-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm">{amenity.name}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {editingRoom ? "Updating..." : "Adding..."}
                  </>
                ) : editingRoom ? (
                  "Update Room"
                ) : (
                  "Add Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell className="max-w-xs truncate">{room.description}</TableCell>
                  <TableCell>Nu {typeof room.price === 'number' && !isNaN(room.price) ? room.price.toFixed(2) : '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {Array.isArray(room.amenities)
                      ? room.amenities.join(", ")
                      : room.amenities}
                  </TableCell>
                  <TableCell>
                    <Badge variant={room.available ? "default" : "destructive"}>
                      {room.available ? "Available" : "Not Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(room)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting === room.id}
                          >
                            {isDeleting === room.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the room
                              and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(room.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManager;