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
import { CheckCircle, Users, Home, AlertTriangle, UserCheck } from "lucide-react";
import LoginModal from "../authentication/LoginModal"; // Assuming this is your LoginModal component
import { BookingSuccessModal } from "../../shared/components";
import { toast } from "sonner"; // Using sonner for toasts

export default function RoomBookingCard({ room, hotelId }) {
  const { userId, isAuthenticated, getCurrentActiveRole, switchToRole, hasRole } = useAuth();
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRoleSwitchDialog, setOpenRoleSwitchDialog] = useState(false);
  const [openBookingSuccessModal, setOpenBookingSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    checkOutDate: "",
    guests: 1,
    numberOfRooms: 1,
    phone: "",
    cid: "",
    destination: "",
    origin: "",
  });
  const [errors, setErrors] = useState({});

  const calculateDays = () => {
    if (!bookingDetails.checkOutDate) {
      return 0;
    }
    const today = new Date();
    const checkOut = new Date(bookingDetails.checkOutDate);
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * room.price * bookingDetails.numberOfRooms;
  };

  const validateForm = () => {
    console.log("Validating form with data:", bookingDetails);
    const newErrors = {};
    const validateBhutanesePhone = (phone) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      if (!cleanPhone) return "Phone number is required";
      if (!/^\d+$/.test(cleanPhone))
        return "Phone number should contain only digits";
      if (cleanPhone.length !== 8)
        return "Phone number must be exactly 8 digits";
      const mobilePattern = /^(17|77)\d{6}$/;
      if (!mobilePattern.test(cleanPhone))
        return "Invalid Bhutanese mobile number. Must start with 17 or 77.";
      return null;
    };

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

    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) newErrors.phone = phoneError;
    if (!bookingDetails.checkOutDate)
      newErrors.checkOutDate = "Check-out date is required";
    if (
      bookingDetails.checkOutDate &&
      new Date(bookingDetails.checkOutDate) <= new Date()
    ) {
      newErrors.checkOutDate = "Check-out must be after today";
    }
    if (!bookingDetails.guests)
      newErrors.guests = "Please select number of guests";
    
    console.log("Validation errors:", newErrors);
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]:
        name === "numberOfRooms" || name === "guests" ? parseInt(value) : value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setBookingDetails((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, validating...");
    const formErrors = validateForm();
    console.log("Form validation result:", formErrors);
    if (Object.keys(formErrors).length > 0) {
      console.log("Setting errors:", formErrors);
      setErrors(formErrors);
      return;
    }

    try {
      const payload = {
        ...bookingDetails,
        checkInDate: new Date().toISOString().split('T')[0], // Today's date
        roomId: room.id,
        hotelId: hotelId,
        totalPrice: calculateTotalPrice(),
        userId,
        days: calculateDays(),
      };
      const res = await api.post("/bookings", payload);
      if (res.status === 200) {
        // Prepare booking data for success modal
        const bookingData = {
          ...payload,
          id: res.data?.id || res.data?.bookingId || `booking_${Date.now()}`,
          hotelName: room.hotelName,
          roomNumber: room.roomNumber,
          room: room,
          bookingTime: new Date().toISOString()
        };
        
        // Set success data and show modal
        setSuccessBookingData(bookingData);
        setOpenBookingSuccessModal(true);
        
        // Show toast notification
        toast.success("Booking Successful!", {
          description: "Your room has been booked. QR code generated!",
          duration: 6000
        });
        
        // Reset form and close booking dialog
        setBookingDetails({
          checkOutDate: "",
          guests: 1,
          numberOfRooms: 1,
          phone: "",
          cid: "",
          destination: "",
          origin: "",
        });
        setErrors({});
        setOpenBookingDialog(false);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
        duration: 6000
      });
    }
  };

  // --- Core logic change: Handle opening of modals ---
  const handleBookNowClick = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }

    const currentRole = getCurrentActiveRole();
    
    // Check if user is Admin (SUPER_ADMIN) - prevent booking
    if (currentRole === "SUPER_ADMIN") {
      setOpenRoleSwitchDialog(true);
      return;
    }

    // If user is already in GUEST role, allow direct booking
    if (currentRole === "GUEST") {
      setErrors({}); // Reset errors when opening dialog
      setOpenBookingDialog(true);
      return;
    }

    // For all other roles, show role switch dialog to switch to GUEST
    setOpenRoleSwitchDialog(true);
  };

  // Handle role switching to Guest
  const handleSwitchToGuest = () => {
    if (hasRole("GUEST")) {
      switchToRole("GUEST");
      setOpenRoleSwitchDialog(false);
      toast.success("Switched to Guest role", {
        description: "You can now book rooms.",
        duration: 6000
      });
      // Open booking dialog after role switch
      setTimeout(() => {
        setErrors({}); // Reset errors when opening dialog after role switch
        setOpenBookingDialog(true);
      }, 500);
    }
  };

  // --- End of core logic change ---

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
          <span>
            Max Guests: {room.maxGuests > 0 ? room.maxGuests : "Not specified"}
          </span>
        </div>
        {/* Call the handler on button click, not DialogTrigger */}
        <Button onClick={handleBookNowClick}>Book Now</Button>
      </div>


      {/* Booking Dialog */}
      {/* This Dialog's `open` state is completely independent */}
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
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Book {room.hotelName}</DialogTitle>
            <DialogDescription>Room {room.roomNumber}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[50vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    +975
                  </span>
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
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
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
                <Label htmlFor="checkOutDate">
                  Check-out <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  name="checkOutDate"
                  type="date"
                  value={bookingDetails.checkOutDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={errors.checkOutDate ? "border-destructive" : ""}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-destructive">
                    {errors.checkOutDate}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Select
                    name="guests"
                    value={String(bookingDetails.guests)}
                    onValueChange={(value) =>
                      handleSelectChange("guests", value)
                    }
                  >
                    <SelectTrigger>
                      {/* Removed Users icon */}
                      <SelectValue
                        placeholder="Select guests"
                        className="pl-2"
                      />
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
                {/* Removed numberOfRooms (room) field */}
              </div>

              <Separator className="my-2" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="font-medium">
                    Nu {room.price.toFixed(2)}
                  </span>
                </div>
                {days > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {days} {days === 1 ? "night" : "nights"} ×{" "}
                      {bookingDetails.numberOfRooms} room(s)
                    </span>
                    <span className="font-medium">
                      Nu {totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Price</span>
                  <span>Nu {totalPrice.toFixed(2)}</span>
                </div>
                {days === 0 &&
                  bookingDetails.checkOutDate && (
                    <p className="text-sm text-amber-600">
                      Please select a valid check-out date.
                    </p>
                  )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Modal (only rendered if needed) */}
      {/* This Dialog's `open` state is entirely separate */}
      {openLoginModal && (
        <LoginModal
          onClose={() => setOpenLoginModal(false)} // Allows LoginModal to close itself and update parent state
        />
      )}

      {/* Role Switch Dialog */}
      <Dialog open={openRoleSwitchDialog} onOpenChange={setOpenRoleSwitchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Switch to Guest Role
            </DialogTitle>
            <DialogDescription>
              {getCurrentActiveRole() === "SUPER_ADMIN" 
                ? "Admin users cannot book rooms. Please switch to Guest role to enable booking functionality."
                : "To book rooms, you need to be in Guest role. Would you like to switch to Guest role now?"
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenRoleSwitchDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSwitchToGuest}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Switch to Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Success Modal with QR Code */}
      <BookingSuccessModal
        isOpen={openBookingSuccessModal}
        onClose={() => setOpenBookingSuccessModal(false)}
        bookingData={successBookingData}
      />
    </>
  );
}
