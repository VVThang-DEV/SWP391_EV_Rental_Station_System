import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeedbackForm from "../components/FeedbackForm";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

const FeedbackPage = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data - in real app, this would come from API
  const rentalData = {
    id: parseInt(rentalId || "0"),
    vehicleModel: "Tesla Model 3",
    stationName: "District 1 EV Station",
    rentalDate: "2024-01-15",
    duration: "8 hours",
    totalCost: "₫240,000"
  };

  const handleFeedbackSuccess = () => {
    setIsSubmitted(true);
  };

  const handleGoBack = () => {
    navigate("/bookings");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully. We appreciate your time and input!
            </p>
            <div className="space-y-2">
              <Button onClick={handleGoBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-6 text-white hover:text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Share Your Experience
            </h1>
            <p className="text-xl text-white/90">
              Help us improve by rating your recent rental
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeedbackForm
          rentalId={rentalData.id}
          vehicleModel={rentalData.vehicleModel}
          stationName={rentalData.stationName}
          onSuccess={handleFeedbackSuccess}
        />
      </div>
    </div>
  );
};

export default FeedbackPage;
