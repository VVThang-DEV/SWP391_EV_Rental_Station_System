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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  Car,
  Users,
  Building,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Zap,
  Battery,
  Wrench,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  Navigation,
  Bike,
  Bus,
  Truck,
  Upload,
  FileText,
  Shield,
  Gauge,
  Fuel,
} from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";
import { getVehicleModels } from "@/lib/vehicle-station-utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { adminApiService, AdminCreateVehicleRequest } from "../../services/api";

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin";
  } | null;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<
    (typeof systemData.stations)[0] | null
  >(null);
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    (typeof systemData.customers)[0] | null
  >(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<
    (typeof systemData.staff)[0] | null
  >(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

  // Vehicle Management States
  const [isRegisterVehicleDialogOpen, setIsRegisterVehicleDialogOpen] =
    useState(false);
  const [selectedModelForRegistration, setSelectedModelForRegistration] =
    useState("");
  const [vehicleRegistrationData, setVehicleRegistrationData] = useState({
    licensePlate: "",
    vinNumber: "",
    color: "",
    year: new Date().getFullYear().toString(),
    batteryCapacity: "",
    batteryLevel: "100",
    mileage: "0",
    condition: "excellent",
    purchaseDate: "",
    warrantyExpiry: "",
    insuranceExpiry: "",
    lastMaintenanceDate: "",
    inspectionDate: "",
    nextMaintenanceDate: "",
    fuelEfficiency: "",
    notes: "",
    location: "",
  });

  const { toast } = useToast();
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewStation = (station: any) => {
    setSelectedStation(station);
    setIsStationDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditStation = (station: any) => {
    toast({
      title: "Edit Station",
      description: `Editing ${station.name} - Feature in development`,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditCustomer = (customer: any) => {
    toast({
      title: "Edit Customer",
      description: `Editing customer ${customer.name} - Feature in development`,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuspendCustomer = (customer: any) => {
    toast({
      title: "Customer Suspended",
      description: `${customer.name} has been suspended`,
      variant: "destructive",
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsStaffDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditStaff = (staff: any) => {
    toast({
      title: "Edit Staff",
      description: `Editing staff member ${staff.name} - Feature in development`,
    });
  };

  const handleAddStation = () => {
    toast({
      title: "Add Station",
      description: "Add new station feature - In development",
    });
  };

  const handleAddStaff = () => {
    toast({
      title: "Add Staff",
      description: "Add new staff member feature - In development",
    });
  };

  // Vehicle Management Handlers
  const handleRegisterVehicle = async () => {
    if (
      !selectedModelForRegistration ||
      !vehicleRegistrationData.licensePlate ||
      !vehicleRegistrationData.vinNumber
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields (Model, License Plate, VIN)",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestData: AdminCreateVehicleRequest = {
        modelId: selectedModelForRegistration,
        uniqueVehicleId: vehicleRegistrationData.vinNumber,
        batteryLevel: parseInt(vehicleRegistrationData.batteryLevel),
        condition: vehicleRegistrationData.condition,
        mileage: parseInt(vehicleRegistrationData.mileage),
        licensePlate: vehicleRegistrationData.licensePlate,
        lastMaintenance: vehicleRegistrationData.lastMaintenanceDate || undefined,
        inspectionDate: vehicleRegistrationData.inspectionDate || undefined,
        insuranceExpiry: vehicleRegistrationData.insuranceExpiry || undefined,
        location: vehicleRegistrationData.location || undefined,
        // Các trường mới
        color: vehicleRegistrationData.color || undefined,
        year: vehicleRegistrationData.year ? parseInt(vehicleRegistrationData.year) : undefined,
        batteryCapacity: vehicleRegistrationData.batteryCapacity ? parseFloat(vehicleRegistrationData.batteryCapacity) : undefined,
        purchaseDate: vehicleRegistrationData.purchaseDate || undefined,
        warrantyExpiry: vehicleRegistrationData.warrantyExpiry || undefined,
        nextMaintenanceDate: vehicleRegistrationData.nextMaintenanceDate || undefined,
        fuelEfficiency: vehicleRegistrationData.fuelEfficiency ? parseFloat(vehicleRegistrationData.fuelEfficiency) : undefined,
        notes: vehicleRegistrationData.notes || undefined,
      };

      const result = await adminApiService.createVehicle(requestData);
      
      // Check if the request was successful (no error thrown)
      toast({
        title: "Vehicle Registered Successfully",
        description: `Vehicle with license plate ${vehicleRegistrationData.licensePlate} has been registered to the system.`,
      });

        // Reset form
        setIsRegisterVehicleDialogOpen(false);
        setSelectedModelForRegistration("");
        setVehicleRegistrationData({
          licensePlate: "",
          vinNumber: "",
          color: "",
          year: new Date().getFullYear().toString(),
          batteryCapacity: "",
          batteryLevel: "100",
          mileage: "0",
          condition: "excellent",
          purchaseDate: "",
          warrantyExpiry: "",
          insuranceExpiry: "",
          lastMaintenanceDate: "",
          inspectionDate: "",
          nextMaintenanceDate: "",
          fuelEfficiency: "",
          notes: "",
          location: "",
        });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    toast({
      title: "Vehicle Deleted",
      description: `Vehicle ${vehicleId} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const handleEditVehicle = (vehicleId: string) => {
    toast({
      title: "Edit Vehicle",
      description: `Editing vehicle ${vehicleId} - Feature in development`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("common.accessDenied")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("common.adminAccessRequired")}
          </p>
        </div>
      </div>
    );
  }

  // Mock data for admin dashboard
  const systemData = {
    overview: {
      totalRevenue: 125300,
      totalRentals: 2847,
      activeUsers: 1234,
      totalVehicles: 89,
      monthlyGrowth: 12.5,
    },
    stations: [
      {
        id: "ST001",
        name: "District 1 Station",
        vehicles: 22,
        staff: 4,
        revenue: 45600,
        utilization: 78,
      },
      {
        id: "ST002",
        name: "District 3 Station",
        vehicles: 18,
        staff: 3,
        revenue: 32100,
        utilization: 65,
      },
      {
        id: "ST003",
        name: "Thu Duc Station",
        vehicles: 25,
        staff: 5,
        revenue: 47600,
        utilization: 82,
      },
      {
        id: "ST004",
        name: "Binh Thanh Station",
        vehicles: 24,
        staff: 4,
        revenue: 38900,
        utilization: 71,
      },
    ],
    customers: [
      {
        id: "CU001",
        name: "Nguyen Van A",
        email: "nguyenvana@email.com",
        rentals: 15,
        spent: 2340,
        risk: "low",
        status: "active",
      },
      {
        id: "CU002",
        name: "Tran Thi B",
        email: "tranthib@email.com",
        rentals: 8,
        spent: 1200,
        risk: "low",
        status: "active",
      },
      {
        id: "CU003",
        name: "Le Van C",
        email: "levanc@email.com",
        rentals: 3,
        spent: 450,
        risk: "medium",
        status: "suspended",
      },
      {
        id: "CU004",
        name: "Pham Thi D",
        email: "phamthid@email.com",
        rentals: 22,
        spent: 3200,
        risk: "high",
        status: "flagged",
      },
    ],
    staff: [
      {
        id: "SF001",
        name: "Hoang Van E",
        station: "District 1 Station",
        role: "staff",
        performance: 95,
        checkouts: 145,
      },
      {
        id: "SF002",
        name: "Vo Thi F",
        station: "District 3 Station",
        role: "staff",
        performance: 88,
        checkouts: 132,
      },
      {
        id: "SF003",
        name: "Dang Van G",
        station: "Thu Duc Station",
        role: "supervisor",
        performance: 92,
        checkouts: 89,
      },
      {
        id: "SF004",
        name: "Bui Thi H",
        station: "Binh Thanh Station",
        role: "staff",
        performance: 90,
        checkouts: 156,
      },
    ],
  };

  const revenueData = [
    { month: "Jan", revenue: 85000, rentals: 520 },
    { month: "Feb", revenue: 92000, rentals: 580 },
    { month: "Mar", revenue: 108000, rentals: 640 },
    { month: "Apr", revenue: 125300, rentals: 720 },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-success-light rounded-full">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${systemData.overview.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.totalRevenue")}
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
                  {systemData.overview.totalRentals.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.totalRentals")}
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
                  {systemData.overview.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.activeUsers")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-warning-light rounded-full">
                <Building className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {systemData.overview.totalVehicles}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.fleetSize")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-accent-light rounded-full">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  +{systemData.overview.monthlyGrowth}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.monthlyGrowth")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue and rental statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div
                  key={data.month}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {data.rentals} rentals
                    </span>
                    <span className="font-bold">
                      ${data.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Station Performance</CardTitle>
            <CardDescription>
              Top performing stations this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemData.stations
                .sort((a, b) => b.revenue - a.revenue)
                .map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{station.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {station.vehicles} vehicles
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${station.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {station.utilization}% utilization
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStationManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("common.stationManagement")}</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddStation}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Station
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Station Overview</CardTitle>
          <CardDescription>
            Monitor all rental stations and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fleet Size</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemData.stations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      Ho Chi Minh City
                    </div>
                  </TableCell>
                  <TableCell>{station.vehicles} vehicles</TableCell>
                  <TableCell>{station.staff} members</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        station.utilization > 75 ? "default" : "secondary"
                      }
                    >
                      {station.utilization}%
                    </Badge>
                  </TableCell>
                  <TableCell>${station.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStation(station)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStation(station)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("common.customerManagement")}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>
            Manage customer profiles and rental history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Rentals</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemData.customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{customer.rentals}</TableCell>
                  <TableCell>${customer.spent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.risk === "low"
                          ? "default"
                          : customer.risk === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {customer.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "active"
                          ? "default"
                          : customer.status === "suspended"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {customer.status === "flagged" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspendCustomer(customer)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("common.staffManagement")}</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddStaff}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
          <CardDescription>
            Monitor staff performance and productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Monthly Checkouts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemData.staff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.station}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            staff.performance >= 90
                              ? "bg-success"
                              : staff.performance >= 80
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${staff.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {staff.performance}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{staff.checkouts}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStaff(staff)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStaff(staff)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t("common.reportsAndAnalytics")}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>
              Rental patterns throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>8:00 - 10:00 AM</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <span className="text-sm">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>6:00 - 8:00 PM</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <span className="text-sm">78%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>12:00 - 2:00 PM</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <span className="text-sm">65%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Demand Forecast</CardTitle>
            <CardDescription>Predicted demand for next month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {t("common.highDemandExpected")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  +22% increase expected in District 1 and Thu Duc stations
                  during weekends
                </p>
              </div>
              <div className="p-4 bg-warning-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-warning" />
                  <span className="font-semibold">
                    Fleet Expansion Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consider adding 5-7 more vehicles to meet projected demand
                </p>
              </div>
              <div className="p-4 bg-info-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-info" />
                  <span className="font-semibold">
                    {t("common.optimalOperatingHours")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  7:00 AM - 10:00 PM provides 94% demand coverage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVehicleManagement = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Fleet Management</h2>
          <p className="text-muted-foreground">
            Register and manage all vehicles in the system
          </p>
        </div>
        <Button
          onClick={() => setIsRegisterVehicleDialogOpen(true)}
          className="bg-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Across all stations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter((v) => v.status === "available").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for rental</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Rented
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter((v) => v.status === "rented").length}
            </div>
            <p className="text-xs text-muted-foreground">Out with customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Under Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter((v) => v.status === "maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground">Being serviced</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Models Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Models in Fleet</CardTitle>
          <CardDescription>
            Overview of different vehicle models registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getVehicleModels().map((model) => {
              const modelVehicles = vehicles.filter(
                (v) => v.modelId === model.modelId
              );
              return (
                <Card key={model.modelId} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{model.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Total Units:</span>
                        <span className="font-medium text-foreground">
                          {modelVehicles.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Available:</span>
                        <span className="font-medium text-green-600">
                          {
                            modelVehicles.filter(
                              (v) => v.status === "available"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rented:</span>
                        <span className="font-medium text-blue-600">
                          {
                            modelVehicles.filter((v) => v.status === "rented")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Vehicles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Registered Vehicles</CardTitle>
              <CardDescription>
                Complete list of vehicles in the system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search vehicles..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Price/Hour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles
                .filter(
                  (vehicle) =>
                    vehicle.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    vehicle.uniqueVehicleId
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .slice(0, 10)
                .map((vehicle) => {
                  const station = stations.find(
                    (s) => s.id === vehicle.stationId
                  );
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.uniqueVehicleId}
                      </TableCell>
                      <TableCell>{vehicle.name}</TableCell>
                      <TableCell>{station?.name || "Unassigned"}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4" />
                          <span>100%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        ₫{vehicle.pricePerHour.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditVehicle(vehicle.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
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
                  {t("common.adminDashboard")}
                </h1>
                <p className="text-xl text-white/90 mb-2">
                  {t("common.evRentalsManagementSystem")}
                </p>
                <p className="text-white/80">
                  {t("common.welcomeUser")}, {user.name}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SlideIn direction="bottom" delay={200}>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="stations">{t("nav.stations")}</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <FadeIn delay={300}>{renderOverview()}</FadeIn>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-6">
                <FadeIn delay={300}>{renderVehicleManagement()}</FadeIn>
              </TabsContent>

              <TabsContent value="stations" className="mt-6">
                <FadeIn delay={300}>{renderStationManagement()}</FadeIn>
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                <FadeIn delay={300}>{renderCustomerManagement()}</FadeIn>
              </TabsContent>

              <TabsContent value="staff" className="mt-6">
                <FadeIn delay={300}>{renderStaffManagement()}</FadeIn>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <FadeIn delay={300}>{renderReportsAnalytics()}</FadeIn>
              </TabsContent>
            </Tabs>
          </SlideIn>
        </div>

        {/* Dialog Components */}
        <Dialog
          open={isStationDialogOpen}
          onOpenChange={setIsStationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Station Details</DialogTitle>
              <DialogDescription>
                View detailed information about {selectedStation?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="text-sm">
                <strong>Station ID:</strong> {selectedStation?.id}
                <br />
                <strong>Name:</strong> {selectedStation?.name}
                <br />
                <strong>Vehicles:</strong> {selectedStation?.vehicles}
                <br />
                <strong>Staff:</strong> {selectedStation?.staff}
                <br />
                <strong>Revenue:</strong> $
                {selectedStation?.revenue?.toLocaleString()}
                <br />
                <strong>Utilization:</strong> {selectedStation?.utilization}%
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStationDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCustomerDialogOpen}
          onOpenChange={setIsCustomerDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                View detailed information about {selectedCustomer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="text-sm">
                <strong>Customer ID:</strong> {selectedCustomer?.id}
                <br />
                <strong>Name:</strong> {selectedCustomer?.name}
                <br />
                <strong>Email:</strong> {selectedCustomer?.email}
                <br />
                <strong>Total Rentals:</strong> {selectedCustomer?.rentals}
                <br />
                <strong>Total Spent:</strong> ${selectedCustomer?.spent}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCustomerDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Staff Member Details</DialogTitle>
              <DialogDescription>
                View detailed information about {selectedStaff?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="text-sm">
                <strong>Staff ID:</strong> {selectedStaff?.id}
                <br />
                <strong>Name:</strong> {selectedStaff?.name}
                <br />
                <strong>Station:</strong> {selectedStaff?.station}
                <br />
                <strong>Performance:</strong> {selectedStaff?.performance}%
                <br />
                <strong>Checkouts:</strong> {selectedStaff?.checkouts}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStaffDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Register Vehicle Dialog - Comprehensive Form */}
        <Dialog
          open={isRegisterVehicleDialogOpen}
          onOpenChange={setIsRegisterVehicleDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Car className="h-6 w-6" />
                Register New Vehicle
              </DialogTitle>
              <DialogDescription>
                Complete vehicle registration form. Fill in all required details
                to add a new vehicle to the system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Section 1: Model Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Car className="h-5 w-5" />
                  <h3>Vehicle Model</h3>
                </div>
                <Separator />

                <div>
                  <Label htmlFor="modelSelect" className="text-base">
                    Select Model *
                  </Label>
                  <select
                    id="modelSelect"
                    value={selectedModelForRegistration}
                    onChange={(e) =>
                      setSelectedModelForRegistration(e.target.value)
                    }
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background mt-2 text-base"
                  >
                    <option value="">-- Choose a Vehicle Model --</option>
                    {getVehicleModels().map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.name} • {model.type} • {model.specs.seats} seats
                        • ₫{model.pricePerHour.toLocaleString()}/hr
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Preview */}
                {selectedModelForRegistration &&
                  (() => {
                    const model = getVehicleModels().find(
                      (m) => m.modelId === selectedModelForRegistration
                    );
                    return model ? (
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                              <img
                                src={model.image}
                                alt={model.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-bold text-lg">
                                {model.name}
                              </h4>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Zap className="h-4 w-4 text-primary" />
                                  <span>{model.specs.range} km</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span>{model.specs.seats} seats</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Gauge className="h-4 w-4 text-primary" />
                                  {/* @ts-expect-error - topSpeed may not exist on specs */}
                                  <span>
                                    {model.specs.topSpeed || 180} km/h
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Battery className="h-4 w-4 text-primary" />
                                  {/* @ts-expect-error - chargingTime may not exist on specs */}
                                  <span>
                                    {model.specs.chargingTime || "Fast"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  <span>
                                    ₫{model.pricePerHour.toLocaleString()}/hr
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}
              </div>

              {/* Section 2: Vehicle Identification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  <h3>Vehicle Identification</h3>
                </div>
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licensePlate" className="text-base">
                      License Plate Number *
                    </Label>
                    <Input
                      id="licensePlate"
                      value={vehicleRegistrationData.licensePlate}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          licensePlate: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g., 51A-12345"
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vinNumber" className="text-base">
                      VIN (Vehicle Identification Number) *
                    </Label>
                    <Input
                      id="vinNumber"
                      value={vehicleRegistrationData.vinNumber}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          vinNumber: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="17-character VIN"
                      maxLength={17}
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color" className="text-base">
                      Vehicle Color
                    </Label>
                    <Input
                      id="color"
                      value={vehicleRegistrationData.color}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          color: e.target.value,
                        })
                      }
                      placeholder="e.g., White, Black, Blue"
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="year" className="text-base">
                      Manufacturing Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={vehicleRegistrationData.year}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          year: e.target.value,
                        })
                      }
                      min="2020"
                      max={new Date().getFullYear() + 1}
                      className="mt-2 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Battery & Condition */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Battery className="h-5 w-5" />
                  <h3>Battery & Current Status</h3>
                </div>
                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="batteryCapacity" className="text-base">
                      Battery Capacity (kWh)
                    </Label>
                    <Input
                      id="batteryCapacity"
                      type="number"
                      value={vehicleRegistrationData.batteryCapacity}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          batteryCapacity: e.target.value,
                        })
                      }
                      placeholder="e.g., 42"
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="batteryLevel" className="text-base">
                      Current Battery Level (%)
                    </Label>
                    <Input
                      id="batteryLevel"
                      type="number"
                      min="0"
                      max="100"
                      value={vehicleRegistrationData.batteryLevel}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          batteryLevel: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mileage" className="text-base">
                      Current Mileage (km)
                    </Label>
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      value={vehicleRegistrationData.mileage}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          mileage: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fuelEfficiency" className="text-base">
                      Fuel Efficiency (km/kWh)
                    </Label>
                    <Input
                      id="fuelEfficiency"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g., 5.2"
                      value={vehicleRegistrationData.fuelEfficiency}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          fuelEfficiency: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="condition" className="text-base">
                    Vehicle Condition
                  </Label>
                  <select
                    id="condition"
                    value={vehicleRegistrationData.condition}
                    onChange={(e) =>
                      setVehicleRegistrationData({
                        ...vehicleRegistrationData,
                        condition: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background mt-2 text-base"
                  >
                    <option value="excellent">✅ Excellent - Brand New</option>
                    <option value="good">👍 Good - Well Maintained</option>
                    <option value="fair">⚠️ Fair - Minor Issues</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Important Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  <h3>Important Dates & Documentation</h3>
                </div>
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate" className="text-base">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={vehicleRegistrationData.purchaseDate}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          purchaseDate: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="warrantyExpiry" className="text-base">
                      Warranty Expiry Date
                    </Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={vehicleRegistrationData.warrantyExpiry}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          warrantyExpiry: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceExpiry" className="text-base">
                      Insurance Expiry Date
                    </Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={vehicleRegistrationData.insuranceExpiry}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          insuranceExpiry: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastMaintenanceDate" className="text-base">
                      Last Maintenance Date
                    </Label>
                    <Input
                      id="lastMaintenanceDate"
                      type="date"
                      value={vehicleRegistrationData.lastMaintenanceDate}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          lastMaintenanceDate: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inspectionDate" className="text-base">
                      Inspection Date
                    </Label>
                    <Input
                      id="inspectionDate"
                      type="date"
                      value={vehicleRegistrationData.inspectionDate}
                      onChange={(e) =>
                        setVehicleRegistrationData({
                          ...vehicleRegistrationData,
                          inspectionDate: e.target.value,
                        })
                      }
                      className="mt-2 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nextMaintenanceDate" className="text-base">
                    Next Scheduled Maintenance
                  </Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    value={vehicleRegistrationData.nextMaintenanceDate}
                    onChange={(e) =>
                      setVehicleRegistrationData({
                        ...vehicleRegistrationData,
                        nextMaintenanceDate: e.target.value,
                      })
                    }
                    className="mt-2 text-base"
                  />
                </div>
              </div>

              {/* Section 5: Additional Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  <h3>Additional Information</h3>
                </div>
                <Separator />

                <div>
                  <Label htmlFor="notes" className="text-base">
                    Notes / Special Instructions
                  </Label>
                  <Textarea
                    id="notes"
                    value={vehicleRegistrationData.notes}
                    onChange={(e) =>
                      setVehicleRegistrationData({
                        ...vehicleRegistrationData,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Any additional information about this vehicle..."
                    rows={4}
                    className="mt-2 text-base"
                  />
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
                    <p className="font-semibold">
                      Important Registration Notes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        A unique vehicle ID will be generated automatically upon
                        registration
                      </li>
                      <li>
                        License plate and VIN must be unique in the system
                      </li>
                      <li>
                        Vehicle will be initially set to "available" status
                      </li>
                      <li>
                        Staff can later assign this vehicle to their stations
                      </li>
                      <li>
                        All date fields help track maintenance and compliance
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRegisterVehicleDialogOpen(false);
                  setSelectedModelForRegistration("");
                  setVehicleRegistrationData({
                    licensePlate: "",
                    vinNumber: "",
                    color: "",
                    year: new Date().getFullYear().toString(),
                    batteryCapacity: "",
                    batteryLevel: "100",
                    mileage: "0",
                    condition: "excellent",
                    purchaseDate: "",
                    warrantyExpiry: "",
                    insuranceExpiry: "",
                    lastMaintenanceDate: "",
                    inspectionDate: "",
                    nextMaintenanceDate: "",
                    notes: "",
                    location: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegisterVehicle}
                disabled={
                  !selectedModelForRegistration ||
                  !vehicleRegistrationData.licensePlate ||
                  !vehicleRegistrationData.vinNumber
                }
                className="bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
