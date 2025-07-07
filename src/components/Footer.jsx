import React, { useState } from "react";
import {
  Mountain,
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const YakRoomsFooter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Newsletter subscription:", email);
      setEmail("");
      setIsSubmitting(false);
      alert("Thank you for subscribing! 🙏");
    }, 1000);
  };

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Hotels", href: "/hotels" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "FAQ", href: "/faq" },
    { name: "Safety Guidelines", href: "/safety" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/yakrooms",
      color: "hover:text-blue-400",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/yakrooms",
      color: "hover:text-pink-400",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/yakrooms",
      color: "hover:text-red-400",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About YakRooms */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Mountain className="w-8 h-8 text-yellow-400 mr-3" />
              <h3 className="text-2xl font-bold">
                Yak<span className="text-yellow-400">Rooms</span>
              </h3>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              YakRooms helps travelers and locals discover authentic Bhutanese
              stays and cuisine with real-time booking and pricing. Experience
              the warmth of Bhutanese hospitality and explore the rich culinary
              traditions of the Land of the Thunder Dragon.
            </p>

            {/* Newsletter Signup */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                Stay Updated
              </h4>
              <p className="text-slate-400 mb-4">
                Get the latest deals and travel tips delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-white placeholder-slate-400"
                  required
                />
                <button
                  onClick={handleNewsletterSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <ChevronRight className="w-5 h-5 mr-2 text-yellow-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-400" />
              Support & Contact
            </h4>

            {/* Support Links */}
            <ul className="space-y-3 mb-6">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 flex items-center group text-sm"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-slate-300">
                <Mail className="w-4 h-4 mr-3 text-yellow-400" />
                <a
                  href="mailto:hello@yakrooms.bt"
                  className="hover:text-yellow-400 transition-colors"
                >
                  hello@yakrooms.bt
                </a>
              </div>
              <div className="flex items-center text-slate-300">
                <Phone className="w-4 h-4 mr-3 text-yellow-400" />
                <a
                  href="tel:+97517123456"
                  className="hover:text-yellow-400 transition-colors"
                >
                  +975 17 123 456
                </a>
              </div>
              <div className="flex items-start text-slate-300">
                <MapPin className="w-4 h-4 mr-3 text-yellow-400 mt-1" />
                <span className="text-sm">
                  Thimphu, Bhutan
                  <br />
                  <span className="text-slate-400">Available nationwide</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="my-12 relative">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          <div className="absolute inset-0 flex justify-center">
            <div className="bg-slate-900 px-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-225"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Made with Love */}
          <div className="flex items-center text-slate-300">
            <span>Made with</span>
            <Heart className="w-4 h-4 mx-2 text-red-400 animate-pulse" />
            <span>in Bhutan</span>
            <span className="ml-2">🏔️</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <span className="text-slate-400 text-sm">Follow us:</span>
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-slate-400 ${social.color} transition-all duration-200 transform hover:scale-110`}
                  aria-label={social.name}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Language/Currency (Optional) */}
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <button className="hover:text-yellow-400 transition-colors">
              🇧🇹 English
            </button>
            <button className="hover:text-yellow-400 transition-colors">
              Nu. BTN
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2025 YakRooms. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span>Proudly serving Bhutan since 2024</span>
              <span>•</span>
              <span>Licensed Tourism Operator</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default YakRoomsFooter;
