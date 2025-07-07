// HotelAdminDashboard.jsx
import React, { useState } from "react";
import {
  FiHome,
  FiCalendar,
  FiSettings,
  FiPieChart,
  FiInbox,
  FiPlus,
} from "react-icons/fi";
import { FaHotel, FaBed, FaBoxes, FaRegBell } from "react-icons/fa";
import SummaryCards from "../components/cards/SummaryCards.jsx";
import HotelInfoForm from "../components/hotel/HotelInfoForm.jsx";
import RoomManager from "../components/RoomManager.jsx";
import BookingTable from "../components/BookingTable.jsx";

const HotelAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hotel, setHotel] = useState({
    id: 1,
    name: "Taj Tashi Thimphu",
    type: "Luxury Hotel",
    district: "Thimphu",
    address: "Samten Lam, Thimphu",
    description:
      "A luxury hotel blending Bhutanese dzong architecture with contemporary design",
    contact: {
      phone: "+97517123456",
      email: "info@tajtashi.com",
    },
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    ],
    documents: {
      license: "taj_tashi_license.pdf",
    },
  });

  const [rooms, setRooms] = useState([
    {
      id: 1,
      type: "Deluxe Room",
      price: 220,
      maxGuests: 2,
      isAvailable: true,
      description: "Spacious room with king bed and mountain views",
      images: [
        "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      ],
      amenities: [
        { id: 1, name: "King Bed", icon: "bed" },
        { id: 2, name: "Smart TV", icon: "tv" },
        { id: 3, name: "Wi-Fi", icon: "wifi" },
        { id: 4, name: "Attached Bathroom", icon: "bath" },
      ],
    },
    {
      id: 2,
      type: "Suite",
      price: 350,
      maxGuests: 3,
      isAvailable: true,
      description: "Luxurious suite with separate living area",
      images: [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      ],
      amenities: [
        { id: 1, name: "King Bed", icon: "bed" },
        { id: 5, name: "Air Conditioning", icon: "ac" },
        { id: 6, name: "Safe Locker", icon: "safe" },
        { id: 7, name: "Balcony", icon: "balcony" },
      ],
    },
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 1,
      guest: {
        name: "Karma Dorji",
        email: "karma@example.com",
        phone: "+97517111222",
      },
      roomId: 1,
      roomType: "Deluxe Room",
      checkIn: "2023-06-15",
      checkOut: "2023-06-18",
      status: "confirmed",
      payment: { amount: 660, currency: "Nu.", status: "paid" },
    },
    {
      id: 2,
      guest: {
        name: "Dechen Wangmo",
        email: "dechen@example.com",
        phone: "+97517222333",
      },
      roomId: 2,
      roomType: "Suite",
      checkIn: "2023-06-20",
      checkOut: "2023-06-25",
      status: "pending",
      payment: { amount: 1750, currency: "Nu.", status: "pending" },
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New booking request for Suite",
      date: "2023-06-10",
      read: false,
    },
    {
      id: 2,
      message: "Your hotel was featured on homepage",
      date: "2023-06-08",
      read: true,
    },
  ]);

  const updateHotel = (updatedHotel) => {
    setHotel(updatedHotel);
  };

  const addRoom = (newRoom) => {
    setRooms([...rooms, { ...newRoom, id: Date.now() }]);
  };

  const updateRoom = (updatedRoom) => {
    setRooms(
      rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
    );
  };

  const deleteRoom = (id) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const updateBookingStatus = (id, status) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  const markNotificationAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-amber-600">YakRooms</h1>
          <p className="text-sm text-gray-500">Hotel Admin Panel</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "dashboard"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiHome className="mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("hotel")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "hotel"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaHotel className="mr-3" />
                Hotel Details
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("rooms")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "rooms"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaBed className="mr-3" />
                Room Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "inventory"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaBoxes className="mr-3" />
                Inventory Tracker
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "bookings"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiCalendar className="mr-3" />
                Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "analytics"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiPieChart className="mr-3" />
                Analytics
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center w-full px-4 py-2 rounded-lg ${
                  activeTab === "settings"
                    ? "bg-amber-100 text-amber-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FiSettings className="mr-3" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "hotel" && "Hotel Details"}
            {activeTab === "rooms" && "Room Management"}
            {activeTab === "inventory" && "Inventory Tracker"}
            {activeTab === "bookings" && "Booking Management"}
            {activeTab === "analytics" && "Analytics & Reports"}
            {activeTab === "settings" && "Settings"}
          </h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <FaRegBell />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                {/* <FiUser /> */}
              </div>
              <span className="ml-2 hidden md:inline">Hotel Owner</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <>
              <SummaryCards
                rooms={rooms}
                bookings={bookings}
                notifications={notifications}
                markAsRead={markNotificationAsRead}
              />

              <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                <BookingTable
                  bookings={bookings}
                  onStatusChange={updateBookingStatus}
                  viewMode="compact"
                />
              </div>
            </>
          )}

          {activeTab === "hotel" && (
            <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
          )}

          {activeTab === "rooms" && (
            <RoomManager
              rooms={rooms}
              onAdd={addRoom}
              onUpdate={updateRoom}
              onDelete={deleteRoom}
            />
          )}

          {activeTab === "inventory" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Room Inventory</h3>
              <p className="text-gray-500">Inventory tracking coming soon</p>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <BookingTable
                bookings={bookings}
                onStatusChange={updateBookingStatus}
                viewMode="full"
              />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">
                Analytics & Reports
              </h3>
              <p className="text-gray-500">Analytics dashboard coming soon</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <p className="text-gray-500">Settings panel coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelAdminDashboard;
