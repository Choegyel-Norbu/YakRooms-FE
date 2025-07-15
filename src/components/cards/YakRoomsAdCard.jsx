import { BadgeCheck, Hotel, Utensils, ArrowRight } from "lucide-react";

export default function YakRoomsAdCard() {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg max-w-4xl mx-auto border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Content */}
        <div className="flex-1 p-8 md:p-10">
          <div className="flex items-center mb-4">
            <img
              src="/yakrooms-logo.png" // Replace with your logo path
              alt="YakRooms Logo"
              className="w-10 h-10 mr-3"
            />
            <h2 className="text-xl font-bold">YakRooms</h2>
          </div>

          <p className="text-16 text-gray-700 mb-6 font-medium">
            Bhutan's Premier Hotel Booking & Culinary Experience Platform
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <BadgeCheck className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-14 font-semibold text-gray-900">
                  Real-time Availability
                </h4>
                <p className="text-gray-600 text-14">
                  Instant booking confirmation with live room availability
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Hotel className="flex-shrink-0 w-5 h-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-14 font-semibold text-gray-900">
                  Verified Accommodations
                </h4>
                <p className="text-gray-600 text-sm">
                  Curated selection of hotels and authentic homestays
                </p>
              </div>
            </div>

            {/* <div className="flex items-start">
              <Utensils className="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-14 font-semibold text-gray-900">
                  Local Dining Guide
                </h4>
                <p className="text-gray-600 text-sm">
                  Discover restaurants with updated menus and pricing
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right: Visual */}
        <div className="flex-1 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-8">
          <div className="relative w-full h-64">
            <div className="absolute inset-0 bg-[url('/hotel-image.jpg')] bg-cover bg-center rounded-lg shadow-md"></div>
            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-2">
                  <Hotel className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-8 py-3 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          Empowering Bhutanese hospitality & authentic travel experiences
        </p>
      </div>
    </div>
  );
}
