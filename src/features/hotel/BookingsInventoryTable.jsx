import React, { useState, useEffect } from "react";
import { Download, Search, Calendar, FileText, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Spinner } from "@/components/ui/ios-spinner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOption, setSearchOption] = useState("all"); // Updated search options
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10; // Number of bookings per page

  // Fetch bookings data with pagination and search
  const fetchBookings = async (page, searchParams = {}) => {
    if (!hotelId) return;

    try {
      setLoading(true);
      let url = "";
      const baseParams = `page=${page}&size=${pageSize}&hotelId=${hotelId}`;
      
      // Determine which endpoint to use based on search criteria
      if (searchParams.searchOption && searchParams.searchTerm) {
        switch (searchParams.searchOption) {
          case "cid":
            url = `/bookings/search/cid?cid=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
            break;
          case "phone":
            url = `/bookings/search/phone?phone=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
            break;
          case "checkin":
            url = `/bookings/search/checkin-date?checkInDate=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
            break;
          case "checkout":
            url = `/bookings/search/checkout-date?checkOutDate=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
            break;
          default:
            url = `/bookings/?${baseParams}`;
        }

      } else {
        url = `/bookings/?${baseParams}`;
      }

      const response = await api.get(url);
      
      if (response.data && response.data.content) {
        // Paginated response
        setBookings(response.data.content);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setBookings(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize));
        setTotalElements(response.data.length);
      }
    } catch (error) {
      
      toast.error("Failed to fetch bookings data");
      setBookings([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and page changes
  useEffect(() => {
    // Only pass search params if we're maintaining an active search across page changes
    const hasActiveSearch = searchTerm;
    const searchParams = hasActiveSearch ? getSearchParams() : {};
    fetchBookings(currentPage, searchParams);
  }, [hotelId, currentPage]);

  // Manual search function
  const handleSearch = () => {
    if (searchTerm) {
      setCurrentPage(0); // Reset to first page when searching
      const searchParams = getSearchParams();
      fetchBookings(0, searchParams);
    } else {
      // Clear search - fetch all bookings
      setCurrentPage(0);
      fetchBookings(0);
    }
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to get current search parameters
  const getSearchParams = () => {
    if (searchTerm && searchOption !== "all") {
      return { searchOption, searchTerm };
    }
    return {};
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      if (totalElements === 0) {
        toast.warning("No data to export");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Preparing Excel export...");

      // Fetch all bookings for export using current search criteria
      let allBookings = [];
      try {
        const searchParams = getSearchParams();
        let url = "";
        const baseParams = `page=0&size=${totalElements}&hotelId=${hotelId}`;
        
        // Use the same endpoint logic as fetchBookings
        if (searchParams.searchOption && searchParams.searchTerm) {
          switch (searchParams.searchOption) {
            case "cid":
              url = `/bookings/search/cid?cid=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
              break;
            case "phone":
              url = `/bookings/search/phone?phone=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
              break;
            case "checkin":
              url = `/bookings/search/checkin-date?checkInDate=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
              break;
            case "checkout":
              url = `/bookings/search/checkout-date?checkOutDate=${encodeURIComponent(searchParams.searchTerm)}&${baseParams}`;
              break;
            default:
              url = `/bookings/?${baseParams}`;
          }

        } else {
          url = `/bookings/?${baseParams}`;
        }

        const response = await api.get(url);
        if (response.data && response.data.content) {
          allBookings = response.data.content;
        } else if (Array.isArray(response.data)) {
          allBookings = response.data;
        }
      } catch (error) {
        
        // Fallback to current page data
        allBookings = bookings;
      }

      let filteredAllBookings = allBookings;

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
        "Transfer Status": booking.transferStatus || "N/A",
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
        { wch: 15 }, // Transfer Status
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
      
      toast.error("Failed to export data to Excel");
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "default";
      case "CHECKED_IN":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "COMPLETED":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get transfer status badge variant
  const getTransferStatusBadgeVariant = (transferStatus) => {
    switch (transferStatus?.toUpperCase()) {
      case "TRANSFERRED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BTN", // Bhutanese Ngultrum
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
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
        return "Enter CID number...";
      case "phone":
        return "Enter phone number...";
      case "checkin":
        return "Enter check-in date (YYYY-MM-DD)...";
      case "checkout":
        return "Enter check-out date (YYYY-MM-DD)...";
      default:
        return "Select search criteria...";
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
    setSearchOption("all");
    // Immediately fetch all bookings when clearing
    setCurrentPage(0);
    fetchBookings(0);
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
            <Spinner size="lg" className="text-primary" />
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
        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              {/* Search Options and Input */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                {/* Search Option Selector */}
                <Select value={searchOption} onValueChange={setSearchOption}>
                  <SelectTrigger className="w-full sm:w-[180px] lg:w-[160px]">
                    <SelectValue placeholder="Search by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="cid">Search by CID</SelectItem>
                    <SelectItem value="phone">Search by Phone</SelectItem>
                    <SelectItem value="checkin">Search by Check-in Date</SelectItem>
                    <SelectItem value="checkout">Search by Check-out Date</SelectItem>
                  </SelectContent>
                </Select>

                {/* Conditional Search Input */}
                {searchOption !== "all" ? (
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={getSearchPlaceholder()}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="pl-10 w-full"
                      />
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <Button
                        onClick={handleSearch}
                        disabled={!searchTerm.trim()}
                        className="px-4 flex-1 sm:flex-initial"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Search</span>
                      </Button>
                      {searchTerm && (
                        <Button
                          onClick={clearSearch}
                          variant="outline"
                          size="sm"
                          className="px-3 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={exportToExcel}
              disabled={totalElements === 0}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Bookings Table */}
        {bookings.length === 0 ? (
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
                  {/* <TableHead className="w-16">Sl.No. </TableHead> */}
                  <TableHead className="w-32 font-bold">CID</TableHead>
                  <TableHead className="min-w-40 font-bold">Guest Details</TableHead>
                  <TableHead className="min-w-32 font-bold">Room Info</TableHead>
                  <TableHead className="min-w-40 font-bold">Stay Period</TableHead>
                  <TableHead className="w-24 font-bold">Guests</TableHead>
                  <TableHead className="w-28 font-bold">Booking Status</TableHead>
                  <TableHead className="w-32 font-bold">Transfer Status</TableHead>
                  <TableHead className="w-32 font-bold">Price</TableHead>
                  <TableHead className="min-w-40 font-bold">Travel Info</TableHead>
                  <TableHead className="min-w-32 font-bold">Booked on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    {/* <TableCell className="font-medium">{booking.id}</TableCell> */}
                    {/* CID */}
                    <TableCell className="font-medium text-sm">
                      {booking.cid || (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </TableCell>
                    {/* Guest Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{booking.guestName || booking.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                      </div>
                    </TableCell>
                    {/* Room Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">Room {booking.roomNumber}</div>
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

                    {/* Transfer Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getTransferStatusBadgeVariant(booking.transferStatus)}>
                          {booking.transferStatus || "N/A"}
                        </Badge>
                        {booking.journalNumber && (
                          <div className="text-xs text-muted-foreground">
                            Journal: {booking.journalNumber}
                          </div>
                        )}
                      </div>
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
        {bookings.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {bookings.length} of {totalElements} bookings
            {searchTerm && " (filtered)"}
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
