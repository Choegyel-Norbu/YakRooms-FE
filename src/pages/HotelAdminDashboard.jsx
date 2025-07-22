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
        className={`w-full justify-start transition-colors text-sm sm:text-base ${
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : "hover:bg-accent"
        }`}
        onClick={onClick}
      >
        <Icon className="mr-2 sm:mr-3 h-4 w-4" />
        <span className="text-xs sm:text-sm md:text-base">{item.label}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </Button>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-56 lg:w-64 bg-card shadow-sm hidden md:block border-r">
        <div className="p-4 lg:p-6 border-b">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <div className="p-1.5 lg:p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-foreground">YakRooms</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm">
              <ArrowLeft className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              Back to Website
            </Button>
          </Link>
        </div>

        <nav className="p-3 lg:p-4">
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b sticky top-0 z-10">
          <div className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5 lg:space-y-1 flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                  {getPageTitle()}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                  {getPageDescription()}
                </p>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Mobile Navigation Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden p-2">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <SheetHeader className="p-4 sm:p-6 border-b">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-lg font-bold text-foreground">YakRooms</h1>
                          <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="p-4">
                      {/* User Profile Section in Mobile Sidebar */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
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

                      <Link to="/" className="block mb-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Website
                        </Button>
                      </Link>
                      
                      <nav className="space-y-1">
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
        <main className="p-0 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
          {activeTab === "dashboard" && (
            <div className="space-y-4 lg:space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-0 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 truncate">
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6 pt-0">
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
            <div className="space-y-4 lg:space-y-6">
              <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
            </div>
          )}

          {activeTab === "rooms" && (
            <Card>
              <CardHeader className="">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Room Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6 pt-0">
                <RoomManager />
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Room Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6 pt-0">
                <div className="text-center py-12 lg:py-16">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6 pt-0">
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6 pt-0">
                <div className="text-center py-12 lg:py-16">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <PieChart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6 pt-0">
                <div className="text-center py-12 lg:py-16">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
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