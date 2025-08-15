# YakRooms Frontend - Project Structure

## Overview
This document outlines the reorganized project structure for the YakRooms frontend application. The structure follows a feature-based architecture that groups related functionality together for better maintainability and scalability.

## Directory Structure

```
src/
├── assets/                    # Static assets (CSS, images)
│   ├── css/
│   └── images/
├── features/                  # Feature-based modules
│   ├── authentication/        # Authentication related components and services
│   │   ├── LoginModal.jsx
│   │   ├── GoogleSignInButton.jsx
│   │   ├── AuthProvider.jsx
│   │   ├── authSlice.jsx
│   │   └── index.js
│   ├── booking/              # Booking related components and context
│   │   ├── BookingNotifications.jsx
│   │   ├── RoomBookingCard.jsx
│   │   ├── BookingContext.jsx
│   │   └── index.js
│   ├── hotel/                # Hotel management components and pages
│   │   ├── HotelAdminDashboard.jsx
│   │   ├── HotelDetailsPage.jsx
│   │   ├── HotelListingPage.jsx
│   │   ├── AddListingPage.jsx
│   │   ├── AdminBookingForm.jsx
│   │   ├── BookingsTrendChart.jsx
│   │   ├── BookingTable.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── HotelInfoForm.jsx
│   │   ├── HotelReviewModal.jsx
│   │   ├── HotelTable.jsx
│   │   ├── MonthlyPerformanceChart.jsx
│   │   ├── PasscodeVerification.jsx
│   │   ├── RoomItemForm.jsx
│   │   ├── RoomStatusTable.jsx
│   │   ├── StaffManager.jsx
│   │   ├── HotelReviewSheet.jsx
│   │   └── index.js
│   ├── guest/                # Guest-related pages
│   │   ├── GuestDashboard.jsx
│   │   ├── RoomManagement.jsx
│   │   └── index.js
│   ├── admin/                # Admin-related components and pages
│   │   ├── SuperAdmin.jsx
│   │   ├── StaffCardGrid.jsx
│   │   ├── RoomManager.jsx
│   │   └── index.js
│   └── landing/              # Landing page and related components
│       ├── Landing.jsx
│       ├── HeroLG.jsx
│       ├── FeatureSection.jsx
│       ├── TopHighlightsSection.jsx
│       ├── ListYourPropertySection.jsx
│       ├── PartnerWithUsSection.jsx
│       ├── TestimonialsSection.jsx
│       ├── TrustIndicatorsSection.jsx
│       ├── HowItWorksSection.jsx
│       ├── CTASection.jsx
│       ├── GetInTouch.jsx
│       ├── About.jsx
│       ├── AboutUs.jsx
│       ├── PortfolioPage.jsx
│       ├── PrivacyPolicy.jsx
│       └── index.js
├── layouts/                   # Layout components
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   ├── mode-toggle.jsx
│   └── index.js
├── modules/                   # Cross-cutting modules
│   ├── websocket/            # WebSocket functionality
│   │   ├── WebSocketStatus.jsx
│   │   ├── WebSocketTestPanel.jsx
│   │   ├── websocketService.js
│   │   └── index.js
│   └── pwa/                  # Progressive Web App features
│       ├── PWARegistration.jsx
│       ├── OfflineWrapper.jsx
│       ├── OfflinePage.jsx
│       └── index.js
├── routes/                    # Routing configuration
│   └── AppRouting.jsx
├── shared/                    # Shared resources
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── cards/            # Card components
│   │   ├── loader/           # Loading components
│   │   ├── GlobalReviewSheet.jsx
│   │   ├── RatingWidget.jsx
│   │   ├── Toast.jsx
│   │   ├── ToastTest.jsx
│   │   ├── NotificationsComponent.jsx
│   │   ├── UnAuthorizedPage.jsx
│   │   └── index.js
│   ├── services/             # Shared services and state management
│   │   ├── Api.jsx
│   │   ├── uploadService.jsx
│   │   ├── store.jsx
│   │   ├── counterSlice.jsx
│   │   ├── firebaseConfig.js
│   │   └── index.js
│   ├── hooks/                # Custom React hooks
│   │   ├── useMediaQuery.jsx
│   │   ├── useOnlineStatus.jsx
│   │   ├── useOutsideClick.jsx
│   │   └── index.js
│   ├── utils/                # Utility functions
│   │   ├── utils.js
│   │   ├── amenitiesHelper.js
│   │   └── index.js
│   ├── constants/            # Constants and data
│   │   ├── amenities.json
│   │   └── index.js
│   └── index.js
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
├── index.css                 # Global styles
└── index.js                  # Main exports

## Key Benefits of This Structure

### 1. **Feature-Based Organization**
- Related functionality is grouped together
- Easier to locate and modify specific features
- Better separation of concerns

### 2. **Clear Separation of Responsibilities**
- **Features**: Business logic and feature-specific components
- **Layouts**: Reusable layout components
- **Modules**: Cross-cutting functionality (PWA, WebSocket)
- **Shared**: Reusable components, services, and utilities

### 3. **Improved Maintainability**
- Logical grouping makes code easier to navigate
- Reduced cognitive load when working on specific features
- Clear import paths and dependencies

### 4. **Better Scalability**
- New features can be added without affecting existing code
- Shared resources are centralized and easily accessible
- Consistent patterns across the application

## Import Patterns

### Feature Imports
```javascript
// Import from specific features
import { LoginModal } from '@/features/authentication';
import { HotelAdminDashboard } from '@/features/hotel';
import { GuestDashboard } from '@/features/guest';
```

### Shared Component Imports
```javascript
// Import shared UI components
import { Button, Card, Input } from '@/shared/components';
import { useAuth } from '@/shared/services';
```

### Layout Imports
```javascript
// Import layout components
import { Navbar, Footer } from '@/layouts';
```

## Migration Notes

### Updated Import Paths
- All component imports have been updated to use the new structure
- Relative imports have been replaced with feature-based imports where appropriate
- Index files provide clean, centralized exports

### Breaking Changes
- Some import paths have changed significantly
- Components are now organized by feature rather than type
- Shared resources are centralized in the `shared/` directory

## Best Practices

### 1. **Adding New Features**
- Create a new directory under `features/`
- Include an `index.js` file for clean exports
- Group related components, services, and utilities together

### 2. **Shared Components**
- Place reusable components in `shared/components/`
- Use the shared index files for clean imports
- Maintain consistency with existing patterns

### 3. **Import Organization**
- Use feature-based imports for feature-specific functionality
- Use shared imports for common functionality
- Keep imports organized and consistent

## File Naming Conventions

- **Components**: PascalCase (e.g., `HotelAdminDashboard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useMediaQuery.jsx`)
- **Services**: camelCase (e.g., `uploadService.jsx`)
- **Utilities**: camelCase (e.g., `amenitiesHelper.js`)
- **Constants**: camelCase (e.g., `amenities.json`)

This structure provides a solid foundation for the YakRooms frontend application, making it easier to maintain, scale, and collaborate on. 