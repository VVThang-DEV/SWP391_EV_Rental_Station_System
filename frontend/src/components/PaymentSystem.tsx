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
  paymentMethod?: "wallet" | "cash";
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
  paymentMethod = "wallet",
  onBack,
}: PaymentSystemProps) => {
  const [currentMethod, setCurrentMethod] = useState(paymentMethod);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "completed" | "failed"
  >("idle");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const { toast } = useToast();

  // Chuyển đổi USD sang VND
  const convertToVND = (usdAmount: number) => {
    const exchangeRate = 26000; // 1 USD = 26,000 VND
    return Math.round(usdAmount * exchangeRate);
  };

  // Số tiền VND để hiển thị và thanh toán
  const amountVND = convertToVND(amount);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoadingBalance(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/wallet/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWalletBalance(data.balance);
        } else {
          console.error('Failed to fetch wallet balance');
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchWalletBalance();
  }, []);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };



  const handlePaymentMethodChange = (method: "wallet" | "cash") => {
    setCurrentMethod(method);
    setPaymentStatus("idle");
  };

  const processPayment = async () => {
    if (currentMethod === "wallet" && walletBalance !== null && walletBalance < amountVND) {
      toast({
        title: "Insufficient Balance",
        description: `Your wallet has ${walletBalance.toLocaleString('vi-VN')} VND, but you need ${amountVND.toLocaleString('vi-VN')} VND. Please deposit more money.`,
        variant: "destructive",
      });
      return;
    }

    setPaymentStatus("processing");

    try {
      if (currentMethod === "wallet") {
        // Call wallet withdrawal API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch('http://localhost:5000/api/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            Amount: amountVND,
            Reason: `Payment for booking ${bookingId}`,
            TransactionId: `TXN_${Date.now()}`,
            ReservationId: null, // Will be set later when reservation is created
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Payment failed');
        }

        const result = await response.json();
        
        // Update local balance
        setWalletBalance(result.newBalance);

        const paymentData: PaymentData = {
          paymentId: `PAY_${Date.now()}`,
          method: "wallet",
          amount: amountVND,
          status: "completed",
          timestamp: new Date(),
          receiptSent: false,
        };

        setPaymentStatus("completed");

        toast({
          title: "Payment Successful!",
          description: `Amount ${amountVND.toLocaleString('vi-VN')} VND deducted from wallet. New balance: ${result.newBalance.toLocaleString('vi-VN')} VND`,
        });

        setTimeout(() => {
          paymentData.receiptSent = true;
          onPaymentComplete(paymentData);
        }, 1000);
      } else {
        // Cash payment (simulated)
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

          setTimeout(() => {
            paymentData.receiptSent = true;
            onPaymentComplete(paymentData);

            toast({
              title: "Payment Successful!",
              description: `Receipt sent to ${customerInfo.email}`,
            });
          }, 1000);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus("failed");
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    }
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


  


  const renderWalletPayment = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <CreditCard className="h-6 w-6" />
            <span>Wallet Payment</span>
          </CardTitle>
          <CardDescription>
            Pay directly from your wallet balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === "idle" && (
            <>
              {/* Wallet Balance */}
              {loadingBalance ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading wallet balance...</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Current Balance:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {walletBalance !== null ? walletBalance.toLocaleString('vi-VN') : '0'} VND
                    </span>
                  </div>
                  {walletBalance !== null && walletBalance < amountVND && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <p>⚠️ Insufficient balance</p>
                      <p className="text-xs mt-1">You need {amountVND.toLocaleString('vi-VN')} VND but only have {walletBalance.toLocaleString('vi-VN')} VND</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Amount:</span>
                  <span className="font-bold text-lg text-green-600">{amountVND.toLocaleString('vi-VN')} VND</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Original Price:</span>
                  <span className="text-sm text-muted-foreground">${amount}</span>
                </div>

                {vehicleName && (
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-medium">{vehicleName}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono text-sm">{bookingId}</span>
                </div>

                {walletBalance !== null && walletBalance >= amountVND && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance After Payment:</span>
                      <span className="font-bold text-blue-600">
                        {(walletBalance - amountVND).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={processPayment}
                  disabled={walletBalance !== null && walletBalance < amountVND}
                > 
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pay with Wallet
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
                variant={currentMethod === "wallet" ? "default" : "outline"}
                className="h-16"
                onClick={() => handlePaymentMethodChange("wallet")}
              >
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Wallet</span>
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
      {currentMethod === "wallet" && renderWalletPayment()}
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
