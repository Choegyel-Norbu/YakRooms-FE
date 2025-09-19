import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Home,
  Building2,
  Search,
  X,
  Clock,
} from "lucide-react";
import SimpleSpinner from "@/shared/components/SimpleSpinner";
import StarRating from "@/shared/components/star-rating";
import { SearchButton } from "@/shared/components";
import EzeeRoomLogo from "@/shared/components/EzeeRoomLogo";

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
          className="bg-background/95 backdrop-blur-md shadow-lg border border-border/20 text-xs font-medium px-2 py-0.5 text-yellow-700"
        >
          {hotel.type}
        </Badge>
      </div>

      {/* Price Badge - Compact positioning */}
      {hotel.lowestPrice && hotel.lowestPrice > 0 && (
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
          <span className="font-medium">
            {hotel.locality && `${hotel.locality}, `}{hotel.district}, Bhutan
          </span>
        </CardDescription>

        {/* Check-in/Check-out Times */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Check-in: 12:00 AM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Check-out: 2:00 PM</span>
          </div>
        </div>

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
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
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
    isInitialLoad: true, // Track if we're in the initial load phase
    lastFetchKey: null, // Track last fetch to prevent duplicate calls
  });

  const [searchState, setSearchState] = useState({
    district: "",
    locality: "",
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
  const pendingRequestRef = useRef(null); // Track pending requests to prevent duplicates

  // Memoized hotel types to prevent recreation on every render
  const hotelTypes = useMemo(() => [
    "Resort",
    "Hotel", 
    "Guesthouse",
    "Homestay",
    "Boutique Hotel",
  ], []);

  // Memoized function to generate fetch key for deduplication
  const generateFetchKey = useCallback((page, district, locality, hotelType, sortBy) => {
    return `${page}-${district.trim()}-${locality.trim()}-${hotelType}-${sortBy}`;
  }, []);

  // Optimized fetch function with request deduplication and caching
  const fetchHotels = useCallback(
    async (page = 0, searchDistrict = "", searchLocality = "", searchHotelType = "", sortByParam = "default") => {
      // Generate unique key for this request
      const fetchKey = generateFetchKey(page, searchDistrict, searchLocality, searchHotelType, sortByParam);
      
      // Prevent duplicate API calls - check both completed and pending requests
      if (appState.lastFetchKey === fetchKey && !appState.loading) {
        return;
      }
      
      // Prevent duplicate pending requests
      if (pendingRequestRef.current === fetchKey) {
        return;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Mark this request as pending
      pendingRequestRef.current = fetchKey;

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setAppState(prev => ({ 
          ...prev, 
          loading: true, 
          lastFetchKey: fetchKey
        }));

        let endpoint = `/hotels/list?page=${page}&size=${pagination.size}`;
        const isSearchActive = searchDistrict.trim() || searchLocality.trim() || 
          (searchHotelType && searchHotelType !== "all");

        // Build endpoint based on search/sort criteria
        if (isSearchActive) {
          const params = new URLSearchParams({
            page: page.toString(),
            size: pagination.size.toString(),
          });

          if (searchDistrict.trim()) params.append("district", searchDistrict.trim());
          if (searchLocality.trim()) params.append("locality", searchLocality.trim());
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
          // Handle new nested response structure
          const hotelsData = response.data.content?.[0]?.content || response.data.content || [];
          const pageData = response.data.page || response.data;
          
          setAppState(prev => ({
            ...prev,
            hotels: hotelsData,
            loading: false,
          }));

          setPagination({
            page: pageData.pageable?.pageNumber || pageData.number || 0,
            size: pageData.size || 6,
            totalPages: pageData.totalPages || 1,
            totalElements: pageData.totalElements || 0,
          });
        }
        
        // Clear pending request
        if (pendingRequestRef.current === fetchKey) {
          pendingRequestRef.current = null;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          // Clear pending request for aborted requests
          if (pendingRequestRef.current === fetchKey) {
            pendingRequestRef.current = null;
          }
          return;
        }
        
        console.error("Error fetching hotels:", error);
        if (lastRequestRef.current?.fetchKey === fetchKey) {
          setAppState(prev => ({
            ...prev,
            hotels: [],
            loading: true, // Keep loading state
          }));
        }
        
        // Clear pending request on error
        if (pendingRequestRef.current === fetchKey) {
          pendingRequestRef.current = null;
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
    fetchHotels(0, districtParam, "", hotelTypeParam, "default");
    
    // Mark initial load as complete and no longer in initial load phase
    setAppState(prev => ({ 
      ...prev, 
      initialLoadDone: true,
      isInitialLoad: false
    }));
  }, []); // Only run on mount

  // Optimized search effect with debouncing
  useEffect(() => {
    // Don't run during initial load or if initial load not done
    if (!appState.initialLoadDone || appState.isInitialLoad) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
        (searchState.hotelType && searchState.hotelType !== "all");
      fetchHotels(0, searchState.district, searchState.locality, searchState.hotelType, 
        isSearchActive ? "default" : searchState.sortBy);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchState.district, searchState.locality, searchState.hotelType, fetchHotels, appState.initialLoadDone, appState.isInitialLoad]);

  // Separate effect for sort changes (no debounce needed)
  useEffect(() => {
    // Don't run during initial load or if initial load not done
    if (!appState.initialLoadDone || appState.isInitialLoad) return;
    
    const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    if (!isSearchActive) {
      fetchHotels(0, searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy);
    }
  }, [searchState.sortBy, fetchHotels, appState.initialLoadDone, appState.isInitialLoad, searchState.district, searchState.locality, searchState.hotelType]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Clear pending request on cleanup
      pendingRequestRef.current = null;
    };
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    fetchHotels(0, searchState.district, searchState.locality, searchState.hotelType, 
      isSearchActive ? "default" : searchState.sortBy);
  }, [searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy, fetchHotels]);

  const handleClearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      district: "",
      locality: "",
      hotelType: "all",
    }));
    
    window.history.replaceState({}, "", "/hotels");
    fetchHotels(0, "", "", "all", searchState.sortBy);
  }, [fetchHotels, searchState.sortBy]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
        (searchState.hotelType && searchState.hotelType !== "all");
      fetchHotels(newPage, searchState.district, searchState.locality, searchState.hotelType, 
        isSearchActive ? "default" : searchState.sortBy);
    }
  }, [pagination.totalPages, searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy, fetchHotels]);

  const handleDistrictChange = useCallback((value) => {
    setSearchState(prev => ({ ...prev, district: value }));
  }, []);

  const handleLocalityChange = useCallback((value) => {
    setSearchState(prev => ({ ...prev, locality: value }));
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
    return searchState.district.trim() || searchState.locality.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
  }, [searchState.district, searchState.locality, searchState.hotelType]);

  const pageTitle = useMemo(() => {
    if (!isSearchActive) return "All Lodges in Bhutan";
    
    const parts = [];
    if (searchState.locality) parts.push(`Hotels in ${searchState.locality}`);
    if (searchState.district) parts.push(`District: ${searchState.district}`);
    if (searchState.hotelType && searchState.hotelType !== "all") {
      const typeLabel = searchState.hotelType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      parts.push(typeLabel);
    }
    
    return parts.join(' - ') || "Search Results";
  }, [isSearchActive, searchState.district, searchState.locality, searchState.hotelType]);

  const transformedHotels = useMemo(() => {
    return appState.hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      district: hotel.district,
      locality: hotel.locality,
      price: hotel.lowestPrice,
      lowestPrice: hotel.lowestPrice,
      image: hotel.photoUrl || hotel.photoUrls?.[0] || 
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format`,
      type: hotel.hotelType || "Hotel",
      amenities: hotel.amenities || [],
      address: hotel.address,
      averageRating: hotel.averageRating || 0,
      verified: hotel.verified || hotel.isVerified || false,
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
                <EzeeRoomLogo size="default" variant="text-only" />
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
            {/* First row - District, Locality and Hotel Type */}
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

              {/* Locality Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search by locality/town..."
                  value={searchState.locality}
                  onChange={(e) => handleLocalityChange(e.target.value)}
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
                <SearchButton 
                  onClick={handleSearch} 
                  disabled={appState.loading} 
                  className="flex-1 sm:flex-initial bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                >
                  Search
                </SearchButton>
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
              

                {/* Active filters display */}
                {isSearchActive && !appState.loading && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {searchState.locality && (
                      <Badge variant="secondary" className="text-xs text-blue-900">
                        Locality: {searchState.locality}
                      </Badge>
                    )}
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
              <SimpleSpinner 
                size={32} 
                text="Loading hotels..."
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
                     
                      <CardTitle className="text-2xl">
                        {isSearchActive 
                          ? "No Hotels Found" 
                          : (
                            <div className="flex flex-col items-center justify-center">
                              <SimpleSpinner 
                                size={24} 
                                text="Loading hotels..."
                                className="mb-2"
                              />
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