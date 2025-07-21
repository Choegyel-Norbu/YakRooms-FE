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
import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [verifyAlert, setVerifyAlert] = useState(false);
  const [roomAdded, setRoomAdded] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const formRef = useRef(null);

  // Debug hotelId changes
  useEffect(() => {
    console.log("=== RoomManager hotelId changed ===");
    console.log("hotelId from useAuth():", hotelId);
    console.log("typeof hotelId:", typeof hotelId);
    console.log("localStorage hotelId:", localStorage.getItem("hotelId"));
  }, [hotelId]);

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
        setError("Failed to load rooms.");
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if hotelId is available
    if (hotelId) {
      fetchRooms();
    } else {
      console.log("No hotelId available, skipping room fetch");
      setLoading(false);
    }
  }, [hotelId]); // Add hotelId as dependency

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
        setVerifyAlert(true);
        setTimeout(() => setVerifyAlert(false), 3000);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Friendly */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Room Management</h3>
          <p className="hidden sm:block text-sm text-muted-foreground">Manage your hotel rooms and availability</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingRoom(null); }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Success/Error Alert */}
      {verifyAlert && (
        <Alert className={roomAdded ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <Check className={`h-4 w-4 ${roomAdded ? "text-green-600" : "text-red-600"}`} />
          <AlertDescription className={roomAdded ? "text-green-800" : "text-red-800"}>
            {roomAdded
              ? "Room added successfully!"
              : "Something went wrong. Please try again later."}
          </AlertDescription>
        </Alert>
      )}

      {/* Room Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room information below." : "Fill in the details to add a new room."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} ref={formRef} className="space-y-4 sm:space-y-6">
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

              {/* Available Status */}
              <div className="space-y-2">
                <Label htmlFor="available" className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={roomForm.available}
                    onCheckedChange={(checked) =>
                      setRoomForm({ ...roomForm, available: checked })
                    }
                  />
                  <span>Available for booking</span>
                </Label>
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
                value={roomForm.description}
                onChange={handleInputChange}
                placeholder="Describe the room, its features, and any special amenities..."
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {standardAmenities.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = roomForm.amenities.includes(amenity.name);
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border hover:bg-accent"
                      }`}
                      onClick={() => toggleAmenity(amenity.name)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Room Images</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roomForm.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Room ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {roomForm.images.length < 6 && (
                  <label className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload up to 6 images. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  cancelEdit();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {editingRoom ? "Updating..." : "Adding..."}
                  </div>
                ) : (
                  editingRoom ? "Update Room" : "Add Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rooms Table - Mobile Responsive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">All Rooms</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Room No.</TableHead>
                  <TableHead className="text-xs sm:text-sm">Type</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Description</TableHead>
                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Amenities</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">{room.roomNumber}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{room.roomType}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm max-w-xs truncate">{room.description}</TableCell>
                    <TableCell className="text-xs sm:text-sm">Nu {room.price?.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm max-w-xs truncate">
                      {Array.isArray(room.amenities)
                        ? room.amenities.join(", ")
                        : room.amenities}
                    </TableCell>
                    <TableCell>
                      <Badge variant={room.available ? "default" : "destructive"} className="text-xs">
                        {room.available ? "Available" : "Not Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(room)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isDeleting === room.id}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
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
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          {/* <AlertDescription>{error}</AlertDescription> */}
        </Alert>
      )}
    </div>
  );
};

export default RoomManager;