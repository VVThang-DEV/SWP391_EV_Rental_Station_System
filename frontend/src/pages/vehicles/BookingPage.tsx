import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingStorage, BookingData } from "@/lib/booking-storage";
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
import { vehicles } from "@/data/vehicles";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/contexts/TranslationContext";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { getVehicleById } from "@/data/vehicles";
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

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const getTimeStr = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // THÊM MỚI: Helper function để tính End Time tối thiểu (Start Time + 1 giờ)
  const calculateMinimumEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Thêm 1 giờ
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  };
  // THÊM MỚI: Validate thời gian thuê tối thiểu cho hourly
  const validateHourlyRental = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours >= 1; // Tối thiểu 1 giờ
  };

  const handleRentalDurationChange = (value: string) => {
    setBookingData((prev) => {
      if (value === "hourly") {
        // Khi chọn hourly: End Date = Start Date và End Time = Start Time + 1 giờ
        const currentStartTime = prev.startTime || getTimeStr();
        const endTime = calculateMinimumEndTime(currentStartTime);

        return {
          ...prev,
          rentalDuration: value,
          endDate: prev.startDate, // End Date = Start Date
          endTime: endTime,
        };
      } else {
        // Daily rental: giữ logic cũ
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tính ngày hôm sau
        const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
        const currentTime = getTimeStr(); // Giờ hiện tại
        return {
          ...prev,
          rentalDuration: value,
          startDate: getTodayStr(), //  Chỉ cần set ngày bắt đầu
          endDate: tomorrowStr,  //  End Date sẽ được chọn bởi user
          startTime: currentTime, // ✅ Set giờ hiện tại
          endTime: currentTime,   // ✅ Set giờ hiện tại
        };
      }
    });
  };

  const currentUserData = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+84 901 234 567",
    driverLicense: "B123456789",

  };
  const [bookingData, setBookingData] = useState({
    startDate: getTodayStr(),
    endDate: "",
    startTime: getTimeStr(),
    endTime: getTimeStr(),
    rentalDuration: "daily",
    customerInfo: {
      fullName: currentUserData.fullName, // ✅ Auto-filled từ profile
      email: currentUserData.email, // ✅ Auto-filled từ profile  
      phone: currentUserData.phone, // ✅ Auto-filled từ profile
      driverLicense: currentUserData.driverLicense, // ✅ Auto-filled từ profile
    },
    paymentMethod: "qr_code",

  });

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

  const calculateCost = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;

    if (bookingData.rentalDuration === "hourly") {
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return hours * vehicle.pricePerHour;
    } else {
      // DAILY: tính theo ngày, từ startTime ngày đầu đến endTime ngày cuối
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // Tính số ngày
      // Đảm bảo ít nhất 1 ngày
      const minDays = Math.max(days, 1);
      return minDays * vehicle.pricePerDay;
    }
  };

  const baseCost = calculateCost();

  const deposit = 200; // Fixed deposit

  const totalCost = baseCost + deposit;

  const handleInputChange = (field: string, value: string | boolean) => {
   if (step === 3) {
      // Final confirmation - redirect to dashboard
      navigate("/dashboard");
    }
  };

  const renderBookingDetails = () => (
    <div className="space-y-6">
      {/* Rental Period */}
      <div id="rental-period">
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
                onValueChange={(value) => handleRentalDurationChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">
                    Hourly Rental - ${vehicle.pricePerHour}/hour
                  </SelectItem>
                  <SelectItem value="daily">
                    Daily Rental - ${vehicle.pricePerDay}/day
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 text-sm text-muted-foreground">
                {bookingData.rentalDuration === "hourly" ? (
                  <span>Selected: Hourly Rental - ${vehicle.pricePerHour} per hour for {vehicle.name}</span>
                ) : (
                  <span>Selected: Daily Rental - ${vehicle.pricePerDay} per day for {vehicle.name}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={bookingData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
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
                  disabled={bookingData.rentalDuration === "hourly"} // DISABLE KHI HOURLY
                />
                {/* THÊM THÔNG BÁO CHO HOURLY */}
                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    For hourly rental, end date is same as start date
                  </p>
                )}
              </div>
            </div>
            {/* THÊM: Start Time và End Time hiển thị cho cả Hourly và Daily */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={bookingData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className="text-black"
                  required
                  disabled={bookingData.rentalDuration === "daily"} // ✅ Disable cho Daily
                />
                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">

                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={bookingData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="text-black"
                  required
                  disabled={bookingData.rentalDuration === "daily"} // ✅ Disable cho Daily
                  min={bookingData.rentalDuration === "hourly" ? calculateMinimumEndTime(bookingData.startTime) : undefined}
                />
                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum rental duration: 1 hour
                  </p>
                )}
                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    End time same as start time for daily rental
                  </p>
                )}
              </div>
            </div>


          </CardContent>
        </Card>
      </div>
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
          {/* THÊM: Thông báo thông tin auto-fill */}
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Information automatically filled from your profile. You can edit if needed.</span>
          </div>
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
                placeholder="Enter your full name"
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
                placeholder="Enter email address"
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
                placeholder="Enter phone number"
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

      {/* Document Verification Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Documents Verified</h4>
              <p className="text-sm text-blue-700">
                Your identity documents (CCCD and driver's license) have been
                verified during registration. No additional document upload is
                required for this booking.
              </p>
            </div>
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

          // ✅ LƯU BOOKING KHI PAYMENT THÀNH CÔNG
          try {
            // Logic xác định status dựa trên thời gian
            const now = new Date();
            const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
            const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}`);

            let status: "active" | "upcoming" | "completed";

            if (now >= startDateTime && now <= endDateTime) {
              status = "active"; // Đang trong thời gian thuê
            } else if (now < startDateTime) {
              status = "upcoming"; // Chưa đến thời gian thuê
            } else {
              status = "completed"; // Đã kết thúc (trường hợp ít xảy ra)
            }

            const newBooking = bookingStorage.addBooking({
              vehicleId: vehicle.id,
              vehicle: vehicle.name,
              vehicleBrand: vehicle.brand,
              vehicleYear: vehicle.year,
              vehicleImage: vehicle.image,
              startDate: bookingData.startDate,
              endDate: bookingData.endDate,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              rentalDuration: bookingData.rentalDuration as "hourly" | "daily",
              pickupLocation: vehicle.location,
              status: status,
              totalCost: totalCost,
              baseCost: baseCost,
              deposit: deposit,
              duration: bookingData.rentalDuration === "hourly"
                ? (() => {
                  const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                  const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                  const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                  return `${hours} hour${hours !== 1 ? 's' : ''}`;
                })()
                : (() => {
                  const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                  const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  return `${days} day${days !== 1 ? 's' : ''}`;
                })(),
              customerInfo: bookingData.customerInfo,
              paymentMethod: bookingData.paymentMethod,
            });

            console.log("Booking saved successfully:", newBooking);
          } catch (error) {
            console.error("Error saving booking:", error);
            toast({
              title: "Error",
              description: "Failed to save booking. Please try again.",
              variant: "destructive",
            });
            return;
          }


          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed.",
          });
          setStep(3);
        }}
        paymentMethod={bookingData.paymentMethod as "qr_code" | "cash" | "card"}
        onBack={() => setStep(1)}
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
                      {bookingData.rentalDuration === "hourly" ? bookingData.startTime : "All day"}
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
                      {bookingData.rentalDuration === "hourly" ? bookingData.endTime : "All day"}
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-primary" : "bg-secondary"
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

 {/* Chỉ hiển thị button cho step 1, step 2 không có button nào */}
                       {step === 1 && (
                         <Button
                           className="w-full mt-4 btn-hero"
                           onClick={() => {
                             // Validate và chuyển sang payment
                             if (
                               !bookingData.startDate ||
                               !bookingData.endDate ||
                               !bookingData.startTime ||
                               !bookingData.endTime ||
                               !bookingData.customerInfo.fullName ||
                               !bookingData.customerInfo.email ||
                               !bookingData.customerInfo.phone ||
                               !bookingData.customerInfo.driverLicense
                             ) {
                               toast({
                                 title: "Missing Information",
                                 description: "Please fill in all required fields.",
                                 variant: "destructive",
                               });
                               return;
                             }

                             // VALIDATION CHO HOURLY RENTAL
                             if (bookingData.rentalDuration === "hourly") {
                               if (bookingData.startDate !== bookingData.endDate) {
                                 toast({
                                   title: "Invalid Date Range",
                                   description: "For hourly rental, start and end date must be the same.",
                                   variant: "destructive",
                                 });
                                 return;
                               }

                               const isValidTime = validateHourlyRental(bookingData.startTime, bookingData.endTime);
                               if (!isValidTime) {
                                 toast({
                                   title: "Invalid Time Range",
                                   description: "Minimum rental duration is 1 hour.",
                                   variant: "destructive",
                                 });
                                 return;
                               }
                             }

                             // VALIDATION CHO DAILY RENTAL
                             if (bookingData.rentalDuration === "daily") {
                               const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                               const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                               const diffMs = end.getTime() - start.getTime();
                               const days = diffMs / (1000 * 60 * 60 * 24);

                               if (days < 1) {
                                 toast({
                                   title: "Invalid Date Range",
                                   description: "Minimum rental duration is 1 day.",
                                   variant: "destructive",
                                 });
                                 return;
                               }
                             }

                             // Chuyển sang payment step
                             setStep(2);
                           }}
                         >
                           Continue to Payment
                         </Button>
                       )}

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
