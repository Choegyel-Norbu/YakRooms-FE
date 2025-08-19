import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Home,
  Building2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import YakRoomsLoader from "@/shared/components/YakRoomsLoader";
import StarRating from "@/shared/components/star-rating";

import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/pagination";

import api from "../../shared/services/Api";

// Memoized YakRoomsText component to prevent unnecessary re-renders
const YakRoomsText = React.memo(({ size = "default" }) => {
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
});

// Memoized HotelCard component to prevent unnecessary re-renders
const HotelCard = React.memo(({ hotel }) => (
  <Card className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-border/50 shadow-lg rounded-lg bg-card">
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
          className="bg-background/95 backdrop-blur-md shadow-lg border border-border/20 text-xs font-medium px-2 py-0.5 text-yellow-500"
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

        {/* Rating Section */}
        {hotel.averageRating > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <StarRating 
              rating={hotel.averageRating} 
              size={14} 
              showRating={true}
              className="flex-shrink-0"
            />
            <span className="text-xs text-muted-foreground">
              ({hotel.averageRating.toFixed(1)} Avg. Rating)
            </span>
          </div>
        )}
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
          className="ml-3 shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-1.5 font-medium text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-[20px]"
        >
          <Link to={`/hotel/${hotel.id}`}>View Details</Link>
        </Button>
      </div>
    </CardFooter>
  </Card>
));

const HotelListingPage = () => {
  const location = useLocation();
  
  // Consolidated state management to reduce re-renders
  const [appState, setAppState] = useState({
    hotels: [],
    loading: true,
    initialLoadDone: false,
    lastFetchKey: null, // Track last fetch to prevent duplicate calls
  });

  const [searchState, setSearchState] = useState({
    district: "",
    hotelType: "all",
    sortBy: "default",
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });

  // Refs for performance optimization
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);

  // Memoized hotel types to prevent recreation on every render
  const hotelTypes = useMemo(() => [
    "Resort",
    "Hotel", 
    "Guesthouse",
    "Homestay",
    "Boutique Hotel",
  ], []);

  // Memoized function to generate fetch key for deduplication
  const generateFetchKey = useCallback((page, district, hotelType, sortBy) => {
    return `${page}-${district.trim()}-${hotelType}-${sortBy}`;
  }, []);

  // Optimized fetch function with request deduplication and caching
  const fetchHotels = useCallback(
    async (page = 0, searchDistrict = "", searchHotelType = "", sortByParam = "default") => {
      // Generate unique key for this request
      const fetchKey = generateFetchKey(page, searchDistrict, searchHotelType, sortByParam);
      
      // Prevent duplicate API calls
      if (appState.lastFetchKey === fetchKey && !appState.loading) {
        return;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setAppState(prev => ({ 
          ...prev, 
          loading: true, 
          lastFetchKey: fetchKey
        }));

        let endpoint = `/hotels?page=${page}&size=${pagination.size}`;
        const isSearchActive = searchDistrict.trim() || 
          (searchHotelType && searchHotelType !== "all");

        // Build endpoint based on search/sort criteria
        if (isSearchActive) {
          const params = new URLSearchParams({
            page: page.toString(),
            size: pagination.size.toString(),
          });

          if (searchDistrict.trim()) params.append("district", searchDistrict.trim());
          if (searchHotelType && searchHotelType !== "all") params.append("hotelType", searchHotelType);

          endpoint = `/hotels/search?${params.toString()}`;
        } else {
          // Apply sorting only when not searching
          if (sortByParam === "price-high") {
            endpoint = `/hotels/sortedByHighestPrice?page=${page}&size=${pagination.size}`;
          } else if (sortByParam === "price-low") {
            endpoint = `/hotels/sortedByLowestPrice?page=${page}&size=${pagination.size}`;
          }
        }

        // Store current request reference
        lastRequestRef.current = { endpoint, fetchKey };

        const response = await api.get(endpoint, { signal });

        // Check if this is still the current request
        if (lastRequestRef.current?.fetchKey === fetchKey) {
          setAppState(prev => ({
            ...prev,
            hotels: response.data.content || [],
            loading: false,
          }));

          setPagination({
            page: response.data.pageable?.pageNumber || 0,
            size: response.data.size || 6,
            totalPages: response.data.totalPages || 1,
            totalElements: response.data.totalElements || 0,
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') return; // Ignore aborted requests
        
        console.error("Error fetching hotels:", error);
        if (lastRequestRef.current?.fetchKey === fetchKey) {
          setAppState(prev => ({
            ...prev,
            hotels: [],
            loading: true, // Keep loading to show YakRoomsLoader
          }));
        }
      }
    },
    [pagination.size, generateFetchKey, appState.lastFetchKey, appState.loading]
  );

  // Handle initial URL parameters and data loading
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const districtParam = params.get("district") || "";
    const hotelTypeParam = params.get("hotelType") || "all";
    
    // Set initial search state from URL
    setSearchState(prev => ({
      ...prev,
      district: districtParam,
      hotelType: hotelTypeParam,
    }));
    
    // Fetch initial data
    fetchHotels(0, districtParam, hotelTypeParam, "default");
    
    setAppState(prev => ({ ...prev, initialLoadDone: true }));
  }, []); // Only run on mount

  // Optimized search effect with debouncing
  useEffect(() => {
    if (!appState.initialLoadDone) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      const isSearchActive = searchState.district.trim() || 
        (searchState.hotelType && searchState.hotelType !== "all");
      fetchHotels(0, searchState.district, searchState.hotelType, 
        isSearchActive ? "default" : searchState.sortBy);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchState.district, searchState.hotelType, fetchHotels, appState.initialLoadDone]);

  // Separate effect for sort changes (no debounce needed)
  useEffect(() => {
    if (!appState.initialLoadDone) return;
    
    const isSearchActive = searchState.district.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    if (!isSearchActive) {
      fetchHotels(0, searchState.district, searchState.hotelType, searchState.sortBy);
    }
  }, [searchState.sortBy, fetchHotels, appState.initialLoadDone, searchState.district, searchState.hotelType]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    const isSearchActive = searchState.district.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    fetchHotels(0, searchState.district, searchState.hotelType, 
      isSearchActive ? "default" : searchState.sortBy);
  }, [searchState.district, searchState.hotelType, searchState.sortBy, fetchHotels]);

  const handleClearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      district: "",
      hotelType: "all",
    }));
    
    window.history.replaceState({}, "", "/hotels");
    fetchHotels(0, "", "all", searchState.sortBy);
  }, [fetchHotels, searchState.sortBy]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const isSearchActive = searchState.district.trim() || 
        (searchState.hotelType && searchState.hotelType !== "all");
      fetchHotels(newPage, searchState.district, searchState.hotelType, 
        isSearchActive ? "default" : searchState.sortBy);
    }
  }, [pagination.totalPages, searchState.district, searchState.hotelType, searchState.sortBy, fetchHotels]);

  const handleDistrictChange = useCallback((value) => {
    setSearchState(prev => ({ ...prev, district: value }));
  }, []);

  const handleHotelTypeChange = useCallback((value) => {
    setSearchState(prev => ({ ...prev, hotelType: value }));
  }, []);

  const handleSortChange = useCallback((value) => {
    setSearchState(prev => ({ ...prev, sortBy: value }));
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Memoized computed values
  const isSearchActive = useMemo(() => {
    return searchState.district.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
  }, [searchState.district, searchState.hotelType]);

  const pageTitle = useMemo(() => {
    if (!isSearchActive) return "All Lodges in Bhutan";
    
    const parts = [];
    if (searchState.district) parts.push(`Hotels in ${searchState.district}`);
    if (searchState.hotelType && searchState.hotelType !== "all") {
      const typeLabel = searchState.hotelType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      parts.push(typeLabel);
    }
    
    return parts.join(' - ') || "Search Results";
  }, [isSearchActive, searchState.district, searchState.hotelType]);

  const transformedHotels = useMemo(() => {
    return appState.hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      district: hotel.district,
      price: hotel.lowestPrice,
      lowestPrice: hotel.lowestPrice,
      image: hotel.photoUrl || 
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format`,
      type: hotel.hotelType || "Hotel",
      amenities: hotel.amenities || [],
      address: hotel.address,
      averageRating: hotel.averageRating || 0,
    }));
  }, [appState.hotels]);

  // Memoized pagination component
  const renderPagination = useMemo(() => {
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
  }, [pagination.totalPages, pagination.page, handlePageChange]);

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
          <div className="space-y-4 mb-6">
            {/* First row - District and Hotel Type */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* District Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search by district..."
                  value={searchState.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-14"
                />
              </div>

              {/* Hotel Type Filter */}
              <div className="sm:w-48">
                <Select value={searchState.hotelType} onValueChange={handleHotelTypeChange}>
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
            </div>

            {/* Second row - Search Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Actions */}
              <div className="flex gap-2 sm:flex-shrink-0">
                <Button onClick={handleSearch} disabled={appState.loading} className="flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                {isSearchActive && (
                  <Button variant="outline" onClick={handleClearSearch} disabled={appState.loading}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-xl font-semibold tracking-tight">
                  {pageTitle}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {appState.loading
                    ? "Searching..."
                    : isSearchActive && pagination.totalElements === 0
                    ? "No lodges found for this search"
                    : `${pagination.totalElements} ${
                        pagination.totalElements === 1 ? "lodge" : "lodges"
                      } found`}
                </p>

                {/* Active filters display */}
                {isSearchActive && !appState.loading && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {searchState.district && (
                      <Badge variant="secondary" className="text-xs">
                        District: {searchState.district}
                      </Badge>
                    )}
                    {searchState.hotelType && searchState.hotelType !== "all" && (
                      <Badge variant="secondary" className="text-xs text-yellow-900">
                        Type: {searchState.hotelType.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Sort Controls - only show when not searching */}
              {!isSearchActive && !appState.loading && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Sort by</Label>
                  <Select value={searchState.sortBy} onValueChange={handleSortChange}>
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
          {appState.loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <YakRoomsLoader 
                size={112} 
                showTagline={false} 
                loadingText=""
                className="mb-4"
              />
            </div>
          ) : (
            <>
              {transformedHotels.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {transformedHotels.map((hotel) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                  </div>
                  {renderPagination}
                </>
              ) : (
                // Only show no results if we're not loading and have confirmed empty results
                !appState.loading && appState.initialLoadDone && (
                  <Card className="text-center py-16 px-6 bg-muted/20 border-dashed border-2 rounded-xl">
                    <CardContent className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-2xl">
                        {isSearchActive 
                          ? "No Hotels Found" 
                          : (
                            <div className="flex flex-col items-center justify-center">
                              <YakRoomsLoader 
                                size={40} 
                                showTagline={false} 
                                loadingText=""
                                className="mb-2"
                              />
                              <span>Loading Hotels...</span>
                            </div>
                          )
                        }
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
                )
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelListingPage;