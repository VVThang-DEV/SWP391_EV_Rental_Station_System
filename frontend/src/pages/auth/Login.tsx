import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  stationId?: string;
}

interface LoginProps {
  onLogin: (userData: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "staff" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL as string | undefined;
      if (!baseUrl) {
        throw new Error("VITE_API_URL is not set in .env");
      }

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 401) {
        toast({
          title: t("common.error"),
          description: t("login.invalidCredentials"),
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data: { success: boolean; fullName?: string; role?: string; token?: string } = await response.json();
      if (!data.success) {
        toast({
          title: t("common.error"),
          description: t("login.invalidCredentials"),
          variant: "destructive",
        });
        return;
      }

      const resolvedRole = (role || data.role || "customer") as "customer" | "staff" | "admin";
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      const userData: User = {
        id: `user_${Date.now()}`,
        name: data.fullName || "User",
        email,
        role: resolvedRole,
        ...(resolvedRole === "staff" && { stationId: "ST001" }),
      };

      onLogin(userData);
      toast({
        title: t("common.welcomeBack"),
        description: t("common.signInSuccess"),
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: t("common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="p-3 bg-white rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">EVRentals</span>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="shadow-premium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t("common.welcomeBack")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("common.signInToAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">{t("common.loginAs")}</Label>
                <Select
                  value={role}
                  onValueChange={(value: "customer" | "staff" | "admin") =>
                    setRole(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      {t("common.customer")}
                    </SelectItem>
                    <SelectItem value="staff">
                      {t("common.stationStaff")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {t("common.administrator")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.emailAddress")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("common.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("common.enterYourPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 text-black"
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

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  {t("common.forgotYourPassword")}
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading}
              >
                {isLoading ? t("common.signingIn") : t("common.signIn")}
              </Button>
            </form>

            <Separator />

            {/* Social Login (Mock) */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("common.continueWithGoogle")}
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {t("common.continueWithFacebook")}
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {t("common.dontHaveAnAccount")}{" "}
              </span>
              <Link
                to="/register"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {t("common.signUpNow")}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">{t("common.demoNote")}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
