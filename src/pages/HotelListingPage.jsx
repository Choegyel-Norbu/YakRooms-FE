import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Home,
  Building2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import YakRoomsLoader from "../components/loader/YakRoomsLoader";

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
  const location = useLocation();
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
  const [hotelType, setHotelType] = useState("all");

  // Track if initial load from URL params has been done
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Hotel types
  const hotelTypes = [
    "Resort",
    "Hotel",
    "Guesthouse",
    "Homestay",
    "Boutique Hotel",
  ];

  // Memoized fetch function for performance
  const fetchHotels = useCallback(
    async (page = 0, searchDistrict = "", searchHotelType = "", forceSearch = false) => {
      try {
        setLoading(true);
        let endpoint = `/hotels?page=${page}&size=${pagination.size}`;

        // Use search endpoint if there's a search district, hotel type filter, or if forceSearch is true
        if (searchDistrict || (searchHotelType && searchHotelType !== "all") || forceSearch) {
          const params = new URLSearchParams({
            page: page.toString(),
            size: pagination.size.toString(),
          });

          if (searchDistrict.trim())
            params.append("district", searchDistrict.trim());
          if (searchHotelType && searchHotelType !== "all")
            params.append("hotelType", searchHotelType);

          endpoint = `/hotels/search?${params.toString()}`;
        } else {
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
    },
    [pagination.size, sortBy]
  );

  // Handle URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const districtParam = params.get("district");
    const hotelTypeParam = params.get("hotelType");
    
    // Set initial values from URL params
    if (districtParam) {
      setDistrict(districtParam);
    }
    
    if (hotelTypeParam) {
      setHotelType(hotelTypeParam);
    }
    
    // Mark initial load as done
    setInitialLoadDone(true);
    
    // Trigger search with URL parameters
    if (districtParam || hotelTypeParam) {
      fetchHotels(0, districtParam || "", hotelTypeParam || "all", true);
    } else {
      // If no search params, fetch all hotels
      fetchHotels(0, "", "all", false);
    }
  }, []); // Only run once on mount

  // Handle subsequent changes to district or hotelType (after initial load)
  useEffect(() => {
    if (initialLoadDone) {
      // Skip the first run since we handle it in the initial load effect
      const timer = setTimeout(() => {
        fetchHotels(0, district, hotelType, district || (hotelType && hotelType !== "all"));
      }, 300); // Small debounce to avoid too many API calls
      
      return () => clearTimeout(timer);
    }
  }, [district, hotelType, fetchHotels, initialLoadDone]);

  // Simple search handler
  const handleSearch = () => {
    fetchHotels(0, district, hotelType, true);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setDistrict("");
    setHotelType("all");
    // Clear URL parameters and fetch all hotels
    window.history.replaceState({}, "", "/hotels");
    // Explicitly fetch all hotels when user clears search
    fetchHotels(0, "", "all", false);
  };

  // Check if search is active
  const isSearchActive = district.trim() || (hotelType && hotelType !== "all");

  // Updated transform function without rating data
  const transformHotelData = (hotel) => ({
    id: hotel.id,
    name: hotel.name,
    district: hotel.district,
    // Use lowestPrice from API response, fallback to random if null
    price: hotel.lowestPrice,
    // Include lowestPrice for conditional display
    lowestPrice: hotel.lowestPrice,
    image:
      hotel.photoUrls?.[0] ||
      `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format`,
    type: hotel.hotelType || "Hotel",
    amenities: hotel.amenities || [],
    address: hotel.address, // Add address to transformed data
  });

  const transformedHotels = hotels.map(transformHotelData);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchHotels(newPage, district, hotelType, isSearchActive);
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
                  if (pagination.page > 0)
                    handlePageChange(pagination.page - 1);
                }}
                className={
                  pagination.page === 0 ? "pointer-events-none opacity-50" : ""
                }
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
      small: "text-lg font-semibold",
      default: "text-xl font-semibold",
      large: "text-2xl font-semibold",
    };
    return (
      <div className={`${textSizes[size]} font-sans tracking-tight`}>
        <span className="text-blue-600">Yak</span>
        <span className="text-yellow-500">Rooms</span>
      </div>
    );
  };

  // Generate dynamic title based on search
  const getPageTitle = () => {
    if (!isSearchActive) return "All Hotels in Bhutan";
    
    const parts = [];
    if (district) parts.push(`Hotels in ${district}`);
    if (hotelType && hotelType !== "all") {
      const typeLabel = hotelType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      parts.push(typeLabel);
    }
    
    return parts.join(' - ') || "Search Results";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Brand and Navigation */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* District Search */}
            <div className="flex-1">
              <Input
                placeholder="Search by district..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full text-14"
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
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              {isSearchActive && (
                <Button variant="outline" onClick={handleClearSearch} disabled={loading}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-xl font-semibold tracking-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading
                    ? "Searching..."
                    : isSearchActive && pagination.totalElements === 0
                    ? "No hotels found for this search"
                    : `${pagination.totalElements} ${
                        pagination.totalElements === 1 ? "hotel" : "hotels"
                      } found`}
                </p>

                {/* Active filters display */}
                {isSearchActive && !loading && (
                  <div className="flex gap-2 mt-2">
                    {district && (
                      <Badge variant="secondary" className="text-xs">
                        District: {district}
                      </Badge>
                    )}
                    {hotelType && hotelType !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {hotelType.split('_').join(' ')}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Sort Controls - only show when not searching */}
              {!isSearchActive && !loading && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Sort by</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <YakRoomsLoader 
                size={112} 
                showTagline={false} 
                loadingText=""
                className="mb-4"
              />
            </div>
          ) : transformedHotels.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {transformedHotels.map((hotel) => (
                  <Card
                    key={hotel.id}
                    className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-border/50 shadow-lg rounded-lg bg-card"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Link to={`/hotel/${hotel.id}`}>
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="h-40 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Hotel Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/95 backdrop-blur-md shadow-lg border border-border/20 text-xs font-medium px-2 py-0.5"
                        >
                          {hotel.type}
                        </Badge>
                      </div>

                      {/* Price Badge - Compact positioning */}
                      {hotel.lowestPrice && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-primary text-primary-foreground px-2 py-1.5 rounded-md shadow-lg backdrop-blur-md border border-primary/20">
                            <span className="text-14 text-yellow-500">From</span>
                            <div className="text-xs font-bold leading-none">
                              Nu. {hotel.lowestPrice.toLocaleString()}
                            </div>
                            <div className="text-xs opacity-90 leading-none">per night</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader className="flex-1 p-4 pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          <Link
                            to={`/hotel/${hotel.id}`}
                            className="hover:underline decoration-2 underline-offset-2"
                          >
                            {hotel.name}
                          </Link>
                        </CardTitle>
                        
                        <CardDescription className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                          <span className="font-medium">{hotel.district}, Bhutan</span>
                        </CardDescription>

                        {/* Address Section - Compact */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Address
                          </p>
                          <p className="text-sm text-foreground line-clamp-2">
                            {hotel.address || "Address not available"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="bg-muted/30 border-t border-border/50 p-4 pt-3 mt-auto">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                          {/* Verified Badge */}
                          <Badge 
                            variant="outline" 
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-colors duration-200 px-2 py-1 text-xs font-medium flex items-center gap-1"
                          >
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Verified
                          </Badge>
                        </div>
                        
                        <Button 
                          asChild 
                          size="sm" 
                          className="ml-3 shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-1.5 font-medium text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded-[20px]"
                        >
                          <Link to={`/hotel/${hotel.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <Card className="text-center py-16 px-6 bg-muted/20 border-dashed border-2 rounded-xl">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">
                  {isSearchActive ? "No Hotels Found" : "No Hotels Available"}
                </CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  {isSearchActive 
                    ? `We couldn't find any hotels matching your search criteria. Try adjusting your filters or search terms.`
                    : "We couldn't find any hotels. Please try again later."
                  }
                </CardDescription>
                <div className="flex justify-center gap-3 mt-6">
                  {isSearchActive && (
                    <Button variant="outline" onClick={handleClearSearch}>
                      <X className="mr-2 h-4 w-4" />
                      Clear Search
                    </Button>
                  )}
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