import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Settings,
  PieChart,
  Hotel,
  Bed,
  Package,
  User,
  ArrowLeft,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HotelInfoForm from "../components/hotel/HotelInfoForm.jsx";
import RoomManager from "../components/RoomManager.jsx";
import BookingTable from "../components/hotel/BookingTable.jsx";
import { useAuth } from "../services/AuthProvider.jsx";
import api from "../services/Api.jsx";

const HotelAdminDashboard = () => {
  const { userId, userName, logout, hotelId } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log("Hotel id :" + localStorage.getItem("hotelId"));
  }, [userId]);

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

    

    fetchHotelData();
  }, []);

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

  const getPageDescription = () => {
    const descriptions = {
      dashboard: "Overview of your hotel operations and recent activity",
      hotel: "Manage your hotel information and details",
      rooms: "Add, edit, and manage your room inventory",
      inventory: "Track and monitor your hotel inventory",
      bookings: "View and manage all customer bookings",
      analytics: "Insights and reports about your business performance",
      settings: "Configure your account and system preferences",
    };
    return descriptions[activeTab] || "Manage your hotel operations";
  };

  const NavigationButton = ({ item, onClick, isActive }) => {
    const Icon = item.icon;
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        // Reduced padding for tighter mobile spacing
        className={`w-full justify-start transition-colors py-2 px-3 text-sm ${
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : "hover:bg-accent"
        }`}
        onClick={onClick}
      >
        {/* Consistent icon spacing for mobile */}
        <Icon className="mr-2 h-4 w-4" />
        <span className="text-sm">{item.label}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </Button>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-56 lg:w-64 bg-card shadow-sm hidden md:block border-r flex flex-col">
        {/* Reduced padding for desktop sidebar header */}
        <div className="p-4 lg:p-5 border-b">
          <div className="flex items-center gap-2 lg:gap-3 mb-3">
            <div className="p-1.5 lg:p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-foreground">YakRooms</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Reduced padding for desktop navigation - takes up remaining space */}
        <nav className="p-3 lg:p-4 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavigationButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* Desktop back button moved to bottom with colorful styling */}
        <div className="p-3 lg:p-4 border-t">
          <Link to="/">
            <Button variant="default" size="sm" className="w-full text-xs lg:text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowLeft className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              Back to Website
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b sticky top-0 z-10">
          {/* Reduced header padding for mobile - breathing room from edges */}
          <div className="px-4 py-3 lg:px-6 lg:py-4">
            <div className="flex justify-between items-center">
              {/* Mobile-optimized typography hierarchy */}
              <div className="space-y-0.5 flex-1 min-w-0">
                {/* Optimized font size for mobile readability */}
                <h2 className="text-xl sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                  {getPageTitle()}
                </h2>
                {/* Hide description for dashboard tab to save space */}
                {activeTab !== "dashboard" && (
                  <p className="text-sm sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                    {getPageDescription()}
                  </p>
                )}
              </div>

              {/* Adjusted spacing between header elements */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Mobile Navigation Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden p-2">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                    {/* Mobile sidebar header with proper spacing */}
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          {/* Consistent mobile typography */}
                          <h1 className="text-lg font-bold text-foreground">YakRooms</h1>
                          <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    
                    {/* Mobile sidebar content with navigation */}
                    <div className="flex-1 flex flex-col p-4">
                      {/* Mobile navigation with tighter spacing */}
                      <nav className="space-y-1 flex-1">
                        {navigationItems.map((item) => (
                          <NavigationButton
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                          />
                        ))}
                      </nav>

                      {/* User info and home button moved to bottom */}
                      <div className="space-y-3 mt-4 pt-4 border-t">
                        {/* User Profile Section at bottom */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="h-9 w-9 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {userName?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground mt-1">
                              Hotel Administrator
                            </p>
                          </div>
                        </div>

                        {/* Back to website button at bottom - made colorful */}
                        <Link to="/" className="block">
                          <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Website
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />

                {/* Desktop User Menu - Hidden on mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 hidden md:flex">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                          {userName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 sm:w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Hotel Administrator
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Return to Website</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {/* Removed horizontal padding for content - full width layout */}
        <main className="py-4 sm:p-4 lg:p-6 space-y-4">
          {activeTab === "dashboard" && (
            // Reduced vertical spacing between dashboard elements
            <div className="space-y-4">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                {/* Optimized card content padding for mobile */}
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      {/* Mobile-optimized welcome text size */}
                      <h3 className="text-lg sm:text-lg font-semibold text-foreground mb-1 truncate">
                        Welcome back, {userName}!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Here's what's happening with your hotel today.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  {/* Consistent mobile heading size */}
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                {/* Removed card content padding to prevent horizontal scroll */}
                <CardContent className="p-0 md:px-6 md:pb-6">
                  <div className="overflow-x-auto">
                    <BookingTable
                      hotelId={hotelId}
                      bookings={bookings}
                      onStatusChange={updateBookingStatus}
                      viewMode="compact"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "hotel" && hotel && (
            // Consistent spacing for hotel section
            <div className="space-y-4">
              <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
            </div>
          )}

          {activeTab === "rooms" && (
            <Card>
              {/* Consistent card header padding */}
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bed className="h-4 w-4 text-primary" />
                  Room Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:px-6 md:pb-6">
                <RoomManager />
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4 text-primary" />
                  Room Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:px-6 md:pb-6">
                {/* Reduced padding for mobile empty state */}
                <div className="text-center py-8 lg:py-12">
                  {/* Smaller icon for mobile */}
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  {/* Optimized heading size for mobile */}
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Inventory Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto px-4">
                    Advanced inventory management features are being developed and will be available soon.
                  </p>
                  <Button variant="outline" className="mt-4 text-sm">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "bookings" && (
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:px-6 md:pb-6">
                <div className="overflow-x-auto">
                  <BookingTable
                    hotelId={hotelId}
                    bookings={bookings}
                    onStatusChange={updateBookingStatus}
                    viewMode="full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="h-4 w-4 text-primary" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:px-6 md:pb-6">
                {/* Optimized empty state for mobile */}
                <div className="text-center py-8 lg:py-12">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <PieChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Business Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto px-4">
                    Comprehensive analytics dashboard with insights and reports is coming soon.
                  </p>
                  <Button variant="outline" className="mt-4 text-sm">
                    Preview Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-4 w-4 text-primary" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:px-6 md:pb-6">
                {/* Mobile-optimized settings empty state */}
                <div className="text-center py-8 lg:py-12">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    System Settings
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto px-4">
                    Configure your hotel management preferences and system settings.
                  </p>
                  <Button variant="outline" className="mt-4 text-sm">
                    Open Settings
                  </Button>
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