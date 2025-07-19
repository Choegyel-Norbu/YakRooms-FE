import React from "react";
import { BadgeCheck, Hotel, Utensils, ArrowRight, Building2, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function YakRoomsAdCard() {
  const features = [
    {
      icon: BadgeCheck,
      title: "Real-time Availability",
      description: "Instant booking confirmation with live room availability",
      color: "text-green-600"
    },
    {
      icon: Hotel,
      title: "Verified Accommodations",
      description: "Curated selection of hotels and authentic homestays",
      color: "text-blue-600"
    },
    {
      icon: Utensils,
      title: "Local Dining Guide",
      description: "Discover restaurants with updated menus and pricing",
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">YakRooms</h2>
              <Badge variant="secondary" className="text-xs">
                Bhutan's #1 Platform
              </Badge>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your gateway to authentic Bhutanese hospitality and unforgettable travel experiences
          </p>
        </div>

        {/* Features Section */}
        <div className="p-6 space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <Icon className={`w-4 h-4 ${feature.color} group-hover:text-primary transition-colors`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Section */}
        

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                🇧🇹 Made in Bhutan
              </Badge>
              <span className="text-xs text-muted-foreground">
                Trusted by thousands
              </span>
            </div>
            
            <Button size="sm" className="h-8 px-3 text-xs">
              Explore Now
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="px-6 py-3 bg-primary/5 border-t">
          <p className="text-xs text-center text-muted-foreground">
            Empowering Bhutanese hospitality & authentic travel experiences
          </p>
        </div>
      </CardContent>
    </Card>
  );
}