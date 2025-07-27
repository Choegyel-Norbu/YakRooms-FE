import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import api from '@/services/Api';

const RoomStatusTable = ({ hotelId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    if (hotelId && !isSearchActive) {
      fetchRoomStatus();
    }
  }, [hotelId, currentPage, isTableVisible, isSearchActive]);

  // Separate effect for search functionality
  useEffect(() => {
    if (hotelId && isSearchActive && searchQuery.trim()) {
      handleSearch();
    }
  }, [currentPage, isSearchActive]);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, reset to normal view
      setIsSearchActive(false);
      setSearchError(false);
      setCurrentPage(0);
      return;
    }

    setSearchLoading(true);
    setError(null);
    setSearchError(false);
    
    try {
      // Use the provided API endpoint for room search
      const response = await api.get(`/rooms/status/${hotelId}/search`, {
        params: {
          roomNumber: searchQuery.trim(),
          page: 0,
          size: pageSize
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to search rooms');
      }
      
      const searchResult = response.data;
      setData(searchResult);
      setIsSearchActive(true);
      setCurrentPage(0);
      setSearchError(false);
    } catch (err) {
      // Keep search input and show error message
      setSearchError(true);
      setIsSearchActive(true);
      setCurrentPage(0);
      setError(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setSearchError(false);
    setCurrentPage(0);
  };

  const fetchRoomStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/rooms/status/${hotelId}?page=${currentPage}&size=${pageSize}`);
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch room status data');
      }
      
      const result = await response.data;
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Error loading room status</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state more professionally
  const hasNoRooms = !data || !data.content || data.content.length === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Room Status Overview</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTableVisible(!isTableVisible)}
            className="flex items-center gap-2"
          >
            {isTableVisible ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide 
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show 
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isTableVisible && (
        <CardContent className="px-2 sm:px-6">
          {/* Search Bar */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              className="w-full sm:w-auto"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Search Error Message */}
          {searchError && (
            <div className="mb-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-md p-2">
              <span className="text-sm text-red-700">
                No search results found for "{searchQuery}"
              </span>
              <button
                onClick={clearSearch}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Search Results Indicator */}
          {isSearchActive && !searchError && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
              <span className="text-sm text-blue-700">
                {data.totalElements === 0 
                  ? 'No rooms found' 
                  : `Showing search results for "${searchQuery}"`}
              </span>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Empty State */}
          {hasNoRooms && !loading && !searchError && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
              <p className="text-gray-500 mb-4">
                {isSearchActive 
                  ? "No rooms match your search criteria. Try adjusting your search terms."
                  : "This hotel doesn't have any rooms configured yet."
                }
              </p>
              {isSearchActive && (
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Hide table content when there's a search error or no data */}
          {!searchError && !hasNoRooms && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50/50">
                    <tr>
                      <th className="h-10 px-3 text-left align-middle font-medium text-sm text-gray-900 w-[120px]">Room Number</th>
                      <th className="h-10 px-3 text-left align-middle font-medium text-sm text-gray-900">Room Type</th>
                      <th className="h-10 px-3 text-left align-middle font-medium text-sm text-gray-900">Room Status</th>
                      <th className="h-10 px-3 text-left align-middle font-medium text-sm text-gray-900">Guest Name</th>
                      <th className="h-10 px-3 text-left align-middle font-medium text-sm text-gray-900">Check-Out Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((room, index) => (
                      <tr 
                        key={room.roomNumber} 
                        className={`border-b transition-colors hover:bg-gray-100/50 ${index % 2 === 0 ? 'bg-gray-50/30' : ''}`}
                      >
                        <td className="p-3 align-middle font-medium text-sm">{room.roomNumber}</td>
                        <td className="p-3 align-middle text-sm">{room.roomType}</td>
                        <td className="p-3 align-middle">
                          <Badge 
                            variant={getStatusBadgeVariant(room.roomStatus)}
                            className={
                              room.roomStatus?.toLowerCase() === 'available' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 text-xs' 
                                : 'text-xs'
                            }
                          >
                            {room.roomStatus}
                          </Badge>
                        </td>
                        <td className="p-3 align-middle text-sm">{room.guestName || 'No guest'}</td>
                        <td className="p-3 align-middle text-sm">{formatDate(room.checkOutDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {data.content.map((room, index) => (
                  <div 
                    key={room.roomNumber} 
                    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
                        <p className="text-sm text-gray-600">{room.roomType}</p>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(room.roomStatus)}
                        className={
                          room.roomStatus?.toLowerCase() === 'available' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 text-xs' 
                            : 'text-xs'
                        }
                      >
                        {room.roomStatus}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Guest:</span>
                        <span className="text-sm font-medium">{room.guestName || 'No guest'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Check-out:</span>
                        <span className="text-sm font-medium">{formatDate(room.checkOutDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {data.totalPages > 1 && !isSearchActive && (
                <div className="mt-4 flex justify-center">
                  <nav className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                        currentPage === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-0.5 sm:space-x-1">
                      {/* Show limited page numbers on mobile */}
                      {[...Array(data.totalPages)].map((_, index) => {
                        // On mobile, show current page, first, last, and adjacent pages
                        const showPage = index === 0 || 
                                       index === data.totalPages - 1 || 
                                       index === currentPage || 
                                       index === currentPage - 1 || 
                                       index === currentPage + 1;
                        
                        const showEllipsis = (index === currentPage - 2 && currentPage > 2) || 
                                           (index === currentPage + 2 && currentPage < data.totalPages - 3);
                        
                        if (!showPage && !showEllipsis) return null;
                        
                        if (showEllipsis) {
                          return <span key={index} className="px-1 text-gray-500">...</span>;
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                              currentPage === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            } cursor-pointer`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === data.totalPages - 1}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                        currentPage === data.totalPages - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default RoomStatusTable;