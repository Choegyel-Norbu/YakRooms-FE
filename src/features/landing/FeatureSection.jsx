import React from "react";
import { Hotel, ArrowRight, CheckCircle, Sparkles, MapPin, Star, Users, Shield, UserPlus, Search, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

// ShadCN UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import { cn } from "@/shared/utils";

const FeatureSection = () => {
  const features = [];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Unified Hotel Booking Adventure Section */}
        <div className="text-center pt-12">
          <div className="max-w-6xl mx-auto">
            <div className="p-8 md:p-12 border border-border/50 rounded-2xl relative overflow-hidden">
              {/* Background Decorative Elements */}
              <div className="absolute top-4 left-4 w-20 h-20 bg-primary/1 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-yellow-500/5 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/3 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 space-y-8">
                {/* Adventure Header */}
                <div className="space-y-4">
                  {/* <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-6 h-6 text-primary animate-bounce" />
                    <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                      🏔️ Ready for Your Bhutanese Adventure?
                    </Badge>
                  </div> */}
                  
                  <h2 className="text-3xl md:text-4xl lg:text-3xl font-bold text-foreground leading-tight">
                    Start Your Journey with
                    <span className="block text-primary">Real-time Hotel Booking</span>
                  </h2>
                  
                  <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Discover the perfect accommodation wherever your journey takes you. 
                    EzeeRoom connects you with authentic stays and comfortable rooms in unfamiliar destinations, 
                    making every adventure feel like home.
                  </p>
                </div>

                {/* Interactive Booking Preview */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-border/30 max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                    {/* Step 1 */}
                    <div className="text-center space-y-2 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Browse Hotels</h3>
                      <p className="text-xs text-muted-foreground max-w-24">Discover verified accommodations</p>
                    </div>
                    
                    {/* Arrow 1 */}
                    <div className="hidden md:flex">
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    
                    {/* Step 2 */}
                    <div className="text-center space-y-2 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Book Instantly</h3>
                      <p className="text-xs text-muted-foreground max-w-24">Real-time availability</p>
                    </div>
                    
                    {/* Arrow 2 */}
                    {/* <div className="hidden md:flex">
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                    </div> */}
                    
                    {/* Step 3 - Explore Hotels Now */}
                    {/* <div className="text-center space-y-2 group">
                      <Link to="/hotels">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl">
                          <Hotel className="w-6 h-6 text-white group-hover:animate-bounce" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Explore Hotels</h3>
                        <p className="text-xs text-muted-foreground max-w-24">Start your adventure</p>
                      </Link>
                    </div> */}
                  </div>
                </div>

                {/* Become a Host Button */}
                {/* <div className="flex justify-center">
                  <Link to="/addListing">
                    <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold group border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                      <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Become a Host</span>
                    </Button>
                  </Link>
                </div> */}

                {/* Trust Indicators with Animation */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/50">
                  <div className="flex items-center space-x-2 group">
                    <Shield className="w-5 h-5 text-green-500 group-hover:animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">Secure Booking</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <Star className="w-5 h-5 text-yellow-500 group-hover:animate-spin" />
                    <span className="text-sm font-medium text-muted-foreground">Verified Properties</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <Users className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-muted-foreground">24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <CheckCircle className="w-5 h-5 text-emerald-500 group-hover:animate-bounce" />
                    <span className="text-sm font-medium text-muted-foreground">Instant Confirmation</span>
                  </div>
                </div>

                {/* Fun Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-muted-foreground">Happy Travelers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">20</div>
                    <div className="text-sm text-muted-foreground">Dzongkhags Covered</div>
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