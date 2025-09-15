import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-white/90">
            Last updated: January 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Rental Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>1. Vehicle Rental Agreement</h3>
            <p>By renting a vehicle from EVRentals, you agree to the following terms and conditions.</p>
            
            <h3>2. Eligibility Requirements</h3>
            <ul>
              <li>Must be at least 21 years old</li>
              <li>Valid driver's license for minimum 1 year</li>
              <li>Government-issued ID required</li>
              <li>Clean driving record</li>
            </ul>

            <h3>3. Rental Period & Pricing</h3>
            <ul>
              <li>Minimum rental period: 2 hours</li>
              <li>Late return fee: $10 per hour</li>
              <li>Damage deposit: $200 (refundable)</li>
              <li>Prices include basic insurance coverage</li>
            </ul>

            <h3>4. Vehicle Care & Responsibility</h3>
            <ul>
              <li>Return vehicle in same condition as received</li>
              <li>Report any damage immediately</li>
              <li>Maintain minimum 20% battery level</li>
              <li>No smoking or pets in vehicles</li>
            </ul>

            <h3>5. Cancellation Policy</h3>
            <ul>
              <li>Free cancellation up to 24 hours before rental</li>
              <li>50% charge for cancellations within 24 hours</li>
              <li>No refund for no-shows</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;