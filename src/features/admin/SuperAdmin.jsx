import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import api from "../../shared/services/Api";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Home, ArrowLeft, Eye, X, MapPin, Phone, Mail, Globe, Calendar, Star, Bell, Trash2, Download, MessageSquare, Monitor, User, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { Badge } from "@/shared/components/badge";
import { Label } from "@/shared/components/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import { toast } from "sonner";
import SimpleSpinner from "@/shared/components/SimpleSpinner";
import { SearchButton } from "@/shared/components";
import { exportToExcel } from "@/shared/utils/utils";
import * as XLSX from "xlsx";
import { SuperAdminTabs } from "@/components/ui/super-admin-tabs";

const SuperAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingHotelId, setVerifyingHotelId] = useState(null); // New state for tracking verification
  const [selectedHotel, setSelectedHotel] = useState(null); // For hotel details modal
  const [showHotelDetails, setShowHotelDetails] = useState(false); // Modal state

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Hotel deletion requests states
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loadingDeletionRequests, setLoadingDeletionRequests] = useState(false);
  const [deletingHotelId, setDeletingHotelId] = useState(null); // Track which hotel is being deleted
  const [deletionRequestsPagination, setDeletionRequestsPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 0,
  });

  // All notifications states
  const [allNotifications, setAllNotifications] = useState([]);
  const [loadingAllNotifications, setLoadingAllNotifications] = useState(false);
  const [clearingNotifications, setClearingNotifications] = useState(false);
  const [exportingNotifications, setExportingNotifications] = useState(false);
  const [allNotificationsPagination, setAllNotificationsPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 0,
  });

  // Reviews management states
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewsPagination, setReviewsPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 0,
  });

  // Feedback management states
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbacksPagination, setFeedbacksPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalPages: 1,
    totalElements: 0,
  });

  // Bookings management states
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsPagination, setBookingsPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
    totalElements: 0,
  });

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    district: "",
    verified: "",
    searchQuery: "",
  });

  // Transfer form states
  const [selectedBookingForTransfer, setSelectedBookingForTransfer] = useState(null);
  const [journalNumber, setJournalNumber] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Extension form states
  const [extensionDialog, setExtensionDialog] = useState(false);
  const [selectedBookingForExtension, setSelectedBookingForExtension] = useState(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [extensionAmount, setExtensionAmount] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  // Fetch notifications for super admin
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await api.get("/notifications/hotel-deletion-requests");
        const fetchedNotifications = response.data;

        // Filter notifications to show only HOTEL_DELETION_REQUEST type
        const filteredNotifications = fetchedNotifications.filter(
          (notif) => notif.type === "HOTEL_DELETION_REQUEST"
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

        console.log("[API] Fetched super admin notifications:", sortedNotifications);
        console.log("[API] Unread count:", unreadNotifications.length);
      } catch (error) {
        console.error("[API] Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  // Fetch all notifications
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setLoadingAllNotifications(true);
        const params = {
          page: allNotificationsPagination.pageNumber,
          size: allNotificationsPagination.pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        };

        const response = await api.get("/notifications/admin/all", { params });
        
        console.log("[DEBUG] All notifications API response:", response.data);
        
        setAllNotifications(response.data.content || []);
        setAllNotificationsPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0,
        }));
      } catch (err) {
        console.error("Error fetching all notifications:", err);
        toast.error("Failed to fetch notifications");
      } finally {
        setLoadingAllNotifications(false);
      }
    };

    fetchAllNotifications();
  }, [allNotificationsPagination.pageNumber]);

  // Fetch hotel deletion requests
  useEffect(() => {
    const fetchDeletionRequests = async () => {
      try {
        setLoadingDeletionRequests(true);
        const params = {
          page: deletionRequestsPagination.pageNumber,
          size: deletionRequestsPagination.pageSize,
        };

        const response = await api.get("/hotels/deletion-requests", { params });
        
        console.log("[DEBUG] Raw API response:", response.data);
        console.log("[DEBUG] Content array:", response.data.content);
        
        // For debugging - show all hotels first, then filter
        const allHotels = response.data.content || [];
        console.log("[DEBUG] All hotels:", allHotels);
        console.log("[DEBUG] All hotels length:", allHotels.length);
        
        // Check each hotel's deletionRequested status
        allHotels.forEach((hotel, index) => {
          console.log(`[DEBUG] Hotel ${index}:`, {
            id: hotel.id,
            name: hotel.name,
            deletionRequested: hotel.deletionRequested,
            deletionReason: hotel.deletionReason,
            deletionRequestedAt: hotel.deletionRequestedAt
          });
        });
        
        // Filter hotels that have deletion requests
        const hotelsWithDeletionRequests = allHotels.filter(
          hotel => hotel.deletionRequested === true
        );
        
        console.log("[DEBUG] Filtered hotels with deletion requests:", hotelsWithDeletionRequests);
        console.log("[DEBUG] Number of hotels with deletion requests:", hotelsWithDeletionRequests.length);
        
        // TEMPORARY: Set all hotels for debugging
        setDeletionRequests(allHotels);
        setDeletionRequestsPagination((prev) => ({
          ...prev,
          totalPages: response.data.page?.totalPages || 1,
          totalElements: response.data.page?.totalElements || 0,
        }));
      } catch (err) {
        console.error("Error fetching deletion requests:", err);
        toast.error("Failed to fetch deletion requests");
      } finally {
        setLoadingDeletionRequests(false);
      }
    };

    fetchDeletionRequests();
  }, [deletionRequestsPagination.pageNumber]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const params = {
          page: reviewsPagination.pageNumber,
          size: reviewsPagination.pageSize,
        };

        const response = await api.get("/reviews/deleted/paginated", { params });
        
        console.log("[DEBUG] Reviews API response:", response.data);
        
        setReviews(response.data.content || []);
        setReviewsPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0,
        }));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        toast.error("Failed to fetch reviews");
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [reviewsPagination.pageNumber]);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoadingFeedbacks(true);
        const params = {
          page: feedbacksPagination.pageNumber,
          size: feedbacksPagination.pageSize,
        };

        const response = await api.get("/feedbacks", { params });
        
        console.log("[DEBUG] Feedbacks API response:", response.data);
        
        setFeedbacks(response.data.content || []);
        setFeedbacksPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0,
        }));
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        toast.error("Failed to fetch feedbacks");
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchFeedbacks();
  }, [feedbacksPagination.pageNumber]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const params = {
          page: bookingsPagination.pageNumber,
          size: bookingsPagination.pageSize,
        };

        const response = await api.get("/bookings/all-with-details", { params });
        
        console.log("[DEBUG] Bookings API response:", response.data);
        
        setBookings(response.data.content || []);
        setBookingsPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0,
        }));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        toast.error("Failed to fetch bookings");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [bookingsPagination.pageNumber]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.pageNumber,
          size: pagination.pageSize,
          ...(filters.district && { district: filters.district }),
          ...(filters.verified !== "" &&
            filters.verified !== "all" && { verified: filters.verified }), // Handle "all" case
          ...(filters.searchQuery && { search: filters.searchQuery }),
        };

        const response = await api.get("/hotels/superAdmin", { params });
        setHotels(response.data.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages,
        }));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [pagination.pageNumber, filters]);

  const hasMissingData = (hotel) => {
    return (
      !hotel.name || !hotel.phone || !hotel.licenseUrl || !hotel.idProofUrl
    );
  };

  const handleVerifyHotel = async (hotelId) => {
    setVerifyingHotelId(hotelId); // Set the ID of the hotel being verified
    try {
      const res = await api.post(`/hotels/${hotelId}/verify`);
      if (res.status === 200 && res.data) {
        const { success, emailSent, message, hotelName, alreadyVerified } = res.data;
        
        if (success) {
          if (alreadyVerified) {
            toast.info("Hotel Already Verified", {
              description: `${hotelName} was already verified.`,
              icon: <CheckCircle className="text-blue-600" />,
              duration: 6000,
            });
          } else {
            toast.success("Hotel Verified Successfully", {
              description: emailSent 
                ? `${hotelName} has been verified and notification email sent.`
                : `${hotelName} has been verified.`,
              icon: <CheckCircle className="text-green-600" />,
              duration: 6000,
            });
            
            // Optimistically update the hotel's verified status in the state
            setHotels((prevHotels) =>
              prevHotels.map((hotel) =>
                hotel.id === hotelId ? { ...hotel, verified: true } : hotel
              )
            );
          }
        } else {
          toast.error("Verification Failed", {
            description: message || "There was an error verifying the hotel. Please try again.",
            icon: <XCircle className="text-red-600" />,
            duration: 6000,
          });
        }
      }
    } catch (err) {
      toast.error("Verification Failed", {
        description: "There was an error verifying the hotel. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 6000,
      });
      setError(err.message);
    } finally {
      setVerifyingHotelId(null); // Clear the verifying ID
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
  };

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowHotelDetails(true);
  };

  // Notification handling functions
  const deleteAllNotifications = async () => {
    try {
      // Extract notification IDs
      const notificationIds = notifications.map(notif => notif.id);
      
      console.log("[DEBUG] Deleting notifications with IDs:", notificationIds);
      
      await api.delete("/notifications/bulk", {
        data: notificationIds
      });
      setNotifications([]);
      setUnreadCount(0);
      console.log("[API] Successfully deleted all notifications");
    } catch (error) {
      console.error("[API] Error deleting notifications:", error);
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
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    await deleteAllNotifications();
    setShowNotifications(false);
  };

  // Handle deletion requests pagination
  const handleDeletionRequestsPageChange = (newPage) => {
    setDeletionRequestsPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  // Handle all notifications pagination
  const handleAllNotificationsPageChange = (newPage) => {
    setAllNotificationsPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  // Handle reviews pagination
  const handleReviewsPageChange = (newPage) => {
    setReviewsPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  // Handle feedbacks pagination
  const handleFeedbacksPageChange = (newPage) => {
    setFeedbacksPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  // Handle bookings pagination
  const handleBookingsPageChange = (newPage) => {
    setBookingsPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  // Handle clearing all read notifications
  const handleClearReadNotifications = async () => {
    setClearingNotifications(true);
    try {
      const response = await api.delete("/notifications/admin/delete-read");
      
      if (response.status === 200) {
        toast.success("Read Notifications Cleared", {
          description: "All read notifications have been successfully deleted.",
          icon: <Trash2 className="text-green-600" />,
          duration: 4000,
        });

        // Refresh the notifications list
        const params = {
          page: allNotificationsPagination.pageNumber,
          size: allNotificationsPagination.pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        };

        const refreshResponse = await api.get("/notifications/admin/all", { params });
        setAllNotifications(refreshResponse.data.content || []);
        setAllNotificationsPagination((prev) => ({
          ...prev,
          totalPages: refreshResponse.data.totalPages || 1,
          totalElements: refreshResponse.data.totalElements || 0,
        }));
      }
    } catch (err) {
      console.error("Error clearing read notifications:", err);
      toast.error("Failed to Clear Notifications", {
        description: "There was an error clearing read notifications. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 4000,
      });
    } finally {
      setClearingNotifications(false);
    }
  };

  // Handle exporting notifications to Excel
  const handleExportNotifications = async () => {
    if (allNotifications.length === 0) {
      toast.warning("No notifications to export", {
        description: "There are no notifications available to export.",
        icon: <Bell className="text-yellow-600" />,
        duration: 4000,
      });
      return;
    }

    setExportingNotifications(true);
    try {
      // Format notification data for Excel export
      const excelData = allNotifications.map((notification, index) => ({
        "S.No": index + 1,
        "Type": notification.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        "Title": notification.title || "N/A",
        "Message": notification.message || "N/A",
        "Date": format(new Date(notification.createdAt), "dd MMM yyyy"),
        "Time": format(new Date(notification.createdAt), "HH:mm"),
        "Status": notification.isRead ? "Read" : "Unread",
        "Created At": format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm"),
      }));

      // Add summary statistics
      const totalNotifications = allNotifications.length;
      const readNotifications = allNotifications.filter(n => n.isRead).length;
      const unreadNotifications = totalNotifications - readNotifications;
      
      // Group by notification type
      const typeGroups = allNotifications.reduce((acc, notification) => {
        const type = notification.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Add empty row and summary
      excelData.push({});
      excelData.push({
        "S.No": "",
        "Type": "SUMMARY STATISTICS",
        "Title": "",
        "Message": "",
        "Date": "",
        "Time": "",
        "Status": "",
        "Created At": "",
      });
      excelData.push({
        "S.No": "",
        "Type": "Total Notifications",
        "Title": "",
        "Message": "",
        "Date": "",
        "Time": "",
        "Status": "",
        "Created At": totalNotifications.toString(),
      });
      excelData.push({
        "S.No": "",
        "Type": "Read Notifications",
        "Title": "",
        "Message": "",
        "Date": "",
        "Time": "",
        "Status": "",
        "Created At": readNotifications.toString(),
      });
      excelData.push({
        "S.No": "",
        "Type": "Unread Notifications",
        "Title": "",
        "Message": "",
        "Date": "",
        "Time": "",
        "Status": "",
        "Created At": unreadNotifications.toString(),
      });

      // Add notification type breakdown
      Object.entries(typeGroups).forEach(([type, count]) => {
        excelData.push({
          "S.No": "",
          "Type": `${type} Count`,
          "Title": "",
          "Message": "",
          "Date": "",
          "Time": "",
          "Status": "",
          "Created At": count.toString(),
        });
      });

      // Use the existing exportToExcel utility
      const result = exportToExcel(
        excelData,
        `notifications-export-${format(new Date(), "yyyy-MM-dd")}`,
        "Notifications",
        {
          columnWidths: [
            { wch: 8 },   // S.No
            { wch: 25 },  // Type
            { wch: 30 },  // Title
            { wch: 50 },  // Message
            { wch: 12 },  // Date
            { wch: 8 },   // Time
            { wch: 12 },  // Status
            { wch: 20 },  // Created At
          ]
        }
      );

      if (result.success) {
        toast.success("Notifications Exported Successfully", {
          description: `Excel file with ${totalNotifications} notifications has been downloaded.`,
          icon: <CheckCircle className="text-green-600" />,
          duration: 5000,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error exporting notifications:", err);
      toast.error("Export Failed", {
        description: "There was an error exporting notifications. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 4000,
      });
    } finally {
      setExportingNotifications(false);
    }
  };

  // Handle hotel deletion approval
  const handleApproveDeletion = async (hotelId, hotelName) => {
    setDeletingHotelId(hotelId);
    try {
      const response = await api.delete(`/hotels/${hotelId}`);
      
      if (response.status === 200) {
        toast.success("Hotel Deleted Successfully", {
          description: `${hotelName} has been permanently deleted from the system.`,
          icon: <Trash2 className="text-green-600" />,
          duration: 6000,
        });

        // Remove the deleted hotel from the deletion requests list
        setDeletionRequests((prev) => 
          prev.filter((hotel) => hotel.id !== hotelId)
        );

        // Update pagination if needed
        setDeletionRequestsPagination((prev) => ({
          ...prev,
          totalElements: prev.totalElements - 1,
        }));
      }
    } catch (err) {
      console.error("Error deleting hotel:", err);
      toast.error("Failed to Delete Hotel", {
        description: "There was an error deleting the hotel. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 6000,
      });
    } finally {
      setDeletingHotelId(null);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId, reviewTitle) => {
    setDeletingReviewId(reviewId);
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      
      if (response.status === 200) {
        toast.success("Review Deleted Successfully", {
          description: `Review "${reviewTitle}" has been permanently deleted from the system.`,
          icon: <Trash2 className="text-green-600" />,
          duration: 6000,
        });

        // Remove the deleted review from the reviews list
        setReviews((prev) => 
          prev.filter((review) => review.id !== reviewId)
        );

        // Update pagination if needed
        setReviewsPagination((prev) => ({
          ...prev,
          totalElements: prev.totalElements - 1,
        }));
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to Delete Review", {
        description: "There was an error deleting the review. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 6000,
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Transfer form handlers
  const handleTransferSelect = (booking) => {
    console.log('Selected booking for transfer:', booking);
    setSelectedBookingForTransfer(booking);
    setJournalNumber("");
  };

  const handleTransferCancel = () => {
    setSelectedBookingForTransfer(null);
    setJournalNumber("");
    setIsTransferring(false);
  };

  // Extension handlers
  const handleExtensionSelect = (booking) => {
    console.log('Selected booking for extension:', booking);
    setSelectedBookingForExtension(booking);
    setNewCheckOutDate("");
    setExtensionAmount("");
  };

  const handleExtensionCancel = () => {
    setSelectedBookingForExtension(null);
    setNewCheckOutDate("");
    setExtensionAmount("");
    setIsExtending(false);
  };

  const handleExtensionSubmit = async () => {
    if (!selectedBookingForExtension || !newCheckOutDate || !extensionAmount) {
      return;
    }

    setIsExtending(true);
    try {
      const payload = {
        newCheckOutDate: newCheckOutDate,
        guests: selectedBookingForExtension.guests,
        phone: selectedBookingForExtension.phone,
        destination: selectedBookingForExtension.destination,
        origin: selectedBookingForExtension.origin,
        extension: true,
        extendedAmount: parseFloat(extensionAmount),
      };

      const response = await api.put(`/bookings/${selectedBookingForExtension.id}/extend`, payload);
      
      if (response.status === 200) {
        console.log('Booking extended successfully:', response.data);
        // Refresh bookings data
        fetchBookings();
        handleExtensionCancel();
        setExtensionDialog(false);
      }
    } catch (error) {
      console.error("Error extending booking:", error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!journalNumber.trim()) {
      toast.error("Please enter journal number", {
        description: "The journal number field cannot be empty.",
        icon: <XCircle className="text-red-600" />,
        duration: 4000,
      });
      return;
    }

    if (!selectedBookingForTransfer) {
      toast.error("No booking selected", {
        description: "Please select a booking for transfer.",
        icon: <XCircle className="text-red-600" />,
        duration: 4000,
      });
      return;
    }

    try {
      setIsTransferring(true);
      
      // Call the transfer endpoint for bookings
      const bookingId = selectedBookingForTransfer.id;
      const transferStatus = 'DEPOSITED'; // Default status as per requirement
      
      await api.put(`/bookings/${bookingId}/transfer-details`, null, {
        params: {
          journalNumber: journalNumber.trim(),
          transferStatus: transferStatus
        }
      });

      toast.success("Transfer Completed", {
        description: `Transfer details updated for booking "${selectedBookingForTransfer.guestName}" with journal number: ${journalNumber.trim()}`,
        icon: <CheckCircle className="text-green-600" />,
        duration: 5000,
      });

      // Refresh bookings data to show updated transfer status
      const params = {
        page: bookingsPagination.pageNumber,
        size: bookingsPagination.pageSize,
      };
      const response = await api.get("/bookings/all-with-details", { params });
      setBookings(response.data.content || []);

      // Clear the form
      handleTransferCancel();
    } catch (err) {
      console.error("Error performing transfer action:", err);
      toast.error("Transfer Failed", {
        description: err.response?.data?.message || "There was an error updating transfer details. Please try again.",
        icon: <XCircle className="text-red-600" />,
        duration: 5000,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // Hotel Details Modal Component
  const HotelDetailsModal = () => {
    if (!selectedHotel) return null;

    const formatHotelType = (type) => {
      if (!type) return "Not specified";
      return type.replace(/_/g, " ");
    };

    const formatPrice = (price) => {
      if (!price || price === "-" || price === "null") return "Contact for pricing";
      return `Nu. ${Number(price).toLocaleString()}`;
    };

    return (
      <Dialog open={showHotelDetails} onOpenChange={setShowHotelDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {selectedHotel.name || "Hotel Details"}
            </DialogTitle>
            <DialogDescription>
              Complete hotel information and verification status
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Hotel Images */}
            {selectedHotel.photoUrls?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Hotel Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedHotel.photoUrls.slice(0, 6).map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Hotel image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
                {selectedHotel.photoUrls.length > 6 && (
                  <p className="text-sm text-muted-foreground">
                    +{selectedHotel.photoUrls.length - 6} more images
                  </p>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedHotel.address}, {selectedHotel.district}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedHotel.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedHotel.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {selectedHotel.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a 
                          href={selectedHotel.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedHotel.websiteUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedHotel.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hotel Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Hotel Type</p>
                    <Badge variant="outline" className="mt-1">
                      {formatHotelType(selectedHotel.hotelType)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Verification Status</p>
                    <Badge variant={selectedHotel.verified ? "default" : "secondary"} className="mt-1">
                      {selectedHotel.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>

                  {selectedHotel.lowestPrice && (
                    <div>
                      <p className="text-sm font-medium">Starting Price</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(selectedHotel.lowestPrice)} /night
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {selectedHotel.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedHotel.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {selectedHotel.amenities?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Amenities ({selectedHotel.amenities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {selectedHotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        {/* <CheckCircle className="h-3 w-3 text-green-600" /> */}
                        <span className="text-xs">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Business License</p>
                    {selectedHotel.licenseUrl ? (
                      <a
                        href={selectedHotel.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View License Document
                      </a>
                    ) : (
                      <p className="text-sm text-red-600">❌ Missing</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">ID Proof</p>
                    {selectedHotel.idProofUrl ? (
                      <a
                        href={selectedHotel.idProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View ID Document
                      </a>
                    ) : (
                      <p className="text-sm text-red-600">❌ Missing</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Transfer Form Component
  const TransferForm = () => {
    if (!selectedBookingForTransfer) return null;
    
    return (
      <Card className="mb-6 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-blue-800">Transfer Details</CardTitle>
              <CardDescription className="text-blue-600">
                Update transfer details for booking: <strong>{selectedBookingForTransfer.guestName}</strong>
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTransferCancel}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="journalNumber" className="text-sm font-medium text-blue-800">
                Journal Number
              </Label>
              <Input
                id="journalNumber"
                type="text"
                placeholder="Enter journal number (e.g., JN123456)"
                value={journalNumber}
                onChange={(e) => setJournalNumber(e.target.value)}
                className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={50}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTransferCancel}
                disabled={isTransferring}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferSubmit}
                disabled={!journalNumber.trim() || isTransferring}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isTransferring ? "Updating..." : "Update Transfer"}
              </Button>
            </div>
          </div>
          
          {/* Booking Details */}
          <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Booking Details:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Guest:</span> {selectedBookingForTransfer.guestName}
              </div>
              <div>
                <span className="font-medium">Hotel:</span> {selectedBookingForTransfer.hotelName}
              </div>
              <div>
                <span className="font-medium">Amount:</span> {selectedBookingForTransfer.bookingAmount || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {selectedBookingForTransfer.transferStatus || 'PENDING'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <SimpleSpinner 
        size={32} 
        text="Loading..."
        className="mb-4"
      />
    </div>
  );

  const ErrorMessage = () => (
    <Card className="border-red-400 bg-red-50 text-red-800">
      <CardHeader>
        <CardTitle className="text-red-800">Error loading data</CardTitle>
        <CardDescription className="text-red-700">
          <p>{error}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </CardContent>
    </Card>
  );

  const SearchFilters = () => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleFilterChange(localFilters);
    };

    const handleReset = () => {
      const resetFilters = { district: "", verified: "all", searchQuery: "" }; // Set default for verified to "all"
      setLocalFilters(resetFilters);
      handleFilterChange(resetFilters);
    };

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 md:space-y-0 md:flex md:gap-4 items-end"
          >
            <div className="flex-1">
              <Label htmlFor="searchQuery" className="sr-only">
                Search
              </Label>
              <Input
                type="text"
                name="searchQuery"
                id="searchQuery"
                placeholder="Search hotels..."
                value={localFilters.searchQuery}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="district" className="sr-only">
                District
              </Label>
              <Select
                name="district"
                value={localFilters.district}
                onValueChange={(value) => handleSelectChange("district", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">All Districts</SelectItem>{" "}
                  {/* Use empty string for "All" to match API behavior */}
                  <SelectItem value="Thimphu">Thimphu</SelectItem>
                  <SelectItem value="Paro">Paro</SelectItem>
                  <SelectItem value="Punakha">Punakha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="verified" className="sr-only">
                Verification Status
              </Label>
              <Select
                name="verified"
                value={localFilters.verified}
                onValueChange={(value) => handleSelectChange("verified", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <SearchButton type="submit">Apply Filters</SearchButton>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const PaginationControls = () => {
    const handlePrevious = () => {
      if (pagination.pageNumber > 0) {
        handlePageChange(pagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (pagination.pageNumber < pagination.totalPages - 1) {
        handlePageChange(pagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={pagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={pagination.pageNumber === pagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{pagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{pagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={pagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={pagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={pagination.pageNumber === pagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeletionRequestsPaginationControls = () => {
    const handlePrevious = () => {
      if (deletionRequestsPagination.pageNumber > 0) {
        handleDeletionRequestsPageChange(deletionRequestsPagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (deletionRequestsPagination.pageNumber < deletionRequestsPagination.totalPages - 1) {
        handleDeletionRequestsPageChange(deletionRequestsPagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={deletionRequestsPagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={deletionRequestsPagination.pageNumber === deletionRequestsPagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{deletionRequestsPagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{deletionRequestsPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={deletionRequestsPagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: deletionRequestsPagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={deletionRequestsPagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeletionRequestsPageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={deletionRequestsPagination.pageNumber === deletionRequestsPagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AllNotificationsPaginationControls = () => {
    const handlePrevious = () => {
      if (allNotificationsPagination.pageNumber > 0) {
        handleAllNotificationsPageChange(allNotificationsPagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (allNotificationsPagination.pageNumber < allNotificationsPagination.totalPages - 1) {
        handleAllNotificationsPageChange(allNotificationsPagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={allNotificationsPagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={allNotificationsPagination.pageNumber === allNotificationsPagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{allNotificationsPagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{allNotificationsPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={allNotificationsPagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: allNotificationsPagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={allNotificationsPagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleAllNotificationsPageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={allNotificationsPagination.pageNumber === allNotificationsPagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReviewsPaginationControls = () => {
    const handlePrevious = () => {
      if (reviewsPagination.pageNumber > 0) {
        handleReviewsPageChange(reviewsPagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (reviewsPagination.pageNumber < reviewsPagination.totalPages - 1) {
        handleReviewsPageChange(reviewsPagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={reviewsPagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={reviewsPagination.pageNumber === reviewsPagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{reviewsPagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{reviewsPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={reviewsPagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: reviewsPagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={reviewsPagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleReviewsPageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={reviewsPagination.pageNumber === reviewsPagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeedbacksPaginationControls = () => {
    const handlePrevious = () => {
      if (feedbacksPagination.pageNumber > 0) {
        handleFeedbacksPageChange(feedbacksPagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (feedbacksPagination.pageNumber < feedbacksPagination.totalPages - 1) {
        handleFeedbacksPageChange(feedbacksPagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={feedbacksPagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={feedbacksPagination.pageNumber === feedbacksPagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{feedbacksPagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{feedbacksPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={feedbacksPagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: feedbacksPagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={feedbacksPagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleFeedbacksPageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={feedbacksPagination.pageNumber === feedbacksPagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingsPaginationControls = () => {
    const handlePrevious = () => {
      if (bookingsPagination.pageNumber > 0) {
        handleBookingsPageChange(bookingsPagination.pageNumber - 1);
      }
    };

    const handleNext = () => {
      if (bookingsPagination.pageNumber < bookingsPagination.totalPages - 1) {
        handleBookingsPageChange(bookingsPagination.pageNumber + 1);
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex justify-between md:hidden">
          <Button
            onClick={handlePrevious}
            disabled={bookingsPagination.pageNumber === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={bookingsPagination.pageNumber === bookingsPagination.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium">{bookingsPagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{bookingsPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePrevious}
                disabled={bookingsPagination.pageNumber === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: bookingsPagination.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={bookingsPagination.pageNumber === i ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleBookingsPageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNext}
                disabled={bookingsPagination.pageNumber === bookingsPagination.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AllNotificationsTable = () => {
    const getNotificationTypeColor = (type) => {
      switch (type) {
        case "BOOKING_CREATED":
          return "bg-green-100 text-green-800 border-green-200";
        case "BOOKING_CANCELLATION_REQUEST":
          return "bg-orange-100 text-orange-800 border-orange-200";
        case "HOTEL_DELETION_REQUEST":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-blue-100 text-blue-800 border-blue-200";
      }
    };

    const getNotificationTypeIcon = (type) => {
      switch (type) {
        case "BOOKING_CREATED":
          return <CheckCircle className="h-4 w-4" />;
        case "BOOKING_CANCELLATION_REQUEST":
          return <XCircle className="h-4 w-4" />;
        case "HOTEL_DELETION_REQUEST":
          return <Trash2 className="h-4 w-4" />;
        default:
          return <Bell className="h-4 w-4" />;
      }
    };

    const formatNotificationType = (type) => {
      return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                All Notifications
              </CardTitle>
              <CardDescription>
                Complete overview of all system notifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {allNotifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportNotifications}
                    disabled={exportingNotifications}
                    className="flex items-center gap-2"
                  >
                    {exportingNotifications ? (
                      <>
                        <SimpleSpinner size={16} />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export Excel
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={clearingNotifications}
                        className="flex items-center gap-2"
                      >
                        {clearingNotifications ? "Clearing..." : "Clear"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Trash2 className="h-5 w-5 text-red-500" />
                          Clear Notifications
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete all read notifications? This action cannot be undone.
                          Only notifications marked as "Read" will be deleted, unread notifications will remain.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearReadNotifications}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={clearingNotifications}
                        >
                          {clearingNotifications ? "Clearing..." : "Clear Notifications"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAllNotifications ? (
            <div className="flex justify-center items-center py-8">
              <SimpleSpinner size={24} text="Loading notifications..." />
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allNotifications.map((notification) => (
                  <TableRow 
                    key={notification.id}
                    className={!notification.isRead ? "bg-blue-50/30" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getNotificationTypeColor(notification.type)} flex items-center gap-1`}
                        >
                          {getNotificationTypeIcon(notification.type)}
                          {formatNotificationType(notification.type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium line-clamp-2">
                          {notification.title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {notification.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(notification.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(notification.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.isRead ? "secondary" : "default"}>
                        {notification.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {allNotifications.length > 0 && <AllNotificationsPaginationControls />}
      </Card>
    );
  };

  const HotelDeletionRequestsTable = () => {
    console.log("[DEBUG] HotelDeletionRequestsTable render - deletionRequests:", deletionRequests);
    console.log("[DEBUG] HotelDeletionRequestsTable render - loadingDeletionRequests:", loadingDeletionRequests);
    console.log("[DEBUG] HotelDeletionRequestsTable render - deletionRequests.length:", deletionRequests.length);
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Hotel Deletion Requests
          </CardTitle>
          <CardDescription>
            Manage hotel account deletion requests from hotel owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDeletionRequests ? (
            <div className="flex justify-center items-center py-8">
              <SimpleSpinner size={24} text="Loading deletion requests..." />
            </div>
          ) : deletionRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deletion requests found
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletionRequests.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {hotel.photoUrls?.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={hotel.photoUrls[0]}
                            alt="Hotel"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {hotel.name || "Unknown Hotel"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {hotel.district || "Unknown Location"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {hotel.email || "No email"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hotel.phone || "No phone"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {hotel.deletionRequestedAt 
                        ? format(new Date(hotel.deletionRequestedAt), "dd MMM yyyy")
                        : "Not available"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hotel.deletionRequestedAt 
                        ? format(new Date(hotel.deletionRequestedAt), "HH:mm")
                        : ""
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate">
                      {hotel.deletionReason || "No reason provided"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleViewDetails(hotel)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Hotel
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            disabled={deletingHotelId === hotel.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingHotelId === hotel.id ? "Deleting..." : "Approve"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <Trash2 className="h-5 w-5 text-red-500" />
                              Confirm Hotel Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                Are you sure you want to permanently delete <strong>{hotel.name}</strong>?
                              </p>
                              <p className="text-sm text-muted-foreground">
                                This action cannot be undone. All hotel data, bookings, and associated information will be permanently removed from the system.
                              </p>
                              {hotel.deletionReason && (
                                <div className="mt-3 p-3 bg-muted rounded-md">
                                  <p className="text-sm font-medium">Deletion Reason:</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    "{hotel.deletionReason}"
                                  </p>
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleApproveDeletion(hotel.id, hotel.name)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingHotelId === hotel.id}
                            >
                              {deletingHotelId === hotel.id ? "Deleting..." : "Delete Hotel"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
        {deletionRequests.length > 0 && <DeletionRequestsPaginationControls />}
      </Card>
    );
  };

  const ReviewsTable = () => {
    const renderStars = (rating) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <Star
            key={i}
            className={`h-4 w-4 ${
              i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        );
      }
      return stars;
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Reviews Management
          </CardTitle>
          <CardDescription>
            Manage and moderate hotel reviews from guests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReviews ? (
            <div className="flex justify-center items-center py-8">
              <SimpleSpinner size={24} text="Loading reviews..." />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="text-sm font-medium mb-1">
                          {review.title || "No title"}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment || "No comment"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          by {review.guestName || "Anonymous"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {review.hotelName || "Unknown Hotel"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.hotelDistrict || "Unknown Location"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating || 0)}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({review.rating || 0}/5)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(review.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(review.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            disabled={deletingReviewId === review.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingReviewId === review.id ? "Deleting..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <Trash2 className="h-5 w-5 text-red-500" />
                              Confirm Review Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                Are you sure you want to permanently delete this review?
                              </p>
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium">Review Details:</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  <strong>Title:</strong> {review.title || "No title"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Hotel:</strong> {review.hotelName || "Unknown Hotel"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Rating:</strong> {review.rating || 0}/5
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Guest:</strong> {review.guestName || "Anonymous"}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                This action cannot be undone. The review will be permanently removed from the system.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(review.id, review.title || "Untitled Review")}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingReviewId === review.id}
                            >
                              {deletingReviewId === review.id ? "Deleting..." : "Delete Review"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {reviews.length > 0 && <ReviewsPaginationControls />}
      </Card>
    );
  };

  const FeedbacksTable = () => {
    const renderStars = (rating) => {
      const stars = [];
      for (let i = 1; i <= 10; i++) {
        stars.push(
          <Star
            key={i}
            className={`h-3 w-3 ${
              i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        );
      }
      return stars;
    };

    const getRatingColor = (rating) => {
      if (rating >= 8) return "text-green-600";
      if (rating >= 6) return "text-yellow-600";
      if (rating >= 4) return "text-orange-600";
      return "text-red-600";
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            System Feedbacks
          </CardTitle>
          <CardDescription>
            User feedback and ratings for the YakRooms platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFeedbacks ? (
            <div className="flex justify-center items-center py-8">
              <SimpleSpinner size={24} text="Loading feedbacks..." />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feedbacks found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feedback</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Device Info</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="text-sm font-medium mb-1">
                          Feedback #{feedback.id}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {feedback.comment || "No comment provided"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {feedback.isAnonymous ? "Anonymous feedback" : "Registered user"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {feedback.isAnonymous ? (
                            <User className="h-4 w-4 text-gray-500" />
                          ) : (
                            <div className="text-xs font-medium text-gray-600">
                              {feedback.userName?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {feedback.userName || "Anonymous"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {feedback.userEmail || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(feedback.rating || 0)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(feedback.rating || 0)}`}>
                          {feedback.rating || 0}/10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {feedback.deviceInfo?.platform || "Unknown"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feedback.deviceInfo?.screenResolution || "Unknown resolution"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feedback.deviceInfo?.language || "Unknown language"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(feedback.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(feedback.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {feedbacks.length > 0 && <FeedbacksPaginationControls />}
      </Card>
    );
  };

  const BookingsTable = () => {
    const getStatusColor = (status) => {
      switch (status) {
        case "CONFIRMED":
          return "bg-green-100 text-green-800 border-green-200";
        case "PENDING":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "CANCELLED":
          return "bg-red-100 text-red-800 border-red-200";
        case "COMPLETED":
          return "bg-blue-100 text-blue-800 border-blue-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const formatPrice = (price) => {
      if (!price) return "N/A";
      return `Nu. ${Number(price).toLocaleString()}`;
    };

    // Export bookings to Excel
    const exportBookingsToExcel = async () => {
      try {
        // Show loading toast
        const loadingToast = toast.loading("Preparing Excel export...");

        // Fetch ALL bookings data for export using /bookings/all endpoint
        let allBookings = [];
        try {
          const response = await api.get("/bookings/all");
          allBookings = response.data || [];
          
          console.log(`[EXPORT] Fetched ${allBookings.length} bookings for export`);
        } catch (error) {
          console.error("Error fetching all bookings for export:", error);
          toast.dismiss(loadingToast);
          toast.error("Failed to fetch bookings data for export");
          return;
        }

        if (allBookings.length === 0) {
          toast.dismiss(loadingToast);
          toast.warning("No bookings data to export");
          return;
        }

        // Prepare data for Excel export
        const excelData = allBookings.map((booking) => ({
          "Booking ID": booking.id,
          "Guest Name": booking.guestName || booking.name || "Unknown Guest",
          "Email": booking.email || "N/A",
          "Phone": booking.phone || "N/A",
          "CID": booking.cid || "N/A",
          "Hotel Name": booking.hotelName || "Unknown Hotel",
          "Hotel District": booking.hotelDistrict || "Unknown Location",
          "Hotel Phone": booking.hotelPhone || "N/A",
          "Room Number": booking.roomNumber || "N/A",
          "Check-In Date": booking.checkInDate ? format(new Date(booking.checkInDate), "dd MMM yyyy") : "N/A",
          "Check-Out Date": booking.checkOutDate ? format(new Date(booking.checkOutDate), "dd MMM yyyy") : "N/A",
          "Guests": booking.guests || "N/A",
          "Origin": booking.origin || "N/A",
          "Destination": booking.destination || "N/A",
          "Transfer Status": booking.transferStatus || "N/A",
          "Transaction ID": booking.transactionId || "N/A",
          "Booking Amount": booking.txnTotalPrice || booking.bookingAmount || "N/A",
          "Order Number": booking.orderNumber || "N/A",
          "Transaction Status": booking.transactionStatus || "N/A",
          "Bank Type": booking.bankType || "N/A",
          "Account Number": booking.accountNumber || "N/A",
          "Account Holder": booking.accountHolderName || "N/A",
          "Extension": booking.extension ? "Yes" : "No",
          "Extension Amount": booking.extendedAmount ? `Nu. ${booking.extendedAmount}` : "N/A",
          "Journal Number": booking.journalNumber || "N/A",
          "Booking Status": booking.status || "UNKNOWN",
          "Payment URL": booking.paymentUrl || "N/A",
          "Created Date": booking.createdAt ? format(new Date(booking.createdAt), "dd MMM yyyy") : "N/A",
          "Created Time": booking.createdAt ? format(new Date(booking.createdAt), "HH:mm") : "N/A",
        }));

        // Use the existing exportToExcel utility
        const result = exportToExcel(
          excelData,
          `superadmin-bookings-export-${format(new Date(), "yyyy-MM-dd")}`,
          "All Bookings"
        );

        if (result) {
          // Dismiss loading toast and show success
          toast.dismiss(loadingToast);
          toast.success(`Exported ${allBookings.length} bookings to Excel`, {
            duration: 6000,
          });
        } else {
          toast.dismiss(loadingToast);
          toast.error("Failed to export bookings data");
        }
      } catch (error) {
        console.error("Error exporting bookings to Excel:", error);
        toast.error("Failed to export bookings data to Excel");
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Booking Management
              </CardTitle>
              <CardDescription>
                Complete overview of all hotel bookings with guest and hotel details
              </CardDescription>
            </div>
            <Button
              onClick={exportBookingsToExcel}
              disabled={loadingBookings}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingBookings ? (
            <div className="flex justify-center items-center py-8">
              <SimpleSpinner size={24} text="Loading bookings..." />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Hotel & Room</TableHead>
                  <TableHead>Booking Details</TableHead>
                  <TableHead>Transfer Status</TableHead>
                  <TableHead>Transaction Status</TableHead>
                  <TableHead>Bank Type</TableHead>
                  <TableHead>Extension</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm font-medium">
                          {booking.guestName || booking.name || "Unknown Guest"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Booking #{booking.id}
                        </div>
                        {booking.email && (
                          <div className="text-xs text-muted-foreground">
                            {booking.email}
                          </div>
                        )}
                        {booking.phone && (
                          <div className="text-xs text-muted-foreground">
                             {booking.phone}
                          </div>
                        )}
                      {booking.cid && booking.cid !== "N/A" && (
                          <div className="text-xs text-muted-foreground">
                            CID: {booking.cid}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm font-medium">
                          {booking.hotelName || "Unknown Hotel"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Room: {booking.roomNumber || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.hotelDistrict || "Unknown Location"}
                        </div>
                        {booking.hotelPhone && (
                          <div className="text-xs text-muted-foreground">
                             {booking.hotelPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm font-medium">
                          {format(new Date(booking.checkInDate), "dd MMM yyyy")} - {format(new Date(booking.checkOutDate), "dd MMM yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                        </div>
                        {booking.origin && booking.destination && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>From: {booking.origin}</div>
                            <div>To: {booking.destination}</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              booking.transferStatus === "COMPLETED" 
                                ? "bg-green-100 text-green-800 border-green-200"
                                : booking.transferStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {booking.transferStatus || "N/A"}
                          </Badge>
                        </div>
                        {booking.transactionId && (
                          <div className="text-xs text-muted-foreground">
                            Txn ID: {booking.transactionId}
                          </div>
                        )}
                        {(booking.txnTotalPrice) && (
                          <div className="text-xs text-muted-foreground">
                            Booking Amount: {booking.txnTotalPrice || booking.bookingAmount}
                          </div>
                        )}
                        {(booking.totalPrice) && (
                          <div className="text-xs font-medium text-blue-600">
                            Transferable Amount: {booking.totalPrice}
                          </div>
                        )}
                        {booking.orderNumber && (
                          <div className="text-xs text-muted-foreground">
                            Order: {booking.orderNumber}
                          </div>
                        )}
                        {booking.journalNumber && (
                          <div className="text-xs font-medium text-purple-600">
                            Journal: {booking.journalNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            booking.transactionStatus === "PAID" 
                              ? "bg-green-100 text-green-800 border-green-200"
                              : booking.transactionStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : booking.transactionStatus === "FAILED"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {booking.transactionStatus || "N/A"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {booking.bankType || "N/A"}
                        </div>
                        {booking.accountNumber && (
                          <div className="text-xs text-muted-foreground">
                            Account: {booking.accountNumber}
                          </div>
                        )}
                        {booking.accountHolderName && (
                          <div className="text-xs text-muted-foreground">
                            Holder: {booking.accountHolderName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {booking.extension ? (
                          <div className="space-y-1">
                            <Badge 
                              variant="outline" 
                              className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                            >
                              Extended
                            </Badge>
                            {booking.extendedAmount && (
                              <div className="text-xs text-green-600 font-medium">
                                Nu. {new Intl.NumberFormat("en-IN").format(booking.extendedAmount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not Extended</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(booking.status)} flex items-center gap-1`}
                        >
                          {booking.status || "UNKNOWN"}
                        </Badge>
                        {booking.paymentUrl && (
                          <div className="text-xs">
                            <a 
                              href={booking.paymentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Payment Link
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(booking.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(booking.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTransferSelect(booking)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Transfer
                          </DropdownMenuItem>
                          {booking.paymentUrl && (
                            <DropdownMenuItem asChild>
                              <a 
                                href={booking.paymentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <Globe className="mr-2 h-4 w-4" />
                                View Payment
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {bookings.length > 0 && <BookingsPaginationControls />}
      </Card>
    );
  };

  const HotelTable = () => (
    <Card className="mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hotel</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.map((hotel) => (
            <TableRow
              key={hotel.id}
              className={hasMissingData(hotel) ? "bg-yellow-50/20" : ""}
            >
              <TableCell>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {hotel.photoUrls?.length > 0 ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={hotel.photoUrls[0]}
                        alt="Hotel"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div
                      className={`text-sm font-medium ${
                        !hotel.name ? "text-destructive" : ""
                      }`}
                    >
                      {hotel.name || "Missing name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined: {format(new Date(hotel.createdAt), "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={`text-sm ${
                    !hotel.email ? "text-destructive" : ""
                  }`}
                >
                  {hotel.email || "Missing email"}
                </div>
                <div
                  className={`text-sm text-muted-foreground ${
                    !hotel.phone ? "text-destructive" : ""
                  }`}
                >
                  {hotel.phone || "Missing phone"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{hotel.district}</div>
                <div className="text-sm text-muted-foreground">
                  {hotel.locality}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {hotel.licenseUrl ? (
                    <a
                      href={hotel.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      License
                    </a>
                  ) : (
                    <span className="text-destructive text-sm">Missing</span>
                  )}
                  {hotel.idProofUrl ? (
                    <a
                      href={hotel.idProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ID Proof
                    </a>
                  ) : (
                    <span className="text-destructive text-sm">Missing</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={hotel.verified ? "default" : "secondary"}>
                  {hotel.verified ? "Verified" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(hotel)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {!hotel.verified && (
                      <DropdownMenuItem 
                        onClick={() => handleVerifyHotel(hotel.id)}
                        disabled={hasMissingData(hotel) || verifyingHotelId === hotel.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {verifyingHotelId === hotel.id ? "Verifying..." : "Verify Hotel"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleActionDialogOpen(hotel)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Transfer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  const HotelTableWithPagination = () => (
    <>
      <HotelTable />
      {hotels.length > 0 && <PaginationControls />}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
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
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      <div className="flex gap-2">
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllNotifications}
                            className="text-xs"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center">
                        <SimpleSpinner size={20} text="Loading notifications..." />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
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
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm")}
                                  </p>
                                </div>
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

            <Link to="/" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </div>

        <SearchFilters />

        {/* Transfer Form */}
        <TransferForm />

        {/* Main Content with Tabs */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <SuperAdminTabs
            BookingsTable={BookingsTable}
            HotelDeletionRequestsTable={HotelDeletionRequestsTable}
            ReviewsTable={ReviewsTable}
            FeedbacksTable={FeedbacksTable}
            HotelTable={HotelTableWithPagination}
            AllNotificationsTable={AllNotificationsTable}
          />
        )}

        {/* Hotel Details Modal */}
        <HotelDetailsModal />

        {/* Extension Dialog */}
        <Dialog open={extensionDialog} onOpenChange={setExtensionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Extend Booking
              </DialogTitle>
              <DialogDescription>
                Extend the checkout date for this booking
              </DialogDescription>
            </DialogHeader>
            
            {selectedBookingForExtension && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Booking Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Guest:</strong> {selectedBookingForExtension.guestName || selectedBookingForExtension.name}</p>
                    <p><strong>Room:</strong> {selectedBookingForExtension.roomNumber}</p>
                    <p><strong>Current Checkout:</strong> {selectedBookingForExtension.checkOutDate}</p>
                    <p><strong>Hotel:</strong> {selectedBookingForExtension.hotelName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="newCheckOutDate" className="block text-sm font-medium text-gray-700 mb-1">
                      New Checkout Date
                    </label>
                    <Input
                      id="newCheckOutDate"
                      type="date"
                      value={newCheckOutDate}
                      onChange={(e) => setNewCheckOutDate(e.target.value)}
                      min={selectedBookingForExtension.checkOutDate}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="extensionAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Extension Amount (Nu.)
                    </label>
                    <Input
                      id="extensionAmount"
                      type="number"
                      value={extensionAmount}
                      onChange={(e) => setExtensionAmount(e.target.value)}
                      placeholder="Enter extension amount"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={handleExtensionCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleExtensionSubmit}
                disabled={!newCheckOutDate || !extensionAmount || isExtending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExtending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Extending...
                  </div>
                ) : (
                  "Extend Booking"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperAdmin;
