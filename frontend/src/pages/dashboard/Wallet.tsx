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
}

const Wallet = ({ user }: WalletProps) => {
  const [balance, setBalance] = useState(1500000); // Mock balance in VND
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [lastTransactionId, setLastTransactionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  // Mock transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TXN001",
      type: "deposit",
      amount: 500000,
      description: "Wallet Top-up via Credit Card",
      date: "2024-01-15T10:30:00",
      status: "completed",
      paymentMethod: "Credit Card",
    },
    {
      id: "TXN002",
      type: "payment",
      amount: -200000,
      description: "Payment for Booking #B123",
      date: "2024-01-14T15:20:00",
      status: "completed",
    },
    {
      id: "TXN003",
      type: "refund",
      amount: 150000,
      description: "Refund for Cancelled Booking #B120",
      date: "2024-01-13T09:15:00",
      status: "completed",
    },
    {
      id: "TXN004",
      type: "deposit",
      amount: 1000000,
      description: "Wallet Top-up via MoMo",
      date: "2024-01-12T14:45:00",
      status: "completed",
      paymentMethod: "MoMo",
    },
    {
      id: "TXN005",
      type: "payment",
      amount: -350000,
      description: "Payment for Booking #B118",
      date: "2024-01-10T11:20:00",
      status: "completed",
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDeposit = () => {
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

    // Generate transaction ID
    const transactionId = `TXN${String(transactions.length + 1).padStart(
      3,
      "0"
    )}`;
    const paymentMethodName =
      paymentMethod === "card"
        ? "Credit Card"
        : paymentMethod === "bank"
        ? "Bank Transfer"
        : paymentMethod === "momo"
        ? "MoMo"
        : paymentMethod === "zalopay"
        ? "ZaloPay"
        : "VNPay";

    // Create new transaction
    const newTransaction: Transaction = {
      id: transactionId,
      type: "deposit",
      amount: amount,
      description: `Wallet Top-up via ${paymentMethodName}`,
      date: new Date().toISOString(),
      status: "completed",
      paymentMethod: paymentMethodName,
    };

    // Update balance and add transaction
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [newTransaction, ...prev]);
    setLastDepositAmount(amount);
    setLastTransactionId(transactionId);

    // Close deposit dialog and open success dialog
    setIsDepositOpen(false);
    setIsSuccessOpen(true);
    setDepositAmount("");

    // Toast notification
    toast({
      title: "✨ Deposit Successful!",
      description: `${formatCurrency(amount)} has been added to your wallet`,
    });
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

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        new Date(transaction.date).toDateString() ===
          new Date().toDateString()) ||
      (dateFilter === "week" &&
        new Date(transaction.date) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" &&
        new Date(transaction.date) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesDate;
  });

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
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% from last month</span>
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
                      </SelectContent>
                    </Select>
                  </div>
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
                                  <p className="font-medium">
                                    {transaction.description}
                                  </p>
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
                                  {transaction.amount > 0 ? "+" : ""}
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
                                  <p className="font-medium">
                                    {transaction.description}
                                  </p>
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
                                  <p className="font-medium">
                                    {transaction.description}
                                  </p>
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
                                  <p className="font-medium">
                                    {transaction.description}
                                  </p>
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
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit/Debit Card</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
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
                  <SelectItem value="zalopay">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>ZaloPay</span>
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
    </div>
  );
};

export default Wallet;
