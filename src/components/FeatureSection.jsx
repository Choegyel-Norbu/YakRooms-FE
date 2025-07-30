import React from "react";
import { Hotel, UtensilsCrossed, ArrowRight, CheckCircle, Sparkles, MapPin, Star, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

// ShadCN UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const FeatureSection = () => {
  const features = [
    {
      icon: Hotel,
      title: "Real-time Hotel Booking",
      description: "Instantly book verified rooms across Bhutan with real-time availability and instant confirmation.",
      to: "/hotel",
      badge: "Popular",
      highlights: ["Instant Confirmation", "24/7 Support", "Best Price Guarantee"],
      iconBg: "text-blue-600 group-hover:text-white",
      stats: { bookings: "10K+", satisfaction: "98%" }
    },
    {
      icon: UtensilsCrossed,
      title: "Discover Local Restaurants",
      description: "Find authentic eateries and culinary gems that showcase the true flavors of Bhutanese cuisine.",
      to: "/restaurants",
      badge: "New",
      highlights: ["Local Favorites", "Authentic Cuisine", "Verified Reviews"],
      iconBg: "text-orange-600 group-hover:text-white",
      stats: { restaurants: "200+", reviews: "5K+" }
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="px-4 py-1.5">
              🏔️ Authentic Bhutanese Experience
            </Badge>
            <h2 className="text-4xl md:text-3xl font-semibold tracking-tight text-foreground">
              Why Choose{" "}
              <span className="text-primary">
                YakRooms
              </span>
              ?
            </h2>
          </div>
          <p className="text-md text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We bridge the gap between travelers and authentic Bhutanese
            experiences. From cozy homestays to bustling local restaurants,
            discover the heart of Bhutan with confidence and ease.
          </p>
        </div>

        <Separator className="my-12 opacity-50" />

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            feature.title === "Discover Local Restaurants" ? (
              <div
                key={feature.title}
                className="block h-full group cursor-not-allowed opacity-70"
                tabIndex={-1}
                aria-disabled="true"
              >
                <Card
                  className={cn(
                    "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out h-full",
                    "transform hover:-translate-y-2 hover:scale-[1.02]",
                    "backdrop-blur-sm border border-border/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant={feature.badge === "Popular" ? "default" : "secondary"}
                      className="font-medium"
                    >
                      {feature.badge}
                    </Badge>
                  </div>

                  <CardHeader className="relative z-10 pb-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "p-4 rounded-2xl transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:rotate-3",
                        feature.iconBg
                      )}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{feature.stats?.restaurants || feature.stats?.bookings}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                      {feature.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced CTA Button */}
                    <div className="pt-4">
                      <Button 
                        variant="ghost" 
                        className="group/btn w-full justify-between p-4 h-auto rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                        disabled
                      >
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium">Coming Soon</span>
                        </div>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Link 
                key={feature.title} 
                to={feature.to} 
                className="block h-full group"
              >
                <Card
                  className={cn(
                    "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out h-full",
                    "transform hover:-translate-y-2 hover:scale-[1.02]",
                    "backdrop-blur-sm border border-border/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant={feature.badge === "Popular" ? "default" : "secondary"}
                      className="font-medium"
                    >
                      {feature.badge}
                    </Badge>
                  </div>

                  <CardHeader className="relative z-10 pb-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "p-4 rounded-2xl transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:rotate-3",
                        feature.iconBg
                      )}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{feature.stats?.restaurants || feature.stats?.bookings}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                      {feature.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced CTA Button */}
                    <div className="pt-4">
                      <Button 
                        variant="ghost" 
                        className="group/btn w-full justify-between p-4 h-auto rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium">Explore Now</span>
                        </div>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center pt-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/5 to-yellow-500/5  p-8 border border-border/50">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className="px-3 py-1">
                    🏔️ Bhutan's Premier Platform
                  </Badge>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Ready to start your Bhutanese adventure?
                </h3>
                
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of travelers who trust YakRooms for authentic Bhutanese experiences. 
                  From the majestic Himalayas to vibrant local culture, your journey starts here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/hotels">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 group">
                      <span>Start Exploring</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  
                  <Link to="/about">
                    <Button size="lg" variant="outline" className="group">
                      <span>Learn More</span>
                      <Shield className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Secure Booking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Verified Properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;