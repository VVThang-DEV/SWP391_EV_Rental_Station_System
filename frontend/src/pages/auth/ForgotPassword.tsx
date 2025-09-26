import "./Login/Style.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Car, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OTPVerification } from "@/components/OTPVerification";
import { PasswordReset } from "@/components/PasswordReset";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await requestPasswordResetAPI({ email });

      // Mock sending OTP - replace with actual backend integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email) {
        toast({
          title: "Verification Code Sent",
          description: `We've sent a verification code to ${email}`,
        });
        setStep("otp");
      } else {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerifySuccess = () => {
    setStep("reset");
  };

  const handleBackToEmail = () => {
    setStep("email");
  };

  const handleBackToOTP = () => {
    setStep("otp");
  };

  const handlePasswordResetSuccess = () => {
    toast({
      title: "Success!",
      description:
        "Your password has been reset successfully. You can now sign in with your new password.",
    });
    navigate("/login");
  };

  return (
    <div className="login-page">
      <div className="w-full max-w-md">
        {/* Back Link - only show on email step */}
        {step === "email" && (
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="p-3 bg-white rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">EVRentals</span>
          </Link>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <Card className="shadow-premium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a verification code
                to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="login-form space-y-4">
                <div className="relative mb-6">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-black"
                    placeholder=" "
                    required
                    disabled={isLoading}
                  />
                  <label htmlFor="email">Email address</label>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <OTPVerification
            email={email}
            onVerifySuccess={handleOTPVerifySuccess}
            onBack={handleBackToEmail}
            title="Verify Your Identity"
            description="We've sent a 6-digit verification code to your email address."
          />
        )}

        {/* Password Reset Step */}
        {step === "reset" && (
          <PasswordReset
            email={email}
            onResetSuccess={handlePasswordResetSuccess}
            onBack={handleBackToOTP}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
