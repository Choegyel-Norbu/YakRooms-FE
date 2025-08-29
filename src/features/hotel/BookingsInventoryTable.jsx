import React, { useState, useEffect } from "react";
import { Download, Search, Calendar, FileText, Loader2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Badge } from "@/shared/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import api from "../../shared/services/Api";
import { toast } from "sonner";

const BookingsInventoryTable = ({ hotelId }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOption, setSearchOption] = useState("name"); // New state for search option
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10; // Number of bookings per page

  // Fetch bookings data with pagination
  const fetchBookings = async (page) => {
    if (!hotelId) return;

    try {
      setLoading(true);
      const response = await api.get(`/bookings/?page=${page}&size=${pageSize}&hotelId=${hotelId}`);
      
      if (response.data && response.data.content) {
        // Paginated response
        setBookings(response.data.content);
        setFilteredBookings(response.data.content);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setBookings(response.data);
        setFilteredBookings(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize));
        setTotalElements(response.data.length);
      }
      
      console.log("Bookings fetched:", response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings data");
      setBookings([]);
      setFilteredBookings([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
  }, [hotelId, currentPage]);

  // Filter bookings based on search term and search option
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term based on selected option
    if (searchTerm) {
      filtered = filtered.filter((booking) => {
        switch (searchOption) {
          case "cid":
            return booking.cid?.toLowerCase().includes(searchTerm.toLowerCase());
          case "phone":
            return booking.phone?.includes(searchTerm);
          case "name":
            return booking.name?.toLowerCase().includes(searchTerm.toLowerCase());
          case "checkin":
            // Search by check-in date (partial match)
            const checkInDate = new Date(booking.checkInDate);
            const searchDate = new Date(searchTerm);
            return checkInDate.toDateString().includes(searchTerm) || 
                   checkInDate.toLocaleDateString().includes(searchTerm);
          default:
            // Fallback to name search
            return booking.name?.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    setFilteredBookings(filtered);
  }, [searchTerm, searchOption, bookings]);

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      if (totalElements === 0) {
        toast.warning("No data to export");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Preparing Excel export...");

      // Fetch all bookings for export (without pagination)
      let allBookings = [];
      try {
        const response = await api.get(`/bookings/?page=0&size=${totalElements}&hotelId=${hotelId}`);
        if (response.data && response.data.content) {
          allBookings = response.data.content;
        } else if (Array.isArray(response.data)) {
          allBookings = response.data;
        }
      } catch (error) {
        console.error("Error fetching all bookings for export:", error);
        // Fallback to current page data
        allBookings = filteredBookings;
      }

      // Apply current filters to all bookings
      let filteredAllBookings = allBookings;
      
      // Filter by search term based on selected option
      if (searchTerm) {
        filteredAllBookings = filteredAllBookings.filter((booking) => {
          switch (searchOption) {
            case "cid":
              return booking.cid?.toLowerCase().includes(searchTerm.toLowerCase());
            case "phone":
              return booking.phone?.includes(searchTerm);
            case "name":
              return booking.name?.toLowerCase().includes(searchTerm.toLowerCase());
            case "checkin":
              const checkInDate = new Date(booking.checkInDate);
              const searchDate = new Date(searchTerm);
              return checkInDate.toDateString().includes(searchTerm) || 
                     checkInDate.toLocaleDateString().includes(searchTerm);
            default:
              return booking.name?.toLowerCase().includes(searchTerm.toLowerCase());
          }
        });
      }

      if (filteredAllBookings.length === 0) {
        toast.dismiss(loadingToast);
        toast.warning("No data to export with current filters");
        return;
      }

      // Prepare data for Excel
      const excelData = filteredAllBookings.map((booking) => ({
        ID: booking.id,
        "Guest Name": booking.name,
        "Phone": booking.phone,
        "Email": booking.email,
        "CID": booking.cid,
        "Room Number": booking.roomNumber,
        "Passcode": booking.passcode,
        "Check-In Date": booking.checkInDate,
        "Check-Out Date": booking.checkOutDate,
        "Guests": booking.guests,
        "Status": booking.status,
        "Total Price": booking.totalPrice,
        "Origin": booking.origin,
        "Destination": booking.destination,
        "Hotel Name": booking.hotelName,
        "Hotel District": booking.hotelDistrict,
        "Created At": new Date(booking.createdAt).toLocaleString(),
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 8 },  // ID
        { wch: 20 }, // Guest Name
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 15 }, // CID
        { wch: 12 }, // Room Number
        { wch: 10 }, // Passcode
        { wch: 12 }, // Check-In Date
        { wch: 12 }, // Check-Out Date
        { wch: 8 },  // Guests
        { wch: 12 }, // Status
        { wch: 12 }, // Total Price
        { wch: 15 }, // Origin
        { wch: 15 }, // Destination
        { wch: 20 }, // Hotel Name
        { wch: 15 }, // Hotel District
        { wch: 20 }, // Created At
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

      // Generate filename with current date
      const fileName = `Hotel_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, fileName);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Exported ${filteredAllBookings.length} bookings to Excel`, {
        duration: 6000,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export data to Excel");
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "default";
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "COMPLETED":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BTN", // Bhutanese Ngultrum
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(bookings.map((booking) => booking.status))];

  // Pagination handlers
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

  // Get search placeholder text based on selected option
  const getSearchPlaceholder = () => {
    switch (searchOption) {
      case "cid":
        return "Search by CID number...";
      case "phone":
        return "Search by phone number...";
      case "name":
        return "Search by guest name...";
      case "checkin":
        return "Search by check-in date (MM/DD/YYYY)...";
      default:
        return "Search by guest name...";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Bookings Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 text-primary" />
          Bookings Inventory
        </CardTitle>
      </CardHeader> */}
      <CardContent className="space-y-4">
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Options and Input */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Search Option Selector */}
              <select
                value={searchOption}
                onChange={(e) => setSearchOption(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[140px]"
              >
                <option value="name">Search by Name</option>
                <option value="cid">Search by CID</option>
                <option value="phone">Search by Phone</option>
                <option value="checkin">Search by Check-in Date</option>
              </select>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={exportToExcel}
            disabled={totalElements === 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
            {/* ({totalElements} total) */}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalElements}</div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "CONFIRMED").length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed (Page)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "PENDING").length}
            </div>
            <div className="text-sm text-muted-foreground">Pending (Page)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(
                bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
              )}
            </div>
            <div className="text-sm text-muted-foreground">Page Revenue</div>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {bookings.length === 0 ? "No Bookings Found" : "No Matching Bookings"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {bookings.length === 0
                ? "There are no bookings for this hotel yet."
                : "Try adjusting your search criteria or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Sl.No. </TableHead>
                  <TableHead className="min-w-40">Guest Details</TableHead>
                  <TableHead className="w-32">CID</TableHead>
                  <TableHead className="min-w-32">Room Info</TableHead>
                  <TableHead className="min-w-40">Stay Period</TableHead>
                  <TableHead className="w-24">Guests</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-32">Price</TableHead>
                  <TableHead className="min-w-40">Travel Info</TableHead>
                  <TableHead className="min-w-32">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    
                    {/* Guest Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{booking.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                      </div>
                    </TableCell>

                    {/* CID */}
                    <TableCell className="font-medium text-sm">
                      {booking.cid || (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>

                    {/* Room Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">Room {booking.roomNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          Code: {booking.passcode}
                        </div>
                      </div>
                    </TableCell>

                    {/* Stay Period */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground">Check-in</div>
                          <div>{formatDate(booking.checkInDate)}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground">Check-out</div>
                          <div>{formatDate(booking.checkOutDate)}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Guests */}
                    <TableCell className="text-center font-medium">
                      {booking.guests}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium text-black">
                      {formatCurrency(booking.totalPrice)}
                    </TableCell>

                    {/* Travel Info */}
                    <TableCell>
                      {booking.origin || booking.destination ? (
                        <div className="space-y-1 text-sm">
                          {booking.origin && (
                            <div>
                              <span className="text-xs text-muted-foreground">From:</span>{" "}
                              {booking.origin}
                            </div>
                          )}
                          {booking.destination && (
                            <div>
                              <span className="text-xs text-muted-foreground">To:</span>{" "}
                              {booking.destination}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-sm">
                      {formatDate(booking.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results Summary */}
        {filteredBookings.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredBookings.length} of {totalElements} bookings
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-background border-t">
            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing page{" "}
                  <span className="font-medium">{currentPage + 1}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                  {" "}({totalElements} total bookings)
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    variant="outline"
                    size="sm"
                    className="rounded-l-md rounded-r-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                    >
                      {page + 1}
                    </Button>
                  ))}

                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    variant="outline"
                    size="sm"
                    className="rounded-r-md rounded-l-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsInventoryTable;
