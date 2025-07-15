import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react"; // Using lucide-react for icons

// ShadCN UI Components
import { Card } from "@/components/ui/card"; // Using Card for the main container
import { Button } from "@/components/ui/button"; // Using Button for the action

const ListYourPropertySection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        <Card className="max-w-3xl mx-auto bg-amber-50 p-8 md:p-12 rounded-2xl shadow-lg border border-amber-200">
          <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 text-white">
            <Home className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Partner with YakRooms & Grow Your Business
          </h2>
          <p className="text-slate-600 text-lg mb-8">
            Join our network of hotels, homestays, and restaurants. Reach more
            travelers, manage your bookings with ease, and become part of
            Bhutan's leading hospitality platform.
          </p>
          <Link to="/listings">
            <Button className="inline-flex items-center justify-center px-8 py-3 bg-amber-600 text-white font-medium rounded-lg shadow-md hover:bg-amber-700 transition-colors">
              List Your Property Today
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
};

export default ListYourPropertySection;
