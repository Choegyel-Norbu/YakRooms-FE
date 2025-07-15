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
} from "lucide-react";

import api from "../../services/Api";
import DeleteConfirmationDialog from "../cards/DeleteConfirmationDialog";

const BookingTable = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const pageSize = 10;

  // Fetch bookings data
  const fetchBookings = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/bookings/?page=${page}&size=${pageSize}`);
      if (!res.data) {
        throw new Error("Failed to fetch bookings");
      }
      const data = res.data;

      // Assuming the API returns data in format: { content: [...], totalPages: number }
      // Adjust based on actual API response structure
      if (data.content) {
        setBookings(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        // If API returns array directly
        setBookings(data);
        // For demo purposes, simulate pagination
        setTotalPages(Math.ceil(data.length / pageSize));
      }
    } catch (err) {
      setError(err.message);
      // Mock data for demo purposes when API is not available
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

  // Action handlers (stub functions)
  const handleConfirm = async (id, newStatus) => {
    console.log("Confirming booking:", id);
    const res = await api.put(`/bookings/${id}/status/${newStatus}`);

    // API call to confirm booking
  };

  const handleCheckIn = async (id, newStatus) => {
    console.log("Checking in booking:", id);
    const res = await api.put(`/bookings/${id}/status/${newStatus}`);
    // API call to check in
  };

  const handleCheckOut = async (id, newStatus) => {
    console.log("Checking out booking:", id);
    const res = await api.put(`/bookings/${id}/status/${newStatus}`);
    // API call to check out
  };

  const handleDelete = (id) => {
    console.log("Deleting booking:", id);
    // API call to delete booking
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

  // Generate page numbers for pagination
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

  // Status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "CONFIRMED":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "CHECKED_IN":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "CHECKED_OUT":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <User className="h-5 w-5" />
          Booking Management
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">Error: {error}</p>
          <p className="text-sm text-red-600 mt-1">
            Using mock data for demonstration
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guests
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {booking.name}
                    </div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {booking.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.roomNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    {booking.guests}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {booking.checkInDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {booking.checkOutDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />$
                    {booking.totalPrice}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirm(booking.id, "CONFIRMED")}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleCheckIn(booking.id, "CHECKED_IN")}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <LogIn className="h-3 w-3 mr-1" />
                      Check-in
                    </button>
                    <button
                      onClick={() => handleCheckOut(booking.id, "CHECKED_OUT")}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Check-out
                    </button>
                    <DeleteConfirmationDialog
                      onConfirm={handleDelete}
                      className=""
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </DeleteConfirmationDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 0
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages - 1
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page{" "}
              <span className="font-medium">{currentPage + 1}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page + 1}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
