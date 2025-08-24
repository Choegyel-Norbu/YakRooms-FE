import React from "react";
import { BadgeCheck, Hotel, Utensils, ArrowRight, Building2, Star, MapPin } from "lucide-react";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { YakRoomsText } from "@/shared/components";

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
            
            <div>
              <YakRoomsText size="default" />
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