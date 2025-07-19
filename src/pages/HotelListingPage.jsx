import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  MapPin, 
  Star, 
  StarHalf, 
  Loader2, 
  Filter, 
  Home, 
  Building2,
  ChevronDown,
  SlidersHorizontal,
  Search
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
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
import FilterSidebar from "@/components/hotel/FilterSidebar";
import api from "../services/Api";

// Star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    } else {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }
  }

  return <div className="flex items-center space-x-0.5">{stars}</div>;
};

const HotelListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });
  const [searchState, setSearchState] = useState({
    district: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    hotelType: "",
  });
  const [formErrors, setFormErrors] = useState({ district: "", hotelType: "" });

  const allowedHotelTypes = [
    "Resort",
    "Hotel",
    "Guesthouse",
    "Homestay",
    "Boutique Hotel",
  ];

  // Initialize search state from URL parameters
  useEffect(() => {
    const urlDistrict = searchParams.get("district") || "";
    const urlCheckIn = searchParams.get("checkIn") || "";
    const urlCheckOut = searchParams.get("checkOut") || "";
    const urlGuests = parseInt(searchParams.get("guests")) || 1;
    const urlHotelType = searchParams.get("hotelType") || "";

    setSearchState({
      district: urlDistrict,
      checkIn: urlCheckIn,
      checkOut: urlCheckOut,
      guests: urlGuests,
      hotelType: urlHotelType,
    });

    // If there are search parameters from URL, trigger search immediately
    if (urlDistrict || urlHotelType) {
      setTimeout(() => {
        filterHotels(0, {
          district: urlDistrict,
          hotelType: urlHotelType,
        });
      }, 100);
    } else {
      fetchHotels(0);
    }
  }, []);

  const validateForm = () => {
    let errors = { district: "", hotelType: "" };
    let isValid = true;

    if (!searchState.district || searchState.district.trim() === "") {
      errors.district = "District is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(searchState.district.trim())) {
      errors.district = "District must contain only letters";
      isValid = false;
    }

    if (
      searchState.hotelType &&
      !allowedHotelTypes.includes(searchState.hotelType)
    ) {
      errors.hotelType = "Invalid hotel type selected";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSearchClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSearch();
    }
  };

  const fetchHotels = async (page = 0) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/hotels?page=${page}&size=${pagination.size}`
      );
      setHotels(response.data.content);
      setPagination({
        page: response.data.pageable.pageNumber,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterHotels = async (page = 0, customSearchParams = null) => {
    try {
      setLoading(true);
      const searchData = customSearchParams || searchState;
      const params = new URLSearchParams({
        district: searchData.district,
        hotelType: searchData.hotelType,
        page,
        size: pagination.size,
      });
      const response = await api.get(`/hotels/search?${params.toString()}`);
      setHotels(response.data.content);
      setPagination({
        page: response.data.pageable.pageNumber,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      });

      // Update URL to reflect current search
      const urlParams = new URLSearchParams();
      if (searchData.district) urlParams.set("district", searchData.district);
      if (searchData.hotelType) urlParams.set("hotelType", searchData.hotelType);
      setSearchParams(urlParams);
    } catch (error) {
      console.error("Error filtering hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformHotelData = (hotel) => ({
    id: hotel.id,
    name: hotel.name,
    district: hotel.district,
    price: Math.floor(Math.random() * 400) + 80,
    rating: 4 + Math.random(),
    image:
      hotel.photoUrls?.[0] ||
      `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format`,
    type: hotel.hotelType || "Hotel",
    reviews: Math.floor(Math.random() * 100) + 20,
    amenities: hotel.amenities || [],
  });

  const sortedAndFilteredHotels = hotels
    .map(transformHotelData)
    .filter((hotel) => {
      return (
        hotel.price >= priceRange[0] &&
        hotel.price <= priceRange[1] &&
        (selectedTypes.length === 0 || selectedTypes.includes(hotel.type)) &&
        (searchState.district === "" ||
          hotel.district
            .toLowerCase()
            .includes(searchState.district.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      if (searchState.district || searchState.hotelType) {
        filterHotels(newPage);
      } else {
        fetchHotels(newPage);
      }
    }
  };

  const handleSearch = () => {
    filterHotels(0);
  };

  const handleResetFilters = () => {
    setPriceRange([0, 500]);
    setSelectedTypes([]);
    setSearchState((prev) => ({
      ...prev,
      district: "",
      hotelType: "",
    }));
    setSearchParams({});
    fetchHotels(0);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Brand and Navigation */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary"
              >
                <Building2 className="h-6 w-6 text-primary" />
                <span className="hidden sm:block">YakRooms</span>
              </Link>
              
              {/* Mobile Home Button */}
              <Button asChild variant="ghost" size="sm" className="sm:hidden">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>

            {/* Center - Tagline (hidden on mobile) */}
            <div className="hidden md:block">
              <p className="text-muted-foreground text-sm">
                Discover authentic Bhutanese stays
              </p>
            </div>

            {/* Right side - Search indicator */}
            <div className="flex items-center gap-2">
              {(searchState.district || searchState.hotelType) && (
                <Badge variant="secondary" className="hidden sm:flex">
                  <Search className="h-3 w-3 mr-1" />
                  Active Filters
                </Badge>
              )}
              <span className="text-sm text-muted-foreground hidden lg:block">
                {pagination.totalElements} results
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters & Search
                  {(searchState.district || searchState.hotelType) && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[340px] p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                  </SheetTitle>
                </SheetHeader>
                <div className="p-6 pt-4">
                  <FilterSidebar
                    searchParams={searchState}
                    setSearchParams={setSearchState}
                    onSearchClick={onSearchClick}
                    formErrors={formErrors}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
            <div className="sticky top-24">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Search & Filter
                  </CardTitle>
                  <CardDescription>
                    Find your perfect stay in Bhutan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FilterSidebar
                    searchParams={searchState}
                    setSearchParams={setSearchState}
                    onSearchClick={onSearchClick}
                    formErrors={formErrors}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4 xl:w-4/5">
            {/* Enhanced Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {searchState.district
                      ? `Hotels in ${searchState.district}`
                      : "All Hotels in Bhutan"}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>
                      {loading
                        ? "Searching..."
                        : `${pagination.totalElements} ${pagination.totalElements === 1 ? 'hotel' : 'hotels'} found`}
                    </span>
                    {(searchState.district || searchState.hotelType) && (
                      <Button
                        variant="link"
                        onClick={handleResetFilters}
                        className="h-auto p-0 text-primary"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-3">
                  <Label htmlFor="sort-by" className="text-sm font-medium whitespace-nowrap">
                    Sort by
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by" className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchState.district || searchState.hotelType) && (
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Active filters:</span>
                  {searchState.district && (
                    <Badge variant="secondary">
                      District: {searchState.district}
                    </Badge>
                  )}
                  {searchState.hotelType && (
                    <Badge variant="secondary">
                      Type: {searchState.hotelType}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Finding the best hotels for you...</p>
              </div>
            ) : sortedAndFilteredHotels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {sortedAndFilteredHotels.map((hotel) => (
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
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{hotel.rating.toFixed(1)}</span>
                        </div>

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

                        {/* Rating and Reviews */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <StarRating rating={hotel.rating} />
                            <span className="text-sm text-muted-foreground">
                              ({hotel.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardFooter className="bg-muted/30 border-t px-6 py-4">
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <p className="text-sm text-muted-foreground">Starting from</p>
                            <p className="text-xl font-bold text-primary">
                              Nu. {new Intl.NumberFormat('en-IN').format(hotel.price)}
                              <span className="text-sm font-normal text-muted-foreground ml-1">
                                /night
                              </span>
                            </p>
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
                    We couldn't find any hotels matching your search criteria. 
                    Try adjusting your filters or search for a different location.
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button onClick={handleResetFilters} variant="outline">
                      Reset All Filters
                    </Button>
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
    </div>
  );
};

export default HotelListingPage;