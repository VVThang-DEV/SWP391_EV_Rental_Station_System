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
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast"; 

interface PaymentSystemProps {
  amount: number;
  bookingId: string;
  vehicleId?: string; // Thêm vehicle ID
  vehicleName?: string; // Thêm vehicle name
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  onPaymentComplete: (paymentData: PaymentData) => void;
  paymentMethod?: "qr_code" | "cash";
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
  vehicleId = "",
  vehicleName = "",
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

  // Chuyển đổi USD sang VND
  const convertToVND = (usdAmount: number) => {
    const exchangeRate = 26000; // 1 USD = 26,000 VND
    return Math.round(usdAmount * exchangeRate);
  };

  // Số tiền VND để hiển thị và thanh toán
  const amountVND = convertToVND(amount);

  // Thông tin ngân hàng thực
  const BANK_INFO = {
    bankName: "MB Bank",
    accountNumber: "2004777719",
    accountName: "LUU VU HUNG",
    branch: "Chi nhanh Binh Thanh"
  };

  // Tạo nội dung chuyển khoản
  const generateTransferContent = () => {
    return `EV ${vehicleId || bookingId.replace('BOOK_', '')} ${customerInfo.fullName.substring(0, 15)}`;
  };

  // Tạo QR Code thực cho chuyển khoản
  const generateBankQRContent = () => {
    const transferContent = generateTransferContent();
    // Format theo chuẩn VietQR đúng
    const bankCode = "970422"; // Mã ngân hàng MB Bank
    const serviceCode = "QRIBFTTC"; // Dịch vụ chuyển tiền
    // VietQR format với số tiền VND
    return `https://img.vietqr.io/image/${bankCode}-${BANK_INFO.accountNumber}-compact2.jpg?amount=${amountVND}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  };

  // Copy function thực
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard`,
        duration: 2000,
      });
    });
  };

  const navigate = useNavigate();
 
  // Generate QR code data (mock)
  useEffect(() => {
    if (currentMethod === "qr_code") {
      const paymentData = {
        amount: amount, // USD
        amountVND: amountVND, // VND
        bookingId: bookingId,
        vehicleId: vehicleId,
        vehicleName: vehicleName,
        merchantId: "EVRENTALS_001",
        description: `EV Rental Payment - ${bookingId}`,
        timestamp: new Date().toISOString(),
      };
      setQrCodeData(JSON.stringify(paymentData));
    }
  }, [amount, bookingId, vehicleId, vehicleName, currentMethod, amountVND]);

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



  const handlePaymentMethodChange = (method: "qr_code" | "cash") => {
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
        amount: amountVND,
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
            <span>Bank Transfer QR Code</span>
          </CardTitle>
          <CardDescription>
            Scan with your banking app to transfer money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === "idle" && (
            <>

              {/* ✅ THÊM: Bank Information */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{BANK_INFO.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{BANK_INFO.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber, "Account number")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium text-xs">{BANK_INFO.accountName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transfer Content:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600 text-xs">{generateTransferContent()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(generateTransferContent(), "Transfer content")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-dashed border-primary rounded-lg">
                  <img
                    src={generateBankQRContent()}
                    alt="VietQR Code"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      // Fallback nếu API VietQR lỗi
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.innerHTML = `
                        <QRCodeSVG
                          value="${generateTransferContent()}"
                          size={200}
                          level="M"
                          includeMargin={true}
                        />
                      `;
                      target.parentNode?.appendChild(fallback);
                    }}
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
                  Transfer must be completed within 5 minutes
                </p>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">{amountVND.toLocaleString('vi-VN')} VND</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Original Price:</span>
                  <span className="text-sm text-muted-foreground">${amount}</span>
                </div>

                {vehicleName && (
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-medium text-sm">{vehicleName}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono text-sm">{bookingId}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={processPayment}> 
                  <CheckCircle className="h-4 w-4 mr-2" />
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
            <span className="font-bold text-lg">{amountVND.toLocaleString('vi-VN')} VND</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Original Price:</span>
            <span className="text-sm text-muted-foreground">${amount}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            </div> 
          </CardContent>
        </Card>
      )}

      {/* Payment Interface */}
      {currentMethod === "qr_code" && renderQRPayment()}
      {currentMethod === "cash" && renderCashPayment()} 

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
