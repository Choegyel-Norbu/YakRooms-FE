import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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

// YakRooms Text Logo Component (copied from Navbar.jsx)
const YakRoomsText = ({ size = "default" }) => {
  const textSizes = {
    // Optimized mobile-first text sizes
    small: "text-lg font-bold",
    default: "text-xl font-bold",
    large: "text-2xl font-bold"
  };

  return (
    <div className={`${textSizes[size]} font-sans tracking-tight`}>
      <span className="text-blue-600">Yak</span>
      <span className="text-yellow-500">Rooms</span>
    </div>
  );
};

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Home Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <MapPin className="w-3 h-3 mr-1" />
            Made in Bhutan
          </Badge>
          
          {/* YakRooms Title */}
          <div className="mb-6">
            <YakRoomsText size="large" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
            Empowering Local Stays.
            <br />
            <span className="text-primary">Simplifying Hotel Discovery.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            YakRooms is Bhutan's premier hotel discovery and booking platform, 
            connecting travelers with authentic local accommodations across the Kingdom.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Why YakRooms */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-6 text-center">Why YakRooms?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  Hotel-First Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We focus exclusively on hotels, ensuring a curated selection of quality 
                  accommodations that meet travelers' needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Local Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built by Bhutanese developers who understand the unique needs of both 
                  local hoteliers and international travelers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-primary" />
                  Community Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We empower local hotel businesses by providing them with modern tools 
                  to reach a global audience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Our Mission */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Mountain className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To revolutionize hotel discovery and booking in Bhutan by creating a seamless, 
                trustworthy platform that bridges the gap between local accommodations and 
                travelers from around the world.
              </p>
              <p className="text-sm text-muted-foreground">
                We believe in preserving Bhutan's unique hospitality culture while embracing 
                modern technology to enhance the travel experience for everyone.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* What Makes Us Different */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-6">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Local-First Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our platform is built specifically for the Bhutanese market, with features 
                  tailored to local business practices and traveler preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Curated Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every hotel on YakRooms is personally verified to ensure quality, 
                  authenticity, and the best experience for our users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Direct Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect directly with hotels for personalized service and special 
                  requests, ensuring your stay is perfect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Fair Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We work directly with hotels to offer competitive rates without 
                  hidden fees, supporting both travelers and local businesses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Community & Vision */}
        <section>
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Community & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                YakRooms is more than a booking platform—it's a community initiative to 
                showcase Bhutan's hospitality to the world. We envision a future where 
                every hotel in Bhutan, from luxury resorts to family-run guesthouses, 
                can thrive in the digital age.
              </p>
              <p className="text-sm text-muted-foreground">
                By choosing YakRooms, you're supporting local businesses and contributing 
                to sustainable tourism development in Bhutan.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Built by Bhutanese Developers */}
        <section>
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-sm">
              Proudly Bhutanese
            </Badge>
            <h2 className="text-2xl font-bold font-heading">Built by Bhutanese Developers</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              YakRooms is crafted with care by a team of passionate Bhutanese developers 
              who understand the unique needs of our country's hospitality sector. We combine 
              local insights with global technology standards to create a platform that truly 
              serves our community.
            </p>
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
                  <a href="mailto:info@yakrooms.com" className="text-primary hover:underline">
                    info@yakrooms.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+97517123456" className="text-primary hover:underline">
                    +975 17 123 456
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> Thimphu, Bhutan
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold font-heading mb-4">
            Ready to Discover Bhutan's Best Hotels?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Start your journey with YakRooms and experience the warmth of Bhutanese 
            hospitality like never before.
          </p>
          <Button size="lg" asChild>
            <Link to="/hotels">
              Explore Hotels
              <Building2 className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;