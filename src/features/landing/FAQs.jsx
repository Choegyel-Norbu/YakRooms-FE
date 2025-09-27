import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Separator } from "@/shared/components/separator";

// Breadcrumb Component
const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors p-2"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span className="text-left">{question}</span>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-2 pt-0">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// FAQ Section Component
const FAQSection = ({ title, faqs, openItems, onToggle }) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-0">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems[`${title}-${index}`]}
            onToggle={() => onToggle(`${title}-${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

const FAQs = () => {
  const [openItems, setOpenItems] = useState({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (key) => {
    setOpenItems(prev => {
      // If the clicked item is already open, close it
      if (prev[key]) {
        return { [key]: false };
      }
      // Otherwise, close all items and open only the clicked one
      return { [key]: true };
    });
  };

  const breadcrumbItems = [
    { label: "FAQs" }
  ];

  // Hotel Onboarding FAQs
  const hotelOnboardingFAQs = [
    {
      question: "How do I register my hotel on EzeeRoom?",
      answer: "To register your hotel, click on 'Add Your Property' in the navigation menu or visit /addListing. You'll need to provide basic information about your hotel including name, location, contact details, and upload photos. Our team will review your application within 24-48 hours."
    },
    {
      question: "What documents do I need to register my hotel?",
      answer: "You'll need: 1) CID (Citizen Identity Document), 2) Trade License, 3) Bank Account Number, 4) High-quality photos of rooms and facilities, 5) Valid contact information and emergency contact details."
    },
    {
      question: "How long does the hotel approval process take?",
      answer: "The approval process typically takes 24-48 hours after you submit all required documents. Our team reviews each application to ensure quality standards and compliance with local regulations. You'll receive SMS notifications after approval."
    },
    {
      question: "What are the commission rates for hotels?",
      answer: "Our commission rates are competitive and vary based on your hotel category and location. Standard rates range from 10-15% per booking. We offer special rates for long-term partnerships and high-volume properties. Contact our partnership team for detailed pricing information."
    },
    {
      question: "How do I manage my hotel listings and bookings?",
      answer: "Once approved, you'll get access to your hotel admin dashboard where you can: update room availability, manage pricing, view bookings, communicate with guests, update hotel information, and track performance analytics. The dashboard is mobile-friendly for on-the-go management."
    },
    {
      question: "Can I set my own pricing and availability?",
      answer: "Yes, you have full control over your pricing and availability. You can set different rates for different seasons, room types, and special events. You can also block dates when rooms are unavailable for maintenance or personal use."
    }
  ];

  // Booking Process FAQs
  const bookingProcessFAQs = [
    {
      question: "How do I make a hotel booking on EzeeRoom?",
      answer: "1) Search for hotels using our search filters, 2) Select your preferred hotel and room type, 3) Choose your check-in and check-out dates, 4) Review the booking details and pricing, 5) Enter guest information and payment details, 6) Confirm your booking. The system will notify your booking confirmation and you can mange it from the dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), debit cards, bank transfers, and mobile payment options. For Bhutanese users, we also accept local payment methods. All payments are processed securely through encrypted channels."
    },
    {
      question: "Can I modify or cancel my booking?",
      answer: "Yes, you can modify or cancel your booking through your account dashboard or by contacting our customer support. Cancellation policies vary by hotel and booking type. Free cancellation is available for most bookings up to 24-48 hours before check-in, depending on the hotel's policy."
    },
    {
      question: "What happens if I need to check-in early or check-out late?",
      answer: "Early check-in and late check-out are subject to availability and may incur additional charges. Contact the hotel directly or our customer support team to arrange these services. We recommend booking an extra night if you need guaranteed early access."
    },
    {
      question: "How do I get my booking confirmation?",
      answer: "You'll receive an instant email confirmation after successful payment. The confirmation includes your booking reference number, hotel details, check-in/out dates, and contact information. You can also view all your bookings in your account dashboard."
    },
    {
      question: "What if I have special requests or requirements?",
      answer: "You can add special requests during the booking process or contact the hotel directly after booking. Common requests include dietary restrictions, accessibility needs, room preferences, or celebration arrangements. We'll do our best to accommodate reasonable requests."
    }
  ];

  // Account & Security FAQs
  const accountSecurityFAQs = [
    {
      question: "How do I create an account?",
      answer: "Creating an account is simple: click 'Sign Up' in the top navigation, enter your email address and create a secure password, verify your email address, and complete your profile. You can also sign up using your Google account for faster registration."
    },
    {
      question: "Is my personal and payment information secure?",
      answer: "Yes, we use industry-standard encryption (SSL/TLS) to protect all data transmission. Payment information is processed through secure, PCI-compliant payment gateways. We never store your complete payment details on our servers. Your personal information is protected according to our privacy policy."
    },
    {
      question: "What if I forget my password?",
      answer: "Click 'Forgot Password' on the login page, enter your registered email address, and we'll send you a secure reset link. The link expires after 24 hours for security. If you continue having issues, contact our support team for assistance."
    },
    {
      question: "Can I have multiple accounts?",
      answer: "We recommend using one account per person to maintain booking history and preferences. However, if you need separate accounts for business and personal use, you can create multiple accounts using different email addresses."
    },
    {
      question: "How do I update my profile information?",
      answer: "Log into your account and go to 'My Profile' in the dashboard. You can update your personal information, contact details, preferences, and notification settings. Changes are saved automatically and take effect immediately."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to 'Account Settings' and select 'Delete Account'. This action is irreversible and will cancel any pending bookings. You'll need to contact customer support if you have active bookings that need to be resolved first."
    }
  ];

  // Support & Contact FAQs
  const supportContactFAQs = [
    {
      question: "How can I contact customer support?",
      answer: "You can reach our support team through: 1) Email: choegyell@gmail.com, 2) Phone: +97517482648, 3) Live chat on our website, 4) Contact form in the help center. We typically respond within 2-4 hours during business hours (9 AM - 6 PM Bhutan time)."
    },
    {
      question: "What are your customer support hours?",
      answer: "Our customer support is available Monday to Friday, 9 AM to 6 PM Bhutan Standard Time (BST). For urgent matters outside these hours, you can email us and we'll respond as soon as possible. Emergency support is available 24/7 for confirmed bookings."
    },
    {
      question: "Do you offer support in multiple languages?",
      answer: "Currently, we provide support in English and Dzongkha (Bhutan's national language). We're working on adding support for other regional languages. For non-English speakers, we can arrange translation services for complex issues."
    },
    {
      question: "What if I have a complaint or feedback?",
      answer: "We value your feedback! You can submit complaints or suggestions through our contact form, email, or by calling our support line. We investigate all complaints thoroughly and aim to resolve issues within 48 hours. Your feedback helps us improve our services."
    },
    {
      question: "Is there a mobile app for EzeeRoom?",
      answer: "Yes, our mobile app is available for both iOS and Android devices. The app provides the same functionality as our website with additional features like push notifications for booking updates, offline access to booking details, and mobile-exclusive deals."
    },
    {
      question: "How do I report a technical issue?",
      answer: "If you encounter technical issues, please: 1) Try refreshing the page or clearing your browser cache, 2) Check your internet connection, 3) Try using a different browser or device, 4) If the issue persists, contact our technical support with details about the problem and your device/browser information."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mr-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about hotel onboarding, booking procedures, and using EzeeRoom.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          <FAQSection
            title="Hotel Onboarding"
            faqs={hotelOnboardingFAQs}
            openItems={openItems}
            onToggle={toggleItem}
          />

          <Separator />

          <FAQSection
            title="Booking Process"
            faqs={bookingProcessFAQs}
            openItems={openItems}
            onToggle={toggleItem}
          />

          <Separator />

          <FAQSection
            title="Account & Security"
            faqs={accountSecurityFAQs}
            openItems={openItems}
            onToggle={toggleItem}
          />

          <Separator />

          <FAQSection
            title="Support & Contact"
            faqs={supportContactFAQs}
            openItems={openItems}
            onToggle={toggleItem}
          />
        </div>
      </div>
    </div>
  );
};

export default FAQs;
