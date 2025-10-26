import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface PaymentCheckoutProps {
  intentId: string;
  method: string;
  amount: number;
  onComplete: () => void;
  onCancel: () => void;
}

const PaymentCheckout = ({ intentId, method, amount, onComplete, onCancel }: PaymentCheckoutProps) => {
  console.log('PaymentCheckout rendered with:', { intentId, method, amount });
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeout = () => {
    setStatus("failed");
    toast({
      title: "Payment Expired",
      description: "Payment session has expired. Please try again.",
      variant: "destructive",
    });
    setTimeout(() => {
      onCancel();
    }, 2000);
  };

  const handleConfirmPayment = async () => {
    setStatus("processing");
    
    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        IntentId: intentId,
        PaymentMethod: method,
        Amount: amount,
        PaymentData: { timestamp: new Date().toISOString() },
      };
      
      console.log('Sending confirm payment request:', requestBody);
      
      const response = await fetch("http://localhost:5000/api/wallet/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Confirm payment response status:', response.status);
      
      if (response.ok) {
        setStatus("completed");
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      setStatus("failed");
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderPaymentMethod = () => {
    switch (method) {
      case "stripe":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-6 w-6" />
                <h3 className="font-semibold">Stripe Checkout</h3>
              </div>
              <p className="text-sm text-white/80">
                Enter your card details below to complete payment
              </p>
            </div>

            {/* Mock Card Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Card Number</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="4242 4242 4242 4242"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Expiry</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="MM/YY"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CVV</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="123"
                    disabled
                  />
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Sandbox Mode</p>
                <p className="text-muted-foreground">
                  Use test card: 4242 4242 4242 4242
                </p>
              </div>
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">PayPal</h3>
              </div>
              <p className="text-sm text-blue-700">
                You will be redirected to PayPal to complete your payment
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                P
              </div>
              <div className="flex-1">
                <p className="font-medium">PayPal Sandbox</p>
                <p className="text-sm text-muted-foreground">
                  Use sandbox credentials to test
                </p>
              </div>
            </div>
          </div>
        );

      case "momo":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-6 w-6 text-pink-600" />
                <h3 className="font-semibold text-pink-900">MoMo Wallet</h3>
              </div>
              <p className="text-sm text-pink-700">
                Scan QR code with MoMo app or pay via MoMo app
              </p>
            </div>
            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-pink-300 rounded-lg">
              <QRCodeSVG
                value={`momopay://sandbox?amount=${amount}&intent=${intentId}`}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
        );

      case "vnpay":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-6 w-6 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">VNPay</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Redirecting to VNPay gateway...
              </p>
            </div>
            <div className="bg-white border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-center font-medium text-lg mb-2">
                {amount.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Payment will be processed via VNPay sandbox
              </p>
            </div>
          </div>
        );

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <Badge variant="outline" className="w-full justify-center py-2">
              <Clock className="h-4 w-4 mr-2" />
              Sandbox Mode - Mock Bank Transfer
            </Badge>

            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Bank Transfer (Sandbox)</h3>
              </div>
              <p className="text-sm text-green-700">
                Simulated bank transfer - Click confirm to complete payment
              </p>
            </div>

            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bank:</span>
                <span className="font-medium text-sm">MB Bank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Number:</span>
                <span className="font-mono font-medium text-sm">2004777719</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Name:</span>
                <span className="font-medium text-sm">LUU VU HUNG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transfer Content:</span>
                <span className="font-mono font-medium text-sm">{intentId.substring(0, 15)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                💡 This is a sandbox simulation. No actual money will be transferred.
              </p>
            </div>

            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-green-300 rounded-lg">
              <QRCodeSVG
                value={`https://img.vietqr.io/image/970422-2004777719-compact2.jpg?amount=${amount}&addInfo=EV_${intentId.substring(0, 15)}`}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 text-center">
                In production, customers scan QR code with their banking app to transfer money
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground">Unknown payment method</p>
          </div>
        );
    }
  };

  if (status === "processing") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="font-medium">Processing payment...</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment has been processed successfully
            </p>
          </div>
          <Button onClick={onComplete}>Continue</Button>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">Please try again</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setStatus("idle")}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complete Payment</CardTitle>
            <Badge variant="secondary">{method.toUpperCase()}</Badge>
          </div>
          <CardDescription>
            Complete your payment to add funds to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="font-medium text-warning">
                Time remaining: {formatTime(timeLeft)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Amount */}
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">
              {amount.toLocaleString("vi-VN")} VND
            </p>
          </div>

          {/* Payment Method UI */}
          {renderPaymentMethod()}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={status === "processing"}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmPayment}
              disabled={status === "processing"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCheckout;

