import React from "react";
import { Hotel, UtensilsCrossed, ArrowRight, CheckCircle } from "lucide-react";

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
      // gradient: "from-blue-500/10 to-purple-500/10",
      iconBg: "text-blue-600 group-hover:text-white",
    },
    {
      icon: UtensilsCrossed,
      title: "Discover Local Restaurants",
      description: "Find authentic eateries and culinary gems that showcase the true flavors of Bhutanese cuisine.",
      to: "/restaurants",
      badge: "New",
      highlights: ["Local Favorites", "Authentic Cuisine", "Verified Reviews"],
      // gradient: "from-orange-500/10 to-red-500/10",
      iconBg: "text-orange-600 group-hover:text-white",
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
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
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
                    {/* Highlights */}
                    <div className="space-y-3">
                      {feature.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Button 
                        variant="ghost" 
                        className="group/btn w-full justify-between p-4 h-auto rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                        disabled
                      >
                        <span className="font-medium">Explore Now</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <a 
                key={feature.title} 
                href={feature.to} 
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
                    {/* Highlights */}
                    <div className="space-y-3">
                      {feature.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Button 
                        variant="ghost" 
                        className="group/btn w-full justify-between p-4 h-auto rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                      >
                        <span className="font-medium">Explore Now</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8">
          <p className="text-muted-foreground mb-4">
            Ready to start your Bhutanese adventure?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Exploring
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Removed grid pattern style */}
    </section>
  );
};

export default FeatureSection;