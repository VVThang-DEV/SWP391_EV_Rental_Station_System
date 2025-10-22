import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChargingContextType {
  chargingVehicles: Set<string>;
  setChargingVehicles: (vehicles: Set<string>) => void;
  addChargingVehicle: (vehicleId: string) => void;
  removeChargingVehicle: (vehicleId: string) => void;
}

const ChargingContext = createContext<ChargingContextType | undefined>(undefined);

export const useChargingContext = () => {
  const context = useContext(ChargingContext);
  if (!context) {
    throw new Error('useChargingContext must be used within a ChargingProvider');
  }
  return context;
};

interface ChargingProviderProps {
  children: ReactNode;
}

export const ChargingProvider: React.FC<ChargingProviderProps> = ({ children }) => {
  const [chargingVehicles, setChargingVehicles] = useState<Set<string>>(new Set());

  const addChargingVehicle = (vehicleId: string) => {
    setChargingVehicles(prev => new Set([...prev, vehicleId]));
  };

  const removeChargingVehicle = (vehicleId: string) => {
    setChargingVehicles(prev => {
      const newSet = new Set(prev);
      newSet.delete(vehicleId);
      return newSet;
    });
  };

  return (
    <ChargingContext.Provider value={{
      chargingVehicles,
      setChargingVehicles,
      addChargingVehicle,
      removeChargingVehicle
    }}>
      {children}
    </ChargingContext.Provider>
  );
};

