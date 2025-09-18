import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  Users,
  Shield,
  Heart,
  Mountain,
  Sparkles,
} from "lucide-react";

import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", message: "" });
    alert("Thank you for your message! We'll get back to you soon.");
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "975XXXXXXXX"; // Replace with actual phone number
    const message = encodeURIComponent("Hi! I'd like to get in touch with YakRooms support team.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-indigo-200 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="p-2 hover:bg-indigo-50 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-indigo-600" />
              <span className="hidden sm:inline ml-2 font-medium text-gray-700">Back</span>
            </Button>
            <Button asChild variant="ghost" className="p-2 hover:bg-indigo-50 rounded-xl transition-colors duration-200">
              <Link to="/" className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-700">Home</span>
              </Link>
            </Button>
          </div>

          {/* Center - Title */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Contact Us
            </h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Heart className="h-3 w-3 text-indigo-500" />
              <span className="text-xs text-gray-600">We're here to help</span>
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </div>
          </div>

          {/* Right side - Empty for balance */}
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-yellow-500 flex items-center justify-center">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help you, anytime. Get in touch with our friendly support team.
          </p>
          
          {/* Bhutanese prayer flag colors */}
          <div className="w-full max-w-md h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 rounded-full mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Get In Touch
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <a 
                      href="mailto:support@yakrooms.bt" 
                      className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                    >
                      support@yakrooms.bt
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <a 
                      href="tel:+975-XXXXXXXX" 
                      className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                    >
                      +975-XXXXXXXX
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-600">Thimphu, Bhutan</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Support */}
            <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  Quick Support
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Get instant help through WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white to-yellow-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-12 text-base border-indigo-200 focus:border-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="h-12 text-base border-indigo-200 focus:border-indigo-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="text-base border-indigo-200 focus:border-indigo-500 rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-yellow-500 hover:from-indigo-600 hover:to-yellow-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/30 max-w-4xl mx-auto">
            <CardContent className="py-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Why Choose YakRooms?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                  <p className="text-gray-600 text-sm">Round-the-clock assistance for all your needs</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Local Expertise</h4>
                  <p className="text-gray-600 text-sm">Deep knowledge of Bhutan's hospitality scene</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Trusted Platform</h4>
                  <p className="text-gray-600 text-sm">Secure and reliable booking experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
