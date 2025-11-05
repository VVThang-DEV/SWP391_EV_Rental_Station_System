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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadCount = async () => {
      if (!stationId) {
        if (isActive) setUnreadCount(0);
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
          if (isActive) setUnreadCount(count);
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
          if (isActive) setUnreadCount(incidents.length);
          return;
        }
      } catch {
        // ignore and try local fallback
      }

      // Fallback to local storage incidents
      try {
        const localCount = incidentStorage.getPendingIncidentsByStation(String(stationId)).length;
        if (isActive) setUnreadCount(localCount);
      } catch {
        if (isActive) setUnreadCount(0);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 30000);
    const onVis = () => {
      if (document.visibilityState === 'visible') loadCount();
    };
    document.addEventListener('visibilitychange', onVis);

    // Listen to in-app updates from StaffDashboard if available
    const onExternal = (e: any) => {
      const count = Number(e?.detail?.count);
      if (!Number.isNaN(count)) {
        setUnreadCount(count);
      }
    };
    window.addEventListener('staffUnreadIncidents', onExternal as any);
    return () => {
      isActive = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('staffUnreadIncidents', onExternal as any);
    };
  }, [stationId]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      >
        <Bell className="h-5 w-5" />
      </Button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] h-4 min-w-4 px-1 flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default Navbar;
