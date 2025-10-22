import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { vehicles } from "@/data/vehicles";
import { WalkInCustomer, WalkInBooking, WalkInVehicle } from "./types";
import WalkInCustomerManager from "./WalkInCustomerManager";
import WalkInBookingCreation from "./WalkInBookingCreation";
import WalkInBookingList from "./WalkInBookingList";
import WalkInVehicleSelector from "./WalkInVehicleSelector";


const WalkInBookingManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("new-booking");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Convert vehicles to WalkInVehicle format
  const availableVehicles: WalkInVehicle[] = vehicles
    .filter(v => v.status === "available")
    .map(v => ({
      id: v.id,
      name: v.name,
      batteryLevel: v.batteryLevel || 100,
      location: v.location || "Station",
      pricePerHour: v.pricePerHour || 50,
      status: v.status as "available" | "rented" | "maintenance",
    }));
  
  // Mock customers (in real app, this would be from database)
  const [customers, setCustomers] = useState<WalkInCustomer[]>([
    {
      id: "C001",
      fullName: "Nguyen Van A",
      phone: "+84 90 123 4567",
      email: "nguyenvana@email.com",
      licenseNumber: "A123456789",
      idNumber: "123456789",
      address: "123 Le Loi, District 1, HCMC",
      documentsVerified: false,
      licenseVerified: false,
    },
  ]);

  // Mock bookings
  const [bookings, setBookings] = useState<WalkInBooking[]>([]);

  const handleBookingCreate = (booking: WalkInBooking) => {
    setBookings(prev => [...prev, booking]);
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
    setCustomers(prev => [...prev, customer]);
    toast({
      title: "Customer Added",
      description: `${customer.fullName} has been added to the system`,
    });
  };

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
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create instant bookings for walk-in customers
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-booking">New Booking</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="vehicles">Available Vehicles</TabsTrigger>
        </TabsList>

        {/* New Booking Tab */}
        <TabsContent value="new-booking" className="mt-6">
          <WalkInBookingCreation
            customers={customers}
            vehicles={availableVehicles}
            onBookingCreate={handleBookingCreate}
            onCustomerAdd={handleCustomerAdd}
          />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-6">
          <WalkInCustomerManager
            customers={customers}
            onCustomersChange={setCustomers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          <WalkInBookingList
            bookings={bookings}
            customers={customers}
            onBookingConfirm={handleBookingConfirm}
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
