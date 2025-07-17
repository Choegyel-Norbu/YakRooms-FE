import React, { useEffect, useState } from "react";
import {
  Home,
  Calendar,
  Settings,
  PieChart,
  Hotel,
  Bed,
  Package,
  Bell,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SummaryCards from "../components/cards/SummaryCards.jsx";
import HotelInfoForm from "../components/hotel/HotelInfoForm.jsx";
import RoomManager from "../components/RoomManager.jsx";
import BookingTable from "../components/hotel/BookingTable.jsx";
import { useAuth } from "../services/AuthProvider.jsx";
import api from "../services/Api.jsx";

const HotelAdminDashboard = () => {
  const { userId, userName } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    console.log("Hotel admin panel");
    console.log("User id :" + userId);
    const fetchHotelData = async () => {
      try {
        console.log("Inside try... ");
        const res = await api.get(`/hotels/${userId}`);
        console.log("Booking: " + res.data);
        console.log("After try... ");
        setHotel(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAllBookings = async () => {
      try {
        const res = await api.get(`/bookings`);
        setBookings(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAllNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchHotelData();
    fetchAllBookings();
  }, []);

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

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "hotel", label: "Hotel Details", icon: Hotel },
    { id: "rooms", label: "Room Management", icon: Bed },
    { id: "inventory", label: "Inventory Tracker", icon: Package },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      hotel: "Hotel Details",
      rooms: "Room Management",
      inventory: "Inventory Tracker",
      bookings: "Booking Management",
      analytics: "Analytics & Reports",
      settings: "Settings",
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-amber-600">YakRooms</h1>
          <p className="text-sm text-muted-foreground">Hotel Admin Panel</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === item.id
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your hotel operations
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="h-5 w-5" />
                  {notifications.some((n) => !n.read) && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-100 text-amber-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-3 space-y-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingTable
                    bookings={bookings}
                    onStatusChange={updateBookingStatus}
                    viewMode="compact"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "hotel" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
              </CardContent>
            </Card>
          )}

          {activeTab === "rooms" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Room Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoomManager />
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Room Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Inventory Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced inventory management features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BookingTable
                  bookings={bookings}
                  onStatusChange={updateBookingStatus}
                  viewMode="full"
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Business Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Comprehensive analytics dashboard with insights and reports
                    coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    System Settings
                  </h3>
                  <p className="text-muted-foreground">
                    Configure your hotel management preferences and system
                    settings
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelAdminDashboard;
