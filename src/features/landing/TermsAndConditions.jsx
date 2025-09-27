import React, { useState, useEffect } from "react";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = useState({
    acceptance: true,
    services: true,
    userTerms: true,
    hotelOwnerTerms: true,
    cancellation: true,
    payments: true,
    liability: true,
    privacy: true,
    modifications: true,
    contact: true
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ icon: Icon, title, isExpanded, onToggle, badge }) => (
    <div 
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-sm md:text-base font-semibold text-foreground">{title}</h2>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );

  const SectionContent = ({ children, isExpanded }) => (
    <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className=" border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-3xl font-bold text-foreground">
                Terms and Conditions
              </h1>
            </div>
            <p className="text-md text-muted-foreground mb-6">
              Please read these terms carefully before using EzeeRoom services
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {/* <Calendar className="h-4 w-4" /> */}
                <span>Last Updated: 27 September 2025</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <Shield className="h-4 w-4" /> */}
                <span>Version 1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Important Notice
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                By using EzeeRoom services, you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-1">
                  {/* 1. Acceptance of Terms */}
                  <div className="border-b">
                    <SectionHeader
                      icon={CheckCircle}
                      title="1. Acceptance of Terms"
                      isExpanded={expandedSections.acceptance}
                      onToggle={() => toggleSection('acceptance')}
                      badge="Required"
                    />
                    <SectionContent isExpanded={expandedSections.acceptance}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          These Terms and Conditions ("Terms") govern your use of EzeeRoom's online platform 
                          and services. By accessing or using our website, mobile application, or services, 
                          you acknowledge that you have read, understood, and agree to be bound by these Terms.
                        </p>
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-amber-800 dark:text-amber-200 font-medium">
                            <strong>Important:</strong> If you are booking on behalf of others, you represent 
                            that you have the authority to bind them to these Terms.
                          </p>
                        </div>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 2. Description of Services */}
                  <div className="border-b">
                    <SectionHeader
                      icon={Building}
                      title="2. Description of Services"
                      isExpanded={expandedSections.services}
                      onToggle={() => toggleSection('services')}
                    />
                    <SectionContent isExpanded={expandedSections.services}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          EzeeRoom is an online platform that facilitates hotel bookings and accommodation 
                          services in Bhutan. Our services include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Hotel search and comparison tools</li>
                          <li>Online booking and reservation management</li>
                          <li>Payment processing and confirmation</li>
                          <li>Customer support and assistance</li>
                          <li>Travel information and recommendations</li>
                        </ul>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> EzeeRoom acts as an intermediary between guests and hotels. 
                            We do not own or operate the hotels listed on our platform.
                          </p>
                        </div>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 3. User Terms and Conditions */}
                  <div className="border-b">
                    <SectionHeader
                      icon={User}
                      title="3. User Terms and Conditions"
                      isExpanded={expandedSections.userTerms}
                      onToggle={() => toggleSection('userTerms')}
                      badge="B2C"
                    />
                    <SectionContent isExpanded={expandedSections.userTerms}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-200 font-medium">
                            <strong>Guest Terms:</strong> These terms apply to all users booking accommodations 
                            through EzeeRoom platform.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">3.1 Booking Process</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>All bookings are subject to availability and confirmation</li>
                          <li>You must provide accurate and complete information</li>
                          <li>Bookings are confirmed only after payment is processed</li>
                          <li>Confirmation emails will be sent to the provided email address</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">3.2 Age Requirements</h4>
                        <p>
                          You must be at least 18 years old to make a booking. Guests under 18 must be 
                          accompanied by a responsible adult.
                        </p>

                        <h4 className="font-semibold text-foreground">3.3 Special Requests</h4>
                        <p>
                          Special requests (dietary requirements, accessibility needs, etc.) are subject 
                          to availability and cannot be guaranteed.
                        </p>

                        <h4 className="font-semibold text-foreground">3.4 Group Bookings</h4>
                        <p>
                          For group bookings (5+ rooms), special terms may apply. Please contact us directly 
                          for group booking arrangements.
                        </p>

                        <h4 className="font-semibold text-foreground">3.5 Guest Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Provide accurate personal and contact information</li>
                          <li>Arrive at the hotel during check-in hours</li>
                          <li>Follow hotel policies and local regulations</li>
                          <li>Respect other guests and hotel property</li>
                          <li>Report any issues to hotel staff immediately</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">3.6 Payment Terms</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Payment is required at the time of booking</li>
                          <li>We accept credit cards, debit cards, and digital wallets</li>
                          <li>Prices are displayed in Bhutanese Ngultrum (BTN) or USD</li>
                          <li>Final charges may include taxes and service fees</li>
                          <li>Payment processing fees may apply</li>
                        </ul>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 4. Hotel Owner Partnership Terms */}
                  <div className="border-b">
                    <SectionHeader
                      icon={Building}
                      title="4. Hotel Owner Partnership Terms"
                      isExpanded={expandedSections.hotelOwnerTerms}
                      onToggle={() => toggleSection('hotelOwnerTerms')}
                      badge="B2B"
                    />
                    <SectionContent isExpanded={expandedSections.hotelOwnerTerms}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            <strong>Partnership Agreement:</strong> These terms govern the relationship between 
                            EzeeRoom and hotel owners/property managers who list their properties on our platform.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">4.1 Partnership Requirements</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Valid business license and tourism registration in Bhutan</li>
                          <li>Compliance with Bhutan Tourism Council regulations</li>
                          <li>Valid property ownership or management authorization</li>
                          <li>Minimum 3-star equivalent facilities and services</li>
                          <li>24/7 customer support availability</li>
                          <li>Valid insurance coverage for guest safety</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.2 Revenue Sharing Model</h4>
                        <div className="space-y-3">
                          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                              Commission Structure
                            </h5>
                            <ul className="text-green-700 dark:text-green-300 space-y-1">
                              <li><strong>Standard Commission:</strong> 12-15% per booking</li>
                              <li><strong>Premium Partners:</strong> 8-12% (volume discounts)</li>
                              <li><strong>New Properties:</strong> 10% for first 6 months</li>
                              <li><strong>Payment Terms:</strong> Net 30 days from guest check-out</li>
                            </ul>
                          </div>
                          
                          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              Additional Fees
                            </h5>
                            <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li><strong>Payment Processing:</strong> 2.9% + BTN 5 per transaction</li>
                              <li><strong>Marketing Boost:</strong> Optional 5% for featured listings</li>
                              <li><strong>Cancellation Processing:</strong> BTN 100 per cancellation</li>
                            </ul>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground">4.3 Property Listing Requirements</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Accurate and up-to-date property information</li>
                          <li>High-quality photos (minimum 10 images)</li>
                          <li>Detailed room descriptions and amenities</li>
                          <li>Real-time availability calendar</li>
                          <li>Competitive pricing compared to market rates</li>
                          <li>Regular updates on property status and facilities</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.4 Booking Management</h4>
                        <div className="space-y-3">
                          <h5 className="font-medium text-foreground">Hotel Owner Responsibilities:</h5>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Confirm bookings within 24 hours</li>
                            <li>Maintain accurate availability calendar</li>
                            <li>Provide guest support during stay</li>
                            <li>Handle check-in/check-out procedures</li>
                            <li>Report any booking issues immediately</li>
                            <li><strong>Handle all cancellation requests directly</strong></li>
                          </ul>
                          
                          <h5 className="font-medium text-foreground">EzeeRoom Responsibilities:</h5>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Process payments securely</li>
                            <li>Provide booking confirmation to guests</li>
                            <li>Handle customer service inquiries</li>
                            <li>Provide analytics and booking reports</li>
                            <li>Facilitate communication between guests and hotels</li>
                          </ul>
                        </div>

                        <h4 className="font-semibold text-foreground">4.5 Quality Standards and Compliance</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Maintain minimum cleanliness and safety standards</li>
                          <li>Comply with Bhutan Tourism Council regulations</li>
                          <li>Provide accurate guest information to authorities</li>
                          <li>Handle guest complaints professionally</li>
                          <li>Maintain valid licenses and permits</li>
                          <li>Regular property inspections and certifications</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.6 Termination and Suspension</h4>
                        <div className="space-y-3">
                          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                              Grounds for Immediate Suspension
                            </h5>
                            <ul className="text-red-700 dark:text-red-300 space-y-1">
                              <li>Non-compliance with safety regulations</li>
                              <li>Fraudulent booking practices</li>
                              <li>Poor guest reviews (below 3.0 rating)</li>
                              <li>Payment disputes or non-payment</li>
                              <li>Violation of Bhutan tourism laws</li>
                            </ul>
                          </div>
                          
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                              Termination Process
                            </h5>
                            <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                              <li><strong>Notice Period:</strong> 30 days written notice</li>
                              <li><strong>Outstanding Bookings:</strong> Must be honored</li>
                              <li><strong>Final Settlement:</strong> Within 60 days</li>
                              <li><strong>Data Return:</strong> Guest data must be deleted</li>
                            </ul>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground">4.7 Intellectual Property</h4>
                        <p>
                          Hotel owners retain ownership of their property images and descriptions. 
                          EzeeRoom has the right to use this content for marketing and platform purposes. 
                          Both parties agree not to use each other's trademarks without permission.
                        </p>

                        <h4 className="font-semibold text-foreground">4.8 Data Protection and Privacy</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Guest data sharing only for booking purposes</li>
                          <li>Compliance with Bhutan data protection laws</li>
                          <li>Secure handling of payment information</li>
                          <li>Regular data security audits</li>
                          <li>Guest consent for data processing</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.9 Dispute Resolution</h4>
                        <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <p className="text-gray-800 dark:text-gray-200">
                            <strong>Mediation First:</strong> All disputes must first go through mediation. 
                            If mediation fails, disputes will be resolved through arbitration in Thimphu, Bhutan, 
                            under Bhutan Arbitration Law.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">4.10 Partnership Support</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Dedicated account manager for premium partners</li>
                          <li>Marketing support and promotional campaigns</li>
                          <li>Training on platform usage and best practices</li>
                          <li>Regular performance reviews and optimization</li>
                          <li>24/7 technical support for booking issues</li>
                        </ul>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 5. Cancellation Policy */}
                  <div className="border-b">
                    <SectionHeader
                      icon={Calendar}
                      title="4. Booking Terms and Conditions"
                      isExpanded={expandedSections.bookings}
                      onToggle={() => toggleSection('bookings')}
                      badge="Critical"
                    />
                    <SectionContent isExpanded={expandedSections.bookings}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <h4 className="font-semibold text-foreground">4.1 Booking Process</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>All bookings are subject to availability and confirmation</li>
                          <li>You must provide accurate and complete information</li>
                          <li>Bookings are confirmed only after payment is processed</li>
                          <li>Confirmation emails will be sent to the provided email address</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.2 Age Requirements</h4>
                        <p>
                          You must be at least 18 years old to make a booking. Guests under 18 must be 
                          accompanied by a responsible adult.
                        </p>

                        <h4 className="font-semibold text-foreground">4.3 Special Requests</h4>
                        <p>
                          Special requests (dietary requirements, accessibility needs, etc.) are subject 
                          to availability and cannot be guaranteed.
                        </p>

                        <h4 className="font-semibold text-foreground">4.4 Group Bookings</h4>
                        <p>
                          For group bookings (5+ rooms), special terms may apply. Please contact us directly 
                          for group booking arrangements.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 5. Cancellation Policy */}
                  <div className="border-b">
                    <SectionHeader
                      icon={Clock}
                      title="5. Cancellation and Refund Policy"
                      isExpanded={expandedSections.cancellation}
                      onToggle={() => toggleSection('cancellation')}
                      badge="Important"
                    />
                    <SectionContent isExpanded={expandedSections.cancellation}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                            Important: EzeeRoom Does Not Handle Cancellations Directly
                          </h4>
                          <p className="text-red-700 dark:text-red-300">
                            <strong>All cancellation requests must be made directly with the hotel.</strong> 
                            EzeeRoom acts as a booking platform only and does not process cancellations or refunds.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">5.1 How to Cancel Your Booking</h4>
                        <div className="space-y-3">
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                              Step-by-Step Cancellation Process
                            </h5>
                            <ol className="text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                              <li><strong>Contact the Hotel Directly:</strong> Use the contact information provided in your booking confirmation</li>
                              <li><strong>Provide Booking Details:</strong> Include your booking reference number and guest name</li>
                              <li><strong>Request Cancellation:</strong> Clearly state your intention to cancel</li>
                              <li><strong>Follow Hotel's Policy:</strong> Each hotel has its own cancellation terms and conditions</li>
                              <li><strong>Get Confirmation:</strong> Request written confirmation of your cancellation</li>
                            </ol>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground">5.2 Hotel-Specific Cancellation Terms</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">
                                Free Cancellation (24+ hours before check-in)
                              </p>
                              <p className="text-green-700 dark:text-green-300 text-xs">
                                Most hotels offer full refund if cancelled 24+ hours in advance
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                Partial Refund (6-24 hours before check-in)
                              </p>
                              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                                Some hotels may offer partial refunds for late cancellations
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-200">
                                No Refund (Less than 6 hours before check-in)
                              </p>
                              <p className="text-red-700 dark:text-red-300 text-xs">
                                Most hotels do not offer refunds for same-day cancellations
                              </p>
                            </div>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground">5.3 Non-Refundable Bookings</h4>
                        <p>
                          Some bookings are marked as "Non-Refundable" and cannot be cancelled or modified. 
                          These bookings offer lower rates but come with strict cancellation terms. 
                          <strong>Please check your booking confirmation for specific cancellation terms.</strong>
                        </p>

                        <h4 className="font-semibold text-foreground">5.4 Force Majeure Events</h4>
                        <p>
                          In case of natural disasters, government restrictions, or other force majeure events, 
                          hotels may offer special cancellation terms. Contact the hotel directly to discuss 
                          your situation and possible options.
                        </p>

                        <h4 className="font-semibold text-foreground">5.5 Refund Processing</h4>
                        <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Important Notes About Refunds
                          </h5>
                          <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                            <li><strong>Hotel Responsibility:</strong> Refunds are processed by the hotel, not EzeeRoom</li>
                            <li><strong>Processing Time:</strong> Typically 5-10 business days after hotel approval</li>
                            <li><strong>Payment Method:</strong> Refunds are issued to the original payment method</li>
                            <li><strong>Bank Processing:</strong> Additional 3-5 business days for bank processing</li>
                            <li><strong>Currency Conversion:</strong> Exchange rates may apply for international refunds</li>
                          </ul>
                        </div>

                        <h4 className="font-semibold text-foreground">5.6 EzeeRoom's Role</h4>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>EzeeRoom's Limited Role:</strong> We facilitate communication between guests and hotels 
                            but do not process cancellations or refunds. We can help you find hotel contact information 
                            and provide general guidance, but all cancellation decisions are made by the hotel.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">5.7 What EzeeRoom Can Help With</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Providing hotel contact information</li>
                          <li>Helping you locate your booking confirmation</li>
                          <li>General guidance on cancellation processes</li>
                          <li>Facilitating communication with hotels</li>
                          <li>Technical support for platform issues</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">5.8 What EzeeRoom Cannot Do</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Process cancellations on behalf of hotels</li>
                          <li>Override hotel cancellation policies</li>
                          <li>Issue refunds directly</li>
                          <li>Guarantee specific refund amounts</li>
                          <li>Force hotels to accept cancellations</li>
                        </ul>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 6. Payment Terms */}
                  <div className="border-b">
                    <SectionHeader
                      icon={CreditCard}
                      title="6. Payment Terms and Conditions"
                      isExpanded={expandedSections.payments}
                      onToggle={() => toggleSection('payments')}
                    />
                    <SectionContent isExpanded={expandedSections.payments}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <h4 className="font-semibold text-foreground">6.1 Payment Methods</h4>
                        <p>
                          We accept various payment methods including credit cards, debit cards, 
                          bank transfers, and digital wallets. All payments are processed securely.
                        </p>

                        <h4 className="font-semibold text-foreground">6.2 Currency and Pricing</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Prices are displayed in Bhutanese Ngultrum (BTN) or USD</li>
                          <li>Currency conversion rates are updated regularly</li>
                          <li>Final charges may include taxes and service fees</li>
                          <li>Prices are subject to change without notice</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">6.3 Payment Security</h4>
                        <p>
                          All payment information is encrypted and processed through secure payment gateways. 
                          We do not store your complete payment information on our servers.
                        </p>

                        <h4 className="font-semibold text-foreground">6.4 Payment Issues</h4>
                        <p>
                          If payment fails, your booking will not be confirmed. Please ensure sufficient 
                          funds and correct payment information. Contact your bank if issues persist.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 7. Limitation of Liability */}
                  <div className="border-b">
                    <SectionHeader
                      icon={Shield}
                      title="7. Limitation of Liability and Disclaimers"
                      isExpanded={expandedSections.liability}
                      onToggle={() => toggleSection('liability')}
                    />
                    <SectionContent isExpanded={expandedSections.liability}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <h4 className="font-semibold text-foreground">7.1 Service Availability</h4>
                        <p>
                          EzeeRoom does not guarantee uninterrupted service availability. We reserve the 
                          right to modify, suspend, or discontinue services at any time.
                        </p>

                        <h4 className="font-semibold text-foreground">7.2 Third-Party Services</h4>
                        <p>
                          We are not responsible for the quality, safety, or availability of third-party 
                          services (hotels, transportation, etc.) booked through our platform.
                        </p>

                        <h4 className="font-semibold text-foreground">7.3 Limitation of Damages</h4>
                        <p>
                          To the maximum extent permitted by law, EzeeRoom's liability is limited to the 
                          amount paid for the specific booking in question.
                        </p>

                        <h4 className="font-semibold text-foreground">7.4 Force Majeure</h4>
                        <p>
                          We are not liable for delays or failures caused by circumstances beyond our 
                          control, including natural disasters, government actions, or technical failures.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 8. Privacy and Data Protection */}
                  <div className="border-b">
                    <SectionHeader
                      icon={User}
                      title="8. Privacy and Data Protection"
                      isExpanded={expandedSections.privacy}
                      onToggle={() => toggleSection('privacy')}
                    />
                    <SectionContent isExpanded={expandedSections.privacy}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          Your privacy is important to us. Please review our 
                          <Link to="/privacy-policy" className="text-primary hover:underline ml-1">
                            Privacy Policy
                          </Link> for detailed information about how we collect, use, and protect your data.
                        </p>
                        
                        <h4 className="font-semibold text-foreground">8.1 Data Collection</h4>
                        <p>
                          We collect personal information necessary to process bookings and provide services. 
                          This includes contact information, payment details, and travel preferences.
                        </p>

                        <h4 className="font-semibold text-foreground">8.2 Data Sharing</h4>
                        <p>
                          We may share your information with hotels and service providers to fulfill 
                          your bookings. We do not sell your personal information to third parties.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 9. Modifications to Terms */}
                  <div className="border-b">
                    <SectionHeader
                      icon={FileText}
                      title="9. Modifications to Terms"
                      isExpanded={expandedSections.modifications}
                      onToggle={() => toggleSection('modifications')}
                    />
                    <SectionContent isExpanded={expandedSections.modifications}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          EzeeRoom reserves the right to modify these Terms at any time. Changes will be 
                          posted on this page with an updated "Last Modified" date.
                        </p>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>Important:</strong> Continued use of our services after changes 
                            constitutes acceptance of the modified Terms.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">9.1 Notification of Changes</h4>
                        <p>
                          We will notify users of significant changes via email or through our platform. 
                          Minor changes may be posted without individual notification.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 10. Contact Information */}
                  <div>
                    <SectionHeader
                      icon={Mail}
                      title="10. Contact Information and Support"
                      isExpanded={expandedSections.contact}
                      onToggle={() => toggleSection('contact')}
                    />
                    <SectionContent isExpanded={expandedSections.contact}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          If you have questions about these Terms or need assistance with your booking, 
                          please contact us:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Email Support</p>
                                <p className="text-xs">choegyell@gmail.com</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Phone Support</p>
                                <p className="text-xs">+975 17482648</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Office Location</p>
                                <p className="text-xs">Thimphu, Bhutan</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Support Hours</p>
                                <p className="text-xs">9:00 AM - 6:00 PM (BTT)</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-green-800 dark:text-green-200">
                            <strong>Quick Support:</strong> For urgent booking issues, please call our 
                            support line. For general inquiries, email is preferred.
                          </p>
                        </div>
                      </div>
                    </SectionContent>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/privacy-policy">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/faqs">
                <FileText className="h-4 w-4 mr-2" />
                FAQs
              </Link>
            </Button>
            <Button asChild>
              <Link to="/">
                <User className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Legal Footer */}
          <div className="mt-8 text-center">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground">
              These Terms and Conditions are governed by the laws of Bhutan. 
              Any disputes will be resolved in the courts of Thimphu, Bhutan.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © 2025 EzeeRoom. All rights reserved. | Last Updated: January 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
