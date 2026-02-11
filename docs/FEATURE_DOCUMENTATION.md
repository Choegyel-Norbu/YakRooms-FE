# YakRooms-FE (EzeeRoom Frontend) — Feature Documentation

This document describes **every user-facing feature and under-the-hood behavior** implemented in the YakRooms-FE frontend, as derived from the codebase. It is intended for developers, product managers, and designers.

---

## Table of Contents

1. [Authentication & Session Management](#1-authentication--session-management)
2. [Navigation & Layout System](#2-navigation--layout-system)
3. [Hotel Room Search & Filtering](#3-hotel-room-search--filtering)
4. [Room Detail Views](#4-room-detail-views)
5. [Booking UI & Flow](#5-booking-ui--flow)
6. [User Profile & Account](#6-user-profile--account)
7. [Hotel Owner Dashboard](#7-hotel-owner-dashboard)
8. [Guest Dashboard](#8-guest-dashboard)
9. [Super Admin](#9-super-admin)
10. [Subscription & Payment](#10-subscription--payment)
11. [Notifications, Alerts & Toasts](#11-notifications-alerts--toasts)
12. [Forms, Inputs & Validation](#12-forms-inputs--validation)
13. [State Management & API Interaction](#13-state-management--api-interaction)
14. [Theming & UI Configuration](#14-theming--ui-configuration)
15. [PWA & Offline](#15-pwa--offline)
16. [Landing & Marketing Pages](#16-landing--marketing-pages)

---

## 1. Authentication & Session Management

### 1.1 Google Sign-In (Firebase)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Google Sign-In |
| **Description** | Users sign in or register via Google OAuth (Firebase Auth). Supports both cookie-based auth (same-domain / macOS Safari) and cross-domain token auth (iOS WebKit). |
| **User roles** | All (guest → becomes authenticated user with assigned roles). |
| **Trigger points** | Navbar "Login / Register" button; List Your Property CTA when unauthenticated; any protected action that opens `LoginModal`. |
| **Behavior** | `GoogleSignInButton` uses `signInWithPopup`, gets Firebase ID token, then POSTs to `/auth/firebase` or `/auth/firebase-cross-domain`. Backend returns user + roles; tokens stored in localStorage only for iOS cross-domain; otherwise HTTP-only cookies. Auth state persisted via `safariLocalStorage` (localStorage wrapper). |
| **Dependencies** | `firebaseConfig.js` (Firebase app, auth, Google provider), `authDetection.js`, `tokenStorage.js`, `AuthProvider`, API `POST /auth/firebase` or `POST /auth/firebase-cross-domain`. |
| **Edge cases** | iOS: cross-domain forces localStorage + `X-Access-Token` header; macOS Safari uses cookies. 401/403 from API trigger global logout. Login modal shows error/success alerts; Terms & Privacy links in modal. |
| **Related files** | `features/authentication/GoogleSignInButton.jsx`, `LoginModal.jsx`, `AuthProvider.jsx`, `shared/services/firebaseConfig.js`, `shared/utils/authDetection.js`, `shared/utils/tokenStorage.js`, `shared/utils/safariLocalStorage.js`. |

### 1.2 Auth Context & Session Persistence

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Auth state & session persistence |
| **Description** | Central auth state (user, roles, active role, hotel selection, subscription cache) in React Context; persisted in localStorage; validated once on load via `/auth/status`. |
| **User roles** | Authenticated users only (all roles). |
| **Trigger points** | App load; login; logout; storage events (cross-tab sync). |
| **Behavior** | `AuthProvider` initializes from localStorage; calls `GET /auth/status` when app thinks user is authenticated. On success, updates storage and state (including `hotelIds`, `selectedHotelId`). On 401/403, clears auth (and tokens if cross-domain). Logout calls `POST /auth/logout` and clears storage except `topHotelIds`, `hotelIds`, `userHotels`. `storage` event syncs logout across tabs. |
| **Dependencies** | `Api.jsx` (interceptors), `subscriptionService`, `tokenStorage`, `safariLocalStorage`. |
| **Edge cases** | Roles/hotelIds stored as JSON; parsers handle string/array. Subscription data fetched only for HOTEL_ADMIN/MANAGER. Session ID in sessionStorage used to avoid refetching subscription every tab load. |
| **Related files** | `features/authentication/AuthProvider.jsx`, `shared/services/Api.jsx`, `shared/services/subscriptionService.js`. |

### 1.3 Role Switching & Hotel Selection

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Role switch & hotel selection |
| **Description** | Users with multiple roles can switch active role (SUPER_ADMIN, HOTEL_ADMIN, MANAGER, STAFF, FRONTDESK, GUEST). Hotel staff can select which hotel to manage when they have multiple. |
| **User roles** | Users with multiple roles; hotel staff with multiple hotels. |
| **Trigger points** | Navbar avatar dropdown "Switch Role"; "Dashboard" when staff has no/ invalid selected hotel opens `HotelSelectionDialog`. |
| **Behavior** | `setActiveRole` updates storage and context. Switching to hotel role may open hotel selection dialog if no valid `selectedHotelId`. `setSelectedHotelId` updates context and refreshes subscription for that hotel. Toast confirms role switch. |
| **Dependencies** | `AuthProvider` (`switchToRole`, `setSelectedHotelId`, `fetchUserHotels`), `HotelSelectionDialog`, Navbar. |
| **Edge cases** | HOTEL_ADMIN only shown in role list if user has valid hotel data. Dashboard redirect uses `getCurrentActiveRole()` and sends to `/adminDashboard`, `/hotelAdmin`, or `/guestDashboard`. |
| **Related files** | `layouts/Navbar.jsx`, `shared/components/HotelSelectionDialog.jsx`, `features/authentication/AuthProvider.jsx`. |

### 1.4 Protected Routes & Unauthorized Page

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Protected routes & unauthorized handling |
| **Description** | Routes gated by auth and role; unauthenticated users redirected to `/`; wrong role to `/unauthorized`. |
| **User roles** | N/A (defines who can access which route). |
| **Trigger points** | Visiting any protected path (e.g. `/dashboard`, `/hotelAdmin`, `/addListing`, `/subscription`). |
| **Behavior** | `ProtectedRoute` uses `useAuth()`; if not authenticated → `Navigate to="/"`; if authenticated but `allowedRoles` doesn’t include user role → `Navigate to="/unauthorized"`. `DashboardRoute` redirects to role-specific dashboard. Unauthorized page shows "Access Denied" and "Go Back" button. |
| **Dependencies** | `react-router-dom`, `useAuth`. |
| **Edge cases** | Lazy-loaded route components; `Suspense` with `RouteLoadingFallback` (SimpleSpinner). |
| **Related files** | `routes/AppRouting.jsx`. |

---

## 2. Navigation & Layout System

### 2.1 App Routing & Lazy Loading

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Route definitions & code splitting |
| **Description** | All main route components are lazy-loaded. Public routes: `/`, `/aboutus`, `/faqs`, `/hotels`, `/hotel/:id`, `/privacy-policy`, `/terms-and-conditions`, `/payment/status`. Protected routes and dashboard redirect documented in Auth section. |
| **User roles** | All (public vs role-based as per route). |
| **Trigger points** | Link navigation, programmatic `navigate()`. |
| **Behavior** | `React.lazy()` for each page; `Suspense` with full-screen spinner. Catch-all `*` → `Navigate to="/"`. |
| **Dependencies** | `react-router-dom`, `SimpleSpinner`. |
| **Related files** | `routes/AppRouting.jsx`, `shared/components/SimpleSpinner.jsx`. |

### 2.2 Navbar

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Global navbar |
| **Description** | Fixed top navbar with logo, nav links (Home, Hotels, List Property, Contact, About Us), theme toggle (present but commented out), login/user avatar, mobile sheet menu. |
| **User roles** | All. |
| **Trigger points** | Always visible (or hidden on scroll-down on listing/landing); "List Property" scrolls to `#list-your-property` on `/` or navigates then scrolls; Contact scrolls to footer. |
| **Behavior** | Scroll-based visibility: show when scroll &lt; 10 or scrolling up; hide when scrolling down. Mobile: hamburger opens right sheet with same links, legal (Terms, Privacy), contact (Email, Info), logout. Authenticated: avatar dropdown with user name, email, current role, Dashboard, Switch Role, Log out. Logout opens confirmation dialog. |
| **Dependencies** | `useAuth`, `EzeeRoomLogo`, `HotelSelectionDialog`, Radix Sheet/Dropdown/Dialog, sonner toast. |
| **Edge cases** | Scrollbar width compensation to avoid layout shift. List Property link underlined when section in view. |
| **Related files** | `layouts/Navbar.jsx`, `shared/components/EzeeRoomLogo.jsx`, `shared/components/HotelSelectionDialog.jsx`. |

### 2.3 Footer

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Site footer |
| **Description** | Footer with logo, tagline, social (Facebook, TikTok), Quick Links (Home, Book Hotels, About Us), Support (FAQs, Contact), optional contact info; legal and version. |
| **User roles** | All. |
| **Trigger points** | Rendered on Landing and other full-width pages. |
| **Behavior** | Responsive grid; external links open in new tab. |
| **Related files** | `layouts/Footer.jsx`. |

### 2.4 Root Path Handler

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Root path / Safari routing fix |
| **Description** | Handles hash-based legacy routes (`#/` → path) and Safari/iOS root path edge cases (no redirect, single-run guard). |
| **Related files** | `components/RootPathHandler.jsx`. |

---

## 3. Hotel Room Search & Filtering

### 3.1 Hotel Listing Page

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Hotel listing with search, filters, sort, pagination |
| **Description** | Lists hotels from API with district, locality, hotel type filters, sort (default, price high/low), and pagination. Supports "nearby" search via URL params (lat, lon, radius). |
| **User roles** | Guest, unauthenticated. |
| **Trigger points** | Route `/hotels`; links from landing "Start Exploring" or hero search; URL params for initial filters or nearby. |
| **Behavior** | Initial load: read `district`, `hotelType`, or `lat`/`lon`/`radius` from URL; one fetch. Search: debounced (500 ms) for district/locality/type; sort change triggers immediate fetch. Pagination and radius change (nearby) trigger new fetch. Request deduplication and AbortController cancel previous request. Response: `content[0].content` or `content`; nearby uses nested structure. Distance shown when user location available. |
| **Dependencies** | `api.get` (`/hotels/list`, `/hotels/search`, `/hotels/sortedByHighestPrice`, `/hotels/sortedByLowestPrice`, `/hotels/nearby`), `shared/constants/nearbySearch.js`, `shared/utils` (parseCoordinates, calculateDistance), districts/localities. |
| **Edge cases** | Invalid lat/lon in URL: toast error, clear nearby. Loading/skeleton state. Empty results. Navbar hide on scroll-down. Mobile: single dropdown for district/locality/type. |
| **Related files** | `features/hotel/HotelListingPage.jsx`, `shared/constants/nearbySearch.js`, `shared/utils/geoUtils.js`, `shared/utils/utils.js`. |

### 3.2 Hero Search (Landing)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Hero search by district or nearby |
| **Description** | On landing, user can search by district (text) or "Search nearby" (geolocation). |
| **User roles** | All. |
| **Trigger points** | Hero section: district input + "Search Stays" or "Search nearby". |
| **Behavior** | District: letters-only validation; `navigate(/hotels?district=...)`. Nearby: `navigator.geolocation.getCurrentPosition`; on success `navigate(/hotels?lat=&lon=&radius=)`; on error toast (permission denied, unavailable, timeout, low accuracy). Loading toast while getting location. |
| **Dependencies** | `DEFAULT_NEARBY_RADIUS` from `nearbySearch.js`, sonner. |
| **Related files** | `features/landing/HeroLG.jsx`. |

### 3.3 Filter Sidebar (Legacy)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Filter sidebar (district + hotel type) |
| **Description** | Sidebar with district input, hotel type select (Resort, Hotel, Guesthouse, Homestay, Boutique Hotel), "Search Stays" and "Back to Home". Used in contexts that pass `searchParams` and `onSearchClick`. |
| **Related files** | `features/hotel/FilterSidebar.jsx`, `shared/components/SearchButton.jsx`. |

---

## 4. Room Detail Views

### 4.1 Hotel Details Page

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Single hotel and room details |
| **Description** | Full hotel page: hero image, name, location, rating, check-in/out times, description, amenities, map, room list with images and pricing. Each room has `RoomBookingCard` for booking. |
| **User roles** | All (booking may require login). |
| **Trigger points** | Route `/hotel/:id`; links from listing cards. |
| **Behavior** | Fetch hotel by id; room image carousel (manual + auto 5s, keyboard arrows, click to modal). Amenities icons by category. Map via `HotelMap`. Room cards show price, "Book now" / "Immediate booking" / "Time-based booking" where applicable. Share, back to list. |
| **Dependencies** | `api` (hotel, rooms), `RoomBookingCard`, `HotelMap`, `star-rating`, Radix UI. |
| **Edge cases** | No images placeholder. Loading spinner. Responsive layout and mobile sheet for room details. |
| **Related files** | `features/hotel/HotelDetailsPage.jsx`, `shared/components/HotelMap.jsx`, `features/booking/RoomBookingCard.jsx`, `shared/components/star-rating.jsx`. |

---

## 5. Booking UI & Flow

### 5.1 Room Booking Card (date-based & immediate)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Room booking: date-based and immediate |
| **Description** | Per-room booking: date range picker (check-in/out), guests, rooms count, phone, CID, origin/destination, Bhutanese toggle. Optional "Immediate booking" (today) and "Time-based booking" (hourly). |
| **User roles** | Guest (or any; login prompted if not authenticated). |
| **Trigger points** | "Book now" / "Check availability" on hotel details page. |
| **Behavior** | Unauthenticated: can open dialog but may be prompted to log in (`LoginModal`). Fetches `/rooms/:id/booked-dates` (booked dates + time-based slots); disables dates and today immediate availability using that data. Validation on required fields; Bhutanese/CID/origin/destination as per form. Submit creates booking via API; on success opens `BookingSuccessModal` or payment redirect. Role switch prompt if user has hotel role when trying to book as guest. |
| **Dependencies** | `api`, `CustomDatePicker`, `BookingSuccessModal`, `TimeBasedBookingDialog`, `PaymentDialog`, `handlePaymentRedirect`, `LoginModal`, auth context. |
| **Edge cases** | 401/403 on booked-dates: toast, assume available. Today immediate: disabled if today booked or afternoon time-based or tomorrow conflict with checkout. |
| **Related files** | `features/booking/RoomBookingCard.jsx`, `shared/components/BookingSuccessModal.jsx`, `shared/components/CustomDatePicker.jsx`, `shared/components/PaymentDialog.jsx`, `features/booking/TimeBasedBookingDialog.jsx`, `shared/utils/paymentRedirect.js`. |

### 5.2 Time-based (Hourly) Booking

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Time-based booking dialog |
| **Description** | Book a room by date and time slot (check-in/out time) for same-day or multi-day hourly use. |
| **User roles** | Guest. |
| **Trigger points** | "Time-based booking" in `RoomBookingCard`. |
| **Behavior** | Date + time pickers; validation against existing time-based and overnight bookings; submit to API; success/payment flow same as main booking. |
| **Related files** | `features/booking/TimeBasedBookingDialog.jsx`, `shared/hooks/useTimeBasedBooking.js`. |

### 5.3 Payment Redirect & Status

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Payment redirect and status page |
| **Description** | After initiating payment, user is sent to gateway (form POST or URL). Return URL lands on `/payment/status` with `type`, `status`, `bookingId`/`subscriptionId`, `orderNumber`. Page shows success/failed/cancelled/unknown and auto-redirects after 10s. |
| **User roles** | All (post-payment). |
| **Trigger points** | Return from payment gateway to `/payment/status?...`. |
| **Behavior** | `PaymentStatusPage` reads query params; maps status to icon/title/message; button "View Details" / "Try Again" / "Go Back" calls `handleRedirect()`: subscription → `/subscription`, extension → `/guestDashboard`, booking → role-based (guest → guestDashboard, hotel → hotelAdmin, else dashboard). Countdown 10s then auto redirect. |
| **Dependencies** | `paymentRedirect.js` (form/URL redirect helpers), auth `getCurrentActiveRole`. |
| **Related files** | `features/payment/PaymentStatusPage.jsx`, `shared/utils/paymentRedirect.js`. |

### 5.4 Booking Success Modal

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Booking success confirmation |
| **Description** | Modal after successful booking (when no payment redirect): booking details, receipt download option. |
| **Related files** | `shared/components/BookingSuccessModal.jsx`. |

---

## 6. User Profile & Account

### 6.1 Profile Display in Navbar

| Attribute | Description |
|-----------|-------------|
| **Feature name** | User profile in navbar |
| **Description** | Avatar (with fallback initial), user name, email, current role label; Dashboard and Switch Role in dropdown; Log out with confirmation. |
| **Related files** | `layouts/Navbar.jsx`, `shared/components/avatar.jsx`. |

### 6.2 Account Deletion

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Hotel account deletion request |
| **Description** | HOTEL_ADMIN can request account/hotel deletion from `/account-deletion`. Request sent to backend; confirmation and warnings shown. |
| **User roles** | HOTEL_ADMIN. |
| **Related files** | `features/hotel/AccountDeletionPage.jsx`. |

---

## 7. Hotel Owner Dashboard

### 7.1 Hotel Admin Dashboard Overview

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Hotel admin dashboard |
| **Description** | Main dashboard for hotel staff: tabs (Dashboard, Bookings, Rooms, Staff, Verification, Leave, Billing, Settings, Help). Uses `selectedHotelId`; shows selected hotel name and subscription state. Subscription expiration banner when applicable. |
| **User roles** | HOTEL_ADMIN, STAFF, MANAGER, FRONTDESK. |
| **Trigger points** | Route `/hotelAdmin`; Dashboard link in navbar when hotel role selected. |
| **Behavior** | Fetches hotel, bookings, notifications; multi-hotel users get hotel switcher. Passcode verification for sensitive actions. Receipts/invoices tabs with pagination. |
| **Dependencies** | `useAuth`, `getSelectedHotel`, `api`, `SubscriptionExpirationNotification`, `uploadFile`, `receiptGenerator`, `subscriptionUtils`. |
| **Related files** | `features/hotel/HotelAdminDashboard.jsx`, `shared/components/SubscriptionExpirationNotification.jsx`. |

### 7.2 Dashboard Tab (Summary, Charts)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Dashboard summary and charts |
| **Description** | Summary cards; bookings trend chart; monthly performance chart. |
| **Related files** | `features/hotel/HotelAdminDashboard.jsx`, `BookingsTrendChart.jsx`, `MonthlyPerformanceChart.jsx`. |

### 7.3 Bookings Management

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Bookings table and admin booking form |
| **Description** | List bookings; create booking via `AdminBookingForm`; filters and actions. `BookingCalendar` shows calendar view of bookings per room/month. |
| **Related files** | `features/hotel/BookingTable.jsx`, `features/hotel/AdminBookingForm.jsx`, `features/hotel/BookingCalendar.jsx`, `BookingsInventoryTable.jsx`. |

### 7.4 Cancellation Requests

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Cancellation requests table |
| **Description** | Table of guest cancellation requests; approve/reject actions. |
| **Related files** | `features/hotel/CancellationRequestsTable.jsx`. |

### 7.5 Room Management

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Room CRUD and status |
| **Description** | Add/edit/delete rooms; room status table. Uses `RoomItemForm`, `RoomStatusTable`, `RoomDeletionDialog`. |
| **Related files** | `features/hotel/HotelAdminDashboard.jsx`, `features/admin/RoomManager.jsx`, `features/hotel/RoomItemForm.jsx`, `features/hotel/RoomStatusTable.jsx`, `shared/components/RoomDeletionDialog.jsx`. |

### 7.6 Staff Management

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Staff list and management |
| **Description** | List staff; add/invite; role assignment; card grid view. |
| **Related files** | `features/hotel/StaffManager.jsx`, `features/admin/StaffCardGrid.jsx`. |

### 7.7 Verification (CID & Passcode)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | CID verification and passcode |
| **Description** | Tabs for CID verification (guest ID) and passcode verification. Denied cases: upload trade license / ID proof; submit for re-review. |
| **Related files** | `features/hotel/CIDVerification.jsx`, `features/hotel/PasscodeVerification.jsx`, `uploadService.jsx`. |

### 7.8 Leave Management

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Leave requests and notifications |
| **Description** | Staff leave requests; list and approve/reject; leave notification count in header. |
| **Related files** | `features/hotel/LeaveManagement.jsx`, `components/ui/leave-management-tabs.jsx`. |

### 7.9 Billing (Receipts & Invoices)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Receipts and invoices |
| **Description** | Paginated receipts and invoices; download/generate via `receiptGenerator`. |
| **Related files** | `features/hotel/HotelAdminDashboard.jsx`, `shared/utils/receiptGenerator.js`. |

### 7.10 Hotel Info & Settings

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Hotel profile and settings |
| **Description** | Edit hotel info (name, contact, address, check-in/out, policies, etc.) via `HotelInfoForm`; photo upload. |
| **Related files** | `features/hotel/HotelInfoForm.jsx`, `uploadService.jsx`. |

### 7.11 QR Code Scanner & Scanned Booking

| Attribute | Description |
|-----------|-------------|
| **Feature name** | QR scan and booking display |
| **Description** | Scan guest QR to fetch and show booking in modal. |
| **Related files** | `features/hotel/QRCodeScanner.jsx`, `features/hotel/ScannedBookingModal.jsx`, `shared/components/QRCodeGenerator.jsx`. |

### 7.12 User Manual / Help

| Attribute | Description |
|-----------|-------------|
| **Feature name** | In-app help |
| **Description** | Route `/help` shows user manual for hotel staff. |
| **Related files** | `features/hotel/UserManual.jsx`. |

---

## 8. Guest Dashboard

### 8.1 Guest Dashboard Overview

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Guest dashboard |
| **Description** | List guest’s bookings with status (CONFIRMED, PENDING, CANCELLED, etc.); actions: directions, extend, cancel, review. Extension opens payment redirect when applicable. |
| **User roles** | GUEST. |
| **Trigger points** | Route `/guestDashboard`; Dashboard in navbar when guest role. |
| **Behavior** | Fetch bookings by user; status badges and per-status actions. Cancel opens confirmation; cancellation request sent. After checkout, "Review" opens `HotelReviewSheet`. Receipt download via `receiptGenerator`. Skeleton loading. |
| **Dependencies** | `api`, `handlePaymentRedirect`, `CustomDatePicker`, `HotelReviewSheet`, `receiptGenerator`, `AlertDialog`. |
| **Related files** | `features/guest/GuestDashboard.jsx`, `features/hotel/HotelReviewSheet.jsx`, `shared/utils/receiptGenerator.js`. |

### 8.2 Guest Room Management (Listings)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Guest’s own listings (as owner) |
| **Description** | When guest also has property listings, manage them (e.g. room management). |
| **Related files** | `features/guest/RoomManagement.jsx`. |

---

## 9. Super Admin

### 9.1 Super Admin Dashboard

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Super admin panel |
| **Description** | Tabs: Hotels (verify/deny), Notifications, Deletion requests, Reviews, Feedbacks, Bookings, Subscriptions, Users. Verify/deny hotel with remarks; deny opens dialog for remarks and optional document upload. Export to Excel. |
| **User roles** | SUPER_ADMIN. |
| **Trigger points** | Route `/adminDashboard`; Dashboard when super admin role. |
| **Behavior** | Fetch hotels (pending verification), notifications, deletion requests, reviews, feedbacks, bookings, subscriptions, users. Pagination where applicable. Verify hotel; deny with reason; deletion approve/reject. Export via `xlsx`. Click-outside to close notification panel. |
| **Dependencies** | `api`, `exportToExcel`, `SuperAdminTabs`, Radix UI. |
| **Related files** | `features/admin/SuperAdmin.jsx`, `components/ui/super-admin-tabs.jsx`, `shared/utils/utils.js` (exportToExcel). |

---

## 10. Subscription & Payment

### 10.1 Subscription Page

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Subscription plans and payment |
| **Description** | For HOTEL_ADMIN/MANAGER: view trial/PRO state; subscribe or renew; redirect to payment gateway. Uses `selectedHotelId` or `newHotelId` from sessionStorage (new property). |
| **User roles** | HOTEL_ADMIN, MANAGER. |
| **Trigger points** | Route `/subscription`; links from dashboard or post-signup. |
| **Behavior** | `fetchSubscriptionData` on mount/selectedHotelId change. Cards for Free/Trial Expired, Trial, PRO with pricing; CTA triggers payment redirect. Payment return → `/payment/status?type=subscription` then redirect to subscription or dashboard. |
| **Dependencies** | `useAuth`, `subscriptionService`, `handlePaymentRedirect`, `subscriptionUtils`, `getStorageItem`. |
| **Related files** | `features/subscription/SubscriptionPage.jsx`, `features/subscription/SubscriptionContext.jsx`, `shared/services/subscriptionService.js`, `shared/utils/subscriptionUtils.js`. |

### 10.2 Subscription Management (Shared)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Subscription management UI |
| **Description** | View/change plan; billing info; cancel or renew. |
| **User roles** | HOTEL_ADMIN, STAFF, MANAGER. |
| **Related files** | `shared/components/SubscriptionManagement.jsx`. |

### 10.3 Subscription Expiration Banner

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Subscription expiration notification |
| **Description** | Banner when subscription expires in ≤7 days (and not yet expired). Different copy for trial vs PRO; "Subscribe now" CTA. Rendered in hotel admin dashboard. |
| **Related files** | `shared/components/SubscriptionExpirationNotification.jsx`, `shared/utils/subscriptionUtils.js`. |

### 10.4 Payment Dialog

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Payment confirmation / redirect dialog |
| **Description** | Modal before redirecting to payment gateway: amount, order info, confirm/cancel. On confirm calls `handlePaymentRedirect`. |
| **Related files** | `shared/components/PaymentDialog.jsx`, `shared/utils/paymentRedirect.js`. |

---

## 11. Notifications, Alerts & Toasts

### 11.1 Toast (Sonner + React-Toastify)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Global toasts |
| **Description** | Success, error, info, warning, loading toasts. Sonner: top-center, 6s, close button. React-Toastify container also mounted. |
| **Trigger points** | API errors (e.g. timeout in Api interceptor), validation errors, success messages (login, role switch, connection restored, etc.). |
| **Behavior** | `toast.success/error/info/warning/loading` from `sonner`; `toast.dismiss(id)` for loading. Api interceptor shows timeout toast. |
| **Related files** | `App.jsx` (Toaster, ToastContainer), `shared/services/Api.jsx`, various feature files. |

### 11.2 Offline Toast

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Offline indicator |
| **Description** | When browser goes offline, custom offline toast is shown; when back online it hides and Sonner shows "Connection Restored". |
| **Related files** | `shared/components/InternetConnectionMonitor.jsx`, `shared/components/CustomOfflineToast.jsx`, `shared/utils/internetConnection.js`. |

### 11.3 In-App Notifications (Hotel & Admin)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Notification bell and panel |
| **Description** | Hotel admin and super admin have notification icon; click opens panel with list; mark read; unread count. |
| **Related files** | `features/hotel/HotelAdminDashboard.jsx`, `features/admin/SuperAdmin.jsx`, `shared/components/NotificationsComponent.jsx` (if used). |

### 11.4 Alert Dialogs

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Confirm/cancel dialogs |
| **Description** | Logout confirm, delete confirm, cancel booking confirm, etc. via Radix AlertDialog. |
| **Related files** | `shared/components/alert-dialog.jsx`, Navbar, GuestDashboard, etc. |

---

## 12. Forms, Inputs & Validation

### 12.1 Add Listing (Property Registration)

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Multi-step add property |
| **Description** | Stepped form: basic info (name, description, district, locality, address, contact, type), location (lat/lon, optional geolocation), rooms, policies (cancellation predefined or custom), check-in/out times, amenities, photos, bank details, CID/origin/destination. Time-based booking toggle. Submit creates hotel and rooms; success sets `newHotelId` in sessionStorage and can redirect to subscription. |
| **User roles** | GUEST, HOTEL_ADMIN, STAFF, MANAGER, FRONTDESK. |
| **Trigger points** | Route `/addListing`; "List your property" when authenticated. |
| **Behavior** | District/locality from `shared/constants` (districts.js); amenities from `amenitiesHelper`; bank validation (account number length by bank); file upload via `uploadService`. Validation errors per field; optional geolocation with error state. |
| **Dependencies** | `api`, `uploadFile`, `districts`, `amenitiesHelper`, `getBankOptions`, `validateBankAccountNumber`, `setStorageItem`. |
| **Related files** | `features/hotel/AddListingPage.jsx`, `shared/constants/index.js`, `shared/utils/amenitiesHelper.js`, `shared/services/uploadService.jsx`. |

### 12.2 Shared Form Primitives

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Inputs, select, checkbox, textarea, label |
| **Description** | Shared components for forms: Input, Label, Select, Checkbox, Textarea, TimePicker, CustomDatePicker, Switch. |
| **Related files** | `shared/components/input.jsx`, `label.jsx`, `select.jsx`, `checkbox.jsx`, `textarea.jsx`, `TimePicker.jsx`, `CustomDatePicker.jsx`, `switch.jsx`, `form.jsx`. |

### 12.3 Validation Patterns

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Client-side validation |
| **Description** | District letters-only (Hero); required fields and formats in booking and add listing; bank account length; coordinates parsing. Error state per field and toast for API errors. |
| **Related files** | `HeroLG.jsx`, `RoomBookingCard.jsx`, `AddListingPage.jsx`, `shared/constants/bankTypes.js`, `shared/utils/geoUtils.js`. |

---

## 13. State Management & API Interaction

### 13.1 Redux Store

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Redux store |
| **Description** | Store has `counter` and `auth` slices. Auth slice holds token, userId, email, userName, role, pictureURL, registerFlag, clientDetailSet; syncs to localStorage. Primary auth state is in React Context (`AuthProvider`); Redux auth is legacy/secondary. |
| **Related files** | `shared/services/store.jsx`, `shared/services/counterSlice.jsx`, `features/authentication/authSlice.jsx`, `main.jsx` (Provider). |

### 13.2 API Client

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Axios API client |
| **Description** | Base URL from `firebaseConfig.js` (env or default dev/prod). Request interceptor: public endpoints get `withCredentials: true`; authenticated: if localStorage tokens then `X-Access-Token`, else credentials. Response: 401/403 call `window.authLogout()` (set by AuthProvider); timeout shows toast. Public endpoints list in `Api.jsx`. |
| **Related files** | `shared/services/Api.jsx`, `shared/services/firebaseConfig.js`. |

### 13.3 Subscription Context

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Subscription provider |
| **Description** | Wraps app with subscription state/refresh; used alongside auth subscription cache. |
| **Related files** | `features/subscription/SubscriptionContext.jsx`, `App.jsx`. |

---

## 14. Theming & UI Configuration

### 14.1 Theme Toggle

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Light/dark theme |
| **Description** | Navbar theme toggle (Sun/Moon); sets `theme` state and applies class to `document.documentElement` (`light`/`dark`). Currently theme toggle is hidden in navbar (commented). |
| **Related files** | `layouts/Navbar.jsx`, `layouts/mode-toggle.jsx`, `index.css`. |

### 14.2 Tailwind & CSS

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Styling stack |
| **Description** | Tailwind CSS; `index.css` and `assets/css/custom.css`; shadcn-style components (button, card, dialog, etc.). |
| **Related files** | `index.css`, `App.css`, `assets/css/custom.css`, `tailwind.config.js`, `components.json`. |

---

## 15. PWA & Offline

### 15.1 Service Worker & Install Prompt

| Attribute | Description |
|-----------|-------------|
| **Feature name** | PWA registration and install prompt |
| **Description** | `virtual:pwa-register` registers service worker; on update `onNeedRefresh` triggers reload. Install prompt component can suggest "Add to Home Screen" when applicable. |
| **Trigger points** | App load; browser install prompt event. |
| **Related files** | `modules/pwa/PWARegistration.jsx`, `modules/pwa/components/InstallPrompt.jsx`, `modules/pwa/hooks/useInstallPrompt.js`, `App.jsx`. |

### 15.2 Offline Detection

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Online/offline detection |
| **Description** | `internetConnection` utility listens to `online`/`offline` and notifies callbacks; used by `InternetConnectionMonitor` to show/hide offline toast. |
| **Related files** | `shared/utils/internetConnection.js`, `shared/components/InternetConnectionMonitor.jsx`. |

---

## 16. Landing & Marketing Pages

### 16.1 Landing Page

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Landing page |
| **Description** | Sections: Hero (HeroLG), PropertyTypeSection, FeatureSection, TopHighlightsSection, ListYourPropertySection, Footer. Navbar with scroll-hide behavior. Login modal trigger; contact scroll to footer. Sticky social icons. |
| **Related files** | `features/landing/Landing.jsx`, `features/landing/HeroLG.jsx`, `FeatureSection.jsx`, `PropertyTypeSection.jsx`, `TopHighlightsSection.jsx`, `ListYourPropertySection.jsx`, `shared/components/StickySocialIcons.jsx`. |

### 16.2 List Your Property Section

| Attribute | Description |
|-----------|-------------|
| **Feature name** | List property CTA |
| **Description** | Benefits and stats; CTA button. If not authenticated, click opens login modal; else navigates to add listing or scroll to section. |
| **Related files** | `features/landing/ListYourPropertySection.jsx`. |

### 16.3 Static & Legal Pages

| Attribute | Description |
|-----------|-------------|
| **Feature name** | About, FAQs, Privacy, Terms |
| **Description** | Routes: `/aboutus`, `/faqs`, `/privacy-policy`, `/terms-and-conditions`. Content-only pages. |
| **Related files** | `features/landing/AboutUs.jsx`, `features/landing/FAQs.jsx`, `features/landing/PrivacyPolicy.jsx`, `features/landing/TermsAndConditions.jsx`. |

### 16.4 Other Landing Sections

| Attribute | Description |
|-----------|-------------|
| **Feature name** | Additional sections |
| **Description** | PropertyTypeSection, FeatureSection, TopHighlightsSection (likely top hotels or highlights), CTASection, GetInTouch, PartnerWithUsSection, TestimonialsSection, TrustIndicatorsSection, HowItWorksSection, PortfolioPage. Used or available for landing composition. |
| **Related files** | `features/landing/*.jsx`. |

---

## UI States & Responsive Behavior (Summary)

- **Loading**: Route lazy load uses full-screen `SimpleSpinner`; tables and lists use skeleton or spinner (e.g. Guest dashboard booking cards, hotel listing).
- **Errors**: Toasts for API errors and validation; 401/403 trigger logout and redirect; inline field errors on forms.
- **Success**: Toasts for login, role switch, connection restored; success modals for booking; payment status page for payment result.
- **Disabled**: Buttons disabled during submit (e.g. login, booking); date picker disables booked dates and invalid ranges.
- **Responsive**: Navbar collapses to sheet on mobile; listing has mobile filter dropdown; hotel details and dashboard use responsive grids and sheets. Breakpoints follow Tailwind (e.g. `md:`, `lg:`).
- **Accessibility**: Dialog focus trap; sr-only labels where used; keyboard support on carousel and modals.

---

## File Reference Overview

| Area | Key Files |
|------|-----------|
| **Auth** | `AuthProvider.jsx`, `LoginModal.jsx`, `GoogleSignInButton.jsx`, `authSlice.jsx`, `tokenStorage.js`, `authDetection.js`, `safariLocalStorage.js` |
| **API** | `Api.jsx`, `firebaseConfig.js`, `subscriptionService.js`, `uploadService.jsx` |
| **Routing** | `AppRouting.jsx`, `App.jsx`, `main.jsx` |
| **Layout** | `Navbar.jsx`, `Footer.jsx`, `RootPathHandler.jsx` |
| **Hotel** | `HotelListingPage.jsx`, `HotelDetailsPage.jsx`, `FilterSidebar.jsx`, `HotelAdminDashboard.jsx`, `AddListingPage.jsx`, `BookingCalendar.jsx`, `HotelInfoForm.jsx`, `RoomItemForm.jsx`, `BookingTable.jsx`, `AdminBookingForm.jsx`, `CancellationRequestsTable.jsx`, `StaffManager.jsx`, `CIDVerification.jsx`, `PasscodeVerification.jsx`, `LeaveManagement.jsx`, `QRCodeScanner.jsx`, `ScannedBookingModal.jsx`, `UserManual.jsx`, `AccountDeletionPage.jsx` |
| **Booking** | `RoomBookingCard.jsx`, `TimeBasedBookingDialog.jsx` |
| **Guest** | `GuestDashboard.jsx`, `RoomManagement.jsx` |
| **Admin** | `SuperAdmin.jsx`, `RoomManager.jsx`, `StaffCardGrid.jsx` |
| **Subscription** | `SubscriptionPage.jsx`, `SubscriptionContext.jsx`, `SubscriptionManagement.jsx`, `SubscriptionExpirationNotification.jsx` |
| **Payment** | `PaymentStatusPage.jsx`, `PaymentDialog.jsx`, `paymentRedirect.js` |
| **Landing** | `Landing.jsx`, `HeroLG.jsx`, `FeatureSection.jsx`, `ListYourPropertySection.jsx`, others under `features/landing/` |
| **Shared** | `BookingSuccessModal.jsx`, `CustomDatePicker.jsx`, `HotelMap.jsx`, `HotelSelectionDialog.jsx`, `InternetConnectionMonitor.jsx`, `CustomOfflineToast.jsx`, `Toast.jsx`, `SimpleSpinner.jsx`, `pagination.jsx`, `dialog.jsx`, `alert-dialog.jsx`, form primitives |
| **PWA** | `PWARegistration.jsx`, `InstallPrompt.jsx`, `useInstallPrompt.js` |
| **Utils** | `utils.js`, `geoUtils.js`, `amenitiesHelper.js`, `receiptGenerator.js`, `subscriptionUtils.js`, `internetConnection.js` |
| **Constants** | `districts.js`, `nearbySearch.js`, `amenities.json`, `bankTypes.js` |

---

*Generated from YakRooms-FE codebase. Document only what exists in code; no invented features.*
