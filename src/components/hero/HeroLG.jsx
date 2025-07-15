import React, { useCallback, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  // Fortress,
  Calendar as CalendarIcon,
  Search,
  Users,
} from "lucide-react";

const HeroLG = React.forwardRef((props, forwardedRef) => {
  const localRef = useRef(null);
  const isInView = useInView(localRef, { once: true, amount: 0.3 });
  const [date, setDate] = useState(new Date());

  const setRefs = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <section
      ref={setRefs}
      className="relative flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white px-4 pt-16"
    >
      <div className="absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_top,white,transparent)]"></div>

      <motion.div
        className="relative text-black z-10 flex w-full max-w-5xl flex-col items-center justify-center space-y-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-black tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          Monsoon Charms Await in
          <span className="relative inline-block text-black">
            Phuentsholing
            <svg
              className="absolute -bottom-1.5 left-0 w-full text-black"
              viewBox="0 0 100 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 7C16.6667 2.33333 60.5 -2 99 7"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Your gateway to the Land of the Thunder Dragon. Find the perfect stay
          to begin your journey.
        </motion.p>

        <motion.div variants={itemVariants} className="w-full pt-4">
          <Card className="mx-auto w-full max-w-4xl shadow-lg">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  {/* <Fortress className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /> */}
                  <Input
                    type="text"
                    placeholder="Destination"
                    defaultValue="Phuentsholing, Bhutan"
                    className="h-12 pl-10 text-base"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-12 w-full justify-start text-left text-base font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                </Popover>

                <Button size="lg" className="h-12 text-base md:col-span-1">
                  <Link to="/hotels" className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default HeroLG;
