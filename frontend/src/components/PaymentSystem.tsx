import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle,
  Copy,
  Download,
  Mail,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentSystemProps {
  amount: number;
  bookingId: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  onPaymentComplete: (paymentData: PaymentData) => void;
  paymentMethod?: "qr_code" | "cash" | "card";
}

interface PaymentData {
  paymentId: string;
  method: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  receiptSent: boolean;
}

const PaymentSystem = ({
  amount,
  bookingId,
  customerInfo,
  onPaymentComplete,
  paymentMethod = "qr_code",
}: PaymentSystemProps) => {
  const [currentMethod, setCurrentMethod] = useState(paymentMethod);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "completed" | "failed"
  >("idle");
  const [qrCodeData, setQrCodeData] = useState("");
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 minutes
  const { toast } = useToast();

  // Generate QR code data (mock)
  useEffect(() => {
    if (currentMethod === "qr_code") {
      const paymentData = {
        amount: amount,
        bookingId: bookingId,
        merchantId: "EVRENTALS_001",
        description: `EV Rental Payment - ${bookingId}`,
        timestamp: new Date().toISOString(),
      };
      setQrCodeData(JSON.stringify(paymentData));
    }
  }, [amount, bookingId, currentMethod]);

  // Payment timer countdown
  useEffect(() => {
    if (currentMethod === "qr_code" && paymentStatus === "idle") {
      const timer = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPaymentStatus("failed");
            toast({
              title: "Payment Expired",
              description: "The QR code has expired. Please try again.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentMethod, paymentStatus, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generateQRCode = () => {
    // In a real app, this would generate an actual QR code image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 200;

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#000000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("QR Code", 100, 100);
      ctx.fillText(`$${amount}`, 100, 120);
      ctx.fillText(bookingId, 100, 140);
    }

    return canvas.toDataURL();
  };

  const handlePaymentMethodChange = (method: "qr_code" | "cash" | "card") => {
    setCurrentMethod(method);
    setPaymentStatus("idle");
    setPaymentTimer(300);
  };

  const processPayment = async () => {
    setPaymentStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      const paymentData: PaymentData = {
        paymentId: `PAY_${Date.now()}`,
        method: currentMethod,
        amount: amount,
        status: "completed",
        timestamp: new Date(),
        receiptSent: false,
      };

      setPaymentStatus("completed");

      // Send receipt email (mock)
      setTimeout(() => {
        paymentData.receiptSent = true;
        onPaymentComplete(paymentData);

        toast({
          title: "Payment Successful!",
          description: `Receipt sent to ${customerInfo.email}`,
        });
      }, 1000);
    }, 2000);
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast({
      title: "Copied!",
      description: "Payment information copied to clipboard",
    });
  };

  const downloadReceipt = () => {
    // Mock receipt download
    const receiptData = {
      bookingId,
      customerName: customerInfo.fullName,
      amount: amount,
      date: new Date().toLocaleDateString(),
      paymentMethod: currentMethod,
    };

    const receiptText = `
EVRentals Receipt
================
Booking ID: ${receiptData.bookingId}
Customer: ${receiptData.customerName}
Amount: $${receiptData.amount}
Date: ${receiptData.date}
Payment Method: ${receiptData.paymentMethod.toUpperCase()}
================
Thank you for choosing EVRentals!
    `;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderQRPayment = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <QrCode className="h-6 w-6" />
            <span>QR Code Payment</span>
          </CardTitle>
          <CardDescription>
            Scan the QR code with your banking app or e-wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === "idle" && (
            <>
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-dashed border-primary rounded-lg">
                  <img
                    src={generateQRCode()}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Payment Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium text-warning">
                    Time remaining: {formatTime(paymentTimer)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  QR code will expire after 5 minutes
                </p>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono text-sm">{bookingId}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyQRData}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Details
                </Button>
                <Button className="flex-1" onClick={processPayment}>
                  I've Paid
                </Button>
              </div>
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="font-medium">Verifying payment...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your payment
              </p>
            </div>
          )}

          {paymentStatus === "completed" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-success-light rounded-full">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success">
                  Payment Successful!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed successfully
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCashPayment = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Banknote className="h-6 w-6" />
          <span>Cash Payment</span>
        </CardTitle>
        <CardDescription>
          Pay in cash at the rental station with staff assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-warning-light rounded-lg">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="text-sm space-y-1">
            <li>• Visit the rental station before pickup time</li>
            <li>• Present this booking confirmation to staff</li>
            <li>• Pay the exact amount in cash</li>
            <li>• Receive printed receipt from staff</li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold text-lg">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <Badge variant="outline">Cash at Station</Badge>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={processPayment}
          disabled={paymentStatus === "processing"}
        >
          {paymentStatus === "processing"
            ? "Processing..."
            : "Confirm Cash Payment"}
        </Button>
      </CardContent>
    </Card>
  );

  const renderCardPayment = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <span>Card Payment</span>
        </CardTitle>
        <CardDescription>
          Pay securely with your credit or debit card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Card payment integration would be implemented here with a payment
            processor like Stripe or PayPal.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-bold">${amount.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={processPayment}
          disabled={paymentStatus === "processing"}
        >
          {paymentStatus === "processing" ? "Processing..." : "Pay Now"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {paymentStatus === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={currentMethod === "qr_code" ? "default" : "outline"}
                className="h-16"
                onClick={() => handlePaymentMethodChange("qr_code")}
              >
                <div className="flex flex-col items-center space-y-2">
                  <QrCode className="h-6 w-6" />
                  <span>QR Code</span>
                </div>
              </Button>

              <Button
                variant={currentMethod === "cash" ? "default" : "outline"}
                className="h-16"
                onClick={() => handlePaymentMethodChange("cash")}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Banknote className="h-6 w-6" />
                  <span>Cash</span>
                </div>
              </Button>

              <Button
                variant={currentMethod === "card" ? "default" : "outline"}
                className="h-16"
                onClick={() => handlePaymentMethodChange("card")}
              >
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Card</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Interface */}
      {currentMethod === "qr_code" && renderQRPayment()}
      {currentMethod === "cash" && renderCashPayment()}
      {currentMethod === "card" && renderCardPayment()}

      {/* Receipt Actions */}
      {paymentStatus === "completed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadReceipt}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSystem;
