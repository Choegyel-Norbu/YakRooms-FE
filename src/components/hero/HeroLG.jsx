import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";

const HeroLG = () => {
  const [date, setDate] = useState(new Date());

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-16">
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center space-y-8 text-center">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <MapPin className="mr-1 h-3 w-3" />
              Gateway to Bhutan
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Discover Authentic Stays in
            <span className="block text-primary">Bhutan with YakRooms</span>
          </h1>

          <p className="mx-auto max-w-2xl text-14 text-muted-foreground sm:text-xl">
            Your convenient way to book locally. Discover hotels and restaurants
            in Bhutan with just a few taps.
          </p>
        </div>

        <Separator className="w-24" />

        {/* Features Section */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Real-time availability</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Verified accommodations</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Local recommendations</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl space-y-4 ">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destination"
                className="h-12 pl-10 text-base"
              />
            </div>

            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start text-left text-base font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover> */}

            <Button
              size="lg"
              className="h-12 text-base bg-yellow-500 hover:bg-yellow-600 text-slate-900 cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4 " />
              Search Hotels
            </Button>
          </div>

          {/* <p className="text-sm text-muted-foreground">
            Discover handpicked accommodations from budget-friendly hotels
          </p> */}
        </div>

        <Separator className="w-full max-w-2xl" />

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-base text-muted-foreground">
            Ready to explore Bhutan's cultural heart?
          </p>
          <Button variant="outline" size="lg" className="group">
            Start Exploring
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroLG;
