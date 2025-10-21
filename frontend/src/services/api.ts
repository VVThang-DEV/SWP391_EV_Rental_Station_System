// API Service for EV Rental System
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Types
export interface Vehicle {
  vehicleId: number;
  modelId: string;
  stationId: number;
  uniqueVehicleId: string;
  batteryLevel: number;
  maxRangeKm: number;
  status: string;
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  trips: number;
  mileage: number;
  lastMaintenance: string | null;
  inspectionDate: string | null;
  insuranceExpiry: string | null;
  condition: string;
  image: string;
  licensePlate: string;
  fuelEfficiency: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModel {
  modelId: string;
  brand: string;
  modelName: string;
  type: string;
  year: number;
  seats: number;
  features: string;
  description: string;
  image: string;
  pricePerHour: number;
  pricePerDay: number;
  maxRangeKm: number;
  createdAt: string;
  updatedAt: string;
  featuresList: string[];
}

export interface Station {
  stationId: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  city: string;
  availableVehicles: number;
  totalSlots: number;
  amenities: string;
  rating: number;
  operatingHours: string;
  fastCharging: boolean;
  image: string;
}

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      fullName: string;
      role: string;
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    password: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      userId: number;
      email: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendOTP(email: string) {
    return this.request<{
      success: boolean;
      message: string;
      expiresIn: number;
    }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otpCode: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otpCode }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
  }

  async updatePersonalInfo(data: {
    email: string;
    cccd?: string;
    licenseNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/update-personal-info", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      user: {
        userId: number;
        email: string;
        fullName: string;
        phone?: string;
        cccd?: string;
        licenseNumber?: string;
        address?: string;
        gender?: string;
        dateOfBirth?: string;
        position?: string;
        roleName: string;
        createdAt: string;
        updatedAt: string;
      };
    }>("/auth/current-user", {
      method: "GET",
    });
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>("/api/vehicles");
  }

  async getVehicleById(id: number): Promise<Vehicle> {
    return this.request<Vehicle>(`/api/vehicles/${id}`);
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>("/api/vehicles/available");
  }

  async getVehiclesByStation(stationId: number): Promise<Vehicle[]> {
    return this.request<Vehicle[]>(`/api/vehicles/station/${stationId}`);
  }

  // Vehicle Models
  async getVehicleModels(): Promise<VehicleModel[]> {
    return this.request<VehicleModel[]>("/api/VehicleModels");
  }

  async getVehicleModelById(modelId: string): Promise<VehicleModel> {
    return this.request<VehicleModel>(`/api/VehicleModels/${modelId}`);
  }

  async getVehiclesByModel(modelId: string): Promise<Vehicle[]> {
    return this.request<Vehicle[]>(`/api/VehicleModels/${modelId}/vehicles`);
  }

  // Stations
  async getStations(): Promise<Station[]> {
    return this.request<Station[]>("/api/stations");
  }

  async getStationById(id: number): Promise<Station> {
    return this.request<Station>(`/api/stations/${id}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string }>("/health");
  }
}

// Staff API interfaces
export interface StaffProfile {
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  stationId: number | null;
  stationName: string | null;
  stationAddress: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface StationInfo {
  stationId: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  availableVehicles: number;
  totalSlots: number;
  amenities: string[];
  rating: number;
  operatingHours: string;
  fastCharging: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVehicleRequest {
  batteryLevel?: number;
  condition?: string;
  mileage?: number;
  status?: string;
  lastMaintenance?: string;
  inspectionDate?: string;
  notes?: string;
}

export interface AddVehicleRequest {
  modelId: string;
  uniqueVehicleId?: string;
  batteryLevel: number;
  condition: string;
  mileage: number;
  licensePlate?: string;
  location?: string;
  notes?: string;
}

export interface MaintenanceRecordRequest {
  maintenanceType: string;
  description?: string;
  cost?: number;
  completedAt: string;
  notes?: string;
}

export interface MaintenanceRecord {
  maintenanceId: number;
  vehicleId: number;
  vehicleModel: string | null;
  vehicleUniqueId: string | null;
  staffId: number;
  staffName: string | null;
  maintenanceType: string;
  description: string | null;
  cost: number | null;
  completedAt: string;
  createdAt: string;
}

export interface CustomerVerification {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  cccd: string | null;
  licenseNumber: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  hasDocuments: boolean;
  documents: Document[];
  createdAt: string;
}

export interface Document {
  documentId: number;
  documentType: string;
  fileUrl: string;
  status: string | null;
  verifiedAt: string | null;
  verifiedBy: number | null;
  verifiedByName: string | null;
  uploadedAt: string;
}

export interface CustomerVerificationRequest {
  documentType: string;
  status: string; // "approved", "rejected", "pending"
  notes?: string;
}

export interface HandoverRequest {
  rentalId: number;
  type: string; // "pickup", "return"
  conditionNotes?: string;
  imageUrls?: string[];
}

export interface Handover {
  handoverId: number;
  rentalId: number;
  customerId: number | null;
  customerName: string | null;
  vehicleId: number | null;
  vehicleModel: string | null;
  vehicleUniqueId: string | null;
  staffId: number;
  staffName: string | null;
  type: string;
  conditionNotes: string | null;
  imageUrls: string[] | null;
  createdAt: string;
}

// Staff API Service
class StaffApiService {
  private baseUrl = 'http://localhost:5000/api/staff';

  // Staff Profile
  async getStaffProfile(): Promise<StaffProfile> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch staff profile');
    }
    return response.json();
  }

  // Station Info
  async getStationInfo(): Promise<StationInfo> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/station`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch station info');
    }
    return response.json();
  }

  // Vehicle Management
  async getStationVehicles(): Promise<Vehicle[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/vehicles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch station vehicles');
    }
    return response.json();
  }

  async getVehicle(vehicleId: number): Promise<Vehicle> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }
    return response.json();
  }

  async updateVehicle(vehicleId: number, data: UpdateVehicleRequest): Promise<Vehicle> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update vehicle');
    }
    const result = await response.json();
    return result.vehicle;
  }

  async addVehicle(data: AddVehicleRequest): Promise<Vehicle> {
    const response = await fetch(`${this.baseUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add vehicle');
    }
    const result = await response.json();
    return result.vehicle;
  }

  // Maintenance Management
  async recordMaintenance(vehicleId: number, data: MaintenanceRecordRequest): Promise<MaintenanceRecord> {
    const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to record maintenance');
    }
    const result = await response.json();
    return result.record;
  }

  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    const response = await fetch(`${this.baseUrl}/maintenance`);
    if (!response.ok) {
      throw new Error('Failed to fetch maintenance records');
    }
    return response.json();
  }

  // Station Information
  async getStationInfo(): Promise<StationInfo> {
    const response = await fetch(`${this.baseUrl}/station`);
    if (!response.ok) {
      throw new Error('Failed to fetch station info');
    }
    return response.json();
  }

  // Customer Verification
  async getCustomersForVerification(): Promise<CustomerVerification[]> {
    const response = await fetch(`${this.baseUrl}/customers`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers for verification');
    }
    return response.json();
  }

  async verifyCustomer(customerId: number, data: CustomerVerificationRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/customers/${customerId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to verify customer');
    }
  }

  // Handover Management
  async getHandovers(): Promise<Handover[]> {
    const response = await fetch(`${this.baseUrl}/handovers`);
    if (!response.ok) {
      throw new Error('Failed to fetch handovers');
    }
    return response.json();
  }

  async recordHandover(data: HandoverRequest): Promise<Handover> {
    const response = await fetch(`${this.baseUrl}/handovers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to record handover');
    }
    const result = await response.json();
    return result.handover;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export const staffApiService = new StaffApiService();
export default apiService;
