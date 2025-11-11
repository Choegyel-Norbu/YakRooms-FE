# 🔧 Backend Implementation Checklist - Price Manipulation Fix

**Priority**: CRITICAL  
**Deadline**: ASAP - This is a security vulnerability  
**Estimated Time**: 4-6 hours for implementation + testing

---

## 📋 Overview

The frontend has been updated to **STOP sending prices** in booking requests. Your backend MUST now:
1. Calculate all prices from the database
2. Ignore any client-provided prices
3. Log all transactions for audit
4. Validate all monetary transactions

---

## ✅ Implementation Checklist

### Phase 1: Price Recalculation (CRITICAL - Required)

#### [ ] 1.1 Update Booking Endpoint
**File**: `/api/bookings` endpoint (POST)

**What to do**:
```java
@PostMapping("/api/bookings")
public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
    // 1. Fetch room from database
    Room room = roomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new NotFoundException("Room not found"));
    
    // 2. Calculate price SERVER-SIDE (NEVER trust client)
    double serverPrice = calculateBookingPrice(room, request);
    double serviceTax = serverPrice * 0.03; // 3% service tax
    double txnTotalPrice = Math.ceil(serverPrice + serviceTax);
    
    // 3. Create booking with SERVER-calculated prices
    Booking booking = new Booking();
    booking.setTotalPrice(serverPrice);
    booking.setTxnTotalPrice(txnTotalPrice);
    // ... set other fields
    
    // 4. Initiate payment with SERVER price
    PaymentResponse payment = paymentService.initiatePayment(
        booking.getId(),
        txnTotalPrice  // ✅ Use SERVER price, never client
    );
    
    return ResponseEntity.ok(new BookingResponse(booking, payment));
}
```

**Helper method to add**:
```java
private double calculateBookingPrice(Room room, BookingRequest request) {
    double basePrice;
    
    if (request.isTimeBased()) {
        // Hourly booking: room price is per hour
        basePrice = room.getPrice();
    } else {
        // Regular booking: room price is per night
        long days = ChronoUnit.DAYS.between(
            request.getCheckInDate(),
            request.getCheckOutDate()
        );
        if (days < 1) days = 1; // Minimum 1 night
        basePrice = room.getPrice() * days;
    }
    
    // Apply number of rooms
    int numberOfRooms = request.getNumberOfRooms() != null 
        ? request.getNumberOfRooms() 
        : 1;
    basePrice *= numberOfRooms;
    
    return Math.ceil(basePrice);
}
```

**Testing**:
```bash
# Test 1: Normal booking
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: SESSION=..." \
  -d '{
    "roomId": 1,
    "hotelId": 1,
    "userId": 123,
    "checkInDate": "2025-11-15",
    "checkOutDate": "2025-11-17",
    "guests": 2,
    "numberOfRooms": 1,
    "phone": "17123456",
    "cid": "11234567890123",
    "initiatePayment": true
  }'

# Expected: Response with server-calculated totalPrice and txnTotalPrice
# NOT the values client might have sent
```

---

#### [ ] 1.2 Update Extension Endpoint
**File**: `/api/bookings/{id}/extend` endpoint (PUT)

**What to do**:
```java
@PutMapping("/api/bookings/{id}/extend")
public ResponseEntity<BookingResponse> extendBooking(
    @PathVariable Long id,
    @RequestBody ExtensionRequest request
) {
    // 1. Fetch existing booking
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Booking not found"));
    
    // 2. Fetch room to get current price
    Room room = booking.getRoom();
    
    // 3. Calculate extension price SERVER-SIDE
    double extensionPrice;
    if (booking.isTimeBased()) {
        // Hourly extension
        int additionalHours = request.getBookHour();
        extensionPrice = room.getPrice() * additionalHours;
    } else {
        // Date extension
        long additionalDays = ChronoUnit.DAYS.between(
            booking.getCheckOutDate(),
            request.getNewCheckOutDate()
        );
        extensionPrice = room.getPrice() * additionalDays;
    }
    
    double serviceTax = extensionPrice * 0.03;
    double totalWithTax = Math.ceil(extensionPrice + serviceTax);
    
    // 4. Initiate payment with SERVER-calculated price
    PaymentResponse payment = paymentService.initiatePayment(
        booking.getId(),
        totalWithTax  // ✅ SERVER price
    );
    
    // 5. Update booking
    booking.setExtendedAmount(extensionPrice);
    booking.setTxnTotalPrice(booking.getTxnTotalPrice() + totalWithTax);
    bookingRepository.save(booking);
    
    return ResponseEntity.ok(new BookingResponse(booking, payment));
}
```

---

#### [ ] 1.3 Update Subscription Payment Endpoint
**File**: `/api/subscriptions/payment` endpoint (POST)

**What to do**:
```java
@PostMapping("/api/subscriptions/payment")
public ResponseEntity<PaymentResponse> initiateSubscriptionPayment(
    @RequestBody SubscriptionPaymentRequest request
) {
    // 1. Fetch subscription plan from database
    SubscriptionPlan plan = subscriptionPlanRepository
        .findByName(request.getSubscriptionPlan())
        .orElseThrow(() -> new NotFoundException("Plan not found: " + request.getSubscriptionPlan()));
    
    // 2. Get price from database (NOT from client)
    double amount = plan.getPrice(); // ✅ From database
    
    // 3. If client sent an amount, log discrepancy for security monitoring
    if (request.getAmount() != null && 
        Math.abs(request.getAmount() - amount) > 0.01) {
        securityLogger.logSubscriptionPriceTampering(
            request.getUserId(),
            request.getAmount(),  // What client sent
            amount                // Correct price
        );
    }
    
    // 4. Initiate payment with DATABASE price
    PaymentResponse payment = paymentService.initiateSubscriptionPayment(
        request.getUserId(),
        request.getHotelId(),
        plan.getName(),
        amount  // ✅ From database
    );
    
    return ResponseEntity.ok(payment);
}
```

---

### Phase 2: Price Validation & Security Logging (CRITICAL - Required)

#### [ ] 2.1 Add Price Validation (Defense in Depth)

**Create validator**:
```java
@Component
public class PriceValidator {
    
    @Autowired
    private SecurityAuditService securityAuditService;
    
    /**
     * Validates client-provided price against server-calculated price.
     * Logs discrepancies for security monitoring.
     * 
     * @param clientPrice Price sent by client (may be null)
     * @param serverPrice Price calculated by server
     * @param bookingRequest The booking request
     * @throws SecurityException if price manipulation detected
     */
    public void validatePrice(
        Double clientPrice,
        double serverPrice,
        BookingRequest bookingRequest
    ) {
        // If client didn't send price, that's good (new secure frontend)
        if (clientPrice == null) {
            return;
        }
        
        // Calculate discrepancy
        double discrepancy = Math.abs(clientPrice - serverPrice);
        
        // Allow small floating-point differences
        if (discrepancy <= 1.0) {
            return; // Price is valid
        }
        
        // SECURITY ALERT: Price manipulation detected!
        boolean isSuspicious = clientPrice < serverPrice;
        
        securityAuditService.logPriceTampering(
            bookingRequest.getUserId(),
            bookingRequest.getRoomId(),
            clientPrice,
            serverPrice,
            discrepancy,
            isSuspicious
        );
        
        // Option 1: Reject the request (strict)
        if (isSuspicious) {
            throw new SecurityException(
                "Price validation failed. Please try again or contact support."
            );
        }
        
        // Option 2: Allow but log (permissive - use this during transition)
        logger.warn("Price mismatch detected but allowing: client={}, server={}", 
            clientPrice, serverPrice);
    }
}
```

**Use in booking endpoint**:
```java
@PostMapping("/api/bookings")
public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
    Room room = roomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new NotFoundException("Room not found"));
    
    double serverPrice = calculateBookingPrice(room, request);
    
    // Validate client price if provided
    priceValidator.validatePrice(
        request.getTotalPrice(),
        serverPrice,
        request
    );
    
    // Continue with server price...
}
```

---

#### [ ] 2.2 Create Security Audit Table

**SQL Migration**:
```sql
CREATE TABLE payment_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT,
    user_id BIGINT,
    room_id BIGINT,
    hotel_id BIGINT,
    
    -- Pricing information
    client_price DECIMAL(10, 2) COMMENT 'Price sent by client (if any)',
    server_price DECIMAL(10, 2) NOT NULL COMMENT 'Price calculated by server',
    actual_charged DECIMAL(10, 2) NOT NULL COMMENT 'Price actually charged',
    discrepancy DECIMAL(10, 2) COMMENT 'Difference between client and server',
    
    -- Request metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_fingerprint VARCHAR(255),
    
    -- Security flags
    suspicious BOOLEAN DEFAULT FALSE,
    action_taken VARCHAR(50) COMMENT 'ALLOWED, REJECTED, FLAGGED',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_suspicious (suspicious),
    INDEX idx_created_at (created_at)
);
```

**JPA Entity**:
```java
@Entity
@Table(name = "payment_audit_log")
public class PaymentAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booking_id")
    private Long bookingId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "room_id")
    private Long roomId;
    
    @Column(name = "hotel_id")
    private Long hotelId;
    
    @Column(name = "client_price")
    private Double clientPrice;
    
    @Column(name = "server_price", nullable = false)
    private Double serverPrice;
    
    @Column(name = "actual_charged", nullable = false)
    private Double actualCharged;
    
    @Column(name = "discrepancy")
    private Double discrepancy;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "request_fingerprint")
    private String requestFingerprint;
    
    @Column(name = "suspicious")
    private Boolean suspicious = false;
    
    @Column(name = "action_taken", length = 50)
    private String actionTaken;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Getters and setters...
}
```

**Service**:
```java
@Service
public class SecurityAuditService {
    
    @Autowired
    private PaymentAuditLogRepository auditRepository;
    
    public void logTransaction(
        Long bookingId,
        Long userId,
        Long roomId,
        Long hotelId,
        Double clientPrice,
        double serverPrice,
        double actualCharged,
        HttpServletRequest request
    ) {
        PaymentAuditLog log = new PaymentAuditLog();
        log.setBookingId(bookingId);
        log.setUserId(userId);
        log.setRoomId(roomId);
        log.setHotelId(hotelId);
        log.setClientPrice(clientPrice);
        log.setServerPrice(serverPrice);
        log.setActualCharged(actualCharged);
        
        if (clientPrice != null) {
            log.setDiscrepancy(Math.abs(clientPrice - serverPrice));
            log.setSuspicious(clientPrice < serverPrice);
        }
        
        log.setIpAddress(getClientIp(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setActionTaken("ALLOWED");
        
        auditRepository.save(log);
    }
    
    public void logPriceTampering(
        Long userId,
        Long roomId,
        double clientPrice,
        double serverPrice,
        double discrepancy,
        boolean suspicious
    ) {
        logger.warn("[SECURITY] Price tampering detected: userId={}, roomId={}, client={}, server={}, discrepancy={}",
            userId, roomId, clientPrice, serverPrice, discrepancy);
        
        // Log to database
        PaymentAuditLog log = new PaymentAuditLog();
        log.setUserId(userId);
        log.setRoomId(roomId);
        log.setClientPrice(clientPrice);
        log.setServerPrice(serverPrice);
        log.setActualCharged(serverPrice); // We use server price
        log.setDiscrepancy(discrepancy);
        log.setSuspicious(suspicious);
        log.setActionTaken("FLAGGED");
        
        auditRepository.save(log);
        
        // Send alert if discrepancy is large
        if (discrepancy > 1000) {
            alertService.sendSecurityAlert(
                "High-value price tampering detected",
                String.format("User %d attempted to pay %.2f instead of %.2f for room %d",
                    userId, clientPrice, serverPrice, roomId)
            );
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
```

---

### Phase 3: Anomaly Detection (Recommended)

#### [ ] 3.1 Implement Suspicious Pattern Detection

**Service**:
```java
@Service
public class FraudDetectionService {
    
    @Autowired
    private PaymentAuditLogRepository auditRepository;
    
    @Autowired
    private SecurityAlertService alertService;
    
    /**
     * Checks for suspicious booking patterns
     */
    public boolean isSuspiciousBooking(BookingRequest request, double serverPrice) {
        List<String> suspiciousReasons = new ArrayList<>();
        
        // Check 1: Client price significantly lower than server price
        if (request.getTotalPrice() != null && 
            request.getTotalPrice() < serverPrice * 0.5) {
            suspiciousReasons.add("Client price 50% below server price");
        }
        
        // Check 2: Suspiciously round numbers (1, 10, 100)
        if (request.getTotalPrice() != null) {
            double price = request.getTotalPrice();
            if (price == 1.0 || price == 10.0 || price == 100.0) {
                suspiciousReasons.add("Suspiciously round price");
            }
        }
        
        // Check 3: Multiple failed attempts from same user
        if (request.getUserId() != null) {
            long recentSuspiciousAttempts = auditRepository
                .countByUserIdAndSuspiciousTrueAndCreatedAtAfter(
                    request.getUserId(),
                    LocalDateTime.now().minusHours(1)
                );
            
            if (recentSuspiciousAttempts > 3) {
                suspiciousReasons.add("Multiple suspicious attempts in last hour");
            }
        }
        
        // Check 4: Unusual guest count
        if (request.getGuests() > 50) {
            suspiciousReasons.add("Unusually high guest count");
        }
        
        // If suspicious, log and alert
        if (!suspiciousReasons.isEmpty()) {
            logger.warn("[FRAUD DETECTION] Suspicious booking: reasons={}, request={}",
                suspiciousReasons, request);
            
            alertService.sendFraudAlert(
                "Suspicious booking pattern detected",
                "Reasons: " + String.join(", ", suspiciousReasons)
            );
            
            return true;
        }
        
        return false;
    }
}
```

---

### Phase 4: Testing (Required)

#### [ ] 4.1 Unit Tests

```java
@SpringBootTest
public class BookingPriceSecurityTest {
    
    @Autowired
    private BookingController bookingController;
    
    @Autowired
    private PaymentAuditLogRepository auditRepository;
    
    @Test
    public void testPriceManipulation_ShouldUseServerPrice() {
        // Arrange
        BookingRequest request = new BookingRequest();
        request.setRoomId(1L);
        request.setCheckInDate(LocalDate.now());
        request.setCheckOutDate(LocalDate.now().plusDays(2));
        request.setTotalPrice(1.0); // Tampered price
        request.setTxnTotalPrice(1.0);
        
        // Act
        BookingResponse response = bookingController.createBooking(request).getBody();
        
        // Assert
        assertNotNull(response);
        assertNotEquals(1.0, response.getBooking().getTotalPrice());
        assertTrue(response.getBooking().getTotalPrice() > 100); // Reasonable price
        
        // Verify audit log was created
        List<PaymentAuditLog> logs = auditRepository.findByBookingId(
            response.getBooking().getId()
        );
        assertEquals(1, logs.size());
        assertTrue(logs.get(0).getSuspicious());
    }
    
    @Test
    public void testNormalBooking_ShouldSucceed() {
        // Arrange
        BookingRequest request = new BookingRequest();
        request.setRoomId(1L);
        request.setCheckInDate(LocalDate.now());
        request.setCheckOutDate(LocalDate.now().plusDays(2));
        // No client price sent (new secure frontend)
        
        // Act
        BookingResponse response = bookingController.createBooking(request).getBody();
        
        // Assert
        assertNotNull(response);
        assertTrue(response.getBooking().getTotalPrice() > 0);
        
        // Verify audit log shows no suspicion
        List<PaymentAuditLog> logs = auditRepository.findByBookingId(
            response.getBooking().getId()
        );
        assertEquals(1, logs.size());
        assertFalse(logs.get(0).getSuspicious());
        assertNull(logs.get(0).getClientPrice()); // No client price sent
    }
}
```

#### [ ] 4.2 Integration Tests

```bash
# Test with curl
# 1. Normal booking (no client price)
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "checkInDate": "2025-11-15",
    "checkOutDate": "2025-11-17"
  }'
# Expected: Success with server-calculated price

# 2. Tampered price (should be ignored)
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "checkInDate": "2025-11-15",
    "checkOutDate": "2025-11-17",
    "totalPrice": 1
  }'
# Expected: Success with server-calculated price (not 1)

# 3. Check audit logs
curl http://localhost:8080/api/admin/security/audit?suspicious=true
# Expected: List of suspicious attempts
```

---

### Phase 5: Monitoring & Alerts (Recommended)

#### [ ] 5.1 Admin Dashboard Endpoints

```java
@RestController
@RequestMapping("/api/admin/security")
public class SecurityAdminController {
    
    @Autowired
    private PaymentAuditLogRepository auditRepository;
    
    @GetMapping("/audit")
    public List<PaymentAuditLog> getAuditLogs(
        @RequestParam(required = false) Boolean suspicious,
        @RequestParam(required = false) Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Specification<PaymentAuditLog> spec = Specification.where(null);
        
        if (suspicious != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("suspicious"), suspicious));
        }
        
        if (userId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("userId"), userId));
        }
        
        return auditRepository.findAll(spec, 
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        ).getContent();
    }
    
    @GetMapping("/stats")
    public SecurityStats getSecurityStats() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        long totalAttempts = auditRepository.countByCreatedAtAfter(last24Hours);
        long suspiciousAttempts = auditRepository.countBySuspiciousTrueAndCreatedAtAfter(last24Hours);
        double averageDiscrepancy = auditRepository.averageDiscrepancyByCreatedAtAfter(last24Hours);
        
        return new SecurityStats(totalAttempts, suspiciousAttempts, averageDiscrepancy);
    }
}
```

---

## 🎯 Final Verification

Before marking as complete, verify:

- [ ] All booking endpoints calculate prices from database
- [ ] No payment uses client-provided prices
- [ ] All transactions logged to `payment_audit_log`
- [ ] Suspicious attempts flagged and logged
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing with Postman/curl successful
- [ ] Admin can view audit logs
- [ ] Alerts configured for high-value discrepancies

---

## 📊 Success Metrics

After implementation, you should see:

- **0** successful price manipulations
- **100%** of payments using server-calculated prices
- **Full audit trail** of all payment attempts
- **Automatic alerts** for suspicious activity
- **No impact** on legitimate users

---

## 🚨 Deployment Notes

1. **Deploy backend first** (with price calculation)
2. **Test thoroughly** before deploying frontend
3. **Monitor logs** closely for first 24 hours
4. **Review audit logs** daily for first week
5. **Set up dashboards** for ongoing monitoring

---

## 📞 Questions?

Contact:
- Security Team: security@yakrooms.bt
- Backend Lead: backend-lead@yakrooms.bt
- Frontend Team: See `PRICE_MANIPULATION_FIX_SUMMARY.md`

---

*Created: November 10, 2025*  
*Priority: CRITICAL*  
*Estimated Time: 4-6 hours*

