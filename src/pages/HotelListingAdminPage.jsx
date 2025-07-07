// HotelListingAdminPage.jsx
import React, { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiMail,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiUser,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { FaHotel, FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import HotelTable from "../components/hotel/HotelTable.jsx";
import HotelReviewModal from "../components/hotel/HotelReviewModal.jsx";

const HotelListingAdminPage = () => {
  // Dummy data - replace with API calls in production
  const [listings, setListings] = useState([
    {
      id: 1,
      hotelName: "Taj Tashi Thimphu",
      owner: {
        name: "Sonam Dorji",
        email: "sonam@tajtashi.com",
        phone: "+97517123456",
      },
      location: { district: "Thimphu", city: "Thimphu" },
      submissionDate: "2023-05-15",
      status: "approved",
      description:
        "Luxury hotel blending Bhutanese dzong architecture with contemporary design",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      ],
      rooms: [
        { type: "Deluxe Room", price: 220, amenities: ["WiFi", "TV", "AC"] },
      ],
      documents: {
        license: "taj_tashi_license.pdf",
        idProof: "sonam_dorji_id.jpg",
      },
      adminNotes: [],
    },
    {
      id: 2,
      hotelName: "Gangtey Lodge",
      owner: {
        name: "Karma Wangchuk",
        email: "karma@gangtey.com",
        phone: "+97517567890",
      },
      location: { district: "Wangdue", city: "Gangtey" },
      submissionDate: "2023-06-02",
      status: "pending",
      description: "Eco-friendly lodge with stunning valley views",
      images: [
        "https://images.unsplash.com/photo-1582719471380-cd7775af7d73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      ],
      rooms: [
        { type: "Standard Room", price: 150, amenities: ["WiFi", "Heating"] },
      ],
      documents: {
        license: "gangtey_lodge_license.pdf",
        idProof: "karma_wangchuk_id.jpg",
      },
      adminNotes: [],
    },
    {
      id: 3,
      hotelName: "Dochula Resort",
      owner: {
        name: "Dechen Pelmo",
        email: "dechen@dochula.com",
        phone: "+97517234567",
      },
      location: { district: "Thimphu", city: "Dochula Pass" },
      submissionDate: "2023-06-10",
      status: "rejected",
      description: "Mountain resort with panoramic Himalayan views",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      ],
      rooms: [],
      documents: {
        license: "dochula_resort_license.pdf",
        idProof: "dechen_pelmo_id.jpg",
      },
      adminNotes: [
        {
          date: "2023-06-12",
          admin: "Admin1",
          note: "Missing required documents",
        },
      ],
    },
  ]);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    district: "all",
    fromDate: "",
    toDate: "",
  });

  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Filter listings based on filters
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.hotelName.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.owner.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || listing.status === filters.status;

    const matchesDistrict =
      filters.district === "all" ||
      listing.location.district === filters.district;

    const matchesDate =
      (!filters.fromDate || listing.submissionDate >= filters.fromDate) &&
      (!filters.toDate || listing.submissionDate <= filters.toDate);

    return matchesSearch && matchesStatus && matchesDistrict && matchesDate;
  });

  const districts = [...new Set(listings.map((l) => l.location.district))];

  const handleApprove = (id) => {
    setListings(
      listings.map((listing) =>
        listing.id === id ? { ...listing, status: "approved" } : listing
      )
    );
    setIsModalOpen(false);
    // In production: Add API call and notification
  };

  const handleReject = (id) => {
    if (!rejectReason) return;

    const updatedListing = listings.map((listing) =>
      listing.id === id
        ? {
            ...listing,
            status: "rejected",
            adminNotes: [
              ...listing.adminNotes,
              {
                date: new Date().toISOString().split("T")[0],
                admin: "CurrentAdmin",
                note: `Rejected: ${rejectReason}`,
              },
            ],
          }
        : listing
    );

    setListings(updatedListing);
    setRejectReason("");
    setIsModalOpen(false);
    // In production: Add API call and notification
  };

  const addAdminNote = (id) => {
    if (!adminNote) return;

    setListings(
      listings.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              adminNotes: [
                ...listing.adminNotes,
                {
                  date: new Date().toISOString().split("T")[0],
                  admin: "CurrentAdmin",
                  note: adminNote,
                },
              ],
            }
          : listing
      )
    );

    setAdminNote("");
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setRejectReason("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            YakRooms Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <FiUser />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm p-4 hidden md:block">
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg"
            >
              <FaHotel className="mr-3" />
              Hotel Listings
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiUser className="mr-3" />
              Business Owners
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiMail className="mr-3" />
              Notifications
            </a>
          </nav>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Listings</span>
                <span className="font-medium">{listings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-amber-600">
                  {listings.filter((l) => l.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Approved</span>
                <span className="font-medium text-green-600">
                  {listings.filter((l) => l.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rejected</span>
                <span className="font-medium text-red-600">
                  {listings.filter((l) => l.status === "rejected").length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search hotels or owners..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="sr-only">Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="sr-only">District</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={filters.district}
                  onChange={(e) =>
                    setFilters({ ...filters, district: e.target.value })
                  }
                >
                  <option value="all">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="From"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value })
                  }
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="To"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Hotel Listings
              </h2>
              <button className="flex items-center text-sm text-amber-600 hover:text-amber-700">
                <FiDownload className="mr-1" /> Export CSV
              </button>
            </div>

            <HotelTable
              listings={filteredListings}
              onView={openModal}
              onApprove={handleApprove}
              onReject={(id) => {
                const listing = listings.find((l) => l.id === id);
                openModal(listing);
              }}
            />
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedListing && (
        <HotelReviewModal
          listing={selectedListing}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          addAdminNote={addAdminNote}
        />
      )}
    </div>
  );
};

export default HotelListingAdminPage;
