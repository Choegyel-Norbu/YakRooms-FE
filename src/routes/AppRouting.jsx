import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { AuthProvider } from "../services/AuthProvider";
import Landing from "../pages/Landing";
import About from "../pages/About";
import HotelListingPage from "../pages/HotelListingPage";
import HotelDetailsPage from "../pages/HotelDetailsPage";
import AddListingPage from "../pages/AddListingPage";
import RoomManagement from "../pages/RoomManagement";
import HotelAdminDashboard from "../pages/HotelAdminDashboard";
import SuperAdmin from "../pages/SuperAdmin";

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
        <Route path="/adminDashboard" element={<SuperAdmin />} />
        <Route path="/hotelAdmin" element={<HotelAdminDashboard />} />
      </Routes>
    </AuthProvider>
  );
}
