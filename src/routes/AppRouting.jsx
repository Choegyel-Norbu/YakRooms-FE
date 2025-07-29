import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../services/AuthProvider";
import Landing from "../pages/Landing";
import About from "../pages/About";
import HotelListingPage from "../pages/HotelListingPage";
import HotelDetailsPage from "../pages/HotelDetailsPage";
import AddListingPage from "../pages/AddListingPage";
import RoomManagement from "../pages/RoomManagement";
import HotelAdminDashboard from "../pages/HotelAdminDashboard";
import SuperAdmin from "../pages/SuperAdmin";
import GuestDashboard from "../pages/GuestDashboard";
import PortfolioPage from "../pages/PortfolioPage";
import UnauthorizedPage from "../components/UnAuthorizedPage";
import NotificationsComponent from "../components/NotificationsComponent";

// Reusable ProtectedRoute component
function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export default function () {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/hotel" element={<HotelListingPage />} />
        <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        <Route path="/listings" element={<AddListingPage />} />
        <Route path="/room" element={<RoomManagement />} />
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotelAdmin"
          element={
            <ProtectedRoute allowedRoles={["HOTEL_ADMIN"]}>
              <HotelAdminDashboard />
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
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route
          path="/unauthorized"
          element={
            <UnauthorizedPage />
          }
        />
      </Routes>
    </AuthProvider>
  );
}
