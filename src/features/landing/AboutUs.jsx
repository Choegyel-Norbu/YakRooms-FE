import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import { Badge } from '@/shared/components/badge';
import { 
  Building2, 
  Users, 
  Heart, 
  Mountain,
  Globe,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { EzeeRoomLogo } from "@/shared/components";

const AboutUs = () => {
  return (
    <div className="min-h-screen mb-10">
      {/* Modern Header */}
      <div className="relative  border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="block sm:hidden py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="hover:bg-primary/10 transition-colors"
              >
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Back</span>
                </Link>
              </Button>
              
              <div className="flex-1 flex justify-center">
                <Badge variant="outline" className="text-xs">
                  About Us
                </Badge>
              </div>
              
              <div className="w-20"></div> {/* Balance */}
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden sm:block py-6">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <div className="flex-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hover:bg-primary/10 transition-colors group"
                >
                  <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Back to Home</span>
                  </Link>
                </Button>
              </div>
              
              {/* Logo */}
              <div className="flex-1 flex justify-center">
                <div className="text-center">
                  <EzeeRoomLogo size="large" />
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Mountain className="w-3 h-3 mr-1" />
                      About Us
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Navigation Links */}
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/hotels" className="text-sm font-medium hover:text-primary transition-colors">
                      Hotels
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 space-y-12">
        {/* Why EzeeRoom */}
        

        <Separator />

        {/* Our Mission */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                Our Mission
              </CardTitle>
              <CardDescription>
                Empowering Bhutan's hospitality ecosystem through digital platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mission Statement */}
             

              {/* Core Mission Pillars */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* For Accommodation Providers */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">For Accommodation Providers</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We empower remote accommodations to become digitally accessible to travelers 
                    by providing comprehensive property management systems that simplify 
                    operations and streamline bookings
                  </p>
                </div>

                {/* For Travelers */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">For Travelers</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We create seamless discovery and booking experiences that enable travelers 
                    to easily find accommodations, compare options, and make informed decisions 
                    with complete transparency and convenience.
                  </p>
                </div>
              </div>

              {/* Vision Statement */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-sm">Our Vision</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To become Bhutan's trusted platform that empowers our community 
                  by connecting travelers with local accommodations.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>


        <Separator />

        

        {/* Our Team */}
        <section>
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold font-heading"> Our Team</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              EzeeRoom is created by a dedicated team of Bhutanese individuals 
              who are passionate about connecting travelers with authentic Bhutanese 
              hospitality through digital solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Chogyal Norbu */}
            <div className="text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4">
                  <img 
                    src="https://images.ecency.com/DQmVm8Gt2bwhX1B4iB9WiXbWMCLv69Ks3LdDNfoQ9DUKZt9/images_4_.jpeg" 
                    alt="Chogyal Norbu" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl">Chogyal Norbu</CardTitle>
                <CardDescription>Co-Founder & Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic mt-5">
                  "My mission is to bridge the digital gap for underprivileged accommodations 
                  while creating meaningful connections between travelers and local stays. 
                  I'm passionate about preserving Bhutan's authentic hospitality spirit 
                  through inclusive digital solutions."
                </p>
              </CardContent>
            </div>

              {/* Zepa Dorji */}
              <div className="text-center m-2">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img 
                      src="/images/zepa1.jpeg" 
                      alt="Zepa Dorji" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">Zepa Dorji</CardTitle>
                  <CardDescription>Co-Founder & Quality Assurance</CardDescription>
                </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic mt-5">
                  "I believe that even the smallest improvements contribute significantly to long-term success. My focus lies in ensuring precision, consistency, and continual enhancement across all aspects of our service. I hold a firm conviction that genuine progress begins with the intention to benefit others, and I strive to uphold this mindset in every task I undertake  regardless of how visible the impact may be."
                </p>
              </CardContent>
            </div>
          </div>
        </section>

        <Separator />

        {/* Get in Touch */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Get in Touch
              </CardTitle>
              <CardDescription>
                We'd love to hear from you!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Whether you're a traveler looking for the perfect stay or a hotel owner 
                interested in joining our platform, we're here to help.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:info@ezeeroom.com" className="text-primary hover:underline">
                    info@ezeeroom.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+97577965452" className="text-primary hover:underline">
                    +97577965452
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> Thimphu, Bhutan
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;

