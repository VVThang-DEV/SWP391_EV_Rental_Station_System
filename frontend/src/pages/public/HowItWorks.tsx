import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, Key, ArrowRight } from "lucide-react";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";

const steps = [
  {
    icon: Search,
    title: "Find Your Perfect EV",
    description:
      "Browse our fleet of premium electric vehicles. Use filters to find the perfect car for your needs - by location, price, or vehicle type.",
  },
  {
    icon: Calendar,
    title: "Book & Pay Securely",
    description:
      "Select your rental period and complete the booking process. Upload required documents and choose your preferred payment method.",
  },
  {
    icon: Key,
    title: "Pick Up & Drive",
    description:
      "Visit our station at your scheduled time. Our staff will hand over the vehicle and you're ready to experience emission-free driving!",
  },
];

const HowItWorks = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn delay={100}>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How It Works
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Renting an electric vehicle has never been easier. Get started
                in just 3 simple steps.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Steps */}
          <SlideIn direction="bottom" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <FadeIn key={index} delay={300 + index * 150}>
                    <div className="text-center">
                      <Card className="card-premium mb-6">
                        <CardContent className="p-8">
                          <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-primary mb-2">
                            {index + 1}
                          </div>
                          <h3 className="text-xl font-semibold mb-4">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-full ml-4">
                          <ArrowRight className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </SlideIn>

          {/* Requirements Section */}
          <FadeIn delay={600}>
            <Card className="mb-12">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-center mb-8">
                  What You Need to Get Started
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🆔</div>
                    <h3 className="font-semibold mb-2">Valid ID</h3>
                    <p className="text-sm text-muted-foreground">
                      Government-issued identification card or passport
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🚗</div>
                    <h3 className="font-semibold mb-2">Driver's License</h3>
                    <p className="text-sm text-muted-foreground">
                      Valid driver's license (minimum 1 year)
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎂</div>
                    <h3 className="font-semibold mb-2">Age 21+</h3>
                    <p className="text-sm text-muted-foreground">
                      Must be at least 21 years old to rent
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">💳</div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground">
                      Credit card, bank transfer, or cash payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* CTA Section */}
          <FadeIn delay={700}>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Your Electric Journey?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-hero" asChild>
                  <Link to="/vehicles">Browse Vehicles</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default HowItWorks;
