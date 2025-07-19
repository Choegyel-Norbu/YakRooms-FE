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

// YakRooms Logo Component
const YakRoomsLogo = ({ size = "default" }) => {
  const dimensions = {
    small: { width: 140, height: 36 },
    default: { width: 170, height: 44 },
    large: { width: 200, height: 52 }
  };

  const { width, height } = dimensions[size];
  const scale = height / 80; // Original SVG height is 80

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 80" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
        </linearGradient>
        
        <linearGradient id="yakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#374151", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1F2937", stopOpacity:1}} />
        </linearGradient>
        
        <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#EAB308", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#CA8A04", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      <circle cx="40" cy="40" r="35" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
      <path d="M 15 50 L 25 30 L 35 40 L 45 25 L 55 35 L 65 50 Z" fill="url(#mountainGradient)" opacity="0.7"/>
      <rect x="30" y="35" width="20" height="15" fill="#8B5CF6" rx="1"/>
      <path d="M 25 35 L 40 25 L 55 35 Z" fill="url(#roofGradient)"/>
      <rect x="38" y="25" width="4" height="3" fill="#CA8A04" rx="1"/>
      <rect x="37" y="42" width="6" height="8" fill="#7C3AED" rx="1"/>
      <rect x="32" y="38" width="3" height="3" fill="#60A5FA" rx="0.5"/>
      <rect x="45" y="38" width="3" height="3" fill="#60A5FA" rx="0.5"/>
      <ellipse cx="20" cy="45" rx="6" ry="3" fill="url(#yakGradient)"/>
      <ellipse cx="17" cy="43" rx="2" ry="2" fill="url(#yakGradient)"/>
      <path d="M 15 42 Q 14 40 16 41" stroke="#374151" strokeWidth="1" fill="none"/>
      <path d="M 18 42 Q 19 40 17 41" stroke="#374151" strokeWidth="1" fill="none"/>
      <circle cx="16" cy="42" r="0.5" fill="#1F2937"/>
      
      <text x="90" y="35" fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="24" fontWeight="700" fill="#1E40AF">
        Yak
      </text>
      <text x="130" y="35" fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="24" fontWeight="700" fill="#EAB308">
        Rooms
      </text>
      
      <text x="90" y="50" fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="9" fontWeight="400" fill="#6B7280">
        Authentic Bhutanese Hospitality
      </text>
      
      <circle cx="165" cy="25" r="2" fill="#EAB308" opacity="0.6"/>
      <circle cx="175" cy="30" r="1.5" fill="#3B82F6" opacity="0.5"/>
      <circle cx="185" cy="20" r="1" fill="#8B5CF6" opacity="0.7"/>
    </svg>
  );
};

const Navbar = ({ onLoginClick }) => {
  const { isAuthenticated, logout, userName, email } = useAuth();
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
    { name: "Contact", path: "/contact", icon: Mail, description: "Get in touch" },
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
          <DropdownMenuItem asChild>
            <Link to="/hotelAdmin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
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

  const MobileUserSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="space-y-3 pt-6 border-t">
          <div className="space-y-2">
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
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-muted/50">
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

        <div className="space-y-1">
          <SheetClose asChild>
            <Link
              to="/hotelAdmin"
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
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center text-primary">
            <YakRoomsLogo size="default" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
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
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">{/* <ThemeToggle /> */}</div>

            <UserNav />
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
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
                        <YakRoomsLogo size="small" />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 py-6">
                    <nav className="space-y-2">
                      <div className="px-3 pb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Navigation
                        </h3>
                      </div>
                      {navLinks.map((link) => (
                        <SheetClose key={link.name} asChild>
                          <Link
                            to={link.path}
                            className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors group"
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

                    <MobileUserSection />
                  </div>

                  <div className="border-t pt-4">
                    <div className="px-3 py-2 bg-muted/30 rounded-lg">
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