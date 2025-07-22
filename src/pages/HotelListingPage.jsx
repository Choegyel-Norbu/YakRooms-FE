import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Loader2, 
  Home, 
  Building2,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "../services/Api";
import Navbar from "../components/Navbar.jsx";

// YakRooms Text Logo Component (copied from Navbar.jsx)
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    small: "text-lg font-bold",
    default: "text-xl font-bold",
    large: "text-2xl font-bold"
  };

  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const HotelListingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default"); // Added sort state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });

  useEffect(() => {
    fetchHotels(0);
  }, [sortBy]); // Re-fetch when sort changes

  const fetchHotels = async (page = 0) => {
    try {
      setLoading(true);
      let endpoint = `/hotels?page=${page}&size=${pagination.size}`;
      
      // Use different endpoints based on sort selection
      if (sortBy === "price-high") {
        endpoint = `/hotels/sortedByHighestPrice?page=${page}&size=${pagination.size}`;
      } else if (sortBy === "price-low") {
        endpoint = `/hotels/sortedByLowestPrice?page=${page}&size=${pagination.size}`;
      }
      
      const response = await api.get(endpoint);
      setHotels(response.data.content);
      setPagination({
        page: response.data.pageable.pageNumber,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Updated transform function without rating data
  const transformHotelData = (hotel) => ({
    id: hotel.id,
    name: hotel.name,
    district: hotel.district,
    // Use lowestPrice from API response, fallback to random if null
    price: hotel.lowestPrice || Math.floor(Math.random() * 400) + 80,
    // Include lowestPrice for conditional display
    lowestPrice: hotel.lowestPrice,
    image:
      hotel.photoUrls?.[0] ||
      `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format`,
    type: hotel.hotelType || "Hotel",
    amenities: hotel.amenities || [],
  });

  const transformedHotels = hotels.map(transformHotelData);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchHotels(newPage);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 0) handlePageChange(pagination.page - 1);
                }}
                className={pagination.page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(pagination.totalPages).keys()].map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === pagination.page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNumber);
                  }}
                >
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.totalPages - 1) {
                    handlePageChange(pagination.page + 1);
                  }
                }}
                className={
                  pagination.page >= pagination.totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Brand and Navigation */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2"
              >
                <YakRoomsText size="default" />
              </Link>
              
              {/* Mobile Home Button - removed as per request */}
              {/* <Button asChild variant="ghost" size="sm" className="sm:hidden">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button> */}
            </div>

            {/* Center - Tagline (hidden on mobile) */}
            <div className="hidden md:block">
              <p className="text-muted-foreground text-sm">
                Discover authentic Bhutanese stays
              </p>
            </div>

            {/* Right side - Results count */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden lg:block">
                {pagination.totalElements} results
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <main className="w-full">
          {/* Header Section with Sort Controls */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  All Hotels in Bhutan
                </h1>
                <div className="text-muted-foreground">
                  <span>
                    {loading
                      ? "Loading hotels..."
                      : `${pagination.totalElements} ${pagination.totalElements === 1 ? 'hotel' : 'hotels'} found`}
                  </span>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-3">
                <Label htmlFor="sort-by" className="text-sm font-medium whitespace-nowrap">
                  Sort by
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Finding the best hotels for you...</p>
            </div>
          ) : transformedHotels.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {transformedHotels.map((hotel) => (
                  <Card
                    key={hotel.id}
                    className="overflow-hidden flex flex-col group transition-all hover:shadow-xl border-0 shadow-md"
                  >
                    <div className="relative overflow-hidden">
                      <Link to={`/hotel/${hotel.id}`}>
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Hotel Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                          {hotel.type}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="flex-1">
                      <div className="space-y-2">
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          <Link to={`/hotel/${hotel.id}`} className="hover:underline">
                            {hotel.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                          <span>{hotel.district}, Bhutan</span>
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardFooter className="bg-muted/30 border-t px-6 py-4">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          {/* Fixed price display to properly use lowestPrice */}
                          {hotel.lowestPrice ? (
                            <>
                              <p className="text-sm text-muted-foreground">From</p>
                              <p className="text-xl font-bold text-primary">
                                Nu. {new Intl.NumberFormat('en-IN').format(hotel.lowestPrice)}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                  /night
                                </span>
                              </p>
                            </>
                          ) : (
                            <>
                            
                              <p className="text-sm text-primary">
                                No specific price available
                              </p>
                            </>
                          )}
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/hotel/${hotel.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <Card className="text-center py-16 px-6 bg-muted/20 border-dashed border-2">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">No Hotels Found</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  We couldn't find any hotels. Please try again later.
                </CardDescription>
                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelListingPage;