import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Plus,
  DollarSign,
  Clock,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalkInCustomer, WalkInVehicle, WalkInBookingForm } from "./types";
import WalkInVehicleSelector from "./WalkInVehicleSelector";

interface WalkInBookingCreationProps {
  customers: WalkInCustomer[];
  vehicles: WalkInVehicle[];
  onBookingCreate: (booking: any) => void;
  onCustomerAdd: (customer: WalkInCustomer) => void;
  staffStationId: number | null;
}

const WalkInBookingCreation: React.FC<WalkInBookingCreationProps> = ({
  customers,
  vehicles,
  onBookingCreate,
  onCustomerAdd,
  staffStationId,
}) => {
  const [bookingForm, setBookingForm] = useState<WalkInBookingForm>({
    customerId: "",
    vehicleId: "",
    startTime: "",
    endTime: "",
    duration: 0,
    totalCost: 0,
    deposit: 0,
    paymentMethod: "cash",
  });

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    idNumber: "",
    licenseNumber: "",
    address: "",
  });

  const { toast } = useToast();

  const calculateCost = (vehicleId: string, duration: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 0;
    
    const hourlyRate = vehicle.pricePerHour || 50;
    return hourlyRate * duration;
  };

  const handleDurationChange = (duration: number) => {
    const cost = calculateCost(bookingForm.vehicleId, duration);
    const deposit = Math.round(cost * 0.3); // 30% deposit
    
    setBookingForm(prev => ({
      ...prev,
      duration,
      totalCost: cost,
      deposit,
    }));
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setBookingForm(prev => ({ ...prev, vehicleId }));
    
    // Recalculate cost if duration is already set
    if (bookingForm.duration > 0) {
      const cost = calculateCost(vehicleId, bookingForm.duration);
      const deposit = Math.round(cost * 0.3);
      setBookingForm(prev => ({
        ...prev,
        vehicleId,
        totalCost: cost,
        deposit,
      }));
    }
  };


  const handleCreateBooking = async () => {
    // Validate customer information
    if (!newCustomer.fullName || !newCustomer.phone || !newCustomer.licenseNumber) {
      toast({
        title: "Missing Customer Information",
        description: "Please fill in all required customer fields",
        variant: "destructive",
      });
      return;
    }

    if (!bookingForm.vehicleId || !bookingForm.startTime) {
      toast({
        title: "Missing Information",
        description: "Please select vehicle and start time",
        variant: "destructive",
      });
      return;
    }

    const vehicle = vehicles.find(v => v.id === bookingForm.vehicleId);
    
    if (!vehicle) {
      toast({
        title: "Error",
        description: "Vehicle not found",
        variant: "destructive",
      });
      return;
    }

    // Calculate end time
    const startTime = new Date(bookingForm.startTime);
    const endTime = new Date(startTime.getTime() + bookingForm.duration * 60 * 60 * 1000);

    try {
      // Call API to create walk-in booking
      const token = localStorage.getItem('token');
      
      // Use the real vehicleId and stationId from API vehicle data
      // Priority: staff's station > vehicle's station > default
      const vehicleIdToSend = vehicle.vehicleId || parseInt(bookingForm.vehicleId) || 1;
      const stationIdToSend = staffStationId || vehicle.stationId || 1;
      
      console.log('Creating walk-in booking with:', {
        vehicleId: vehicleIdToSend,
        stationId: stationIdToSend,
        staffStationId: staffStationId,
        vehicle: vehicle
      });

      const response = await fetch('http://localhost:5000/api/staff/walkin-bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newCustomer.fullName,
          phone: newCustomer.phone,
          email: newCustomer.email || undefined,
          licenseNumber: newCustomer.licenseNumber,
          idNumber: newCustomer.idNumber || undefined,
          address: newCustomer.address || undefined,
          dateOfBirth: newCustomer.dateOfBirth || undefined,
          vehicleId: vehicleIdToSend,
          stationId: stationIdToSend,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          paymentMethod: bookingForm.paymentMethod,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Create customer object for local state
        const customer: WalkInCustomer = {
          id: result.userId?.toString() || `C${Date.now()}`,
          fullName: newCustomer.fullName,
          phone: newCustomer.phone,
          email: newCustomer.email,
          licenseNumber: newCustomer.licenseNumber,
          idNumber: newCustomer.idNumber,
          address: newCustomer.address,
          documentsVerified: false,
          licenseVerified: false,
        };

        // Add customer to the list
        onCustomerAdd(customer);

        // Create booking object for local state
        const booking = {
          id: result.reservation?.reservationId?.toString() || `BK${Date.now()}`,
          customerId: customer.id,
          vehicleId: bookingForm.vehicleId,
          vehicleName: vehicle.name,
          startTime: bookingForm.startTime,
          endTime: endTime.toISOString(),
          duration: bookingForm.duration,
          totalCost: bookingForm.totalCost,
          deposit: bookingForm.deposit,
          status: "pending",
          paymentMethod: bookingForm.paymentMethod,
          paymentStatus: "pending",
        };

        onBookingCreate(booking);
        
        // Reset forms
        setBookingForm({
          customerId: "",
          vehicleId: "",
          startTime: "",
          endTime: "",
          duration: 0,
          totalCost: 0,
          deposit: 0,
          paymentMethod: "cash",
        });

        setNewCustomer({
          fullName: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          idNumber: "",
          licenseNumber: "",
          address: "",
        });

        // Don't show toast here - let parent component handle it
        // toast({
        //   title: "Booking Created Successfully!",
        //   description: `Walk-in booking created for ${customer.fullName}. Confirmation email sent to customer.`,
        // });
      } else {
        toast({
          title: "Failed to Create Booking",
          description: result.message || "An error occurred while creating the booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      toast({
        title: "Error",
        description: "Failed to create walk-in booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === bookingForm.vehicleId);

  return (
    <div className="space-y-6">
      {/* Customer and Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Walk-in Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Customer Information</Label>
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700">Customer Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newCustomer.fullName}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+84 90 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newCustomer.dateOfBirth}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number (CCCD/CMND)</Label>
                    <Input
                      id="idNumber"
                      value={newCustomer.idNumber}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      value={newCustomer.licenseNumber}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="A123456789"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Le Loi, District 1, HCMC"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <Select
                value={bookingForm.paymentMethod}
                onValueChange={(value: "cash" | "qr") => 
                  setBookingForm(prev => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                min="1"
                max="24"
                value={bookingForm.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Selection */}
      {vehicles.length > 0 ? (
        <WalkInVehicleSelector
          vehicles={vehicles}
          selectedVehicleId={bookingForm.vehicleId}
          onVehicleSelect={handleVehicleSelect}
        />
      ) : (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="text-center py-8">
            <p className="text-yellow-800 font-medium">
              No vehicles available at your station at the moment
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Please check back later or contact your administrator
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      {bookingForm.totalCost > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-green-700">Customer</p>
                <p className="font-semibold text-green-800">
                  {newCustomer.fullName || "Not filled"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Vehicle</p>
                <p className="font-semibold text-green-800">
                  {selectedVehicle?.name || "Not selected"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Duration</p>
                <p className="font-semibold text-green-800 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {bookingForm.duration}h
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-700">Total Cost</p>
                  <p className="text-2xl font-bold text-green-800">
                    ${bookingForm.totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-700">Deposit (30%)</p>
                  <p className="text-lg font-semibold text-green-800">
                    ${bookingForm.deposit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Booking Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleCreateBooking}
          disabled={!newCustomer.fullName || !newCustomer.phone || !newCustomer.licenseNumber || !bookingForm.vehicleId || !bookingForm.startTime}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Create Booking
        </Button>
      </div>
    </div>
  );
};

export default WalkInBookingCreation;
