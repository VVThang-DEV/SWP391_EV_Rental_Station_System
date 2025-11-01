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
import { useEffect, useState } from "react";
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

  //DATA MOCK TEST
  useEffect(() => {
    // Lấy dữ liệu thực từ storage
    const stats = bookingStorage.getDashboardStats();
    const currentRental = bookingStorage.getCurrentRental();
    const recentRentals = bookingStorage.getRecentRentals(3);

    setDashboardData({
      stats,
      // + Sử dụng mock data nếu không có current rental
      currentRental: currentRental || mockCurrentRental,
      // + Sử dụng mock data nếu không có recent rentals
      recentRentals: recentRentals.length > 0 ? recentRentals : mockRecentRentals,
    });
  }, []);
  // END MOCK TEST


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

   setIsSubmittingIncident(true);
   try {
     const token = localStorage.getItem('token');
     const response = await fetch('http://localhost:5000/api/incidents', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         rental_id: dashboardData.currentRental?.reservationId,
         vehicle_id: dashboardData.currentRental?.vehicleId,
         description: `${incidentType}: ${incidentDescription}`,
         status: 'reported',
       }),
     });

     if (response.ok) {
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
         description: "Please try again or contact support directly.",
         variant: "destructive",
       });
     }
   } catch (error) {
     console.error('Error reporting incident:', error);
     toast({
       title: "Error",
       description: "An error occurred while reporting the incident.",
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
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
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



    </div>
  );
};

export default Dashboard;
