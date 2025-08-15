import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoomBookingCard from "../../features/booking/RoomBookingCard";
import Footer from "../../layouts/Footer";
import YakRoomsAdCard from "@/shared/components/YakRoomsAdCard";
import YakRoomsLoader from "@/shared/components/YakRoomsLoader";
import StarRating from "@/shared/components/star-rating";
import HotelReviewSheet from "./HotelReviewSheet";
import api from "../../shared/services/Api";

import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Star,
  StarHalf,
  Home,
  Building2,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Bath,
  AirVent,
  Phone,
} from "lucide-react";

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
import { Separator } from "@/shared/components/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/sheet";
import { useAuth } from "../authentication";

// Room Image Carousel Component
const RoomImageCarousel = ({ images, roomNumber, roomType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Auto-advance images every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case ' ':
          e.preventDefault();
          setShowImageModal(true);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Building2 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-64 w-full overflow-hidden rounded-t-lg lg:rounded-l-lg lg:rounded-t-none group">
        {/* Main Image */}
        <img
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={`${roomType} - Room ${roomNumber}`}
          className={`h-full w-full object-cover cursor-pointer transition-all duration-500 ease-in-out hover:scale-105 ${
            imageLoading ? 'blur-sm' : 'blur-0'
          }`}
          onClick={() => setShowImageModal(true)}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        {/* Loading Overlay */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 hover:bg-background h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 hover:bg-background h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                  currentImageIndex === index
                    ? "bg-white scale-125 shadow-lg ring-2 ring-white/50"
                    : "bg-white/50 hover:bg-white/75 hover:scale-110"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Availability Badge */}
        <Badge
          variant="default"
          className="absolute left-3 top-3 bg-green-600 hover:bg-green-700 shadow-lg"
        >
          <CheckCircle className="mr-1 h-3.5 w-3.5" />
          Available
        </Badge>
      </div>

      

      {/* Image Modal */}
      <Sheet open={showImageModal} onOpenChange={setShowImageModal}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{roomType} - Room {roomNumber}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 relative h-full">
            <img
              src={images[currentImageIndex]}
              alt={`${roomType} - Room ${roomNumber}`}
              className="h-full w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? "bg-primary scale-125"
                          : "bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={prevImage}
                    className="rounded-full bg-background/90 hover:bg-background h-10 w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={nextImage}
                    className="rounded-full bg-background/90 hover:bg-background h-10 w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const HotelDetailsPage = () => {
  const { userId, isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Combined state for better performance
  const [appState, setAppState] = useState({
    hotel: null,
    loading: true,
    error: null,
    dataLoaded: false, // Track if initial data is loaded
    criticalDataLoaded: false, // Track if critical hotel data is loaded
  });
  
  const [uiState, setUiState] = useState({
    currentImageIndex: 0,
    isFavorite: false,
    showImageModal: false,
    reviewSheetOpen: false,
  });

  // Rooms state
  const [roomsState, setRoomsState] = useState({
    availableRooms: [],
    paginationData: null,
    currentPage: 0,
    loading: false,
  });

  // Testimonials state
  const [testimonialsState, setTestimonialsState] = useState({
    testimonials: [],
    loading: false,
    error: null,
    pagination: null,
    currentPage: 0,
  });

  // Refs
  const roomsSectionRef = useRef(null);
  const isInitialLoad = useRef(true);
  const abortControllerRef = useRef(null);
  const hasInitialDataLoaded = useRef(false);

  // Amenity icons mapping
  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    breakfast: Coffee,
    restaurant: Utensils,
    bathroom: Bath,
    ac: AirVent,
    default: CheckCircle,
  };


  // Optimized data fetching with single API call for initial load
  const fetchInitialData = useCallback(async () => {
    if (!id || hasInitialDataLoaded.current) return;

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setAppState(prev => ({ ...prev, loading: true, error: null }));
      setRoomsState(prev => ({ ...prev, loading: true }));
      setTestimonialsState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch hotel data first (critical for page to function)
      const hotelResponse = await api.get(`/hotels/details/${id}`, { 
        signal: abortControllerRef.current.signal 
      });
      
      // Update hotel state immediately once we have the critical data
      setAppState(prev => ({
        ...prev,
        hotel: hotelResponse.data,
        criticalDataLoaded: true,
      }));
      
      // Mark that we've loaded initial data to prevent re-fetching
      hasInitialDataLoaded.current = true;

      // Fetch secondary data in parallel (rooms and testimonials)
      // These can fail without breaking the page
      const [roomsResult, testimonialsResult] = await Promise.allSettled([
        api.get(`/rooms/available/${id}?page=0&size=3`, { signal: abortControllerRef.current.signal }),
        api.get(`/reviews/hotel/${id}/testimonials/paginated?page=0&size=3`, { signal: abortControllerRef.current.signal })
      ]);

      // Handle rooms data
      if (roomsResult.status === 'fulfilled') {
        setRoomsState(prev => ({
          ...prev,
          availableRooms: roomsResult.value.data.content || [],
          paginationData: roomsResult.value.data,
          loading: false,
        }));
      } else {
        console.error("Error fetching rooms:", roomsResult.reason);
        setRoomsState(prev => ({ ...prev, loading: false }));
      }

      // Handle testimonials data
      if (testimonialsResult.status === 'fulfilled') {
        setTestimonialsState(prev => ({
          ...prev,
          testimonials: testimonialsResult.value.data.content || [],
          pagination: testimonialsResult.value.data,
          loading: false,
        }));
      } else {
        console.error("Error fetching testimonials:", testimonialsResult.reason);
        setTestimonialsState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Failed to load reviews" 
        }));
      }
      // Set loading to false only after all data fetching attempts are complete
      setAppState(prev => ({
        ...prev,
        loading: false,
        dataLoaded: true,
      }));

    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      
      console.error("Error fetching hotel details:", err);
      
      // Only set hotel error when hotel details specifically fail
      setAppState(prev => ({
        ...prev,
        error: "Failed to load hotel details",
        loading: false,
      }));
      setRoomsState(prev => ({ ...prev, loading: false }));
      setTestimonialsState(prev => ({ ...prev, loading: false }));
    }
  }, [id]);

  // Separate function for rooms pagination
  const fetchRooms = useCallback(async (page) => {
    if (!id) return;

    try {
      setRoomsState(prev => ({ ...prev, loading: true }));
      const response = await api.get(`/rooms/available/${id}?page=${page}&size=3`);
      
      setRoomsState(prev => ({
        ...prev,
        availableRooms: response.data.content || [],
        paginationData: response.data,
        currentPage: page,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRoomsState(prev => ({ ...prev, loading: false }));
    }
  }, [id]);

  // Separate function for testimonials pagination
  const fetchTestimonials = useCallback(async (page) => {
    if (!id) return;

    try {
      setTestimonialsState(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.get(`/reviews/hotel/${id}/testimonials/paginated?page=${page}&size=3`);
      
      setTestimonialsState(prev => ({
        ...prev,
        testimonials: response.data.content || [],
        pagination: response.data,
        currentPage: page,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setTestimonialsState(prev => ({
        ...prev,
        error: "Failed to load testimonials",
        loading: false,
      }));
    }
  }, [id]);

  // Reset state when hotel ID changes
  useEffect(() => {
    hasInitialDataLoaded.current = false;
    setAppState({
      hotel: null,
      loading: true,
      error: null,
      dataLoaded: false,
      criticalDataLoaded: false,
    });
    setRoomsState({
      availableRooms: [],
      paginationData: null,
      currentPage: 0,
      loading: false,
    });
    setTestimonialsState({
      testimonials: [],
      loading: false,
      error: null,
      pagination: null,
      currentPage: 0,
    });
  }, [id]);

  // Initial data load effect
  useEffect(() => {
    fetchInitialData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchInitialData]);

  // Room pagination effect - only when page changes, not on initial load
  useEffect(() => {
    if (appState.criticalDataLoaded && roomsState.currentPage > 0) {
      fetchRooms(roomsState.currentPage);
    }
  }, [roomsState.currentPage, fetchRooms, appState.criticalDataLoaded]);

  // Testimonials pagination effect - only when page changes, not on initial load
  useEffect(() => {
    if (appState.criticalDataLoaded && testimonialsState.currentPage > 0) {
      fetchTestimonials(testimonialsState.currentPage);
    }
  }, [testimonialsState.currentPage, fetchTestimonials, appState.criticalDataLoaded]);

  // Scroll effect for rooms
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else if (roomsState.availableRooms.length > 0) {
      roomsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [roomsState.availableRooms]);

  // Memoized UI handlers
  const nextImage = useCallback(() => {
    if (appState.hotel?.photoUrls?.length) {
      setUiState(prev => ({
        ...prev,
        currentImageIndex: prev.currentImageIndex === appState.hotel.photoUrls.length - 1 
          ? 0 
          : prev.currentImageIndex + 1
      }));
    }
  }, [appState.hotel?.photoUrls?.length]);

  const prevImage = useCallback(() => {
    if (appState.hotel?.photoUrls?.length) {
      setUiState(prev => ({
        ...prev,
        currentImageIndex: prev.currentImageIndex === 0 
          ? appState.hotel.photoUrls.length - 1 
          : prev.currentImageIndex - 1
      }));
    }
  }, [appState.hotel?.photoUrls?.length]);

  const handlePageChange = useCallback((page) => {
    setRoomsState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appState.hotel.name,
          text: `Check out ${appState.hotel.name} in ${appState.hotel.district}, Bhutan`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [appState.hotel?.name, appState.hotel?.district]);

  const openReviewSheet = useCallback(() => {
    setUiState(prev => ({ ...prev, reviewSheetOpen: true }));
  }, []);

  const closeReviewSheet = useCallback(() => {
    setUiState(prev => ({ ...prev, reviewSheetOpen: false }));
  }, []);

  const handleReviewSubmitSuccess = useCallback(() => {
    setUiState(prev => ({ ...prev, reviewSheetOpen: false }));
    // Refresh testimonials after successful review submission
    fetchTestimonials(testimonialsState.currentPage);
  }, [fetchTestimonials, testimonialsState.currentPage]);

  // Loading state - show YakRooms loader while fetching critical hotel data
  if (appState.loading && !appState.criticalDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <YakRoomsLoader 
            size={112} 
            showTagline={true} 
            loadingText="Loading hotel details..."
            className="mb-4"
          />
        </div>
      </div>
    );
  }

  // Error state - only show when hotel details fetch fails (not secondary data)
  if (appState.error && !appState.criticalDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>{appState.error || "Hotel not found"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transformedHotel = {
    ...appState.hotel,
    images:
      appState.hotel.photoUrls?.length > 0
        ? appState.hotel.photoUrls
        : ["https://via.placeholder.com/1000x600?text=No+Hotel+Image"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Optimized header for mobile */}
      <header className="sticky top-0 z-20 border-b bg-background/95">
        <div className="mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" className="p-2">
              <Link to="/">
                <Home className="h-5 w-5 " />
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
          </div>

          {/* Center - Optimized title for mobile */}
          <h1 className="text-base sm:text-lg font-bold truncate px-2">
            {appState.hotel.name}
          </h1>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Enhanced Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative h-48 sm:h-64 md:h-96 lg:h-[500px]">
            <img
              src={transformedHotel.images[uiState.currentImageIndex]}
              alt={transformedHotel.name}
              className="h-full w-full object-cover cursor-pointer"
              onClick={() => setUiState(prev => ({ ...prev, showImageModal: true }))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Image Navigation */}
            {transformedHotel.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:gap-2">
              {transformedHotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setUiState(prev => ({ ...prev, currentImageIndex: index }))}
                  className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all ${
                    uiState.currentImageIndex === index
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {uiState.currentImageIndex + 1} / {transformedHotel.images.length}
            </div>
          </div>

          <CardContent className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 bg-gradient-to-br from-white to-slate-50/50">
            <div className="space-y-4 sm:space-y-6">
              {/* Hotel Header Section */}
              <div className="flex sm:flex-col">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-base sm:text-base md:text-sm font-semibold tracking-tight text-slate-800 leading-tight">
                      {transformedHotel.name}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center md:gap-3 sm:gap-6">
                      <div className="flex items-center group">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mr-3 group-hover:shadow-md transition-all duration-200">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        </div>
                        <span className="text-sm text-slate-600 font-normal group-hover:text-slate-700 transition-colors duration-200">
                          {transformedHotel.district}, Bhutan
                        </span>
                      </div>

                      <div className="flex items-center group">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mr-3 group-hover:shadow-md transition-all duration-200">
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <a
                          href={`tel:${transformedHotel.phone}`}
                          className="text-sm text-slate-600 font-normal hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-1 py-0.5"
                          aria-label={`Call ${transformedHotel.name} at ${transformedHotel.phone}`}
                        >
                          {transformedHotel.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-start flex-col gap-3">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                      <div className="relative px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <span className="text-sm font-normal text-slate-600 tracking-wide uppercase">
                          {(transformedHotel.hotelType || "Hotel").replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {transformedHotel.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating 
                          rating={transformedHotel.averageRating} 
                          size={16} 
                          showRating={true}
                          className="flex-shrink-0"
                        />
                        <span className="text-sm text-slate-600">
                          Avg
                        </span>
                      </div>
                    )}

                    {isAuthenticated && (
                      <Button
                        onClick={openReviewSheet}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                      >
                        <Star className="h-4 w-4" />
                        Help Others Choose — Leave Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm"></div>
              </div>

              <div className="relative">
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
                  <p className="text-slate-600 leading-relaxed text-sm font-normal tracking-wide">
                    {transformedHotel.description}
                  </p>
                </div>

                <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-xl -z-10"></div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-xl -z-10"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Amenities Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Hotel Amenities
                </CardTitle>
                <CardDescription className="text-sm">
                  Everything you need for a comfortable stay
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-row flex-wrap">
                  {appState.hotel.amenities?.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center p-1 rounded-lg"
                    >
                      <span className="text-sm font-normal border border-gray-300 rounded-[20px] px-2 py-1">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonials Section */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center text-base font-semibold">
                  
                  Guest Reviews
                </CardTitle>
                
              </CardHeader>
              <CardContent className="pt-0">
                {testimonialsState.loading ? (
                  <div className="flex justify-center py-8">
                    <YakRoomsLoader 
                      size={40} 
                      showTagline={false} 
                      loadingText=""
                      className="mb-2"
                    />
                  </div>
                ) : testimonialsState.error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {testimonialsState.error}
                    </p>
                  </div>
                ) : testimonialsState.testimonials.length > 0 ? (
                  <div className="space-y-4">
                    {testimonialsState.testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="sm:border sm:border-gray-100 sm:rounded-lg sm:p-4 sm:hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              {testimonial.userProfilePicUrl ? (
                                <img
                                  src={testimonial.userProfilePicUrl}
                                  alt={testimonial.userName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-blue-600">
                                  {testimonial.userName?.charAt(0)?.toUpperCase() || 'G'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {testimonial.userName}
                                </span>
                                <StarRating 
                                  rating={testimonial.rating} 
                                  size={14} 
                                  showRating={false}
                                  className="flex-shrink-0"
                                />
                              </div>
                              
                              <span className="hidden md:block text-xs text-gray-500 sm:text-right">
                                {new Date(testimonial.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {testimonial.comment && (
                              <p className="text-sm text-gray-700 leading-relaxed">
                                "{testimonial.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {testimonialsState.pagination && testimonialsState.pagination.totalPages > 1 && (
                      <div className="flex justify-center pt-6 pb-2">
                        {testimonialsState.currentPage < testimonialsState.pagination.totalPages - 1 ? (
                          <Button
                            variant="outline"
                            onClick={() => setTestimonialsState(prev => ({ 
                              ...prev, 
                              currentPage: prev.currentPage + 1 
                            }))}
                            className="flex items-center gap-2 px-6 py-2"
                          >
                            Load More...
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground"></p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Rooms Section */}
            <div ref={roomsSectionRef} className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Available Rooms
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose from our selection of comfortable rooms
                  </p>
                </div>
                {roomsState.loading && (
                  <YakRoomsLoader 
                    size={40} 
                    showTagline={false} 
                    loadingText=""
                    className="mb-2"
                  />
                )}
              </div>

              <div className="space-y-6 min-h-[400px]">
                {roomsState.availableRooms.length > 0
                  ? roomsState.availableRooms.map((room) => (
                      <Card
                        key={room.id}
                        className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200/50 shadow-md group bg-gradient-to-br from-white to-slate-50/30"
                      >
                        <div className="flex flex-col lg:flex-row">
                          <div className="lg:w-1/3 relative flex-shrink-0 overflow-hidden">
                            <RoomImageCarousel
                              images={
                                room.imageUrl && Array.isArray(room.imageUrl) && room.imageUrl.length > 0
                                  ? room.imageUrl
                                  : [`https://via.placeholder.com/500x300?text=Room+${room.roomNumber}`]
                              }
                              roomNumber={room.roomNumber}
                              roomType={room.roomType}
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="space-y-2">
                                  <CardTitle className="text-xl">
                                    {room.roomType} - Room {room.roomNumber}
                                  </CardTitle>
                                  <CardDescription className="text-sm">
                                    - {room.description}
                                  </CardDescription>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-2xl font-bold text-yellow-500">
                                    {appState.hotel.lowestPrice ? (
                                      <>
                                        <span className="text-base font-normal text-muted-foreground">
                                          From{" "}
                                        </span>
                                        Nu.{" "}
                                        {new Intl.NumberFormat("en-IN").format(
                                          appState.hotel.lowestPrice
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        Nu.{" "}
                                        {new Intl.NumberFormat("en-IN").format(
                                          room.price
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    per night
                                  </p>
                                </div>
                              </div>

                              {room.amenities?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                                    Room Amenities
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {room.amenities.map((amenity, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-6 pt-4 border-t">
                              <RoomBookingCard room={room} hotelId={id} />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  : !roomsState.loading && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-12">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              No rooms available
                            </h3>
                            <p className="text-base text-muted-foreground">
                              Please try different dates or contact the hotel
                              directly.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
              </div>

              {/* Enhanced Pagination */}
              {roomsState.paginationData && roomsState.paginationData.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (roomsState.currentPage > 0)
                              handlePageChange(roomsState.currentPage - 1);
                          }}
                          className={
                            roomsState.currentPage === 0
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                        />
                      </PaginationItem>
                      {[...Array(roomsState.paginationData.totalPages).keys()].map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={roomsState.currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                            >
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (roomsState.currentPage < roomsState.paginationData.totalPages - 1) {
                              handlePageChange(roomsState.currentPage + 1);
                            }
                          }}
                          className={
                            roomsState.currentPage >= roomsState.paginationData.totalPages - 1
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <YakRoomsAdCard />

            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Hotel Type</span>
                  <span className="text-sm">
                    {(appState.hotel.hotelType || "Hotel").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">District</span>
                  <span className="text-sm">{appState.hotel.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Address</span>
                  <span className="text-sm">{appState.hotel.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Rooms</span>
                  <span className="text-sm">
                    {roomsState.availableRooms.length}+ available
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Image Modal for mobile */}
      <Sheet open={uiState.showImageModal} onOpenChange={(open) => 
        setUiState(prev => ({ ...prev, showImageModal: open }))
      }>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{appState.hotel.name} - Images</SheetTitle>
          </SheetHeader>
          <div className="mt-6 relative h-full">
            <img
              src={transformedHotel.images[uiState.currentImageIndex]}
              alt={transformedHotel.name}
              className="h-full w-full object-contain"
            />
            {transformedHotel.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {transformedHotel.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setUiState(prev => ({ ...prev, currentImageIndex: index }))}
                    className={`h-2 w-2 rounded-full transition-all ${
                      uiState.currentImageIndex === index
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Hotel Review Sheet */}
      <HotelReviewSheet
        isOpen={uiState.reviewSheetOpen}
        userId={userId}
        hotelId={id}
        onSubmitSuccess={handleReviewSubmitSuccess}
      />
    </div>
  );
};

export default HotelDetailsPage;