import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import { ArrowLeft, Shield, ChevronRight } from 'lucide-react';

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

const PrivacyPolicy = () => {
  const lastUpdated = "September 28, 2025";

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    // Clear any hash fragments that might cause scrolling
    if (window.location.hash) {
      window.location.hash = '';
    }
    
    // Scroll to top with a slight delay to ensure page is fully rendered
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Additional scroll after a short delay to ensure it works
    const timeoutId = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Table of Contents items
  const tocItems = [
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use-information', title: 'How We Use Your Information' },
    { id: 'information-sharing', title: 'Information Sharing' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'third-party', title: 'Third-Party Services' },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact Us' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const breadcrumbItems = [
    { label: "Privacy Policy" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-foreground">Privacy & Security Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Main Content */}
        <div className="pb-16">
        <Card className="my-8 p-6 md:p-8">
          {/* Introduction */}
          <div className="space-y-6">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                At EzeeRoom, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy & Security Policy explains how we collect, use, and safeguard your data when you use our hotel 
                booking platform.
              </p>
            </div>

            <Separator />

            {/* Table of Contents */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Table of Contents</h2>
              <nav className="space-y-1">
                {tocItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors py-0.5 cursor-pointer"
                  >
                    {index + 1}. {item.title}
                  </button>
                ))}
              </nav>
            </div>

            <Separator />

            {/* Section 1: Information We Collect */}
            <section id="information-we-collect" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">1. Information We Collect</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">We collect information you provide directly to us, including:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Account Information:</strong> Name and email address when you create an account</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Booking Information:</strong> Guest details, check-in/check-out dates, room preferences, cid, phone number, origin and destination</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Payment Information:</strong> Bank account details (BOB, BNB, BDBL, DK, Druk PNB) processed securely through RMA Payment Gateway</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Communication Data:</strong> Messages, reviews, and feedback you provide</span>
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 2: How We Use Your Information */}
            <section id="how-we-use-information" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">2. How We Use Your Information</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">We use the collected information to:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Process and manage your hotel bookings</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Send booking confirmations and important updates</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Provide customer support and respond to inquiries</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Process payments and prevent fraud</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Comply with legal obligations and enforce our terms</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Improve our services through analytics and feedback</span>
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 3: Information Sharing */}
            <section id="information-sharing" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">3. Information Sharing</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">We share your information only in the following circumstances:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>With Hotels:</strong> We share necessary booking details with your selected hotel to fulfill your reservation</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Service Providers:</strong> With trusted third parties who help us operate our platform (payment processors, email services)</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>With Your Consent:</strong> When you explicitly agree to specific sharing</span>
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium">We never sell your personal information to third parties.</p>
              </div>
            </section>

            <Separator />

            {/* Section 4: Data Security */}
            <section id="data-security" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">4. Data Security</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">We implement industry-standard security measures to protect your information:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>SSL/TLS encryption for all data transmissions</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Secure servers with regular security audits</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>PCI DSS compliance for payment processing</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Access controls and authentication mechanisms</span>
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 5: Your Rights */}
            <section id="your-rights" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">5. Your Rights</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">You have the following rights regarding your personal information:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Account Management:</strong> Update your profile information and account settings through your dashboard</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Data Correction:</strong> Contact us to correct any inaccurate personal information</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Account Deletion:</strong> Request complete deletion of your account and associated data</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Communication Preferences:</strong> Unsubscribe from marketing emails and notifications</span>
                  </p>
                </div>

                <p className="mt-3 text-sm">
                  To exercise these rights or for any privacy-related concerns, please contact us at privacy@ezeeroom.com. 
                  We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            <Separator />


            <Separator />

            {/* Section 6: Third-Party Services */}
            <section id="third-party" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">6. Third-Party Services</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">
                  Our platform may contain links to third-party websites or integrate with third-party services. 
                  We are not responsible for the privacy practices of these third parties. We encourage you to 
                  review their privacy policies before providing any personal information.
                </p>

                <p className="text-sm">Key third-party services we use include:</p>
                
                <div className="ml-4 space-y-1.5">
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Payment processors for secure transactions</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Analytics services to improve our platform</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Google Maps service for navigation and location features</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Email service providers for communications</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Social media platforms (Facebook, TikTok, Instagram) for marketing and user engagement</span>
                  </p>
                </div>
              </div>
            </section>

            <Separator />


            {/* Section 7: Changes to This Policy */}
            <section id="changes" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">7. Changes to This Policy</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">
                  We may update this Privacy & Security Policy from time to time to reflect changes in our practices 
                  or legal requirements. We will notify you of any material changes by posting the new policy on this 
                  page and updating the "Last updated" date.
                </p>

                <p className="text-sm">
                  We encourage you to review this policy periodically to stay informed about how we protect your 
                  information.
                </p>
              </div>
            </section>

            <Separator />

            {/* Section 8: Contact Us */}
            <section id="contact" className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">8. Contact Us</h2>
              
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">
                  If you have any questions, concerns, or requests regarding this Privacy & Security Policy or our 
                  data practices, please contact us:
                </p>

                <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                  <p className="text-sm"><strong>Email:</strong> privacy@ezeeroom.com</p>
                  <p className="text-sm"><strong>Phone:</strong> +975 17 123 456</p>
                  <p className="text-sm"><strong>Address:</strong> EzeeRoom Pvt. Ltd., Thimphu, Bhutan</p>
                </div>

                <p className="text-sm">
                  Our dedicated privacy team will respond to your inquiry within 30 days.
                </p>
              </div>
            </section>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
