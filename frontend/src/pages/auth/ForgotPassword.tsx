import "./Login/Style.css";

import { useState } from "react";
import { Link } from "react-router-dom";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock password reset - in real app, this would call an API
    setTimeout(() => {
      if (email) {
        setEmailSent(true);
        toast({
          title: "Reset email sent!",
          description: "Check your inbox for password reset instructions.",
        });
      } else {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">

      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="p-3 bg-white rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">EVRentals</span>
          </Link>
        </div>

        {/* Reset Card */}
        <Card className="shadow-premium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {emailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {emailSent
                ? "We've sent password reset instructions to your email address."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4 text-center">
                <div className="bg-success-light rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                  >
                    Try Different Email
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/login">Back to Sign In</Link>
                  </Button>
                </div>
              </div>
            ) : (
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
                  />
                  <label htmlFor="email">Email address</label>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default ForgotPassword;
