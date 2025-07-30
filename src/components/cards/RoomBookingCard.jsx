import { useState, useEffect } from "react";
import { useAuth } from "../../services/AuthProvider.jsx";
import api from "../../services/Api.jsx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Users, Home, AlertTriangle, UserCheck } from "lucide-react";
import LoginModal from "../LoginModal.jsx"; // Assuming this is your LoginModal component
import { toast } from "sonner"; // Using sonner for toasts

export default function RoomBookingCard({ room, hotelId }) {
  const { userId, isAuthenticated, getCurrentActiveRole, switchToRole, hasRole } = useAuth();
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRoleSwitchDialog, setOpenRoleSwitchDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    checkOutDate: "",
    guests: 1,
    numberOfRooms: 1,
    phone: "",
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
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]:
        name === "numberOfRooms" || name === "guests" ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setBookingDetails((prev) => ({
      ...prev,
      [name]: parseInt(value),
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
        toast.success("Booking Successful!", {
          description: "Your room has been booked.",
        });
        setBookingDetails({
          checkOutDate: "",
          guests: 1,
          numberOfRooms: 1,
          phone: "",
        });
        setErrors({});
        setOpenBookingDialog(false);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
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

    // Check if user has Guest role available
    if (hasRole("GUEST")) {
      setOpenRoleSwitchDialog(true);
      return;
    }

    // Allow booking for other roles (HOTEL_ADMIN, STAFF, GUEST)
    setOpenBookingDialog(true);
  };

  // Handle role switching to Guest
  const handleSwitchToGuest = () => {
    if (hasRole("GUEST")) {
      switchToRole("GUEST");
      setOpenRoleSwitchDialog(false);
      toast.success("Switched to Guest role", {
        description: "You can now book rooms.",
      });
      // Open booking dialog after role switch
      setTimeout(() => {
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
      <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {room.hotelName}</DialogTitle>
            <DialogDescription>Room {room.roomNumber}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
    </>
  );
}
