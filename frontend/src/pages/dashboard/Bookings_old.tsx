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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import QRCodeGenerator from "@/components/QRCodeGenerator";

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

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(
    null
  );
  const [modifiedStartDate, setModifiedStartDate] = useState("");
  const [modifiedEndDate, setModifiedEndDate] = useState("");
  const [modifiedLocation, setModifiedLocation] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] =
    useState<Reservation | null>(null);

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
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
                          <div className="text-sm font-medium">
                            Station
                          </div>
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
                        {reservation.status?.toLowerCase() === "active" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Support
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedBookingForDetails(reservation);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </>
                        )}
                        {reservation.status?.toLowerCase() === "pending" && (
                          <>
                            <Dialog
                              open={
                                modifyDialogOpen &&
                                selectedBooking?.id === booking.id
                              }
                              onOpenChange={(open) => {
                                setModifyDialogOpen(open);
                                if (open) {
                                  setSelectedBooking(booking);
                                  setModifiedStartDate(booking.startDate);
                                  setModifiedEndDate(booking.endDate);
                                  setModifiedLocation(booking.pickupLocation);
                                } else {
                                  setSelectedBooking(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modify
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modify Booking</DialogTitle>
                                  <DialogDescription>
                                    You can modify your booking dates and pickup
                                    location. Changes may affect the total cost.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="start-date"
                                      className="text-right"
                                    >
                                      Start Date
                                    </Label>
                                    <Input
                                      id="start-date"
                                      type="date"
                                      value={modifiedStartDate}
                                      onChange={(e) =>
                                        setModifiedStartDate(e.target.value)
                                      }
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="end-date"
                                      className="text-right"
                                    >
                                      End Date
                                    </Label>
                                    <Input
                                      id="end-date"
                                      type="date"
                                      value={modifiedEndDate}
                                      onChange={(e) =>
                                        setModifiedEndDate(e.target.value)
                                      }
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="location"
                                      className="text-right"
                                    >
                                      Location
                                    </Label>
                                    <Input
                                      id="location"
                                      value={modifiedLocation}
                                      onChange={(e) =>
                                        setModifiedLocation(e.target.value)
                                      }
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setModifyDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      // Cập nhật booking trong storage
                                      if (selectedBooking) {
                                        const updated =
                                          bookingStorage.updateBooking(
                                            selectedBooking.id,
                                            {
                                              startDate: modifiedStartDate,
                                              endDate: modifiedEndDate,
                                              pickupLocation: modifiedLocation,
                                            }
                                          );

                                        if (updated) {
                                          // Refresh bookings list
                                          setBookings(
                                            bookingStorage.getAllBookings()
                                          );
                                          console.log(
                                            "Booking updated:",
                                            updated
                                          );
                                        }
                                      }
                                      setModifyDialogOpen(false);
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to cancel this booking?"
                                  )
                                ) {
                                  bookingStorage.deleteBooking(booking.id);
                                  setBookings(bookingStorage.getAllBookings());
                                }
                              }}
                            >
                              Cancel Booking
                            </Button>
                          </>
                        )}
                        {booking.status === "completed" && (
                          <>
                            <Button variant="outline" size="sm">
                              Download Receipt
                            </Button>
                            <Button size="sm" asChild>
                              <Link to={`/vehicles/${booking.vehicleId}/book`}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Book Again
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No bookings found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all"
                    ? "You haven't made any bookings yet."
                    : `No ${activeTab} bookings found.`}
                </p>
                <Button asChild>
                  <a href="/vehicles">Browse Vehicles</a>
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
                Booking Details - {selectedBookingForDetails?.id}
              </DialogTitle>
              <DialogDescription>
                Complete information about your rental booking and receipt
              </DialogDescription>
            </DialogHeader>

            {selectedBookingForDetails && (
              <div className="space-y-6">
                {/* Vehicle Information */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Vehicle
                      </div>
                      <div className="text-lg font-semibold">
                        {selectedBookingForDetails.vehicle}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Vehicle ID
                      </div>
                      <div className="font-mono">
                        {selectedBookingForDetails.vehicleId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Pickup Location
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedBookingForDetails.pickupLocation}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Status
                      </div>
                      {getStatusBadge(selectedBookingForDetails.status)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Rental Period
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium">Start Date</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {selectedBookingForDetails.startDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">End Date</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {selectedBookingForDetails.endDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Duration</div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {selectedBookingForDetails.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Receipt</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Rental Rate (per day)</span>
                      <span>
                        $
                        {(selectedBookingForDetails.totalCost * 0.7).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration Cost</span>
                      <span>
                        $
                        {(selectedBookingForDetails.totalCost * 0.2).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>
                        $
                        {(selectedBookingForDetails.totalCost * 0.05).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>
                        $
                        {(selectedBookingForDetails.totalCost * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>
                        ${selectedBookingForDetails.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    Booking QR Code
                  </h3>
                  <div className="flex justify-center">
                    <QRCodeGenerator
                      bookingId={selectedBookingForDetails.id}
                      vehicleId={selectedBookingForDetails.vehicleId}
                      customerName="John Doe" // This would come from user context
                      pickupLocation={selectedBookingForDetails.pickupLocation}
                      size={150}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    This QR code contains your booking information for
                    verification
                  </p>
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
