import "./Style.css";

import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import LoginForm from "./LoginForm";
import LoginSocial from "./LoginSocial";
import LoginNote from "./LoginNote";
import { useTranslation } from "@/contexts/TranslationContext";

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="login-page">

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
            <LoginForm />
            <LoginSocial />
          </CardContent>
        </Card>

        <LoginNote />
      </div>
    </div>
  );
};

export default Login;
