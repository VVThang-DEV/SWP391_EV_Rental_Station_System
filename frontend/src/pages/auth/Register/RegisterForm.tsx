import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { OTPVerification } from "@/components/OTPVerification";
import { User as UserType } from "./types";

interface RegisterFormProps {
  onRegister: (userData: UserType) => void;
}

export const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Live-validate and clear/update error as user types
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    // Custom validation first for better, localized messages
    const fieldErrors = validateAllFields();
    setErrors(fieldErrors);
    const firstError = Object.values(fieldErrors).find((msg) => msg);
    if (firstError) {
      toast({
        title: t("register.error"),
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    // Then use native validation to highlight any remaining constraints
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: t("register.agreementRequired"),
        description: t("register.agreeToTerms"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("register.passwordMismatch"),
        description: t("register.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Call backend: register
      const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
        }),
      });

      const registerJson = await registerRes.json();
      if (!registerRes.ok || !registerJson.success) {
        throw new Error(registerJson?.message || "Đăng ký thất bại");
      }

      // Send OTP
      const sendOtpRes = await fetch(`${baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const sendOtpJson = await sendOtpRes.json();
      if (!sendOtpRes.ok || !sendOtpJson.success) {
        throw new Error(sendOtpJson?.message || "Gửi OTP thất bại");
      }

      toast({
        title: t("register.welcome"),
        description: `Mã OTP đã gửi đến ${formData.email}`,
      });
      setStep("otp");
    } catch (err: any) {
      toast({
        title: t("register.error"),
        description: err?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerifySuccess = async () => {
    try {
      // Auto-login user after OTP verification
      const baseUrl = "http://localhost:5000";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        throw new Error("Auto-login failed");
      }

      const data = await res.json();

      // Save token and user info to localStorage
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", String(data.role || "customer"));
        localStorage.setItem(
          "fullName",
          String(data.fullName || formData.fullName)
        );

        // Complete the registration process
        const userData: UserType = {
          id: `user_${Date.now()}`,
          name: data.fullName || formData.fullName,
          email: formData.email,
          role: "customer",
        };

        onRegister(userData);

        toast({
          title: t("register.welcome"),
          description: t("register.accountCreated"),
        });

        // Navigate to personal info update with fromRegistration flag
        navigate("/personal-info-update", {
          state: {
            fromRegistration: true,
            user: userData,
            dateOfBirth: formData.dateOfBirth, // Pass the date of birth from registration
          },
        });
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      toast({
        title: "Registration successful",
        description: "Please login to continue",
      });
      navigate("/login");
    }
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  const validateAllFields = () => {
    return {
      fullName: validateField("fullName", formData.fullName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      dateOfBirth: validateField("dateOfBirth", formData.dateOfBirth),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };
  };

  // phone regex: chấp nhận 0xxxxxxxxx , +84xxxxxxxxx hoặc 84xxxxxxxxx (vn numbers)
  const phoneRegex = /^(?:0|\+84|84)[1-9]\d{8}$/;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "fullName": {
        if (!value.trim()) return t("register.validation.fullNameRequired");
        if (value.trim().length < 2)
          return t("register.validation.fullNameTooShort");
        // Only letters (all languages), spaces and common name punctuation
        const nameRegex = /^[\p{L}\s'.-]+$/u;
        if (!nameRegex.test(value.trim()))
          return t("register.validation.fullNameLettersOnly");
        return "";
      }
      case "email": {
        if (!value.trim()) return t("register.validation.emailRequired");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(value))
          return t("register.validation.emailInvalid");
        return "";
      }
      case "phone": {
        // chuẩn hóa: loại bỏ khoảng trắng và dấu gạch
        const normalized = value.replace(/[\s\-.()]/g, "");
        if (!normalized) return "Số điện thoại không được để trống.";
        if (!phoneRegex.test(normalized))
          return "Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678";
        return "";
      }
      case "dateOfBirth": {
        if (!value) return t("register.validation.dobRequired");
        const dob = new Date(value);
        const now = new Date();
        const age =
          now.getFullYear() -
          dob.getFullYear() -
          (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())
            ? 1
            : 0);
        if (age < 18) return t("register.validation.dobTooYoung");
        return "";
      }
      case "password": {
        if (!value) return t("register.validation.passwordRequired");
        if (value.length < 8) return t("register.validation.passwordTooShort");
        const complexity = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        if (!complexity.test(value))
          return t("register.validation.passwordWeak");
        return "";
      }
      case "confirmPassword": {
        if (!value) return t("register.validation.confirmPasswordRequired");
        if (value !== formData.password)
          return t("register.validation.passwordsDoNotMatch");
        return "";
      }
      default:
        return "";
    }
  };

  const handleBlur = (field: keyof typeof errors) => {
    const message = validateField(field, formData[field] as string);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  // Compute native constraint for DOB: must be at least 18 years old
  const maxDOB = (() => {
    const now = new Date();
    const year = now.getFullYear() - 18;
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  return (
    <>
      {step === "form" && (
        <Card className="shadow-premium w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t("register.createAccount")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("register.joinElectric")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("register.fullName")} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập Họ và Tên"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    onBlur={() => handleBlur("fullName")}
                    className="pl-10 text-black focus-visible:ring-offset-0"
                    minLength={2}
                    aria-invalid={!!errors.fullName}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("register.emailAddress")} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className="pl-10 text-black focus-visible:ring-offset-0"
                    aria-invalid={!!errors.email}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("register.phoneNumber")} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    pattern="^(?:0|\+84|84)[1-9]\d{8}$"
                    placeholder="Nhập Số Điện Thoại"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className="pl-10 text-black"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  {t("register.dateOfBirth")} *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    onBlur={() => handleBlur("dateOfBirth")}
                    className="pl-10 text-black focus-visible:ring-offset-0"
                    max={maxDOB}
                    aria-invalid={!!errors.dateOfBirth}
                    required
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("register.password")} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu mạnh"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    className="pl-10 pr-10 text-black focus-visible:ring-offset-0"
                    minLength={8}
                    aria-invalid={!!errors.password}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("register.confirmPassword")} *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    className="pl-10 pr-10 text-black focus-visible:ring-offset-0"
                    minLength={8}
                    aria-invalid={!!errors.confirmPassword}
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  {t("register.agreeToTermsText")}{" "}
                  <Link
                    to="/terms"
                    className="text-primary hover:text-primary-dark"
                  >
                    {t("register.termsOfService")}
                  </Link>{" "}
                  {t("register.and")}{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:text-primary-dark"
                  >
                    {t("register.privacyPolicy")}
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading || !agreeToTerms}
              >
                {isLoading
                  ? t("common.creatingAccount")
                  : t("common.createAccount")}
              </Button>
            </form>

            <Separator />

            {/* Sign in */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {t("register.alreadyHaveAccount")}{" "}
              </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {t("register.signInHere")}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "otp" && (
        <OTPVerification
          email={formData.email}
          onVerifySuccess={handleOTPVerifySuccess}
          onBack={handleBackToForm}
          title="Verify Your Registration"
          description="We've sent a 6-digit verification code to complete your registration."
        />
      )}
    </>
  );
};
