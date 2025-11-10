import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Car,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  History,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/TranslationContext";
import { Bell } from "lucide-react";
import { incidentStorage } from "@/lib/incident-storage";
import { staffApiService } from "@/services/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface NavbarProps {
  user?: {
    id?: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  onLogout?: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [staffStationId, setStaffStationId] = useState<string | undefined>(undefined);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Ensure we have a stationId for staff in the navbar
  useEffect(() => {
    const loadStationId = async () => {
      if (!user || user.role !== 'staff') return;
      // If user already has stationId, use it
      if ((user as any)?.stationId) {
        setStaffStationId((user as any).stationId?.toString?.());
        return;
      }
      try {
        const profile = await staffApiService.getStaffProfile();
        if (profile?.stationId != null) {
          setStaffStationId(profile.stationId.toString());
        }
      } catch (e) {
        // ignore; the notifications button will fall back to local storage
      }
    };
    loadStationId();
  }, [user?.role, (user as any)?.stationId]);

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">EVRentals</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/vehicles"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/vehicles")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.vehicles")}
            </Link>
            <Link
              to="/stations"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/stations")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.stations")}
            </Link>
            <Link
              to="/how-it-works"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/how-it-works")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("common.howItWorks")}
            </Link>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Unified Notifications trigger for staff */}
                {user.role === "staff" && (
                  <StaffNotificationsButton
                    onClick={() => {
                      if (location.pathname === '/dashboard/staff') {
                        try {
                          const ev = new CustomEvent('openStaffNotifications');
                          window.dispatchEvent(ev);
                        } catch {}
                      } else {
                        try { localStorage.setItem('openStaffNotifications','1'); } catch {}
                        navigate('/dashboard/staff');
                      }
                    }}
                    stationId={(user as any)?.stationId || staffStationId}
                  />
                )}

                {/* Customer notifications bell */}
                {user.role !== "staff" && user.role !== "admin" && (
                  <CustomerNotificationsButton />
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {t("nav.dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        {t("nav.bookings")}
                      </Link>
                    </DropdownMenuItem>
                    {user.role !== "staff" && user.role !== "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/wallet" className="flex items-center">
                          <Wallet className="mr-2 h-4 w-4" />
                          My Wallet
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("nav.settings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        onLogout?.();
                        navigate("/");
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/register">{t("nav.register")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive("/")
                    ? "text-primary bg-primary-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/vehicles"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive("/vehicles")
                    ? "text-primary bg-primary-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.vehicles")}
              </Link>
              <Link
                to="/stations"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive("/stations")
                    ? "text-primary bg-primary-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.stations")}
              </Link>
              <Link
                to="/how-it-works"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive("/how-it-works")
                    ? "text-primary bg-primary-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("common.howItWorks")}
              </Link>

              <div className="border-t border-border pt-3 mt-3">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-base font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("nav.bookings")}
                    </Link>
                    {user.role !== "staff" && user.role !== "admin" && (
                      <Link
                        to="/wallet"
                        className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Wallet
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        onLogout?.();
                        setIsMobileMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary-dark"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

interface StaffNotificationsButtonProps {
  stationId?: string;
  onClick: () => void;
}

const StaffNotificationsButton = ({ stationId, onClick }: StaffNotificationsButtonProps) => {
  const [unreadIncidents, setUnreadIncidents] = useState(0);
  const [batteryCount, setBatteryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadCount = async () => {
      if (!stationId) {
        // Hydrate battery count from local storage if available
        try {
          const stored = localStorage.getItem('staffNotifCounts');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed?.battery === 'number') setBatteryCount(parsed.battery);
          }
        } catch {}
        if (isActive) setUnreadIncidents(0);
        return;
      }

      // Try backend unread-count first
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:5000/api/incidents/station/${stationId}/unread-count`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const count =
            typeof data?.count === 'number'
              ? data.count
              : typeof data?.data?.count === 'number'
              ? data.data.count
              : 0;
          if (isActive) setUnreadIncidents(count);
          return;
        }
      } catch {
        // ignore and fallback
      }

      // Fallback 2: fetch full list by station and count reported
      try {
        const token = localStorage.getItem('token');
        const listRes = await fetch(
          `http://localhost:5000/api/incidents/station/${stationId}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              'Content-Type': 'application/json',
            },
          }
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const incidents = (listData?.incidents || []).filter((i: any) => (i?.status || 'reported') === 'reported');
          if (isActive) setUnreadIncidents(incidents.length);
          return;
        }
      } catch {
        // ignore and try local fallback
      }

      // Fallback to local storage incidents
      try {
        const localCount = incidentStorage.getPendingIncidentsByStation(String(stationId)).length;
        if (isActive) setUnreadIncidents(localCount);
      } catch {
        if (isActive) setUnreadIncidents(0);
      }
    };

    // Seed battery count at mount
    try {
      const stored = localStorage.getItem('staffNotifCounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.battery === 'number') setBatteryCount(parsed.battery);
      }
    } catch {}

    loadCount();
    const interval = setInterval(loadCount, 30000);
    const onVis = () => {
      if (document.visibilityState === 'visible') loadCount();
    };
    document.addEventListener('visibilitychange', onVis);

    // Listen to in-app updates from StaffDashboard if available
    const onExternal = (e: any) => {
      const count = Number(e?.detail?.count);
      if (!Number.isNaN(count)) setUnreadIncidents(count);
    };
    window.addEventListener('staffUnreadIncidents', onExternal as any);

    const onCounts = (e: any) => {
      const b = Number(e?.detail?.battery);
      if (!Number.isNaN(b)) setBatteryCount(b);
      const i = Number(e?.detail?.incidents);
      if (!Number.isNaN(i)) setUnreadIncidents(i);
    };
    window.addEventListener('staffNotifCounts', onCounts as any);
    return () => {
      isActive = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('staffUnreadIncidents', onExternal as any);
      window.removeEventListener('staffNotifCounts', onCounts as any);
    };
  }, [stationId]);

  const total = Math.max(0, (unreadIncidents || 0) + (batteryCount || 0));
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        aria-label={`Notifications${total > 0 ? ` (${total})` : ''}`}
      >
        <Bell className="h-5 w-5" />
      </Button>
      {total > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] h-4 min-w-4 px-1 flex items-center justify-center leading-none">
          {total > 99 ? '99+' : total}
        </span>
      )}
    </div>
  );
};

export default Navbar;

interface CustomerIncidentItem {
  incidentId: number;
  type: string;
  description: string;
  status: string; // 'reported' | 'in_progress' | 'resolved'
  reportedAt?: string;
}

interface CustomerHandoverItem {
  handoverId: number;
  reservationId?: number | null;
  rentalId?: number | null;
  type: string;
  createdAt?: string;
  returnTimeStatus?: string | null;
  lateHours?: number | null;
  batteryLevel?: number | null;
  mileage?: number | null;
  lateFee?: number | null;
  damageFee?: number | null;
  totalDue?: number | null;
  damages?: string[] | null;
  vehicleLabel?: string;
  remainingDue?: number | null;
  isRead?: boolean; // Track if customer has viewed this handover
}

const CustomerNotificationsButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [incidents, setIncidents] = useState<CustomerIncidentItem[]>([]);
  const [handovers, setHandovers] = useState<CustomerHandoverItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [incidentPendingCount, setIncidentPendingCount] = useState(0);
  const [handoverAttentionCount, setHandoverAttentionCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"incidents" | "handovers">(
    "incidents"
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setIncidents([]);
            setHandovers([]);
            setIncidentPendingCount(0);
            setHandoverAttentionCount(0);
            setUnreadCount(0);
          }
          return;
        }

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [incidentRes, handoverRes] = await Promise.all([
          fetch("http://localhost:5000/api/incidents/user", { headers }),
          fetch("http://localhost:5000/api/handovers/my", { headers }),
        ]);

        if (!isMounted) return;

        let pendingIncidents = 0;
        let attentionHandovers = 0;

        if (incidentRes.ok) {
          const data = await incidentRes.json();
          const list: any[] = data?.incidents || data?.data?.incidents || [];
          const normalized: CustomerIncidentItem[] = list.map((i) => ({
            incidentId: i.incidentId ?? i.id ?? 0,
            type: i.type || "",
            description: i.description || "",
            status: i.status || "reported",
            reportedAt: i.reportedAt ?? i.createdAt,
          }));
          setIncidents(normalized);
          pendingIncidents = normalized.filter(
            (i) => (i.status || "reported").toLowerCase() !== "resolved"
          ).length;
        } else {
          setIncidents([]);
        }

        if (handoverRes.ok) {
          const data = await handoverRes.json();
          const list: any[] = data?.handovers || data?.data?.handovers || [];
          
          // Get list of read handovers from localStorage
          let readHandovers: number[] = [];
          try {
            readHandovers = JSON.parse(localStorage.getItem('readHandovers') || '[]');
          } catch {
            readHandovers = [];
          }
          
          const normalized: CustomerHandoverItem[] = list.map((h) => {
            let damages: string[] | null = null;
            if (Array.isArray(h.damages)) {
              damages = h.damages.filter((d: any) => typeof d === "string");
            } else if (typeof h.damages === "string" && h.damages.trim().length > 0) {
              damages = [h.damages];
            }
            const handoverId = h.handoverId ?? h.handoverID ?? h.id ?? 0;
            const remaining = toNumberOrNull(h.remainingDue) ?? toNumberOrNull(h.totalDue) ?? 0;
            const isRead = readHandovers.includes(handoverId);
            
            return {
              handoverId,
              reservationId: h.reservationId ?? h.reservationID ?? null,
              rentalId: h.rentalId ?? h.rentalID ?? null,
              type: h.type || "return",
              createdAt: h.createdAt,
              returnTimeStatus: h.returnTimeStatus,
              lateHours: h.lateHours,
              batteryLevel: h.batteryLevel,
              mileage: h.mileage,
              lateFee: toNumberOrNull(h.lateFee),
              damageFee: toNumberOrNull(h.damageFee),
              totalDue: toNumberOrNull(h.totalDue),
              damages,
              vehicleLabel:
                h.vehicleLabel ||
                (h.reservationId ? `Reservation #${h.reservationId}` : undefined),
              remainingDue: remaining,
              isRead,
            };
          });
          setHandovers(normalized);
          // Count handovers that are unread (not viewed by customer)
          // Hiển thị badge cho tất cả handover chưa đọc, không chỉ những cái có phí
          attentionHandovers = normalized.filter((h) => {
            return !h.isRead; // Unread = chưa được customer xem
          }).length;
        } else {
          setHandovers([]);
        }

        setIncidentPendingCount(pendingIncidents);
        setHandoverAttentionCount(attentionHandovers);
        setUnreadCount(pendingIncidents + attentionHandovers);
      } catch {
        // ignore
        if (isMounted) {
          setIncidents([]);
          setHandovers([]);
          setIncidentPendingCount(0);
          setHandoverAttentionCount(0);
          setUnreadCount(0);
        }
        return;
      }
    };

    load();
    const interval = setInterval(load, 30000);
    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };
    const onPaymentSuccess = () => {
      // Refresh handovers list when payment is successful
      if (isMounted) load();
    };
    const onHandoverRead = () => {
      // Refresh handovers list when a handover is marked as read
      if (isMounted) load();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('handoverPaymentSuccess', onPaymentSuccess);
    window.addEventListener('handoverRead', onHandoverRead);
    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('handoverPaymentSuccess', onPaymentSuccess);
      window.removeEventListener('handoverRead', onHandoverRead);
    };
  }, []);

  const statusLabel = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'reported') return 'Send';
    if (s === 'in_progress') return 'Accepted';
    if (s === 'resolved') return 'Approve';
    return status || 'Unknown';
  };

  const statusClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'reported') return 'text-yellow-600 bg-yellow-100';
    if (s === 'in_progress') return 'text-blue-600 bg-blue-100';
    if (s === 'resolved') return 'text-green-700 bg-green-100';
    return 'text-muted-foreground bg-secondary';
  };

  const formatCurrency = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return "0 VND";
    return `${Number(value).toLocaleString("vi-VN")} VND`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Incident notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      >
        <Bell className="h-5 w-5" />
      </Button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] h-4 min-w-4 px-1 flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-md shadow-lg z-50">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "incidents" | "handovers")}>
            <div className="p-3 border-b border-border">
              <div className="text-sm font-medium">Notifications</div>
              <div className="text-xs text-muted-foreground">
                Updates about incidents and vehicle inspections
              </div>
            </div>
            <TabsList className="grid w-full grid-cols-2 px-3 pt-3 gap-2">
              <TabsTrigger value="incidents">
                Incidents
                {incidentPendingCount > 0 && (
                  <span className="ml-2 rounded-full bg-yellow-100 text-yellow-700 text-[11px] px-2 py-0.5">
                    {incidentPendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="handovers">
                Returns
                {handoverAttentionCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 text-white text-[11px] px-2 py-0.5 font-semibold">
                    {handoverAttentionCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="incidents">
              <div className="max-h-80 overflow-auto">
                {incidents.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No incident updates yet</div>
                ) : (
                  incidents.slice(0, 10).map((it) => (
                    <div key={it.incidentId} className="p-3 border-b border-border last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">{it.type || 'Incident'}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {it.description || 'No description'}
                          </div>
                          {it.reportedAt && (
                            <div className="text-[11px] text-muted-foreground mt-1">
                              Reported at {new Date(it.reportedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass(it.status)}`}>
                          {statusLabel(it.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="handovers">
              <div className="max-h-80 overflow-auto">
                {handovers.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No return inspections recorded yet
                  </div>
                ) : (
                  handovers.slice(0, 10).map((it) => {
                    const totalDue =
                      it.totalDue ?? (it.damageFee ?? 0) + (it.lateFee ?? 0);
                    const remaining = it.remainingDue ?? totalDue;
                    // Unread = chưa được customer xem (bất kể có phí hay không)
                    const isUnread = !it.isRead;
                    const returnStatus = (it.returnTimeStatus || "").replace("_", " ");
                    return (
                      <button
                        key={it.handoverId}
                        className={`w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                          isUnread ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/returns/${it.handoverId}`);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"}`}>
                              {it.vehicleLabel || `Return #${it.handoverId}`}
                              {isUnread && (
                                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mb-1">
                              {it.createdAt
                                ? new Date(it.createdAt).toLocaleString()
                                : ""}
                              {returnStatus ? ` • ${returnStatus}` : ""}
                            </div>
                            <div className={`text-xs space-y-1 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              <div>
                                Battery: {it.batteryLevel ?? "--"}% • Mileage:{" "}
                                {it.mileage?.toLocaleString("vi-VN") ?? "--"} km
                              </div>
                              <div>
                                Late fee: {formatCurrency(it.lateFee)} • Damage fee:{" "}
                                {formatCurrency(it.damageFee)}
                              </div>
                              {it.damages && it.damages.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {it.damages.map((dmg, idx) => (
                                    <span
                                      key={`${it.handoverId}-dmg-${idx}`}
                                      className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700"
                                    >
                                      {dmg}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <div className={isUnread ? "text-foreground font-medium" : "text-muted-foreground"}>Remaining</div>
                            <div className={`${isUnread ? "font-bold" : "font-semibold"} ${remaining > 0 ? "text-destructive" : "text-emerald-600"}`}>
                              {formatCurrency(remaining)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="p-2 flex justify-end border-t border-border">
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function toNumberOrNull(input: any): number | null {
  if (input == null) return null;
  const num = typeof input === "number" ? input : Number(input);
  if (Number.isNaN(num)) return null;
  return num;
}
