// BookingTable.jsx
import React from "react";
import { FiCheck, FiX, FiClock, FiEye } from "react-icons/fi";

const BookingTable = ({ bookings, onStatusChange, viewMode = "full" }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: {
        text: "Confirmed",
        bg: "bg-green-100",
        textColor: "text-green-800",
        icon: <FiCheck className="text-green-500" />,
      },
      pending: {
        text: "Pending",
        bg: "bg-amber-100",
        textColor: "text-amber-800",
        icon: <FiClock className="text-amber-500" />,
      },
      cancelled: {
        text: "Cancelled",
        bg: "bg-red-100",
        textColor: "text-red-800",
        icon: <FiX className="text-red-500" />,
      },
      completed: {
        text: "Completed",
        bg: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <FiCheck className="text-blue-500" />,
      },
    };

    const currentStatus = statusMap[status] || statusMap.pending;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${currentStatus.bg} ${currentStatus.textColor}`}
      >
        {currentStatus.icon}
        <span className="ml-1">{currentStatus.text}</span>
      </span>
    );
  };

  const handleStatusChange = (id, newStatus) => {
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Guest
            </th>
            {viewMode === "full" && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Room
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Dates
            </th>
            {viewMode === "full" && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <tr>
              <td
                colSpan={viewMode === "full" ? 7 : 5}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No bookings found
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {booking.guest.name}
                  </div>
                  {viewMode === "compact" && (
                    <div className="text-sm text-gray-500">
                      {booking.guest.email}
                    </div>
                  )}
                </td>

                {viewMode === "full" && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.guest.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.guest.phone}
                    </div>
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.roomType}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.checkIn}</div>
                  <div className="text-sm text-gray-500">
                    to {booking.checkOut}
                  </div>
                </td>

                {viewMode === "full" && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.payment.amount} {booking.payment.currency}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {booking.payment.status}
                    </div>
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-amber-600 hover:text-amber-900">
                      <FiEye className="h-5 w-5" />
                    </button>
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(booking.id, "confirmed")
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(booking.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "completed")
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiCheck className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
