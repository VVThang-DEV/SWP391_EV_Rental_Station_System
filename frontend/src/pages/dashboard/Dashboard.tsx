import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { 
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { bookingStorage } from "@/lib/booking-storage";
import { incidentStorage } from "@/lib/incident-storage";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import {
  Car,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Zap,
  TrendingUp,
  Award,
  History,
  Settings,
  ChevronRight,
  Wallet,
  AlertTriangle,
} from "lucide-react";

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "staff" | "admin";
    stationId?: string;
  } | null;
}

// mock API
const mockCurrentRental = {
  id: "RENT001",
  reservationId: 123,
  vehicle: "VinFast VF8 Premium",
  vehicleId: "VF8001",
  vehicleBrand: "VinFast",
  vehicleYear: 2024,
  vehicleImage: "https://vinfastauto.com/sites/default/files/2023-01/VF8%20Plus-1.jpg",
  startDate: "2024-11-01",
  endDate: "2024-11-03",
  startTime: "09:00",
  endTime: "18:00",
  pickupLocation: "District 1 Station - HCMC",
  dropoffLocation: "District 1 Station - HCMC",
  status: "active",
  totalCost: 150000, // VND
  duration: "2 days",
  batteryLevel: 85,
  customerInfo: {
    fullName: "Luu Vu Hung",
    phone: "0399106850",
    email: "hung@example.com"
  },
  paymentMethod: "wallet",
  createdAt: "2024-11-01T08:30:00.000Z"
};

// + Thêm mock recent rentals
const mockRecentRentals = [
  {
    id: "RENT002",
    vehicle: "Tesla Model 3",
    startDate: "2024-10-28",
    endDate: "2024-10-29",
    duration: "1 day",
    pickupLocation: "District 3 Station",
    totalCost: 75000,
    status: "completed"
  },
  {
    id: "RENT003",
    vehicle: "BYD Tang",
    startDate: "2024-10-25",
    endDate: "2024-10-26",
    duration: "1 day",
    pickupLocation: "Thu Duc Station",
    totalCost: 68000,
    status: "completed"
  }
];
// END MOCK API


const Dashboard = ({ user }: DashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
 const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
 const [incidentType, setIncidentType] = useState("");
 const [incidentDescription, setIncidentDescription] = useState("");
 const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRentals: 0,
      totalSpent: 0,
      hoursRented: 0,
      co2Saved: 0,
    },
    currentRental: null as any,
    recentRentals: [] as any[],
  });

  // DATA chính
  // useEffect(() => {
  //   // Lấy dữ liệu thực từ storage
  //   const stats = bookingStorage.getDashboardStats();
  //   const currentRental = bookingStorage.getCurrentRental();
  //   const recentRentals = bookingStorage.getRecentRentals(3);

  //   setDashboardData({
  //     stats,
  //     currentRental,
  //     recentRentals,
  //   });
  // }, []);

  // Load dashboard data with live reservations if available (fallback to local storage)
  useEffect(() => {
    const loadData = async () => {
      const stats = bookingStorage.getDashboardStats();

      try {
        const res = await apiService.getReservations();
        const reservations = res.reservations || [];

        // treat any non-finished reservation as current
        const activeLike = reservations
          .filter((r) => !["completed", "cancelled", "canceled", "finished"].includes((r.status || "").toLowerCase()))
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

        if (activeLike) {
          let batteryLevel: number | null = null;
          try {
            const vehicle = await apiService.getVehicleById(activeLike.vehicleId);
            batteryLevel = typeof vehicle.batteryLevel === "number" ? vehicle.batteryLevel : null;
          } catch {
            batteryLevel = null;
          }

          const currentRental: any = {
            id: `RES_${activeLike.reservationId}`,
            reservationId: activeLike.reservationId,
            vehicle: `Vehicle #${activeLike.vehicleId}`,
            vehicleId: String(activeLike.vehicleId),
            vehicleBrand: "",
            vehicleYear: new Date(activeLike.startTime).getFullYear(),
            vehicleImage: "",
            startDate: new Date(activeLike.startTime).toISOString().split("T")[0],
            endDate: new Date(activeLike.endTime).toISOString().split("T")[0],
            startTime: new Date(activeLike.startTime).toLocaleTimeString(),
            endTime: new Date(activeLike.endTime).toLocaleTimeString(),
            pickupLocation: (activeLike as any).stationName || `Station #${activeLike.stationId}`,
            dropoffLocation: (activeLike as any).stationName || `Station #${activeLike.stationId}`,
            status: activeLike.status || "active",
            totalCost: 0,
            duration: "",
            batteryLevel: batteryLevel ?? undefined,
            createdAt: activeLike.createdAt,
          };

          setDashboardData({
            stats,
            currentRental,
            recentRentals: bookingStorage.getRecentRentals(3),
          });
          return;
        }
      } catch {
        // ignore and use storage fallback
      }

      setDashboardData({
        stats,
        currentRental: bookingStorage.getCurrentRental(),
        recentRentals: bookingStorage.getRecentRentals(3),
      });
    };

    loadData();
  }, []);


  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("common.accessDenied")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("common.pleaseSignInToViewDashboard")}
          </p>
          <Button asChild>
            <Link to="/login">{t("common.signIn")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Data chính
  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case "active":
  //       return <Badge className="badge-available">Active</Badge>;
  //     case "completed":
  //       return <Badge variant="secondary">Completed</Badge>;
  //     default:
  //       return <Badge variant="outline">{status}</Badge>;
  //   }
  // };

  // SStatus mock test
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in_progress":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  // END MOCK TEST STATUS

  const handleReportIncident = async () => {
   if (!incidentType || !incidentDescription.trim()) {
     toast({
       title: "Incomplete Information",
       description: "Please select incident type and provide description",
       variant: "destructive",
     });
     return;
   }

   // Check if user has current rental
   if (!dashboardData.currentRental) {
     toast({
       title: "No Active Rental",
       description: "You need to have an active rental to report an incident.",
       variant: "destructive",
     });
     return;
   }

   setIsSubmittingIncident(true);
   try {
     const token = localStorage.getItem('token');
     if (!token) {
       toast({
         title: "Unauthorized",
         description: "Please login to report an incident.",
         variant: "destructive",
       });
       return;
     }

     // Determine priority based on incident type
     let priority = 'medium';
     if (incidentType.includes('accident') || incidentType.includes('emergency')) {
       priority = 'urgent';
     } else if (incidentType.includes('breakdown') || incidentType.includes('battery-empty')) {
       priority = 'high';
     }

    const response = await fetch('http://localhost:5000/api/incidents', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
        reservationId: dashboardData.currentRental?.reservationId || null,
         type: incidentType,
         description: incidentDescription,
         priority: priority,
       }),
     });

    // Safely parse response (handles 404/empty body)
    let data: any = {};
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

     if (response.ok && data.success) {
       toast({
         title: "Incident Reported Successfully",
         description: "Our staff will contact you shortly to assist.",
       });
       setIsIncidentDialogOpen(false);
       setIncidentType("");
       setIncidentDescription("");
     } else {
       toast({
         title: "Failed to Report Incident",
         description: data.message || "Please try again or contact support directly.",
         variant: "destructive",
       });
     }
   } catch (error) {
     console.error('Error reporting incident:', error);
     toast({
       title: "Error",
       description: "An error occurred while reporting the incident. Please try again.",
       variant: "destructive",
     });
   } finally {
     setIsSubmittingIncident(false);
   }
 };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("dashboard.welcome")}, {user.name}!
          </h1>
          <p className="text-muted-foreground">{t("dashboard.overview")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalRentals")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData.stats.totalRentals}
                  </p>
                </div>
                <div className="p-3 bg-primary-light rounded-full">
                  <Car className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalSpent")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${dashboardData.stats.totalSpent}
                  </p>
                </div>
                <div className="p-3 bg-success-light rounded-full">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.hoursRented")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData.stats.hoursRented}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.co2Saved")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData.stats.co2Saved} kg
                  </p>
                </div>
                <div className="p-3 bg-success-light rounded-full">
                  <Zap className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Rental */}
          {dashboardData.currentRental ? (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Rental
                  {getStatusBadge(dashboardData.currentRental.status)}
                </CardTitle>
                <CardDescription>Your active rental details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-light rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {dashboardData.currentRental.vehicle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData.currentRental.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/bookings">View Details</Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Battery Level</span>
                    <span className="font-medium">
                      {typeof (dashboardData.currentRental as any)?.batteryLevel === "number"
                        ? `${(dashboardData.currentRental as any).batteryLevel}%`
                        : "--%"}
                    </span>
                  </div>
                  <Progress
                    value={
                      typeof (dashboardData.currentRental as any)?.batteryLevel === "number"
                        ? (dashboardData.currentRental as any).batteryLevel
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Started:{" "}
                      {formatDate(dashboardData.currentRental.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Ends: {formatDate(dashboardData.currentRental.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                   className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                   size="sm"
                   onClick={() => setIsIncidentDialogOpen(true)}
                 >
                   <AlertTriangle className="h-4 w-4 mr-2" />
                   Report Incident
                 </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Current Rental</CardTitle>
                <CardDescription>No active rentals</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don't have any active rentals right now.
                </p>
                <Button asChild>
                  <Link to="/vehicles">Browse Vehicles</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link to="/wallet">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    My Wallet
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link to="/vehicles">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Browse Vehicles
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link to="/bookings">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Rental History
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link to="/settings">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                disabled
              >
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Rewards Program
                </div>
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rentals */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Rentals
              <Button variant="outline" size="sm" asChild>
                <Link to="/bookings">View All</Link>
              </Button>
            </CardTitle>
            <CardDescription>Your recent rental activity</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentRentals.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentRentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-light rounded-lg">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{rental.vehicle}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatDate(rental.startDate)}</span>
                          <span>•</span>
                          <span>{rental.duration}</span>
                          <span>•</span>
                          <span>{rental.pickupLocation}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${rental.totalCost}</p>
                      {getStatusBadge(rental.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No rental history yet.
                </p>
                <Button asChild>
                  <Link to="/vehicles">Start Your First Rental</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eco Impact */}
        <Card className="mt-8 bg-gradient-success text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Your Environmental Impact
                </h3>
                <p className="text-white/90 mb-4">
                  By choosing electric vehicles, you've made a positive impact
                  on the environment
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardData.stats.co2Saved} kg
                    </p>
                    <p className="text-sm text-white/80">CO₂ Saved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">87</p>
                    <p className="text-sm text-white/80">Trees Equivalent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12.4</p>
                    <p className="text-sm text-white/80">Gallons Saved</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="p-4 bg-white/10 rounded-full">
                  <TrendingUp className="h-12 w-12" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Incident Dialog */}
<Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Report Incident
      </DialogTitle>
      <DialogDescription>
        Please describe the issue you're experiencing with your rental.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="incident-type">Incident Type</Label>
        <Select value={incidentType} onValueChange={setIncidentType}>
          <SelectTrigger>
            <SelectValue placeholder="Select incident type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="battery-empty">Battery Empty</SelectItem>
            <SelectItem value="vehicle-breakdown">Vehicle Breakdown</SelectItem>
            <SelectItem value="accident">Minor Accident</SelectItem>
            <SelectItem value="unlock-issue">Cannot Unlock Vehicle</SelectItem>
            <SelectItem value="charging-issue">Charging Problem</SelectItem>
            <SelectItem value="other">Other Technical Issue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="incident-description">Description</Label>
        <Textarea
          id="incident-description"
          placeholder="Please describe the incident in detail..."
          value={incidentDescription}
          onChange={(e) => setIncidentDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
        <p className="font-medium text-blue-900">Emergency Contact:</p>
        <p className="text-blue-800">For urgent situations, call: <strong>1900-xxxx</strong></p>
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setIsIncidentDialogOpen(false);
          setIncidentType("");
          setIncidentDescription("");
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleReportIncident}
        disabled={isSubmittingIncident}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {isSubmittingIncident ? "Reporting..." : "Report Incident"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default Dashboard;
