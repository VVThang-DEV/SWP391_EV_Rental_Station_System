import { useTranslation } from "@/contexts/TranslationContext";

// Exchange rate: 1 USD = 23,000 VND (approximate)
const USD_TO_VND_RATE = 26000;

export const formatCurrency = (
  amount: number,
  language: "en" | "vi" = "en"
): string => {
  if (language === "vi") {
    // Convert to VND and format
    const vndAmount = Math.round(amount * USD_TO_VND_RATE);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vndAmount);
  } else {
    // Keep in USD
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

export const convertToVND = (usdAmount: number): number => {
  return Math.round(usdAmount * USD_TO_VND_RATE);
};

export const useCurrency = () => {
  const { language } = useTranslation();

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount, language);
  };

  const convertPrice = (usdAmount: number): number => {
    return language === "vi" ? convertToVND(usdAmount) : usdAmount;
  };

  return {
    formatPrice,
    convertPrice,
    currency: language === "vi" ? "VND" : "USD",
    currencySymbol: language === "vi" ? "₫" : "$",
  };
};
