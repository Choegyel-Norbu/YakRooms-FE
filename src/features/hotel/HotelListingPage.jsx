import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils";
import {
  MapPin,
  Home,
  Building2,
  Search,
  X,
  Clock,
  Navigation,
  Shield,
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

const HotelCard = React.memo(({ hotel }) => (
  <Link to={`/hotel/${hotel.id}`} className="group block h-full focus:outline-none">
    <Card className="h-full overflow-hidden rounded-3xl border-0 bg-card shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/90 text-slate-900 backdrop-blur-md shadow-sm hover:bg-white">
            {hotel.type}
          </Badge>
          {hotel.verified && (
            <Badge className="bg-green-500/90 text-white backdrop-blur-md shadow-sm hover:bg-green-600 border-0 gap-1.5">
              <Shield className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>

        {/* Price Tag */}
        {hotel.lowestPrice > 0 && (
          <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-col items-end rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starts from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">Nu. {hotel.lowestPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h3 className="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span className="line-clamp-1">
                {hotel.locality && `${hotel.locality}, `}{hotel.district}
              </span>
            </div>
          </div>
          {hotel.averageRating > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1">
              <StarRating rating={hotel.averageRating} size={12} showRating={false} />
              <span className="text-xs font-bold text-yellow-700">{hotel.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
           {hotel.distance !== null ? (
             <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
               <Navigation className="h-3 w-3" />
               <span>{hotel.distance >= 1000 ? `${(hotel.distance / 1000).toFixed(1)} km` : `${hotel.distance}m`} away</span>
             </div>
           ) : (
             <div className="flex items-center gap-1.5 text-xs text-slate-400">
               <Clock className="h-3.5 w-3.5" />
               <span>Check-in: {hotel.checkinTime}</span>
             </div>
           )}
           
           <div className="ml-auto">
             <span className="text-xs font-medium text-primary group-hover:underline">View Details</span>
           </div>
        </div>
      </CardContent>
    </Card>
  </Link>
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
                toast.warning("Location accuracy is a bit low", {
                  description:
                    "We couldn't get a very precise location. Nearby hotel results might not be exact.",
                  duration: 6000,
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
                toast.error("Location access denied", {
                  description: "Please enable location permissions in your browser settings to use the nearby search feature.",
                  duration: 6000,
                });
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
          // Handle nested response structure for nearby searches
          let hotelsData = [];
          let pageData = {};
          
          if (nearbyParams) {
            // Nearby search response structure: { content: [{ content: [], pageNumber: 0, ... }], page: {...} }
            const nestedContent = response.data.content?.[0];
            hotelsData = nestedContent?.content || [];
            pageData = nestedContent || response.data.page || {};
          } else {
            // Regular search response structure
            hotelsData = response.data.content?.[0]?.content || response.data.content || [];
            pageData = response.data.content?.[0] || response.data.page || response.data;
          }
          
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Header with Logo */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      } bg-white/80 backdrop-blur-md border-b border-slate-200/60`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <EzeeRoomLogo size="default" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        
        {/* Search Section */}
        <div className={cn(
          "sticky z-40 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all duration-300",
          isNavbarVisible ? "top-20" : "top-4"
        )}>
          <div className="mx-auto max-w-5xl">
            <div className="relative rounded-full bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200">
              
              {/* Desktop Search */}
              <div className="hidden sm:flex items-center divide-x divide-slate-100">
                <div className="flex-1 px-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-3">Where</label>
                  <div className="relative">
                    <Input
                      placeholder="Search district..."
                      value={searchState.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-0 bg-transparent p-0 pl-3 h-7 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex-1 px-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-3">Locality</label>
                  <div className="relative">
                    <Input
                      placeholder="Town or area..."
                      value={searchState.locality}
                      onChange={(e) => handleLocalityChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-0 bg-transparent p-0 pl-3 h-7 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex-1 px-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-3">Type</label>
                  <Select value={searchState.hotelType} onValueChange={handleHotelTypeChange}>
                    <SelectTrigger className="border-0 bg-transparent p-0 pl-3 h-7 text-sm font-medium focus:ring-0">
                      <SelectValue placeholder="All types" />
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

                <div className="pl-2 pr-1">
                  <SearchButton
                    onClick={handleSearch}
                    disabled={appState.loading}
                    className="h-12 w-12 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90 shadow-md transition-transform active:scale-95 flex items-center justify-center"
                  >
                    <Search className="h-5 w-5" />
                  </SearchButton>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="sm:hidden p-1">
                <div className="flex items-center gap-2">
                   <Select value={mobileSearchField} onValueChange={handleMobileFieldChange}>
                      <SelectTrigger className="w-[110px] rounded-full border-0 bg-slate-100 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="locality">Locality</SelectItem>
                        <SelectItem value="hotelType">Type</SelectItem>
                      </SelectContent>
                   </Select>

                   <div className="flex-1 relative">
                      {mobileSearchField === "hotelType" ? (
                        <Select
                          value={mobileSearchValue || "all"}
                          onValueChange={(value) => setMobileSearchValue(value)}
                        >
                          <SelectTrigger className="w-full border-0 bg-transparent text-sm focus:ring-0">
                            <SelectValue placeholder="Select type" />
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
                        <Input
                          placeholder="Search..."
                          value={mobileSearchValue}
                          onChange={(e) => setMobileSearchValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
                          className="w-full border-0 bg-transparent text-sm focus-visible:ring-0 pl-2"
                        />
                      )}
                   </div>

                   <Button
                      size="icon"
                      onClick={handleMobileSearch}
                      disabled={appState.loading}
                      className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Results Header & Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="text-sm text-slate-500">
              {appState.loading 
                ? "Searching for the best stays..." 
                : `${pagination.totalElements} accommodations found`}
            </p>
            
            {/* Active Filters */}
            {(isSearchActive || showNearbyHeading) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {searchState.district && (
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700">
                    District: {searchState.district}
                  </Badge>
                )}
                {searchState.locality && (
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700">
                    Locality: {searchState.locality}
                  </Badge>
                )}
                {searchState.hotelType && searchState.hotelType !== "all" && (
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700">
                    Type: {searchState.hotelType.replace(/_/g, " ")}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-6 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Sort */}
          {!isSearchActive && !appState.loading && (
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-500">Sort by</span>
               <Select value={searchState.sortBy} onValueChange={handleSortChange}>
                 <SelectTrigger className="w-[160px] rounded-full border-slate-200 bg-white text-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="default">Recommended</SelectItem>
                   <SelectItem value="price-low">Price: Low to High</SelectItem>
                   <SelectItem value="price-high">Price: High to Low</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          )}
        </div>

        {/* Location Permission Warning */}
        {locationPermissionDenied && isNearbySearch && !appState.loading && (
            <div className="mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Location access required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please enable location access to see hotels near you.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-yellow-700 hover:bg-yellow-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
        )}

        {/* Grid Content */}
        {appState.loading ? (
           <div className="flex h-64 flex-col items-center justify-center gap-4">
             <SimpleSpinner size={40} className="text-primary" />
             <p className="text-sm font-medium text-slate-500 animate-pulse">Finding perfect stays for you...</p>
           </div>
        ) : (
           <>
             {transformedHotels.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                   {transformedHotels.map((hotel) => (
                     <HotelCard key={hotel.id} hotel={hotel} />
                   ))}
                 </div>
                 {renderPagination}
               </>
             ) : (
               appState.initialLoadDone && (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="mb-6 rounded-full bg-slate-100 p-6">
                     <Search className="h-10 w-10 text-slate-400" />
                   </div>
                   <h3 className="text-xl font-semibold text-slate-900">No hotels found</h3>
                   <p className="mt-2 max-w-md text-slate-500">
                     We couldn't find any matches for your search. Try adjusting your filters or search for a different location.
                   </p>
                   <Button 
                     variant="outline" 
                     onClick={handleClearSearch}
                     className="mt-8 rounded-full px-8"
                   >
                     Clear all filters
                   </Button>
                 </div>
               )
             )}
           </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default HotelListingPage;