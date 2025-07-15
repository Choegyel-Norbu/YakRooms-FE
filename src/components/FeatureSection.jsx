import React from "react";
import { Hotel, UtensilsCrossed } from "lucide-react";

// ShadCN UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const FeatureSection = () => {
  const features = [
    {
      icon: Hotel,
      title: "Real-time Hotel Booking",
      description: "Instantly book verified rooms across Bhutan.",
      to: "/hotel",
    },
    {
      icon: UtensilsCrossed,
      title: "Discover Local Restaurants",
      description: "Find authentic eateries and culinary gems near you.",
      to: "/restaurants",
    },
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Why Choose <span className="text-primary">YakRooms</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We bridge the gap between travelers and authentic Bhutanese
            experiences. From cozy homestays to bustling local restaurants,
            discover the heart of Bhutan with confidence and ease.
          </p>
        </div>

        <Separator className="my-8" />

        {/* Features Grid - Centered */}
        <div className="flex justify-center">
          {" "}
          {/* Added flex and justify-center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
            {" "}
            {/* Adjusted grid and added max-w-lg to constrain width */}
            {features.map((feature) => (
              <a key={feature.title} href={feature.to} className="block h-full">
                <Card
                  className={cn(
                    "group flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer h-full",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  <CardHeader className="flex flex-col items-center pb-4">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 ease-in-out">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-start">
                    <CardDescription className="text-sm text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
