import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  MapPin,
  QrCode,
  User,
  Shield,
  Key,
  X,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
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
}

interface VehicleUnlockConfirmationProps {
  booking: BookingDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
  onDeny: (bookingId: string, reason: string) => void;
}

const VehicleUnlockConfirmation: React.FC<VehicleUnlockConfirmationProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  onDeny,
}) => {
  const [confirmationStep, setConfirmationStep] = useState<"review" | "deny">(
    "review"
  );
  const [denyReason, setDenyReason] = useState("");
  const { toast } = useToast();

  const handleConfirmUnlock = () => {
    if (booking) {
      onConfirm(booking.bookingId);
      toast({
        title: "Vehicle Unlocked",
        description: `${booking.vehicleName} has been unlocked for ${booking.customerName}`,
      });
      resetAndClose();
    }
  };

  const handleDeny = () => {
    if (booking && denyReason.trim()) {
      onDeny(booking.bookingId, denyReason);
      toast({
        title: "Pickup Denied",
        description: "Customer has been notified of the issue.",
        variant: "destructive",
      });
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setConfirmationStep("review");
    setDenyReason("");
    onClose();
  };

  if (!booking) return null;

  const allVerified = booking.documentsVerified && booking.licenseVerified;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {confirmationStep === "review" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Vehicle Pickup Confirmation
              </DialogTitle>
              <DialogDescription>
                Review booking details and confirm vehicle unlock
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Verification Status Alert */}
              {allVerified ? (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    All Verifications Complete
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    Customer documents and license have been verified. Ready for
                    pickup.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Incomplete</AlertTitle>
                  <AlertDescription>
                    Please verify all documents before confirming pickup.
                  </AlertDescription>
                </Alert>
              )}

              {/* Booking Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Booking ID
                      </Label>
                      <div className="font-mono font-semibold">
                        {booking.bookingId}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Status
                      </Label>
                      <div>
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          Pending Pickup
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Full Name
                      </Label>
                      <div className="font-semibold">{booking.customerName}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Phone Number
                      </Label>
                      <div className="font-semibold">
                        {booking.customerPhone}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Document Verification Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Verification Status
                    </Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Driver's License</span>
                      {booking.licenseVerified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Not Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Identity Documents</span>
                      {booking.documentsVerified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Not Verified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Vehicle
                      </Label>
                      <div className="font-semibold">{booking.vehicleName}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Vehicle ID
                      </Label>
                      <div className="font-mono font-semibold">
                        {booking.vehicleId}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Pickup Location
                    </Label>
                    <div className="font-semibold">
                      {booking.pickupLocation}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Period */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Rental Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Pickup
                      </Label>
                      <div className="font-semibold">{booking.pickupDate}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.pickupTime}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Return
                      </Label>
                      <div className="font-semibold">{booking.returnDate}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.returnTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-lg">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Deposit Collected
                    </span>
                    <span className="font-semibold text-green-600">
                      {booking.depositAmount.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Payment Status</span>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setConfirmationStep("deny")}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <X className="mr-2 h-4 w-4" />
                Deny Pickup
              </Button>
              <Button
                onClick={handleConfirmUnlock}
                disabled={!allVerified}
                className="bg-green-600 hover:bg-green-700"
              >
                <Key className="mr-2 h-4 w-4" />
                Confirm & Unlock Vehicle
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
                <AlertCircle className="h-6 w-6" />
                Deny Vehicle Pickup
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for denying this pickup
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="font-semibold">{booking.customerName}</div>
                <div className="text-sm text-muted-foreground">
                  Booking ID: {booking.bookingId}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deny-reason">Reason for Denial *</Label>
                <textarea
                  id="deny-reason"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                  placeholder="e.g., Invalid driver's license, Documents expired, Customer failed identity verification..."
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                />
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The customer will be notified and this booking will be marked
                  as denied. This action cannot be undone.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setConfirmationStep("review")}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleDeny}
                disabled={!denyReason.trim()}
                variant="destructive"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Confirm Denial
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleUnlockConfirmation;
