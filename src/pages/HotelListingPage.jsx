import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Loader2,
  Home,
  Building2,
  ChevronDown,
  Search,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import api from "../services/Api";


const HotelListingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });

  // Simple search state
  const [district, setDistrict] = useState("");
  const [hotelType, setHotelType] = useState("all"); // Changed from "" to "all"

  // Hotel types
  const hotelTypes = ["Resort", "Hotel", "Guesthouse", "Homestay", "Boutique Hotel"];

  // Memoized fetch function for performance
  const fetchHotels = useCallback(async (page = 0, searchDistrict = "", searchHotelType = "") => {
    try {
      setLoading(true);
      let endpoint = `/hotels?page=${page}&size=${pagination.size}`;
      
      // Use search endpoint if filters are provided
      // Modified condition to check for "all" instead of empty string
      if (searchDistrict || (searchHotelType && searchHotelType !== "all")) {
        const params = new URLSearchParams({
          page: page.toString(),
          size: pagination.size.toString(),
        });
        
        if (searchDistrict.trim()) params.append("district", searchDistrict.trim());
        if (searchHotelType && searchHotelType !== "all") params.append("hotelType", searchHotelType);
        
        endpoint = `/hotels/search?${params.toString()}`;
      } else {
        // Apply sorting for non-search queries
        if (sortBy === "price-high") {
          endpoint = `/hotels/sortedByHighestPrice?page=${page}&size=${pagination.size}`;
        } else if (sortBy === "price-low") {
          endpoint = `/hotels/sortedByLowestPrice?page=${page}&size=${pagination.size}`;
        }
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
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.size, sortBy]);

  // Initial load
  useEffect(() => {
    fetchHotels(0, district, hotelType);
  }, [fetchHotels, sortBy]);

  // Simple search handler
  const handleSearch = () => {
    fetchHotels(0, district, hotelType);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setDistrict("");
    setHotelType("all"); // Changed from "" to "all"
    fetchHotels(0, "", "");
  };

  // Check if search is active
  const isSearchActive = district.trim() || (hotelType && hotelType !== "all"); // Modified condition

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
      fetchHotels(newPage, district, hotelType);
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
              
              {/* Mobile Home Button */}
            
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
          {/* Simple Search Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* District Search */}
                <div className="flex-1">
                  <Input
                    placeholder="Search by district..."
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Hotel Type Filter */}
                <div className="sm:w-48">
                  <Select value={hotelType} onValueChange={setHotelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hotel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ONE_STAR">One Star</SelectItem>
                      <SelectItem value="TWO_STAR">Two Star</SelectItem>
                      <SelectItem value="THREE_STAR">Three Star</SelectItem>
                      <SelectItem value="FOUR_STAR">Four Star</SelectItem>
                      <SelectItem value="FIVE_STAR">Five Star</SelectItem>
                      <SelectItem value="BUDGET">Budget</SelectItem>
                      <SelectItem value="BOUTIQUE">Boutique</SelectItem>
                      <SelectItem value="RESORT">Resort</SelectItem>
                      <SelectItem value="HOMESTAY">Homestay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  {isSearchActive && (
                    <Button variant="outline" onClick={handleClearSearch}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {isSearchActive ? "Search Results" : "All Hotels in Bhutan"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading
                    ? "Searching..."
                    : `${pagination.totalElements} ${pagination.totalElements === 1 ? 'hotel' : 'hotels'} found`}
                </p>
                
                {/* Active filters display */}
                {isSearchActive && (
                  <div className="flex gap-2 mt-2">
                    {district && (
                      <Badge variant="secondary">District: {district}</Badge>
                    )}
                    {hotelType && hotelType !== "all" && (
                      <Badge variant="secondary">Type: {hotelType}</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Sort Controls - only show when not searching */}
              {!isSearchActive && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Sort by</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                              <p className="text-sm text-muted-foreground">Starting from</p>
                              <p className="text-xl font-bold text-primary">
                                Nu. {new Intl.NumberFormat('en-IN').format(hotel.price)}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                  /night
                                </span>
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