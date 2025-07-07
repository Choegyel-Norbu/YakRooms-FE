import React, { useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import qoute2 from "../../assets/images/qoute2.png";
import qoute1 from "../../assets/images/qoute1.png";
import person from "../../assets/images/person.jpeg";
import { Link } from "react-router-dom";

const HeroLG = React.forwardRef(({ onScroll }, forwardedRef) => {
  const localRef = useRef(null);
  const isInView = useInView(localRef, { once: true, amount: 0.5 });

  // Combine the forwarded ref with the local ref
  const setRefs = useCallback(
    (node) => {
      // Set the local ref
      localRef.current = node;

      // Set the forwarded ref
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
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const imageItemVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 10,
        damping: 15,
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 10,
        delay: 0.5,
      },
    },
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      {/* Background with Bhutanese elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50">
        <img
          src="https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2096&q=80"
          alt="Bhutanese landscape with mountains and traditional architecture"
          className="h-full w-full object-cover"
        />
        {/* Decorative prayer flags */}
        <div className="absolute top-10 right-10 hidden md:block">
          <svg
            width="120"
            height="80"
            viewBox="0 0 120 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simplified prayer flag SVG */}
            <rect x="10" y="10" width="20" height="50" fill="#FF4D4F" />
            <rect x="40" y="15" width="20" height="45" fill="#13C2C2" />
            <rect x="70" y="20" width="20" height="40" fill="#FAAD14" />
            <rect x="100" y="25" width="20" height="35" fill="#52C41A" />
            <path d="M0 0L120 0L115 5L5 5L0 0Z" fill="#D9D9D9" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-4xl space-y-6">
          {/* Headline with Bhutanese touch */}
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Discover <span className="text-[#FFD666]">Authentic</span> Bhutanese
            Stays & Food
          </h1>

          {/* Subtext */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl">
            Book hotels, explore local restaurants, and check real-time
            prices—all in one place.
          </p>

          {/* Search CTA */}
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
            <Link to="/hotel">
              <button className="rounded-lg bg-[#FF4D4F] px-6 cursor-pointer py-3 font-medium hover:bg-[#FF7875] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F] focus:ring-offset-2">
                Search Hotels
              </button>
            </Link>

            <button className="rounded-lg border-2 border-white bg-white/10 px-6 py-3 font-medium backdrop-blur-sm hover:bg-white/20">
              Explore Menus
            </button>
          </div>
        </div>
      </div>

      {/* Decorative yak illustration at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30 5C35 5 40 10 40 15C40 20 35 25 30 25C25 25 20 20 20 15C20 10 25 5 30 5Z"
            fill="#D9D9D9"
          />
          <path d="M25 25L20 35L25 40L35 40L40 35L35 25" fill="#8C8C8C" />
          <path d="M30 15L30 25" stroke="#595959" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
});

export default HeroLG;
