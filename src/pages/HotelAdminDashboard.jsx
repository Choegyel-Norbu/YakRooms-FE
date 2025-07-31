import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Settings,
  PieChart,
  Hotel,
  Bed,
  Package,
  Users,
  ArrowLeft,
  Building2,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StaffManager from "@/components/hotel/StaffManager.jsx";
import StaffCardGrid from "@/components/StaffCardGrid.jsx";
import RoomStatusTable from "@/components/hotel/RoomStatusTable.jsx";
import BookingsTrendChart from "@/components/hotel/BookingsTrendChart.jsx";
import MonthlyPerformanceChart from "@/components/hotel/MonthlyPerformanceChart.jsx";
import PasscodeVerification from "@/components/hotel/PasscodeVerification.jsx";
// import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
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
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_BASE_URL from "../../config.js";

// YakRooms Text Logo Component (copied from Navbar.jsx)
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    small: "text-lg font-bold",
    default: "text-xl font-bold",
    large: "text-2xl font-bold",
  };
  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const HotelAdminDashboard = () => {
  const { userId, userName, hotelId, lastLogin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const clientRef = useRef(null);
  const notificationRef = useRef(null);
  const [showStaffGrid, setShowStaffGrid] = useState(true);
  const [showPasscodeVerification, setShowPasscodeVerification] =
    useState(false);
  // Simple media query hook for small screens (max-width: 640px)
  const isMobile =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false;

  useEffect(() => {
    console.log("Hotel id :" + localStorage.getItem("hotelId"));
  }, [userId]);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const res = await api.get(`/hotels/${userId}`);
        setHotel(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchHotelData();
  }, [userId]);

  // Fetch all notifications from backend when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        setLoadingNotifications(true);
        const response = await api.get(`/notifications/user/${userId}`);
        const fetchedNotifications = response.data;

        // Sort notifications by createdAt (newest first) and calculate unread count
        const sortedNotifications = fetchedNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const unreadNotifications = sortedNotifications.filter(
          (notif) => !notif.isRead
        );

        setNotifications(sortedNotifications);
        setUnreadCount(unreadNotifications.length);

        console.log("[API] Fetched notifications:", sortedNotifications);
        console.log("[API] Unread count:", unreadNotifications.length);
      } catch (error) {
        console.error("[API] Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Mark all notifications as read via API
  const markAllNotificationsAsRead = async () => {
    try {
      await api.put(`/notifications/user/${userId}/markAllRead`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      console.log("[API] Successfully marked all notifications as read");
    } catch (error) {
      console.error("[API] Error marking notifications as read:", error);
    }
  };

  // Delete all notifications via API
  const deleteAllNotifications = async () => {
    try {
      await api.delete(`/notifications/user/${userId}`);

      // Update local state
      setNotifications([]);
      setUnreadCount(0);

      console.log("[API] Successfully deleted all notifications");
    } catch (error) {
      console.error("[API] Error deleting notifications:", error);
    }
  };

  // Real-time booking notification
  useEffect(() => {
    console.log("[WS] Initializing WebSocket Effect - userId:", userId);
    if (!userId) {
      console.log("[WS] No userId available, skipping WebSocket setup.");
      return;
    }

    // Clean up any existing connection first
    if (clientRef.current) {
      console.log(
        "[WS] Cleaning up existing WebSocket connection before creating new one"
      );
      if (clientRef.current.active) {
        clientRef.current.deactivate();
      }
      clientRef.current = null;
    }

    // Create a unique client for admin notifications
    const client = new Client({
      webSocketFactory: () => {
        console.log(`[WS] Creating SockJS connection to ${API_BASE_URL}/ws`);
        return new SockJS(`${API_BASE_URL}/ws`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log("[WS] STOMP Debug:", str),

      onConnect: (frame) => {
        console.log("[WS] ✅ WebSocket Connected Successfully!");
        console.log("[WS] Connection frame:", frame);

        const subscriptionTopic = `/topic/notifications/${userId}`;
        console.log("[WS] Subscribing to topic:", subscriptionTopic);

        const subscription = client.subscribe(
          subscriptionTopic,
          (message) => {
            console.log("=== [WS] 🔔 NOTIFICATION MESSAGE RECEIVED ===");
            console.log("[WS] Raw STOMP Frame:", message);
            console.log("[WS] Message Body:", message.body);
            console.log("[WS] Message Headers:", message.headers);

            try {
              const notification = JSON.parse(message.body);
              console.log(
                "[WS] ✅ Successfully parsed notification:",
                notification
              );

              // Add the notification to the state (it comes from backend with proper structure)
              const notificationWithTimestamp = {
                ...notification,
                // Convert backend createdAt to display format
                displayTime: new Date(notification.createdAt).toLocaleString(),
              };

              console.log(
                "[WS] Notification with timestamp:",
                notificationWithTimestamp
              );

              // Update state - add to beginning of array since it's newest
              setNotifications((prev) => {
                const updated = [notificationWithTimestamp, ...prev];
                console.log("[WS] Updated notifications:", updated);
                return updated;
              });

              // Only increment unread count if the notification is unread
              if (!notification.isRead) {
                setUnreadCount((prev) => {
                  const updated = prev + 1;
                  console.log("[WS] Updated unread count:", updated);
                  return updated;
                });
              }

              console.log("[WS] ✅ Notification processed successfully!");
            } catch (error) {
              console.error("[WS] ❌ Failed to parse notification:", error);
              console.error("[WS] Invalid message body:", message.body);
            }
          },
          {
            id: `sub-${userId}-${Date.now()}`,
            ack: "auto",
          }
        );

        console.log("[WS] ✅ Subscription created:", subscription);

        // Test the connection by sending a test message to ourselves (optional)
        setTimeout(() => {
          console.log("[WS] 🧪 Testing WebSocket connection...");
          try {
            // Send a ping to verify connection
            client.publish({
              destination: "/app/ping",
              body: JSON.stringify({ userId, timestamp: Date.now() }),
            });
            console.log("[WS] Test ping sent");
          } catch (e) {
            console.log("[WS] Could not send test ping:", e);
          }
        }, 1000);
      },

      onDisconnect: (frame) => {
        console.log("[WS] ❌ WebSocket Disconnected");
        console.log("[WS] Disconnect frame:", frame);
      },

      onStompError: (frame) => {
        console.error("[WS] ❌ STOMP Error:", frame.headers["message"]);
        console.error("[WS] Error body:", frame.body);
        console.error("[WS] Full error frame:", frame);
      },

      onWebSocketError: (event) => {
        console.error("[WS] ❌ WebSocket Error:", event);
      },

      onWebSocketClose: (event) => {
        console.log(
          `[WS] WebSocket Closed - Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`
        );
      },
    });

    // Activate the client
    console.log("[WS] 🚀 Activating WebSocket client...");
    clientRef.current = client;
    client.activate();

    // Cleanup
    return () => {
      console.log("[WS] 🧹 Cleanup: Deactivating WebSocket...");
      if (clientRef.current && clientRef.current.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
        console.log("[WS] ✅ WebSocket deactivated");
      }
    };
  }, [userId]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Handle notification dropdown click
  const handleNotificationClick = async () => {
    setShowNotifications((prev) => !prev);

    // Mark all as read when opening dropdown (only if there are unread notifications)
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    await deleteAllNotifications();
    setShowNotifications(false);
  };

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

  const formatLoginTime = (date) => {
    if (!date) return "Never";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "hotel", label: "Hotel Details", icon: Hotel },
    { id: "rooms", label: "Room Management", icon: Bed },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "inventory", label: "Inventory Tracker", icon: Package },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "booking", label: "Booking", icon: Calendar },
  ];

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      hotel: "Hotel Details",
      rooms: "Room Management",
      staff: "Staff Management",
      inventory: "Inventory Tracker",
      analytics: "Analytics & Reports",
      booking: "Booking Management",
    };
    return titles[activeTab] || "Dashboard";
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: "Overview of your hotel operations and recent activity",
      hotel: "Manage your hotel information and details",
      rooms: "Add, edit, and manage your room inventory",
      inventory: "Track and monitor your hotel inventory",
      staff: "Manage your hotel staff and their roles",
      analytics: "Insights and reports about your business performance",
      booking: "Manage and view your hotel bookings",
    };
    return descriptions[activeTab] || "Manage your hotel operations";
  };

  const NavigationButton = ({ item, onClick, isActive }) => {
    const Icon = item.icon;
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start transition-colors py-2 px-3 text-sm ${
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : "hover:bg-accent"
        }`}
        onClick={onClick}
      >
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
        <div className="p-4 lg:p-5 border-b">
          <div className="flex items-center gap-2 lg:gap-3 mb-3">
            <div>
              <YakRoomsText size="default" />
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

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

        <div className="p-3 lg:p-4 border-t">
          <Link to="/">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs lg:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
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
          <div className="px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center">
            <div className="space-y-0.5 flex-1 min-w-0">
              <h2 className="hidden md:block text-xl sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                  {getPageTitle()}
                </h2>
              {activeTab !== "dashboard" && (
                <p className="hidden md:block text-sm sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                  {getPageDescription()}
                </p>
              )}
              </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                  disabled={loadingNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}

                {showNotifications && (
                  <div className="fixed left-4 right-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 w-auto sm:w-80 bg-card border rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                            onClick={clearAllNotifications}
                          >
                            Clear all
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 sm:p-6 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 sm:p-6 text-center">
                          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 sm:p-4 transition-colors ${
                                notification.isRead
                                  ? "hover:bg-muted/50"
                                  : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-sm flex-1 line-clamp-2">
                                        {notification.title}
                                      </p>
                                      {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                      )}
                                    </div>
                                    {notification.type && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs mb-2"
                                      >
                                        {notification.type}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {notification.message}
                                </p>
                                <div className="flex justify-end">
                                  <span className="text-xs text-muted-foreground">
                                    {notification.displayTime ||
                                      new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>

              {/* Mobile Navigation Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden p-2">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 flex flex-col"
                >
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-3">
                      <div>
                        <YakRoomsText size="default" />
                        <p className="text-xs text-muted-foreground">
                          Admin Panel
                        </p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 flex flex-col p-4">
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

                    <div className="space-y-3 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-9 w-9 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {userName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {userName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            Hotel Administrator
                          </p>
                        </div>
                      </div>

                      <Link to="/" className="block">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Website
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Separator
                orientation="vertical"
                className="h-4 sm:h-6 hidden sm:block"
              />

              {/* Desktop User Menu - Hidden on mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 hidden md:flex"
                  >
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
                      <p className="text-sm font-medium leading-none truncate">
                        {userName}
                      </p>
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
        </header>

        {/* Dashboard Content */}
        <main className="py-4 sm:p-4 lg:p-6 space-y-4">
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              {/* Welcome Card */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                    <div>
                          <h3 className="text-lg sm:text-lg font-semibold text-foreground mb-1 truncate">
                        Welcome back, {userName}!
                      </h3>
                          <p className="text-sm text-muted-foreground">
                        Here's what's happening with your hotel today.
                      </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="hidden md:block flex-shrink-0 flex flex-col items-end gap-8">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-3 py-1"
                      >
                        Admin
                      </Badge>

                      <div className="text-left">
                        <p className="text-xs text-muted-foreground">Last login</p>
                        <p className="text-xs font-medium text-foreground">
                          {formatLoginTime(lastLogin)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Toggle for StaffCardGrid (visible on all screens) */}
              <div className="mb-2">
                <Button
                  variant={showStaffGrid ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => setShowStaffGrid((prev) => !prev)}
                >
                  {showStaffGrid
                    ? "Hide Staff Overview"
                    : "Show Staff Overview"}
                </Button>
              </div>

              {showStaffGrid && <StaffCardGrid hotelId={hotelId} />}

              {/* Charts Section */}
              <div className="space-y-8">
                <BookingsTrendChart />
                <MonthlyPerformanceChart />
              </div>
            </div>
          )}

          {activeTab === "hotel" && hotel && (
            <div className="space-y-4">
              <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
            </div>
          )}

          {activeTab === "rooms" && (
            <Card>
              <CardHeader className="">
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
                <div className="text-center py-8 lg:py-12">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Inventory Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto px-4">
                    Advanced inventory management features are being developed
                    and will be available soon.
                  </p>
                  <Button variant="outline" className="mt-4 text-sm">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "staff" && ( // Changed from "bookings" to "staff"
            <Card>
              <CardHeader className="">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-4 w-4 text-primary" />{" "}
                  {/* Changed icon */}
                  Staff Management {/* Changed title */}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:px-6 md:pb-6">
                <StaffManager /> {/* Changed component */}
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <Card>
              <CardContent className="p-0 md:px-6 md:pb-6">
                <div className="space-y-8">
                  <BookingsTrendChart />
                  <MonthlyPerformanceChart />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4">
              {/* Passcode Verification Toggle */}
              <div className="mb-2">
                <Button
                  variant={showPasscodeVerification ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => setShowPasscodeVerification((prev) => !prev)}
                >
                  {showPasscodeVerification
                    ? "Hide Passcode Verification"
                    : "Show Passcode Verification"}
                </Button>
              </div>

              {showPasscodeVerification && <PasscodeVerification />}

              {/* Booking Table */}
            <Card>
                <CardHeader className="">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    Recent Bookings
                </CardTitle>
              </CardHeader>
                <CardContent className="p-0 md:px-6 md:pb-6">
                  <div className="overflow-x-auto" data-booking-table>
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
        </main>
      </div>
    </div>
  );
};

export default HotelAdminDashboard;
