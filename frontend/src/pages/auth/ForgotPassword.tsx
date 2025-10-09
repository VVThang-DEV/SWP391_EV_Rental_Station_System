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
import { OTPVerification } from "@/components/OTPVerification";

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
          <OTPVerification
            email={email}
            onVerifySuccess={handleOTPVerifySuccess}
            onBack={handleBackToEmail}
            title="Xác thực email"
            description="Nhập mã xác thực 6 số đã được gửi đến email của bạn"
            mode="forgot-password"
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


export default ForgotPassword;