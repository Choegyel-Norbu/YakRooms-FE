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
    }
  ];

  const stats = [
    { number: "30+", label: "Partner Properties" },
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
              Become a host
            </Badge>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight">
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

          <Separator className="mb-12" />

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
                    <CardTitle className="text-2xl md:text-3xl">
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
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="mt-16 text-center space-y-6">
            <Separator />
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Why property owners choose EzeeRoom
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Free trial for first month",
                  "Easy property management",
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