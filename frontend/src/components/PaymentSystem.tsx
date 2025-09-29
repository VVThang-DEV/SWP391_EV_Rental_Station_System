import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}


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
  onBack?: () => void;
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
  onBack,
}: PaymentSystemProps) => {
  const [currentMethod, setCurrentMethod] = useState(paymentMethod);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "completed" | "failed"
  >("idle");
  const [qrCodeData, setQrCodeData] = useState("");
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 minutes
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });
  const [cardErrors, setCardErrors] = useState<Partial<CardFormData>>({});
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

  const validateCardForm = (): boolean => {
    const errors: Partial<CardFormData> = {};

    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, "").length !== 16) {
      errors.cardNumber = "Số thẻ phải có 16 chữ số";
    }

    if (!cardForm.expiryMonth) {
      errors.expiryMonth = "Vui lòng chọn tháng";
    }

    if (!cardForm.expiryYear) {
      errors.expiryYear = "Vui lòng chọn năm";
    }

    if (!cardForm.cvv || cardForm.cvv.length !== 3) {
      errors.cvv = "CVV phải có 3 chữ số";
    }

    if (!cardForm.cardholderName.trim()) {
      errors.cardholderName = "Vui lòng nhập tên chủ thẻ";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 3);
    }

    setCardForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    if (cardErrors[field]) {
      setCardErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear + i);
    }
    return years;
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
    <div className="space-y-6">
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
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Số thẻ</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardForm.cardNumber}
                onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                maxLength={19}
                className={cardErrors.cardNumber ? "border-red-500" : ""}
              />
              {cardErrors.cardNumber && (
                <p className="text-sm text-red-500">{cardErrors.cardNumber}</p>
              )}
            </div>

            {/* Loại thẻ */}
            <div className="space-y-2">
              <Label>Loại thẻ</Label>
              <div className="flex space-x-2">
                <Badge variant="outline">💳 VISA</Badge>
                <Badge variant="outline">💳 Mastercard</Badge>
              </div>
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày hết hạn</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={cardForm.expiryMonth}
                    onValueChange={(value) => handleCardInputChange("expiryMonth", value)}
                  >
                    <SelectTrigger className={cardErrors.expiryMonth ? "border-red-500" : ""}>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={cardForm.expiryYear}
                    onValueChange={(value) => handleCardInputChange("expiryYear", value)}
                  >
                    <SelectTrigger className={cardErrors.expiryYear ? "border-red-500" : ""}>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYears().map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(cardErrors.expiryMonth || cardErrors.expiryYear) && (
                  <p className="text-sm text-red-500">
                    {cardErrors.expiryMonth || cardErrors.expiryYear}
                  </p>
                )}
              </div>

              

              <div className="space-y-2">
                 <Label htmlFor="cvv">Mã số bảo mật</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cardForm.cvv}
                  onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                  maxLength={3}
                  className={cardErrors.cvv ? "border-red-500" : ""}
                />
                {cardErrors.cvv && (
                  <p className="text-sm text-red-500">{cardErrors.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="Nhập tên như trên thẻ"
                value={cardForm.cardholderName}
                onChange={(e) => handleCardInputChange("cardholderName", e.target.value)}
                className={cardErrors.cardholderName ? "border-red-500" : ""}
              />
              {cardErrors.cardholderName && (
                <p className="text-sm text-red-500">{cardErrors.cardholderName}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold text-lg">${amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Thông tin thẻ được bảo mật và mã hóa</span>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (validateCardForm()) {
                processPayment();
              }
            }}
            disabled={paymentStatus === "processing"}
          >
            {paymentStatus === "processing" ? "Đang xử lý..." : "Pay Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {paymentStatus === "idle" && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Select Payment Method</CardTitle>
            <Button
              variant="outline"
              aria-label="Back to information"
              onClick={() => {
                if (typeof onBack === "function") {
                  onBack();
                } else {
                  navigate(-1);
                }
              }}
            >
              Back to Information
            </Button>
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
