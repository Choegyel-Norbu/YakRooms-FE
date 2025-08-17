# YakRooms Frontend - Development Workflow & Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Feature Modules](#feature-modules)
4. [Development Workflows](#development-workflows)
5. [External Integrations](#external-integrations)
6. [Security & Quality](#security--quality)
7. [PWA Implementation](#pwa-implementation)
8. [Deployment & Environment](#deployment--environment)
9. [Testing Strategy](#testing-strategy)
10. [Future Roadmap](#future-roadmap)

---

## Project Overview

### Mission Statement
YakRooms is a Progressive Web Application designed to serve Bhutan's hospitality industry, providing real-time hotel booking and management capabilities with installable app features optimized for rural connectivity and varying levels of digital literacy.

### Key Statistics
- **Frontend Framework**: React 19.1.0
- **Bundle Size**: Optimized with Vite 6.3.5
- **PWA Features**: Installable app with service worker caching
- **Target Market**: Bhutanese hospitality (60% rural focus)
- **User Roles**: 4 distinct roles (SUPER_ADMIN, HOTEL_ADMIN, STAFF, GUEST)

### Business Value Proposition
- **Installable App**: Native app-like experience with PWA technology
- **Real-time Booking**: Instant hotel reservations
- **Rural Optimization**: Designed for limited connectivity scenarios
- **Multi-role Platform**: Serves both guests and hospitality providers
- **Cultural Adaptation**: Bhutanese-specific features and validation

---

## Architecture & Technology Stack

### Core Technologies
```json
{
  "frontend": "React 19.1.0",
  "bundler": "Vite 6.3.5",
  "styling": "Tailwind CSS 4.1.10 + shadcn/ui",
  "state": "React Context",
  "auth": "Firebase Auth 11.9.1",
  "realtime": "WebSocket with STOMP protocol",
  "pwa": "Vite PWA Plugin with Workbox",
  "forms": "React Hook Form 7.60.0 + Zod",
  "uploads": "UploadThing 7.7.3"
}
```

### Architecture Patterns
1. **Feature-Based Architecture**: Business domain organization
2. **Context-Driven State**: React Context
3. **Role-Based Access Control**: Multi-tenant architecture

### Project Structure
```
src/
├── features/                  # Business domain modules
│   ├── authentication/        # Multi-role auth system
│   ├── hotel/                # Hotel management suite
│   ├── booking/              # Real-time booking system
│   ├── guest/                # Guest experience
│   ├── admin/                # Super admin tools
│   └── landing/              # Marketing & onboarding
├── shared/                   # Reusable resources
│   ├── components/           # UI component library
│   ├── services/             # API & state management
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── constants/            # Static data
├── modules/                  # Cross-cutting concerns
│   ├── pwa/                  # Progressive Web App features (install only)
│   └── websocket/            # Real-time communication
├── layouts/                  # Layout components
└── routes/                   # Application routing
```

---

## Feature Modules

### 1. Authentication Module
**Location**: `src/features/authentication/`

**Core Responsibilities**:
- Multi-role authentication (SUPER_ADMIN, HOTEL_ADMIN, STAFF, GUEST)
- Google OAuth integration with local fallback
- JWT token management with auto-expiry
- Cross-tab session synchronization
- Dynamic role switching

**Key Components**:
- `AuthProvider.jsx`: Comprehensive auth context (537 lines)
- `LoginModal.jsx`: Modal-based authentication UI
- `GoogleSignInButton.jsx`: OAuth integration

**Workflow Process**:
```mermaid
graph LR
    A[User Login] --> B[Google OAuth / Local Auth]
    B --> C[JWT Token Generation]
    C --> D[Role Assignment]
    D --> E[Dashboard Routing]
    E --> F[Role-Based Access Control]
```

**Security Features**:
- JWT validation with automatic refresh
- Role-based route protection
- Secure localStorage management
- Cross-tab authentication sync

### 2. Hotel Management Module
**Location**: `src/features/hotel/`

**Core Responsibilities**:
- Complete hotel administration dashboard
- Real-time room management and inventory
- Booking management with status updates
- Staff management and role assignment
- Analytics and performance reporting
- QR code check-in/check-out system

**Key Components**:
- `HotelAdminDashboard.jsx`: Main admin interface (1237+ lines)
- `RoomStatusTable.jsx`: Real-time room management (488 lines)
- `BookingTable.jsx`: Booking administration
- `StaffManager.jsx`: Employee management
- `BookingsTrendChart.jsx`: Analytics visualization
- `QRCodeScanner.jsx`: Check-in/out automation

**Hotel Admin Workflow**:
```mermaid
graph TD
    A[Hotel Registration] --> B[Document Verification]
    B --> C[Dashboard Access]
    C --> D[Room Setup]
    D --> E[Staff Management]
    E --> F[Booking Management]
    F --> G[Analytics & Reporting]
```

**Features**:
- Real-time booking notifications via WebSocket
- Comprehensive analytics with Recharts
- Staff role management with validation
- Top hotel badge system for premium properties
- QR-based guest check-in/check-out

### 3. Booking Module
**Location**: `src/features/booking/`

**Core Responsibilities**:
- Real-time booking context management
- WebSocket-based status notifications
- Review system triggering
- Booking state synchronization

**Key Components**:
- `BookingContext.jsx`: Centralized booking state (183 lines)
- `RoomBookingCard.jsx`: Booking interface with validation
- `BookingNotifications.jsx`: Real-time updates

**Booking Workflow**:
```mermaid
graph LR
    A[Room Search] --> B[Selection & Dates]
    B --> C[Guest Information]
    C --> D[Payment Processing]
    D --> E[Confirmation]
    E --> F[Real-time Updates]
    F --> G[Check-in/out]
    G --> H[Review Prompt]
```

### 4. Guest Module
**Location**: `src/features/guest/`

**Core Responsibilities**:
- Guest dashboard for booking management
- Booking history and status tracking
- Review and rating system
- Profile management

**Key Components**:
- `GuestDashboard.jsx`: Guest-centric interface
- `RoomManagement.jsx`: Room browsing

### 5. Admin Module
**Location**: `src/features/admin/`

**Core Responsibilities**:
- Platform-wide administration
- Hotel verification and approval
- System-wide staff management
- Platform analytics

**Key Components**:
- `SuperAdmin.jsx`: Platform administration
- `RoomManager.jsx`: Cross-hotel management
- `StaffCardGrid.jsx`: Visual staff interface

### 6. Landing Module
**Location**: `src/features/landing/`

**Core Responsibilities**:
- Marketing website and value proposition
- Feature showcasing with statistics
- Partner onboarding flow
- Public information pages

**Key Components**:
- `Landing.jsx`: Main marketing page (199 lines)
- `HeroLG.jsx`: Hero section with CTAs
- `FeatureSection.jsx`: Feature highlights
- `TopHighlightsSection.jsx`: Featured hotels (250 lines)
- `ListYourPropertySection.jsx`: Partner onboarding

---

## Development Workflows

### 1. Feature Development Process
```bash
# 1. Environment Setup
npm install
npm run dev

# 2. Feature Branch Creation
git checkout -b feature/new-feature-name

# 3. Development with Hot Reload
npm run dev  # Runs on localhost:5173

# 4. Code Quality Checks
npm run lint
npm run build  # Production build test

# 5. Testing (Manual + Automated)
# Add your testing commands here

# 6. Pull Request & Review
git push origin feature/new-feature-name
```

### 2. Component Development Guidelines
```jsx
// Feature Component Structure
export const FeatureComponent = () => {
  // 1. State management (local state, context, Redux)
  // 2. Effects and lifecycle
  // 3. Event handlers
  // 4. Validation logic
  // 5. Render logic with proper error boundaries
};

// Shared Component Structure
export const SharedComponent = ({ ...props }) => {
  // 1. Props validation and defaults
  // 2. Forwarded refs if needed
  // 3. Accessibility attributes
  // 4. Consistent styling with Tailwind + shadcn/ui
};
```

### 3. State Management Patterns
```jsx
// Redux for Global State
const slice = createSlice({
  name: 'feature',
  initialState: {},
  reducers: {}
});

// Context for Feature State
const FeatureContext = createContext();
export const useFeature = () => useContext(FeatureContext);

// Local State for Component State
const [state, setState] = useState(initialState);
```

---

## External Integrations

### 1. Firebase Authentication
**Configuration**: `src/shared/services/firebaseConfig.js`
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCpztRaIhsRMisykJgEZD_d0HDnIuKxyKw",
  authDomain: "yakrooms.firebaseapp.com",
  projectId: "yakrooms"
  // ... other config
};
```

**Features**:
- Google OAuth integration
- Custom authentication support
- Real-time auth state management
- Cross-platform compatibility

### 2. UploadThing File Service
**Location**: `src/shared/services/uploadService.jsx`

**Capabilities**:
- Image upload (4MB max) for hotel listings
- PDF document upload for verification
- Environment-aware configuration
- Comprehensive error handling

**Usage Pattern**:
```javascript
const uploadFile = async (file, field) => {
  // Determine file type and route
  // Prepare upload with API key
  // Upload to S3 via UploadThing
  // Return accessible URL
};
```

### 3. WebSocket Integration
**Location**: `src/modules/websocket/websocketService.js`

**STOMP Protocol Implementation**:
- Real-time booking updates
- User-specific notifications
- Automatic reconnection with exponential backoff
- Connection status monitoring

**Topics**:
- `/topic/bookings` - All booking events
- `/queue/users/{userId}/bookings` - User-specific events

### 4. Backend API Integration
**Configuration**: `src/shared/services/Api.jsx`
```javascript
const api = axios.create({
  baseURL: "http://localhost:8080/api",  // Development
  // baseURL: "https://yakrooms-be-production.up.railway.app/api",  // Production
  withCredentials: false,
  timeout: 10000
});
```

**Features**:
- JWT token automatic attachment
- Request/response interceptors
- Error handling and retry logic
- Environment-based configuration

---

## Security & Quality

### 1. Authentication Security
- **JWT Token Management**: Secure storage with expiry validation
- **Role-Based Authorization**: Protected routes with role verification
- **Cross-Tab Security**: Consistent auth across browser tabs
- **Session Management**: Automatic logout on token expiry

### 2. Input Validation
```javascript
// Phone Validation (Bhutanese Numbers)
const validateBhutanesePhone = (phone) => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!/^\d+$/.test(cleanPhone)) return "Invalid format";
  if (cleanPhone.length !== 8) return "Must be 8 digits";
  const mobilePattern = /^(17|77)\d{6}$/;
  if (!mobilePattern.test(cleanPhone)) return "Must start with 17 or 77";
  return null;
};

// Email Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form Validation with Zod
const schema = z.object({
  email: z.string().email(),
  phone: z.string().refine(validateBhutanesePhone)
});
```

### 3. Error Handling Patterns
```javascript
// API Error Handling
try {
  const response = await api.post('/endpoint', data);
  return response.data;
} catch (error) {
  console.error('API Error:', error);
  
  // Backend error mapping
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  
  // Generic error fallback
  throw new Error('Operation failed. Please try again.');
}

// Component Error Boundaries
const ErrorBoundary = ({ children, fallback }) => {
  // Error catching and fallback UI
};
```

### 4. Performance Optimizations
- **Lazy Loading**: Images and non-critical components
- **Memoization**: React.memo for expensive components
- **Bundle Optimization**: Vite-based tree shaking

---

## PWA Implementation

### 1. Service Worker Configuration
**Location**: `vite.config.js`
```javascript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    // Only cache static assets for performance
    runtimeCaching: [
      // Google Fonts caching
      // Image caching
      // Static asset caching
    ]
  }
})
```

### 2. Installation Features
- **Cross-Platform Support**: Android, iOS, Desktop installation
- **Install Prompts**: Automatic detection and user prompts
- **Update Management**: Service worker updates with notifications
- **Standalone Mode**: App-like experience when installed

### 3. PWA Manifest
- **App Name**: YakRooms
- **Display Mode**: Standalone for native app experience
- **Icons**: Complete icon set for all device sizes
- **Theme Colors**: Consistent branding

### 4. Performance Benefits
- **Static Asset Caching**: Fonts, images, and CSS cached for faster loading
- **App Installation**: Native app-like experience without app store
- **Automatic Updates**: Seamless app updates via service worker

**Note**: This PWA implementation focuses on installation and performance features only. No offline functionality is included - the app requires internet connection for all features.

---

## Deployment & Environment

### 1. Environment Configuration
```bash
# Development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_UPLOADTHING_SECRET=uploadthing_secret_key

# Production
VITE_API_BASE_URL=https://yakrooms-be-production.up.railway.app/api
VITE_UPLOADTHING_SECRET=production_uploadthing_key
```

### 2. Build Process
```bash
# Development Build
npm run dev

# Production Build
npm run build
npm run preview

# PWA Testing
npm run test-pwa

# Icon Generation
npm run generate-icons
npm run generate-yakrooms-icons
```

### 3. Deployment Pipeline
- **Platform**: Vercel deployment
- **Automatic Deployment**: Git-based triggers
- **Environment Management**: Development, staging, production
- **Build Optimization**: Vite production builds

### 4. Performance Monitoring
- **Bundle Analysis**: Vite bundle analyzer
- **Lighthouse Audits**: Performance, accessibility, and PWA compliance
- **Error Tracking**: Console error monitoring
- **User Analytics**: Ready for analytics integration

---

## Testing Strategy

### 1. Current Testing Implementation
```javascript
// Manual Testing with TestSprite
const testConfig = {
  "type": "frontend",
  "localEndpoint": "http://localhost:5173",
  "focus": [
    "Rural context features",
    "Local guest booking flows", 
    "PWA installation features",
    "Multi-language support",
    "Real-time functionality"
  ]
};
```

### 2. Testing Categories
- **Unit Testing**: Component and utility function testing
- **Integration Testing**: API and service integration
- **E2E Testing**: Complete user workflow testing
- **PWA Testing**: Installation and app functionality
- **Responsive Testing**: Cross-device compatibility
- **Performance Testing**: Load times and responsiveness
- **Accessibility Testing**: WCAG compliance and rural user accessibility

### 3. Test Scenarios
```javascript
// Critical User Journeys
const testScenarios = [
  "Guest booking flow with payment",
  "Hotel admin room management",
  "Real-time booking notifications",
  "Multi-role user experience",
  "Staff management workflow",
  "PWA installation process",
  "Real-time notifications"
];
```

### 4. Quality Metrics
- **Code Coverage**: Target 80%+ for critical paths
- **Performance Score**: 90%+ Lighthouse performance
- **PWA Score**: 100% Lighthouse PWA compliance
- **Performance**: Core Web Vitals compliance
- **Accessibility**: WCAG 2.1 AA compliance

---

## Future Roadmap

### 1. Short-Term Enhancements (1-3 months)
- **Advanced Analytics**: Machine learning booking insights
- **Enhanced Real-time Features**: Advanced notification system
- **Performance Optimization**: Advanced bundle splitting and caching

### 2. Medium-Term Features (3-6 months)
- **Multi-language Support**: Full Dzongkha language implementation
- **Advanced Search**: AI-powered search with recommendations
- **Loyalty Program**: Rewards system for frequent guests
- **Virtual Tours**: 360-degree room visualization
- **Mobile App**: Native iOS and Android applications

### 3. Long-Term Vision (6-12 months)
- **IoT Integration**: Smart room features and automation
- **Blockchain Payments**: Cryptocurrency payment options
- **AI Concierge**: Automated customer service with NLP
- **Microservices**: Backend service decomposition
- **Global Expansion**: Multi-country platform support

### 4. Technical Debt & Optimization
- **TypeScript Migration**: Gradual migration for better type safety
- **Testing Infrastructure**: Comprehensive automated testing
- **Monitoring & Analytics**: Advanced APM implementation
- **Security Hardening**: Enhanced security measures and auditing

---

## Development Guidelines

### 1. Code Standards
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Organization**: Feature-based with clear separation of concerns
- **Import Patterns**: Feature-based imports with barrel exports
- **Error Handling**: Comprehensive error boundaries and user feedback

### 2. Git Workflow
```bash
# Feature Development
git checkout -b feature/TASK-ID-description
git commit -m "feat: implement feature description"
git push origin feature/TASK-ID-description

# Bug Fixes
git checkout -b fix/TASK-ID-description
git commit -m "fix: resolve issue description"

# Documentation
git commit -m "docs: update workflow documentation"
```

### 3. Performance Guidelines
- **Bundle Size**: Monitor and optimize bundle size
- **Image Optimization**: Compress and lazy load images
- **Code Splitting**: Implement route-based code splitting
- **Caching Strategy**: Optimize browser caching

### 4. Accessibility Guidelines
- **Semantic HTML**: Use proper HTML elements
- **ARIA Attributes**: Implement accessibility attributes
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Reader Support**: Test with screen readers

---

## Conclusion

YakRooms represents a sophisticated, production-ready Progressive Web Application that successfully bridges modern web technologies with the practical needs of rural hospitality management. The codebase demonstrates enterprise-level architecture patterns while maintaining simplicity and accessibility for its target market.

**Key Strengths**:
- Comprehensive feature set with real-time capabilities
- Progressive Web App with native app-like experience
- Multi-role architecture supporting diverse user types
- Cultural adaptation for Bhutanese market needs
- Modern technology stack with proven scalability

**Development Philosophy**:
- User-centered design with accessibility focus
- Performance optimization for limited connectivity
- Security-first approach with comprehensive validation
- Maintainable architecture with clear separation of concerns

This workflow documentation serves as a comprehensive guide for developers, stakeholders, and new team members to understand the technical architecture, development processes, and future vision of the YakRooms platform.

---

*Last Updated: January 2025*
*Version: 1.0.0*
*Authors: Development Team*
