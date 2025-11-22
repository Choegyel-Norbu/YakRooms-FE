import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User,
  Home,
  Hotel,
  UserPlus,
  Mail,
  ChevronRight,
  MessageCircle,
  AlertTriangle,
  Info,
  FileText,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/shared/components/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/avatar";
import { useAuth } from "@/features/authentication";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { EzeeRoomLogo } from "@/shared/components";
import HotelSelectionDialog from "@/shared/components/HotelSelectionDialog";

const Navbar = ({ onLoginClick, onContactClick, isVisible = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName, email, roles, pictureURL, hasRole, getPrimaryRole, getCurrentActiveRole, switchToRole, selectedHotelId, userHotels, userId, fetchUserHotels, setSelectedHotelId, subscriptionIsActive, subscriptionPlan } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const [isHotelSelectionOpen, setIsHotelSelectionOpen] = useState(false);

  // Add CSS for hiding scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;  /* Safari and Chrome */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const calculateScrollbarWidth = () => {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      setScrollbarWidth(scrollbarWidth);
    };

    calculateScrollbarWidth();
    window.addEventListener("resize", calculateScrollbarWidth);
    return () => window.removeEventListener("resize", calculateScrollbarWidth);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Home, description: "Back to homepage" },
    { name: "Hotels", path: "/hotels", icon: Hotel, description: "Find accommodations" },
    { name: "About", path: "/aboutus", icon: Info, description: "Learn about us" },
    { name: "List Property", path: "#", icon: Sparkles, description: "List your property", isListProperty: true },
    { name: "Contact", path: "#contact", icon: Mail, description: "Get in touch", isContact: true },
  ];

  // Helper function to format role name to title case
  const formatRoleLabel = (role) => {
    if (!role) return role;
    // Handle snake_case and convert to Title Case
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to get role display info
  const getRoleDisplayInfo = (role, isActive = false) => {
    const roleInfo = {
      'SUPER_ADMIN': { 
        label: 'Admin', 
        color: isActive 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg shadow-red-500/25' 
          : 'bg-red-100 text-red-800 border-red-200',
        ringColor: 'rgb(239 68 68 / 0.4)'
      },
      'HOTEL_ADMIN': { 
        label: 'Hotel Admin', 
        color: isActive 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' 
          : 'bg-blue-100 text-blue-800 border-blue-200',
        ringColor: 'rgb(59 130 246 / 0.4)'
      },
      'MANAGER': { 
        label: 'Manager', 
        color: isActive 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' 
          : 'bg-blue-100 text-blue-800 border-blue-200',
        ringColor: 'rgb(59 130 246 / 0.4)'
      },
      'STAFF': { 
        label: 'Staff', 
        color: isActive 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25' 
          : 'bg-green-100 text-green-800 border-green-200',
        ringColor: 'rgb(34 197 94 / 0.4)'
      },
      'FRONTDESK': { 
        label: 'Front Desk', 
        color: isActive 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25' 
          : 'bg-green-100 text-green-800 border-green-200',
        ringColor: 'rgb(34 197 94 / 0.4)'
      },
      'GUEST': { 
        label: 'Guest', 
        color: isActive 
          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25' 
          : 'bg-purple-100 text-purple-800 border-purple-200',
        ringColor: 'rgb(168 85 247 / 0.4)'
      },
    };
    return roleInfo[role] || { 
      label: formatRoleLabel(role), 
      color: isActive 
        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-500 shadow-lg shadow-gray-500/25' 
        : 'bg-gray-100 text-gray-800 border-gray-200',
      ringColor: 'rgb(107 114 128 / 0.4)'
    };
  };

  const handleRoleSwitch = (role) => {
    switchToRole(role);
    const roleInfo = getRoleDisplayInfo(role);
    
    // Show success message for all role switches
    toast(`Switched to ${roleInfo.label} user`, {
      description: `You are now viewing the application as ${roleInfo.label}`,
      duration: 3000,
    });
  };

  const getSelectedHotelId = () => {
    return selectedHotelId;
  };

  const handleDashboardNavigation = async () => {
    const currentActiveRole = getCurrentActiveRole();
    
    // If user has hotel management roles, always fetch fresh hotel data and handle accordingly
    if (currentActiveRole === 'HOTEL_ADMIN' || currentActiveRole === 'STAFF' || currentActiveRole === 'MANAGER' || currentActiveRole === 'FRONTDESK') {
      try {
        // Always fetch fresh hotel data when dashboard is clicked
        if (userId && fetchUserHotels) {
          const hotels = await fetchUserHotels(userId);
          
          if (hotels && hotels.length > 0) {
            // Check if we already have a selected hotel that's still valid
            const currentSelectedHotel = hotels.find(hotel => hotel.id?.toString() === selectedHotelId);
            
            if (currentSelectedHotel) {
              // Current selected hotel is still valid, navigate directly
              navigate('/dashboard');
            } else {
              // Current selected hotel is no longer valid or not set, auto-select the first hotel
              const hotel = hotels[0];
              setSelectedHotelId(hotel.id);
              navigate('/dashboard');
            }
          } else {
            // No hotels - show selection dialog (will show "no hotels" message)
            setIsHotelSelectionOpen(true);
          }
        } else {
          // Fallback - show selection dialog
          setIsHotelSelectionOpen(true);
        }
      } catch (error) {
        console.error("Error handling dashboard navigation:", error);
        // Fallback - show selection dialog
        setIsHotelSelectionOpen(true);
      }
    } else {
      // For other roles, navigate to dashboard directly
      navigate('/dashboard');
    }
  };

  const handleHotelSelected = (hotel) => {
    // Hotel selection handled silently
  };

  // Handle "Become a Host" click - same logic as ListYourPropertySection
  const handleBecomeHostClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onLoginClick();
      return;
    }

    // Check if user is hotel admin with expired subscription
    const isHotelAdmin = roles && roles.includes('HOTEL_ADMIN');
    const hasExpiredSubscription = isHotelAdmin && subscriptionIsActive === false && subscriptionPlan;

    if (hasExpiredSubscription) {
      e.preventDefault();
      navigate('/subscription');
      return;
    }

    // User is authenticated with active subscription or non-hotel admin
    navigate('/addListing');
  };

  const UserNav = () => {
    if (!isAuthenticated) {
      return (
        <div className="hidden md:flex items-center">
          <Button
            onClick={onLoginClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-700 font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Login/Register
          </Button>
        </div>
      );
    }

    const currentActiveRole = getCurrentActiveRole();
    const roleDisplayInfo = getRoleDisplayInfo(currentActiveRole, true); // Mark as active for bright colors
    const availableRoles = roles.filter(role => {
      // Don't show the current active role
      if (role === currentActiveRole) return false;
      
      // For HOTEL_ADMIN role, only show it if user has valid hotel data
      if (role === 'HOTEL_ADMIN') {
        // Check if hotel ID is valid and user has hotels
        const hasValidHotelId = selectedHotelId && selectedHotelId !== '';
        const hasUserHotels = userHotels && Array.isArray(userHotels) && userHotels.length > 0;
        return hasValidHotelId || hasUserHotels;
      }
      
      return true;
    });

    return (
      <div className="flex items-center gap-2">
        {/* Role Badge beside Avatar */}
        <span className="hidden lg:inline-flex items-center text-sm font-bold text-muted-foreground">
          {roleDisplayInfo.label}
        </span>
        
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-yellow-500">
                <AvatarImage src={pictureURL} alt={userName} />
                <AvatarFallback className="bg-slate-700 text-yellow-500">
                  {userName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="end"
          forceMount
          side="bottom"
          sideOffset={5}
          avoidCollisions={true}
          collisionPadding={10}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div>
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground mt-0.5">
                  {email}
                </p>
              </div>
              {/* Minimal Current Role Badge */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <span className="text-md font-bold text-muted-foreground">{roleDisplayInfo.label}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Dashboard Navigation */}
          {(hasRole("HOTEL_ADMIN") || hasRole("SUPER_ADMIN") || hasRole("GUEST") || hasRole("STAFF")) && (
            <DropdownMenuItem onClick={handleDashboardNavigation} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          )}

          {/* Role Switching Section */}
          {availableRoles.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Switch Role
              </DropdownMenuLabel>
              {availableRoles.map((role) => {
                const roleInfo = getRoleDisplayInfo(role, false);
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
                      <span className="text-xs">{roleInfo.label}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsLogoutConfirmationOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    );
  };

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  const ContactSection = () => (
    // Reduced top padding for mobile spacing
    <div className="space-y-3 pt-3 border-t">
      {/* Fixed uniform left padding */}
      <div className="px-6 pb-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Contact & Support
        </h3>
      </div>
      
      {/* Contact Card */}
      {/* Fixed uniform horizontal margin for mobile edge breathing room */}
      <div className="mx-6 p-3 mb-0 rounded-lg">
        {/* Reduced gap and margin for mobile */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            // Smaller button height for mobile
            className="h-6 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
            onClick={() => {
              window.location.href = 'mailto:chogyalnorbu973@gmail.com';
              setIsMobileMenuOpen(false);
            }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/30"
            onClick={() => {
              onContactClick && onContactClick();
              setIsMobileMenuOpen(false);
            }}
          >
            <Info className="h-3 w-3 mr-1" />
            Info
          </Button>
        </div>
      </div>



      {/* Logout Button */}
      {isAuthenticated && (
        <>
          {/* Fixed uniform horizontal margin */}
          <Separator className="mx-6" />
          {/* Fixed uniform left padding */}
          <div className="px-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setIsLogoutConfirmationOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const MobileUserSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="space-y-3">
          {/* Fixed uniform left padding */}
          <div className="px-6 pb-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          </div>
          {/* Fixed uniform left padding */}
          <div className="space-y-1.5 px-6">
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900" 
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
            >
              Login/Register
            </Button>
          </div>
        </div>
      );
    }

    const currentActiveRole = getCurrentActiveRole();
    const roleDisplayInfo = getRoleDisplayInfo(currentActiveRole, true); // Mark as active for bright colors
    const availableRoles = roles.filter(role => {
      // Don't show the current active role
      if (role === currentActiveRole) return false;
      
      // For HOTEL_ADMIN role, only show it if user has valid hotel data
      if (role === 'HOTEL_ADMIN') {
        // Check if hotel ID is valid and user has hotels
        const hasValidHotelId = selectedHotelId && selectedHotelId !== '';
        const hasUserHotels = userHotels && Array.isArray(userHotels) && userHotels.length > 0;
        return hasValidHotelId || hasUserHotels;
      }
      
      return true;
    });

    return (
      // Reduced vertical spacing
      <div className="space-y-3">
        {/* Fixed uniform left padding */}
        <div className="px-6 pb-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </h3>
        </div>
        
        {/* Updated layout: Avatar on extreme right, user info on left */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* User info on the left */}
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            {/* Minimal Current Role Badge for mobile */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-md font-bold text-muted-foreground">{roleDisplayInfo.label}</span>
            </div>
          </div>
          
          {/* Bigger avatar on the extreme right */}
          <Avatar className="h-14 w-14 border-2 border-primary flex-shrink-0">
            <AvatarImage src={pictureURL} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Fixed uniform left padding */}
        <div className="space-y-0.5 px-6">
          {/* Dashboard Navigation */}
          {(hasRole("HOTEL_ADMIN") || hasRole("SUPER_ADMIN") || hasRole("GUEST") || hasRole("STAFF")) && (
            <>
              <SheetClose asChild>
                <button
                  onClick={() => {
                    handleDashboardNavigation();
                    setIsMobileMenuOpen(false);
                  }}
                  // Reduced vertical padding for mobile
                  className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group w-full"
                >
                  <div className="flex items-center">
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SheetClose>
              {/* Reduced margin */}
              <Separator className="my-1.5" />
            </>
          )}


          {/* Role Switching Section */}
          {availableRoles.length > 0 && (
            <>
              <div className="px-3 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Switch Role
                </p>
              </div>
              {availableRoles.map((role) => {
                const roleInfo = getRoleDisplayInfo(role, false);
                return (
                  <SheetClose asChild key={role}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => {
                        handleRoleSwitch(role);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
                        <span>{roleInfo.label}</span>
                      </div>
                    </Button>
                  </SheetClose>
                );
              })}
              <Separator className="my-1.5" />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-1000 ease-in-out",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "-translate-y-full opacity-0",
        isScrolled
          ? "bg-white shadow-md"
          : "bg-white"
      )}
      style={{
        transform: "translateZ(0)",
        willChange: "transform",
        paddingRight: scrollbarWidth,
      }}
    >
      {/* Mobile-optimized container padding */}
      <div className="w-full px-3 lg:px-8">
        {/* Slightly reduced navbar height for mobile */}
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <EzeeRoomLogo size="default" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button 
                key={link.name} 
                variant="ghost" 
                asChild={true}
                className={cn(
                  "hover:bg-transparent",
                  "text-sm font-medium transition-all",
                  link.isContact || link.isListProperty ? "text-primary" : undefined,
                  "hover:border-b hover:border-b-primary/50 border-b border-b-transparent"
                )}
              >
                {link.isContact ? (
                  <button
                    onClick={() => onContactClick && onContactClick()}
                  >
                    {link.name}
                  </button>
                ) : link.isListProperty ? (
                  <button
                    onClick={handleBecomeHostClick}
                  >
                  {link.name}
                  </button>
                ) : (
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {link.name}
                  </NavLink>
                )}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">{/* <ThemeToggle /> */}</div>
            <div className="hidden md:block">
              <UserNav />
            </div>
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  {/* Optimized mobile menu button size */}
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[320px] flex flex-col">
                  {/* Reduced header padding */}
                  <SheetHeader className="border-b pb-3 flex-shrink-0">
                    <SheetTitle>
                      <Link
                        to="/"
                        className="flex items-center gap-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <EzeeRoomLogo size="small" />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Scrollable main content area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <div className="py-4">
                      <MobileUserSection />
                      <nav className="space-y-1.5 pt-4">
                        <div className="px-6 pb-1">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Navigation
                          </h3>
                        </div>
                        {navLinks.map((link) => (
                          link.isListProperty ? (
                            <button
                              key={link.name}
                              onClick={(e) => {
                                handleBecomeHostClick(e);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group mx-6 w-full"
                            >
                              <div className="flex items-center">
                                <div className="p-1.5 mr-3 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                  <link.icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                  <div className="font-medium">{link.name}</div>
                                  <div className="text-xs text-muted-foreground">{link.description}</div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          ) : (
                            <SheetClose key={link.name} asChild>
                              <Link
                                to={link.path}
                                onClick={() => {
                                  if (link.isContact) {
                                    onContactClick && onContactClick();
                                    setIsMobileMenuOpen(false);
                                  }
                                }}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group mx-6"
                              >
                                <div className="flex items-center">
                                  <div className="p-1.5 mr-3 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                    <link.icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{link.name}</div>
                                    <div className="text-xs text-muted-foreground">{link.description}</div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </SheetClose>
                          )
                        ))}
                        
                        {/* Legal Links */}
                        <div className="px-6 py-2">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Legal
                          </h3>
                          <div className="space-y-1">
                            <SheetClose asChild>
                              <Link
                                to="/terms-and-conditions"
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group"
                              >
                                <div className="flex items-center">
                                  <div className="p-1.5 mr-3 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Terms & Conditions</div>
                                    <div className="text-xs text-muted-foreground">Legal terms and policies</div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </SheetClose>
                            
                            <SheetClose asChild>
                              <Link
                                to="/privacy-policy"
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group"
                              >
                                <div className="flex items-center">
                                  <div className="p-1.5 mr-3 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                    <Shield className="h-4 w-4 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Privacy Policy</div>
                                    <div className="text-xs text-muted-foreground">Data protection info</div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </SheetClose>
                          </div>
                        </div>
                      </nav>

                      <ContactSection />
                    </div>
                  </div>

                  {/* Reduced footer padding */}
                  <div className="border-t pt-3 flex-shrink-0">
                    {/* Reduced padding and margin for mobile */}
                    <div className="px-3 py-2 bg-muted/30 rounded-lg mx-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">Ezeeroom v1.0 🇧🇹</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Beta
                        </Badge>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutConfirmationOpen} onOpenChange={setIsLogoutConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsLogoutConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                logout();
                setIsLogoutConfirmationOpen(false);
                setIsMobileMenuOpen(false);
              }}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hotel Selection Dialog */}
      <HotelSelectionDialog
        isOpen={isHotelSelectionOpen}
        onClose={() => setIsHotelSelectionOpen(false)}
        onHotelSelected={handleHotelSelected}
      />
    </header>
  );
};

export default Navbar;