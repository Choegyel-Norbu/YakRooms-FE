import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/services/AuthProvider.jsx";

const HotelDetailsPage = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // State for rooms and pagination
  const [availableRooms, setAvailableRooms] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // API is 0-indexed

  // Refs for scrolling
  const roomsSectionRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        // Fetch hotel details (only when ID changes and not already fetched)
        if (!hotel) {
          const response = await api.get(`/hotels/details/${id}`);
          setHotel(response.data);
        }

        // Fetch paginated rooms
        const res = await api.get(
          `/rooms/available/${id}?page=${currentPage}&size=3`
        ); // Fetching 3 rooms per page
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

  // Effect to handle scrolling on page change
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      // Scroll to the rooms section with a small offset for the sticky header
      roomsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [availableRooms]); // Dependency on availableRooms ensures it runs after new page data is loaded

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

  if (loading && isInitialLoad.current) {
    // Show full-page loader only on the very first load
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>An Error Occurred</CardTitle>
            <CardDescription>{error || "Hotel not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data transformation logic remains unchanged
  const transformedHotel = {
    ...hotel,
    images:
      hotel.photoUrls?.length > 0
        ? hotel.photoUrls
        : ["https://via.placeholder.com/1000x600?text=No+Hotel+Image"],
    // ... other properties from original code
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Button>
          <h1 className="text-xl font-bold">YakRooms</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden mb-8">
          <div className="relative h-64 md:h-96">
            <img
              src={transformedHotel.images[currentImageIndex]}
              alt={transformedHotel.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Button
              variant="outline"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {transformedHotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    currentImageIndex === index
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              {transformedHotel.name}
            </CardTitle>
            <CardDescription className="flex items-center pt-2">
              <MapPin className="mr-2 h-4 w-4" />
              {transformedHotel.district}, Bhutan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-4 text-muted-foreground">
              {transformedHotel.description}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                  {hotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-muted-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div ref={roomsSectionRef} className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Available Rooms
                </h2>
                {loading && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
              </div>
              <div className="space-y-4 min-h-[400px]">
                {availableRooms.length > 0
                  ? availableRooms.map((room) => (
                      <Card
                        key={room.id}
                        className="overflow-hidden transition-shadow hover:shadow-lg"
                      >
                        {/* Room Card Content remains the same */}
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 relative flex-shrink-0">
                            <img
                              src={
                                room.imageUrl?.[0] ||
                                `https://via.placeholder.com/500x300?text=No+Image`
                              }
                              alt={room.roomNumber}
                              className="h-64 w-full object-cover md:h-full"
                            />
                            {room.available && (
                              <Badge
                                variant="secondary"
                                className="absolute left-3 top-3"
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-500" />
                                Available
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <CardHeader>
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <CardTitle className="text-lg">
                                    {room.roomType}: {room.roomNumber}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {room.description}
                                  </CardDescription>
                                </div>
                                <div className="text-right flex-shrink-0 pl-2">
                                  <div className="text-lg font-bold text-primary">
                                    Nu.{" "}
                                    {new Intl.NumberFormat("en-IN").format(
                                      room.price
                                    )}
                                    /-
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    per night
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <h4 className="mb-3 font-medium text-sm">
                                Amenities
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {room.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="outline">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <RoomBookingCard room={room} />
                            </CardFooter>
                          </div>
                        </div>
                      </Card>
                    ))
                  : !loading && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground text-center py-10">
                            No available rooms found.
                          </p>
                        </CardContent>
                      </Card>
                    )}
              </div>
              {/* Pagination Controls */}
              {paginationData && paginationData.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          paginationData.first
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
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          paginationData.last
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            <YakRoomsAdCard />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelDetailsPage;
