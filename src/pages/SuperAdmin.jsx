import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../services/Api";
import { CheckCircle, XCircle } from "lucide-react";

const SuperAdmin = () => {
  // State management

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [verifyAlert, setVerifyAlert] = useState(false);

  //]
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

  // API configuration

  // Fetch hotels data
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.pageNumber,
          size: pagination.pageSize,
          ...(filters.district && { district: filters.district }),
          ...(filters.verified && { verified: filters.verified }),
          ...(filters.searchQuery && { search: filters.searchQuery }),
        };

        const response = await api.get("/hotels", { params });
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

  // Helper functions
  const hasMissingData = (hotel) => {
    return (
      !hotel.name || !hotel.phone || !hotel.licenseUrl || !hotel.idProofUrl
    );
  };

  const handleVerifyHotel = async (hotelId) => {
    console.log("Hote Id: " + hotelId);
    try {
      const res = await api.post(`/hotels/${hotelId}/verify`);
      if (res.status === 200) {
        setVerified(true);
      }
      // Refresh data after verification

      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        ...filters,
      };
      const response = await api.get("/hotels", { params });
      setHotels(response.data.content);
      setVerifyAlert(true);
      setTimeout(() => {
        setVerifyAlert(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 0 })); // Reset to first page
  };

  // Sub-components
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="rounded-md bg-red-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error loading data
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SearchFilters = () => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleFilterChange(localFilters);
    };

    const handleReset = () => {
      const resetFilters = { district: "", verified: "", searchQuery: "" };
      setLocalFilters(resetFilters);
      handleFilterChange(resetFilters);
    };

    return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4"
        >
          <div className="flex-1">
            <label htmlFor="searchQuery" className="sr-only">
              Search
            </label>
            <input
              type="text"
              name="searchQuery"
              id="searchQuery"
              placeholder="Search hotels..."
              value={localFilters.searchQuery}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="district" className="sr-only">
              District
            </label>
            <select
              id="district"
              name="district"
              value={localFilters.district}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Districts</option>
              <option value="Thimphu">Thimphu</option>
              <option value="Paro">Paro</option>
              <option value="Punakha">Punakha</option>
            </select>
          </div>

          <div>
            <label htmlFor="verified" className="sr-only">
              Verification Status
            </label>
            <select
              id="verified"
              name="verified"
              value={localFilters.verified}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
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
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={handlePrevious}
            disabled={pagination.pageNumber === 0}
            className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
              pagination.pageNumber === 0
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={pagination.pageNumber === pagination.totalPages - 1}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
              pagination.pageNumber === pagination.totalPages - 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page{" "}
              <span className="font-medium">{pagination.pageNumber + 1}</span>{" "}
              of <span className="font-medium">{pagination.totalPages}</span>
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={handlePrevious}
                disabled={pagination.pageNumber === 0}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  pagination.pageNumber === 0 ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    pagination.pageNumber === i
                      ? "bg-blue-500 text-white"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  } focus:z-20`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={handleNext}
                disabled={pagination.pageNumber === pagination.totalPages - 1}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  pagination.pageNumber === pagination.totalPages - 1
                    ? "cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const HotelTable = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
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
            {hotels.map((hotel) => (
              <tr
                key={hotel.id}
                className={hasMissingData(hotel) ? "bg-yellow-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {hotel.photoUrls?.length > 0 ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={hotel.photoUrls[0]}
                          alt="Hotel"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            No photo
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div
                        className={`text-sm font-medium ${
                          !hotel.name ? "text-red-500" : "text-gray-900"
                        }`}
                      >
                        {hotel.name || "Missing name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined:{" "}
                        {format(new Date(hotel.createdAt), "dd MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${
                      !hotel.email ? "text-red-500" : "text-gray-900"
                    }`}
                  >
                    {hotel.email || "Missing email"}
                  </div>
                  <div
                    className={`text-sm ${
                      !hotel.phone ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {hotel.phone || "Missing phone"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{hotel.district}</div>
                  <div className="text-sm text-gray-500">{hotel.village}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2 flex-col">
                    {hotel.licenseUrl ? (
                      <a
                        href={hotel.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        License
                      </a>
                    ) : (
                      <span className="text-red-500 text-sm">Missing</span>
                    )}
                    {hotel.idProofUrl ? (
                      <a
                        href={hotel.idProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        ID Proof
                      </a>
                    ) : (
                      <span className="text-red-500 text-sm">Missing</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hotel.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {hotel.verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!hotel.verified && (
                    <button
                      onClick={() => handleVerifyHotel(hotel.id)}
                      disabled={hasMissingData(hotel)}
                      className={`mr-2 ${
                        hasMissingData(hotel)
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white px-3 py-1 rounded-md text-sm`}
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Hotel Verification Dashboard
        </h1>
        {verifyAlert && (
          <>
            {verified ? (
              <div className="w-full bg-green-100 border border-green-300 text-green-800 p-4 rounded-md flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-medium">Operation completed successfully.</p>
              </div>
            ) : (
              <div className="w-full bg-red-100 border border-red-300 text-red-800 p-4 rounded-md flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="font-medium">
                  Something went wrong. Please try again later.
                </p>
              </div>
            )}
          </>
        )}

        <SearchFilters />

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
      </div>
    </div>
  );
};

export default SuperAdmin;
