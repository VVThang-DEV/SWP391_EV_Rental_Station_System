import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Mail, Lock, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

type Step = "email" | "otp" | "reset";

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Gửi yêu cầu thất bại");
      }

        toast({
        title: "Thành công",
        description: json.message,
        });
        setStep("otp");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerifySuccess = (otp: string) => {
    setOtpCode(otp);
    setStep("reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu mới",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 8 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode,
          newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Đặt lại mật khẩu thất bại");
      }

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được đặt lại thành công",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
  };

  const handleBackToOTP = () => {
    setStep("otp");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {step === "email" && (
          <Card className="shadow-premium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Quên mật khẩu?
              </CardTitle>
              <CardDescription className="text-center">
                Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                      placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 text-black focus-visible:ring-offset-0"
                    required
                  />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  <ArrowLeft className="inline h-4 w-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <OTPVerificationCustom
            email={email}
            onVerifySuccess={handleOTPVerifySuccess}
            onBack={handleBackToEmail}
            title="Xác thực email"
            description="Nhập mã xác thực 6 số đã được gửi đến email của bạn"
          />
        )}

        {step === "reset" && (
          <Card className="shadow-premium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Đặt mật khẩu mới
              </CardTitle>
              <CardDescription className="text-center">
                Tạo mật khẩu mới cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 text-black focus-visible:ring-offset-0"
                      minLength={8}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 text-black focus-visible:ring-offset-0"
                      minLength={8}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-hero"
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleBackToOTP}
                  disabled={isLoading}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại xác thực
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Custom OTP component for forgot password (doesn't verify immediately)
const OTPVerificationCustom = ({
  email,
  onVerifySuccess,
  onBack,
  title = "Verify Your Email",
  description = "We've sent a 6-digit verification code to your email address.",
}: {
  email: string;
  onVerifySuccess: (otp: string) => void;
  onBack: () => void;
  title?: string;
  description?: string;
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();

  // Countdown timer for resend button
  React.useEffect(() => {
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Invalid or expired OTP");
      }

      toast({ title: "OTP verified", description: "Bạn có thể đặt mật khẩu mới." });
      onVerifySuccess(otp);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: (error as any)?.message || "OTP không hợp lệ hoặc đã hết hạn.",
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Failed to resend code");
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

export default ForgotPassword;