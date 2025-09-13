import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import api from "../../shared/services/Api";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Home, ArrowLeft, Eye, X, MapPin, Phone, Mail, Globe, Calendar, Star, Bell, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import YakRoomsLoader from "@/shared/components/YakRoomsLoader";
import { SearchButton } from "@/shared/components";

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

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <YakRoomsLoader 
        size={112} 
        showTagline={false} 
        loadingText=""
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
              <YakRoomsLoader size={64} showTagline={false} loadingText="" />
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
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => handleViewDetails(hotel)}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!hotel.verified && (
                    <Button
                      onClick={() => handleVerifyHotel(hotel.id)}
                      disabled={
                        hasMissingData(hotel) || verifyingHotelId === hotel.id
                      } // Disable if verifying
                      size="sm"
                      className="cursor-pointer"
                    >
                      {verifyingHotelId === hotel.id ? "Verifying..." : "Verify"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
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
                        <YakRoomsLoader size={32} showTagline={false} loadingText="" />
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

        {/* Hotel Deletion Requests Section */}
        <HotelDeletionRequestsTable />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <>
            <HotelTable />
            <PaginationControls />
          </>
        )}

        {/* Hotel Details Modal */}
        <HotelDetailsModal />
      </div>
    </div>
  );
};

export default SuperAdmin;
