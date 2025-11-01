import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalkInCustomer, WalkInBooking, WalkInVehicle } from "./types";
import WalkInCustomerManager from "./WalkInCustomerManager";
import WalkInBookingCreation from "./WalkInBookingCreation";
import WalkInVehicleSelector from "./WalkInVehicleSelector";
import { useChargingContext } from "@/contexts/ChargingContext";
import { BATTERY_THRESHOLDS } from "@/lib/vehicle-constants";
import { useStationInfo } from "@/hooks/useStaffApi";


const WalkInBookingManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("new-booking");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { chargingVehicles } = useChargingContext();
  const { data: stationInfo } = useStationInfo();
  const [apiVehicles, setApiVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffStationId, setStaffStationId] = useState<number | null>(null);

  // Fetch staff profile first
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use the correct API endpoint for staff profile
        const profileResponse = await fetch('http://localhost:5000/api/staff/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('=== STAFF PROFILE DEBUG ===');
          console.log('Full response:', profileData);
          console.log('Station ID:', profileData.stationId);
          
          // Response from /api/staff/profile is direct object: { userId, stationId, ... }
          const stationId = profileData.stationId;
          
          console.log('Extracted station ID:', stationId, 'Type:', typeof stationId);
          console.log('=========================');
          
          setStaffStationId(stationId);
          
          if (stationId === null || stationId === undefined) {
            console.warn('⚠️ Staff does not have a station assigned!');
            toast({
              title: "Warning",
              description: "Your account is not assigned to a station. Please contact administrator.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [toast]);

  // Fetch vehicles ONLY after we have stationId
  useEffect(() => {
    // Don't fetch if we don't have stationId yet
    if (staffStationId === null || staffStationId === undefined) {
      console.log('Waiting for stationId before fetching vehicles...');
      return;
    }

    const fetchVehicles = async () => {
      try {
        console.log('Fetching vehicles for station:', staffStationId);
        const vehiclesResponse = await fetch('http://localhost:5000/api/vehicles');
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json();
          console.log('Fetched vehicles:', vehiclesData.length);
          setApiVehicles(vehiclesData || []);
        } else {
          console.error('Failed to fetch vehicles from API');
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [staffStationId, toast]);

  // Convert API vehicles to WalkInVehicle format
  // ONLY show vehicles from staff's station
  console.log('=== FILTERING VEHICLES ===');
  console.log('Staff Station ID:', staffStationId);
  console.log('Total API Vehicles:', apiVehicles.length);
  console.log('Sample vehicle stations:', apiVehicles.slice(0, 3).map(v => ({ id: v.vehicleId, stationId: v.stationId, status: v.status })));

  const availableVehicles: WalkInVehicle[] = apiVehicles
    .filter(v => {
      const isAvailable = v.status === "available";
      const notCharging = !chargingVehicles.has(v.vehicleId?.toString());
      const goodBattery = v.batteryLevel > BATTERY_THRESHOLDS.LOW_BATTERY;
      const sameStation = staffStationId ? v.stationId === staffStationId : true;
      
      console.log(`Vehicle ${v.vehicleId}: available=${isAvailable}, notCharging=${notCharging}, battery=${goodBattery}, station=${v.stationId} vs ${staffStationId} = ${sameStation}`);
      
      return isAvailable && notCharging && goodBattery && sameStation;
    })
    .map(v => ({
      id: v.vehicleId?.toString() || '',
      name: `${v.modelId} - ${v.uniqueVehicleId}`,
      batteryLevel: v.batteryLevel || 100,
      location: v.location || "Station",
      pricePerHour: v.pricePerHour || 50,
      status: v.status as "available" | "rented" | "maintenance",
      stationId: v.stationId,
      vehicleId: v.vehicleId,
    }));
  
  console.log('Filtered vehicles count:', availableVehicles.length);
  console.log('=== END FILTERING ===');
  
  // State for customers and bookings
  const [customers, setCustomers] = useState<WalkInCustomer[]>(() => {
    // Load customers from localStorage on mount
    try {
      const saved = localStorage.getItem('walkin_customers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading customers from localStorage:', e);
    }
    return [];
  });
  const [bookings, setBookings] = useState<WalkInBooking[]>([]);
  const [activeReservationIds, setActiveReservationIds] = useState<Set<number>>(new Set());

  // Fetch active reservations to filter customers (only show customers with active bookings)
  useEffect(() => {
    if (!staffStationId) return;

    const fetchActiveReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch reservations from staff's station that are pending or active
        const response = await fetch('http://localhost:5000/api/staff/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Extract user IDs from active reservations (pending status)
          const activeUserIds = new Set<number>();
          data.forEach((item: any) => {
            const userId = item.userId || item.user_id;
            if (userId) {
              activeUserIds.add(userId);
            }
          });
          
          setActiveReservationIds(activeUserIds);
          console.log('Active reservation user IDs:', Array.from(activeUserIds));
        }
      } catch (error) {
        console.error('Error fetching active reservations:', error);
      }
    };

    fetchActiveReservations();
    
    // Refresh every 5 seconds when on Customers tab
    const interval = setInterval(() => {
      if (selectedTab === 'customers') {
        fetchActiveReservations();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [staffStationId, selectedTab]);

  // Filter customers: only show those with active reservations
  const filteredCustomers = customers.filter(customer => {
    const customerId = parseInt(customer.id);
    if (isNaN(customerId)) return true; // Keep customers with non-numeric IDs (temp customers)
    
    // Only show customers that have active/pending reservations
    return activeReservationIds.has(customerId);
  });

  // Fetch customers from backend and sync verification status
  useEffect(() => {
    if (!staffStationId || customers.length === 0) return;

    const fetchVerificationStatus = async (userId: number) => {
      try {
        const token = localStorage.getItem('token');
        // Fetch user info to check verification status
        // Note: We'll check if user has approved documents
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Check if user has license number (indicates license exists)
          const hasLicense = userData.licenseNumber || userData.license_number;
          
          // For documents verification, we check if user has any approved documents
          // This is a simplified check - you may need to fetch documents separately
          const hasDocuments = userData.cccd || userData.idNumber;
          
          return {
            licenseVerified: !!hasLicense, // Simplified: if license exists, consider verified
            documentsVerified: !!hasDocuments,
          };
        }
      } catch (error) {
        console.error(`Error fetching verification status for user ${userId}:`, error);
      }
      
      return null;
    };

    const syncVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all pending customers for verification
        const verificationResponse = await fetch('http://localhost:5000/api/staff/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (verificationResponse.ok) {
          const verificationData = await verificationResponse.json();
          
          // Create a map of user_id -> customer info from verification API
          const verificationMap = new Map<number, any>();
          
          verificationData.forEach((item: any) => {
            const userId = item.userId || item.user_id;
            if (userId) {
              verificationMap.set(userId, item);
            }
          });

          // Update customers with verification status
          const updatedCustomers = await Promise.all(
            customers.map(async (customer) => {
              const customerId = parseInt(customer.id);
              if (isNaN(customerId)) return customer;
              
              // Check if customer is in verification list (pending)
              const verificationItem = verificationMap.get(customerId);
              
              if (verificationItem) {
                // Customer is still in pending list - check documents status
                const documents = verificationItem.documents || [];
                const hasApprovedDocuments = documents.some((doc: any) => doc.status === 'approved');
                const hasLicense = !!(verificationItem.licenseNumber || verificationItem.license_number);
                
                return {
                  ...customer,
                  licenseVerified: hasLicense && hasApprovedDocuments,
                  documentsVerified: hasApprovedDocuments,
                };
              } else {
                // Customer is NOT in pending list - might be verified
                // Fetch from user info to check verification status
                const verificationStatus = await fetchVerificationStatus(customerId);
                if (verificationStatus) {
                  return {
                    ...customer,
                    licenseVerified: verificationStatus.licenseVerified,
                    documentsVerified: verificationStatus.documentsVerified,
                  };
                }
              }
              
              // Default: not verified
              return {
                ...customer,
                licenseVerified: false,
                documentsVerified: false,
              };
            })
          );
          
          setCustomers(updatedCustomers);
        }
      } catch (error) {
        console.error('Error syncing customers verification status:', error);
      }
    };

    syncVerificationStatus();
    
    // Refresh every 5 seconds when on Customers tab
    const interval = setInterval(() => {
      if (selectedTab === 'customers') {
        syncVerificationStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [staffStationId, customers.length, selectedTab]);

  // Save customers to localStorage whenever customers change
  useEffect(() => {
    try {
      localStorage.setItem('walkin_customers', JSON.stringify(customers));
    } catch (e) {
      console.error('Error saving customers to localStorage:', e);
    }
  }, [customers]);

  const handleBookingCreate = (booking: WalkInBooking) => {
    setBookings(prev => [...prev, booking]);
    
    // Add customer to active reservations set so they appear in the list
    const customerId = parseInt(booking.customerId);
    if (!isNaN(customerId)) {
      setActiveReservationIds(prev => new Set([...prev, customerId]));
    }
    
    toast({
      title: "Booking Created Successfully!",
      description: `Walk-in booking created and confirmation email sent.`,
    });
  };

  const handleBookingConfirm = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: "confirmed", paymentStatus: "paid" }
          : b
      )
    );
    toast({
      title: "Booking Confirmed",
      description: "Customer can now access the vehicle",
    });
  };

  const handleCustomerAdd = (customer: WalkInCustomer) => {
    setCustomers(prev => {
      // Check if customer already exists (by ID, email, or phone)
      const existing = prev.find(
        c => c.id === customer.id || 
             (customer.email && c.email === customer.email) ||
             c.phone === customer.phone
      );
      
      if (existing) {
        // Update existing customer instead of adding duplicate
        return prev.map(c => 
          (c.id === customer.id || 
           (customer.email && c.email === customer.email) ||
           c.phone === customer.phone) ? customer : c
        );
      }
      
      // Add new customer
      return [...prev, customer];
    });
    
    toast({
      title: "Customer Added",
      description: `${customer.fullName} has been added to the system`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Walk-in Booking Management
                {stationInfo && (
                  <Badge variant="outline" className="ml-2">
                    {stationInfo.name}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create instant bookings for walk-in customers at your station
              </p>
            </div>
            <div className="flex gap-2">
              <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {availableVehicles.length}
                </div>
                <div className="text-xs text-blue-700">Available</div>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === "confirmed").length}
                </div>
                <div className="text-xs text-green-700">Active</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-booking">New Booking</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vehicles">Available Vehicles</TabsTrigger>
        </TabsList>

        {/* New Booking Tab */}
        <TabsContent value="new-booking" className="mt-6">
          <WalkInBookingCreation
            customers={customers}
            vehicles={availableVehicles}
            onBookingCreate={handleBookingCreate}
            onCustomerAdd={handleCustomerAdd}
            staffStationId={staffStationId}
          />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-6">
          <WalkInCustomerManager
            customers={filteredCustomers}
            onCustomersChange={setCustomers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        {/* Available Vehicles Tab */}
        <TabsContent value="vehicles" className="mt-6">
          <WalkInVehicleSelector
            vehicles={availableVehicles}
            selectedVehicleId={null}
            onVehicleSelect={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalkInBookingManager;
