import { useState, useEffect } from 'react';
import { apiService, Vehicle, VehicleModel, Station } from '@/services/api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Specific hooks for different API endpoints
export function useVehicles() {
  return useApi(() => apiService.getVehicles());
}

export function useAvailableVehicles() {
  return useApi(() => apiService.getAvailableVehicles());
}

export function useVehicleModels() {
  return useApi(() => apiService.getVehicleModels());
}

export function useStations() {
  return useApi(() => apiService.getStations());
}

export function useVehicleById(id: number) {
  return useApi(() => apiService.getVehicleById(id), [id]);
}

export function useVehicleModelById(modelId: string) {
  return useApi(() => apiService.getVehicleModelById(modelId), [modelId]);
}

export function useStationById(id: number) {
  return useApi(() => apiService.getStationById(id), [id]);
}

export function useVehiclesByStation(stationId: number) {
  return useApi(() => apiService.getVehiclesByStation(stationId), [stationId]);
}

export function useVehiclesByModel(modelId: string) {
  return useApi(() => apiService.getVehiclesByModel(modelId), [modelId]);
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.login(email, password);
      
      // Store token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);
      localStorage.setItem('fullName', result.fullName);
      
      setUser({
        email,
        fullName: result.fullName,
        role: result.role,
        token: result.token
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.register(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    setUser(null);
  };

  const sendOTP = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.sendOTP(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.verifyOTP(email, otpCode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.forgotPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, otpCode: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.resetPassword(email, otpCode, newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = async (data: {
    email: string;
    cccd?: string;
    licenseNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.updatePersonalInfo(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update personal info';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('fullName');
    
    if (token && role && fullName) {
      setUser({
        role,
        fullName,
        token
      });
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    updatePersonalInfo
  };
}
