import React, { useState, useEffect, useRef } from "react";

import LoginModal from "../components/LoginModal";
import "../assets/css/custom.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { useInView } from "react-intersection-observer";
import HeroLG from "../components/hero/HeroLG";
import RatingWidget from "../components/RatingWidget";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import FeatureSection from "../components/FeatureSection";
import HowItWorksSection from "../components/HowItWorksSection";
import TopHighlightsSection from "../components/TopHighlightsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CTASection from "../components/CTASection";
import ListYourPropertySection from "../components/ListYourPropertySection";
import TrustIndicatorsSection from "../components/TrustIndicatorsSection";

const Landing = () => {
  const [loginShow, setLoginShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const certiRef = useRef(null);
  const [rating, setRating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const contactMeRef = useRef(null);
  const homeRef = useRef(null);
  const footerRef = useRef(null);
  const [hasRated, setHasRated] = useState(
    localStorage.getItem("hasRated") === "true"
  );

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [ref, inView] = useInView({
    triggerOnce: false, // Set true if you want it only once
    threshold: 0.1,
  });

  const toggleLogin = () => {
    setLoginShow(!loginShow);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration
      once: true, // only animate once
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRating(true);
    }, 3 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!dismissed) return;

    const interval = setInterval(() => {
      setRating(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dismissed]);

  const handleDismiss = () => {
    setRating(false);
    setDismissed(true);
  };

  const handleSubmit = () => {
    // Your submit logic here
    setRating(false);
    setDismissed(false); // Stop showing if submitted
  };

  const cardVariants = {
    offscreen: { opacity: 0, x: 100 },
    onscreen: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const heroVariants = {
    offscreen: { y: 100 },
    onscreen: { y: -30, transition: { duration: 0.8 } },
  };

  const fadeInUp = {
    offscreen: {
      opacity: 0,
      y: 40,
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const MenuSlideIn = {
    offscreen: {
      opacity: 0,
      x: -300, // Start off-screen to the left
    },
    onscreen: {
      opacity: 1,
      x: 0, // Slide in to normal position
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      x: -300, // Slide back out to the left
      transition: {
        ease: "easeIn",
        duration: 0.3,
      },
    },
  };

  const closeLogin = () => {
    setLoginShow(false);
  };
  const menuButtonRef = useRef(null);
  const sideBarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (certiRef.current && !certiRef.current.contains(event.target)) {
        setCertModalOpen(false);
      }
      if (
        sideBarRef.current &&
        !sideBarRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [certiRef]);

  return (
    <>
      <div className=" relative bg-white text-black dark:text-white">
        {/* Navigation */}
        <Navbar onLoginClick={toggleLogin} onContactClick={() => footerRef.current?.scrollIntoView({ behavior: 'smooth' })} />

        {/* LoginModal */}
        {loginShow && <LoginModal onClose={closeLogin} />}

        <HeroLG
          ref={homeRef}
          onScroll={() =>
            contactMeRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <TopHighlightsSection />
        <FeatureSection />
        <ListYourPropertySection />
        
        <Footer ref={footerRef} />
      </div>
    </>
  );
};

export default Landing;
