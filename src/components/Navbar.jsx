import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthProvider";

const Navbar = ({ onLoginClick }) => {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/hotels" },
    { name: "Restaurants", path: "/restaurants" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-800 dark:bg-slate-900 shadow-lg backdrop-blur-sm bg-opacity-90"
          : "bg-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xl font-bold">YakRooms</span>
            </Link>
          </div>

          {/* Center Section - Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-300 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section - Auth & Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <Link to="/hotelAdmin" className="text-white">
                Dashboard
              </Link>
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-1 text-gray-300 hover:text-yellow-400 focus:outline-none transition-colors"
                  onClick={logout}
                >
                  <div
                    className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-medium"
                    title="Logout"
                  >
                    {/* In the future, this could be a user avatar or initial */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={onLoginClick}
                  className="text-gray-300 hover:text-yellow-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-yellow-400 hover:bg-slate-700 focus:outline-none transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-700 dark:bg-slate-800">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-slate-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between px-3">
              <div className="relative">
                <select
                  className="bg-slate-600 dark:bg-slate-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="dz">Dzongkha</option>
                </select>
              </div>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-yellow-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={onLoginClick}
                    className="text-gray-300 hover:text-yellow-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={onLoginClick}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
