import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  LogIn,
  LogOut,
  Trash2,
  MoreHorizontal,
  XCircle,
  Info,
  Search,
  X,
  ThumbsUp,
  ThumbsDown,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import api from "../../shared/services/Api"; // Your API service for making requests
import { useBookingContext } from "../../features/booking/BookingContext";

// Custom hook to safely access booking context
const useSafeBookingContext = () => {
  try {
    return useBookingContext();
  } catch (error) {
    console.warn('BookingContext not available:', error.message);
    return { socket: null };
  }
};

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components";
import { Badge } from "@/shared/components";
import { Button } from "@/shared/components";
import { Input } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components";
import { toast } from "sonner"; // For toast notifications

// Calculate extension days function
const calculateExtensionDays = (booking) => {
  if (!booking.extension || !booking.extendedAmount) {
    return 0;
  }
  
  // Calculate original nights
  const originalCheckIn = new Date(booking.checkInDate);
  const originalCheckOut = new Date(booking.checkOutDate);
  const originalNights = Math.ceil((originalCheckOut - originalCheckIn) / (1000 * 60 * 60 * 24));
  
  // Calculate original price per night
  const originalPricePerNight = booking.totalPrice / originalNights;
  
  // Calculate extension nights based on extended amount
  const extensionNights = Math.round(booking.extendedAmount / originalPricePerNight);
  
  return extensionNights;
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

// shadcn/ui AlertDialog components for the confirmation dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components";

// --- DeleteConfirmationDialog Component ---
// This component provides a generic confirmation dialog
const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const BookingTable = ({ hotelId }) => {
  const { socket } = useSafeBookingContext();
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false); // Controls the delete confirmation dialog visibility
  const [bookingToDelete, setBookingToDelete] = useState(null); // Stores the ID of the booking to be deleted
  const [selectedBooking, setSelectedBooking] = useState(null); // Stores the booking to show details
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

  const pageSize = 10; // Number of bookings per page

  // --- Search Bookings by Room Number ---
  const searchBookingsByRoom = async (roomNumber, page = 0) => {
    setSearchLoading(true);
    setError(null);

    try {
      const res = await api.get(`/bookings/search/room-number?roomNumber=${roomNumber}&hotelId=${hotelId}&page=${page}&size=${pageSize}`);
      if (!res.data) {
        throw new Error("Failed to search bookings");
      }
      const data = res.data;

      if (data.content) {
        setBookings(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        // Fallback if API returns array directly
        setBookings(data);
        setTotalPages(Math.ceil(data.length / pageSize));
      }
    } catch (err) {
      setError(err.message);
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to search bookings. Please try again.
        </div>,
        {
          duration: 6000
        }
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Fetch Bookings Data ---
  const fetchBookings = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/bookings/?page=${page}&size=${pageSize}&hotelId=${hotelId}`);
      if (!res.data) {
        throw new Error("Failed to fetch bookings");
      }
      const data = res.data;

      if (data.content) {
        setBookings(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        // Fallback if API returns array directly (e.g., for smaller datasets)
        setBookings(data);
        setTotalPages(Math.ceil(data.length / pageSize));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      if (isSearchMode && lastSearchedQuery) {
        searchBookingsByRoom(lastSearchedQuery, currentPage);
      } else if (!isSearchMode) {
        fetchBookings(currentPage);
      }
    }
  }, [currentPage, hotelId, isSearchMode, lastSearchedQuery]);

  // --- Update Booking Status ---
  const updateBookingStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await api.put(`/bookings/${id}/status/${newStatus}`);
      if (res.status === 200) {
        // Send WebSocket message to notify about status change
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'BOOKING_STATUS_UPDATE',
            payload: {
              bookingId: id,
              newStatus,
              hotelId,
              userId: res.data?.userId || null
            }
          }));
        }
        
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Booking status updated successfully to {newStatus.replace("_", " ")}
            .
          </div>,
          {
            duration: 6000
          }
        );
      }
      // Re-fetch to get updated data
      if (isSearchMode && lastSearchedQuery) {
        searchBookingsByRoom(lastSearchedQuery, currentPage);
      } else {
        fetchBookings(currentPage);
      }
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to update booking status. Please try again.
        </div>,
        {
          duration: 6000
        }
      );
      console.error("Status update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Cancellation Request Actions ---
  const handleCancellationRequestAction = async (bookingId, action) => {
    try {
      const res = await api.put(`/bookings/cancellation-requests/${bookingId}/${action}`);
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {res.data?.message || `Cancellation request ${action}d successfully`}
        </div>,
        {
          duration: 6000
        }
      );
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to {action} cancellation request. Please try again.
        </div>,
        {
          duration: 6000
        }
      );
    }
  };

  // --- Handle Booking Deletion ---
  // This function is called when the user confirms deletion from the dialog.
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return; // Should not happen if dialog is opened correctly

    setLoading(true);
    try {
      await api.delete(`/bookings/${bookingToDelete}`);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Booking {bookingToDelete} has been removed successfully.
        </div>,
        {
          duration: 6000
        }
      );
      // Re-fetch to get updated data
      if (isSearchMode && lastSearchedQuery) {
        searchBookingsByRoom(lastSearchedQuery, currentPage);
      } else {
        fetchBookings(currentPage);
      }
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to delete booking. Please try again.
        </div>,
        {
          duration: 6000
        }
      );
      console.error("Delete booking error:", err);
    } finally {
      setLoading(false);
      setDeleteDialog(false); // Close the dialog
      setBookingToDelete(null); // Reset the ID
    }
  };

  // --- Search Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLastSearchedQuery(searchQuery.trim());
      setIsSearchMode(true);
      setCurrentPage(0); // Reset to first page when searching
      // The useEffect will automatically trigger the search due to lastSearchedQuery change
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setLastSearchedQuery("");
    setIsSearchMode(false);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Only clear search mode if input is completely empty
    if (!e.target.value.trim()) {
      setIsSearchMode(false);
    }
  };

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // --- Status Badge Styling ---
  const getStatusBadge = (status) => {
    let colorClass = "bg-slate-100 text-slate-700 border border-slate-200";
    let textClass = "";
    
    switch (status) {
      case "CONFIRMED":
        colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
        break;
      case "PENDING":
        colorClass = "bg-amber-50 text-amber-700 border border-amber-200";
        break;
      case "CHECKED_IN":
        colorClass = "bg-blue-50 text-blue-700 border border-blue-200";
        break;
      case "CHECKED_OUT":
        colorClass = "bg-slate-50 text-slate-600 border border-slate-200";
        break;
      case "CANCELLED":
        colorClass = "bg-red-50 text-red-700 border border-red-200";
        break;
      case "APPROVED":
        colorClass = "bg-green-50 text-green-700 border border-green-200";
        break;
      case "REJECTED":
        colorClass = "bg-red-50 text-red-700 border border-red-200";
        break;
      case "CANCELLATION_REJECTED":
        colorClass = "bg-orange-50 text-orange-700 border border-orange-200";
        textClass = "line-through";
        break;
      case "CANCELLATION_APPROVED":
        colorClass = "bg-green-50 text-green-700 border border-green-200";
        break;
      case "TRANSFERRED":
        colorClass = "bg-purple-50 text-purple-700 border border-purple-200";
        break;
      default:
        colorClass = "bg-slate-50 text-slate-600 border border-slate-200";
    }
    
    return (
      <Badge className={`${colorClass} px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
        <span className={textClass}>{status.replace("_", " ")}</span>
      </Badge>
    );
  };

  if (!hotelId) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No hotel selected. Please log in as a hotel admin or select a hotel.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* --- Search Section --- */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="room-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by Room Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="room-search"
                  type="text"
                  placeholder="Enter room number (e.g., 101, 205)"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10 pr-10 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!searchQuery.trim() || searchLoading}>
                {searchLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </div>
                )}
              </Button>
             
            </div>
          </form>
          
          {/* Search Results Info */}
          {isSearchMode && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Search Results:</span> Showing bookings for room number "{lastSearchedQuery}"
              {bookings.length === 0 && !searchLoading && (
                <span className="text-amber-600 ml-2">(No bookings found for this room)</span>
              )}
            </div>
          )}
        </div>

        {/* --- Error Message Display --- */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-1">Using mock data for demonstration</p>
          </div>
        )}

        {/* --- Bookings Table --- */}
        <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Info</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Stay Period</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Transfer Status</TableHead>
                <TableHead>Journal Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.guestName || booking.name || 'Not provided'}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                      {booking.phone || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {booking.roomNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {booking.guests}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{booking.checkInDate}</span>
                        <span className="font-medium"> <span className="text-muted-foreground">to</span> {booking.checkOutDate}</span>
                        {booking.timeBased && booking.checkInTime && booking.checkOutTime && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            {formatTime(booking.checkInTime)} - {formatTime(booking.checkOutTime)}
                          </div>
                        )}
                        <span className="text-xs text-blue-600 font-medium mt-1">
                          {booking.timeBased && booking.bookHour ? (
                            `${booking.bookHour} hour${booking.bookHour !== 1 ? 's' : ''}`
                          ) : (
                            (() => {
                              const checkIn = new Date(booking.checkInDate);
                              const checkOut = new Date(booking.checkOutDate);
                              const diffTime = Math.abs(checkOut - checkIn);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
                            })()
                          )}
                        </span>
                        {booking.extension && calculateExtensionDays(booking) > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs text-emerald-600 font-medium">
                              +{calculateExtensionDays(booking)} day{calculateExtensionDays(booking) !== 1 ? 's' : ''} extended
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {booking.extension && booking.extendedAmount ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Original:</span>
                          <span className="text-sm font-medium text-gray-700">
                            Nu. {new Intl.NumberFormat("en-IN").format(booking.totalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-600">Extension:</span>
                          <span className="text-sm font-medium text-emerald-600">
                            +Nu. {new Intl.NumberFormat("en-IN").format(booking.extendedAmount)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-800">Total:</span>
                            <span className="text-sm font-bold text-emerald-700">
                              Nu. {new Intl.NumberFormat("en-IN").format(booking.totalPrice + booking.extendedAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          Nu. {new Intl.NumberFormat("en-IN").format(booking.totalPrice)}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>{getStatusBadge(booking.transferStatus)}</TableCell>
                  <TableCell>
                    {booking.journalNumber || (
                      <span className="text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Info className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {booking.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateBookingStatus(booking.id, "CONFIRMED")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Confirm
                          </DropdownMenuItem>
                        )}
                        {(booking.status === "CONFIRMED" ||
                          booking.status === "PENDING") && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateBookingStatus(booking.id, "CHECKED_IN")
                            }
                          >
                            <LogIn className="h-4 w-4 mr-2" /> Check-in
                          </DropdownMenuItem>
                        )}
                        {booking.status === "CHECKED_IN" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateBookingStatus(booking.id, "CHECKED_OUT")
                            }
                          >
                            <LogOut className="h-4 w-4 mr-2" /> Check-out
                          </DropdownMenuItem>
                        )}
                        {booking.status === "CANCELLATION_REQUESTED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleCancellationRequestAction(booking.id, "approve")
                            }
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" /> Approve
                          </DropdownMenuItem>
                        )}
                        {booking.status === "CANCELLATION_REQUESTED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleCancellationRequestAction(booking.id, "reject")
                            }
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        )}
                        {booking.transactionStatus !== "PAID" && !booking.extension && (
                          <DropdownMenuItem
                            onClick={() => {
                              setBookingToDelete(booking.id); // Set the ID to be deleted
                              setDeleteDialog(true); // Open the confirmation dialog
                            }}
                            className="text-red-600" // Highlight delete action
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* --- Pagination Controls --- */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Mobile pagination */}
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              variant="outline"
            >
              Next
            </Button>
          </div>
          {/* Desktop pagination */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isSearchMode ? (
                  <>
                    Showing search results page{" "}
                    <span className="font-medium">{currentPage + 1}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                    {" "}for room "{lastSearchedQuery}"
                  </>
                ) : (
                  <>
                    Showing page{" "}
                    <span className="font-medium">{currentPage + 1}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </>
                )}
              </p>
            </div>
            <div>
              <nav
                className="flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  variant="outline"
                  className="rounded-l-md rounded-r-none"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    variant={page === currentPage ? "default" : "outline"}
                    className="rounded-none"
                  >
                    {page + 1}
                  </Button>
                ))}

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  variant="outline"
                  className="rounded-r-md rounded-l-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* --- Delete Confirmation Dialog --- */}
      {/* This dialog is controlled by `deleteDialog` state and uses `bookingToDelete` for the actual ID */}
      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog} // Function to close the dialog
        onConfirm={handleDeleteBooking} // Function to call when confirmed
        title="Confirm Deletion"
        description={`Are you sure you want to delete booking ID ${bookingToDelete}? This action cannot be undone.`}
      />

      {/* --- Booking Details Modal --- */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Info className="h-6 w-6 text-blue-600" />
                Booking Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
              {/* Guest Information */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Guest Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Name:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.guestName || selectedBooking.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Email:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Phone:</span>
                    <span className="text-gray-900 text-sm">+975 {selectedBooking.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">CID:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.cid || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Journal Number:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.journalNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Guests:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.guests}</span>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Travel Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Origin:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.origin || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Destination:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.destination || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Hotel:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.hotelName || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">District:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.hotelDistrict || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-5 md:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Room:</span>
                    <span className="text-gray-900 text-sm">{selectedBooking.roomNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Check-in:</span>
                    <span className="text-gray-900 text-sm">
                      {selectedBooking.checkInDate}
                      {selectedBooking.timeBased && selectedBooking.checkInTime && (
                        <span className="ml-2 text-xs text-blue-600">
                          at {formatTime(selectedBooking.checkInTime)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Check-out:</span>
                    <span className="text-gray-900 text-sm">
                      {selectedBooking.checkOutDate}
                      {selectedBooking.timeBased && selectedBooking.checkOutTime && (
                        <span className="ml-2 text-xs text-blue-600">
                          at {formatTime(selectedBooking.checkOutTime)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Duration:</span>
                    <div className="flex flex-col items-end">
                      <span className="text-blue-600 font-bold text-sm">
                        {selectedBooking.timeBased && selectedBooking.bookHour ? (
                          `${selectedBooking.bookHour} hour${selectedBooking.bookHour !== 1 ? 's' : ''}`
                        ) : (
                          (() => {
                            const checkIn = new Date(selectedBooking.checkInDate);
                            const checkOut = new Date(selectedBooking.checkOutDate);
                            const diffTime = Math.abs(checkOut - checkIn);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
                          })()
                        )}
                      </span>
                      {selectedBooking.extension && calculateExtensionDays(selectedBooking) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">
                            +{calculateExtensionDays(selectedBooking)} day{calculateExtensionDays(selectedBooking) !== 1 ? 's' : ''} extended
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 text-sm">Transfer Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedBooking.transferStatus)}</div>
                  </div>
                  {selectedBooking.extension && selectedBooking.extendedAmount ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <h4 className="font-semibold text-gray-800 text-sm border-b border-gray-200 pb-1">Pricing Breakdown</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600 text-sm">Original booking:</span>
                            <span className="text-gray-800 font-medium text-sm">
                              Nu. {new Intl.NumberFormat("en-IN").format(selectedBooking.totalPrice)}/-
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-emerald-600 text-sm">Extension fee:</span>
                            <span className="text-emerald-600 font-medium text-sm">
                              +Nu. {new Intl.NumberFormat("en-IN").format(selectedBooking.extendedAmount)}/-
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-800 text-sm">Total amount:</span>
                              <span className="text-emerald-700 font-bold text-base">
                                Nu. {new Intl.NumberFormat("en-IN").format(selectedBooking.totalPrice + selectedBooking.extendedAmount)}/-
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600 text-sm">Total Price:</span>
                      <span className="text-gray-900 font-bold text-sm text-green-600">
                        Nu. {new Intl.NumberFormat("en-IN").format(selectedBooking.totalPrice)}/-
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BookingTable;