import { useState, useEffect } from "react";
import { useStationVehicles, useStaffProfile, useStationInfo, usePendingVehicles } from "@/hooks/useStaffApi";
import { apiService, Vehicle, staffApiService } from "@/services/api";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle2,
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
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { stations } from "@/data/stations";
import { getVehicleModels } from "@/lib/vehicle-station-utils";
import StaffPickupManager from "@/components/StaffPickupManager";
import { WalkInBookingManager } from "@/components/walkin-booking";

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

  // API Hooks for Staff Dashboard
  const { data: staffProfile, loading: profileLoading, error: profileError } = useStaffProfile();
  const { data: stationInfo, loading: stationLoading, error: stationError } = useStationInfo();
  const { data: apiVehicles, updateVehicle, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useStationVehicles();
  const { data: pendingVehicles, loading: pendingVehiclesLoading, error: pendingVehiclesError, refetch: refetchPendingVehicles } = usePendingVehicles();
  
  // Pending customers state
  const [pendingCustomers, setPendingCustomers] = useState<any[]>([]);
  const [pendingCustomersLoading, setPendingCustomersLoading] = useState(false);
  const [pendingCustomersError, setPendingCustomersError] = useState<string | null>(null);
  
  // Reservations / Booking History state
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  // History filter state (reuse Wallet.tsx pattern)
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  
  // Payment history state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  
  // Debug API data
  console.log('Staff Profile:', staffProfile);
  console.log('Station Info:', stationInfo);
  console.log('API Vehicles:', apiVehicles);
  console.log('Pending Vehicles:', pendingVehicles);
  console.log('Pending Customers:', pendingCustomers);
  console.log('Vehicles Loading:', vehiclesLoading);
  console.log('Vehicles Error:', vehiclesError);
  console.log('Token:', localStorage.getItem('token'));

  // Fetch pending customers
  const fetchPendingCustomers = async () => {
    try {
      setPendingCustomersLoading(true);
      const customers = await staffApiService.getCustomersForVerification();
      setPendingCustomers(customers);
    } catch (error) {
      console.error('Error fetching pending customers:', error);
      setPendingCustomersError(error instanceof Error ? error.message : 'Failed to fetch customers');
    } finally {
      setPendingCustomersLoading(false);
    }
  };

  // Fetch today's activity logs
  const fetchActivityLogs = async () => {
    try {
      setActivityLogsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/staff/activities/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Activity Logs:', data);
        setActivityLogs(data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setActivityLogsLoading(false);
    }
  };

  // Fetch all reservations for booking history (from staff's station)
  const fetchReservations = async () => {
    try {
      setReservationsLoading(true);
      setReservationsError(null);
      const data = await staffApiService.getStationReservations();
      console.log('Station Reservations:', data);
      setReservations(data?.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservationsError(error instanceof Error ? error.message : 'Failed to fetch reservations');
    } finally {
      setReservationsLoading(false);
    }
  };

  // Fetch payment history for station
  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      setPaymentsError(null);
      const data = await staffApiService.getStationPayments();
      console.log('Station Payments:', data);
      setPayments(data?.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPaymentsError(error instanceof Error ? error.message : 'Failed to fetch payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCustomers();
    fetchActivityLogs();
    fetchReservations();
    fetchPayments();
  }, []);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<
    "nationalId_front" | "nationalId_back" | "driverLicense" | null
  >(null);
  const [isVerifyDocumentsOpen, setIsVerifyDocumentsOpen] = useState(false);
  const [selectedBookingForVerification, setSelectedBookingForVerification] = useState<string | null>(null);

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

  // Add Vehicle Dialog state
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [selectedModelToAdd, setSelectedModelToAdd] = useState("");
  const [unassignedVehicles, setUnassignedVehicles] = useState<Vehicle[]>([]);
  const [unassignedVehiclesLoading, setUnassignedVehiclesLoading] = useState(false);
  const [unassignedVehiclesError, setUnassignedVehiclesError] = useState<string | null>(null);
  const [newVehicleData, setNewVehicleData] = useState({
    batteryLevel: "100",
    condition: "excellent",
    mileage: "0",
  });

  // Vehicle Inspection Workflow state
  const [isPreRentalInspectionOpen, setIsPreRentalInspectionOpen] =
    useState(false);
  const [isPostRentalInspectionOpen, setIsPostRentalInspectionOpen] =
    useState(false);
  const [inspectingVehicleId, setInspectingVehicleId] = useState<string | null>(
    null
  );
  const [inspectionData, setInspectionData] = useState({
    batteryLevel: "",
    mileage: "",
    condition: "excellent",
    exteriorCondition: "good",
    interiorCondition: "good",
    tiresCondition: "good",
    notes: "",
    damages: [] as string[],
  });

  // Load unassigned vehicles when dialog opens
  useEffect(() => {
    if (isAddVehicleDialogOpen) {
      loadUnassignedVehicles();
    }
  }, [isAddVehicleDialogOpen]);

  const loadUnassignedVehicles = async () => {
    setUnassignedVehiclesLoading(true);
    setUnassignedVehiclesError(null);
    try {
      const vehicles = await apiService.getUnassignedVehicles();
      setUnassignedVehicles(vehicles);
    } catch (error) {
      console.error('Error loading unassigned vehicles:', error);
      setUnassignedVehiclesError(error instanceof Error ? error.message : 'Failed to load vehicles');
    } finally {
      setUnassignedVehiclesLoading(false);
    }
  };

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

  // Show loading while staff profile is loading
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  // Check if staff has station assigned
  if (!profileLoading && staffProfile && !staffProfile.stationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            No Station Assigned
          </h1>
          <p className="text-muted-foreground mb-6">
            Please contact administrator to assign a station to your account.
          </p>
        </div>
      </div>
    );
  }

  // Use provided user, but prefer API data for station info
  const currentUser = {
    ...user,
    stationId: staffProfile?.stationId?.toString() || user?.stationId
  };

  // Use API data for station information, fallback to mock data
  // Get station name from vehicles location instead of stationInfo
  const stationName = apiVehicles && apiVehicles.length > 0 ? apiVehicles[0].location : (stationInfo?.name || "");
  
  const stationData = {
    name: stationName,
    vehicles: {
      available: apiVehicles?.filter(v => v.status === 'available').length || 0,
      rented: apiVehicles?.filter(v => v.status === 'rented').length || 0,
      maintenance: apiVehicles?.filter(v => v.status === 'maintenance').length || 0,
      total: apiVehicles?.length || 0,
    },
    todayStats: {
      checkouts: 15, // TODO: Get from API
      checkins: 12, // TODO: Get from API
      revenue: 2340, // TODO: Get from API
      newCustomers: 3, // TODO: Get from API
    },
  };

  // Use API data for Vehicle Management, fallback to static data
  const vehicleList = apiVehicles ? apiVehicles.map(vehicle => ({
    id: vehicle.uniqueVehicleId || vehicle.vehicleId.toString(),
    name: `${vehicle.modelId} - ${vehicle.uniqueVehicleId || vehicle.vehicleId}`,
    status: vehicle.status,
    battery: vehicle.batteryLevel,
    location: vehicle.location || "Unknown",
    lastMaintenance: vehicle.lastMaintenance || "N/A",
    bookings: [],
    condition: vehicle.condition,
    mileage: vehicle.mileage,
    rating: vehicle.rating,
    trips: vehicle.trips,
    stationId: vehicle.stationId,
    type: "Unknown",
    year: 2024,
    seats: 5,
    range: vehicle.maxRangeKm,
    brand: "VinFast",
    model: vehicle.modelId,
    availability: vehicle.status,
    image: vehicle.image || "",
  })) : [
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

  // Only show pending customers (NO System Registration / pending vehicles)
  const pendingBookings = pendingCustomers.map((customer) => ({
    id: customer.reservationId?.toString() || customer.userId?.toString(),
    userId: customer.userId, // Add userId for API calls
    reservationId: customer.reservationId,
    customer: customer.fullName,
    customerInfo: customer,
    vehicle: customer.vehicleModel,
    registeredAt: customer.createdAt, // Use createdAt as "Registered" time
    pickupTime: customer.startTime,
    endTime: customer.endTime,
    phone: customer.phone,
    email: customer.email,
    cccd: customer.cccd,
    licenseNumber: customer.licenseNumber,
    hasDocuments: customer.hasDocuments,
    documents: customer.documents || [],
    licenseVerified: customer.documents?.some((d: any) => d.documentType === 'license' && d.status === 'approved') || false,
    documentsUploaded: customer.hasDocuments,
  }));

  const handleVehicleCheckout = async (vehicleId: string, bookingId?: string) => {
    try {
      // Find the booking to get customer ID
      const booking = pendingBookings.find(b => 
        (b.reservationId?.toString() === bookingId) || (b.id === bookingId)
      );
      
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Get customer ID from booking
      const customerId = booking.customerInfo.userId;
      
      if (!customerId) {
        throw new Error("Customer ID not found");
      }

      // Call verify customer API - this will update both reservation and vehicle status
      await staffApiService.verifyCustomer(customerId, {
        documentType: "all",
        status: "approved",
        notes: "Customer verified and checked out"
      });
      
      // Refresh both vehicle lists and pending customers
      await refetchVehicles();
      await refetchPendingVehicles();
      await fetchPendingCustomers();
      
      toast({
        title: "Vehicle Checked Out",
        description: `Vehicle has been successfully checked out.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to checkout vehicle",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleVehicleCheckin = (vehicleId: string) => {
    toast({
      title: "Vehicle Checked In",
      description: `Vehicle ${vehicleId} has been successfully returned.`,
    });
  };

  // Format document type for display (match registration form names)
  const formatDocumentType = (docType: string): string => {
    const typeMap: Record<string, string> = {
      'NationalId_front': 'National ID - Front',
      'NationalId_back': 'National ID - Back',
      'nationalId_front': 'National ID - Front',
      'nationalId_back': 'National ID - Back',
      'DriverLicense': 'Driver\'s License - Front',
      'driverLicense': 'Driver\'s License - Front',
      'license': 'Driver\'s License - Front',
      'driverLicenseBack': 'Driver\'s License - Back',
      'identity': 'Identity Document (CCCD/CMND)',
    };
    return typeMap[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleCustomerVerification = async (customerId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/staff/customers/${customerId}/verify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          notes: "Documents verified by staff",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify customer");
      }

      toast({
        title: "✅ Customer Verified",
        description: "Customer identity and documents have been approved.",
      });

      // Close the dialog
      setIsVerifyDocumentsOpen(false);
      setSelectedBookingForVerification(null);

      // Refresh pending customers list
      await fetchPendingCustomers();
    } catch (error) {
      console.error("Error verifying customer:", error);
      toast({
        title: "❌ Verification Failed",
        description: "Could not verify customer documents",
        variant: "destructive",
      });
    }
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

  const handleTakePhoto = async (bookingId: string, type: "nationalId_front" | "nationalId_back" | "driverLicense") => {
    // For simplicity, use file picker with camera preference on mobile
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer rear camera on mobile
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const docTypeDisplay = formatDocumentType(type);
        
        toast({
          title: "📸 Processing Photo...",
          description: `Uploading ${docTypeDisplay}.`,
        });

        // Find booking to get customer email
        const booking = pendingBookings.find(b => b.id === bookingId);
        if (!booking) {
          throw new Error("Booking not found");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', booking.email);
        formData.append('documentType', type);

        const response = await fetch('http://localhost:5000/api/documents/upload-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Photo upload failed');
        }

        toast({
          title: "✅ Photo Uploaded",
          description: `${docTypeDisplay} photo uploaded successfully. Continue uploading other documents.`,
        });

        // Refresh only the documents for this booking to show uploaded document immediately
        try {
          const customers = await staffApiService.getCustomersForVerification();
          const updatedCustomer = customers.find((c: any) => c.email === booking.email);
          
          if (updatedCustomer) {
            // Update only this customer's documents in state
            setPendingCustomers((prev: any[]) => 
              prev.map((c: any) => 
                c.email === booking.email
                  ? { ...c, documents: updatedCustomer.documents, hasDocuments: updatedCustomer.hasDocuments }
                  : c
              )
            );
          }
        } catch (error) {
          console.error("Error refreshing documents:", error);
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast({
          title: "❌ Upload Failed",
          description: "Could not upload photo",
          variant: "destructive",
        });
      }
    };

    input.click();
  };

  const handleUploadDocument = async (
    bookingId: string,
    type: "nationalId_front" | "nationalId_back" | "driverLicense"
  ) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const docTypeDisplay = formatDocumentType(type);
        
        toast({
          title: "Uploading...",
          description: `Uploading ${docTypeDisplay}.`,
        });

        // Find booking to get customer email
        const booking = pendingBookings.find(b => b.id === bookingId);
        if (!booking) {
          throw new Error("Booking not found");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', booking.email);
        formData.append('documentType', type);

        const response = await fetch('http://localhost:5000/api/documents/upload-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        toast({
          title: "✅ Upload Successful",
          description: `${docTypeDisplay} uploaded successfully. Continue uploading other documents.`,
        });

        // Refresh only the documents for this booking to show uploaded document immediately
        try {
          const customers = await staffApiService.getCustomersForVerification();
          const updatedCustomer = customers.find((c: any) => c.email === booking.email);
          
          if (updatedCustomer) {
            // Update only this customer's documents in state
            setPendingCustomers((prev: any[]) => 
              prev.map((c: any) => 
                c.email === booking.email
                  ? { ...c, documents: updatedCustomer.documents, hasDocuments: updatedCustomer.hasDocuments }
                  : c
              )
            );
          }
        } catch (error) {
          console.error("Error refreshing documents:", error);
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        toast({
          title: "❌ Upload Failed",
          description: "Could not upload document",
          variant: "destructive",
        });
      }
    };

    input.click();
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

  const handleSaveVehicleChanges = async () => {
    console.log('handleSaveVehicleChanges called');
    console.log('editingVehicle:', editingVehicle);
    console.log('apiVehicles:', apiVehicles);
    
    if (editingVehicle && apiVehicles) {
      try {
        console.log('Saving vehicle changes:', editingVehicle);
        const apiVehicle = apiVehicles.find(v => 
          (v.uniqueVehicleId && v.uniqueVehicleId === editingVehicle.id) ||
          v.vehicleId.toString() === editingVehicle.id
        );
        
        console.log('Found API vehicle:', apiVehicle);
        
        if (apiVehicle) {
          const updateData = {
            batteryLevel: parseInt(batteryLevel) || editingVehicle.batteryLevel,
            condition: vehicleCondition || editingVehicle.condition,
            mileage: parseInt(vehicleMileage) || editingVehicle.mileage,
            lastMaintenance: editingVehicle.lastMaintenance,
          };
          
          console.log('Updating vehicle with data:', updateData);
          await updateVehicle(apiVehicle.vehicleId, updateData);
          console.log('Vehicle updated successfully');
          
          // Refresh the vehicle list to show updated data
          await refetchVehicles();
          console.log('Vehicle list refreshed');
        }
        
        toast({
          title: "Vehicle Updated",
          description: `${editingVehicle.name} has been successfully updated.`,
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update vehicle. Please try again.",
          duration: 3000,
        });
      }
      
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

  // Helpers for Booking History
  const getVehicleInfo = (vehicleId: number) => {
    const v = apiVehicles?.find((x: any) => x.vehicleId === vehicleId);
    if (!v) return null;
    return {
      name: `${v.modelId} - ${v.uniqueVehicleId || v.vehicleId}`,
      location: v.location,
      battery: v.batteryLevel,
      status: v.status,
      modelId: v.modelId,
      uniqueId: v.uniqueVehicleId || v.vehicleId.toString(),
    };
  };

  const handleAddVehicle = async () => {
    if (!newVehicleData.mileage || newVehicleData.mileage === "0") {
      toast({
        title: "Error",
        description: "Please select a vehicle to assign",
        variant: "destructive",
      });
      return;
    }

    if (!staffProfile?.stationId) {
      toast({
        title: "Error",
        description: "No station assigned to current user",
        variant: "destructive",
      });
      return;
    }

    try {
      const vehicleId = parseInt(newVehicleData.mileage);
      const stationId = staffProfile.stationId;
      // Get station name from multiple sources
      // Map database station_id to static data id
      const stationMap: { [key: number]: string } = {
        1: "st1", // District 1 Station
        2: "st2", // District 7 Station  
        3: "st3", // Airport Station
        4: "st4", // District 3 Station
        5: "st5", // District 5 Station
        6: "st6", // District 2 Station
        7: "st7", // Thu Duc Station
        8: "st8", // District 4 Station
      };
      
      const stationName = stationInfo?.name || 
                         stations.find(s => s.id === stationMap[stationId])?.name || 
                         `Station ${stationId}`;
      const location = stationName;

      console.log('Debug assign vehicle:', {
        vehicleId,
        stationId,
        stationInfo: stationInfo?.name,
        mappedStationId: stationMap[stationId],
        stationFromArray: stations.find(s => s.id === stationMap[stationId])?.name,
        finalLocation: location
      });

      await apiService.assignVehicleToStation(vehicleId, stationId, location);

      toast({
        title: "Vehicle Assigned Successfully!",
        description: `Vehicle has been assigned to ${location}`,
        duration: 3000,
      });

      // Refresh the vehicle list
      refetchVehicles();
      
      // Refresh unassigned vehicles
      loadUnassignedVehicles();

      // Notify other pages that vehicles were updated
      localStorage.setItem('vehiclesUpdated', 'true');

      // Reset form and close dialog
      setIsAddVehicleDialogOpen(false);
      setSelectedModelToAdd("");
      setNewVehicleData({
        batteryLevel: "100",
        condition: "excellent",
        mileage: "0",
      });
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to assign vehicle to station",
        variant: "destructive",
      });
    }
  };

  // Vehicle Inspection Handlers
  const handleStartPreRentalInspection = (vehicleId: string) => {
    console.log("Pre-Rental Inspection clicked for vehicle:", vehicleId);
    const vehicle = vehicleList.find((v: any) => v.id === vehicleId);
    if (vehicle) {
      console.log("Vehicle found:", vehicle);
      setInspectingVehicleId(vehicleId);
      setInspectionData({
        batteryLevel: (vehicle as any).battery?.toString() || "100",
        mileage: (vehicle as any).mileage?.toString() || "0",
        condition: "excellent",
        exteriorCondition: "good",
        interiorCondition: "good",
        tiresCondition: "good",
        notes: "",
        damages: [],
      });
      setIsPreRentalInspectionOpen(true);
      console.log("Dialog should open now, state set to true");
    } else {
      console.log("Vehicle not found!");
    }
  };

  const handleCompletePreRentalInspection = () => {
    if (!inspectingVehicleId) return;

    // Validation
    if (!inspectionData.batteryLevel || !inspectionData.mileage) {
      toast({
        title: "Incomplete Inspection",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pre-Rental Inspection Complete",
      description: `Vehicle ${inspectingVehicleId} is ready for rental`,
      duration: 3000,
    });

    // Reset and close
    setIsPreRentalInspectionOpen(false);
    setInspectingVehicleId(null);
    setInspectionData({
      batteryLevel: "",
      mileage: "",
      condition: "excellent",
      exteriorCondition: "good",
      interiorCondition: "good",
      tiresCondition: "good",
      notes: "",
      damages: [],
    });
  };

  const handleStartPostRentalInspection = (vehicleId: string) => {
    console.log("Post-Rental Inspection clicked for vehicle:", vehicleId);
    const vehicle = vehicleList.find((v: any) => v.id === vehicleId);
    if (vehicle) {
      console.log("Vehicle found:", vehicle);
      setInspectingVehicleId(vehicleId);
      setInspectionData({
        batteryLevel: "",
        mileage: "",
        condition: "excellent",
        exteriorCondition: "good",
        interiorCondition: "good",
        tiresCondition: "good",
        notes: "",
        damages: [],
      });
      setIsPostRentalInspectionOpen(true);
      console.log("Post-rental dialog should open now, state set to true");
    } else {
      console.log("Vehicle not found!");
    }
  };

  const handleCompletePostRentalInspection = () => {
    if (!inspectingVehicleId) return;

    // Validation
    if (!inspectionData.batteryLevel || !inspectionData.mileage) {
      toast({
        title: "Incomplete Inspection",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if vehicle needs maintenance
    const needsMaintenance =
      inspectionData.damages.length > 0 ||
      inspectionData.exteriorCondition === "poor" ||
      inspectionData.interiorCondition === "poor" ||
      inspectionData.tiresCondition === "poor";

    toast({
      title: "Post-Rental Inspection Complete",
      description: needsMaintenance
        ? `Vehicle ${inspectingVehicleId} marked for maintenance`
        : `Vehicle ${inspectingVehicleId} is now available`,
      duration: 3000,
    });

    // Reset and close
    setIsPostRentalInspectionOpen(false);
    setInspectingVehicleId(null);
    setInspectionData({
      batteryLevel: "",
      mileage: "",
      condition: "excellent",
      exteriorCondition: "good",
      interiorCondition: "good",
      tiresCondition: "good",
      notes: "",
      damages: [],
    });
  };

  const handleToggleDamage = (damage: string) => {
    setInspectionData((prev) => ({
      ...prev,
      damages: prev.damages.includes(damage)
        ? prev.damages.filter((d) => d !== damage)
        : [...prev.damages, damage],
    }));
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
              <Button
                size="sm"
                onClick={() => setIsAddVehicleDialogOpen(true)}
                className="bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehiclesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading vehicles...</p>
              </div>
            ) : vehiclesError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading vehicles: {vehiclesError}</p>
              </div>
            ) : vehicleList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vehicles found</p>
              </div>
            ) : (
              vehicleList
                .filter((vehicle) =>
                  searchQuery
                    ? vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((vehicle) => (
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
                          {/* @ts-expect-error - customer may not exist on vehicle type */}
                          Customer: {vehicle.customer || "N/A"}
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
                        disabled={vehicle.status === "rented" || vehicle.status === "pending"}
                        onClick={() => handleEditVehicle(vehicle)}
                        title={vehicle.status === "rented" || vehicle.status === "pending" ? "Cannot edit vehicle with this status" : "Edit vehicle"}
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
                            className="bg-primary"
                            onClick={() =>
                              handleStartPreRentalInspection(vehicle.id)
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pre-Rental Check
                          </Button>
                        </>
                      )}

                      {vehicle.status === "rented" && (
                        <Button
                          size="sm"
                          className="bg-primary"
                          onClick={() =>
                            handleStartPostRentalInspection(vehicle.id)
                          }
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Return Inspection
                        </Button>
                      )}

                      {vehicle.status === "pending" && (
                        <Button
                          size="sm"
                          className="bg-primary"
                          onClick={() =>
                            handleVehicleStatusUpdate(vehicle.id, "available")
                          }
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve Vehicle
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
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Registered Vehicle to Station Dialog */}
      <Dialog
        open={isAddVehicleDialogOpen}
        onOpenChange={setIsAddVehicleDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6" />
              Assign Vehicle to Your Station
            </DialogTitle>
            <p className="text-base text-muted-foreground mt-2">
              Select a registered vehicle from the system to assign to{" "}
              <strong className="text-primary">
                {stationInfo?.name || stations.find((s) => s.id === staffProfile?.stationId?.toString())?.name}
              </strong>
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by VIN, License Plate, or Model..."
                  className="pl-10"
                  value={selectedModelToAdd}
                  onChange={(e) => setSelectedModelToAdd(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Available Vehicles List */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Car className="h-5 w-5" />
                Available Registered Vehicles
              </h3>

              <div className="grid grid-cols-1 gap-4 pr-2 pl-2 py-1">
                {unassignedVehiclesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading vehicles...</p>
                  </div>
                ) : unassignedVehiclesError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading vehicles: {unassignedVehiclesError}</p>
                    <Button 
                      onClick={loadUnassignedVehicles} 
                      variant="outline" 
                      className="mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : unassignedVehicles
                  .filter((vehicle) =>
                    selectedModelToAdd
                      ? vehicle.modelId
                          .toLowerCase()
                          .includes(selectedModelToAdd.toLowerCase()) ||
                        vehicle.uniqueVehicleId
                          ?.toLowerCase()
                          .includes(selectedModelToAdd.toLowerCase()) ||
                        vehicle.licensePlate
                          ?.toLowerCase()
                          .includes(selectedModelToAdd.toLowerCase())
                      : true
                  )
                  .map((vehicle) => (
                    <Card
                      key={vehicle.vehicleId}
                      className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.005] ${
                        newVehicleData.mileage === vehicle.vehicleId.toString()
                          ? "ring-2 ring-primary bg-primary/5 shadow-md"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setNewVehicleData({
                          ...newVehicleData,
                          mileage: vehicle.vehicleId.toString(), // Using mileage field to store selected vehicle ID temporarily
                        });
                      }}
                    >
                      <CardContent className="p-3 pl-4">
                        <div className="flex gap-3">
                          {/* Vehicle Image */}
                          <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted shadow-sm">
                            <img
                              src={vehicle.image || "/placeholder.svg"}
                              alt={vehicle.modelId}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Vehicle Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-lg text-foreground">
                                  {vehicle.modelId}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  SUV • 2024
                                </p>
                                {vehicle.licensePlate && (
                                  <p className="text-sm font-semibold text-primary mt-1">
                                    License: {vehicle.licensePlate}
                                  </p>
                                )}
                              </div>
                              {newVehicleData.mileage === vehicle.vehicleId.toString() && (
                                <Badge className="bg-primary text-white text-base px-3 py-1.5 shadow-md">
                                  ✓ Selected
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-muted-foreground">
                                    VIN
                                  </span>
                                  <span className="font-mono text-xs truncate">
                                    {vehicle.uniqueVehicleId || vehicle.vehicleId.toString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                                <Battery className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Battery
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {vehicle.batteryLevel}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                                <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Range
                                  </span>
                                  <span className="font-semibold">
                                    {vehicle.maxRangeKm} km
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-md">
                                <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Seats
                                  </span>
                                  <span className="font-semibold">
                                    5
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge
                                className="text-sm px-3 py-1"
                                variant={
                                  vehicle.condition === "excellent"
                                    ? "default"
                                    : vehicle.condition === "good"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {vehicle.condition === "excellent"
                                  ? "✅"
                                  : vehicle.condition === "good"
                                  ? "👍"
                                  : "⚠️"}{" "}
                                {vehicle.condition}
                              </Badge>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-medium">
                                  ₫{vehicle.pricePerHour.toLocaleString()}/hr
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-medium">
                                  ₫{vehicle.pricePerDay.toLocaleString()}/day
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {unassignedVehicles.length === 0 && !unassignedVehiclesLoading && !unassignedVehiclesError && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                      No unassigned vehicles available
                    </p>
                    <p className="text-sm">
                      All vehicles have been assigned to stations
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
                  <p className="font-medium">About Assigning Vehicles:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Only vehicles registered by admin are shown here</li>
                    <li>
                      You can only assign vehicles that are not currently
                      assigned to other stations
                    </li>
                    <li>
                      Selected vehicle will be assigned to:{" "}
                      <strong>
                        {
                          stationInfo?.name || stations.find((s) => s.id === staffProfile?.stationId?.toString())
                            ?.name
                        }
                      </strong>
                    </li>
                    <li>
                      Vehicle status and condition are set during registration
                      by admin
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddVehicleDialogOpen(false);
                setSelectedModelToAdd("");
                setNewVehicleData({
                  batteryLevel: "100",
                  condition: "excellent",
                  mileage: "0",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVehicle}
              disabled={
                !newVehicleData.mileage || newVehicleData.mileage === "0"
              }
              className="bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Vehicle to Station
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pre-Rental Inspection Dialog */}
      <Dialog
        open={isPreRentalInspectionOpen}
        onOpenChange={setIsPreRentalInspectionOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pre-Rental Vehicle Inspection</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Vehicle ID: {inspectingVehicleId}
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {/* Vehicle Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preBatteryLevel">Battery Level (%)*</Label>
                <Input
                  id="preBatteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={inspectionData.batteryLevel}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      batteryLevel: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="preMileage">Current Mileage (km)*</Label>
                <Input
                  id="preMileage"
                  type="number"
                  min="0"
                  value={inspectionData.mileage}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      mileage: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Condition Checks */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">
                Vehicle Condition Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="preExterior">Exterior Condition</Label>
                  <select
                    id="preExterior"
                    value={inspectionData.exteriorCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        exteriorCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="preInterior">Interior Condition</Label>
                  <select
                    id="preInterior"
                    value={inspectionData.interiorCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        interiorCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="preTires">Tires Condition</Label>
                  <select
                    id="preTires"
                    value={inspectionData.tiresCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        tiresCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Damage Checklist */}
            <div className="space-y-3">
              <Label>Pre-existing Damages (if any)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Scratches",
                  "Dents",
                  "Broken lights",
                  "Cracked windshield",
                  "Worn tires",
                  "Interior stains",
                  "Missing parts",
                  "Other damages",
                ].map((damage) => (
                  <label
                    key={damage}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={inspectionData.damages.includes(damage)}
                      onChange={() => handleToggleDamage(damage)}
                      className="rounded"
                    />
                    <span>{damage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="preNotes">Additional Notes</Label>
              <Textarea
                id="preNotes"
                value={inspectionData.notes}
                onChange={(e) =>
                  setInspectionData({
                    ...inspectionData,
                    notes: e.target.value,
                  })
                }
                placeholder="Any additional observations or concerns..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreRentalInspectionOpen(false);
                  setInspectingVehicleId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompletePreRentalInspection}
                className="bg-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Ready for Rental
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Rental Inspection Dialog */}
      <Dialog
        open={isPostRentalInspectionOpen}
        onOpenChange={setIsPostRentalInspectionOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post-Rental Vehicle Inspection</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Vehicle ID: {inspectingVehicleId}
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {/* Vehicle Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postBatteryLevel">Battery Level (%)*</Label>
                <Input
                  id="postBatteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={inspectionData.batteryLevel}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      batteryLevel: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="postMileage">Return Mileage (km)*</Label>
                <Input
                  id="postMileage"
                  type="number"
                  min="0"
                  value={inspectionData.mileage}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      mileage: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Condition Checks */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">
                Vehicle Condition Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postExterior">Exterior Condition</Label>
                  <select
                    id="postExterior"
                    value={inspectionData.exteriorCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        exteriorCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="postInterior">Interior Condition</Label>
                  <select
                    id="postInterior"
                    value={inspectionData.interiorCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        interiorCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="postTires">Tires Condition</Label>
                  <select
                    id="postTires"
                    value={inspectionData.tiresCondition}
                    onChange={(e) =>
                      setInspectionData({
                        ...inspectionData,
                        tiresCondition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Damage Checklist */}
            <div className="space-y-3">
              <Label className="text-destructive">
                New Damages Found (if any)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Scratches",
                  "Dents",
                  "Broken lights",
                  "Cracked windshield",
                  "Worn tires",
                  "Interior stains",
                  "Missing parts",
                  "Other damages",
                ].map((damage) => (
                  <label
                    key={damage}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={inspectionData.damages.includes(damage)}
                      onChange={() => handleToggleDamage(damage)}
                      className="rounded"
                    />
                    <span>{damage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alert for damages */}
            {inspectionData.damages.length > 0 && (
              <div className="bg-destructive-light p-4 rounded-md border border-destructive">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-destructive">
                      Damages Detected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vehicle will be marked for maintenance after inspection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="postNotes">Inspection Notes*</Label>
              <Textarea
                id="postNotes"
                value={inspectionData.notes}
                onChange={(e) =>
                  setInspectionData({
                    ...inspectionData,
                    notes: e.target.value,
                  })
                }
                placeholder="Document any issues, customer feedback, or observations..."
                rows={3}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPostRentalInspectionOpen(false);
                  setInspectingVehicleId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompletePostRentalInspection}
                className="bg-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Inspection & Return Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            {(pendingCustomersLoading || pendingVehiclesLoading) ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading...</p>
              </div>
            ) : (pendingCustomersError || pendingVehiclesError) ? (
              <div className="text-center py-8 text-red-500">
                <p>Error: {pendingCustomersError || pendingVehiclesError}</p>
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending verifications found</p>
              </div>
            ) : (
              pendingBookings.map((booking: any) => (
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
                    {booking.phone && (
                      <p className="text-sm text-muted-foreground">
                        Phone: {booking.phone}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Registered: {new Date(booking.registeredAt).toLocaleString()}
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
                    <Dialog 
                      open={isVerifyDocumentsOpen && selectedBookingForVerification === booking.id}
                      onOpenChange={(open) => {
                        setIsVerifyDocumentsOpen(open);
                        if (open) {
                          setSelectedBookingForVerification(booking.id);
                        } else {
                          setSelectedBookingForVerification(null);
                          // Refresh data when dialog closes to show updated documents
                          fetchPendingCustomers();
                        }
                      }}
                    >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Verify Documents
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Customer Verification: {booking.customer}</DialogTitle>
                            <DialogDescription>
                              Review and verify customer documents before approving vehicle pickup
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="space-y-2">
                              <h3 className="font-semibold">Customer Information</h3>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-medium">Name:</span> {booking.customer}</p>
                                {booking.phone && <p><span className="font-medium">Phone:</span> {booking.phone}</p>}
                                {booking.email && <p><span className="font-medium">Email:</span> {booking.email}</p>}
                                <p><span className="font-medium">Vehicle:</span> {booking.vehicle}</p>
                              </div>
                            </div>

                            {/* Documents Section */}
                            {booking.documents && booking.documents.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-semibold">Uploaded Documents</h3>
                                <div className="space-y-3">
                                  {booking.documents.map((doc: any) => (
                                    <div key={doc.documentId} className="border rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <Label className="font-semibold">{formatDocumentType(doc.documentType)}</Label>
                                        <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                          {doc.status || 'Pending'}
                                        </Badge>
                                      </div>
                                      <img 
                                        src={`http://localhost:5000${doc.fileUrl}`} 
                                        alt={formatDocumentType(doc.documentType)}
                                        className="w-full h-48 object-contain bg-muted rounded border cursor-pointer"
                                        onClick={() => window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Verify Documents Section */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Verify Documents</h3>
                              
                              {/* National ID - Front */}
                              <div>
                                <Label>National ID - Front</Label>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                      handleTakePhoto(booking.id, "nationalId_front")
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
                                      handleUploadDocument(booking.id, "nationalId_front")
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </Button>
                                </div>
                              </div>

                              {/* National ID - Back */}
                              <div>
                                <Label>National ID - Back</Label>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                      handleTakePhoto(booking.id, "nationalId_back")
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
                                      handleUploadDocument(booking.id, "nationalId_back")
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </Button>
                                </div>
                              </div>

                              {/* Driver's License - Front */}
                              <div>
                                <Label>Driver's License - Front</Label>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                      handleTakePhoto(booking.id, "driverLicense")
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
                                      handleUploadDocument(booking.id, "driverLicense")
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <Button
                              className="w-full"
                              onClick={() =>
                                handleCustomerVerification(booking.userId)
                              }
                            >
                              Verify & Approve Documents
                            </Button>
                          </div>
                        </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )))}
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
              {documentType ? formatDocumentType(documentType) : "Document"} Capture
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

  const renderPaymentManagement = () => {
    // Helper to get transaction icon and color
    const getTransactionIcon = (transactionType: string) => {
      switch (transactionType?.toLowerCase()) {
        case 'payment':
          return { icon: <DollarSign className="h-5 w-5 text-red-600" />, label: 'Payment', color: 'text-red-600' };
        case 'refund':
          return { icon: <RefreshCw className="h-5 w-5 text-green-600" />, label: 'Refund', color: 'text-green-600' };
        case 'deposit':
          return { icon: <DollarSign className="h-5 w-5 text-blue-600" />, label: 'Deposit', color: 'text-blue-600' };
        default:
          return { icon: <CreditCard className="h-5 w-5" />, label: 'Transaction', color: '' };
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all payment transactions at this station
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPayments}
                disabled={paymentsLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading payments...</p>
              </div>
            ) : paymentsError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error: {paymentsError}</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No payment transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment: any) => {
                  const transactionInfo = getTransactionIcon(payment.transactionType);
                  const isRefund = payment.transactionType?.toLowerCase() === 'refund';
                  
                  return (
                    <div key={payment.paymentId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        {transactionInfo.icon}
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            <span className={transactionInfo.color}>{transactionInfo.label}</span>
                            <span className="text-muted-foreground">• #{payment.paymentId}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.customerName || 'Unknown'} 
                            {payment.vehicleModel && ` • ${payment.vehicleModel}`}
                            {payment.vehicleUniqueId && ` (${payment.vehicleUniqueId})`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span>{new Date(payment.createdAt).toLocaleString('vi-VN')}</span>
                            <span>•</span>
                            <span className="capitalize">{payment.methodType}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className={`font-semibold text-lg ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
                            {isRefund ? '+' : '-'}{payment.amount.toLocaleString('vi-VN')} VND
                          </p>
                          <Badge variant={payment.status === 'success' ? 'default' : payment.status === 'refunded' ? 'outline' : 'secondary'} className="capitalize">
                            {payment.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={(o) => !o && setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details #{selectedPayment?.paymentId}</DialogTitle>
              <DialogDescription>
                Complete transaction information
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transaction Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <p><span className="font-medium">Payment ID:</span> #{selectedPayment.paymentId}</p>
                    <p><span className="font-medium">Type:</span> <span className="capitalize">{selectedPayment.transactionType || 'Payment'}</span></p>
                    <p><span className="font-medium">Method:</span> <span className="capitalize">{selectedPayment.methodType}</span></p>
                    <p><span className="font-medium">Status:</span> <Badge className="ml-1 capitalize" variant={selectedPayment.status === 'success' ? 'default' : 'secondary'}>{selectedPayment.status}</Badge></p>
                    <p className="col-span-2">
                      <span className="font-medium">Amount:</span> 
                      <span className={`ml-2 text-lg font-semibold ${selectedPayment.transactionType?.toLowerCase() === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedPayment.transactionType?.toLowerCase() === 'refund' ? '+' : '-'}{selectedPayment.amount.toLocaleString('vi-VN')} VND
                      </span>
                    </p>
                    <p className="col-span-2"><span className="font-medium">Transaction ID:</span> {selectedPayment.transactionId || 'N/A'}</p>
                    <p className="col-span-2"><span className="font-medium">Created At:</span> {new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                {selectedPayment.customerName && (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                        <p><span className="font-medium">Name:</span> {selectedPayment.customerName}</p>
                        <p><span className="font-medium">User ID:</span> {selectedPayment.userId || 'N/A'}</p>
                        <p><span className="font-medium">Email:</span> {selectedPayment.customerEmail || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {selectedPayment.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Vehicle Info */}
                {selectedPayment.vehicleModel && (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                        <p><span className="font-medium">Model:</span> {selectedPayment.vehicleModel}</p>
                        <p><span className="font-medium">Unique ID:</span> {selectedPayment.vehicleUniqueId || 'N/A'}</p>
                        {selectedPayment.reservationId && (
                          <p><span className="font-medium">Reservation ID:</span> #{selectedPayment.reservationId}</p>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Additional Notes */}
                {selectedPayment.isDeposit && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      This is a deposit transaction
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderBookingHistory = () => {
    const bookingStatuses = ["active", "in_progress", "confirmed", "rented"];

    const withinRange = (dateStr: string | null | undefined) => {
      if (!dateStr) return dateFilter === "all"; // If no date, only show in "all" filter
      
      try {
        const now = new Date();
        const d = new Date(dateStr);
        
        // Check if date is valid
        if (isNaN(d.getTime())) return dateFilter === "all";
        
        if (dateFilter === "all") return true;
        if (dateFilter === "today") {
          // Compare date parts only (ignore time)
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          return today.getTime() === compareDate.getTime();
        }
        if (dateFilter === "week") {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return d >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return d >= monthAgo;
        }
        if (dateFilter === "specific-month") {
          return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
        }
        return true;
      } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return dateFilter === "all";
      }
    };

    const activeBookings = reservations
      .filter((r: any) => bookingStatuses.includes((r.status || '').toLowerCase()))
      .filter((r: any) => withinRange(r.createdAt || r.startTime));

    const canceledBookings = reservations
      .filter((r: any) => {
        const status = (r.status || '').toLowerCase();
        return status === 'cancelled' || status === 'canceled';
      })
      .filter((r: any) => withinRange(r.cancelledAt || r.createdAt));
    
    console.log('All reservations:', reservations);
    console.log('Canceled bookings:', canceledBookings);
    console.log('Date filter:', dateFilter);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  Manage current bookings and view cancellation history
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchReservations}
                  disabled={reservationsLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${reservationsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <div className="w-40">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="specific-month">Specific Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateFilter === 'specific-month' && (
                  <div className="flex items-center gap-2">
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 6 }).map((_, idx) => {
                          const y = new Date().getFullYear() - 3 + idx;
                          return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="booking">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="booking">Booking</TabsTrigger>
                <TabsTrigger value="cancel">Cancel</TabsTrigger>
              </TabsList>

              {/* Booking list */}
              <TabsContent value="booking" className="mt-4">
                {reservationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading bookings...</p>
                  </div>
                ) : reservationsError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading bookings: {reservationsError}</p>
                  </div>
                ) : activeBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active/confirmed bookings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBookings.map((bk: any) => {
                      const v = getVehicleInfo(bk.vehicleId);
                      return (
                        <div
                          key={bk.reservationId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <Car className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">
                                #{bk.reservationId} • {bk.vehicleModel || bk.vehicleUniqueId || v?.name || `Vehicle ${bk.vehicleId}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {bk.userName || `User ${bk.userId}`} {bk.userPhone && `• ${bk.userPhone}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bk.startTime).toLocaleString('vi-VN')} → {new Date(bk.endTime).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="capitalize" variant="secondary">{bk.status}</Badge>
                            {v?.battery !== undefined && (
                              <div className="text-sm text-muted-foreground">🔋 {v.battery}%</div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReservation({ ...bk, vehicleInfo: v })}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Cancel list */}
              <TabsContent value="cancel" className="mt-4">
                {reservationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading cancellations...</p>
                  </div>
                ) : canceledBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <X className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cancellations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {canceledBookings.map((bk: any) => {
                      const v = getVehicleInfo(bk.vehicleId);
                      return (
                        <div 
                          key={bk.reservationId} 
                          className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <X className="h-5 w-5 text-destructive" />
                            <div className="flex-1">
                              <p className="font-medium">
                                #{bk.reservationId} • {bk.vehicleModel || bk.vehicleUniqueId || v?.name || `Vehicle ${bk.vehicleId}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {bk.userName || `User ${bk.userId}`} {bk.userPhone && `• ${bk.userPhone}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Reason: {bk.cancellationReason || 'No reason provided'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Cancelled: {bk.cancelledAt ? new Date(bk.cancelledAt).toLocaleString('vi-VN') : 'Unknown'}
                                {bk.cancelledBy && ` by ${bk.cancelledBy}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive" className="capitalize">{bk.status}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReservation({ ...bk, vehicleInfo: v })}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reservation details dialog */}
        <Dialog open={!!selectedReservation} onOpenChange={(o) => !o && setSelectedReservation(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Booking Details #{selectedReservation?.reservationId}</DialogTitle>
              <DialogDescription>
                Detailed information about this booking and vehicle
              </DialogDescription>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <p><span className="font-medium">Name:</span> {selectedReservation.userName || 'N/A'}</p>
                    <p><span className="font-medium">User ID:</span> {selectedReservation.userId}</p>
                    <p><span className="font-medium">Email:</span> {selectedReservation.userEmail || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedReservation.userPhone || 'N/A'}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <p><span className="font-medium">Model:</span> {selectedReservation.vehicleModel || selectedReservation.vehicleInfo?.name || `Vehicle ${selectedReservation.vehicleId}`}</p>
                    <p><span className="font-medium">Unique ID:</span> {selectedReservation.vehicleUniqueId || selectedReservation.vehicleInfo?.uniqueId || 'N/A'}</p>
                    <p><span className="font-medium">License Plate:</span> {selectedReservation.licensePlate || 'N/A'}</p>
                    {selectedReservation.vehicleInfo?.battery !== undefined && (
                      <p><span className="font-medium">Battery:</span> {selectedReservation.vehicleInfo.battery}%</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <p><span className="font-medium">Status:</span> <Badge className="ml-1 capitalize" variant={(selectedReservation.status || '').toLowerCase() === 'cancelled' ? 'destructive' : 'secondary'}>{selectedReservation.status}</Badge></p>
                    <p><span className="font-medium">Station:</span> {selectedReservation.stationName || stationData.name || stationInfo?.name || `Station ${selectedReservation.stationId}`}</p>
                    <p className="col-span-2"><span className="font-medium">Start:</span> {new Date(selectedReservation.startTime).toLocaleString('vi-VN')}</p>
                    <p className="col-span-2"><span className="font-medium">End:</span> {new Date(selectedReservation.endTime).toLocaleString('vi-VN')}</p>
                    <p className="col-span-2"><span className="font-medium">Created:</span> {new Date(selectedReservation.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                
                {/* Cancellation Information - Only show if cancelled */}
                {((selectedReservation.status || '').toLowerCase() === 'cancelled' || (selectedReservation.status || '').toLowerCase() === 'canceled') && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Cancellation Information
                      </h3>
                      <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-[100px]">Reason:</span>
                          <span className="text-muted-foreground flex-1">{selectedReservation.cancellationReason || 'No reason provided'}</span>
                        </div>
                        {selectedReservation.cancelledBy && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium min-w-[100px]">Cancelled By:</span>
                            <span className="text-muted-foreground flex-1 capitalize">{selectedReservation.cancelledBy}</span>
                          </div>
                        )}
                        {selectedReservation.cancelledAt && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium min-w-[100px]">Cancelled At:</span>
                            <span className="text-muted-foreground flex-1">{new Date(selectedReservation.cancelledAt).toLocaleString('vi-VN')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn delay={100}>
          <div 
            className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/src/assets/home-bg.jpg')"
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {t("common.staffDashboard")}
                </h1>
                <p className="text-xl text-white/90 mb-2">{stationData.name}</p>
                <p className="text-white/80">
                  {t("common.welcomeUser")}, {staffProfile?.fullName || currentUser.name}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>{" "}
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Today's Stats - Hidden for now, can be re-enabled later if needed */}
          {/* <SlideIn direction="bottom" delay={200}>
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
          </SlideIn> */}

          {/* Tabs */}
          <FadeIn delay={300}>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
                <TabsTrigger value="customers">
                  Customer Verification
                </TabsTrigger>
                <TabsTrigger value="pickups">Pickup Management</TabsTrigger>
                <TabsTrigger value="walkin">Walk-in Booking</TabsTrigger>
                <TabsTrigger value="payments">Payment Processing</TabsTrigger>
                <TabsTrigger value="history">Booking History</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="mt-6">
                {renderVehicleManagement()}
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                {renderCustomerManagement()}
              </TabsContent>

              <TabsContent value="pickups" className="mt-6">
                <StaffPickupManager />
              </TabsContent>

              <TabsContent value="walkin" className="mt-6">
                <WalkInBookingManager />
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                {renderPaymentManagement()}
              </TabsContent>

              {/* Booking History */}
              <TabsContent value="history" className="mt-6">
                {renderBookingHistory()}
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
                    value={editingVehicle?.lastMaintenance || ""}
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
