import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoomBookingCard from "../../features/booking/RoomBookingCard";
import Footer from "../../layouts/Footer";
import SimpleSpinner from "@/shared/components/SimpleSpinner";
import StarRating from "@/shared/components/star-rating";
import HotelMap from "@/shared/components/HotelMap";
import api from "../../shared/services/Api";

import {
  ArrowLeft,
  Share2,
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
  X,
  Clock,
  MessageCircle,
  MoreVertical,
  Trash2,
  Facebook,
  Instagram,
} from "lucide-react";

import { Button } from "@/shared/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/tooltip";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import { useAuth } from "../authentication";

// Utility function to format time from 24-hour to 12-hour format with descriptive text
const formatTimeWithDescription = (timeString) => {
  if (!timeString) return "Not specified";
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    let description = '';
    if (hours === 0) {
      description = '(Midnight)';
    } else if (hours >= 1 && hours < 6) {
      description = '(Early Morning)';
    } else if (hours >= 6 && hours < 12) {
      description = '(Morning)';
    } else if (hours === 12) {
      description = '(Noon)';
    } else if (hours >= 13 && hours < 17) {
      description = '(Afternoon)';
    } else if (hours >= 17 && hours < 21) {
      description = '(Evening)';
    } else {
      description = '(Night)';
    }
    
    return `${hour12}:${formattedMinutes} ${ampm} ${description}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return "Invalid time";
  }
};

// Simple time formatter for sidebar (without description)
const formatTime = (timeString) => {
  if (!timeString) return "Not specified";
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return "Invalid time";
  }
};

// Custom TikTok icon component
const TikTokIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Room Image Carousel Component
const RoomImageCarousel = ({ images, roomNumber, roomType, isActive }) => {
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

  // Keyboard navigation - only when carousel is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard events if user is typing in form inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }
      
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
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 hover:bg-background/80 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 hover:bg-background/80 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
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

        {/* Status Badge */}
        <Badge
          variant="default"
          className={`absolute left-3 top-3 shadow-lg ${
            isActive 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <CheckCircle className="mr-1 h-3.5 w-3.5" />
          {isActive ? "Active" : "Inactive"}
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
                    className="rounded-full bg-background/60 hover:bg-background/80 h-10 w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={nextImage}
                    className="rounded-full bg-background/60 hover:bg-background/80 h-10 w-10"
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
  const { userId, isAuthenticated, roles, hasRole, hotelId } = useAuth();
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
    isDescriptionExpanded: false,
  });

  // Separate state for room image modal to avoid conflicts
  const [roomImageModal, setRoomImageModal] = useState({
    isOpen: false,
    selectedImage: null,
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

  // Helper function to check if current user owns this hotel
  const isHotelOwner = useCallback(() => {
    // Only hotel admins can own hotels
    if (!hasRole('HOTEL_ADMIN')) {
      return false;
    }
    
    // Check if the current user's hotelId matches the hotel being viewed
    return hotelId && id && hotelId.toString() === id.toString();
  }, [hasRole, hotelId, id]);


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

  // Room pagination effect - track page changes after initial load
  const [hasNavigatedFromInitialPage, setHasNavigatedFromInitialPage] = useState(false);
  
  useEffect(() => {
    if (appState.criticalDataLoaded && hasNavigatedFromInitialPage) {
      fetchRooms(roomsState.currentPage);
    }
  }, [roomsState.currentPage, fetchRooms, appState.criticalDataLoaded, hasNavigatedFromInitialPage]);

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
    setHasNavigatedFromInitialPage(true);
    setRoomsState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appState.hotel.name,
          text: `Check out ${appState.hotel.name} in ${appState.hotel.locality && `${appState.hotel.locality}, `}${appState.hotel.district}, Bhutan`,
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
    // This function is no longer needed in HotelDetailsPage
    // Review functionality moved to GuestDashboard
  }, []);

  const closeReviewSheet = useCallback(() => {
    // This function is no longer needed in HotelDetailsPage
    // Review functionality moved to GuestDashboard
  }, []);

  const handleReviewSubmitSuccess = useCallback(() => {
    // This function is no longer needed in HotelDetailsPage
    // Review functionality moved to GuestDashboard
  }, []);

  const handleWhatsAppClick = useCallback(() => {
    if (!appState.hotel?.phone) {
      console.warn('No hotel phone number available');
      return;
    }

    try {
      // Format phone number for WhatsApp (remove any non-digit characters and add country code if needed)
      let phoneNumber = appState.hotel.phone.replace(/\D/g, '');
      
      // If phone number doesn't start with country code, assume it's Bhutan (+975)
      if (!phoneNumber.startsWith('975')) {
        phoneNumber = '975' + phoneNumber;
      }
      
      // Create WhatsApp URL with a default message
      const message = encodeURIComponent(
        `Hi! I'm interested in booking a room at ${appState.hotel.name}. Could you please provide more information about availability and rates?`
      );
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  }, [appState.hotel?.phone, appState.hotel?.name]);

  const toggleDescription = useCallback(() => {
    setUiState(prev => ({ ...prev, isDescriptionExpanded: !prev.isDescriptionExpanded }));
  }, []);

  // Delete review handler
  const handleDeleteReview = useCallback(async (reviewId) => {
    if (!reviewId) return;
    
    try {
      // Call PATCH API to mark review as deleted
      await api.patch(`/reviews/${reviewId}/deleted`, {
        deleted: true
      });
      
      // Update the review in local state to show deletion request status
      setTestimonialsState(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(testimonial => 
          testimonial.id === reviewId 
            ? { ...testimonial, deletionRequested: true }
            : testimonial
        )
      }));
      
      // Show success message
      console.log('Review deletion requested successfully');
    } catch (error) {
      console.error('Error requesting review deletion:', error);
    }
  }, []);

  // Loading state - show Ezeeroom loader while fetching critical hotel data
  if (appState.loading && !appState.criticalDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <SimpleSpinner 
            size={32} 
            text="Loading hotel details..."
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
            
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            <Button asChild variant="ghost" className="p-2">
              <Link to="/">
                {/* <Home className="h-5 w-5 " /> */}
                Home
              </Link>
            </Button>
          </div>

          {/* Center - Optimized title for mobile */}
          <h1 className="text-base sm:text-lg font-bold truncate px-2">
            {appState.hotel.name}
          </h1>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Share this hotel
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-0 sm:px-6 py-0 lg:py-8 space-y-6 sm:space-y-8">
        {/* Enhanced Hero Section */}
        <Card className="overflow-hidden pt-0 rounded-t-none rounded-b-xl">
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/60 hover:bg-background/80 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/60 hover:bg-background/80 h-8 w-8 sm:h-10 sm:w-10"
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

            {/* Hotel Type Badge */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-gray-200">
              {(transformedHotel.hotelType || "Hotel").replace(/_/g, " ")}
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
                  <div className="space-y-4 sm:space-y-6 flex flex-col lg:flex-row lg:gap-6">
                    {/* <h1 className="text-base sm:text-base md:text-sm font-semibold tracking-tight text-slate-800 leading-tight">
                      {transformedHotel.name}
                    </h1> */}

                    {/* Location and Contact Section */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:w-1/2">
                      <div className="flex-1">
                        <div className="flex items-start group">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-black uppercase tracking-wide mb-1">Location</span>
                            <span className="text-sm text-slate-600 font-normal group-hover:text-slate-700 transition-colors duration-200">
                              {transformedHotel.locality && `${transformedHotel.locality}, `}{transformedHotel.district}, Bhutan
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start group">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-black uppercase tracking-wide mb-1">Contact</span>
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
                    </div>

                    {/* Hotel Description */}
                   {transformedHotel.description && (
                      <div className="lg:w-1/2">
                        <div className="mb-3">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {transformedHotel.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-start flex-col gap-3">

                    {transformedHotel.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating 
                          rating={transformedHotel.averageRating} 
                          size={16} 
                          showRating={true}
                          className="flex-shrink-0"
                        />
                        <span className="text-sm text-slate-600">
                          Avg. Rating 
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div className="relative">
                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm"></div>
              </div>

              {/* Social Media Links Section */}
              {(appState.hotel?.facebookUrl || appState.hotel?.instagramUrl || appState.hotel?.tiktokUrl) && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Follow Us</h4>
                    <p className="text-xs text-slate-600">Stay connected with our latest updates</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {appState.hotel.facebookUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={appState.hotel.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200">
                                <Facebook className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-blue-800 group-hover:text-blue-900">Facebook</span>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Visit our Facebook page
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {appState.hotel.instagramUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={appState.hotel.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-200">
                                <Instagram className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-purple-800 group-hover:text-purple-900">Instagram</span>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Follow us on Instagram
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {appState.hotel.tiktokUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={appState.hotel.tiktokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200">
                                <TikTokIcon className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">TikTok</span>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Check out our TikTok videos
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}

              {/* Check-in/Check-out Times - Mobile & Desktop Visible */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center  gap-4">
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">Check-in Time</h4>
                      <p className="text-xs text-blue-600 border border-blue-300 rounded px-2 py-1 bg-blue-50">- {formatTimeWithDescription(appState.hotel?.checkinTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">Check-out Time</h4>
                      <p className="text-xs text-blue-600 border border-blue-300 rounded px-2 py-1 bg-blue-50">- {formatTimeWithDescription(appState.hotel?.checkoutTime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Enhanced Amenities Section */}
            {/* <Card> */}
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
            {/* </Card> */}

            {/* Hotel Location Map - Mobile View */}
            <div className="lg:hidden">
              <HotelMap
                hotelName={appState.hotel?.name}
                latitude={appState.hotel?.latitude || appState.hotel?.hotelLatitude}
                longitude={appState.hotel?.longitude || appState.hotel?.hotelLongitude}
                address={appState.hotel?.address}
                locality={appState.hotel?.locality}
                district={appState.hotel?.district}
              />
            </div>

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
                    <SimpleSpinner 
                      size={24} 
                      text="Loading testimonials..."
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
                              
                              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-2">
                                <span className="text-xs text-gray-500 sm:text-right">
                                  {new Date(testimonial.createdAt).toLocaleDateString()}
                                </span>
                                
                                {/* Three-dot menu for hotel_admin role - only for their own hotel */}
                                {isHotelOwner() && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 sm:h-6 sm:w-6 hover:bg-gray-100 transition-colors duration-200 ml-auto sm:ml-0"
                                      >
                                        <MoreVertical className="h-4 w-4 sm:h-4 sm:w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem
                                        onClick={() => !testimonial.deleted && handleDeleteReview(testimonial.id)}
                                        className={`${
                                          testimonial.deleted 
                                            ? "text-gray-400 cursor-not-allowed" 
                                            : "text-red-600 focus:text-red-600 focus:bg-red-50"
                                        }`}
                                        disabled={testimonial.deleted || testimonial.deletionRequested}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {testimonial.deleted 
                                          ? 'Review Deleted' 
                                          : testimonial.deletionRequested 
                                            ? 'Request for deletion' 
                                            : 'Request Delete'
                                        }
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
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
                <div className="pl-4 sm:pl-0">
                  <h2 className="text-base font-semibold tracking-tight">
                    Active Rooms
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose from our selection of comfortable rooms
                  </p>
                </div>
                {roomsState.loading && (
                  <SimpleSpinner 
                    size={24} 
                    text="Loading rooms..."
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
                              isActive={room.isActive}
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

                            {/* Room Image Preview Section */}
                            {room.imageUrl && Array.isArray(room.imageUrl) && room.imageUrl.length > 1 && (
                              <div className="mt-6 pt-4 border-t">
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                    Room Photos
                                  </h4>
                                  <div className="flex gap-2 overflow-x-auto pb-2">
                                    {room.imageUrl.map((image, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          setRoomImageModal({
                                            isOpen: true,
                                            selectedImage: image
                                          });
                                        }}
                                        className="flex-shrink-0 relative group transition-all duration-200 hover:ring-2 ring-muted-foreground/30 ring-offset-1"
                                      >
                                        <img
                                          src={image}
                                          alt={`Room ${room.roomNumber} - Photo ${index + 1}`}
                                          className="h-16 w-24 object-cover rounded-md transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-105"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

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
              {roomsState.paginationData && roomsState.paginationData.page?.totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-muted-foreground">
                    Showing {roomsState.availableRooms.length} of {roomsState.paginationData.page?.totalElements || 0} rooms
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (roomsState.paginationData?.page?.hasPrevious && !roomsState.loading)
                              handlePageChange(roomsState.currentPage - 1);
                          }}
                          className={
                            !roomsState.paginationData?.page?.hasPrevious || roomsState.loading
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                        />
                      </PaginationItem>
                      {[...Array(roomsState.paginationData.page?.totalPages || 0).keys()].map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={roomsState.currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!roomsState.loading)
                                  handlePageChange(page);
                              }}
                              className={roomsState.loading ? "pointer-events-none opacity-50" : undefined}
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
                            if (roomsState.paginationData?.page?.hasNext && !roomsState.loading) {
                              handlePageChange(roomsState.currentPage + 1);
                            }
                          }}
                          className={
                            !roomsState.paginationData?.page?.hasNext || roomsState.loading
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  {/* Page Info */}
                  <div className="text-xs text-muted-foreground">
                    Page {roomsState.currentPage + 1} of {roomsState.paginationData.page?.totalPages || 1}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Hidden on mobile, visible on lg screens and up */}
          <aside className="hidden lg:block space-y-6 sticky top-19 self-start">

            {/* Hotel Location Map */}
            <HotelMap
              hotelName={appState.hotel?.name}
              latitude={appState.hotel?.latitude || appState.hotel?.hotelLatitude}
              longitude={appState.hotel?.longitude || appState.hotel?.hotelLongitude}
              address={appState.hotel?.address}
              locality={appState.hotel?.locality}
              district={appState.hotel?.district}
            />

            {/* Social Media Card - Desktop Sidebar */}
            {(appState.hotel?.facebookUrl || appState.hotel?.instagramUrl || appState.hotel?.tiktokUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Follow Us</CardTitle>
                  <CardDescription className="text-sm">
                    Stay connected with our latest updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appState.hotel.facebookUrl && (
                    <a
                      href={appState.hotel.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200">
                        <Facebook className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Facebook</p>
                        <p className="text-xs text-gray-500 truncate">Visit our page</p>
                      </div>
                    </a>
                  )}

                  {appState.hotel.instagramUrl && (
                    <a
                      href={appState.hotel.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-200">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Instagram</p>
                        <p className="text-xs text-gray-500 truncate">Follow us</p>
                      </div>
                    </a>
                  )}

                  {appState.hotel.tiktokUrl && (
                    <a
                      href={appState.hotel.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200">
                        <TikTokIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">TikTok</p>
                        <p className="text-xs text-gray-500 truncate">Watch our videos</p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

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
                  <span className="text-sm">Location</span>
                  <span className="text-sm">
                    {appState.hotel.locality && `${appState.hotel.locality}, `}{appState.hotel.district}
                  </span>
                </div>
                {appState.hotel.address && (
                  <div className="flex justify-between">
                    <span className="text-sm">Address</span>
                    <span className="text-sm">{appState.hotel.address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Total Rooms</span>
                  <span className="text-sm">
                    {roomsState.availableRooms.length}+ active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Check-in Time</span>
                  <span className="text-sm">{formatTime(appState.hotel?.checkinTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Check-out Time</span>
                  <span className="text-sm">{formatTime(appState.hotel?.checkoutTime)}</span>
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


      {/* Room Image Modal */}
      {roomImageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden max-w-[95vw] max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setRoomImageModal({ isOpen: false, selectedImage: null })}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-colors duration-200"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
            
            {/* Image Container */}
            <div className="flex items-center justify-center">
              {roomImageModal.selectedImage && (
                <img
                  src={roomImageModal.selectedImage}
                  alt="Room Photo"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      {appState.hotel?.phone && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleWhatsAppClick()}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label={`Chat with ${appState.hotel.name} on WhatsApp`}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                
                {/* Pulse animation ring */}
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
                
                {/* WhatsApp branding */}
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-md">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white">
              <p>Chat with {appState.hotel.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default HotelDetailsPage;