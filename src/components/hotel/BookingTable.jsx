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
} from "lucide-react";

import api from "../../services/Api"; // Your API service for making requests

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner"; // For toast notifications

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
} from "../../components/ui/alert-dialog";

// --- DeleteConfirmationDialog Component ---
// This component provides a generic confirmation dialog using shadcn/ui's AlertDialog.
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

const BookingTable = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false); // Controls the delete confirmation dialog visibility
  const [bookingToDelete, setBookingToDelete] = useState(null); // Stores the ID of the booking to be deleted

  const pageSize = 10; // Number of bookings per page

  // --- Fetch Bookings Data ---
  const fetchBookings = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/bookings/?page=${page}&size=${pageSize}`);
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
      // Mock data for demonstration purposes if API fails or is unavailable
      const mockData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        userId: Math.floor(Math.random() * 100) + 1,
        roomId: Math.floor(Math.random() * 50) + 1,
        checkInDate: new Date(2025, 6, 15 + i).toISOString().split("T")[0],
        checkOutDate: new Date(2025, 6, 17 + i).toISOString().split("T")[0],
        guests: Math.floor(Math.random() * 4) + 1,
        status: ["CONFIRMED", "PENDING", "CHECKED_IN", "CHECKED_OUT"][
          Math.floor(Math.random() * 4)
        ],
        totalPrice: (Math.random() * 2000 + 500).toFixed(2),
        createdAt: null,
        name: ["Choegyel Norbu", "Tenzin Wangmo", "Karma Dorji", "Pema Lhamo"][
          Math.floor(Math.random() * 4)
        ],
        phone: `+975-${Math.floor(Math.random() * 90000000) + 10000000}`,
        email: [
          "choegyell@gmail.com",
          "tenzin@example.com",
          "karma@test.com",
          "pema@demo.com",
        ][Math.floor(Math.random() * 4)],
        roomNumber: `A${Math.floor(Math.random() * 50) + 1}`,
      }));

      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      setBookings(mockData.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(mockData.length / pageSize));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  // --- Update Booking Status ---
  const updateBookingStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await api.put(`/bookings/${id}/status/${newStatus}`);
      if (res.status === 200) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Booking status updated successfully to {newStatus.replace("_", " ")}
            .
          </div>
        );
      }
      fetchBookings(currentPage); // Re-fetch to get updated data
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to update booking status. Please try again.
        </div>
      );
      console.error("Status update error:", err);
    } finally {
      setLoading(false);
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
        </div>
      );
      fetchBookings(currentPage); // Re-fetch to get updated data
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Failed to delete booking. Please try again.
        </div>
      );
      console.error("Delete booking error:", err);
    } finally {
      setLoading(false);
      setDeleteDialog(false); // Close the dialog
      setBookingToDelete(null); // Reset the ID
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
    let variant = "default";
    switch (status) {
      case "CONFIRMED":
        variant = "success";
        break;
      case "PENDING":
        variant = "warning";
        break;
      case "CHECKED_IN":
        variant = "info";
        break;
      case "CHECKED_OUT":
        variant = "secondary";
        break;
      case "CANCELLED":
        variant = "destructive";
        break;
      default:
        variant = "default";
    }
    return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
  };

  // --- Loading State Display ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Booking Management
        </CardTitle>
      </CardHeader>
      <CardContent>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Info</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.name}</div>
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
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {booking.checkInDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {booking.checkOutDate}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      Nu.{" "}
                      {new Intl.NumberFormat("en-IN").format(
                        booking.totalPrice
                      )}
                      /-
                    </div>
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
                        {(booking.status === "PENDING" ||
                          booking.status === "CONFIRMED") && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateBookingStatus(booking.id, "CANCELLED")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setBookingToDelete(booking.id); // Set the ID to be deleted
                            setDeleteDialog(true); // Open the confirmation dialog
                          }}
                          className="text-red-600" // Highlight delete action
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
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
                Showing page{" "}
                <span className="font-medium">{currentPage + 1}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
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
      </CardContent>

      {/* --- Delete Confirmation Dialog --- */}
      {/* This dialog is controlled by `deleteDialog` state and uses `bookingToDelete` for the actual ID */}
      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog} // Function to close the dialog
        onConfirm={handleDeleteBooking} // Function to call when confirmed
        title="Confirm Deletion"
        description={`Are you sure you want to delete booking ID ${bookingToDelete}? This action cannot be undone.`}
      />
    </Card>
  );
};

export default BookingTable;
