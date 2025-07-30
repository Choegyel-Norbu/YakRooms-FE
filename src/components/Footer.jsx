import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

// YakRooms Text Logo Component (copied from Navbar.jsx)
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    small: "text-lg font-bold",
    default: "text-2xl font-bold",
    large: "text-3xl font-bold"
  };
  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const Footer = React.forwardRef((props, ref) => {
  return (
    <footer ref={ref} className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <YakRoomsText size="default" />
              <p className="text-sm text-muted-foreground mb-4">
                Travel Bhutan Smarter – Discover, Book, and Dine with YakRooms.
              </p>
            </div>
            <div className="hidden md:flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-muted"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-muted"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="hidden md:block space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Book Hotels
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discover Food
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </a>
              </li>
              
            </ul>
          </nav>

          {/* For Businesses */}
          <nav className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              For Businesses
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Add Your Property
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Partner Login
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vendor Guidelines
                </a>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancellation Policy
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Contact Information & Email Query */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  choegyell@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  +97517482648
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Thimphu, Bhutan
                </span>
              </div>
            </div>
          </div>

          {/* Email Query */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Have Questions?
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Got questions about YakRooms or need help with your booking?
                Feel free to reach out to me directly.
              </p>
              <Button
                onClick={() =>
                  window.open("mailto:choegyell@gmail.com", "_blank")
                }
                className="w-full"
              >
                Email Me
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8">
          <Separator className="mb-6" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 YakRooms. All rights reserved. Built for Bhutan 🇧🇹
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
