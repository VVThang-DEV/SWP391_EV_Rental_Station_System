import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PaymentCheckout from "@/components/PaymentCheckout";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  History,
  CheckCircle,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  Smartphone,
  Building2,
  Loader2,
} from "lucide-react";

interface WalletProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "staff" | "admin";
  } | null;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  paymentMethod?: string;
  transactionType?: string; // Original transaction type from API
}

const Wallet = ({ user }: WalletProps) => {
  const [balance, setBalance] = useState(0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayIntentId, setGatewayIntentId] = useState("");
  const [gatewayAmount, setGatewayAmount] = useState(0);
  const [gatewayMethod, setGatewayMethod] = useState("bank_transfer");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [lastTransactionId, setLastTransactionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch balance
        const balanceResponse = await fetch(
          "http://localhost:5000/api/wallet/balance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData.balance);
        }

        // Fetch transactions
        const transactionsResponse = await fetch(
          "http://localhost:5000/api/wallet/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          // Map API data to Transaction type
          const mappedTransactions = transactionsData.map((t: any) => {
            let type: "deposit" | "withdrawal" | "payment" | "refund";
            let amount: number;
            let description: string;

            // Ensure transactionType is always a string
            const transactionType = t.transactionType || t.transaction_type || "payment";
            
            console.log("Processing transaction:", {
              paymentId: t.paymentId,
              transactionType: transactionType,
              amount: t.amount,
              reservationId: t.reservationId
            });

            switch (transactionType.toLowerCase()) {
              case "deposit":
                type = "deposit";
                amount = t.amount;
                description = `Wallet Top-up via ${t.methodType}`;
                break;
              case "late_fee":
                type = "payment";
                amount = -t.amount;
                description = `Phí trễ giờ cho Booking #${
                  t.reservationId || t.rentalId || "N/A"
                }`;
                break;
              case "payment":
                type = "payment";
                amount = -t.amount;
                description = `Payment for Booking #${
                  t.reservationId || t.rentalId || "N/A"
                }`;
                break;
              case "refund":
                type = "refund";
                amount = t.amount;
                description = `Refund for Booking #${
                  t.reservationId || t.rentalId || "N/A"
                }`;
                break;
              case "withdrawal":
                type = "withdrawal";
                amount = -t.amount;
                description = `Withdrawal to ${t.methodType || "wallet"}`;
                break;
              default:
                type = "payment";
                amount = -t.amount;
                description = `Transaction${t.reservationId ? ` for Booking #${t.reservationId}` : ""}`;
            }

            return {
              id: t.paymentId.toString(),
              type,
              amount,
              description,
              date: t.createdAt,
              status: t.status,
              paymentMethod: t.methodType,
              transactionType: transactionType, // Store original transaction type (always lowercase)
            };
          });
          setTransactions(mappedTransactions);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < 10000) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is 10,000 VND",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Step 1: Create payment intent with gateway
      console.log("Creating payment intent...", { amount, paymentMethod });
      const intentResponse = await fetch(
        "http://localhost:5000/api/wallet/payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Amount: amount,
            Currency: "VND",
            Method: paymentMethod,
            Metadata: {},
          }),
        }
      );

      console.log("Intent response status:", intentResponse.status);

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        console.error("Error creating intent:", errorData);
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const intentData = await intentResponse.json();
      console.log("Intent data received (full):", intentData);
      console.log("intentData.data:", intentData.data);

      // Check if response has the expected structure
      if (!intentData.data) {
        console.error("No data in response:", intentData);
        throw new Error("Invalid response from server");
      }

      // Backend might return different property names (camelCase vs PascalCase)
      const IntentId =
        intentData.data.IntentId ||
        intentData.data.intentId ||
        intentData.data.intent_id;
      const CheckoutUrl =
        intentData.data.CheckoutUrl ||
        intentData.data.checkoutUrl ||
        intentData.data.checkout_url;
      const PaymentData =
        intentData.data.PaymentData ||
        intentData.data.paymentData ||
        intentData.data.payment_data;

      console.log("Extracted IntentId:", IntentId);
      console.log("CheckoutUrl:", CheckoutUrl);
      console.log("PaymentData:", PaymentData);

      // Store intent data for confirmation
      localStorage.setItem(
        "pendingPaymentIntent",
        JSON.stringify({
          intentId: IntentId,
          amount,
          method: paymentMethod,
        })
      );

      // Step 2: Navigate to MoMo payment page
      if (paymentMethod === "momo") {
        setIsDepositOpen(false);
        window.location.href = `http://localhost:8080/payment/momo?intent=${IntentId}&amount=${amount}&returnUrl=/wallet`;
        return;
      }

      // For other methods, use existing flow
      setIsDepositOpen(false);
      setIsGatewayOpen(true);
      setGatewayIntentId(IntentId);
      setGatewayAmount(amount);
      setGatewayMethod(paymentMethod);

      toast({
        title: "Payment Gateway",
        description: "Redirecting to payment gateway...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGatewayComplete = async () => {
    // After payment is confirmed, update balance and show success
    setIsGatewayOpen(false);

    // Refresh balance
    const token = localStorage.getItem("token");
    const balanceResponse = await fetch(
      "http://localhost:5000/api/wallet/balance",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance);
    }

    // Show success dialog
    setLastDepositAmount(gatewayAmount);
    setLastTransactionId(
      localStorage.getItem("pendingPaymentIntent")
        ? JSON.parse(localStorage.getItem("pendingPaymentIntent")!).intentId
        : ""
    );
    setIsSuccessOpen(true);
    setIsDepositOpen(false);

    // Clear pending intent
    localStorage.removeItem("pendingPaymentIntent");
    setLoading(false);
  };

  const handleGatewayCancel = () => {
    setIsGatewayOpen(false);
    setDepositAmount("");
    localStorage.removeItem("pendingPaymentIntent");
    setLoading(false);
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  // Calculate stats
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalRefunds = transactions
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate month-over-month growth percentage
  const calculateMonthlyGrowth = () => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month deposits
    const currentMonthDeposits = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return t.type === "deposit" && tDate >= currentMonthStart;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get last month deposits
    const lastMonthDeposits = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "deposit" &&
          tDate >= lastMonthStart &&
          tDate < currentMonthStart
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (lastMonthDeposits === 0) {
      return currentMonthDeposits > 0
        ? { value: 100, isPositive: true }
        : { value: 0, isPositive: true };
    }

    const growthPercent =
      ((currentMonthDeposits - lastMonthDeposits) / lastMonthDeposits) * 100;

    return {
      value: Math.round(growthPercent * 10) / 10,
      isPositive: growthPercent >= 0,
    };
  };

  const monthlyGrowth = calculateMonthlyGrowth();

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesDate = false;
    const transactionDate = new Date(transaction.date);

    if (dateFilter === "all") {
      matchesDate = true;
    } else if (dateFilter === "today") {
      matchesDate =
        transactionDate.toDateString() === new Date().toDateString();
    } else if (dateFilter === "week") {
      matchesDate =
        transactionDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "month") {
      matchesDate =
        transactionDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "specific-month") {
      matchesDate =
        transactionDate.getMonth() + 1 === selectedMonth &&
        transactionDate.getFullYear() === selectedYear;
    }

    return matchesSearch && matchesDate;
  });

  // Calculate period expenses (total payments for filtered period)
  const periodExpenses = Math.abs(
    filteredTransactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Get period label for display
  const getPeriodLabel = () => {
    if (dateFilter === "all") return "All Time";
    if (dateFilter === "today") return "Today";
    if (dateFilter === "week") return "This Week";
    if (dateFilter === "month") return "This Month";
    if (dateFilter === "specific-month") {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    }
    return "Selected Period";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your wallet
          </p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                My Wallet
              </h1>
              <p className="text-muted-foreground">
                Manage your balance and transactions
              </p>
            </div>
            <Button size="lg" onClick={() => setIsDepositOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Money
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Balance & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-primary via-primary to-primary/80 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center justify-between text-lg">
                  <span>Current Balance</span>
                  <WalletIcon className="h-6 w-6" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-5xl font-bold mb-2">
                  {formatCurrency(balance)}
                </div>
                <p className="text-sm text-white/80 mb-4">
                  Available for bookings
                </p>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  {monthlyGrowth.isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>
                    {monthlyGrowth.isPositive ? "+" : ""}
                    {monthlyGrowth.value}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total Deposits
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(totalDeposits)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ArrowDownRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total Spent
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total Refunds
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(totalRefunds)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => setIsDepositOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit Money
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Download className="h-4 w-4 mr-2" />
                  Withdraw Money
                  <Badge variant="secondary" className="ml-auto">
                    Soon
                  </Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Transactions */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View and manage all your wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="specific-month">
                          Specific Month
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month/Year selectors when specific month is selected */}
                  {dateFilter === "specific-month" && (
                    <div className="flex gap-3">
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={(value) =>
                          setSelectedMonth(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) =>
                          setSelectedYear(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[100px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Period Expenses Summary */}
                  {dateFilter !== "all" && (
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Expenses for {getPeriodLabel()}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                Total payments in selected period
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(periodExpenses)}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              {
                                filteredTransactions.filter(
                                  (t) => t.type === "payment"
                                ).length
                              }{" "}
                              transactions
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Transaction Tabs */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="deposit">Deposits</TabsTrigger>
                    <TabsTrigger value="payment">Payments</TabsTrigger>
                    <TabsTrigger value="refund">Refunds</TabsTrigger>
                  </TabsList>

                  {/* All Transactions */}
                  <TabsContent value="all" className="space-y-3 mt-0">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          No transactions found
                        </p>
                      </div>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <Card
                          key={transaction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-3 rounded-full ${
                                    transaction.type === "deposit"
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                      : transaction.type === "payment"
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                  }`}
                                >
                                  {transaction.type === "deposit" ? (
                                    <ArrowUpRight className="h-5 w-5" />
                                  ) : transaction.type === "payment" ? (
                                    <ArrowDownRight className="h-5 w-5" />
                                  ) : (
                                    <RefreshCw className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    {(transaction.transactionType?.toLowerCase() === "late_fee" || transaction.transactionType === "late_fee") && (
                                      <Badge variant="destructive" className="text-xs">
                                        Phí trễ giờ
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        transaction.date
                                      ).toLocaleString("vi-VN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })}
                                    </p>
                                    {transaction.paymentMethod && (
                                      <>
                                        <span className="text-xs text-muted-foreground">
                                          •
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                          {transaction.paymentMethod}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-bold text-lg ${
                                    transaction.amount > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {transaction.amount > 0 ? "+" : "-"}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </p>
                                <Badge
                                  variant={
                                    transaction.status === "completed"
                                      ? "default"
                                      : transaction.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="mt-1"
                                >
                                  {transaction.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => handleViewDetail(transaction)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Deposits Tab */}
                  <TabsContent value="deposit" className="space-y-3 mt-0">
                    {filteredTransactions
                      .filter((t) => t.type === "deposit")
                      .map((transaction) => (
                        <Card
                          key={transaction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                  <ArrowUpRight className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    {(transaction.transactionType?.toLowerCase() === "late_fee" || transaction.transactionType === "late_fee") && (
                                      <Badge variant="destructive" className="text-xs">
                                        Phí trễ giờ
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(transaction.date).toLocaleString(
                                      "vi-VN",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                  +{formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="default" className="mt-1">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>

                  {/* Payments Tab */}
                  <TabsContent value="payment" className="space-y-3 mt-0">
                    {filteredTransactions
                      .filter((t) => t.type === "payment")
                      .map((transaction) => (
                        <Card
                          key={transaction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                  <ArrowDownRight className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    {(transaction.transactionType?.toLowerCase() === "late_fee" || transaction.transactionType === "late_fee") && (
                                      <Badge variant="destructive" className="text-xs">
                                        Phí trễ giờ
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(transaction.date).toLocaleString(
                                      "vi-VN",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-red-600 dark:text-red-400">
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </p>
                                <Badge variant="default" className="mt-1">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>

                  {/* Refunds Tab */}
                  <TabsContent value="refund" className="space-y-3 mt-0">
                    {filteredTransactions
                      .filter((t) => t.type === "refund")
                      .map((transaction) => (
                        <Card
                          key={transaction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                  <RefreshCw className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    {(transaction.transactionType?.toLowerCase() === "late_fee" || transaction.transactionType === "late_fee") && (
                                      <Badge variant="destructive" className="text-xs">
                                        Phí trễ giờ
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(transaction.date).toLocaleString(
                                      "vi-VN",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                  +{formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="default" className="mt-1">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Money to Wallet
            </DialogTitle>
            <DialogDescription>
              Choose your payment method and enter the amount to deposit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="momo">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>MoMo Wallet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vnpay">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>VNPay</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">Amount (VND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="10000"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 10,000 VND
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className={
                      depositAmount === amount.toString()
                        ? "border-primary bg-primary/10"
                        : ""
                    }
                  >
                    {formatCurrency(amount).replace("₫", "").trim()}đ
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit}>
              <DollarSign className="h-4 w-4 mr-2" />
              Deposit{" "}
              {depositAmount ? formatCurrency(parseFloat(depositAmount)) : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-4">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>

            {/* Success Message */}
            <div>
              <DialogTitle className="text-2xl font-bold text-center mb-2">
                Deposit Successful!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Your wallet has been topped up successfully
              </DialogDescription>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Amount Deposited
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(lastDepositAmount)}
              </p>
            </div>

            {/* Transaction Details */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-medium">
                  {lastTransactionId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Balance:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">
                  {new Date().toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSuccessOpen(false)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                className="flex-1"
                onClick={() => setIsSuccessOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              {/* Transaction Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">{selectedTransaction.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {selectedTransaction.type}
                    </span>
                    {(selectedTransaction.transactionType?.toLowerCase() === "late_fee" || selectedTransaction.transactionType === "late_fee") && (
                      <Badge variant="destructive" className="text-xs">
                        Phí trễ giờ
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {selectedTransaction.description}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span
                    className={`font-semibold ${
                      selectedTransaction.amount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.amount > 0 ? "+" : "-"}
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">
                    {selectedTransaction.paymentMethod || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedTransaction.status === "completed"
                        ? "default"
                        : selectedTransaction.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(selectedTransaction.date).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // TODO: Add download receipt functionality
                    toast({
                      title: "Receipt Download",
                      description: "Receipt download feature coming soon!",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog open={isGatewayOpen} onOpenChange={setIsGatewayOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {gatewayIntentId ? (
            <>
              <DialogHeader>
                <DialogTitle>Payment Gateway</DialogTitle>
                <DialogDescription>
                  Complete your payment to add funds to your wallet
                </DialogDescription>
              </DialogHeader>
              <PaymentCheckout
                intentId={gatewayIntentId}
                method={gatewayMethod}
                amount={gatewayAmount}
                onComplete={handleGatewayComplete}
                onCancel={handleGatewayCancel}
              />
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading payment gateway...
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;
