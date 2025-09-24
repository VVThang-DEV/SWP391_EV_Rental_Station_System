import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCcw, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
  title?: string;
  description?: string;
  onResendOTP?: () => void;
}

export const OTPVerification = ({
  email,
  onVerifySuccess,
  onBack,
  title = "Verify Your Email",
  description = "We've sent a 6-digit verification code to your email address.",
  onResendOTP,
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();

  // Countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0 && !canResend) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [countdown, canResend]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await verifyOTPAPI({ email, otp });

      // Mock verification - replace with actual backend integration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success - in real implementation, check response from backend
      const isValid = true; // This should come from backend response

      if (isValid) {
        toast({
          title: "Verification Successful",
          description: "Your email has been verified successfully.",
        });
        onVerifySuccess();
      } else {
        toast({
          title: "Invalid OTP",
          description:
            "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setCanResend(false);
    setCountdown(60);

    try {
      // TODO: Replace with actual API call
      // await resendOTPAPI({ email });

      // Mock resend - replace with actual backend integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onResendOTP) {
        onResendOTP();
      }

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-premium w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
        <div className="flex items-center justify-center mt-4 p-3 bg-muted/20 rounded-lg">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Sent to:{" "}
            <span className="font-medium text-foreground">{email}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* OTP Input */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="text-primary hover:text-primary/80"
            >
              {!canResend ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
