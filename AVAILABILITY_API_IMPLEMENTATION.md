# Room Availability API Implementation Guide

## Overview

This document describes how to implement the backend API endpoint for fetching room availability data, which is used by the `AvailabilityDatePicker` component to block unavailable dates during room booking.

## API Endpoint

### Primary Endpoint
```
GET /api/rooms/{roomId}/availability/month/{yearMonth}
```

### Fallback Endpoint (if primary doesn't exist)
```
GET /api/rooms/{roomId}/bookings/month/{yearMonth}
```

## Request Parameters

- `roomId` (path): The ID of the room to check availability for
- `yearMonth` (path): The month to check availability for (format: YYYY-MM)

## Response Format

The API should return one of the following response formats:

### Option 1: Array of Bookings
```json
[
  {
    "id": "booking_123",
    "checkInDate": "2025-01-15",
    "checkOutDate": "2025-01-18",
    "roomId": "room_456",
    "hotelId": "hotel_789"
  },
  {
    "id": "booking_124",
    "checkInDate": "2025-01-22",
    "checkOutDate": "2025-01-25",
    "roomId": "room_456",
    "hotelId": "hotel_789"
  }
]
```

### Option 2: Object with Bookings Array
```json
{
  "bookings": [
    {
      "id": "booking_123",
      "checkInDate": "2025-01-15",
      "checkOutDate": "2025-01-18",
      "roomId": "room_456",
      "hotelId": "hotel_789"
    }
  ],
  "totalBookings": 1,
  "month": "2025-01"
}
```

### Option 3: Direct Unavailable Dates
```json
{
  "unavailableDates": [
    "2025-01-15",
    "2025-01-16",
    "2025-01-17",
    "2025-01-22",
    "2025-01-23",
    "2025-01-24"
  ],
  "month": "2025-01"
}
```

## Backend Implementation (Java/Spring Boot)

### Controller
```java
@RestController
@RequestMapping("/api/rooms")
public class RoomAvailabilityController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("/{roomId}/availability/month/{yearMonth}")
    public ResponseEntity<?> getRoomAvailability(
            @PathVariable Long roomId,
            @PathVariable String yearMonth) {
        
        try {
            // Parse yearMonth (e.g., "2025-01")
            YearMonth month = YearMonth.parse(yearMonth);
            
            // Get all bookings for the room in the specified month
            List<Booking> bookings = bookingService.getBookingsByRoomAndMonth(roomId, month);
            
            // Return the bookings (frontend will process them)
            return ResponseEntity.ok(bookings);
            
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest()
                .body("Invalid month format. Use YYYY-MM format.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching room availability");
        }
    }
}
```

### Service Layer
```java
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getBookingsByRoomAndMonth(Long roomId, YearMonth yearMonth) {
        // Get start and end dates for the month
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();
        
        // Find all bookings that overlap with the month
        return bookingRepository.findBookingsByRoomAndDateRange(
            roomId, 
            startOfMonth, 
            endOfMonth
        );
    }
}
```

### Repository Layer
```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.roomId = :roomId " +
           "AND ((b.checkInDate <= :endDate AND b.checkOutDate >= :startDate) " +
           "OR (b.checkInDate >= :startDate AND b.checkInDate <= :endDate) " +
           "OR (b.checkOutDate >= :startDate AND b.checkOutDate <= :endDate))")
    List<Booking> findBookingsByRoomAndDateRange(
        @Param("roomId") Long roomId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
```

## Frontend Integration

The `AvailabilityDatePicker` component automatically:

1. **Fetches availability data** when the calendar opens
2. **Processes the response** to extract unavailable dates
3. **Blocks unavailable dates** from selection
4. **Handles errors gracefully** with fallback behavior
5. **Refreshes data** when month changes or manually requested

## Testing

### Test the API Endpoint
```bash
# Test with curl
curl -X GET "http://localhost:8080/api/rooms/123/availability/month/2025-01" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: Array of bookings or availability data
```

### Test the Frontend Component
1. Open a room booking dialog
2. Click on a date picker
3. Verify that unavailable dates are blocked
4. Check that loading states and error handling work
5. Test the refresh functionality

## Error Handling

The frontend component handles various error scenarios:

- **404 Not Found**: Tries fallback endpoint
- **Network errors**: Shows error message with retry button
- **Invalid data**: Gracefully falls back to no restrictions
- **Loading states**: Shows spinner during API calls

## Performance Considerations

1. **Caching**: Consider caching availability data for frequently accessed rooms
2. **Pagination**: For rooms with many bookings, consider paginating results
3. **Real-time updates**: Consider WebSocket updates for real-time availability changes
4. **Batch requests**: Consider batching multiple room availability requests

## Security

1. **Authentication**: Ensure the endpoint requires proper authentication
2. **Authorization**: Verify users can only check availability for rooms they have access to
3. **Rate limiting**: Implement rate limiting to prevent abuse
4. **Input validation**: Validate roomId and yearMonth parameters

## Future Enhancements

1. **Availability caching** with Redis
2. **Real-time updates** via WebSocket
3. **Bulk availability** for multiple rooms
4. **Availability trends** and analytics
5. **Integration with external** booking systems
