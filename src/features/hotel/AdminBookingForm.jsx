import { useState, useEffect } from "react";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/shared/components/dialog";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { Separator } from "@/shared/components/separator";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminBookingForm({ hotelId, onBookingSuccess }) {
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    roomNumber: "",
    hotelId: hotelId,
    checkOutDate: "",
    guests: 1,
    phone: "",
    customerName: "",
    cid: "",
    destination: "",
    origin: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hotelId) {
      fetchAvailableRooms();
    }
  }, [hotelId]);

  const fetchAvailableRooms = async (showErrorToast = true) => {
    try {
      setLoading(true);
      const response = await api.get(`/rooms/available/${hotelId}?page=0&size=50`);
      setAvailableRooms(response.data.content || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      if (showErrorToast) {
        toast.error("Failed to fetch available rooms", {
          duration: 6000
        });
      }
      throw error; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!bookingDetails.checkOutDate) return 0;
    const today = new Date();
    const checkOut = new Date(bookingDetails.checkOutDate);
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  const getSelectedRoom = () => {
    return availableRooms.find(room => room.roomNumber === bookingDetails.roomNumber);
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    const selectedRoom = getSelectedRoom();
    if (!selectedRoom) return 0;
    return days * selectedRoom.price;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingDetails.roomNumber) newErrors.roomNumber = "Room number is required";
    // Removed userId validation - now optional for third-party bookings
    if (!bookingDetails.customerName) newErrors.customerName = "Customer name is required";
    if (!bookingDetails.checkOutDate) newErrors.checkOutDate = "Check-out date is required";
    
    if (bookingDetails.checkOutDate && new Date(bookingDetails.checkOutDate) <= new Date()) {
      newErrors.checkOutDate = "Check-out must be after today";
    }

    // Validate CID Number (Bhutanese Citizen Identity Document)
    if (!bookingDetails.cid.trim()) {
      newErrors.cid = "CID number is required";
    } else {
      const cid = bookingDetails.cid.trim();
      
      // Rule 1: Must be exactly 11 digits
      if (!/^\d{11}$/.test(cid)) {
        newErrors.cid = "CID must be exactly 11 digits";
      } else {
        // Rule 2: Dzongkhag code must be 01–20
        const dzongkhagCode = parseInt(cid.substring(0, 2), 10);
        if (dzongkhagCode < 1 || dzongkhagCode > 20) {
          newErrors.cid = "Invalid Dzongkhag code (must be 01–20)";
        }
        // Additional validation: Check if it's not all zeros or all same digits
        else if (/^0{11}$/.test(cid)) {
          newErrors.cid = "CID number cannot be all zeros";
        } else if (/^(\d)\1{10}$/.test(cid)) {
          newErrors.cid = "CID number cannot be all same digits";
        }
        // CID is valid if it passes all the above checks
      }
    }

    // Validate Destination
    if (!bookingDetails.destination.trim()) {
      newErrors.destination = "Destination is required";
    } else if (bookingDetails.destination.length < 2) {
      newErrors.destination = "Destination must be at least 2 characters long";
    } else if (bookingDetails.destination.length > 50) {
      newErrors.destination = "Destination must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(bookingDetails.destination)) {
      newErrors.destination = "Destination can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    // Validate Origin
    if (!bookingDetails.origin.trim()) {
      newErrors.origin = "Origin is required";
    } else if (bookingDetails.origin.length < 2) {
      newErrors.origin = "Origin must be at least 2 characters long";
    } else if (bookingDetails.origin.length > 50) {
      newErrors.origin = "Origin must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-_.,]+$/.test(bookingDetails.origin)) {
      newErrors.origin = "Origin can only contain letters, spaces, hyphens, underscores, commas, and periods";
    }

    const validateBhutanesePhone = (phone) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      if (!cleanPhone) return "Phone number is required";
      if (!/^\d+$/.test(cleanPhone)) return "Phone number should contain only digits";
      if (cleanPhone.length !== 8) return "Phone number must be exactly 8 digits";
      const mobilePattern = /^(17|77)\d{6}$/;
      if (!mobilePattern.test(cleanPhone)) return "Invalid Bhutanese mobile number. Must start with 17 or 77.";
      return null;
    };

    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const selectedRoom = getSelectedRoom();
      if (!selectedRoom) {
        toast.error("Selected room not found", {
          duration: 6000
        });
        return;
      }

      const payload = {
        ...bookingDetails,
        checkInDate: new Date().toISOString().split('T')[0],
        roomId: selectedRoom.id,
        hotelId: hotelId,
        totalPrice: calculateTotalPrice(),
        days: calculateDays(),
        // Set userId to null for all third-party bookings
        userId: null,
      };
      
      const res = await api.post("/bookings", payload);
      if (res.status === 200) {
        toast.success("Booking Successful!", {
          description: `Room ${bookingDetails.roomNumber} has been booked for ${bookingDetails.customerName}.`,
          duration: 6000
        });
        
        setBookingDetails({
          roomNumber: "",
          hotelId: hotelId,
          checkOutDate: "",
          guests: 1,
          phone: "",
          customerName: "",
          cid: "",
          destination: "",
          origin: "",
        });
        setErrors({});
        setOpenBookingDialog(false);
        
        // Only call onBookingSuccess to refresh data - avoid multiple API calls
        if (onBookingSuccess) {
          try {
            onBookingSuccess();
          } catch (error) {
            console.error("Error in onBookingSuccess callback:", error);
          }
        }
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description: "There was an error processing the booking. Please try again.",
        duration: 6000
      });
    }
  };

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();
  const selectedRoom = getSelectedRoom();

  return (
    <>
      <Button 
        onClick={() => setOpenBookingDialog(true)}
        className="w-auto cursor-pointer ml-4 sm:ml-0"
        disabled={loading}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {loading ? "Loading..." : "Create New Booking"}
      </Button>

      <Dialog 
        open={openBookingDialog} 
        onOpenChange={(open) => {
          setOpenBookingDialog(open);
          // Reset all validation errors when dialog closes
          if (!open) {
            setErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Book a room for a customer (registered user or walk-in guest)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-2">
                <Label htmlFor="roomNumber">Room Number <span className="text-destructive">*</span></Label>
                <Select
                  value={bookingDetails.roomNumber}
                  onValueChange={(value) => 
                    setBookingDetails(prev => ({ ...prev, roomNumber: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.length > 0 ? (
                      availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.roomNumber}>
                          Room {room.roomNumber} - {room.roomType} (Nu. {room.price}/night)
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No rooms available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.roomNumber && <p className="text-sm text-destructive">{errors.roomNumber}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name <span className="text-destructive">*</span></Label>
                <Input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={bookingDetails.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                />
                {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
              </div>



              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+975</span>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={bookingDetails.phone}
                    onChange={handleInputChange}
                    placeholder="17123456"
                    className="pl-14"
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              {/* Additional Information Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cid" className="text-sm">CID Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="cid"
                    name="cid"
                    type="text"
                    value={bookingDetails.cid}
                    onChange={handleInputChange}
                    placeholder="11 digits (e.g., 10901001065)"
                    maxLength={11}
                    className={`text-sm ${errors.cid ? "border-destructive" : ""}`}
                  />
                  
                  {errors.cid && (
                    <p className="text-sm text-destructive">{errors.cid}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="destination" className="text-sm">Destination <span className="text-destructive">*</span></Label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    value={bookingDetails.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination"
                    className={`text-sm ${errors.destination ? "border-destructive" : ""}`}
                  />
                  {errors.destination && (
                    <p className="text-sm text-destructive">{errors.destination}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="origin" className="text-sm">Origin <span className="text-destructive">*</span></Label>
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    value={bookingDetails.origin}
                    onChange={handleInputChange}
                    placeholder="Enter origin"
                    className={`text-sm ${errors.origin ? "border-destructive" : ""}`}
                  />
                  {errors.origin && (
                    <p className="text-sm text-destructive">{errors.origin}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="checkOutDate">Check-out Date <span className="text-destructive">*</span></Label>
                <Input
                  id="checkOutDate"
                  name="checkOutDate"
                  type="date"
                  value={bookingDetails.checkOutDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={errors.checkOutDate ? "border-destructive" : ""}
                />
                {errors.checkOutDate && <p className="text-sm text-destructive">{errors.checkOutDate}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Select
                  name="guests"
                  value={String(bookingDetails.guests)}
                  onValueChange={(value) => setBookingDetails(prev => ({ ...prev, guests: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} {num === 1 ? "guest" : "guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-2" />

              {selectedRoom && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Type</span>
                    <span className="font-medium">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per night</span>
                    <span className="font-medium">Nu {selectedRoom.price.toFixed(2)}</span>
                  </div>
                  {days > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{days} {days === 1 ? "night" : "nights"}</span>
                      <span className="font-medium">Nu {totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Price</span>
                    <span>Nu {totalPrice.toFixed(2)}</span>
                  </div>
                  {days === 0 && bookingDetails.checkOutDate && (
                    <p className="text-sm text-amber-600">Please select a valid check-out date.</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 