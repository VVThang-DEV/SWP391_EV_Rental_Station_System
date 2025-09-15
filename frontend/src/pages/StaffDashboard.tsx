import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Battery,
  Camera,
  FileText,
  CreditCard,
  User,
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  Settings,
  Star,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Wrench,
  Plus,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { vehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";

interface StaffDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "staff";
    stationId: string;
  } | null;
}

const StaffDashboard = ({ user }: StaffDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("vehicles");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<
    "license" | "identity" | null
  >(null);

  // Enhanced state for CRUD operations
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<{
    id: string;
    name: string;
    condition: string;
    mileage: number;
    batteryLevel: number;
    lastMaintenance: string;
  } | null>(null);
  const [isScheduleMaintenanceOpen, setIsScheduleMaintenanceOpen] =
    useState(false);
  const [maintenanceType, setMaintenanceType] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [vehicleMileage, setVehicleMileage] = useState("");
  const [vehicleCondition, setVehicleCondition] = useState("");
  const [batteryLevel, setBatteryLevel] = useState("");

  const { toast } = useToast();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("common.accessDenied")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("common.staffAccessRequired")}
          </p>
        </div>
      </div>
    );
  }

  // Mock data for Station District 1
  const stationData = {
    name: "District 1 EV Station",
    vehicles: {
      available: 12,
      rented: 8,
      maintenance: 2,
      total: 22,
    },
    todayStats: {
      checkouts: 15,
      checkins: 12,
      revenue: 2340,
      newCustomers: 3,
    },
  };

  const vehicleList = [
    {
      id: "EV001",
      name: "Tesla Model 3",
      status: "available",
      battery: 95,
      location: "Slot A1",
      lastMaintenance: "2024-01-10",
      bookings: [],
    },
    {
      id: "EV002",
      name: "VinFast VF8",
      status: "rented",
      battery: 78,
      customer: "Nguyen Van A",
      rentedSince: "2024-01-15T09:00:00",
      expectedReturn: "2024-01-15T17:00:00",
    },
    {
      id: "EV003",
      name: "BYD Tang",
      status: "maintenance",
      issue: "Battery calibration needed",
      maintenanceStarted: "2024-01-14T10:00:00",
    },
  ];

  const pendingBookings = [
    {
      id: "B001",
      customer: "Tran Thi B",
      vehicle: "Tesla Model 3",
      pickupTime: "2024-01-15T14:00:00",
      licenseVerified: false,
      documentsUploaded: true,
    },
    {
      id: "B002",
      customer: "Le Van C",
      vehicle: "VinFast VF8",
      pickupTime: "2024-01-15T16:30:00",
      licenseVerified: true,
      documentsUploaded: true,
    },
  ];

  const handleVehicleCheckout = (vehicleId: string, customerId: string) => {
    toast({
      title: "Vehicle Checked Out",
      description: `Vehicle ${vehicleId} has been successfully checked out.`,
    });
  };

  const handleVehicleCheckin = (vehicleId: string) => {
    toast({
      title: "Vehicle Checked In",
      description: `Vehicle ${vehicleId} has been successfully returned.`,
    });
  };

  const handleCustomerVerification = (customerId: string) => {
    toast({
      title: "Customer Verified",
      description: "Customer identity and documents have been verified.",
    });
  };

  const handleScheduleMaintenance = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setIsMaintenanceDialogOpen(true);
  };

  const handleUpdateMaintenance = () => {
    if (selectedVehicle && maintenanceNotes.trim()) {
      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance scheduled for vehicle ${selectedVehicle}.`,
      });
      setIsMaintenanceDialogOpen(false);
      setSelectedVehicle(null);
      setMaintenanceNotes("");
    }
  };

  const handleUpdateVehicleStatus = (vehicleId: string) => {
    toast({
      title: "Status Updated",
      description: `Vehicle ${vehicleId} status has been updated.`,
    });
  };

  const handleTakePhoto = (bookingId: string, type: "license" | "identity") => {
    setSelectedBooking(bookingId);
    setDocumentType(type);
    setIsDocumentDialogOpen(true);
    toast({
      title: "Camera Opened",
      description: `Taking photo of ${type} document.`,
    });
  };

  const handleUploadDocument = (
    bookingId: string,
    type: "license" | "identity"
  ) => {
    setSelectedBooking(bookingId);
    setDocumentType(type);
    toast({
      title: "Upload Started",
      description: `Uploading ${type} document.`,
    });
  };

  const handleReturnDeposit = (customerName: string, amount: string) => {
    toast({
      title: "Deposit Returned",
      description: `Deposit of ${amount} returned to ${customerName}.`,
    });
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    toast({
      title: "Filter Applied",
      description: `Showing ${
        status === "all" ? "all vehicles" : status + " vehicles"
      }.`,
    });
  };

  // Enhanced CRUD handlers
  const handleEditVehicle = (vehicle: {
    id: string;
    name: string;
    condition?: string;
    mileage?: number;
    battery?: number;
    lastMaintenance?: string;
  }) => {
    setEditingVehicle({
      id: vehicle.id,
      name: vehicle.name,
      condition: vehicle.condition || "good",
      mileage: vehicle.mileage || 0,
      batteryLevel: vehicle.battery || 0,
      lastMaintenance:
        vehicle.lastMaintenance || new Date().toISOString().split("T")[0],
    });
    setVehicleCondition(vehicle.condition || "good");
    setVehicleMileage(vehicle.mileage?.toString() || "0");
    setBatteryLevel(vehicle.battery?.toString() || "0");
    setIsEditVehicleDialogOpen(true);
  };

  const handleSaveVehicleChanges = () => {
    if (editingVehicle) {
      toast({
        title: "Vehicle Updated",
        description: `${editingVehicle.name} has been successfully updated.`,
        duration: 3000,
      });
      setIsEditVehicleDialogOpen(false);
      setEditingVehicle(null);
    }
  };

  const handleScheduleDetailedMaintenance = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setMaintenanceDate(new Date().toISOString().split("T")[0]);
    setIsScheduleMaintenanceOpen(true);
  };

  const handleSaveMaintenanceSchedule = () => {
    if (selectedVehicle && maintenanceType && maintenanceDate) {
      toast({
        title: "Maintenance Scheduled",
        description: `${maintenanceType} scheduled for ${maintenanceDate}`,
        duration: 3000,
      });
      setIsScheduleMaintenanceOpen(false);
      setSelectedVehicle(null);
      setMaintenanceType("");
      setMaintenanceDate("");
    }
  };

  const handleVehicleStatusUpdate = (vehicleId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Vehicle ${vehicleId} is now ${newStatus}`,
      duration: 2000,
    });
  };

  const renderVehicleManagement = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-success-light rounded-full">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stationData.vehicles.available}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.available")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-warning-light rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stationData.vehicles.rented}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.rented")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-destructive-light rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stationData.vehicles.maintenance}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.maintenance")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-primary-light rounded-full">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stationData.vehicles.total}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.totalFleet")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Fleet Status</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("common.searchVehicles")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 text-black"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("all")}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicleList.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-muted rounded-full">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{vehicle.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {vehicle.id}
                    </p>
                    {vehicle.status === "available" && (
                      <p className="text-sm text-muted-foreground">
                        Location: {vehicle.location}
                      </p>
                    )}
                    {vehicle.status === "rented" && (
                      <p className="text-sm text-muted-foreground">
                        Customer: {vehicle.customer}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {vehicle.battery && (
                    <div className="flex items-center space-x-1">
                      <Battery className="h-4 w-4 text-success" />
                      <span className="text-sm">{vehicle.battery}%</span>
                    </div>
                  )}

                  <Badge
                    variant={
                      vehicle.status === "available"
                        ? "default"
                        : vehicle.status === "rented"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {vehicle.status}
                  </Badge>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    {vehicle.status === "available" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleScheduleDetailedMaintenance(vehicle.id)
                          }
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          {t("common.scheduleMaintenance")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleVehicleCheckout(vehicle.id, "walk-in")
                          }
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Check Out
                        </Button>
                      </>
                    )}

                    {vehicle.status === "rented" && (
                      <Button
                        size="sm"
                        onClick={() => handleVehicleCheckin(vehicle.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {t("common.checkIn")}
                      </Button>
                    )}

                    {vehicle.status === "maintenance" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleVehicleStatusUpdate(vehicle.id, "available")
                        }
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Available
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Scheduling Dialog */}
      <Dialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maintenanceNotes">Maintenance Notes</Label>
              <Textarea
                id="maintenanceNotes"
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="Describe the maintenance required..."
                className="text-black"
              />
            </div>
            <Button onClick={handleUpdateMaintenance} className="w-full">
              Schedule Maintenance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="space-y-6">
      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Customer Verifications</CardTitle>
          <CardDescription>
            Customers waiting for document verification and vehicle pickup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-light rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{booking.customer}</h4>
                    <p className="text-sm text-muted-foreground">
                      Vehicle: {booking.vehicle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pickup: {new Date(booking.pickupTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <Badge
                      variant={
                        booking.licenseVerified ? "default" : "secondary"
                      }
                    >
                      {booking.licenseVerified
                        ? "License ✓"
                        : "License Pending"}
                    </Badge>
                    <Badge
                      variant={
                        booking.documentsUploaded ? "default" : "secondary"
                      }
                    >
                      {booking.documentsUploaded
                        ? "Documents ✓"
                        : "Documents Pending"}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Verify Documents
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Customer Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Driver's License</Label>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleTakePhoto(booking.id, "license")
                                }
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleUploadDocument(booking.id, "license")
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Identity Document (CCCD/CMND)</Label>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleTakePhoto(booking.id, "identity")
                                }
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleUploadDocument(booking.id, "identity")
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() =>
                              handleCustomerVerification(booking.id)
                            }
                          >
                            Verify & Approve
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      onClick={() =>
                        handleVehicleCheckout(booking.vehicle, booking.id)
                      }
                    >
                      Complete Checkout
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Capture Dialog */}
      <Dialog
        open={isDocumentDialogOpen}
        onOpenChange={setIsDocumentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {documentType === "license"
                ? "Driver's License"
                : "Identity Document"}{" "}
              Capture
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-muted-foreground rounded-lg">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Camera interface would be displayed here
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                In a real application, this would connect to the device's camera
              </p>
            </div>
            <Button
              onClick={() => setIsDocumentDialogOpen(false)}
              className="w-full"
            >
              Capture Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderPaymentManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today's Transactions</CardTitle>
          <CardDescription>
            Payment processing and cash handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                ${stationData.todayStats.revenue}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("common.todaysRevenue")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${stationData.todayStats.revenue * 0.3}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("common.cashPayments")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${stationData.todayStats.revenue * 0.7}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("common.digitalPayments")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">
                    {t("common.cashPayment")} - Nguyen Van A
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tesla Model 3 - 8 hours rental
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$120.00</p>
                <Button
                  size="sm"
                  className="mt-1"
                  onClick={() =>
                    toast({
                      title: "Payment Processed",
                      description:
                        "Cash payment of $120.00 processed successfully.",
                    })
                  }
                >
                  Process Payment
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {t("common.depositReturn")} - Tran Thi B
                  </p>
                  <p className="text-sm text-muted-foreground">
                    VinFast VF8 - No damages
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$200.00</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReturnDeposit("Tran Thi B", "$200.00")}
                >
                  Return Deposit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn delay={100}>
          <div className="bg-gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {t("common.staffDashboard")}
                </h1>
                <p className="text-xl text-white/90 mb-2">{stationData.name}</p>
                <p className="text-white/80">
                  {t("common.welcomeUser")}, {user.name}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>{" "}
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Today's Stats */}
          <SlideIn direction="bottom" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-3 bg-primary-light rounded-full">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stationData.todayStats.checkouts}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Checkouts Today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-3 bg-success-light rounded-full">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stationData.todayStats.checkins}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("common.returnsToday")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-3 bg-warning-light rounded-full">
                      <CreditCard className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        ${stationData.todayStats.revenue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("common.revenueToday")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-3 bg-info-light rounded-full">
                      <Users className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stationData.todayStats.newCustomers}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("common.newCustomers")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SlideIn>

          {/* Tabs */}
          <FadeIn delay={300}>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
                <TabsTrigger value="customers">
                  Customer Verification
                </TabsTrigger>
                <TabsTrigger value="payments">Payment Processing</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="mt-6">
                {renderVehicleManagement()}
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                {renderCustomerManagement()}
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                {renderPaymentManagement()}
              </TabsContent>
            </Tabs>
          </FadeIn>

          {/* Enhanced Edit Vehicle Dialog */}
          <Dialog
            open={isEditVehicleDialogOpen}
            onOpenChange={setIsEditVehicleDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Vehicle: {editingVehicle?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleCondition">Vehicle Condition</Label>
                  <Select
                    value={vehicleCondition}
                    onValueChange={setVehicleCondition}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batteryLevel">Battery Level (%)</Label>
                  <Input
                    id="batteryLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(e.target.value)}
                    className="text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleMileage">Mileage (km)</Label>
                  <Input
                    id="vehicleMileage"
                    type="number"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(e.target.value)}
                    className="text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={editingVehicle?.lastMaintenance}
                    onChange={(e) =>
                      setEditingVehicle((prev) =>
                        prev
                          ? { ...prev, lastMaintenance: e.target.value }
                          : null
                      )
                    }
                    className="text-black"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="maintenanceNotes">Additional Notes</Label>
                  <Textarea
                    id="maintenanceNotes"
                    placeholder="Add any notes about the vehicle condition or maintenance..."
                    className="text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditVehicleDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveVehicleChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Maintenance Scheduling Dialog */}
          <Dialog
            open={isScheduleMaintenanceOpen}
            onOpenChange={setIsScheduleMaintenanceOpen}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Schedule Maintenance
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select
                    value={maintenanceType}
                    onValueChange={setMaintenanceType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Service</SelectItem>
                      <SelectItem value="battery">Battery Check</SelectItem>
                      <SelectItem value="tire">Tire Replacement</SelectItem>
                      <SelectItem value="brake">Brake Inspection</SelectItem>
                      <SelectItem value="charging">Charging System</SelectItem>
                      <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                      <SelectItem value="software">Software Update</SelectItem>
                      <SelectItem value="emergency">
                        Emergency Repair
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceDate">Scheduled Date</Label>
                  <Input
                    id="maintenanceDate"
                    type="date"
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceNotes">Service Notes</Label>
                  <Textarea
                    id="maintenanceNotes"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    placeholder="Describe the maintenance required, issues observed, or special instructions..."
                    className="text-black"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleMaintenanceOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveMaintenanceSchedule}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
};

export default StaffDashboard;
