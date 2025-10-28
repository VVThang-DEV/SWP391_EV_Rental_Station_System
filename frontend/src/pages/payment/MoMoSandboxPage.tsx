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
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MoMoSandboxPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const intentId = searchParams.get("intent");
  const amount = parseFloat(searchParams.get("amount") || "0");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Simulate payment processing
  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 100) {
            setStatus("success");
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [status]);

  const handleStartPayment = async () => {
    setStatus("processing");
    
    setTimeout(async () => {
      // Simulate successful payment
      setStatus("success");
      
      // Send success callback to webhook
      try {
        console.log("[Sandbox] Sending webhook request...");
        const webhookResponse = await fetch(`http://localhost:5000/api/payment/momo/webhook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            intentId,
            status: "completed",
            amount,
            transactionId: `TXN_${Date.now()}`,
          }),
        });
        
        console.log("[Sandbox] Webhook response status:", webhookResponse.status);
        
        let webhookData;
        const contentType = webhookResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          webhookData = await webhookResponse.json();
          console.log("[Sandbox] Webhook response:", webhookData);
        } else {
          const textData = await webhookResponse.text();
          console.log("[Sandbox] Webhook response (text):", textData);
          webhookData = { success: webhookResponse.ok };
        }
      } catch (err) {
        console.error("[Sandbox] Webhook error (continuing anyway):", err);
        // Continue with postMessage even if webhook fails
        // This allows the payment to complete via polling
      }
      
      // Always send postMessage regardless of webhook result
      if (window.opener) {
        console.log("[Sandbox] Sending postMessage to parent...");
        window.opener.postMessage({
          type: 'MOMO_PAYMENT_SUCCESS',
          intentId,
          amount,
        }, '*');
      }
      
      // Close this window after showing success
      setTimeout(() => {
        window.close();
      }, 2000);
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-pink-600" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Processing Payment...</h3>
                <p className="text-muted-foreground">
                  Please wait while we process your payment
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-pink-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {simulatedProgress}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-green-600">
                  Payment Successful!
                </h3>
                <p className="text-muted-foreground">
                  Your payment has been processed successfully
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(amount)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Redirecting you back...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto py-8">
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-pink-600" />
                MoMo Sandbox Payment
              </CardTitle>
              <Badge variant="secondary">TEST MODE</Badge>
            </div>
            <CardDescription>
              Sandbox environment - No real money will be charged
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-pink-600">
                {formatCurrency(amount)}
              </p>
            </div>

            {/* Sandbox Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 text-center">
                🧪 <strong>Sandbox Mode:</strong> This is a simulated payment environment.
                No real money will be charged.
              </p>
            </div>

            {/* Sandbox Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="font-semibold">Payment Details:</div>
                <div className="space-y-1">
                  <div><span className="text-muted-foreground">Intent ID:</span> <span className="font-mono text-xs">{intentId}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="ml-2">Test Payment</Badge></div>
                </div>
              </div>

            {/* Payment Button */}
            <Button
              className="w-full h-16 text-lg bg-pink-600 hover:bg-pink-700"
              onClick={handleStartPayment}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Pay with MoMo (Test)
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              In production, this would redirect to actual MoMo payment gateway
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoMoSandboxPage;

