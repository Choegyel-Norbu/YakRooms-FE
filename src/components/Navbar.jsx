import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
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
  Phone,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/services/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// YakRooms Text Logo Component
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    small: "text-lg font-bold",
    default: "text-xl font-bold",
    large: "text-2xl font-bold"
  };

  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const Navbar = ({ onLoginClick, onContactClick }) => {
  const { isAuthenticated, logout, userName, email, role } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

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
    { name: "Hotels", path: "/hotel", icon: Hotel, description: "Find accommodations" },
    { name: "Restaurants", path: "/restaurants", icon: UtensilsCrossed, description: "Discover local dining" },
    { name: "Contact", path: "/contact", icon: Mail, description: "Get in touch", isContact: true },
  ];

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

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-yellow-500">
              <AvatarImage src={""} alt={userName} />
              <AvatarFallback className="bg-slate-700 text-yellow-500">
                {userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
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
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(role === "HOTEL_ADMIN" || role === "SUPER_ADMIN") && (
            <DropdownMenuItem asChild>
              <Link to={role === "HOTEL_ADMIN" ? "/hotelAdmin" : "/adminDashboard"}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
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
    <div className="space-y-3 pt-4 border-t">
      <div className="px-3 pb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Contact & Support
        </h3>
      </div>
      
      {/* Contact Card */}
      <div className="mx-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50 border border-blue-100 dark:from-blue-950/20 dark:to-yellow-950/20 dark:border-blue-800/30">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">C</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Chogyal Norbu
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              chogyalnorbu973@gmail.com
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
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
                className="h-7 px-2 text-xs border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/30"
                onClick={() => {
                  onContactClick && onContactClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Options */}
      <div className="space-y-1 px-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary"
          onClick={() => {
            window.location.href = 'tel:+97517123456'; // Add actual phone number
            setIsMobileMenuOpen(false);
          }}
        >
          <Phone className="mr-2 h-3 w-3" />
          Call Support
        </Button>
      </div>

      {/* Logout Button */}
      {isAuthenticated && (
        <>
          <Separator className="mx-3" />
          <div className="px-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Log out
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
          <div className="px-3 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          </div>
          <div className="space-y-2 px-3">
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

    return (
      <div className="space-y-4">
        <div className="px-3 pb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </h3>
        </div>
        
        <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-muted/50 mx-3">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={""} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        <div className="space-y-1 px-3">
          {(role === "HOTEL_ADMIN" || role === "SUPER_ADMIN") && (
            <>
              <SheetClose asChild>
                <Link
                  to={role === "HOTEL_ADMIN" ? "/hotelAdmin" : "/adminDashboard"}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center">
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    Dashboard
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </SheetClose>
              <Separator className="my-2" />
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
      <div className="w-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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
                  <Button variant="ghost" size="icon" className="h-14 w-14 sm:h-12 sm:w-12">
                    <Menu className="h-8 w-8 sm:h-7 sm:w-7" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[380px] flex flex-col">
                  <SheetHeader className="border-b pb-4">
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

                  <div className="flex-1 py-6">
                    <MobileUserSection />
                    
                    <nav className="space-y-2 pt-6">
                      <div className="px-3 pb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Navigation
                        </h3>
                      </div>
                      {navLinks.filter(link => !link.isContact).map((link) => (
                        <SheetClose key={link.name} asChild>
                          <Link
                            to={link.path}
                            className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group mx-3"
                          >
                            <div className="flex items-center">
                              <div className="p-2 mr-3 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
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

                  <div className="border-t pt-4">
                    <div className="px-3 py-2 bg-muted/30 rounded-lg mx-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">YakRooms v2.0</p>
                          <p className="text-xs text-muted-foreground">Made in Bhutan 🇧🇹</p>
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
    </header>
  );
};

export default Navbar;