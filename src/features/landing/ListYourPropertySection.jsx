import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  TrendingUp, 
  Users, 
  Star,
  ArrowUpRight,
  Sparkles,
  Settings,
  Search,
  Calendar,
  BarChart3,
  Smartphone,
  Clock,
  MapPin,
  AlertTriangle,
  CreditCard
} from "lucide-react";

// ShadCN UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import { cn } from "@/shared/utils";
import { useAuth } from "@/features/authentication";

const ListYourPropertySection = ({ onLoginClick }) => {
  const { 
    isAuthenticated, 
    roles, 
    subscriptionIsActive, 
    subscriptionPlan 
  } = useAuth();

  // Check if user is hotel admin with expired subscription
  const isHotelAdmin = roles && roles.includes('HOTEL_ADMIN');
  const hasExpiredSubscription = isHotelAdmin && subscriptionIsActive === false && subscriptionPlan;
  
  const handleListPropertyClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onLoginClick();
    }
  };


  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Boost your booking visibility by 40% on average",
    },
    {
      icon: Users,
      title: "Reach More Travelers",
      description: "Access hundreds of potential guests",
    },
    {
      icon: Settings,
      title: "Easy Property Management",
      description: "Manage bookings, pricing, and availability from one dashboard",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Receive payments safely and securely through our trusted payment system",
    }
  ];

  const stats = [
    { number: "30+", label: "Partner Properties" },
    { number: "95%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <section className="pb-20 px-4 bg-muted/20 md:mt-10">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Become a host
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">
              Partner with{" "}
              <span className="text-primary">
                EzeeRoom{" "}
              </span>
              & Grow Your Business
            </h2>
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              Join our network of hotels and homestays. Reach more
              travelers, manage your bookings with ease, and become part of
              Bhutan's hospitality platform.
            </p>
          </div>

          <Separator className="" />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              {/* Stats */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* {stats.map((stat, index) => (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="sm:p-6">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-500 mb-1">
                        {stat.number}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))} */}
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-center sm:text-left">Why Partner with Us?</h3>
                {benefits.map((benefit, index) => (
                  <div key={index} className="hover:shadow-md transition-all duration-200 group">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - CTA Card */}
            <div>
              <div className="hover:shadow-lg transition-shadow duration-300 group p-2">
                <CardHeader className="text-center space-y-4">
                  {/* <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Home className="h-8 w-8" />
                  </div> */}
                  <div className="space-y-2 mt-4">
                    <CardTitle className="text-2xl">
                      Ready to Get Started?
                    </CardTitle>
                    <CardDescription className="text-sm">
                      List your property in minutes and start receiving bookings today. 
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
                    ) : hasExpiredSubscription ? (
                      // User is hotel admin with expired subscription
                      <div className="space-y-3">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-red-800">Subscription Expired</h4>
                              <p className="text-sm text-red-700">
                                Your subscription has expired. Please renew your subscription to continue listing properties and managing bookings.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link to="/subscription" className="block">
                          <Button size="lg" className="w-full bg-red-500 hover:bg-red-600 text-white">
                            <CreditCard className="mr-2 h-5 w-5" />
                            <span>Renew Subscription</span>
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      // User is authenticated with active subscription or non-hotel admin
                      <Link to="/addListing" className="block">
                        <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-primary cursor-pointer">
                          <span>List Your Property Today</span>
                          <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </Button>
                      </Link>
                    )}
                    
                    {/* <Button variant="outline" size="lg" className="w-full">
                      Learn More About Partnership
                    </Button> */}
                  </div>

                  <Separator />

                  {/* Trust indicators */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm  text-yelllow-500">
                      Listed 10+ partners
                    </p>
                  </div>
                </CardContent>

                {/* Property Image Section */}
                <div className="relative mt-6 rounded-lg overflow-hidden">
                  <div className="relative h-64 md:h-80 w-full group">
                    {/* Image with gradient overlay */}
                    <img
                      src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80"
                      alt="Beautiful property ready for listing"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to a placeholder if image doesn't exist
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
                      }}
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    
                    {/* Bottom text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <p className="text-sm font-medium">
                          Join hundreds of successful property owners
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          {/* <div className="mt-16 text-center space-y-6">
            <Separator />
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Why property owners choose EzeeRoom
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Free trial for first two month",
                  "Easy hotel management",
                  "Real-time analytics dashboard",
                  "Secure online payments"
                ].map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default ListYourPropertySection;