import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90">
            Last updated: January 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>How We Protect Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>Information We Collect</h3>
            <p>We collect information you provide when creating an account, making reservations, and using our services.</p>
            
            <h3>How We Use Your Information</h3>
            <ul>
              <li>Process rental bookings and payments</li>
              <li>Verify identity and driver credentials</li>
              <li>Provide customer support</li>
              <li>Send booking confirmations and updates</li>
              <li>Improve our services</li>
            </ul>

            <h3>Information Sharing</h3>
            <p>We do not sell or rent your personal information. We may share information with:</p>
            <ul>
              <li>Payment processors for transactions</li>
              <li>Insurance providers when required</li>
              <li>Law enforcement when legally required</li>
            </ul>

            <h3>Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

            <h3>Your Rights</h3>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h3>Contact Us</h3>
            <p>For privacy-related questions, contact us at privacy@evrentals.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;