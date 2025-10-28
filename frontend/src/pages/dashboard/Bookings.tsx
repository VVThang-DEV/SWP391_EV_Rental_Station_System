import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Phone,
  Eye,
  RotateCcw,
  Edit,
  Loader2,
} from "lucide-react";

interface Reservation {
  reservationId: number;
  userId: number;
  vehicleId: number;
  stationId: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  vehicleName?: string;
  stationName?: string;
}

interface VehicleDetails {
  vehicleId: number;
  modelId: string;
  stationId: number;
  uniqueVehicleId: string;
  status: string;
  pricePerHour: number;
  pricePerDay: number;
  batteryLevel: number;
  maxRangeKm: number;
  image: string;
  vehicleModel?: {
    modelId: string;
    brand: string;
    modelName: string;
    type: string;
    year: number;
    seats: number;
  };
  name?: string;
  brand?: string;
  model?: string;
}

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reservations fetched:', data.reservations);
        setReservations(data.reservations || []);
      } else {
        console.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Check if refund was processed
        if (result.refundAmount && result.refundAmount > 0) {
          const vndAmount = result.refundAmount.toLocaleString('vi-VN');
          const newBalance = result.newBalance?.toLocaleString('vi-VN') || '';
          alert(`Booking cancelled successfully!\n\n💰 Refund Information:\nRefund Amount: ${vndAmount} VND\nNew Wallet Balance: ${newBalance} VND\n\nThe refund has been processed to your wallet.`);
        } else {
          alert('Booking cancelled successfully!');
        }
        
        // Refresh reservations list
        fetchReservations();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('An error occurred while cancelling the booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "active":
      case "in_progress":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
      case "canceled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day(s) ${diffHours % 24} hour(s)`;
    }
    return `${diffHours} hour(s)`;
  };

  const fetchVehicleDetails = async (vehicleId: number) => {
    try {
      console.log('Fetching vehicle details for ID:', vehicleId);
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Vehicle details received:', data);
        setVehicleDetails(data);
      } else {
        console.error('Failed to fetch vehicle details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedBooking(reservation);
    fetchVehicleDetails(reservation.vehicleId);
    setDetailsDialogOpen(true);
  };

  const filteredReservations =
    activeTab === "all"
      ? reservations
      : reservations.filter((reservation) => reservation.status?.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Bookings
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Manage your current and past electric vehicle rentals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <Card key={reservation.reservationId} className="card-premium">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-primary" />
                          Vehicle #{reservation.vehicleId}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reservation ID: #{reservation.reservationId}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Start Time</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(reservation.startTime).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">End Time</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(reservation.endTime).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="text-sm text-muted-foreground">
                            {getDuration(reservation.startTime, reservation.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Station</div>
                          <div className="text-sm text-muted-foreground">
                            Station #{reservation.stationId}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(reservation.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {reservation.status?.toLowerCase() === "pending" && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => cancelReservation(reservation.reservationId)}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all"
                    ? "You haven't made any bookings yet."
                    : `No ${activeTab} bookings found.`}
                </p>
                <Button asChild>
                  <Link to="/vehicles">Browse Vehicles</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Booking Details - #{selectedBooking?.reservationId}
              </DialogTitle>
              <DialogDescription>
                Complete information about your rental booking
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* Vehicle Image */}
                {vehicleDetails && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Vehicle</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                        {vehicleDetails.image ? (
                          <img 
                            src={vehicleDetails.image} 
                            alt={vehicleDetails.vehicleModel?.modelName || vehicleDetails.modelId}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback nếu ảnh lỗi
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '';
                            }}
                          />
                        ) : (
                          <Car className="h-16 w-16 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold mb-2">
                          {vehicleDetails.vehicleModel?.modelName || vehicleDetails.modelId}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {vehicleDetails.vehicleModel?.brand || 'VinFast'} • {vehicleDetails.vehicleModel?.modelName || vehicleDetails.modelId}
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {vehicleDetails.pricePerHour.toLocaleString('vi-VN')} VND/hour
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Status</h3>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>

                {/* Booking Information */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Reservation ID
                      </div>
                      <div className="text-lg font-semibold">
                        #{selectedBooking.reservationId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Vehicle ID
                      </div>
                      <div className="font-mono">
                        {selectedBooking.vehicleId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Station ID
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Station #{selectedBooking.stationId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Period */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Rental Period</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Start Time</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedBooking.startTime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">End Time</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedBooking.endTime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {getDuration(selectedBooking.startTime, selectedBooking.endTime)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created At:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-medium">{selectedBooking.userId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDetailsDialogOpen(false)}
              >
                Close
              </Button>
              <Button>Download Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bookings;

