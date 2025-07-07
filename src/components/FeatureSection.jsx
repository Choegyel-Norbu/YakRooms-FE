import React from "react";
import { Typography } from "@material-tailwind/react";
import FeatureCard from "./cards/FeatureCard";
import {
  Hotel,
  UtensilsCrossed,
  BookOpenCheck,
  Handshake,
  ShieldCheck,
} from "lucide-react";

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
    },
    {
      icon: BookOpenCheck,
      title: "See Menus & Prices Live",
      description: "Browse up-to-date menus with transparent pricing.",
    },
    {
      icon: Handshake,
      title: "Empowering Local Businesses",
      description: "Support local homestays and restaurants to thrive.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Listings & Reviews",
      description: "Make confident decisions with trusted, real-world reviews.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <Typography variant="h3" className="text-center mb-4 text-slate-900">
          Why Choose <span className="text-yellow-400">YakRooms</span>?
        </Typography>
        <Typography
          variant="paragraph"
          className="text-center text-slate-600 max-w-3xl mx-auto mb-12"
        >
          We bridge the gap between travelers and authentic Bhutanese
          experiences. From cozy homestays to bustling local restaurants,
          discover the heart of Bhutan with confidence and ease.
        </Typography>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 cursor-pointer">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              to={feature.to}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
