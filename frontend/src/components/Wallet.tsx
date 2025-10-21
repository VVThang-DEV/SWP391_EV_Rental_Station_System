import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WalletProps {
  userId: string;
  userName: string;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export const Wallet = ({ userId, userName }: WalletProps) => {
  const [balance, setBalance] = useState(150000); // Mock balance in VND
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [lastTransactionId, setLastTransactionId] = useState("");
  const { toast } = useToast();

  // Mock transaction history with state
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TXN001",
      type: "deposit",
      amount: 500000,
      description: "Wallet Top-up via Credit Card",
      date: "2024-01-15T10:30:00",
      status: "completed",
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
      amount: 50000,
      description: "Refund for Booking #B120",
      date: "2024-01-13T09:15:00",
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
        ? "MoMo Wallet"
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

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <WalletIcon className="h-4 w-4" />
            <span className="hidden md:inline">Wallet</span>
            <Badge variant="secondary" className="ml-2">
              {formatCurrency(balance)}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <WalletIcon className="h-6 w-6" />
              <span>My Wallet</span>
            </DialogTitle>
            <DialogDescription>
              Manage your wallet balance and view transaction history
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Current Balance</span>
                  <WalletIcon className="h-6 w-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(balance)}
                </div>
                <p className="text-sm text-white/80">Available for bookings</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Deposit Money</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit to Wallet</DialogTitle>
                    <DialogDescription>
                      Add funds to your wallet for quick bookings
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Payment Method */}
                    <div>
                      <Label>Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">
                            Credit/Debit Card
                          </SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="momo">MoMo Wallet</SelectItem>
                          <SelectItem value="zalopay">ZaloPay</SelectItem>
                          <SelectItem value="vnpay">VNPay</SelectItem>
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
                                ? "border-primary"
                                : ""
                            }
                          >
                            {formatCurrency(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Info */}
                    {paymentMethod === "card" && (
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <p className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Visa, Mastercard, JCB accepted</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDepositOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDeposit}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Deposit{" "}
                      {depositAmount
                        ? formatCurrency(parseFloat(depositAmount))
                        : ""}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                disabled
              >
                <ArrowDownRight className="h-6 w-6" />
                <span>Withdraw</span>
                <span className="text-xs text-muted-foreground">
                  Coming Soon
                </span>
              </Button>
            </div>

            {/* Transaction History */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="payment">Payments</TabsTrigger>
                <TabsTrigger value="refund">Refunds</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                <div className="flex items-center space-x-2 text-sm font-semibold">
                  <History className="h-4 w-4" />
                  <span>Transaction History</span>
                </div>
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "deposit"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "payment"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {transaction.type === "deposit" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : transaction.type === "payment" ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
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
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="deposit" className="space-y-3 mt-4">
                {transactions
                  .filter((t) => t.type === "deposit")
                  .map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              +{formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant="default" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="payment" className="space-y-3 mt-4">
                {transactions
                  .filter((t) => t.type === "payment")
                  .map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                              <ArrowDownRight className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                            <Badge variant="default" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="refund" className="space-y-3 mt-4">
                {transactions
                  .filter((t) => t.type === "refund")
                  .map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              +{formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant="default" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-4">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
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
              <p className="text-3xl font-bold text-green-600">
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
                onClick={() => {
                  setIsSuccessOpen(false);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Transaction
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setIsSuccessOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
