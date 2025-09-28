import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Separator } from "@/shared/components/separator";
import { 
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

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

  // Scroll to top when component mounts and handle hash navigation
  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    
    if (hash) {
      // If there's a hash, scroll to the element after a short delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          // Ensure the section is expanded if it's collapsible
          const sectionId = hash.replace('#', '');
          if (sectionId === 'cancellation-policy' && !expandedSections.cancellation) {
            toggleSection('cancellation');
          }
        }
      }, 100);
    } else {
      // If no hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const breadcrumbItems = [
    { label: "Terms and Conditions" }
  ];

  const SectionHeader = ({ title, isExpanded, onToggle, badge }) => (
    <div 
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-sm md:text-base font-semibold text-foreground">{title}</h2>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      {isExpanded ? (
        <span className="text-muted-foreground">−</span>
      ) : (
        <span className="text-muted-foreground">+</span>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">Terms and Conditions</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
            Please read these terms carefully before using EzeeRoom services
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Last Updated: 27 September 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Version 1.0</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle>
                Important Notice
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                By using EzeeRoom services, you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto">
                <div className="space-y-1">
                  {/* 1. Acceptance of Terms */}
                  <div className="border-b">
                    <SectionHeader
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
                          <li>Upon successful booking, you will receive a confirmation notification and can manage your booking from the dashboard</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">3.2 Age Requirements</h4>
                        <p>
                          You must be at least 18 years old to make a booking. Guests under 18 must be 
                          accompanied by a responsible adult.
                        </p>

                        <h4 className="font-semibold text-foreground">3.3 Guest Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Provide accurate personal and contact information</li>
                          <li>Arrive at the hotel on check-in date</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">3.4 Payment Terms</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Payment is required at the time of booking</li>
                          <li>We accept credit cards, debit cards, and digital wallets</li>
                          <li>Prices are displayed in Bhutanese Ngultrum (BTN)</li>
                          <li>Final charges may include taxes and service fees</li>
                          <li>Payment processing fees may apply</li>
                        </ul>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 4. Hotel Owner Partnership Terms */}
                  <div className="border-b">
                    <SectionHeader
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
                          <li>Valid business license</li>
                          <li>Valid property ownership or management authorization</li>
                          <li>24/7 customer support availability</li>
                          <li>Valid insurance coverage for guest safety</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.2 Property Listing Requirements</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Accurate and up-to-date property information</li>
                          <li>High-quality photos</li>
                          <li>Detailed room descriptions and amenities</li>
                          <li>Real-time availability calendar</li>
                          <li>Regular updates on property status and facilities</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.3 Booking Management</h4>
                        <div className="space-y-3">
                          <h5 className="font-medium text-foreground">Hotel Owner Responsibilities:</h5>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Maintain accurate availability calendar</li>
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

                        <h4 className="font-semibold text-foreground">4.4 Intellectual Property</h4>
                        <p>
                          Hotel owners retain ownership of their property images and descriptions. 
                          EzeeRoom has the right to use this content for marketing and platform purposes. 
                          Both parties agree not to use each other's trademarks without permission.
                        </p>

                        <h4 className="font-semibold text-foreground">4.5 Data Protection and Privacy</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Guest data sharing only for booking purposes</li>
                          <li>Compliance with Bhutan data protection laws</li>
                          <li>Secure handling of payment information</li>
                          <li>Guest consent for data processing</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">4.6 Dispute Resolution</h4>
                        <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <p className="text-gray-800 dark:text-gray-200">
                            <strong>Mediation First:</strong> All disputes must first go through mediation. 
                            If mediation fails, disputes will be resolved through arbitration in Thimphu, Bhutan, 
                            under Bhutan Arbitration Law.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">4.7 Partnership Support</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Training on platform usage and best practices</li>
                          <li>Regular performance reviews and optimization</li>
                          <li>24/7 technical support for booking issues</li>
                        </ul>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 5. Cancellation Policy */}
                  <div id="cancellation-policy" className="border-b">
                    <SectionHeader
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
                              <li><strong>Contact the Hotel Directly:</strong> Use the contact information provided in user dashboard</li>
                              <li><strong>Follow Hotel's Policy:</strong> Each hotel has its own cancellation terms and conditions</li>
                            </ol>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground">5.2 EzeeRoom's Role</h4>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>EzeeRoom's Limited Role:</strong> We facilitate communication between guests and hotels 
                            but do not process cancellations or refunds. We can help you find hotel contact information 
                            and provide general guidance, but all cancellation decisions are made by the hotel.
                          </p>
                        </div>

                        <h4 className="font-semibold text-foreground">5.3 What EzeeRoom Can Help With</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Providing hotel contact information</li>
                          <li>Helping you locate your booking confirmation</li>
                          <li>Facilitating communication with hotels</li>
                          <li>Technical support for platform issues</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">5.4 What EzeeRoom Cannot Do</h4>
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
                      title="6. Payment Terms and Conditions"
                      isExpanded={expandedSections.payments}
                      onToggle={() => toggleSection('payments')}
                    />
                    <SectionContent isExpanded={expandedSections.payments}>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <h4 className="font-semibold text-foreground">6.1 Payment Methods</h4>
                        <p>
                          We accept payments through local banks including BOB (Bank of Bhutan), BNB (Bhutan National Bank), 
                          BDBL (Bhutan Development Bank Limited), PNB, and DK. All payments are processed securely.
                        </p>

                        <h4 className="font-semibold text-foreground">6.2 Currency and Pricing</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Prices are displayed for each room in Bhutanese Ngultrum (BTN) respectively</li>
                          <li>Final charges may include taxes and service fees</li>
                          <li>Prices are subject to change without notice</li>
                        </ul>

                        <h4 className="font-semibold text-foreground">6.3 Payment Security</h4>
                        <p>
                          All payment information is encrypted and processed through secure payment gateway(RMA). 
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
                          services (hotels, etc.) booked through our platform.
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
                          We will notify users of significant changes through our platform.
                        </p>
                      </div>
                    </SectionContent>
                  </div>

                  {/* 10. Contact Information */}
                  <div>
                    <SectionHeader
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
                            <div>
                              <p className="font-medium text-foreground">Email Support</p>
                              <p className="text-xs">choegyell@gmail.com</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-foreground">Phone Support</p>
                              <p className="text-xs">+975 17482648</p>
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
