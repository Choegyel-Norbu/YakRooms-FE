import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Shield, 
  Star,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

// ShadCN UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/AuthProvider";

const ListYourPropertySection = ({ onLoginClick }) => {
  const { isAuthenticated, hotelId, getCurrentActiveRole } = useAuth();

  const handleListPropertyClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onLoginClick();
    }
  };

  // Check if user already has a hotel registered
  const hasHotelRegistered = isAuthenticated && hotelId;
  
  // Get current active role
  const activeRole = getCurrentActiveRole();
  
  // Check if user is a Guest
  const isGuest = activeRole === "GUEST";

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Boost your bookings by 40% on average",
    },
    {
      icon: Users,
      title: "Reach More Travelers",
      description: "Access thousands of potential guests",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Guaranteed payments with fraud protection",
    },
  ];

  const stats = [
    { number: "10+", label: "Partner Properties" },
    { number: "95%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <section className="lg:py-20 px-4 bg-muted/20">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Partner Program
            </Badge>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight">
              Partner with{" "}
              <span className="text-primary">
                YakRooms
              </span>
              & Grow Your Business
            </h2>
            <p className="text-md text-muted-foreground max-w-3xl mx-auto">
              Join our network of hotels, homestays, and restaurants. Reach more
              travelers, manage your bookings with ease, and become part of
              Bhutan's leading hospitality platform.
            </p>
          </div>

          <Separator className="mb-12" />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              {/* Stats */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="sm:p-6">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-500 mb-1">
                        {stat.number}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Why Partner with Us?</h3>
                {benefits.map((benefit, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <benefit.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {benefit.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Side - CTA Card */}
            <div>
              <Card className="hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Home className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl md:text-3xl">
                      Ready to Get Started?
                    </CardTitle>
                    <CardDescription className="text-sm">
                      List your property in minutes and start receiving bookings today. 
                      Our team will guide you through the entire process.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    {!isAuthenticated ? (
                      // User is not authenticated
                      <Button 
                        size="lg" 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-primary cursor-pointer"
                        onClick={handleListPropertyClick}
                      >
                        <span>List Your Property Today</span>
                        <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                      </Button>
                    ) : isGuest ? (
                      // User is authenticated as Guest
                      hasHotelRegistered ? (
                        // Guest has hotel registered - show guest dashboard option
                        <div className="text-center space-y-3">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-center space-x-2 text-green-700">
                              <Shield className="h-5 w-5" />
                              <span className="font-medium">Property Already Listed</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              You already have a property listed with YakRooms. 
                              Access your guest dashboard to manage your bookings.
                            </p>
                          </div>
                          <Link to="/guestDashboard" className="block">
                            <Button size="lg" className="w-full bg-white hover:bg-white cursor-pointer text-yellow-500">
                              <span>Go to Guest Dashboard</span>
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        // Guest without hotel - show add property option
                        <Link to="/addListing" className="block">
                          <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-primary cursor-pointer">
                            <span>Add Your Property</span>
                            <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                          </Button>
                        </Link>
                      )
                    ) : hasHotelRegistered ? (
                      // User already has a hotel registered
                      <div className="text-center space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-center space-x-2 text-green-700">
                            <Shield className="h-5 w-5" />
                            <span className="font-medium">Property Already Listed</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            You already have a property listed with YakRooms. 
                            Manage your property from your dashboard.
                          </p>
                        </div>
                        <Link to="/hotelAdmin" className="block">
                          <Button size="lg" className="w-full bg-white hover:bg-white cursor-pointer text-yellow-500">
                            <span>Go to Dashboard</span>
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      // User is authenticated (Hotel Admin/Staff) but doesn't have a hotel
                      <Link to="/addListing" className="block">
                        <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-primary cursor-pointer">
                          <span>List Your Property Today</span>
                          <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </Button>
                      </Link>
                    )}
                    
                    <Button variant="outline" size="lg" className="w-full">
                      Learn More About Partnership
                    </Button>
                  </div>

                  <Separator />

                  {/* Trust indicators */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-primary mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm  text-yelllow-500">
                      Listed 10+ partners
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="mt-16 text-center space-y-6">
            <Separator />
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Why property owners choose YakRooms
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "No commission fees for first month",
                  "Easy property management",
                  "Marketing support included",
                  "Real-time analytics dashboard"
                ].map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListYourPropertySection;