# YakRooms Frontend - Component Structure

## Overview
This document provides a comprehensive breakdown of all components in the YakRooms frontend application, organized by feature modules and showing their hierarchical relationships.

## Application Architecture

### Root Components
- **App.jsx** - Main application entry point
- **main.jsx** - Application bootstrap and provider setup
- **AppRouting.jsx** - Main routing configuration with protected routes

### Layout Components (`src/layouts/`)
- **Navbar.jsx** - Main navigation bar with authentication and menu
- **Footer.jsx** - Application footer with contact information
- **ModeToggle.jsx** - Dark/light mode toggle component

---

## Feature Modules

### 1. Landing Page (`src/features/landing/`)

#### Main Landing Page
- **Landing.jsx** - Main landing page component
  - **Navbar** - Navigation component
  - **HeroLG** - Hero section with call-to-action
  - **TopHighlightsSection** - Key features highlights
  - **FeatureSection** - Detailed feature showcase
  - **ListYourPropertySection** - Property listing CTA
  - **Footer** - Footer component
  - **LoginModal** - Authentication modal

#### Landing Page Components
- **HeroLG.jsx** - Hero section with animations
- **FeatureSection.jsx** - Feature showcase with cards
- **TopHighlightsSection.jsx** - Key highlights grid
- **ListYourPropertySection.jsx** - Property listing promotion
- **PartnerWithUsSection.jsx** - Partnership opportunities
- **TestimonialsSection.jsx** - Customer testimonials
- **TrustIndicatorsSection.jsx** - Trust badges and indicators
- **HowItWorksSection.jsx** - Step-by-step process explanation
- **CTASection.jsx** - Call-to-action section
- **GetInTouch.jsx** - Contact form section

#### Landing Page Pages
- **About.jsx** - About page component
- **AboutUs.jsx** - Detailed about us page
- **PortfolioPage.jsx** - Portfolio showcase page
- **PrivacyPolicy.jsx** - Privacy policy page

---

### 2. Hotel Management (`src/features/hotel/`)

#### Hotel Pages
- **HotelAdminDashboard.jsx** - Main hotel admin dashboard
  - **StaffManager** - Staff management component
  - **StaffCardGrid** - Staff member grid display
  - **RoomStatusTable** - Room status management
  - **BookingsTrendChart** - Booking trends visualization
  - **MonthlyPerformanceChart** - Performance metrics
  - **PasscodeVerification** - Staff verification
  - **HotelInfoForm** - Hotel information editing
  - **RoomManager** - Room management interface
  - **BookingTable** - Booking management table
  - **AdminBookingForm** - Admin booking creation
  - **QRCodeScanner** - QR code scanning interface
  - **ScannedBookingModal** - Scanned booking details
  - **BookingsInventoryTable** - Booking inventory management

- **HotelDetailsPage.jsx** - Individual hotel details page
- **HotelListingPage.jsx** - Hotel search and listing page
- **AddListingPage.jsx** - New hotel listing creation

#### Hotel Components
- **AdminBookingForm.jsx** - Administrative booking form
- **BookingsTrendChart.jsx** - Booking trend visualization
- **BookingTable.jsx** - Booking management table
- **FilterSidebar.jsx** - Hotel search filters
- **HotelInfoForm.jsx** - Hotel information editing form
- **HotelReviewModal.jsx** - Hotel review modal
- **HotelReviewSheet.jsx** - Hotel review sheet
- **HotelTable.jsx** - Hotel listing table
- **MonthlyPerformanceChart.jsx** - Monthly performance metrics
- **PasscodeVerification.jsx** - Staff passcode verification
- **RoomItemForm.jsx** - Room item creation/editing
- **RoomStatusTable.jsx** - Room status management table
- **StaffManager.jsx** - Staff management interface
- **QRCodeScanner.jsx** - QR code scanning component
- **ScannedBookingModal.jsx** - Modal for scanned bookings
- **BookingsInventoryTable.jsx** - Booking inventory table

---

### 3. Authentication (`src/features/authentication/`)

#### Authentication Components
- **LoginModal.jsx** - User login modal
- **GoogleSignInButton.jsx** - Google OAuth sign-in button

#### Authentication Services
- **AuthProvider.jsx** - Authentication context provider
- **authSlice.jsx** - Redux authentication state management

---

### 4. Booking System (`src/features/booking/`)

#### Booking Components
- **BookingNotifications.jsx** - Booking notification system
- **RoomBookingCard.jsx** - Individual room booking card

#### Booking Context
- **BookingContext.jsx** - Booking state management context

---

### 5. Admin Management (`src/features/admin/`)

#### Admin Components
- **StaffCardGrid.jsx** - Staff member grid display
- **RoomManager.jsx** - Room management interface

#### Admin Pages
- **SuperAdmin.jsx** - Super administrator dashboard

---

### 6. Guest Management (`src/features/guest/`)

#### Guest Pages
- **GuestDashboard.jsx** - Guest user dashboard
- **RoomManagement.jsx** - Guest room management interface

---

### 7. Shared Components (`src/shared/components/`)

#### UI Components (shadcn/ui)
- **Alert** - Alert notifications
- **AlertDialog** - Confirmation dialogs
- **Avatar** - User avatar display
- **Badge** - Status and category badges
- **Button** - Action buttons
- **Calendar** - Date picker component
- **Card** - Content containers
- **Checkbox** - Form checkboxes
- **Dialog** - Modal dialogs
- **DropdownMenu** - Dropdown navigation
- **Form** - Form components
- **Input** - Text input fields
- **Label** - Form labels
- **Pagination** - Page navigation
- **Popover** - Popover content
- **Progress** - Progress indicators
- **Select** - Dropdown selects
- **Separator** - Visual separators
- **Sheet** - Slide-out panels
- **Skeleton** - Loading placeholders
- **StarRating** - Rating display
- **Table** - Data tables
- **Tabs** - Tabbed interfaces
- **Textarea** - Multi-line text input
- **Tooltip** - Hover tooltips

#### Custom Card Components
- **DeleteConfirmationDialog.jsx** - Delete confirmation modal
- **FeatureCard.jsx** - Feature showcase cards
- **FirebaseCard.jsx** - Firebase technology card
- **JavaCard.jsx** - Java technology card
- **MySQL.jsx** - MySQL database card
- **ReactCard.jsx** - React technology card
- **SpringBootCard.jsx** - Spring Boot technology card
- **SummaryCards.jsx** - Summary information cards
- **TailwindCard.jsx** - Tailwind CSS technology card
- **YakRoomsAdCard.jsx** - YakRooms advertisement card
- **YakRoomsText.jsx** - YakRooms text component

#### Loader Components
- **YakRoomsLoader.jsx** - Custom loading spinner

#### Other Shared Components
- **BookingSuccessModal.jsx** - Booking confirmation modal
- **GlobalReviewSheet.jsx** - Global review interface
- **QRCodeGenerator.jsx** - QR code generation
- **RatingWidget.jsx** - Rating input component
- **Toast.jsx** - Toast notifications
- **ToastTest.jsx** - Toast testing component
- **TopHotelBadge.jsx** - Top hotel indicator badge
- **NotificationsComponent.jsx** - Notification system
- **UnAuthorizedPage.jsx** - Access denied page
- **SearchButton.jsx** - Search functionality button

---

### 8. PWA Module (`src/modules/pwa/`)

#### PWA Components
- **PWARegistration.jsx** - Progressive Web App installation

---

### 9. WebSocket Module (`src/modules/websocket/`)

#### WebSocket Components
- **WebSocketStatus.jsx** - WebSocket connection status
- **WebSocketTestPanel.jsx** - WebSocket testing interface

#### WebSocket Services
- **websocketService.js** - WebSocket connection management

---

## Component Hierarchy Examples

### Landing Page Structure
```
Landing.jsx
├── Navbar
│   ├── ModeToggle
│   └── LoginModal (conditional)
├── HeroLG
├── TopHighlightsSection
├── FeatureSection
├── ListYourPropertySection
└── Footer
```

### Hotel Admin Dashboard Structure
```
HotelAdminDashboard.jsx
├── StaffManager
├── StaffCardGrid
├── RoomStatusTable
├── BookingsTrendChart
├── MonthlyPerformanceChart
├── PasscodeVerification
├── HotelInfoForm
├── RoomManager
├── BookingTable
├── AdminBookingForm
├── QRCodeScanner
├── ScannedBookingModal
└── BookingsInventoryTable
```

### Authentication Flow
```
App.jsx
├── AuthProvider
│   ├── LoginModal
│   └── GoogleSignInButton
└── AppRouting
    └── ProtectedRoute
```

## Key Design Patterns

### 1. Feature-Based Organization
- Components are organized by business features rather than technical concerns
- Each feature module has its own index.js for clean exports
- Shared components are centralized for reusability

### 2. Component Composition
- Large pages are composed of smaller, focused components
- Components use composition over inheritance
- Props are passed down for data flow

### 3. State Management
- Redux for global state (authentication)
- React Context for feature-specific state (booking)
- Local state for component-specific concerns

### 4. Routing Structure
- Public routes for unauthenticated users
- Protected routes with role-based access control
- Dynamic routing based on user roles

### 5. Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive breakpoints for different screen sizes
- Touch-friendly interfaces for mobile users

## Component Dependencies

### External Libraries
- **React Router** - Navigation and routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling and responsive design
- **shadcn/ui** - UI component library
- **Lucide React** - Icon library
- **AOS** - Animation on scroll
- **Chart.js** - Data visualization

### Internal Dependencies
- **Authentication Context** - User authentication state
- **Booking Context** - Booking management state
- **API Services** - Backend communication
- **WebSocket Service** - Real-time updates
- **PWA Registration** - Progressive web app features

## Best Practices Implemented

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Shared components are designed for multiple use cases
3. **Accessibility** - ARIA labels and keyboard navigation support
4. **Performance** - Lazy loading and optimized re-renders
5. **Security** - Role-based access control and input validation
6. **Testing** - Component structure supports unit and integration testing
7. **Maintainability** - Clear naming conventions and modular structure

This component structure provides a solid foundation for a scalable, maintainable hotel management application with clear separation of concerns and reusable components.
