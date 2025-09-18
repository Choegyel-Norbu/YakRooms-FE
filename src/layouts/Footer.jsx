import React from "react";
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logoER from "@/assets/images/logoER.png";

const Footer = React.forwardRef((props, ref) => {
  return (
    <footer ref={ref} className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <img 
                src={logoER} 
                alt="EzeeRoom Logo" 
                className="h-6 w-auto mb-3"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Travel Bhutan Smarter – Discover, Book, and Dine with EzeeRoom.
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
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Home
                  </a>
              </li>
              <li>
                                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Book Hotels
                  </a>
              </li>
              <li>
                                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Discover Food
                  </a>
              </li>
              <li>
                                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                <Link
                  to="/addListing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Add Your Property
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Partner Login
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
