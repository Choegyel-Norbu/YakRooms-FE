import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  PieChart,
  Hotel,
  Bed,
  Package,
  Users,
  ArrowLeft,
  List,
  X,
  Bell,
  Trash2,
  CreditCard,
  CheckCircle,
  Settings,
  Lock,
  Clock,
  User,
  Shield,
  AlertTriangle,
  ChevronDown,
  Upload,
  Camera,
  Loader2,
  Check,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";
import { Badge } from "@/shared/components/badge";
import { Avatar, AvatarFallback } from "@/shared/components/avatar";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import StaffManager from "./StaffManager";
import StaffCardGrid from "../admin/StaffCardGrid";
import RoomStatusTable from "./RoomStatusTable";
import BookingsTrendChart from "./BookingsTrendChart";
import MonthlyPerformanceChart from "./MonthlyPerformanceChart";
import PasscodeVerification from "./PasscodeVerification";
// import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/tabs";
import HotelInfoForm from "./HotelInfoForm";
import RoomManager from "../admin/RoomManager";
import BookingTable from "./BookingTable";
import CancellationRequestsTable from "./CancellationRequestsTable";
import AdminBookingForm from "./AdminBookingForm";
import CIDVerification from "./CIDVerification";
import BookingsInventoryTable from "./BookingsInventoryTable";
import LeaveManagement from "./LeaveManagement";
import BookingCalendar from "./BookingCalendar";
import { useAuth } from "../authentication";
import { getStorageItem, clearStorage } from "@/shared/utils/safariLocalStorage";
import api from "../../shared/services/Api";
import { TopHotelBadge } from "../../shared/components";
import { API_BASE_URL } from "../../shared/services/firebaseConfig";
import { toast } from "sonner";
import { EzeeRoomLogo } from "@/shared/components";
import SubscriptionExpirationNotification from "@/shared/components/SubscriptionExpirationNotification";
import { uploadFile } from "../../shared/services/uploadService";
import { calculateDaysUntil } from "@/shared/utils/subscriptionUtils";

const HotelAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userId,
    userName,
    hotelId,
    selectedHotelId,
    lastLogin,
    roles,
    isTopHotel,
    topHotelIds,
    subscriptionPlan,
    subscriptionIsActive,
    subscriptionNextBillingDate,
    subscriptionExpirationNotification,
    fetchUserHotels,
    fetchSubscriptionData,
    userHotels,
    setSelectedHotelId,
    getSelectedHotel,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [showStaffGrid, setShowStaffGrid] = useState(false);
  const [verificationTab, setVerificationTab] = useState("cid-verification"); // "cid-verification" or "passcode"
  const [leaveNotificationCount, setLeaveNotificationCount] = useState(0);
  const [leaveNotifications, setLeaveNotifications] = useState([]);
  const [loadingLeaveNotifications, setLoadingLeaveNotifications] = useState(false);
  const [showLeaveNotifications, setShowLeaveNotifications] = useState(false);
  const fetchingLeaveNotificationsRef = useRef(false);
  
  // File upload states for denied verification
  const [tradeLicense, setTradeLicense] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  // Use selected hotel ID if available, otherwise fall back to hotelId
  const currentHotelId = selectedHotelId || hotelId;

  // Check if subscription is expired
  // Subscription is expired if the expiration date has passed (daysUntilExpiration <= 0)
  // The subscription is valid until the expiration date, regardless of the isActive flag
  const isSubscriptionExpired = () => {
    if (!subscriptionNextBillingDate) {
      // If no billing date, use isActive flag as fallback
      return subscriptionIsActive === false;
    }
    
    const daysUntilExpiration = calculateDaysUntil(subscriptionNextBillingDate);
    // Subscription is expired if the date has passed (including today, as expiration date means expired)
    // If daysUntilExpiration > 0, subscription is still valid until that date
    return daysUntilExpiration <= 0;
  };

  // Define which tabs should be locked when subscription is expired
  const lockedTabs = ["rooms", "hotel", "analytics", "staff", "inventory", "leave"];

  // Redirect to dashboard if user doesn't have access to current tab
  useEffect(() => {
    if (activeTab === "staff" && roles && roles.includes("STAFF")) {
      setActiveTab("dashboard");
    }
    
    // Redirect FRONTDESK users away from restricted tabs
    if (roles && roles.includes("FRONTDESK") && !["dashboard", "booking", "leave"].includes(activeTab)) {
      setActiveTab("dashboard");
      toast.error("This feature is not available for Front Desk users.", {
        duration: 4000
      });
    }
    
    // Redirect to dashboard if trying to access locked tabs with expired subscription
    if (isSubscriptionExpired() && lockedTabs.includes(activeTab)) {
      setActiveTab("dashboard");
      toast.error("This feature is not available with an expired subscription.", {
        duration: 4000
      });
    }
  }, [activeTab, roles, subscriptionIsActive, subscriptionPlan]);

  // Simple media query hook for small screens (max-width: 640px)
  const isMobile =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false;

  useEffect(() => {
    console.log("Hotel id :" + getStorageItem("hotelId"));
  }, [userId]);

  // Debug logging for top hotel functionality
  useEffect(() => {
    console.log("🏨 [TOP HOTEL DEBUG] Hotel Dashboard Values:");
    console.log("  - currentHotelId:", currentHotelId);
    console.log("  - selectedHotelId:", selectedHotelId);
    console.log("  - hotelId:", hotelId);
    console.log("  - topHotelIds:", topHotelIds);
    console.log("  - topHotelIds length:", topHotelIds?.length);
    console.log("  - isTopHotel function exists:", typeof isTopHotel);

    if (currentHotelId) {
      const isTop = isTopHotel(currentHotelId);
      console.log("  - isTopHotel(" + currentHotelId + "):", isTop);
      console.log("  - currentHotelId type:", typeof currentHotelId);
      console.log(
        "  - topHotelIds includes currentHotelId:",
        topHotelIds?.includes(currentHotelId)
      );

      // Check if there's a type mismatch
      if (topHotelIds?.length > 0) {
        console.log("  - topHotelIds[0] type:", typeof topHotelIds[0]);
        console.log("  - topHotelIds content:", JSON.stringify(topHotelIds));
      }
    } else {
      console.log("  - No currentHotelId found!");
    }
    console.log("🏨 [END DEBUG]");
  }, [currentHotelId, selectedHotelId, hotelId, topHotelIds, isTopHotel]);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        // Use currentHotelId if available, otherwise fall back to userId for backward compatibility
        const hotelIdToUse = currentHotelId || userId;
        const res = await api.get(`/hotels/${hotelIdToUse}`);
        setHotel(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (currentHotelId || userId) {
      fetchHotelData();
    }
  }, [currentHotelId, userId]);

  // Reset documentsSubmitted state when hotel changes or verification status changes
  useEffect(() => {
    setDocumentsSubmitted(false);
    setTradeLicense(null);
    setIdProof(null);
    setUploadErrors({});
  }, [currentHotelId, hotel?.isVerified, hotel?.verificationDenialReason]);

  // Fetch user hotels when component mounts
  useEffect(() => {
    if (userId && fetchUserHotels) {
      fetchUserHotels(userId);
    }
  }, [userId, fetchUserHotels]);

  // Ensure subscription status is fresh after returning from subscription flow
  useEffect(() => {
    const shouldRefreshByUrl = () => {
      try {
        const params = new URLSearchParams(location.search || "");
        return (
          params.get("refreshSubscription") === "1" ||
          params.get("subscribed") === "1" ||
          params.get("subscription") === "active"
        );
      } catch (_) {
        return false;
      }
    };

    const isAdminRole = roles?.includes("HOTEL_ADMIN") || roles?.includes("MANAGER");
    const needsRefresh = subscriptionIsActive == null || shouldRefreshByUrl();

    if (userId && isAdminRole && needsRefresh && typeof fetchSubscriptionData === "function") {
      // Force refresh to get latest subscription status
      fetchSubscriptionData(userId, true, selectedHotelId).finally(() => {
        // Clean URL query params after using them
        if (shouldRefreshByUrl()) {
          const cleanUrl = window.location.pathname + window.location.hash;
          navigate(cleanUrl, { replace: true });
        }
      });
    }
  }, [userId, roles, subscriptionIsActive, selectedHotelId, location.search, fetchSubscriptionData, navigate]);


  // Fetch all notifications from backend when component mounts or hotel changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || !currentHotelId) return;

      try {
        setLoadingNotifications(true);
        const response = await api.get(`/notifications/hotel/${currentHotelId}/unread`);
        const fetchedNotifications = response.data;

        // Filter notifications to show BOOKING_CREATED and BOOKING_CANCELLATION_REQUEST types
        const filteredNotifications = fetchedNotifications.filter(
          (notif) => notif.type === "HOTEL_BOOKING_CREATED" || notif.type === "HOTEL_CANCELLATION_REQUEST"
        );

        // Sort notifications by createdAt (newest first) and calculate unread count
        const sortedNotifications = filteredNotifications.sort(
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
  }, [userId, currentHotelId]);

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

  // Note: Real-time booking notifications were previously handled via WebSocket
  // For now, notifications will need to be fetched manually or via polling

  // Fetch leave notifications function
  const fetchLeaveNotifications = useCallback(async () => {
    if (currentHotelId && !fetchingLeaveNotificationsRef.current) {
      try {
        fetchingLeaveNotificationsRef.current = true;
        setLoadingLeaveNotifications(true);
        const response = await api.get(`/leaves/notifications`);
        
        // API returns an array of notification objects with structure:
        // { id, username, roomNumber, guestName, hotelName, hotelId, title, message, type, isRead, createdAt }
        const notifications = response.data || [];
        
        // Sort notifications by createdAt (newest first)
        const sortedNotifications = notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Filter for unread notifications (isRead === false)
        const unreadNotifications = sortedNotifications.filter(n => n.isRead === false);
        const unreadCount = unreadNotifications.length;
        
        setLeaveNotifications(sortedNotifications);
        setLeaveNotificationCount(unreadCount);
        
        // Auto-expand notifications section if there are unread notifications and leave tab is active
        if (unreadCount > 0 && activeTab === "leave") {
          setShowLeaveNotifications(true);
        }
        
        console.log("[API] Fetched leave notifications:", sortedNotifications);
        console.log("[API] Unread leave notification count:", unreadCount);
      } catch (error) {
        console.error("[API] Error fetching leave notifications:", error);
        // Don't show error toast as this is a background operation
        setLeaveNotifications([]);
        setLeaveNotificationCount(0);
      } finally {
        setLoadingLeaveNotifications(false);
        fetchingLeaveNotificationsRef.current = false;
      }
    }
  }, [currentHotelId, activeTab]);

  // Fetch leave notifications on component mount
  useEffect(() => {
    fetchLeaveNotifications();
  }, [fetchLeaveNotifications]);

  // Refresh leave notifications when leave tab is clicked
  useEffect(() => {
    if (activeTab === "leave") {
      fetchLeaveNotifications();
    }
  }, [activeTab, fetchLeaveNotifications]);

  // Mark leave notification as read
  const markLeaveNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      // Update local state
      setLeaveNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      setLeaveNotificationCount((prev) => Math.max(0, prev - 1));
      
      console.log("[API] Successfully marked leave notification as read");
    } catch (error) {
      console.error("[API] Error marking leave notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

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

  const handleBookingSuccess = () => {
    // Bookings will be refreshed automatically by the BookingTable component
  };

  // Handle hotel switching
  const handleHotelSwitch = async (newHotelId) => {
    try {
      setSelectedHotelId(newHotelId);
      
      // Refresh hotel data for the new hotel
      const res = await api.get(`/hotels/${newHotelId}`);
      setHotel(res.data);
      
      // Reset notifications for the new hotel
      setNotifications([]);
      setUnreadCount(0);
      
      // Subscription data will be automatically refreshed by AuthProvider when setSelectedHotelId is called
      console.log("🔄 Hotel switched to:", newHotelId, "- subscription data will be refreshed automatically");
    } catch (error) {
      console.error("Failed to switch hotel:", error);
    }
  };

  // Handle file upload for verification documents
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (4MB limit per file)
    const maxFileSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxFileSize) {
      setUploadErrors((prev) => ({ 
        ...prev, 
        [field]: `File size too large: ${file.name}. File must be smaller than 4MB. Please compress your file and try again.`
      }));
      return;
    }

    const fileData = {
      file: file,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    };

    if (field === 'tradeLicense') {
      setTradeLicense(fileData);
    } else if (field === 'idProof') {
      setIdProof(fileData);
    }

    // Clear all errors when any file is selected (since at least one is required)
    setUploadErrors({});
  };

  // Handle submission of new verification documents
  const handleSubmitNewDocuments = async (e) => {
    e.preventDefault();

    // Prevent resubmission
    if (documentsSubmitted) {
      toast.error("Documents have already been submitted. Please wait for verification.");
      return;
    }

    // Validate that at least one file is selected
    if (!tradeLicense?.file && !idProof?.file) {
      setUploadErrors({ 
        tradeLicense: "Please upload at least one document",
        idProof: "Please upload at least one document"
      });
      toast.error("Please upload at least one document");
      return;
    }

    setIsUploadingFiles(true);

    try {
      // Only upload files that are actually selected
      const uploadPromises = [];
      if (tradeLicense?.file) {
        uploadPromises.push(uploadFile(tradeLicense.file, "license"));
      }
      if (idProof?.file) {
        uploadPromises.push(uploadFile(idProof.file, "idProof"));
      }

      const uploadResults = await Promise.all(uploadPromises);

      // Prepare update data
      const updateData = {};
      uploadResults.forEach((result) => {
        if (result.field === "license") {
          updateData.licenseUrl = result.url;
        } else if (result.field === "idProof") {
          updateData.idProofUrl = result.url;
        }
      });

      // Reset verification denial reason and resubmit for verification
      updateData.isVerified = false;
      updateData.verificationDenialReason = null;
      updateData.hotelResubmit = true;

      // Update hotel with new documents
      const response = await api.put(`/hotels/${currentHotelId}`, updateData);

      if (response.status === 200) {
        toast.success("Documents uploaded successfully. Your hotel is being re-verified.", {
          duration: 5000
        });
        
        // Mark documents as submitted
        setDocumentsSubmitted(true);
        
        // Refresh hotel data
        const res = await api.get(`/hotels/${currentHotelId}`);
        setHotel(res.data);
        
        // Clear file uploads
        setTradeLicense(null);
        setIdProof(null);
        setUploadErrors({});
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents", {
        description: error.response?.data?.message || "An error occurred while uploading documents.",
        duration: 6000
      });
    } finally {
      setIsUploadingFiles(false);
    }
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
    { id: "dashboard", label: "Dashboard", icon: Home, locked: false },
    ...(roles && !roles.includes("STAFF") ? [
      { id: "booking", label: "Booking", icon: Calendar, locked: false },
      ...(roles && !roles.includes("FRONTDESK") ? [
        { id: "inventory", label: "Bookings Inventory", icon: Package, locked: true },
        { id: "rooms", label: "Room Management", icon: Bed, locked: true },
        ...(roles && !roles.includes("STAFF")
          ? [{ id: "staff", label: "Staff Management", icon: Users, locked: true }]
          : []),
        { id: "analytics", label: "Analytics", icon: PieChart, locked: true }
      ] : [])
    ] : []),
    { id: "leave", label: "Leave Management", icon: Clock, locked: true },
    ...(roles && !roles.includes("FRONTDESK") && !roles.includes("STAFF") ? [
      { id: "hotel", label: "Hotel Settings", icon: Settings, locked: true }
    ] : [])
  ];

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      hotel: "Hotel Details",
      rooms: "Room Management",
      staff: "Staff Management",
      inventory: "Bookings Inventory",
      analytics: "Analytics & Reports",
      booking: "Booking Management",
      leave: "Leave Management",
    };
    return titles[activeTab] || "Dashboard";
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: "Overview of your hotel operations and recent activity",
      hotel: "Manage your hotel information and details",
      rooms: "Add, edit, and manage your room inventory",
      inventory: "View all bookings data in tabular format with Excel export",
      staff: "Manage your hotel staff and their roles",
      analytics: "Insights and reports about your business performance",
      booking: "Manage and view your hotel bookings",
      leave: roles?.includes("STAFF")
        ? "Request leave and view your leave history"
        : "Manage staff leave requests and approvals",
    };
    return descriptions[activeTab] || "Manage your hotel operations";
  };

  const NavigationButton = ({ item, onClick, isActive }) => {
    const Icon = item.icon;
    const isLocked = item.locked && isSubscriptionExpired();
    const showLeaveBadge = item.id === "leave" && leaveNotificationCount > 0;
    
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start transition-colors py-2 px-3 text-sm relative ${
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : isLocked
            ? "opacity-50 cursor-not-allowed hover:bg-transparent"
            : "hover:bg-accent"
        }`}
        onClick={() => {
          if (isLocked) {
            toast.error("Subscription expired. Please renew to access this feature.", {
              duration: 4000
            });
            return;
          }
          onClick();
        }}
        disabled={isLocked}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span className="text-sm">{item.label}</span>
        {isLocked && (
          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
        )}
        {showLeaveBadge && (
          <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
            {leaveNotificationCount > 99 ? "99+" : leaveNotificationCount}
          </span>
        )}
        {isActive && !isLocked && !showLeaveBadge && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </Button>
    );
  };

  // Small reusable verified badge for inline use next to names
  const VerifiedBadge = ({ size = "md" }) => {
    const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
    const padding = "p-0.5";
    return (
      <span
        className={`inline-flex items-center justify-center bg-blue-500 rounded-full ${padding} flex-shrink-0`}
        aria-label="Verified account"
      >
        <Check className={`${iconSize} text-white`} strokeWidth={3} />
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-56 lg:w-64 bg-card shadow-sm hidden md:block border-r flex flex-col h-screen">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          <div className="p-4 lg:p-5 border-b">
            <div className="flex items-center gap-2 lg:gap-3 mb-3">
              <div>
                <EzeeRoomLogo size="default" />
              </div>
            </div>
            
            
            {/* Subscription Status */}
            {subscriptionPlan === 'TRIAL' && (
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Trial Plan
              </Badge>
            )}
          </div>

          <div className="p-3 lg:p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold">
            {roles?.includes("SUPER_ADMIN") ? "Super Admin Panel" :
             roles?.includes("HOTEL_ADMIN") ? "Admin Panel" :
             roles?.includes("MANAGER") ? "Manager Panel" :
             roles?.includes("FRONTDESK") ? "Front Desk Panel" :
             roles?.includes("STAFF") ? "Staff Panel" :
             "Admin Panel"}
          </p>
          </div>
        </div>

        {/* Scrollable Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-3 lg:p-4">
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

        {/* Fixed Footer Section */}
        <div className="flex-shrink-0 p-3 lg:p-4 border-t">
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
          <div className="px-4 py-3 lg:px-6 lg:py-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5 flex-1 min-w-0">
                <h2 className="hidden md:block text-xl sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                  {getPageTitle()}
                </h2>
                {/* Hotel Name Display and Switcher */}
                {hotel?.name && (
                  <div className="hidden md:flex items-center gap-2">
                    <p className="text-sm font-medium text-primary truncate">
                      {hotel.name}
                    </p>
                    {/* Hotel Switcher - Only show if user has multiple hotels */}
                    {userHotels && userHotels.length > 1 && (
                      <Select
                        value={currentHotelId || ""}
                        onValueChange={handleHotelSwitch}
                      >
                        <SelectTrigger className="w-auto h-7 px-2 text-xs border-primary/20 bg-primary/5 hover:bg-primary/10">
                          <SelectValue placeholder="Switch Hotel" />
                        </SelectTrigger>
                        <SelectContent>
                          {userHotels.map((hotelOption) => (
                            <SelectItem key={hotelOption.id} value={hotelOption.id?.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="truncate">{hotelOption.name}</span>
                                {isTopHotel(hotelOption.id) && (
                                  <TopHotelBadge hotelId={hotelOption.id} className="ml-1" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                {activeTab !== "dashboard" && (
                  <p className="hidden md:block text-sm sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                    {getPageDescription()}
                  </p>
                )}
              </div>

              {/* Right side actions */}
              <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Help Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm font-medium"
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              
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

                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {notification.guestName && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">Guest: </span> {notification.guestName}
                                    </p>
                                  )}
                                  {notification.roomNumber && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">Room:</span> {notification.roomNumber}
                                    </p>
                                  )}
                                </div>
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
                  <List className="h-4 w-4 md:hidden" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 flex flex-col h-full"
                >
                  {/* Fixed Header Section */}
                  <div className="flex-shrink-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="flex items-center gap-3">
                        <div>
                          <EzeeRoomLogo size="default" />
                        </div>
                      </SheetTitle>
                      
                      {/* Hotel Name and Switcher for Mobile */}
                      {hotel?.name && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-primary truncate">
                              {hotel.name}
                            </p>
                          </div>
                          {/* Hotel Switcher for Mobile - Only show if user has multiple hotels */}
                          {userHotels && userHotels.length > 1 && (
                            <Select
                              value={currentHotelId || ""}
                              onValueChange={handleHotelSwitch}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Switch Hotel" />
                              </SelectTrigger>
                              <SelectContent>
                                {userHotels.map((hotelOption) => (
                                  <SelectItem key={hotelOption.id} value={hotelOption.id?.toString()}>
                                    <div className="flex items-center gap-2">
                                      <span className="truncate">{hotelOption.name}</span>
                                      {isTopHotel(hotelOption.id) && (
                                        <TopHotelBadge hotelId={hotelOption.id} className="ml-1" />
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                      
                      {/* Subscription Status for Mobile */}
                      {subscriptionPlan === 'TRIAL' && (
                        <div className="mt-3">
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Trial Plan
                          </Badge>
                        </div>
                      )}
                    </SheetHeader>

                    <div className="pl-3 lg:p-4">
                      <p className="text-xs text-muted-foreground uppercase font-bold">
                        {roles?.includes("SUPER_ADMIN") ? "Super Admin Panel" :
                         roles?.includes("HOTEL_ADMIN") ? "Admin Panel" :
                         roles?.includes("MANAGER") ? "Manager Panel" :
                         roles?.includes("FRONTDESK") ? "Front Desk Panel" :
                         roles?.includes("STAFF") ? "Staff Panel" :
                         "Admin Panel"}
                      </p>
                    </div>
                  </div>

                  {/* Scrollable Navigation Section */}
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
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
                    </div>
                  </nav>

                  {/* Fixed Footer Section */}
                  <div className="flex-shrink-0 space-y-3 p-4 border-t">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {userName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate flex items-center gap-1.5">
                          {userName}
                          {hotel && hotel.isVerified && <VerifiedBadge size="sm" />}
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

                    {!roles?.includes("STAFF") && !roles?.includes("FRONTDESK") && (
                      <Link to="/subscription" className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscription
                        </Button>
                      </Link>
                    )}
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
                  {!roles?.includes("STAFF") && !roles?.includes("FRONTDESK") && !roles?.includes("MANAGER") && (
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscription</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
                </div>
                
                {/* Subscription Status Message - Below both notification and avatar */}
                {roles?.includes("HOTEL_ADMIN") && (
                  <div className="flex justify-end">
                    {subscriptionIsActive && subscriptionNextBillingDate ? (
                      <p className="text-xs text-muted-foreground">
                        {subscriptionPlan === 'TRIAL' 
                          ? `Trial expires: ${new Date(subscriptionNextBillingDate).toLocaleDateString()}`
                          : `Subscription expires: ${new Date(subscriptionNextBillingDate).toLocaleDateString()}`
                        }
                      </p>
                    ) : !subscriptionIsActive ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {hotel && !hotel.isVerified && subscriptionNextBillingDate ? 
                          (subscriptionPlan === 'TRIAL' 
                            ? `Trial expires: ${new Date(subscriptionNextBillingDate).toLocaleDateString()}.`
                            : "Please start trial to start hotel verification process")
                          : hotel && !hotel.isVerified
                            ? "Please start trial to start hotel verification process"
                            : "Please subscribe to continue"}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="py-4 sm:p-4 lg:p-6 space-y-4">
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              {/* Subscription Expiration Notification */}
              {/* Show renewal notification if expiration date is in the future (within 7 days) */}
              {subscriptionExpirationNotification && subscriptionNextBillingDate && (
                <SubscriptionExpirationNotification 
                  nextBillingDate={subscriptionNextBillingDate}
                  subscriptionPlan={subscriptionPlan}
                  subscriptionIsActive={subscriptionIsActive}
                />
              )}

              {/* Subscription Expired Warning for Dashboard */}
              {isSubscriptionExpired() && (
                <div className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1">
                          Subscription Expired
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed mb-3">
                          Your subscription has expired. You cannot access some features including Room Management, 
                          Hotel Settings, Analytics, Staff Management, and Booking Inventory. Please renew your 
                          subscription to restore full access.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status Banner */}
              {hotel && !hotel.isVerified && (hotel.verificationDenialReason || hotel.hotelResubmit) && (
                <>
                  <div className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 rounded-lg mb-4">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-red-800 dark:text-red-200 mb-1">
                            {hotel.verificationDenialReason ? 'Verification Denied' : 'Verification Required'}
                          </h4>
                          <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-3">
                            {hotel.verificationDenialReason 
                              ? <>Your hotel verification has been denied. Reason: <strong>{hotel.verificationDenialReason}</strong></>
                              : 'Please resubmit your verification documents to continue using the platform.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resubmit Verification Documents */}
                  {hotel.hotelResubmit ? (
                    /* Documents Already Resubmitted */
                    <div className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 rounded-lg mb-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-1">
                            Documents Resubmitted for Verification
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            Your verification documents have been resubmitted and are pending review. We'll notify you once your hotel is verified.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Card className="border-blue-200 dark:border-blue-800 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-1">
                              Resubmit Verification Documents
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                              Please upload the required documents again to resubmit your hotel for verification.
                            </p>
                          </div>
                        </div>

                        {documentsSubmitted ? (
                        <div className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                                Documents Submitted Successfully
                              </h5>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Your verification documents have been submitted and are pending review. Please wait for approval before submitting again.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitNewDocuments} className="space-y-6">
                          {/* Helper text */}
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <span className="text-destructive">*</span> At least one document is required
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Trade License */}
                            <div className="space-y-2">
                              <Label htmlFor="tradeLicense">
                                Trade License
                              </Label>
                              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="p-6">
                                  <Label 
                                    htmlFor="tradeLicense" 
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                  >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground text-center">
                                      {tradeLicense
                                        ? tradeLicense.name
                                        : "Upload trade license (PDF or image)"}
                                    </span>
                                    <Input
                                      id="tradeLicense"
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleFileUpload(e, "tradeLicense")}
                                      className="hidden"
                                      disabled={documentsSubmitted}
                                    />
                                  </Label>
                                </CardContent>
                              </Card>
                              {uploadErrors.tradeLicense && (
                                <p className="text-destructive text-sm">{uploadErrors.tradeLicense}</p>
                              )}
                            </div>

                            {/* ID Proof */}
                            <div className="space-y-2">
                              <Label htmlFor="idProof">
                                ID Proof
                              </Label>
                              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="p-6">
                                  <Label 
                                    htmlFor="idProof" 
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                  >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground text-center">
                                      {idProof
                                        ? idProof.name
                                        : "Upload ID proof (PDF or image)"}
                                    </span>
                                    <Input
                                      id="idProof"
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleFileUpload(e, "idProof")}
                                      className="hidden"
                                      disabled={documentsSubmitted}
                                    />
                                  </Label>
                                </CardContent>
                              </Card>
                              {uploadErrors.idProof && (
                                <p className="text-destructive text-sm">{uploadErrors.idProof}</p>
                              )}
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            className="w-full"
                            disabled={isUploadingFiles || documentsSubmitted}
                          >
                            {isUploadingFiles ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading Documents...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Documents for Verification
                              </>
                            )}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                  )}
                </>
              )}

              {/* Welcome Card */}
              {/* <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"> */}
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
                      <h3 className="text-lg sm:text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                        <span className="truncate">Welcome, {userName}!</span>
                        {hotel && hotel.isVerified && <VerifiedBadge size="md" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {hotel && !hotel.isVerified && hotel.verificationDenialReason 
                          ? "Your hotel verification has been denied. Please review the denial reason and resubmit your documentation."
                          : hotel && !hotel.isVerified && hotel.hotelResubmit
                          ? "Please resubmit your verification documents to continue using the platform."
                          : hotel && !hotel.isVerified && !hotel.verificationDenialReason
                          ? "Your hotel is currently pending verification."
                          : "Here's what's happening with your hotel today."}
                      </p>
                    </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="hidden md:block flex-shrink-0 flex flex-col items-end gap-8">
                    <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-3 py-1"
                    >
                      {roles?.includes("SUPER_ADMIN") ? "Super Admin" :
                       roles?.includes("HOTEL_ADMIN") ? "Admin" :
                       roles?.includes("MANAGER") ? "Manager" :
                       roles?.includes("FRONTDESK") ? "Front Desk" :
                       roles?.includes("STAFF") ? "Staff" :
                       "Admin"}
                    </Badge>
                    </div>

                    <div className="text-left mt-2">
                      <p className="text-xs font-bold text-foreground">
                      Last login: {formatLoginTime(lastLogin)}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Top Hotel Congratulations Section */}

                {currentHotelId && isTopHotel(currentHotelId) && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18l-1.45-1.32C5.4 13.36 2 9.28 2 5.5 2 3.42 3.42 2 5.5 2c1.74 0 3.41.81 4.5 2.09C11.09 2.81 12.76 2 14.5 2 16.58 2 18 3.42 18 5.5c0 3.78-3.4 7.86-6.55 11.18L10 18z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-yellow-800 dark:text-yellow-200">
                            Congratulations!
                          </h4>
                          <TopHotelBadge hotelId={currentHotelId} className="ml-1" />
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                          Your hotel is featured among our{" "}
                          <strong>Top Listed Lodges</strong>! This recognition
                          showcases your exceptional hospitality and service
                          quality. Thank you for being an outstanding partner
                          with EzeeRoom.
                        </p>
                        <div className="mt-3 flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Featured on our homepage and highly visible to guests
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {/* </Card> */}

                {/* Booking Calendar */}
              <div className="mb-10">
                <BookingCalendar hotelId={currentHotelId} />
              </div>

              <div className="mb-10">
                <RoomStatusTable hotelId={currentHotelId} />
              </div>

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

              {showStaffGrid && <StaffCardGrid hotelId={currentHotelId} />}
            </div>
          )}


          {activeTab === "rooms" && (
            <div className="space-y-4">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Room Management Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to manage rooms.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0 md:px-6 md:pb-6">
                    <RoomManager hotelId={currentHotelId} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Booking Inventory Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to view booking inventory.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <BookingsInventoryTable hotelId={currentHotelId} />
              )}
            </div>
          )}

          {activeTab === "staff" && ( // Changed from "bookings" to "staff"
            <div className="space-y-4">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Staff Management Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to manage staff.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0 md:px-6 md:pb-6">
                    <StaffManager hotelId={currentHotelId} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "leave" && (
            <div className="space-y-4">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Leave Management Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to manage leave requests.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Leave Notifications Section */}
                  {leaveNotificationCount > 0 && (
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Bell className="h-5 w-5 text-primary" />
                            Leave Notifications
                            <Badge variant="destructive" className="ml-2">
                              {leaveNotificationCount} New
                            </Badge>
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLeaveNotifications(!showLeaveNotifications)}
                          >
                            {showLeaveNotifications ? "Hide" : "Show"} Details
                          </Button>
                        </div>
                      </CardHeader>
                      {showLeaveNotifications && (
                        <CardContent>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {loadingLeaveNotifications ? (
                              <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">
                                  Loading notifications...
                                </p>
                              </div>
                            ) : (
                              leaveNotifications
                                .filter((notification) => !notification.isRead)
                                .map((notification) => (
                                <div
                                  key={notification.id}
                                  className="p-4 rounded-lg border transition-colors bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-sm text-foreground mb-1">
                                            {notification.title}
                                          </h4>
                                          <p className="text-sm text-muted-foreground leading-relaxed">
                                            {notification.message}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                                        {notification.username && (
                                          <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>{notification.username}</span>
                                          </div>
                                        )}
                                        {notification.hotelName && (
                                          <div className="flex items-center gap-1">
                                            <Hotel className="h-3 w-3" />
                                            <span>{notification.hotelName}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {new Date(notification.createdAt).toLocaleString(undefined, {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-shrink-0"
                                      onClick={() => markLeaveNotificationAsRead(notification.id)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                  
                  <LeaveManagement hotelId={currentHotelId} />
                </>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Analytics Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to view analytics.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <CardContent className="p-0 md:px-6 md:pb-6">
                  <div className="space-y-8">
                    <BookingsTrendChart hotelId={currentHotelId} />
                    <MonthlyPerformanceChart hotelId={currentHotelId} />
                  </div>
                </CardContent>
              )}
            </div>
          )}

          {activeTab === "hotel" && (
            <div className="space-y-6">
              {isSubscriptionExpired() ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          Hotel Settings Locked
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          This feature is not available with an expired subscription. 
                          Please renew your subscription to manage hotel settings.
                        </p>
                        <Link to="/subscription">
                          <Button 
                            variant="default" 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Renew Subscription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Hotel Information Section */}
                  {hotel && (
                    <HotelInfoForm hotel={hotel} onUpdate={updateHotel} />
                  )}

                  {/* Account Management Section */}
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        Account Management
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Manage your account settings and data
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Account Information */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{userName}</p>
                                <p className="text-xs text-muted-foreground">Account Holder</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{hotel?.name || "Hotel Name"}</p>
                                <p className="text-xs text-muted-foreground">Associated Hotel</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {roles?.includes("SUPER_ADMIN") ? "Super Admin" :
                                   roles?.includes("HOTEL_ADMIN") ? "Hotel Admin" :
                                   roles?.includes("MANAGER") ? "Manager" :
                                   roles?.includes("FRONTDESK") ? "Front Desk" :
                                   roles?.includes("STAFF") ? "Staff" :
                                   "Admin"}
                                </p>
                                <p className="text-xs text-muted-foreground">Role</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {subscriptionPlan === 'TRIAL' ? 'Trial Plan' : 
                                   subscriptionPlan === 'BASIC' ? 'Basic Plan' :
                                   subscriptionPlan === 'PREMIUM' ? 'Premium Plan' :
                                   subscriptionPlan || 'No Plan'}
                                </p>
                                <p className="text-xs text-muted-foreground">Subscription</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="space-y-4">
                        <h4 className="text-base font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          Danger Zone
                        </h4>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                  Delete Account
                                </h5>
                                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed mb-3">
                                  Permanently delete your account and all associated data. This action cannot be undone.
                                  All hotel information, bookings, staff data, and settings will be permanently removed.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    disabled={roles?.includes("STAFF") || roles?.includes("MANAGER") || roles?.includes("FRONTDESK")}
                                    onClick={() => navigate("/account-deletion")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Account
                                  </Button>
                                  {roles?.includes("STAFF") || roles?.includes("MANAGER") || roles?.includes("FRONTDESK") && (
                                    <p className="text-xs text-muted-foreground">
                                      Account deletion is not available for your role level.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4">
              {/* Subscription Expired Warning */}
              {isSubscriptionExpired() && (
                <div className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1">
                        Subscription Expired
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed mb-3">
                        Your subscription has expired. To continue creating bookings and managing your hotel, 
                        please renew your subscription.
                      </p>
                      <Link to="/subscription">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Renew Subscription
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Booking Form */}
              <AdminBookingForm
                hotelId={currentHotelId}
                onBookingSuccess={handleBookingSuccess}
                isDisabled={isSubscriptionExpired()}
              />

              {/* Booking Verification Section with Tabs */}
              {/* <Card> */}
                <CardHeader className="">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Booking Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:px-6 md:pb-6">
                  <Tabs
                    value={verificationTab}
                    onValueChange={setVerificationTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="cid-verification"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        CID Verification
                      </TabsTrigger>
                      <TabsTrigger
                        value="passcode"
                        className="flex items-center gap-2"
                      >
                        <Bed className="h-4 w-4" />
                        Passcode
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cid-verification" className="mt-4">
                      <div className="space-y-4">
                        <div className="text-center text-sm text-gray-600 mb-4">
                          Enter guest's CID number to verify their booking
                        </div>
                        <CIDVerification />
                      </div>
                    </TabsContent>

                    <TabsContent value="passcode" className="mt-4">
                      <div className="space-y-4">
                        <div className="text-center text-sm text-gray-600 mb-4">
                          Enter room passcode to verify guest booking
                        </div>
                        <PasscodeVerification />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              {/* </Card> */}

              {/* Booking Table */}
              <Card>
                <CardHeader className="">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    All Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:px-6 md:pb-6">
                  <div className="overflow-x-auto" data-booking-table>
                    <BookingTable
                      hotelId={currentHotelId}
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
