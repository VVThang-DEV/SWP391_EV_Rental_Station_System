import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import "./Style.css";


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "staff" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        toast({
          title: t("common.welcomeBack"),
          description: t("common.signInSuccess"),
        });
        navigate("/dashboard");
      } else {
        toast({
          title: t("common.error"),
          description: t("login.fillAllFields"),
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form space-y-4">
     

      {/* Email */}
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
  />
  <label htmlFor="email">{t("common.emailAddress")}</label>
</div>

{/* Password */}
<div className="relative mb-6">
  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
  <Input
    id="password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="pl-10 pr-10 text-black"
    placeholder=" "
    required
  />
  <label htmlFor="password" style={{ zIndex: 10 }}>{t("common.password")}</label>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
    onClick={() => setShowPassword(!showPassword)}
    tabIndex={-1}
  >
    {showPassword ? (
      <EyeOff className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Eye className="h-4 w-4 text-muted-foreground" />
    )}
  </Button>
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

      {/* Submit */}
      <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
        {isLoading ? t("common.signingIn") : t("common.signIn")}
      </Button>
    </form>
  );
};

export default LoginForm;
