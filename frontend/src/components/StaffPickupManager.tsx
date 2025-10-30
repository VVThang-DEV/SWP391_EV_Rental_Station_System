import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  QrCode,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Car,
  Calendar,
  Shield,
  X,
  Eye,
} from "lucide-react";
import VehicleUnlockConfirmation from "./VehicleUnlockConfirmation";
import { useToast } from "@/hooks/use-toast";
import { usePendingVehicles } from "@/hooks/useStaffApi";
import { staffApiService } from "@/services/api";

interface PendingBooking {
  bookingId: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  totalAmount: number;
  depositAmount: number;
  documentsVerified: boolean;
  licenseVerified: boolean;
  qrScanned: boolean;
  status: "pending" | "ready" | "incomplete";
}

const StaffPickupManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(
    null
  );
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { toast } = useToast();

  // Load pending pickups from API
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: pendingVehicles, refetch: refetchPendingVehicles } = usePendingVehicles();

  // Fetch pending customers for verification
  useEffect(() => {
    const loadPendingPickups = async () => {
      try {
        setLoading(true);
        const customers = await staffApiService.getCustomersForVerification();
        console.log("📦 Loaded customers for pickup:", customers);
        
        // Map API data to PendingBooking format
        const mappedBookings: PendingBooking[] = customers.map((customer: any) => {
          const hasDocuments = customer.documents && customer.documents.length > 0;
          const allDocsApproved = hasDocuments && customer.documents.every((doc: any) => doc.status === 'approved');
          const hasLicense = customer.documents && customer.documents.some((doc: any) => 
            doc.documentType === 'driverLicense' && doc.status === 'approved'
          );
          
          // Determine status based on verifications
          let status: "pending" | "ready" | "incomplete" = "pending";
          if (allDocsApproved && hasLicense) {
            status = "ready";
          } else if (hasDocuments && !allDocsApproved) {
            status = "incomplete";
          }
          
          // Parse pickup date/time from StartTime
          let pickupDate = "N/A";
          let pickupTime = "N/A";
          let returnDate = "N/A";
          let returnTime = "N/A";
          
          try {
            if (customer.startTime) {
              const start = new Date(customer.startTime);
              if (!isNaN(start.getTime())) {
                pickupDate = start.toLocaleDateString('en-CA'); // YYYY-MM-DD format
                pickupTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              }
            }
            
            if (customer.endTime) {
              const end = new Date(customer.endTime);
              if (!isNaN(end.getTime())) {
                returnDate = end.toLocaleDateString('en-CA');
                returnTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              }
            }
          } catch (err) {
            console.warn("Invalid date for reservation:", customer.reservationId);
          }
          
          return {
            bookingId: customer.reservationId?.toString() || `BK${customer.userId}`,
            vehicleId: customer.vehicleId?.toString() || "N/A",
            vehicleName: customer.vehicleModel || "Unknown Vehicle",
            customerName: customer.fullName || "Unknown",
            customerPhone: customer.phone || "N/A",
            pickupLocation: "Station", // Can be enhanced with actual station data
            pickupDate: pickupDate,
            pickupTime: pickupTime,
            returnDate: returnDate,
            returnTime: returnTime,
            totalAmount: customer.totalAmount || 0,
            depositAmount: customer.depositAmount || 0,
            documentsVerified: allDocsApproved,
            licenseVerified: hasLicense,
            qrScanned: false, // Will be updated when QR is scanned
            status: status,
          };
        });
        
        setBookings(mappedBookings);
      } catch (error) {
        console.error("Error loading pending pickups:", error);
        toast({
          title: "Error",
          description: "Failed to load pending pickups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPendingPickups();
  }, [toast]);

  const handleQRScanned = (bookingId: string) => {
    // In real app, this would be triggered by external QR scanner
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === bookingId) {
          const updated = { ...b, qrScanned: true };
          // Auto-update status if all verifications complete
          if (updated.qrScanned && updated.documentsVerified && updated.licenseVerified) {
            updated.status = "ready";
          }
          return updated;
        }
        return b;
      })
    );
    toast({
      title: "QR Code Scanned",
      description: `Booking ${bookingId} QR code verified successfully`,
    });
  };

  const handleVerifyDocuments = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === bookingId) {
          const updated = { ...b, documentsVerified: true };
          // Auto-update status if all verifications complete
          if (updated.qrScanned && updated.documentsVerified && updated.licenseVerified) {
            updated.status = "ready";
          }
          return updated;
        }
        return b;
      })
    );
    toast({
      title: "Documents Verified",
      description: "Customer documents have been verified",
    });
  };

  const handleVerifyLicense = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === bookingId) {
          const updated = { ...b, licenseVerified: true };
          // Auto-update status if all verifications complete
          if (updated.qrScanned && updated.documentsVerified && updated.licenseVerified) {
            updated.status = "ready";
          }
          return updated;
        }
        return b;
      })
    );
    toast({
      title: "License Verified",
      description: "Driver's license has been verified",
    });
  };

  const handleReviewPickup = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    setIsConfirmationOpen(true);
  };

  const handleConfirmUnlock = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      console.log(`[Confirm Unlock] Processing reservation ${bookingId}`);
      
      // Call API to confirm reservation and unlock vehicle
      const response = await fetch(`http://localhost:5000/api/staff/reservations/${bookingId}/confirm`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Confirm Unlock] Failed:", errorData);
        throw new Error(errorData.message || "Failed to confirm reservation");
      }

      const result = await response.json();
      console.log("[Confirm Unlock] Success:", result);

      // Remove from pending list
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      
      toast({
        title: "✅ Vehicle Unlocked",
        description: "Customer can now access the vehicle. Reservation confirmed.",
      });

      // Refresh data
      refetchPendingVehicles();
    } catch (error) {
      console.error("Error confirming unlock:", error);
      toast({
        title: "❌ Failed to Unlock",
        description: error instanceof Error ? error.message : "Could not confirm reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDenyPickup = async (bookingId: string, reason: string) => {
    try {
      const token = localStorage.getItem("token");
      
      console.log(`[Deny Pickup] Cancelling booking ${bookingId} with reason: ${reason}`);
      
      // Call API to cancel/deny the reservation
      const response = await fetch(`http://localhost:5000/api/reservations/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason,
          cancelledBy: "staff",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Deny Pickup] Failed:", errorData);
        throw new Error(errorData.message || "Failed to deny pickup");
      }

      const result = await response.json();
      console.log("[Deny Pickup] Success:", result);

      // Remove from local state
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      
      toast({
        title: "Pickup Denied",
        description: `Booking ${bookingId} has been cancelled. Customer will be notified.`,
        variant: "destructive",
      });

      // Refetch to ensure data is in sync
      refetchPendingVehicles();
    } catch (error) {
      console.error("Error denying pickup:", error);
      toast({
        title: "Failed to Deny Pickup",
        description: error instanceof Error ? error.message : "Could not cancel the booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (booking: PendingBooking) => {
    if (booking.status === "ready") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    } else if (booking.status === "incomplete") {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const readyBookings = filteredBookings.filter((b) => b.status === "ready");
  const incompleteBookings = filteredBookings.filter(
    (b) => b.status === "incomplete"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                Vehicle Pickup Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Scan QR codes, verify documents, and confirm vehicle pickups
              </p>
            </div>
            <div className="flex gap-2">
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {readyBookings.length}
                </div>
                <div className="text-xs text-green-700">Ready</div>
              </div>
              <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {incompleteBookings.length}
                </div>
                <div className="text-xs text-yellow-700">Incomplete</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking ID, customer name, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for filtering */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            All Pending ({filteredBookings.length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({readyBookings.length})
          </TabsTrigger>
          <TabsTrigger value="incomplete">
            Incomplete ({incompleteBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading pending pickups...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PendingPickupsTable
              bookings={filteredBookings}
              onQRScanned={handleQRScanned}
              onVerifyDocuments={handleVerifyDocuments}
              onVerifyLicense={handleVerifyLicense}
              onReviewPickup={handleReviewPickup}
              getStatusBadge={getStatusBadge}
            />
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading ready pickups...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PendingPickupsTable
              bookings={readyBookings}
              onQRScanned={handleQRScanned}
              onVerifyDocuments={handleVerifyDocuments}
              onVerifyLicense={handleVerifyLicense}
              onReviewPickup={handleReviewPickup}
              getStatusBadge={getStatusBadge}
            />
          )}
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading incomplete pickups...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PendingPickupsTable
              bookings={incompleteBookings}
              onQRScanned={handleQRScanned}
              onVerifyDocuments={handleVerifyDocuments}
              onVerifyLicense={handleVerifyLicense}
              onReviewPickup={handleReviewPickup}
              getStatusBadge={getStatusBadge}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <VehicleUnlockConfirmation
        booking={
          selectedBooking
            ? {
                ...selectedBooking,
              }
            : null
        }
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmUnlock}
        onDeny={handleDenyPickup}
      />
    </div>
  );
};

interface PendingPickupsTableProps {
  bookings: PendingBooking[];
  onQRScanned: (bookingId: string) => void;
  onVerifyDocuments: (bookingId: string) => void;
  onVerifyLicense: (bookingId: string) => void;
  onReviewPickup: (booking: PendingBooking) => void;
  getStatusBadge: (booking: PendingBooking) => React.ReactNode;
}

const PendingPickupsTable: React.FC<PendingPickupsTableProps> = ({
  bookings,
  onQRScanned,
  onVerifyDocuments,
  onVerifyLicense,
  onReviewPickup,
  getStatusBadge,
}) => {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">
            No bookings found
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for pending pickups
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Verifications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.bookingId}>
                <TableCell>
                  <div className="font-mono font-semibold">
                    {booking.bookingId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.customerPhone}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{booking.vehicleName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.vehicleId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{booking.pickupDate}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.pickupTime}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      {booking.qrScanned ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          QR
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQRScanned(booking.bookingId)}
                          className="text-xs h-6"
                        >
                          <QrCode className="h-3 w-3 mr-1" />
                          Scan QR
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {booking.licenseVerified ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          License
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVerifyLicense(booking.bookingId)}
                          className="text-xs h-6"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          License
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {booking.documentsVerified ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Docs
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVerifyDocuments(booking.bookingId)}
                          className="text-xs h-6"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Docs
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(booking)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onReviewPickup(booking)}
                    disabled={booking.status !== "ready"}
                    className={
                      booking.status === "ready"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffPickupManager;
