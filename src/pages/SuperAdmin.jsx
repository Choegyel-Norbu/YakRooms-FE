import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../services/Api";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SuperAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingHotelId, setVerifyingHotelId] = useState(null); // New state for tracking verification

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
      if (res.status === 200) {
        toast.success("Hotel Verified", {
          description: "The hotel has been successfully verified.",
          icon: <CheckCircle className="text-green-600" />,
        });
        // Optimistically update the hotel's verified status in the state
        setHotels((prevHotels) =>
          prevHotels.map((hotel) =>
            hotel.id === hotelId ? { ...hotel, verified: true } : hotel
          )
        );
      }
    } catch (err) {
      toast.error("Verification Failed", {
        description:
          "There was an error verifying the hotel. Please try again.",
        icon: <XCircle className="text-red-600" />,
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

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              <Button type="submit">Apply Filters</Button>
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
                  {hotel.village}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Hotel Verification Dashboard
            </h1>
          </div>
          <Link to="/">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>

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
