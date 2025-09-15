import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Shield, Users, Award, Target, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About EVRentals
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Leading the electric revolution in transportation, one rental at a time
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            To make electric vehicle transportation accessible, affordable, and enjoyable for everyone. 
            We believe in a sustainable future where clean energy powers our journeys, and we're committed 
            to making that future available today.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="card-premium text-center">
            <CardContent className="p-8">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Sustainability</h3>
              <p className="text-muted-foreground">
                Committed to reducing carbon emissions and promoting clean transportation solutions for a better planet.
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium text-center">
            <CardContent className="p-8">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Trust & Safety</h3>
              <p className="text-muted-foreground">
                Your safety is our priority. All vehicles undergo rigorous maintenance and safety checks.
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium text-center">
            <CardContent className="p-8">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-muted-foreground">
                Building a community of environmentally conscious drivers who choose sustainable transportation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Stats */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Electric Vehicles</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">15</div>
                <div className="text-muted-foreground">Station Locations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100,000+</div>
                <div className="text-muted-foreground">Miles Driven Clean</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Why Choose EVRentals?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-success-light rounded-full p-3">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Premium Fleet</h3>
                <p className="text-muted-foreground">
                  Latest model electric vehicles from top manufacturers, maintained to the highest standards.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-success-light rounded-full p-3">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Simple online booking process with instant confirmation and flexible rental periods.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-success-light rounded-full p-3">
                <Heart className="h-6 w-6 text-success" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Round-the-clock customer support and roadside assistance for peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-success-light rounded-full p-3">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Charging Network</h3>
                <p className="text-muted-foreground">
                  Access to extensive charging network with free charging at partner stations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Go Electric?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have chosen sustainable transportation with EVRentals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/vehicles">Browse Our Fleet</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;