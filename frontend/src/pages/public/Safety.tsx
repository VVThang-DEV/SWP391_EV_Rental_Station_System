import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Phone, CheckCircle } from "lucide-react";

const Safety = () => {
  const safetyFeatures = [
    "Regular vehicle maintenance and safety inspections",
    "GPS tracking for emergency assistance", 
    "24/7 roadside assistance and support",
    "Comprehensive insurance coverage included",
    "Emergency contact protocols",
    "Driver verification and background checks",
    "Real-time vehicle monitoring",
    "Secure digital key technology"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Safety First
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your safety and security are our top priorities. Learn about our comprehensive safety measures and protocols.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Emergency Contact */}
        <Card className="mb-12 border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Phone className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4">24/7 Emergency Support</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              For emergencies, breakdowns, or urgent assistance during your rental
            </p>
            <div className="text-3xl font-bold text-destructive mb-2">+84 24 1234 5678</div>
            <p className="text-sm text-muted-foreground">
              Available 24 hours a day, 7 days a week
            </p>
          </CardContent>
        </Card>

        {/* Safety Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Our Safety Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safetyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                In Case of Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Ensure Safety First</h4>
                  <p className="text-sm text-muted-foreground">
                    Move to a safe location if possible. Turn on hazard lights and use emergency equipment if needed.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Call Emergency Services</h4>
                  <p className="text-sm text-muted-foreground">
                    For serious accidents or injuries, call local emergency services (113) immediately.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Contact EVRentals</h4>
                  <p className="text-sm text-muted-foreground">
                    Call our 24/7 emergency line to report the incident and get assistance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4. Document Everything</h4>
                  <p className="text-sm text-muted-foreground">
                    Take photos of any damage, exchange information with other parties if applicable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Rental Safety Check</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Inspect vehicle exterior for existing damage</li>
                <li>• Check that all lights and indicators work</li>
                <li>• Verify charging cable and emergency kit are present</li>
                <li>• Adjust mirrors and seat position</li>
                <li>• Familiarize yourself with controls and features</li>
                <li>• Check battery level and charging status</li>
                <li>• Report any issues to staff immediately</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safe Driving Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Follow all local traffic laws and regulations</li>
                <li>• Monitor battery level and plan charging stops</li>
                <li>• Keep emergency contact information accessible</li>
                <li>• Don't leave the vehicle unattended while charging</li>
                <li>• Report any unusual sounds or behaviors immediately</li>
                <li>• Use designated parking and charging areas only</li>
                <li>• Always lock the vehicle when not in use</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Comprehensive Coverage</h4>
                <p className="text-sm text-muted-foreground">
                  Full protection against theft, vandalism, and collision damage with minimal deductible.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Liability Protection</h4>
                <p className="text-sm text-muted-foreground">
                  Coverage for third-party property damage and personal injury as required by law.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Personal Accident</h4>
                <p className="text-sm text-muted-foreground">
                  Medical coverage for driver and passengers in case of accident during rental period.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> Insurance coverage is included with every rental. 
                Drivers must follow all safety guidelines and traffic laws to maintain coverage validity.
                Reckless driving or violations may void insurance protection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Safety;