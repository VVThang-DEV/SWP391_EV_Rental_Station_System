export interface WalkInCustomer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  idNumber: string;
  address: string;
  documentsVerified: boolean;
  licenseVerified: boolean;
}

export interface WalkInBooking {
  id: string;
  customerId: string;
  vehicleId: string;
  vehicleName: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalCost: number;
  deposit: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: "cash" | "card" | "qr";
  paymentStatus: "pending" | "paid" | "refunded";
}

export interface WalkInVehicle {
  id: string;
  name: string;
  batteryLevel: number;
  location: string;
  pricePerHour: number;
  status: "available" | "rented" | "maintenance";
}

export interface WalkInBookingForm {
  customerId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalCost: number;
  deposit: number;
  paymentMethod: "cash" | "card" | "qr";
}

export interface WalkInCustomerForm {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  idNumber: string;
  address: string;
}
