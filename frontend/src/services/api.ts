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

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
