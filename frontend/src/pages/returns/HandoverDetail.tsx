import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiService, HandoverDetail, HandoverPaymentRecord } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Wallet as WalletIcon } from "lucide-react";

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "0 VND";
  return `${Number(value).toLocaleString("vi-VN")} VND`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const statusBadge = (status?: string | null) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "late") {
    return <Badge variant="destructive">Late return</Badge>;
  }
  if (normalized === "early") {
    return <Badge className="bg-emerald-100 text-emerald-700">Early return</Badge>;
  }
  if (normalized === "on_time") {
    return <Badge className="bg-blue-100 text-blue-700">On time</Badge>;
  }
  return status ? <Badge>{status}</Badge> : null;
};

const getRemaining = (handover?: HandoverDetail | null) => {
  if (!handover) return 0;
  const total = handover.totalDue ?? 0;
  const remaining = handover.remainingDue ?? total;
  return Math.max(0, Number(remaining));
};

const HandoverDetailPage = () => {
  const { handoverId } = useParams<{ handoverId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [handover, setHandover] = useState<HandoverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericId = useMemo(() => {
    if (!handoverId) return null;
    const parsed = Number(handoverId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [handoverId]);

  const loadDetail = async () => {
    if (numericId == null) {
      setError("Invalid handover identifier.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getHandoverDetail(numericId);
      setHandover(res.handover);
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Unable to load handover details. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]);

  // Mark handover as read when customer views the page (only after data is loaded)
  useEffect(() => {
    if (numericId && handover && !loading) {
      // Delay marking as read to ensure customer actually viewed the page
      const timer = setTimeout(() => {
        try {
          const readHandovers = JSON.parse(localStorage.getItem('readHandovers') || '[]');
          if (!readHandovers.includes(numericId)) {
            readHandovers.push(numericId);
            localStorage.setItem('readHandovers', JSON.stringify(readHandovers));
            // Dispatch event to refresh notifications in Navbar
            window.dispatchEvent(new CustomEvent('handoverRead', { 
              detail: { handoverId: numericId } 
            }));
          }
        } catch (error) {
          console.error('Error marking handover as read:', error);
        }
      }, 500); // Small delay to ensure page is rendered
      
      return () => clearTimeout(timer);
    }
  }, [numericId, handover, loading]);

  const remainingDue = useMemo(() => getRemaining(handover), [handover]);
  const totalDue = useMemo(() => handover?.totalDue ?? remainingDue, [handover, remainingDue]);

  const handleWalletPayment = async () => {
    if (!handover || remainingDue <= 0 || paying) return;
    try {
      setPaying(true);
      await apiService.withdrawFromWallet({
        amount: remainingDue,
        reservationId: handover.reservationId ?? undefined,
        reason: `Payment for return inspection #${handover.handoverId}`,
      });
      toast({
        title: "Payment successful",
        description: `Đã trừ ${formatCurrency(
          remainingDue
        )} từ ví của bạn cho biên bản trả xe.`,
      });
      await loadDetail();
      // Dispatch event to refresh notifications in Navbar
      try {
        window.dispatchEvent(new CustomEvent('handoverPaymentSuccess', { 
          detail: { handoverId: handover.handoverId } 
        }));
      } catch {}
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description:
          err?.data?.message ||
          err?.message ||
          "Không thể trừ tiền từ ví. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!handover) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    const damages =
      handover.damages && handover.damages.length > 0
        ? `<ul>${handover.damages
            .map((d) => `<li>${d}</li>`)
            .join("")}</ul>`
        : "<p>Không ghi nhận hư hỏng.</p>";

    w.document.write(`
      <html>
        <head>
          <title>Cash Receipt - Handover #${handover.handoverId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1, h2 { margin-bottom: 8px; }
            .section { margin-bottom: 16px; }
            .muted { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>EVRentals - Cash Payment Receipt</h1>
          <p class="muted">Ngày in: ${new Date().toLocaleString()}</p>

          <div class="section">
            <h2>Thông tin biên bản</h2>
            <p>Mã biên bản: #${handover.handoverId}</p>
            <p>Xe: ${handover.vehicleLabel || "N/A"}</p>
            <p>Thời gian: ${formatDateTime(handover.createdAt)}</p>
            <p>Trạng thái trả xe: ${handover.returnTimeStatus || "N/A"}</p>
          </div>

          <div class="section">
            <h2>Chi tiết phí</h2>
            <table>
              <tr><th>Khoản phí</th><th>Số tiền</th></tr>
              <tr><td>Phí trễ giờ</td><td>${formatCurrency(handover.lateFee)}</td></tr>
              <tr><td>Phí hư hỏng</td><td>${formatCurrency(handover.damageFee)}</td></tr>
              <tr><td><strong>Tổng phí</strong></td><td><strong>${formatCurrency(totalDue)}</strong></td></tr>
              <tr><td>Đã thanh toán</td><td>${formatCurrency(handover.walletPaidAmount ?? 0)}</td></tr>
              <tr><td><strong>Còn phải thanh toán</strong></td><td><strong>${formatCurrency(remainingDue)}</strong></td></tr>
            </table>
          </div>

          <div class="section">
            <h2>Hư hỏng ghi nhận</h2>
            ${damages}
          </div>

          <p class="muted">Vui lòng nộp tiền mặt tại quầy và cung cấp biên lai này cho nhân viên EVRentals.</p>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 flex items-center justify-center text-muted-foreground">
            Đang tải thông tin biên bản...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !handover) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6 text-center">
        <p className="text-lg font-semibold text-destructive">
          {error || "Không tìm thấy biên bản trả xe."}
        </p>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  const damageCount = handover.damages?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Badge variant="outline">Biên bản #{handover.handoverId}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin trả xe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary">{handover.type === "return" ? "Return" : handover.type}</Badge>
            {statusBadge(handover.returnTimeStatus)}
            {damageCount > 0 && (
              <Badge className="bg-red-100 text-red-700">
                {damageCount} hư hỏng
              </Badge>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Xe</div>
              <div className="font-medium">{handover.vehicleLabel || "Không xác định"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Thời gian ghi nhận</div>
              <div className="font-medium">{formatDateTime(handover.createdAt)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Mã đặt xe</div>
              <div className="font-medium">
                {handover.reservationId ? `#${handover.reservationId}` : "Không có"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Mã thuê xe</div>
              <div className="font-medium">
                {handover.rentalId ? `#${handover.rentalId}` : "Không có"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Mức pin khi trả</div>
              <div className="font-medium">{handover.batteryLevel ?? "--"}%</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Số km hiện tại</div>
              <div className="font-medium">
                {handover.mileage?.toLocaleString("vi-VN") ?? "--"} km
              </div>
            </div>
          </div>

          {handover.conditionNotes && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Ghi chú kiểm tra</div>
              <div>{handover.conditionNotes}</div>
            </div>
          )}

          {handover.damages && handover.damages.length > 0 && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-2">Hư hỏng ghi nhận</div>
              <div className="flex flex-wrap gap-2">
                {handover.damages.map((damage, idx) => (
                  <Badge key={`${damage}-${idx}`} variant="destructive">
                    {damage}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {handover.imageUrls && handover.imageUrls.length > 0 && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-2">Ảnh sự cố xe</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {handover.imageUrls.map((imageUrl, idx) => {
                  const API_BASE =
                    (import.meta as any).env?.VITE_API_URL ||
                    (import.meta as any).env?.VITE_API_BASE_URL ||
                    "http://localhost:5000";
                  const fullUrl =
                    imageUrl?.startsWith("http")
                      ? imageUrl
                      : `${API_BASE}${imageUrl}`;
                  return (
                  <div key={idx} className="relative group">
                    <img
                      src={fullUrl}
                      alt={`Ảnh sự cố ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-md border border-border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Open image in new tab for full view
                        window.open(fullUrl, "_blank");
                      }}
                    />
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phí trễ giờ</span>
                <span className="font-medium">{formatCurrency(handover.lateFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phí hư hỏng</span>
                <span className="font-medium">{formatCurrency(handover.damageFee)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng phí</span>
                <span className="font-semibold">{formatCurrency(totalDue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Đã thanh toán</span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(handover.walletPaidAmount ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Còn phải thanh toán</span>
                <span className={`text-lg font-bold ${remainingDue > 0 ? "text-destructive" : "text-emerald-600"}`}>
                  {formatCurrency(remainingDue)}
                </span>
              </div>
              {remainingDue > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ Bạn cần thanh toán {formatCurrency(remainingDue)} để hoàn tất biên bản trả xe.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {remainingDue > 0 && (
                <div>
                  <div className="font-semibold mb-1">Thanh toán ví EV Wallet</div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Số tiền sẽ được trừ trực tiếp khỏi ví của bạn và ghi nhận vào lịch sử giao dịch.
                  </p>
                  <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Số tiền cần thanh toán:
                    </div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(remainingDue)}
                    </div>
                  </div>
                  <Button
                    className="mt-2 w-full"
                    onClick={handleWalletPayment}
                    disabled={remainingDue <= 0 || paying}
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    {paying ? "Đang xử lý..." : "Trừ vào ví EV Wallet"}
                  </Button>
                </div>
              )}
              {remainingDue <= 0 && totalDue > 0 && (
                <div>
                  <div className="font-semibold mb-1">Thanh toán ví EV Wallet</div>
                  <p className="text-muted-foreground text-sm">
                    Bạn đã thanh toán đầy đủ cho biên bản này.
                  </p>
                </div>
              )}
              <Separator />
              <div>
                <div className="font-semibold mb-1">Thanh toán tiền mặt</div>
                <p className="text-muted-foreground text-sm">
                  Vui lòng in biên lai và nộp tiền tại quầy. Nhân viên sẽ xác nhận và cập nhật hệ thống.
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In biên lai tiền mặt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch liên quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {handover.payments && handover.payments.length > 0 ? (
            <div className="space-y-2">
              {handover.payments.map((payment: HandoverPaymentRecord) => (
                <div
                  key={payment.paymentId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {payment.transactionType || "payment"} • {payment.methodType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(payment.createdAt)}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {payment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Chưa có giao dịch phát sinh cho biên bản này.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Cần hỗ trợ? Liên hệ <Link to="/contact" className="underline">bộ phận chăm sóc khách hàng</Link>.
      </div>
    </div>
  );
};

export default HandoverDetailPage;


