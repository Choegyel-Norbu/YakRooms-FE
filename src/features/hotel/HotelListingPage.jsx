import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Home,
  Building2,
  Search,
  X,
  Clock,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import SimpleSpinner from "@/shared/components/SimpleSpinner";
import StarRating from "@/shared/components/star-rating";
import { SearchButton } from "@/shared/components";

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
import Footer from "../../layouts/Footer";
import { EzeeRoomLogo } from "@/shared/components";

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters, rounded
};

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
        
        <div className="flex items-start justify-between gap-3">
          <CardDescription className="flex items-center gap-1.5 text-sm flex-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="font-medium">
              {hotel.locality && `${hotel.locality}, `}{hotel.district}, Bhutan
            </span>
          </CardDescription>

        </div>

        {/* Check-in/Check-out Times */}
        {/* <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Check-in: {hotel.checkinTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Check-out: {hotel.checkoutTime}</span>
          </div>
        </div> */}

        {/* Rating Section */}
        {hotel.averageRating > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <StarRating 
              rating={hotel.averageRating} 
              size={14} 
              showRating={true}
              className="flex-shrink-0"
            />
            {/* <span className="text-xs text-muted-foreground">
              ({hotel.averageRating.toFixed(1)} Avg. Rating)
            </span> */}
          </div>
        )}

        {/* Distance Display - Badge Style */}
        {hotel.distance !== null && hotel.distance !== undefined && (
            <Badge
              variant="outline"
              className="bg-blue-50/80 border-blue-200 text-blue-700 hover:bg-blue-100/80 transition-colors duration-200 px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap backdrop-blur-sm"
            >
              <Navigation className="h-3 w-3 flex-shrink-0" />
              <span className="font-semibold">
                {hotel.distance >= 1000
                  ? `${(hotel.distance / 1000).toFixed(1)} km`
                  : `${hotel.distance} m away`}
              </span>
            </Badge>
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
  });

  const [searchState, setSearchState] = useState({
    district: "",
    locality: "",
    hotelType: "all",
    sortBy: "default",
  });

  const [mobileSearchField, setMobileSearchField] = useState("district");
  const [mobileSearchValue, setMobileSearchValue] = useState("");

  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });
  const [showNearbyHeading, setShowNearbyHeading] = useState(false);
  
  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const locationRetryCountRef = useRef(0);
  const maxRetries = 2; // Maximum retry attempts for better accuracy

  // Refs for performance optimization
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);
  const pendingRequestRef = useRef(null); // Track pending requests to prevent duplicates
  const lastFetchKeyRef = useRef(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (mobileSearchField === "district") {
      setMobileSearchValue(searchState.district);
    } else if (mobileSearchField === "locality") {
      setMobileSearchValue(searchState.locality);
    } else {
      setMobileSearchValue(searchState.hotelType || "all");
    }
  }, [
    mobileSearchField,
    searchState.district,
    searchState.locality,
    searchState.hotelType,
  ]);

  // Memoized hotel type options for consistent usage across breakpoints
  const hotelCategoryOptions = useMemo(
    () => [
      { value: "all", label: "All Types" },
      { value: "ONE_STAR", label: "One Star" },
      { value: "TWO_STAR", label: "Two Star" },
      { value: "THREE_STAR", label: "Three Star" },
      { value: "FOUR_STAR", label: "Four Star" },
      { value: "FIVE_STAR", label: "Five Star" },
      { value: "BUDGET", label: "Budget" },
      { value: "BOUTIQUE", label: "Boutique" },
      { value: "RESORT", label: "Resort" },
      { value: "HOMESTAY", label: "Homestay" },
    ],
    []
  );

  // Memoized function to generate fetch key for deduplication
  const generateFetchKey = useCallback((page, district, locality, hotelType, sortBy) => {
    return `${page}-${district.trim()}-${locality.trim()}-${hotelType}-${sortBy}`;
  }, []);

  // Derived flags
  const isNearbySearch = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Boolean(params.get("lat") && params.get("lon") && params.get("radius"));
  }, [location.search]);

  // Get user's current location with improved accuracy
  useEffect(() => {
    if (!navigator.geolocation) {
      
      return;
    }

    // Only request location if not already set and permission not denied
    if (userLocation === null && !locationPermissionDenied) {
      const requestLocation = (retryCount = 0) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const accuracy = position.coords.accuracy; // Accuracy in meters
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Accept location if accuracy is good (< 100m) or if we've exhausted retries
            // For mobile devices, accuracy can be 10-50m with GPS, 100-1000m with network
            if (accuracy <= 100 || retryCount >= maxRetries) {
              // If we had to fall back to a poorer accuracy after retries,
              // let the user know nearby results might not be precise.
              if (retryCount >= maxRetries && accuracy > 100) {
                toast("Location accuracy is a bit low", {
                  description:
                    "We couldn't get a very precise location. Nearby hotel results might not be exact.",
                });
              }
              setUserLocation({
                latitude,
                longitude,
                accuracy, // Store accuracy for reference
              });
              locationRetryCountRef.current = 0; // Reset retry count on success
            } else {
              // Retry for better accuracy if current accuracy is poor and we have retries left
              locationRetryCountRef.current = retryCount + 1;
              setTimeout(() => {
                requestLocation(retryCount + 1);
              }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
            }
          },
          (error) => {

            // Handle different error types
            switch (error.code) {
              case error.PERMISSION_DENIED:
                
                setLocationPermissionDenied(true);
                break;
              case error.POSITION_UNAVAILABLE:
                
                // Retry once if position unavailable (might be temporary)
                if (retryCount < 1) {
                  setTimeout(() => {
                    requestLocation(retryCount + 1);
                  }, 2000);
                }
                break;
              case error.TIMEOUT:
                
                // Retry with longer timeout if we haven't exhausted retries
                if (retryCount < maxRetries) {
                  setTimeout(() => {
                    requestLocation(retryCount + 1);
                  }, 1000);
                }
                break;
              default:
                
                break;
            }
          },
          {
            enableHighAccuracy: true, // Request GPS-level accuracy
            timeout: 20000, // Increased timeout to 20 seconds for high accuracy GPS
            maximumAge: 0, // Force fresh location data (no cache)
          }
        );
      };

      // Initial location request
      requestLocation(0);
    }
  }, [userLocation, locationPermissionDenied]);

  // Optimized fetch function with request deduplication and caching
  const fetchHotels = useCallback(
    async (page = 0, searchDistrict = "", searchLocality = "", searchHotelType = "", sortByParam = "default", nearbyParams = null) => {
      // Generate unique key for this request
      const fetchKey = nearbyParams 
        ? `nearby-${nearbyParams.lat}-${nearbyParams.lon}-${nearbyParams.radius}-${page}`
        : generateFetchKey(page, searchDistrict, searchLocality, searchHotelType, sortByParam);
      
      // Prevent duplicate API calls - check both completed and pending requests
      if (lastFetchKeyRef.current === fetchKey) {
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
        }));
        lastFetchKeyRef.current = fetchKey;

        let endpoint;
        
        // Check if this is a nearby search
        if (nearbyParams) {
          const params = new URLSearchParams({
            lat: nearbyParams.lat,
            lon: nearbyParams.lon,
            radius: nearbyParams.radius,
            page: page.toString(),
            size: pagination.size.toString(),
          });
          endpoint = `/hotels/nearby?${params.toString()}`;
        } else {
          endpoint = `/hotels/list?page=${page}&size=${pagination.size}`;
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
        }

        // Store current request reference
        lastRequestRef.current = { endpoint, fetchKey };

        const response = await api.get(endpoint, { signal });

        // Check if this is still the current request
        if (lastRequestRef.current?.fetchKey === fetchKey) {
          // Handle new nested response structure
          const hotelsData = response.data.content?.[0]?.content || response.data.content || [];
          const pageData = response.data.content?.[0] || response.data.page || response.data;
          
          setAppState(prev => ({
            ...prev,
            hotels: hotelsData,
            loading: false,
          }));

          setPagination({
            page: pageData.pageNumber || pageData.pageable?.pageNumber || pageData.number || 0,
            size: pageData.pageSize || pageData.size || 6,
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

        if (lastRequestRef.current?.fetchKey === fetchKey) {
          setAppState(prev => ({
            ...prev,
            hotels: [],
            loading: false,
          }));
        }
        
        // Clear pending request on error
        if (pendingRequestRef.current === fetchKey) {
          pendingRequestRef.current = null;
        }
      }
    },
    [pagination.size, generateFetchKey]
  );

  // Handle initial URL parameters and data loading
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const params = new URLSearchParams(location.search);
    const districtParam = params.get("district") || "";
    const hotelTypeParam = params.get("hotelType") || "all";
    
    // Check for nearby search parameters
    const lat = params.get("lat");
    const lon = params.get("lon");
    const radius = params.get("radius");
    
    if (lat && lon && radius) {
      // Nearby search mode - make API call directly
      const nearbyParams = { lat, lon, radius };
      setShowNearbyHeading(true);
      fetchHotels(0, "", "", "all", "default", nearbyParams);
    } else {
      // Regular search mode
      setShowNearbyHeading(false);
      setSearchState(prev => ({
        ...prev,
        district: districtParam,
        hotelType: hotelTypeParam,
      }));
      
      fetchHotels(0, districtParam, "", hotelTypeParam, "default");
    }
    
    setAppState(prev => ({ 
      ...prev, 
      initialLoadDone: true,
      isInitialLoad: false
    }));
  }, [location.search, fetchHotels]);

  // Optimized search effect with debouncing
  useEffect(() => {
    // Don't run during initial load or if initial load not done
    if (!appState.initialLoadDone || appState.isInitialLoad || isNearbySearch) return;

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
  }, [
    searchState.district,
    searchState.locality,
    searchState.hotelType,
    fetchHotels,
    appState.initialLoadDone,
    appState.isInitialLoad,
    isNearbySearch,
  ]);

  // Separate effect for sort changes (no debounce needed)
  useEffect(() => {
    // Don't run during initial load or if initial load not done
    if (!appState.initialLoadDone || appState.isInitialLoad || isNearbySearch) return;
    
    const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    if (!isSearchActive) {
      fetchHotels(0, searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy);
    }
  }, [
    searchState.sortBy,
    fetchHotels,
    appState.initialLoadDone,
    appState.isInitialLoad,
    searchState.district,
    searchState.locality,
    searchState.hotelType,
    isNearbySearch,
  ]);

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

  // Track scroll direction for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsNavbarVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      // Determine scroll direction
      const scrollingDown = currentScrollY > lastScrollY.current;
      const scrollingUp = currentScrollY < lastScrollY.current;
      
      // Show when scrolling up, hide when scrolling down
      if (scrollingUp) {
        setIsNavbarVisible(true);
      } else if (scrollingDown) {
        setIsNavbarVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
      (searchState.hotelType && searchState.hotelType !== "all");
    fetchHotels(0, searchState.district, searchState.locality, searchState.hotelType, 
      isSearchActive ? "default" : searchState.sortBy);
    setShowNearbyHeading(false);
  }, [searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy, fetchHotels]);

  const handleClearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      district: "",
      locality: "",
      hotelType: "all",
    }));
    
    window.history.replaceState({}, "", "/hotels");
    setShowNearbyHeading(false);
    fetchHotels(0, "", "", "all", searchState.sortBy);
  }, [fetchHotels, searchState.sortBy]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const params = new URLSearchParams(location.search);
      const lat = params.get("lat");
      const lon = params.get("lon");
      const radius = params.get("radius");
      
      if (lat && lon && radius) {
        // Nearby search pagination
        const nearbyParams = { lat, lon, radius };
        fetchHotels(newPage, "", "", "all", "default", nearbyParams);
      } else {
        // Regular search pagination
        const isSearchActive = searchState.district.trim() || searchState.locality.trim() || 
          (searchState.hotelType && searchState.hotelType !== "all");
        fetchHotels(newPage, searchState.district, searchState.locality, searchState.hotelType, 
          isSearchActive ? "default" : searchState.sortBy);
      }
    }
  }, [pagination.totalPages, searchState.district, searchState.locality, searchState.hotelType, searchState.sortBy, fetchHotels, location.search]);

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

  const handleMobileFieldChange = useCallback((value) => {
    setMobileSearchField(value);
    if (value === "district") {
      setMobileSearchValue(searchState.district);
    } else if (value === "locality") {
      setMobileSearchValue(searchState.locality);
    } else {
      setMobileSearchValue(searchState.hotelType || "all");
    }
  }, [searchState.district, searchState.locality, searchState.hotelType]);

  const handleMobileSearch = useCallback(() => {
    const nextState = {
      ...searchState,
      district: mobileSearchField === "district" ? mobileSearchValue : searchState.district,
      locality: mobileSearchField === "locality" ? mobileSearchValue : searchState.locality,
      hotelType: mobileSearchField === "hotelType" ? (mobileSearchValue || "all") : searchState.hotelType,
    };

    setSearchState(nextState);

    const hasSearchFilters =
      nextState.district.trim() ||
      nextState.locality.trim() ||
      (nextState.hotelType && nextState.hotelType !== "all");

    fetchHotels(
      0,
      nextState.district,
      nextState.locality,
      nextState.hotelType,
      hasSearchFilters ? "default" : nextState.sortBy
    );
    setShowNearbyHeading(false);
  }, [fetchHotels, mobileSearchField, mobileSearchValue, searchState]);

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
    if (showNearbyHeading) return "Hotels Near You";
    if (!isSearchActive) return "All Lodges registered with us";
    
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
  }, [isSearchActive, showNearbyHeading, searchState.district, searchState.locality, searchState.hotelType]);

  // Utility function to format time from "HH:MM:SS" to "H:MM AM/PM"
  const formatTime = useCallback((timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  const transformedHotels = useMemo(() => {
    return appState.hotels.map((hotel) => {
      // Extract latitude and longitude from hotel data
      const hotelLat = hotel.latitude ? parseFloat(hotel.latitude) : null;
      const hotelLon = hotel.longitude ? parseFloat(hotel.longitude) : null;
      
      // Calculate distance if user location and hotel coordinates are available
      let distance = null;
      if (userLocation && hotelLat !== null && hotelLon !== null) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          hotelLat,
          hotelLon
        );
      }

      return {
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
        checkinTime: formatTime(hotel.checkinTime || "12:00:00"),
        checkoutTime: formatTime(hotel.checkoutTime || "14:00:00"),
        distance,
      };
    });
  }, [appState.hotels, formatTime, userLocation]);

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
      {/* Header with Logo */}
      <header className={`border-b sticky top-0 bg-background/95 backdrop-blur z-20 shadow-sm transition-all duration-1000 ease-in-out ${
        isNavbarVisible 
          ? "translate-y-0 opacity-100" 
          : "-translate-y-full opacity-0"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <EzeeRoomLogo size="default" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <main className="w-full">
          {/* Search Surface */}
          <div className="mb-6">
            <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
              <div className="p-4 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-[0.2em] text-muted-foreground">
                      Plan Your Stay
                    </p>
                    {/* <h2 className="text-xl sm:text-2xl font-semibold mt-1">
                      Search verified stays across Bhutan
                    </h2> */}
                  </div>
                  {isSearchActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      disabled={appState.loading}
                      className="self-start sm:self-auto"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Mobile search */}
                <div className="sm:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Quick search
                    </span>
                    <Select value={mobileSearchField} onValueChange={handleMobileFieldChange}>
                      <SelectTrigger className="w-36 rounded-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="locality">Locality</SelectItem>
                        <SelectItem value="hotelType">Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 shadow-inner">
                    {mobileSearchField === "hotelType" ? (
                      <Select
                        value={mobileSearchValue || "all"}
                        onValueChange={(value) => setMobileSearchValue(value)}
                      >
                        <SelectTrigger className="flex-1 rounded-full text-sm border-none focus:ring-0 px-0">
                          <SelectValue placeholder="Select hotel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {hotelCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative flex-1">
                        <Input
                          placeholder={
                            mobileSearchField === "district"
                              ? "Search by district..."
                              : "Search by locality..."
                          }
                          value={mobileSearchValue}
                          onChange={(e) => setMobileSearchValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleMobileSearch();
                            }
                          }}
                          className="w-full border-none bg-transparent pl-0 text-sm focus-visible:ring-0"
                        />
                      </div>
                    )}

                    <Button
                      size="icon"
                      onClick={handleMobileSearch}
                      disabled={appState.loading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop / Tablet search */}
                <div className="hidden sm:grid gap-3 lg:gap-4 sm:grid-cols-[1.2fr,1.2fr,1fr,auto] items-center">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by district"
                      value={searchState.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full rounded-full pl-11 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by locality / town"
                      value={searchState.locality}
                      onChange={(e) => handleLocalityChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full rounded-full pl-11 text-sm"
                    />
                  </div>

                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select value={searchState.hotelType} onValueChange={handleHotelTypeChange}>
                        <SelectTrigger className="rounded-full pl-11 text-left">
                          <SelectValue placeholder="Hotel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {hotelCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  <div className="flex gap-2 justify-end">
                    <SearchButton
                      onClick={handleSearch}
                      disabled={appState.loading}
                      className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 font-medium"
                    >
                      Search
                    </SearchButton>
                    {isSearchActive && (
                      <Button
                        variant="outline"
                        onClick={handleClearSearch}
                        disabled={appState.loading}
                        className="rounded-full"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
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
                          ? "No results Found" 
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HotelListingPage;