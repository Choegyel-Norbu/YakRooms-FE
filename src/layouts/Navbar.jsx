import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
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
  UtensilsCrossed,
  Mail,
  ChevronRight,
  MessageCircle,
  AlertTriangle,
  Info,
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
import { YakRoomsText } from "@/shared/components";

const Navbar = ({ onLoginClick, onContactClick }) => {
  const { isAuthenticated, logout, userName, email, roles, pictureURL, hasRole, getPrimaryRole, getCurrentActiveRole, switchToRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);

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
      setIsScrolled(window.scrollY > 10);
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
    { name: "Restaurants", path: "/restaurants", icon: UtensilsCrossed, description: "Discover local dining" },
    { name: "About", path: "/aboutus", icon: Info, description: "Learn about us" },
    { name: "Contact", path: "/contact", icon: Mail, description: "Get in touch", isContact: true },
  ];

  // Helper function to get role display info
  const getRoleDisplayInfo = (role) => {
    const roleInfo = {
      'SUPER_ADMIN': { label: 'Admin', color: 'bg-red-100 text-red-800 border-red-200' },
      'HOTEL_ADMIN': { label: 'Hotel Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'STAFF': { label: 'Staff', color: 'bg-green-100 text-green-800 border-green-200' },
      'GUEST': { label: 'Guest', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    };
    return roleInfo[role] || { label: role, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const UserNav = () => {
    if (!isAuthenticated) {
      return (
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" onClick={onLoginClick}>
            Login
          </Button>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
            onClick={onLoginClick}
          >
            Register
          </Button>
        </div>
      );
    }

    const currentActiveRole = getCurrentActiveRole();
    const roleDisplayInfo = getRoleDisplayInfo(currentActiveRole);
    const availableRoles = roles.filter(role => role !== currentActiveRole);

    return (
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
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
              {/* Current Role Badge */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleDisplayInfo.color}`}>
                  {roleDisplayInfo.label}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Dashboard Navigation */}
          {(hasRole("HOTEL_ADMIN") || hasRole("SUPER_ADMIN") || hasRole("GUEST") || hasRole("STAFF")) && (
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          {/* Role Switching Section */}
          {availableRoles.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Switch User
              </DropdownMenuLabel>
              {availableRoles.map((role) => {
                const roleInfo = getRoleDisplayInfo(role);
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => {
                      switchToRole(role);
                      const roleInfo = getRoleDisplayInfo(role);
                      toast(`Switched to ${roleInfo.label} user`, {
                        description: `You are now viewing the application as ${roleInfo.label}`,
                        duration: 3000,
                      });
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{roleInfo.label}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
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
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
            >
              <User className="mr-3 h-4 w-4" />
              Login
            </Button>
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900" 
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
            >
              Register
            </Button>
          </div>
        </div>
      );
    }

    const currentActiveRole = getCurrentActiveRole();
    const roleDisplayInfo = getRoleDisplayInfo(currentActiveRole);
    const availableRoles = roles.filter(role => role !== currentActiveRole);

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
            {/* Current Role Badge */}
            <div className="mt-1">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${roleDisplayInfo.color}`}>
                {roleDisplayInfo.label}
              </span>
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
                <Link
                  to="/dashboard"
                  // Reduced vertical padding for mobile
                  className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center">
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
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
                const roleInfo = getRoleDisplayInfo(role);
                return (
                  <SheetClose asChild key={role}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                      onClick={() => {
                        switchToRole(role);
                        setIsMobileMenuOpen(false);
                        const roleInfo = getRoleDisplayInfo(role);
                        toast(`Switched to ${roleInfo.label} user`, {
                          description: `You are now viewing the application as ${roleInfo.label}`,
                          duration: 3000,
                        });
                      }}
                    >
                      <span>{roleInfo.label}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
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
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 shadow-md backdrop-blur-sm"
          : "bg-background/95"
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
          <Link to="/" className="flex items-center text-primary">
            <YakRoomsText size="default" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              link.isContact ? (
                <Button key={link.name} variant="ghost" onClick={onContactClick}>
                  <span className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary">{link.name}</span>
                </Button>
              ) : (
                <Button key={link.name} variant="ghost" asChild>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )
                    }
                  >
                    {link.name}
                  </NavLink>
                </Button>
              )
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
                {/* Reduced mobile sheet width for better mobile experience */}
                <SheetContent side="right" className="w-[300px] sm:w-[320px] flex flex-col">
                  {/* Reduced header padding */}
                  <SheetHeader className="border-b pb-3 flex-shrink-0">
                    <SheetTitle>
                      <Link
                        to="/"
                        className="flex items-center gap-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <YakRoomsText size="small" />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Scrollable main content area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <div className="py-4">
                      <MobileUserSection />
                      
                      {/* Reduced navigation spacing */}
                      <nav className="space-y-1.5 pt-4">
                        {/* Fixed uniform left padding */}
                        <div className="px-6 pb-1">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Navigation
                          </h3>
                        </div>
                        {navLinks.filter(link => !link.isContact).map((link) => (
                          <SheetClose key={link.name} asChild>
                            <Link
                              to={link.path}
                              // Fixed uniform horizontal margin for mobile
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group mx-6"
                            >
                              <div className="flex items-center">
                                {/* Reduced icon container padding */}
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
                        ))}
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
                          <p className="text-xs font-medium">YakRooms v1.0 🇧🇹</p>
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
    </header>
  );
};

export default Navbar;