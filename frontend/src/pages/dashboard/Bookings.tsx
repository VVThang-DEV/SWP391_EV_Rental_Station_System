import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { bookingStorage, BookingData } from "@/lib/booking-storage";
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
} from "lucide-react";

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [modifiedStartDate, setModifiedStartDate] = useState("");
  const [modifiedEndDate, setModifiedEndDate] = useState("");
  const [modifiedLocation, setModifiedLocation] = useState("");

  useEffect(() => {
    // Lấy dữ liệu bookings thực từ storage
    const allBookings = bookingStorage.getAllBookings();
    setBookings(allBookings);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="badge-available">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "upcoming":
        return <Badge className="badge-maintenance">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === activeTab);

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
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="card-premium">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-primary" />
                          {booking.vehicle}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Booking ID: {booking.id}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Pickup Slot</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.rentalDuration === 'daily'
                              ? `${booking.startTime}-${booking.endTime}`
                              : `${booking.startDate} ${booking.startTime}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Return Slot</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.rentalDuration === 'daily'
                              ? `${booking.startTime}-${booking.endTime}`
                              : `${booking.endDate} ${booking.endTime}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">
                           Location 
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.pickupLocation}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          ${booking.totalCost}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Cost
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {booking.status === "active" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Support
                            </Button>
                            <Button size="sm" asChild>
                              <Link to={`/vehicles/${booking.vehicleId}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </>
                        )}
                        {booking.status === "upcoming" && (
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
                                        const updated = bookingStorage.updateBooking(selectedBooking.id, {
                                          startDate: modifiedStartDate,
                                          endDate: modifiedEndDate,
                                          pickupLocation: modifiedLocation,
                                        });

                                        if (updated) {
                                          // Refresh bookings list
                                          setBookings(bookingStorage.getAllBookings());
                                          console.log("Booking updated:", updated);
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
                                if (window.confirm("Are you sure you want to cancel this booking?")) {
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
      </div>
    </div>
  );
};

export default Bookings;
