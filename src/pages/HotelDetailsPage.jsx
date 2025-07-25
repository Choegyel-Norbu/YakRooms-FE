import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoomBookingCard from "../components/cards/RoomBookingCard.jsx";
import Footer from "../components/Footer";
import YakRoomsAdCard from "../components/cards/YakRoomsAdCard";
import api from "../services/Api";

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
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/services/AuthProvider.jsx";

const HotelDetailsPage = () => {
  // const { isAuthenticated, hotelId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // State for rooms and pagination
  const [availableRooms, setAvailableRooms] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Refs for scrolling
  const roomsSectionRef = useRef(null);
  const isInitialLoad = useRef(true);

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

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return amenityIcons.wifi;
    if (amenityLower.includes('parking') || amenityLower.includes('park')) return amenityIcons.parking;
    if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return amenityIcons.breakfast;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return amenityIcons.restaurant;
    if (amenityLower.includes('bathroom') || amenityLower.includes('bath')) return amenityIcons.bathroom;
    if (amenityLower.includes('air') || amenityLower.includes('ac')) return amenityIcons.ac;
    return amenityIcons.default;
  };

  // WebSocket callback to handle real-time room updates
  const handleRoomUpdates = (updatedRooms) => {
    console.log('Received real-time room updates:', updatedRooms);
    
    // Filter rooms based on current pagination
    const startIndex = currentPage * 3;
    const endIndex = startIndex + 3;
    const paginatedRooms = updatedRooms.slice(startIndex, endIndex);
    
    setAvailableRooms(paginatedRooms);
    
    // Update pagination data
    setPaginationData(prev => ({
      ...prev,
      content: paginatedRooms,
      totalElements: updatedRooms.length,
      totalPages: Math.ceil(updatedRooms.length / 3)
    }));
  };

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        if (!hotel) {
          const response = await api.get(`/hotels/details/${id}`);
          setHotel(response.data);
        }

        const res = await api.get(
          `/rooms/available/${id}?page=${currentPage}&size=3`
        );
        setAvailableRooms(res.data.content);
        setPaginationData(res.data);
      } catch (err) {
        setError("Failed to load hotel details");
        console.error("Error fetching hotel data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotelData();
    }
  }, [id, currentPage, hotel]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      roomsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [availableRooms]);

  const nextImage = () => {
    if (hotel?.photoUrls?.length) {
      setCurrentImageIndex((prev) =>
        prev === hotel.photoUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hotel?.photoUrls?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? hotel.photoUrls.length - 1 : prev - 1
      );
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hotel.name,
          text: `Check out ${hotel.name} in ${hotel.district}, Bhutan`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading && isInitialLoad.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>{error || "Hotel not found"}</CardDescription>
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
    ...hotel,
    images:
      hotel.photoUrls?.length > 0
        ? hotel.photoUrls
        : ["https://via.placeholder.com/1000x600?text=No+Hotel+Image"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Optimized header for mobile */}
      <header className="sticky top-0 z-20 border-b bg-background/95">
        {/* Removed container class to avoid automatic horizontal padding */}
        <div className="mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Back button: icon only on small screens, icon+text on sm+ */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            {/* Removed Home and YakRooms navigation */}
            {/* <Button asChild variant="ghost" className="sm:hidden p-2">
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link to="/">
                <Building2 className="mr-2 h-4 w-4" />
                YakRooms
              </Link>
            </Button> */}
          </div>

          {/* Center - Optimized title for mobile */}
          <h1 className="text-base sm:text-lg font-bold truncate px-2">
            {hotel.name}
          </h1>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8 sm:h-10 sm:w-10">
              <Share2 className="h-4 w-4" />
            </Button>
            {/* Removed Heart (love sign) button */}
          </div>
        </div>
      </header>

      {/* Restored container with proper padding */}
      <main className="container mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Enhanced Hero Section */}
        <Card className="overflow-hidden">
          {/* Optimized image height for mobile */}
          <div className="relative h-48 sm:h-64 md:h-96 lg:h-[500px]">
            <img
              src={transformedHotel.images[currentImageIndex]}
              alt={transformedHotel.name}
              className="h-full w-full object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Image Navigation */}
            {transformedHotel.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prevImage}
                  // Smaller navigation buttons for mobile
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
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all ${
                    currentImageIndex === index
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {currentImageIndex + 1} / {transformedHotel.images.length}
            </div>
          </div>

          {/* Reduced card content padding for mobile */}
          <CardContent className="p-4 sm:p-6">
            {/* Reduced spacing between elements */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                {/* Reduced spacing for mobile */}
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Mobile-optimized font sizes */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                    {transformedHotel.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{transformedHotel.district}, Bhutan</span>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                    {transformedHotel.hotelType || 'Hotel'}
                  </Badge>
                </div>
                
                {/* Rating Section - Removed */}
                {/* <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                          i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">(4.0)</span>
                </div> */}
              </div>

              <Separator />

              <div className="prose prose-sm max-w-none">
                {/* Mobile-optimized text size */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {transformedHotel.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Amenities Section */}
            <Card>
              {/* Restored card header padding */}
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Hotel Amenities
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Everything you need for a comfortable stay
                </CardDescription>
              </CardHeader>
              {/* Restored card content padding */}
              <CardContent className="pt-0">
                {/* Grid for amenities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.amenities?.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center p-3 rounded-lg bg-muted/50">
                        <IconComponent className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Rooms Section */}
            <div ref={roomsSectionRef} className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  {/* Heading size */}
                  <h2 className="text-2xl font-bold tracking-tight">
                    Available Rooms
                  </h2>
                  <p className="text-base text-muted-foreground">
                    Choose from our selection of comfortable rooms
                  </p>
                </div>
                {loading && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
              </div>

              {/* Restored minimum height */}
              <div className="space-y-6 min-h-[400px]">
                {availableRooms.length > 0
                  ? availableRooms.map((room) => (
                      <Card
                        key={room.id}
                        className="overflow-hidden transition-all hover:shadow-lg border-0 shadow-md"
                      >
                        <div className="flex flex-col lg:flex-row">
                          <div className="lg:w-1/3 relative flex-shrink-0">
                            <img
                              src={
                                room.imageUrl?.[0] ||
                                `https://via.placeholder.com/500x300?text=Room+${room.roomNumber}`
                              }
                              alt={`Room ${room.roomNumber}`}
                              className="h-64 w-full object-cover lg:h-full"
                            />
                            {room.available && (
                              <Badge
                                variant="default"
                                className="absolute left-3 top-3 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                Available
                              </Badge>
                            )}
                          </div>

                          {/* Restored padding */}
                          <div className="flex flex-1 flex-col justify-between p-6">
                            {/* Restored spacing */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                {/* Restored spacing */}
                                <div className="space-y-2">
                                  {/* Text sizes */}
                                  <CardTitle className="text-xl">
                                    {room.roomType} - Room {room.roomNumber}
                                  </CardTitle>
                                  <CardDescription className="text-base">
                                    {room.description}
                                  </CardDescription>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {/* Price display with "From" label */}
                                  <div className="text-2xl font-bold text-primary">
                                    {hotel.lowestPrice ? (
                                      <>
                                        <span className="text-base font-normal text-muted-foreground">From </span>
                                        Nu. {new Intl.NumberFormat("en-IN").format(hotel.lowestPrice)}
                                      </>
                                    ) : (
                                      <>Nu. {new Intl.NumberFormat("en-IN").format(room.price)}</>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    per night
                                  </p>
                                </div>
                              </div>

                              {room.amenities?.length > 0 && (
                                <div>
                                  {/* Subtitle */}
                                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                                    Room Amenities
                                  </h4>
                                  {/* Gap spacing */}
                                  <div className="flex flex-wrap gap-2">
                                    {room.amenities.map((amenity, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Restored margin and padding */}
                            <div className="mt-6 pt-4 border-t">
                              <RoomBookingCard room={room} hotelId={id}/>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  : !loading && (
                      <Card>
                        {/* Restored padding */}
                        <CardContent className="pt-6">
                          {/* Restored padding for empty state */}
                          <div className="text-center py-12">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No rooms available</h3>
                            <p className="text-base text-muted-foreground">
                              Please try different dates or contact the hotel directly.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
              </div>

              {/* Enhanced Pagination */}
              {paginationData && paginationData.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 0) handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage === 0
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                        />
                      </PaginationItem>
                      {[...Array(paginationData.totalPages).keys()].map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
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
                            if (currentPage < paginationData.totalPages - 1) {
                              handlePageChange(currentPage + 1);
                            }
                          }}
                          className={
                            currentPage >= paginationData.totalPages - 1
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
                  <span className="text-muted-foreground">Hotel Type</span>
                  <span className="font-medium">{hotel.hotelType || 'Hotel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{hotel.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rooms</span>
                  <span className="font-medium">{availableRooms.length}+ available</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Image Modal for mobile */}
      <Sheet open={showImageModal} onOpenChange={setShowImageModal}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{hotel.name} - Images</SheetTitle>
          </SheetHeader>
          <div className="mt-6 relative h-full">
            <img
              src={transformedHotel.images[currentImageIndex]}
              alt={transformedHotel.name}
              className="h-full w-full object-contain"
            />
            {transformedHotel.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {transformedHotel.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentImageIndex === index
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
    </div>
  );
};

export default HotelDetailsPage;