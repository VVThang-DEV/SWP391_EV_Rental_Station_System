// Battery and charging related constants
export const BATTERY_THRESHOLDS = {
  LOW_BATTERY: 20, // Vehicles with battery <= 20% are considered low battery
  CRITICAL_BATTERY: 10, // Vehicles with battery <= 10% are critical
  FULL_BATTERY: 100, // Full battery level
} as const;

// Charging related constants
export const CHARGING_STATUS = {
  NOT_CHARGING: 'not_charging',
  CHARGING: 'charging',
  CHARGED: 'charged',
} as const;

// Vehicle availability status
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  CHARGING: 'charging',
  LOW_BATTERY: 'low_battery',
} as const;

// Battery level categories
export const BATTERY_CATEGORIES = {
  LOW: 'low', // <= 20%
  MEDIUM: 'medium', // 21-50%
  HIGH: 'high', // 51-100%
} as const;

// Helper functions
export const getBatteryCategory = (batteryLevel: number): string => {
  if (batteryLevel <= BATTERY_THRESHOLDS.LOW_BATTERY) {
    return BATTERY_CATEGORIES.LOW;
  } else if (batteryLevel <= 50) {
    return BATTERY_CATEGORIES.MEDIUM;
  } else {
    return BATTERY_CATEGORIES.HIGH;
  }
};

export const isLowBattery = (batteryLevel: number): boolean => {
  return batteryLevel <= BATTERY_THRESHOLDS.LOW_BATTERY;
};

export const isCriticalBattery = (batteryLevel: number): boolean => {
  return batteryLevel <= BATTERY_THRESHOLDS.CRITICAL_BATTERY;
};

export const isAvailableForBooking = (
  availability: string,
  batteryLevel: number,
  isCharging: boolean
): boolean => {
  return (
    availability === VEHICLE_STATUS.AVAILABLE &&
    !isCharging &&
    !isLowBattery(batteryLevel)
  );
};

