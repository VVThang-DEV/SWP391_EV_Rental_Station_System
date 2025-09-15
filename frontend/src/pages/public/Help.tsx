import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  Book,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

const Help = () => {
  const { t } = useTranslation();
  const faqs = [
    {
      question: t("help.faq1Question"),
      answer: t("help.faq1Answer"),
    },
    {
      question: t("help.faq2Question"),
      answer: t("help.faq2Answer"),
    },
    {
      question: t("help.faq3Question"),
      answer: t("help.faq3Answer"),
    },
    {
      question: t("help.faq4Question"),
      answer: t("help.faq4Answer"),
    },
    {
      question: t("help.faq5Question"),
      answer: t("help.faq5Answer"),
    },
    {
      question: t("help.faq6Question"),
      answer: t("help.faq6Answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("help.title")}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t("help.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
              <Input
                placeholder={t("help.searchPlaceholder")}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                {t("help.searchHelp")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Help Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("help.phone")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Speak with our customer service team
              </p>
              <p className="font-semibold text-primary">+84 28 1234 5678</p>
            </CardContent>
          </Card>

          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("help.email")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a message and we'll respond within 24 hours
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">Send Email</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("help.liveChat")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with us in real-time for instant help
              </p>
              <Button variant="outline">Start Chat</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-6 w-6 mr-2" />
              {t("help.faqTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Book className="h-6 w-6 text-primary mr-2" />
                <h3 className="font-semibold">Getting Started</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    How to create an account
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    First-time booking guide
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Document requirements
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Payment methods
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Book className="h-6 w-6 text-primary mr-2" />
                <h3 className="font-semibold">During Your Rental</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Vehicle pickup process
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Charging instructions
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Emergency procedures
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Extending your rental
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Book className="h-6 w-6 text-primary mr-2" />
                <h3 className="font-semibold">Account & Billing</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Managing your profile
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Understanding charges
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Refunds and cancellations
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-primary hover:underline">
                    Updating payment info
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
