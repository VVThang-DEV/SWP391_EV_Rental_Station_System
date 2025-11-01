import { useState, useEffect } from 'react';
import { 
  staffApiService, 
  StaffProfile, 
  StationInfo, 
  Vehicle, 
  MaintenanceRecord, 
  CustomerVerification, 
  Handover,
  UpdateVehicleRequest,
  AddVehicleRequest,
  MaintenanceRecordRequest,
  CustomerVerificationRequest,
  HandoverRequest
} from '@/services/api';

// Staff Profile Hook
export const useStaffProfile = () => {
  const [data, setData] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getStaffProfile();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Station Info Hook
export const useStationInfo = () => {
  const [data, setData] = useState<StationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getStationInfo();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch station info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Station Vehicles Hook
export const useStationVehicles = () => {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getStationVehicles();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch station vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateVehicle = async (vehicleId: number, updateData: UpdateVehicleRequest) => {
    try {
      const updatedVehicle = await staffApiService.updateVehicle(vehicleId, updateData);
      setData(prev => prev.map(v => v.vehicleId === vehicleId ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update vehicle');
    }
  };

  const addVehicle = async (vehicleData: AddVehicleRequest) => {
    try {
      const newVehicle = await staffApiService.addVehicle(vehicleData);
      setData(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add vehicle');
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData, 
    updateVehicle, 
    addVehicle 
  };
};

// Maintenance Records Hook
export const useMaintenanceRecords = () => {
  const [data, setData] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getMaintenanceRecords();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recordMaintenance = async (vehicleId: number, maintenanceData: MaintenanceRecordRequest) => {
    try {
      const newRecord = await staffApiService.recordMaintenance(vehicleId, maintenanceData);
      setData(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record maintenance');
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData, 
    recordMaintenance 
  };
};

// Customer Verification Hook
export const useCustomerVerification = () => {
  const [data, setData] = useState<CustomerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getCustomersForVerification();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers for verification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verifyCustomer = async (customerId: number, verificationData: CustomerVerificationRequest) => {
    try {
      await staffApiService.verifyCustomer(customerId, verificationData);
      // Refresh data after verification
      await fetchData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to verify customer');
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData, 
    verifyCustomer 
  };
};

// Handovers Hook
export const useHandovers = () => {
  const [data, setData] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getHandovers();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch handovers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recordHandover = async (handoverData: HandoverRequest) => {
    try {
      const newHandover = await staffApiService.recordHandover(handoverData);
      setData(prev => [newHandover, ...prev]);
      return newHandover;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record handover');
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData, 
    recordHandover 
  };
};

// Single Vehicle Hook
export const useVehicle = (vehicleId: number) => {
  const [data, setData] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getVehicle(vehicleId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  const updateVehicle = async (updateData: UpdateVehicleRequest) => {
    try {
      const updatedVehicle = await staffApiService.updateVehicle(vehicleId, updateData);
      setData(updatedVehicle);
      return updatedVehicle;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update vehicle');
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData, 
    updateVehicle 
  };
};

// Pending Vehicles Hook
export const usePendingVehicles = () => {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await staffApiService.getVehiclesByStatus('pending');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData
  };
};