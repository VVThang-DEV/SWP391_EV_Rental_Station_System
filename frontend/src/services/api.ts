// API Service for EV Rental System
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Types
export interface Vehicle {
  vehicle_id: number;
  model_id: string;
  station_id: number;
  unique_vehicle_id: string;
  battery_level: number;
  max_range_km: number;
  status: string;
  price_per_hour: number;
  price_per_day: number;
  rating: number;
  review_count: number;
  trips: number;
  mileage: number;
  last_maintenance: string | null;
  inspection_date: string | null;
  insurance_expiry: string | null;
  condition: string;
  image: string;
  license_plate: string;
  fuel_efficiency: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleModel {
  model_id: string;
  brand: string;
  model_name: string;
  type: string;
  year: number;
  seats: number;
  features: string;
  description: string;
  image: string;
  price_per_hour: number;
  price_per_day: number;
  max_range_km: number;
  created_at: string;
  updated_at: string;
  features_list: string[];
}

export interface Station {
  station_id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  city: string;
  available_vehicles: number;
  total_slots: number;
  amenities: string;
  rating: number;
  operating_hours: string;
  fast_charging: boolean;
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
