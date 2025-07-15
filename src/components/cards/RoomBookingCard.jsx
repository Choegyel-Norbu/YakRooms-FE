import { useState } from "react";
import { FiCheckCircle, FiCalendar, FiUsers, FiHome } from "react-icons/fi";
import { useAuth } from "../../services/AuthProvider.jsx";
import api from "../../services/Api.jsx";

export default function RoomBookingCard({ room }) {
  const { userId } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    numberOfRooms: 1,
    phone: "",
  });
  const [errors, setErrors] = useState({});

  // Calculate number of days between check-in and check-out
  const calculateDays = () => {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
      return 0;
    }

    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff > 0 ? daysDiff : 0;
  };

  // Calculate total price based on days and number of rooms
  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * room.price * bookingDetails.numberOfRooms;
  };

  const validateForm = () => {
    const newErrors = {};

    // Bhutanese mobile number validation
    const validateBhutanesePhone = (phone) => {
      // Remove any spaces, dashes, or other formatting
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

      // Check if empty
      if (!cleanPhone) {
        return "Phone number is required";
      }

      // Check if it contains only digits
      if (!/^\d+$/.test(cleanPhone)) {
        return "Phone number should contain only digits";
      }

      // Check length - must be exactly 8 digits
      if (cleanPhone.length !== 8) {
        return "Phone number must be exactly 8 digits";
      }

      // Mobile number patterns (start with 17 or 77)
      const mobilePattern = /^(17|77)\d{6}$/;

      // Check if it's a valid mobile number
      if (mobilePattern.test(cleanPhone)) {
        return null; // Valid mobile number
      }

      // If pattern doesn't match
      return "Invalid Bhutanese mobile number. Must start with 17 or 77.";
    };

    const phoneError = validateBhutanesePhone(bookingDetails.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (!bookingDetails.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    }

    if (!bookingDetails.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required";
    }

    if (
      bookingDetails.checkInDate &&
      bookingDetails.checkOutDate &&
      new Date(bookingDetails.checkOutDate) <=
        new Date(bookingDetails.checkInDate)
    ) {
      newErrors.checkOutDate = "Check-out must be after check-in date";
    }

    if (!bookingDetails.guests) {
      newErrors.guests = "Please select number of guests";
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    // Handle booking submission here
    const payload = {
      ...bookingDetails,
      roomId: room.id,
      totalPrice: calculateTotalPrice(),
      userId,
      days: calculateDays(),
    };
    const res = await api.post("/bookings", payload);
    if (res.status === 200) {
      console.log("Booking successful");

      // Reset form to initial state
      setBookingDetails({
        checkInDate: "",
        checkOutDate: "",
        guests: 1,
        numberOfRooms: 1,
        phone: "",
      });

      // Clear any errors
      setErrors({});

      // Close modal
      setShowBookingModal(false);
    }
    setShowBookingModal(false);
  };

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      {/* Existing card code... */}
      <div className="w-full mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <FiCheckCircle className="text-green-500 mr-1" />
          <span>
            Max Guests: {room.maxGuests > 0 ? room.maxGuests : "Not specified"}
          </span>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Book Now
        </button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Book {room.hotelName} - Room {room.roomNumber}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {/* Prefix label */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                      +975
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      placeholder="17123456"
                      className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="checkInDate"
                        value={bookingDetails.checkInDate}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 text-gray-500 text-14 border rounded-lg focus:ring-2 ${
                          errors.checkInDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-amber-500"
                        }`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <FiCalendar className="absolute left-3 top-[2.1rem] text-gray-400" />
                    </div>
                    {errors.checkInDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.checkInDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="checkOutDate"
                        value={bookingDetails.checkOutDate}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 text-14 py-2  text-gray-500 border rounded-lg focus:ring-2 ${
                          errors.checkOutDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-amber-500"
                        }`}
                        min={
                          bookingDetails.checkInDate ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                      <FiCalendar className="absolute left-3 top-[2.1rem] text-gray-400" />
                    </div>
                    {errors.checkOutDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.checkOutDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Guests and Rooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <div className="relative">
                      <select
                        name="guests"
                        value={bookingDetails.guests}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                      <FiUsers className="absolute left-3 top-[0.9rem] text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms
                    </label>
                    <div className="relative">
                      <select
                        name="numberOfRooms"
                        value={bookingDetails.numberOfRooms}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "room" : "rooms"}
                          </option>
                        ))}
                      </select>
                      <FiHome className="absolute left-3 top-[0.9rem] text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Room price per night</span>
                    <span className="font-medium">
                      Nu {room.price.toFixed(2)}
                    </span>
                  </div>

                  {days > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">
                        {days} {days === 1 ? "night" : "nights"} ×{" "}
                        {bookingDetails.numberOfRooms} room(s)
                      </span>
                      <span className="font-medium">
                        Nu {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span>Nu {totalPrice.toFixed(2)}</span>
                  </div>

                  {days === 0 &&
                    bookingDetails.checkInDate &&
                    bookingDetails.checkOutDate && (
                      <p className="text-amber-600 text-sm mt-2">
                        Please select valid check-in and check-out dates
                      </p>
                    )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
