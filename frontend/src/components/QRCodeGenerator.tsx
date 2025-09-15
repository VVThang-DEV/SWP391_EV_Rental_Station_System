import React from "react";

interface QRCodeGeneratorProps {
  bookingId: string;
  vehicleId: string;
  customerName: string;
  pickupLocation: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  bookingId,
  vehicleId,
  customerName,
  pickupLocation,
  size = 128,
}) => {
  // Create QR code data string with booking information
  const qrData = JSON.stringify({
    bookingId,
    vehicleId,
    customerName,
    pickupLocation,
    timestamp: new Date().toISOString(),
    type: "vehicle_access",
  });

  // Generate QR code URL using a public QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    qrData
  )}`;

  return (
    <div className="flex flex-col items-center space-y-2">
      <img
        src={qrCodeUrl}
        alt="Booking QR Code"
        width={size}
        height={size}
        className="border rounded-lg"
      />
      <p className="text-xs text-muted-foreground text-center">
        Show this QR code to access your vehicle
      </p>
    </div>
  );
};

export default QRCodeGenerator;
