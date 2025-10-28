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
  Smartphone,
  CheckCircle,
  Clock,
  Loader2,
  ExternalLink,
  ArrowLeft,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

const MoMoPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const intentId = searchParams.get("intent");
  const amount = parseFloat(searchParams.get("amount") || "0");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const reservationId = searchParams.get("reservationId");

  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-open sandbox on mount
  useEffect(() => {
    if (status === "idle" && intentId) {
      // Auto-open sandbox in new tab
      const sandboxUrl = `http://localhost:8080/payment/momo/sandbox?intent=${intentId}&amount=${amount}&returnUrl=${encodeURIComponent(window.location.href)}`;
      window.open(sandboxUrl, '_blank');
    }
  }, [status, intentId, amount]);

  // Listen for payment success message from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[MoMoPayment] Received message:', event.data);
      if (event.data.type === 'MOMO_PAYMENT_SUCCESS' && event.data.intentId === intentId) {
        console.log('[MoMoPayment] Payment success confirmed via postMessage');
        setPaymentConfirmed(true);
        setStatus("completed");
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [intentId]);

  // Poll for payment status
  useEffect(() => {
    if (status !== "idle" || !intentId) return;
    
    const pollInterval = setInterval(async () => {
      try {
      const response = await fetch(
            `http://localhost:5000/api/payment/momo/status?intentId=${intentId || ''}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.status === "completed") {
            setPaymentConfirmed(true);
            setStatus("completed");
          }
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [status, intentId]);

  // Handle payment success
  useEffect(() => {
    if (status === "completed") {
      console.log('[MoMoPayment] Status completed, redirecting to:', returnUrl);
      toast({
        title: "Payment Successful!",
        description: `Your payment has been confirmed. Redirecting to ${returnUrl}...`,
      });
      
      setTimeout(() => {
        navigate(returnUrl);
      }, 1500);
    }
  }, [status, navigate, returnUrl, toast]);

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
  };

  const handleConfirmPayment = async () => {
    // Don't do anything - let polling handle it
    toast({
      title: "Payment Detection",
      description: "Please wait for automatic payment detection...",
    });
  };

  const handleNavigateToMoMo = () => {
    // Navigate to mock MoMo sandbox payment page
    const momoUrl = `http://localhost:8080/payment/momo/sandbox?intent=${intentId}&amount=${amount}`;
    window.open(momoUrl, "_blank");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment has been processed successfully
            </p>
          </div>
          <Button onClick={() => navigate(returnUrl)}>Continue</Button>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">Please try again</p>
          </div>
          <Button onClick={() => navigate(returnUrl)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // At this point status is "idle" only (after the guards above)
  // Check if payment is confirmed to show redirect message
  const showRedirectMessage = paymentConfirmed;

  // Generate MoMo QR Code for sandbox (using local mock)
  const momoQRValue = `http://localhost:8080/payment/momo/sandbox?intent=${intentId}&amount=${amount}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-center">MoMo Payment</h1>
          <p className="text-center text-muted-foreground">
            Complete your payment securely
          </p>
        </div>

        <Card className="border-2 border-pink-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-pink-600" />
                MoMo Wallet Payment
              </CardTitle>
              <Badge variant="secondary">SANDBOX MODE</Badge>
            </div>
            <CardDescription>
              Scan the QR code with your MoMo app or click to pay via MoMo portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="font-medium text-warning">
                  Time remaining: {formatTime(countdown)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-pink-600">
                {formatCurrency(amount)}
              </p>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              {/* Option 1: QR Code */}
              <div className="p-6 bg-white border-2 border-dashed border-pink-300 rounded-lg">
                <h3 className="text-center font-semibold mb-4">
                  Scan with MoMo App
                </h3>
                <div className="flex justify-center p-4">
                  <QRCodeSVG
                    value={momoQRValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Open MoMo app and scan this QR code
                </p>
              </div>

              {/* Option 2: Direct Link */}
              <Button
                className="w-full h-16 text-lg"
                variant="outline"
                onClick={handleNavigateToMoMo}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Open MoMo Payment Portal
              </Button>

              {/* Sandbox Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  💡 <strong>Sandbox Mode:</strong> No real money will be charged.
                  Use test credentials from MoMo Developer Portal.
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">Payment Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click "Open MoMo Payment Portal" or scan the QR code</li>
                  <li>Complete payment in MoMo sandbox environment</li>
                  <li>You will be automatically redirected back when payment succeeds</li>
                </ol>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                onClick={() => {
                  console.log('[MoMoPayment] Manual confirmation clicked, checking status...');
                  // Manually check status
                  fetch(`http://localhost:5000/api/payment/momo/status?intentId=${intentId || ''}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }).then(async (res) => {
                    const data = await res.json();
                    console.log('[MoMoPayment] Manual check result:', data);
                    if (data.success && data.status === "completed") {
                      setStatus("completed");
                    } else {
                      toast({
                        title: "Still Processing",
                        description: "Please wait for payment to be processed, or complete it in the sandbox window.",
                      });
                    }
                  }).catch(err => console.error('[MoMoPayment] Manual check error:', err));
                }}
                disabled={status !== "idle"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Waiting for Payment...
              </Button>
            </div>

            {/* Auto-redirect indicator */}
            {showRedirectMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Payment confirmed! Redirecting you...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        {reservationId && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Reservation ID:</span>{" "}
                  <span className="font-mono">{reservationId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Intent ID:</span>{" "}
                  <span className="font-mono">{intentId}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MoMoPaymentPage;

