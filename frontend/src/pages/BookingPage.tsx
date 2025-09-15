import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicles } from "../data/vehicles";
import { formatCurrency } from "../lib/currency";
import { useTranslation } from "../contexts/TranslationContext";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { getVehicleById } from "@/data/vehicles";
import DocumentUpload from "@/components/DocumentUpload";
import PaymentSystem from "@/components/PaymentSystem";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Upload,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  Shield,
  CheckCircle,
  User,
  Check,
  FileText,
  MapPin,
  Smartphone,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const vehicle = id ? getVehicleById(id) : null;

  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    rentalDuration: "daily",
    customerInfo: {
      fullName: "John Doe", // Pre-filled from user context
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      driverLicense: "",
      emergencyContact: "",
    },
    paymentMethod: "qr_code",
    agreeToTerms: false,
    agreeToInsurance: false,
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, File>
  >({});
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The vehicle you're trying to book doesn't exist.
          </p>
          <Button asChild>
            <Link to="/vehicles">Browse All Vehicles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDocumentUpload = (documentType: string, file: File) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));
  };

  const calculateCost = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;

    const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
    const diffMs = end.getTime() - start.getTime();

    if (bookingData.rentalDuration === "hourly") {
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return hours * vehicle.pricePerHour;
    } else {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days * vehicle.pricePerDay;
    }
  };

  const baseCost = calculateCost();
  const insuranceCost = bookingData.agreeToInsurance ? baseCost * 0.1 : 0;
  const deposit = 200; // Fixed deposit
  const totalCost = baseCost + insuranceCost + deposit;

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setBookingData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleStepSubmit = () => {
    if (step === 1) {
      // Validate booking details
      if (
        !bookingData.startDate ||
        !bookingData.endDate ||
        !bookingData.agreeToTerms
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields and agree to terms.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Process payment (mock)
      setStep(3);
      toast({
        title: "Booking Confirmed!",
        description: "Your vehicle has been successfully booked.",
      });
    } else {
      // Final confirmation - redirect to dashboard
      navigate("/dashboard");
    }
  };

  const renderBookingDetails = () => (
    <div className="space-y-6">
      {/* Rental Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Rental Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Rental Type</Label>
            <Select
              value={bookingData.rentalDuration}
              onValueChange={(value) =>
                handleInputChange("rentalDuration", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Rental</SelectItem>
                <SelectItem value="daily">Daily Rental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={bookingData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="text-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={bookingData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={
                  bookingData.startDate ||
                  new Date().toISOString().split("T")[0]
                }
                className="text-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={bookingData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="text-black"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={bookingData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="text-black"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={bookingData.customerInfo.fullName}
                onChange={(e) =>
                  handleInputChange("customerInfo.fullName", e.target.value)
                }
                className="text-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={bookingData.customerInfo.email}
                onChange={(e) =>
                  handleInputChange("customerInfo.email", e.target.value)
                }
                className="text-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={bookingData.customerInfo.phone}
                onChange={(e) =>
                  handleInputChange("customerInfo.phone", e.target.value)
                }
                className="text-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="driverLicense">Driver's License Number *</Label>
              <Input
                id="driverLicense"
                value={bookingData.customerInfo.driverLicense}
                onChange={(e) =>
                  handleInputChange(
                    "customerInfo.driverLicense",
                    e.target.value
                  )
                }
                placeholder="Enter license number"
                className="text-black"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <DocumentUpload
        onDocumentUpload={handleDocumentUpload}
        requiredDocuments={["driverLicense", "nationalId"]}
        uploadedDocuments={uploadedDocuments}
      />

      {/* Insurance & Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Insurance & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={bookingData.agreeToInsurance}
              onCheckedChange={(checked) =>
                handleInputChange("agreeToInsurance", checked.toString())
              }
            />
            <label htmlFor="insurance" className="text-sm">
              Add premium insurance coverage (+{(baseCost * 0.1).toFixed(0)}$ -
              10% of rental cost)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={bookingData.agreeToTerms}
              onCheckedChange={(checked) =>
                handleInputChange("agreeToTerms", checked.toString())
              }
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/rental-agreement"
                className="text-primary hover:underline"
              >
                Rental Agreement
              </Link>
              *
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <PaymentSystem
        amount={totalCost}
        bookingId={`BOOK_${Date.now()}`}
        customerInfo={bookingData.customerInfo}
        onPaymentComplete={(paymentData) => {
          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed.",
          });
          setStep(3);
        }}
        paymentMethod={bookingData.paymentMethod as "qr_code" | "cash" | "card"}
      />
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-lg text-muted-foreground mb-2">
          Your {vehicle.name} has been successfully booked.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
          <span className="text-sm font-medium text-green-800">
            Booking ID: <strong>#EV-{Date.now().toString().slice(-6)}</strong>
          </span>
        </div>
      </div>

      {/* Enhanced Booking Summary */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-20 h-16 object-cover rounded-lg border"
                />
                <div>
                  <h3 className="font-bold text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} • {vehicle.year}
                  </p>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                    <span className="text-sm">{vehicle.location}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Condition */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Vehicle Condition</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize font-medium text-green-600">
                      {vehicle.condition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mileage:</span>
                    <span>{vehicle.mileage?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Maintenance:</span>
                    <span>{vehicle.lastMaintenance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <div className="font-medium">{bookingData.startDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.startTime || "09:00"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <div className="font-medium">
                      {bookingData.customerInfo.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.customerInfo.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <div className="font-medium">{bookingData.endDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.endTime || "18:00"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="font-medium">
                      {bookingData.customerInfo.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium text-sm mb-3">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Cost:</span>
                    <span>${baseCost.toFixed(2)}</span>
                  </div>
                  {bookingData.agreeToInsurance && (
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span>${insuranceCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Deposit:</span>
                    <span>${deposit.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span className="text-primary">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced QR Code Section */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center text-amber-800">
            <Smartphone className="h-5 w-5 mr-2" />
            Vehicle Access QR Code
          </CardTitle>
          <p className="text-sm text-amber-700 mt-1">
            Scan this code when you arrive at the vehicle
          </p>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <div className="inline-block p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <QRCodeGenerator
              bookingId={`EV-${Date.now().toString().slice(-6)}`}
              vehicleId={vehicle.id}
              customerName={bookingData.customerInfo.fullName}
              pickupLocation={vehicle.location}
              size={180}
            />
          </div>
          <p className="text-xs text-amber-700 mt-3 max-w-md mx-auto">
            Keep this QR code handy - you'll need it to unlock your vehicle at
            the pickup location.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-sm text-blue-800 mb-1">
            📧 A confirmation email has been sent to{" "}
            {bookingData.customerInfo.email}
          </p>
          <p className="text-xs text-blue-600">
            Please check your spam folder if you don't see it within 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className="btn-hero h-12"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="h-12 border-2"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <FadeIn delay={100}>
            <Button variant="ghost" asChild className="mb-6">
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicle Details
              </Link>
            </Button>
          </FadeIn>

          {/* Progress Steps */}
          <FadeIn delay={200}>
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          step > stepNumber ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">
                  {step === 1 && "Booking Details"}
                  {step === 2 && "Payment"}
                  {step === 3 && "Confirmation"}
                </h1>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <SlideIn direction="left" delay={300}>
                {step === 1 && renderBookingDetails()}
                {step === 2 && renderPaymentStep()}
                {step === 3 && renderConfirmation()}
              </SlideIn>
            </div>

            {/* Sidebar - Vehicle Summary */}
            {step < 3 && (
              <div className="lg:col-span-1">
                <SlideIn direction="right" delay={400}>
                  <div className="sticky top-8">
                    <Card>
                      <CardContent className="p-6">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-bold text-lg mb-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {vehicle.location}
                        </p>

                        {baseCost > 0 && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Base Cost:</span>
                              <span>${baseCost.toFixed(2)}</span>
                            </div>
                            {bookingData.agreeToInsurance && (
                              <div className="flex justify-between">
                                <span>Insurance:</span>
                                <span>${insuranceCost.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Deposit:</span>
                              <span>${deposit.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>${totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full mt-4 btn-hero"
                          onClick={handleStepSubmit}
                          disabled={
                            step === 1 &&
                            (!bookingData.agreeToTerms ||
                              !bookingData.startDate ||
                              !bookingData.endDate)
                          }
                        >
                          {step === 1 && "Continue to Payment"}
                          {step === 2 && "Confirm Booking"}
                          {step === 3 && "Go to Dashboard"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </SlideIn>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingPage;
