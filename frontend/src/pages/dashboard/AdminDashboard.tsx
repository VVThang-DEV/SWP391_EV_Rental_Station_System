import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";
import { getVehicleModels } from "@/lib/vehicle-station-utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { apiService, Station } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { adminApiService, AdminCreateVehicleRequest } from "../../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [customerEditData, setCustomerEditData] = useState({
    fullName: "",
    phone: "",
    address: "",
    isActive: true,
  });
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    stationId: "",
    role: "staff",
  });
  const [staffEditData, setStaffEditData] = useState({
    fullName: "",
    phone: "",
    stationId: "",
    role: "staff",
    isActive: true,
  });

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

  // API Data States
  const [apiStations, setApiStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  // Analytics States
  const [overallAnalytics, setOverallAnalytics] = useState<any>(null);
  const [overallLoading, setOverallLoading] = useState(false);
  const [overallPeriod, setOverallPeriod] = useState<"month" | "quarter">("month");
  const [overallYear, setOverallYear] = useState(new Date().getFullYear());
  const [overallMonth, setOverallMonth] = useState(new Date().getMonth() + 1);
  const [overallQuarter, setOverallQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));

  const [selectedStationForAnalytics, setSelectedStationForAnalytics] = useState<number | null>(null);
  const [stationAnalytics, setStationAnalytics] = useState<any>(null);
  const [stationLoading, setStationLoading] = useState(false);
  const [stationPeriod, setStationPeriod] = useState<"month" | "quarter">("month");
  const [stationYear, setStationYear] = useState(new Date().getFullYear());
  const [stationMonth, setStationMonth] = useState(new Date().getMonth() + 1);
  const [stationQuarter, setStationQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));

  // Edit Station Dialog States
  const [isEditStationDialogOpen, setIsEditStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationEditData, setStationEditData] = useState({
    name: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    status: "active",
    totalSlots: "",
    amenities: "",
    rating: "",
    operatingHours: "",
    fastCharging: false,
    image: "",
  });

  const { toast } = useToast();
  const { t } = useTranslation();

  // Load customers data
  useEffect(() => {
    const loadCustomers = async () => {
      if (selectedTab === "customers") {
        try {
          setCustomersLoading(true);
          setCustomersError(null);
          const result = await adminApiService.getCustomers();
          if (result.success && result.customers) {
            setCustomers(result.customers);
          }
        } catch (error) {
          setCustomersError(error instanceof Error ? error.message : 'Failed to load customers');
          console.error("Failed to load customers:", error);
        } finally {
          setCustomersLoading(false);
        }
      }
    };

    loadCustomers();
  }, [selectedTab]);

  // Load staff data
  useEffect(() => {
    const loadStaff = async () => {
      if (selectedTab === "staff") {
        try {
          setStaffLoading(true);
          setStaffError(null);
          const result = await adminApiService.getStaff();
          if (result.success && result.staff) {
            setStaff(result.staff);
          }
        } catch (error) {
          setStaffError(error instanceof Error ? error.message : 'Failed to load staff');
          console.error("Failed to load staff:", error);
        } finally {
          setStaffLoading(false);
        }
      }
    };

    loadStaff();
  }, [selectedTab]);

  // Load stations data on component mount
  useEffect(() => {
    const loadStations = async () => {
      setStationsLoading(true);
      setStationsError(null);
      try {
        const stations = await apiService.getStations();
        setApiStations(stations);
      } catch (error) {
        setStationsError(error instanceof Error ? error.message : 'Failed to load stations');
      } finally {
        setStationsLoading(false);
      }
    };

    loadStations();
  }, []);

  // Helper function to format revenue in millions
  const formatRevenueInMillions = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} nghìn`;
    }
    return value.toLocaleString();
  };

  // Helper function for YAxis tick formatter
  const formatYAxisRevenue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Mock data generator for testing
  const generateMockOverallAnalytics = () => {
    const breakdown: any[] = [];
    const hourlyStats: any[] = [];
    
    if (overallPeriod === "month") {
      // Generate daily data for the month
      const daysInMonth = new Date(overallYear, overallMonth, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        breakdown.push({
          period: `${overallYear}-${String(overallMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          renters: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000000) + 1000000,
          hours: Math.floor(Math.random() * 200) + 50,
        });
      }
    } else {
      // Generate monthly data for the quarter
      const startMonth = (overallQuarter - 1) * 3 + 1;
      for (let month = startMonth; month < startMonth + 3; month++) {
        breakdown.push({
          period: `${overallYear}-${String(month).padStart(2, '0')}`,
          renters: Math.floor(Math.random() * 200) + 50,
          revenue: Math.floor(Math.random() * 20000000) + 5000000,
          hours: Math.floor(Math.random() * 1000) + 300,
        });
      }
    }

    // Generate hourly stats (0-23 hours)
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.push({
        hour: hour,
        rentalCount: Math.floor(Math.random() * 30) + (hour >= 8 && hour <= 18 ? 20 : 5),
        totalHours: Math.floor(Math.random() * 100) + (hour >= 8 && hour <= 18 ? 50 : 10),
      });
    }

    const totalRenters = breakdown.reduce((sum, item) => sum + item.renters, 0);
    const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0);
    const totalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);

    return {
      success: true,
      summary: {
        uniqueRenters: Math.floor(totalRenters * 0.6), // Unique users (60% of total)
        revenue: totalRevenue,
        totalHours: totalHours,
        period: overallPeriod,
        year: overallYear,
        month: overallPeriod === "month" ? overallMonth : undefined,
        quarter: overallPeriod === "quarter" ? overallQuarter : undefined,
      },
      breakdown: breakdown,
      hourlyStats: hourlyStats,
    };
  };

  const generateMockStationAnalytics = (stationId: number) => {
    const breakdown: any[] = [];
    const hourlyStats: any[] = [];
    
    if (stationPeriod === "month") {
      // Generate daily data for the month
      const daysInMonth = new Date(stationYear, stationMonth, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        breakdown.push({
          period: `${stationYear}-${String(stationMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          renters: Math.floor(Math.random() * 20) + 3,
          revenue: Math.floor(Math.random() * 2000000) + 300000,
          hours: Math.floor(Math.random() * 80) + 15,
        });
      }
    } else {
      // Generate monthly data for the quarter
      const startMonth = (stationQuarter - 1) * 3 + 1;
      for (let month = startMonth; month < startMonth + 3; month++) {
        breakdown.push({
          period: `${stationYear}-${String(month).padStart(2, '0')}`,
          renters: Math.floor(Math.random() * 80) + 15,
          revenue: Math.floor(Math.random() * 8000000) + 1500000,
          hours: Math.floor(Math.random() * 400) + 100,
        });
      }
    }

    // Generate hourly stats (0-23 hours)
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.push({
        hour: hour,
        rentalCount: Math.floor(Math.random() * 15) + (hour >= 8 && hour <= 18 ? 8 : 2),
        totalHours: Math.floor(Math.random() * 50) + (hour >= 8 && hour <= 18 ? 25 : 5),
      });
    }

    const totalRenters = breakdown.reduce((sum, item) => sum + item.renters, 0);
    const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0);
    const totalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);

    return {
      success: true,
      stationId: stationId,
      summary: {
        uniqueRenters: Math.floor(totalRenters * 0.6),
        revenue: totalRevenue,
        totalHours: totalHours,
        period: stationPeriod,
        year: stationYear,
        month: stationPeriod === "month" ? stationMonth : undefined,
        quarter: stationPeriod === "quarter" ? stationQuarter : undefined,
      },
      breakdown: breakdown,
      hourlyStats: hourlyStats,
    };
  };

  // Load overall analytics
  useEffect(() => {
    const loadOverallAnalytics = async () => {
      setOverallLoading(true);
      try {
        const params: any = {
          period: overallPeriod,
          year: overallYear,
        };
        if (overallPeriod === "month") {
          params.month = overallMonth;
        } else {
          params.quarter = overallQuarter;
        }
        console.log("Loading overall analytics with params:", params);
        const data = await apiService.getOverallAnalytics(params);
        console.log("Analytics data received:", data);
        setOverallAnalytics(data);
      } catch (error: any) {
        console.error("Failed to load overall analytics:", error);
        const errorMessage = error?.message || error?.data?.message || "Failed to load analytics data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setOverallLoading(false);
      }
    };

    if (selectedTab === "analytics") {
      loadOverallAnalytics();
    }
  }, [overallPeriod, overallYear, overallMonth, overallQuarter, selectedTab, toast]);

  // Load station analytics
  useEffect(() => {
    const loadStationAnalytics = async () => {
      if (!selectedStationForAnalytics) return;

      setStationLoading(true);
      try {
        const params: any = {
          period: stationPeriod,
          year: stationYear,
        };
        if (stationPeriod === "month") {
          params.month = stationMonth;
        } else {
          params.quarter = stationQuarter;
        }
        console.log("Loading station analytics with params:", { stationId: selectedStationForAnalytics, ...params });
        const data = await apiService.getStationAnalytics(selectedStationForAnalytics, params);
        console.log("Station analytics data received:", data);
        setStationAnalytics(data);
      } catch (error: any) {
        console.error("Failed to load station analytics:", error);
        const errorMessage = error?.message || error?.data?.message || "Failed to load station analytics data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setStationLoading(false);
      }
    };

    if (selectedTab === "analytics" && selectedStationForAnalytics) {
      loadStationAnalytics();
    }
  }, [selectedStationForAnalytics, stationPeriod, stationYear, stationMonth, stationQuarter, selectedTab, toast]);

  const handleViewStation = (station: Station) => {
    setSelectedStation(station);
    setIsStationDialogOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setStationEditData({
      name: station.name,
      address: station.address,
      city: station.city,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      status: station.status,
      totalSlots: station.totalSlots.toString(),
      amenities: station.amenities,
      rating: station.rating.toString(),
      operatingHours: station.operatingHours,
      fastCharging: station.fastCharging,
      image: station.image,
    });
    setIsEditStationDialogOpen(true);
  };

  const handleSaveStationEdit = async () => {
    if (!editingStation) return;

    try {
      const updateData = {
        name: stationEditData.name,
        address: stationEditData.address,
        city: stationEditData.city,
        latitude: parseFloat(stationEditData.latitude),
        longitude: parseFloat(stationEditData.longitude),
        status: stationEditData.status,
        totalSlots: parseInt(stationEditData.totalSlots),
        amenities: stationEditData.amenities,
        rating: parseFloat(stationEditData.rating),
        operatingHours: stationEditData.operatingHours,
        fastCharging: stationEditData.fastCharging,
        image: stationEditData.image,
      };

      await apiService.updateStation(editingStation.stationId, updateData);
      
      // Refresh stations data
      const stations = await apiService.getStations();
      setApiStations(stations);

      toast({
        title: "Success",
        description: "Station updated successfully",
      });

      setIsEditStationDialogOpen(false);
      setEditingStation(null);
    } catch (error) {
      console.error('Error updating station:', error);
      toast({
        title: "Error",
        description: "Failed to update station",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewCustomer = async (customer: any) => {
    try {
      // Load full customer details from API
      const result = await adminApiService.getCustomerById(customer.userId);
      if (result.success && result.customer) {
        setSelectedCustomer(result.customer);
        setIsCustomerDialogOpen(true);
      } else {
        // Fallback to basic customer data
        setSelectedCustomer(customer);
        setIsCustomerDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load customer details:", error);
      // Fallback to basic customer data
      setSelectedCustomer(customer);
      setIsCustomerDialogOpen(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditCustomer = async (customer: any) => {
    try {
      // Load full customer details
      const result = await adminApiService.getCustomerById(customer.userId);
      if (result.success && result.customer) {
        setEditingCustomer(result.customer);
        setCustomerEditData({
          fullName: result.customer.name || "",
          phone: result.customer.phone || "",
          address: result.customer.address || "",
          isActive: result.customer.status === "active",
        });
        setIsEditCustomerDialogOpen(true);
      } else {
        // Fallback to basic customer data
        setEditingCustomer(customer);
        setCustomerEditData({
          fullName: customer.name || "",
          phone: customer.phone || "",
          address: "",
          isActive: customer.status === "active",
        });
        setIsEditCustomerDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load customer details:", error);
      // Fallback to basic customer data
      setEditingCustomer(customer);
      setCustomerEditData({
        fullName: customer.name || "",
        phone: customer.phone || "",
        address: "",
        isActive: customer.status === "active",
      });
      setIsEditCustomerDialogOpen(true);
    }
  };

  const handleSaveCustomerEdit = async () => {
    if (!editingCustomer) return;

    try {
      await adminApiService.updateCustomer(editingCustomer.userId, {
        fullName: customerEditData.fullName,
        phone: customerEditData.phone,
        address: customerEditData.address,
        isActive: customerEditData.isActive,
      });

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      // Refresh customers list
      const result = await adminApiService.getCustomers();
      if (result.success && result.customers) {
        setCustomers(result.customers);
      }

      setIsEditCustomerDialogOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuspendCustomer = async (customer: any) => {
    try {
      await adminApiService.updateCustomer(customer.userId, {
        isActive: false,
      });

      toast({
        title: "Customer Suspended",
        description: `${customer.name} has been suspended and cannot make new bookings.`,
        variant: "destructive",
      });

      // Refresh customers list
      const result = await adminApiService.getCustomers();
      if (result.success && result.customers) {
        setCustomers(result.customers);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend customer",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewStaff = async (staff: any) => {
    try {
      // Load full staff details from API
      const result = await adminApiService.getStaffById(staff.userId);
      if (result.success && result.staff) {
        setSelectedStaff(result.staff);
        setIsStaffDialogOpen(true);
      } else {
        // Fallback to basic staff data
        setSelectedStaff(staff);
        setIsStaffDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load staff details:", error);
      // Fallback to basic staff data
      setSelectedStaff(staff);
      setIsStaffDialogOpen(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditStaff = async (staff: any) => {
    try {
      // Load full staff details
      const result = await adminApiService.getStaffById(staff.userId);
      if (result.success && result.staff) {
        setEditingStaff(result.staff);
        setStaffEditData({
          fullName: result.staff.name || "",
          phone: result.staff.phone || "",
          stationId: result.staff.stationId != null ? result.staff.stationId.toString() : "",
          role: result.staff.role || "staff",
          isActive: result.staff.isActive ?? true,
        });
        setIsEditStaffDialogOpen(true);
      } else {
        // Fallback to basic staff data
        setEditingStaff(staff);
        setStaffEditData({
          fullName: staff.name || "",
          phone: staff.phone || "",
          stationId: staff.stationId != null ? staff.stationId.toString() : "",
          role: staff.role || "staff",
          isActive: staff.isActive ?? true,
        });
        setIsEditStaffDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load staff details:", error);
      // Fallback to basic staff data
      setEditingStaff(staff);
      setStaffEditData({
        fullName: staff.name || "",
        phone: staff.phone || "",
        stationId: staff.stationId != null ? staff.stationId.toString() : "",
        role: staff.role || "staff",
        isActive: staff.isActive ?? true,
      });
      setIsEditStaffDialogOpen(true);
    }
  };

  const handleSaveStaffEdit = async () => {
    if (!editingStaff) return;

    try {
      const stationIdValue = staffEditData.stationId && staffEditData.stationId !== "" 
        ? parseInt(staffEditData.stationId) 
        : undefined;

      await adminApiService.updateStaff(editingStaff.userId, {
        fullName: staffEditData.fullName,
        phone: staffEditData.phone,
        stationId: stationIdValue,
        role: staffEditData.role,
        isActive: staffEditData.isActive,
      });

      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });

      // Refresh staff list
      const result = await adminApiService.getStaff();
      if (result.success && result.staff) {
        setStaff(result.staff);
      }

      setIsEditStaffDialogOpen(false);
      setEditingStaff(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleAddStation = () => {
    toast({
      title: "Add Station",
      description: "Add new station feature - In development",
    });
  };

  const handleAddStaff = () => {
    setStaffFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      stationId: "",
      role: "staff",
    });
    setIsAddStaffDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    try {
      if (!staffFormData.fullName || !staffFormData.email || !staffFormData.phone || !staffFormData.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const stationIdValue = staffFormData.stationId && staffFormData.stationId !== "" 
        ? parseInt(staffFormData.stationId) 
        : undefined;

      await adminApiService.createStaff({
        fullName: staffFormData.fullName,
        email: staffFormData.email,
        phone: staffFormData.phone,
        password: staffFormData.password,
        stationId: stationIdValue,
        role: staffFormData.role,
      });

      toast({
        title: "Success",
        description: "Staff member created successfully",
      });

      // Refresh staff list
      const result = await adminApiService.getStaff();
      if (result.success && result.staff) {
        setStaff(result.staff);
      }

      setIsAddStaffDialogOpen(false);
      setStaffFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        stationId: "",
        role: "staff",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create staff member",
        variant: "destructive",
      });
    }
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
          {stationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2">Loading stations...</span>
            </div>
          ) : stationsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading stations: {stationsError}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Available Vehicles</TableHead>
                  <TableHead>Total Slots</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiStations.map((station) => (
                  <TableRow key={station.stationId}>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {station.city}
                      </div>
                    </TableCell>
                    <TableCell>{station.availableVehicles} vehicles</TableCell>
                    <TableCell>{station.totalSlots} slots</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={station.totalSlots > 0 ? (station.availableVehicles / station.totalSlots) * 100 : 0} 
                          className="w-16" 
                        />
                        <span className="text-sm">
                          {station.totalSlots > 0 ? Math.round((station.availableVehicles / station.totalSlots) * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {station.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={station.status === 'active' ? "default" : "secondary"}
                      >
                        {station.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStation(station)}
                          title="View station details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStation(station)}
                          title="Edit station"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await apiService.updateStationAvailableVehicles(station.stationId);
                              const stations = await apiService.getStations();
                              setApiStations(stations);
                              toast({
                                title: "Success",
                                description: "Available vehicles count updated",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update available vehicles count",
                                variant: "destructive",
                              });
                            }
                          }}
                          title="Refresh available vehicles count"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
              {customersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading customers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : customersError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-destructive">
                    Error: {customersError}
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers
                  .filter((customer) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      customer.name?.toLowerCase().includes(query) ||
                      customer.email?.toLowerCase().includes(query) ||
                      customer.phone?.toLowerCase().includes(query)
                    );
                  })
                  .map((customer) => (
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
                  ))
              )}
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
              {staffLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading staff...
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-destructive">
                    Error: {staffError}
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-medium">{staffMember.name}</TableCell>
                    <TableCell>{staffMember.station}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{staffMember.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              staffMember.performance >= 90
                                ? "bg-success"
                                : staffMember.performance >= 80
                                ? "bg-warning"
                                : "bg-destructive"
                            }`}
                            style={{ width: `${staffMember.performance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {staffMember.performance}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{staffMember.checkouts}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStaff(staffMember)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStaff(staffMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsAnalytics = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t("common.reportsAndAnalytics")}
        </h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overall Analytics Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tổng Dữ Liệu Các Trạm</CardTitle>
                <CardDescription>
                  Thống kê tổng hợp từ tất cả các trạm
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={overallPeriod}
                  onValueChange={(value: "month" | "quarter") => setOverallPeriod(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Tháng</SelectItem>
                    <SelectItem value="quarter">Quý</SelectItem>
                  </SelectContent>
                </Select>
                {overallPeriod === "month" ? (
                  <>
                    <Input
                      type="number"
                      value={overallYear}
                      onChange={(e) => setOverallYear(parseInt(e.target.value))}
                      className="w-24"
                      placeholder="Năm"
                    />
                    <Select
                      value={overallMonth.toString()}
                      onValueChange={(value) => setOverallMonth(parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            Tháng {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Input
                      type="number"
                      value={overallYear}
                      onChange={(e) => setOverallYear(parseInt(e.target.value))}
                      className="w-24"
                      placeholder="Năm"
                    />
                    <Select
                      value={overallQuarter.toString()}
                      onValueChange={(value) => setOverallQuarter(parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((q) => (
                          <SelectItem key={q} value={q.toString()}>
                            Quý {q}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {overallLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : overallAnalytics ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Lượng Người Thuê</p>
                          <p className="text-2xl font-bold">{overallAnalytics.summary.uniqueRenters}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Doanh Thu</p>
                          <p className="text-2xl font-bold">
                            ₫{formatRevenueInMillions(overallAnalytics.summary.revenue)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tổng Giờ Thuê</p>
                          <p className="text-2xl font-bold">{overallAnalytics.summary.totalHours}h</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Renters Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu Đồ Lượng Người Thuê</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={overallAnalytics.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="renters" fill="#3b82f6" name="Người thuê" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overallAnalytics.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis tickFormatter={formatYAxisRevenue} />
                          <Tooltip formatter={(value: number) => `₫${formatRevenueInMillions(value)}`} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Doanh thu"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Rental Hours Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thống Kê Giờ Thuê Theo Giờ Trong Ngày</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={overallAnalytics.hourlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" label={{ value: "Giờ", position: "insideBottom" }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rentalCount" fill="#8b5cf6" name="Số lượt thuê" />
                        <Bar dataKey="totalHours" fill="#f59e0b" name="Tổng giờ" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per Station Analytics Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thống Kê Từng Trạm</CardTitle>
                <CardDescription>
                  Xem thống kê chi tiết cho từng trạm
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedStationForAnalytics?.toString() || ""}
                  onValueChange={(value) => setSelectedStationForAnalytics(parseInt(value))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Chọn trạm" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiStations.map((station) => (
                      <SelectItem key={station.stationId} value={station.stationId.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStationForAnalytics && (
                  <>
                    <Select
                      value={stationPeriod}
                      onValueChange={(value: "month" | "quarter") => setStationPeriod(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Tháng</SelectItem>
                        <SelectItem value="quarter">Quý</SelectItem>
                      </SelectContent>
                    </Select>
                    {stationPeriod === "month" ? (
                      <>
                        <Input
                          type="number"
                          value={stationYear}
                          onChange={(e) => setStationYear(parseInt(e.target.value))}
                          className="w-24"
                          placeholder="Năm"
                        />
                        <Select
                          value={stationMonth.toString()}
                          onValueChange={(value) => setStationMonth(parseInt(value))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                              <SelectItem key={m} value={m.toString()}>
                                Tháng {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          value={stationYear}
                          onChange={(e) => setStationYear(parseInt(e.target.value))}
                          className="w-24"
                          placeholder="Năm"
                        />
                        <Select
                          value={stationQuarter.toString()}
                          onValueChange={(value) => setStationQuarter(parseInt(value))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map((q) => (
                              <SelectItem key={q} value={q.toString()}>
                                Quý {q}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedStationForAnalytics ? (
              <div className="text-center py-12 text-muted-foreground">
                Vui lòng chọn một trạm để xem thống kê
              </div>
            ) : stationLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : stationAnalytics ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Lượng Người Thuê</p>
                          <p className="text-2xl font-bold">{stationAnalytics.summary.uniqueRenters}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Doanh Thu</p>
                          <p className="text-2xl font-bold">
                            ₫{formatRevenueInMillions(stationAnalytics.summary.revenue)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tổng Giờ Thuê</p>
                          <p className="text-2xl font-bold">{stationAnalytics.summary.totalHours}h</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Renters Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu Đồ Lượng Người Thuê</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stationAnalytics.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="renters" fill="#3b82f6" name="Người thuê" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stationAnalytics.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis tickFormatter={formatYAxisRevenue} />
                          <Tooltip formatter={(value: number) => `₫${formatRevenueInMillions(value)}`} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Doanh thu"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Rental Hours Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thống Kê Giờ Thuê Theo Giờ Trong Ngày</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stationAnalytics.hourlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" label={{ value: "Giờ", position: "insideBottom" }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rentalCount" fill="#8b5cf6" name="Số lượt thuê" />
                        <Bar dataKey="totalHours" fill="#f59e0b" name="Tổng giờ" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
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
              <div className="text-sm space-y-2">
                <div><strong>Station ID:</strong> {selectedStation?.stationId}</div>
                <div><strong>Name:</strong> {selectedStation?.name}</div>
                <div><strong>Address:</strong> {selectedStation?.address}</div>
                <div><strong>City:</strong> {selectedStation?.city}</div>
                <div><strong>Available Vehicles:</strong> {selectedStation?.availableVehicles}</div>
                <div><strong>Total Slots:</strong> {selectedStation?.totalSlots}</div>
                <div><strong>Utilization:</strong> {selectedStation?.totalSlots > 0 ? Math.round((selectedStation?.availableVehicles / selectedStation?.totalSlots) * 100) : 0}%</div>
                <div><strong>Rating:</strong> {selectedStation?.rating}/5</div>
                <div><strong>Status:</strong> {selectedStation?.status}</div>
                <div><strong>Operating Hours:</strong> {selectedStation?.operatingHours}</div>
                <div><strong>Fast Charging:</strong> {selectedStation?.fastCharging ? 'Yes' : 'No'}</div>
                <div><strong>Amenities:</strong> {selectedStation?.amenities}</div>
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
              <div className="text-sm space-y-2">
                <p>
                  <strong>Customer ID:</strong> {selectedCustomer?.id || selectedCustomer?.userId}
                </p>
                <p>
                  <strong>Name:</strong> {selectedCustomer?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedCustomer?.email}
                </p>
                {selectedCustomer?.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedCustomer.phone}
                  </p>
                )}
                {selectedCustomer?.address && (
                  <p>
                    <strong>Address:</strong> {selectedCustomer.address}
                  </p>
                )}
                {selectedCustomer?.cccd && (
                  <p>
                    <strong>CCCD:</strong> {selectedCustomer.cccd}
                  </p>
                )}
                {selectedCustomer?.licenseNumber && (
                  <p>
                    <strong>License Number:</strong> {selectedCustomer.licenseNumber}
                  </p>
                )}
                <p>
                  <strong>Total Rentals:</strong> {selectedCustomer?.rentals || 0}
                </p>
                <p>
                  <strong>Total Spent:</strong> ${(selectedCustomer?.spent || 0).toLocaleString()}
                </p>
                {selectedCustomer?.walletBalance !== undefined && (
                  <p>
                    <strong>Wallet Balance:</strong> ${selectedCustomer.walletBalance.toLocaleString()}
                  </p>
                )}
                {selectedCustomer?.totalReservations !== undefined && (
                  <p>
                    <strong>Total Reservations:</strong> {selectedCustomer.totalReservations}
                  </p>
                )}
                {selectedCustomer?.cancelledCount !== undefined && (
                  <p>
                    <strong>Cancelled Reservations:</strong> {selectedCustomer.cancelledCount}
                  </p>
                )}
                {selectedCustomer?.lateReturnsCount !== undefined && (
                  <p>
                    <strong>Late Returns:</strong> {selectedCustomer.lateReturnsCount}
                  </p>
                )}
                {selectedCustomer?.damagesCount !== undefined && (
                  <p>
                    <strong>Damages Reported:</strong> {selectedCustomer.damagesCount}
                  </p>
                )}
                <p>
                  <strong>Risk Level:</strong>{" "}
                  <Badge
                    variant={
                      selectedCustomer?.risk === "low"
                        ? "default"
                        : selectedCustomer?.risk === "medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedCustomer?.risk || "low"}
                  </Badge>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={
                      selectedCustomer?.status === "active"
                        ? "default"
                        : selectedCustomer?.status === "suspended"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedCustomer?.status || "active"}
                  </Badge>
                </p>
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

        {/* Edit Customer Dialog */}
        <Dialog
          open={isEditCustomerDialogOpen}
          onOpenChange={setIsEditCustomerDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>
                Update customer information for {editingCustomer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={customerEditData.fullName}
                  onChange={(e) =>
                    setCustomerEditData({
                      ...customerEditData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={customerEditData.phone}
                  onChange={(e) =>
                    setCustomerEditData({
                      ...customerEditData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={customerEditData.address}
                  onChange={(e) =>
                    setCustomerEditData({
                      ...customerEditData,
                      address: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={customerEditData.isActive ? "active" : "suspended"}
                  onValueChange={(value) =>
                    setCustomerEditData({
                      ...customerEditData,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditCustomerDialogOpen(false);
                  setEditingCustomer(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCustomerEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Staff Dialog */}
        <Dialog
          open={isAddStaffDialogOpen}
          onOpenChange={setIsAddStaffDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff member account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-fullName">Full Name *</Label>
                <Input
                  id="staff-fullName"
                  value={staffFormData.fullName}
                  onChange={(e) =>
                    setStaffFormData({
                      ...staffFormData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">Email *</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) =>
                    setStaffFormData({
                      ...staffFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-phone">Phone *</Label>
                <Input
                  id="staff-phone"
                  value={staffFormData.phone}
                  onChange={(e) =>
                    setStaffFormData({
                      ...staffFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-password">Password *</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={staffFormData.password}
                  onChange={(e) =>
                    setStaffFormData({
                      ...staffFormData,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-station">Station</Label>
                <Select
                  value={staffFormData.stationId || "none"}
                  onValueChange={(value) =>
                    setStaffFormData({
                      ...staffFormData,
                      stationId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger id="staff-station">
                    <SelectValue placeholder="Select a station (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unassigned)</SelectItem>
                    {apiStations && apiStations.length > 0 && apiStations.map((station) => (
                      <SelectItem key={station.stationId} value={station.stationId.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-role">Role *</Label>
                <Select
                  value={staffFormData.role}
                  onValueChange={(value) =>
                    setStaffFormData({
                      ...staffFormData,
                      role: value,
                    })
                  }
                >
                  <SelectTrigger id="staff-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddStaffDialogOpen(false);
                  setStaffFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    password: "",
                    stationId: "",
                    role: "staff",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveStaff}>Create Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Dialog */}
        <Dialog
          open={isEditStaffDialogOpen}
          onOpenChange={setIsEditStaffDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member information for {editingStaff?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-fullName">Full Name</Label>
                <Input
                  id="edit-staff-fullName"
                  value={staffEditData.fullName}
                  onChange={(e) =>
                    setStaffEditData({
                      ...staffEditData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-phone">Phone</Label>
                <Input
                  id="edit-staff-phone"
                  value={staffEditData.phone}
                  onChange={(e) =>
                    setStaffEditData({
                      ...staffEditData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-station">Station</Label>
                <Select
                  value={staffEditData.stationId || "none"}
                  onValueChange={(value) =>
                    setStaffEditData({
                      ...staffEditData,
                      stationId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger id="edit-staff-station">
                    <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unassigned)</SelectItem>
                    {apiStations && apiStations.length > 0 && apiStations.map((station) => (
                      <SelectItem key={station.stationId} value={station.stationId.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-role">Role</Label>
                <Select
                  value={staffEditData.role}
                  onValueChange={(value) =>
                    setStaffEditData({
                      ...staffEditData,
                      role: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-staff-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-status">Status</Label>
                <Select
                  value={staffEditData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setStaffEditData({
                      ...staffEditData,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger id="edit-staff-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditStaffDialogOpen(false);
                  setEditingStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveStaffEdit}>Save Changes</Button>
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
              <div className="text-sm space-y-2">
                <p>
                  <strong>Staff ID:</strong> {selectedStaff?.id || selectedStaff?.userId}
                </p>
                <p>
                  <strong>Name:</strong> {selectedStaff?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedStaff?.email}
                </p>
                {selectedStaff?.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedStaff.phone}
                  </p>
                )}
                <p>
                  <strong>Station:</strong> {selectedStaff?.station || "Unassigned"}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  <Badge variant="outline">{selectedStaff?.role}</Badge>
                </p>
                <p>
                  <strong>Performance:</strong>{" "}
                  <span
                    className={
                      selectedStaff?.performance >= 90
                        ? "text-success"
                        : selectedStaff?.performance >= 80
                        ? "text-warning"
                        : "text-destructive"
                    }
                  >
                    {selectedStaff?.performance || 0}%
                  </span>
                </p>
                <p>
                  <strong>Monthly Checkouts:</strong> {selectedStaff?.checkouts || 0}
                </p>
                {selectedStaff?.totalHandovers !== undefined && (
                  <p>
                    <strong>Total Handovers:</strong> {selectedStaff.totalHandovers}
                  </p>
                )}
                {selectedStaff?.confirmedReservations !== undefined && (
                  <p>
                    <strong>Confirmed Reservations:</strong> {selectedStaff.confirmedReservations}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={selectedStaff?.isActive ? "default" : "secondary"}
                  >
                    {selectedStaff?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
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
                    fuelEfficiency: "",
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

        {/* Edit Station Dialog */}
        <Dialog
          open={isEditStationDialogOpen}
          onOpenChange={setIsEditStationDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Station</DialogTitle>
              <DialogDescription>
                Update station information for {editingStation?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Station Name</Label>
                  <Input
                    id="edit-name"
                    value={stationEditData.name}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={stationEditData.city}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={stationEditData.address}
                  onChange={(e) =>
                    setStationEditData({
                      ...stationEditData,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={stationEditData.latitude}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        latitude: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={stationEditData.longitude}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        longitude: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={stationEditData.status}
                    onValueChange={(value) =>
                      setStationEditData({
                        ...stationEditData,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-total-slots">Total Slots</Label>
                  <Input
                    id="edit-total-slots"
                    type="number"
                    value={stationEditData.totalSlots}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        totalSlots: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-rating">Rating</Label>
                  <Input
                    id="edit-rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={stationEditData.rating}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        rating: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-operating-hours">Operating Hours</Label>
                  <Input
                    id="edit-operating-hours"
                    value={stationEditData.operatingHours}
                    onChange={(e) =>
                      setStationEditData({
                        ...stationEditData,
                        operatingHours: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-amenities">Amenities</Label>
                <Textarea
                  id="edit-amenities"
                  value={stationEditData.amenities}
                  onChange={(e) =>
                    setStationEditData({
                      ...stationEditData,
                      amenities: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={stationEditData.image}
                  onChange={(e) =>
                    setStationEditData({
                      ...stationEditData,
                      image: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-fast-charging"
                  checked={stationEditData.fastCharging}
                  onChange={(e) =>
                    setStationEditData({
                      ...stationEditData,
                      fastCharging: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="edit-fast-charging">Fast Charging Available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditStationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveStationEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
