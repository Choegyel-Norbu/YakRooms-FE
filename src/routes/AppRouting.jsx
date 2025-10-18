import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/authentication";
import { Landing } from "../features/landing";
import { AboutUs } from "../features/landing";
import { FAQs } from "../features/landing";
import { HotelListingPage } from "../features/hotel";
import { HotelDetailsPage } from "../features/hotel";
import { AddListingPage } from "../features/hotel";
import { HotelAdminDashboard, AccountDeletionPage } from "../features/hotel";
import { SuperAdmin } from "../features/admin";
import { GuestDashboard } from "../features/guest";
import { PrivacyPolicy, TermsAndConditions } from "../features/landing";
import { SubscriptionPage } from "../features/subscription";
import { SubscriptionManagement } from "../shared/components";
import RatingScaleTestPage from "../components/RatingScaleTestPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, roles, userId, email } = useAuth();

  // Debug logging
  console.log("🔒 ProtectedRoute Debug:", {
    isAuthenticated,
    userId,
    email,
    roles,
    allowedRoles,
    hasAllowedRole: allowedRoles.some((role) => hasRole(role))
  });

  if (!isAuthenticated) {
    console.log("🚫 User not authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some((role) => hasRole(role));

  if (!hasAllowedRole) {
    console.log("🚫 User doesn't have required role, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ User authorized, rendering protected content");
  return children;
};

// Dashboard Route Component
const DashboardRoute = () => {
  const { getCurrentActiveRole } = useAuth();
  const activeRole = getCurrentActiveRole();

  // Redirect based on active role
  if (activeRole === "SUPER_ADMIN") {
    return <Navigate to="/adminDashboard" replace />;
  } else if (activeRole === "HOTEL_ADMIN" || activeRole === "STAFF" || activeRole === "MANAGER" || activeRole === "FRONTDESK") {
    return <Navigate to="/hotelAdmin" replace />;
  } else if (activeRole === "GUEST") {
    return <Navigate to="/guestDashboard" replace />;
  } else {
    // Fallback to home if no valid role
    return <Navigate to="/" replace />;
  }
};

// Unauthorized Page Component
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
      >
        Go Back
      </button>
    </div>
  </div>
);

const AppRouting = () => {

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/hotels" element={<HotelListingPage />} />
      <Route path="/hotel/:id" element={<HotelDetailsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Dashboard Route - Redirects based on active role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["HOTEL_ADMIN", "SUPER_ADMIN", "STAFF", "MANAGER", "GUEST", "FRONTDESK"]}
          >
            <DashboardRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addListing"
        element={
          <ProtectedRoute allowedRoles={["GUEST", "STAFF", "MANAGER", "FRONTDESK"]}>
            <AddListingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}

      <Route
        path="/hotelAdmin"
        element={
          <ProtectedRoute allowedRoles={["HOTEL_ADMIN", "STAFF", "MANAGER", "FRONTDESK"]}>
            <HotelAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/adminDashboard"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guestDashboard"
        element={
          <ProtectedRoute allowedRoles={["GUEST"]}>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account-deletion"
        element={
          <ProtectedRoute allowedRoles={["HOTEL_ADMIN"]}>
            <AccountDeletionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription-management"
        element={
          <ProtectedRoute allowedRoles={["HOTEL_ADMIN", "STAFF", "MANAGER"]}>
            <SubscriptionManagement />
          </ProtectedRoute>
        }
      />

      {/* Test Routes */}
      <Route
        path="/rating-test"
        element={<RatingScaleTestPage />}
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouting;
