import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, StarHalf, Loader2, Filter } from "lucide-react";

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

// Star rating component refactored with lucide-react
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
          className="h-5 w-5 fill-amber-400 text-amber-400"
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-5 w-5 fill-amber-400 text-amber-400"
        />
      );
    } else {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-amber-300" />
      );
    }
  }

  return <div className="flex items-center space-x-1">{stars}</div>;
};

const HotelListingPage = () => {
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
  const [searchParams, setSearchParams] = useState({
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

  const validateForm = () => {
    let errors = { district: "", hotelType: "" };
    let isValid = true;

    if (!searchParams.district || searchParams.district.trim() === "") {
      errors.district = "District is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(searchParams.district.trim())) {
      errors.district = "District must contain only letters";
      isValid = false;
    }

    if (
      searchParams.hotelType &&
      !allowedHotelTypes.includes(searchParams.hotelType)
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

  useEffect(() => {
    fetchHotels(0);
  }, []);

  const filterHotels = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        district: searchParams.district,
        hotelType: searchParams.hotelType,
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
      `https://source.unsplash.com/random/600x400?hotel,resort&sig=${hotel.id}`,
    type: hotel.hotelType || "Hotel",
    reviews: Math.floor(Math.random() * 100) + 20,
  });

  const sortedAndFilteredHotels = hotels
    .map(transformHotelData)
    .filter((hotel) => {
      return (
        hotel.price >= priceRange[0] &&
        hotel.price <= priceRange[1] &&
        (selectedTypes.length === 0 || selectedTypes.includes(hotel.type)) &&
        (searchParams.district === "" ||
          hotel.district
            .toLowerCase()
            .includes(searchParams.district.toLowerCase()))
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
      if (searchParams.district || searchParams.hotelType) {
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
    setSearchParams((prev) => ({
      ...prev,
      district: "",
      hotelType: "",
    }));
    fetchHotels(0);
  };

  const renderPagination = () => (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(pagination.page - 1);
            }}
            disabled={pagination.page === 0}
            aria-disabled={pagination.page === 0}
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
              handlePageChange(pagination.page + 1);
            }}
            disabled={pagination.page >= pagination.totalPages - 1}
            aria-disabled={pagination.page >= pagination.totalPages - 1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <div className="bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-primary"
          >
            YakRooms
          </Link>
          <p className="text-muted-foreground hidden sm:block">
            Discover authentic Bhutanese stays
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild className="lg:hidden mb-4">
              <Button variant="outline" className="w-full justify-center">
                <Filter className="mr-2 h-4 w-4" />
                Show Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="p-6 pt-4">
                <FilterSidebar
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  onSearchClick={onSearchClick}
                  formErrors={formErrors}
                />
              </div>
            </SheetContent>
          </Sheet>

          <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle>Filter & Search</CardTitle>
                  <CardDescription>Refine your search results.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FilterSidebar
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    onSearchClick={onSearchClick}
                    formErrors={formErrors}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className="w-full lg:w-3/4 xl:w-4/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {searchParams.district
                    ? `Stays in ${searchParams.district}`
                    : "All Stays"}
                </h1>
                <p className="text-muted-foreground">
                  {loading
                    ? "Finding best places..."
                    : `${pagination.totalElements} hotels found.`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="sort-by"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Sort by
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : sortedAndFilteredHotels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedAndFilteredHotels.map((hotel) => (
                    <Card
                      key={hotel.id}
                      className="overflow-hidden flex flex-col group transition-all hover:shadow-lg"
                    >
                      <div className="relative overflow-hidden">
                        <Link to={`/hotel/${hotel.id}`}>
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                          />
                        </Link>
                        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-sm font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          {/* <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> */}
                          {/* <span>{hotel.rating.toFixed(1)}</span> */}
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                            <Link to={`/hotel/${hotel.id}`}>{hotel.name}</Link>
                          </CardTitle>
                          <div className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded whitespace-nowrap">
                            {hotel.type}
                          </div>
                        </div>
                        <CardDescription className="flex items-center pt-1">
                          <MapPin className="mr-1.5 h-4 w-4" />
                          <span>{hotel.district}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {/* <div className="text-20">
                          <StarRating rating={hotel.rating} />
                        </div> */}
                      </CardContent>
                      <CardFooter className="bg-muted/40 px-6 py-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="text-xl font-bold">
                            ${hotel.price}
                            <span className="text-sm font-normal text-muted-foreground">
                              /night
                            </span>
                          </p>
                        </div>
                        <Button asChild>
                          <Link to={`/hotel/${hotel.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <Card className="text-center py-16 px-6 bg-muted/20 border-dashed">
                <CardHeader>
                  <CardTitle className="text-2xl">No Results Found</CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    We couldn't find any hotels matching your criteria. Try
                    adjusting your search or resetting the filters.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
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
