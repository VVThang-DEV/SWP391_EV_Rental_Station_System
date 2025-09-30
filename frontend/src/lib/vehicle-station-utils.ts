import { Vehicle } from "@/components/VehicleCard";
import { Station } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";

// Vehicle model information
export interface VehicleModel {
  modelId: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  image: string;
  basePrice: {
    perHour: number;
    perDay: number;
  };
  specs: {
    range: number;
    seats: number;
    features: string[];
  };
  description: string;
}

// Station with vehicle availability info
export interface StationWithVehicles extends Station {
  availableModels: {
    modelId: string;
    count: number;
    vehicles: Vehicle[];
  }[];
  totalAvailableVehicles: number;
}

// Location data with distance calculation
export interface StationLocation extends Station {
  distance?: number; // in kilometers
  availableVehiclesByModel: Map<string, Vehicle[]>;
}

/**
 * Get all unique vehicle models from the vehicle data
 */
export const getVehicleModels = (): VehicleModel[] => {
  const vehicles = getVehicles("en");
  const modelMap = new Map<string, VehicleModel>();

  vehicles.forEach((vehicle) => {
    if (!modelMap.has(vehicle.modelId)) {
      modelMap.set(vehicle.modelId, {
        modelId: vehicle.modelId,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        image: vehicle.image,
        basePrice: {
          perHour: vehicle.pricePerHour,
          perDay: vehicle.pricePerDay,
        },
        specs: {
          range: vehicle.range,
          seats: vehicle.seats,
          features: vehicle.features,
        },
        description: vehicle.description,
      });
    }
  });

  return Array.from(modelMap.values());
};

/**
 * Find all stations that have a specific vehicle model available
 */
export const findStationsWithModel = (
  modelId: string,
  userLocation?: { lat: number; lng: number }
): StationLocation[] => {
  const vehicles = getVehicles("en");
  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.modelId === modelId && vehicle.availability === "available"
  );

  const stationMap = new Map<string, StationLocation>();

  availableVehicles.forEach((vehicle) => {
    const station = stations.find((s) => s.id === vehicle.stationId);
    if (station) {
      if (!stationMap.has(station.id)) {
        const stationLocation: StationLocation = {
          ...station,
          availableVehiclesByModel: new Map(),
        };

        // Calculate distance if user location provided
        if (userLocation) {
          stationLocation.distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            station.coordinates.lat,
            station.coordinates.lng
          );
        }

        stationMap.set(station.id, stationLocation);
      }

      const stationData = stationMap.get(station.id)!;
      if (!stationData.availableVehiclesByModel.has(modelId)) {
        stationData.availableVehiclesByModel.set(modelId, []);
      }
      stationData.availableVehiclesByModel.get(modelId)!.push(vehicle);
    }
  });

  const result = Array.from(stationMap.values());

  // Sort by distance if user location provided
  if (userLocation) {
    result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return result;
};

/**
 * Get enhanced station data with vehicle model information
 */
export const getStationsWithVehicleInfo = (): StationWithVehicles[] => {
  const vehicles = getVehicles("en");

  return stations.map((station) => {
    const stationVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.stationId === station.id && vehicle.availability === "available"
    );

    const modelMap = new Map<string, Vehicle[]>();
    stationVehicles.forEach((vehicle) => {
      if (!modelMap.has(vehicle.modelId)) {
        modelMap.set(vehicle.modelId, []);
      }
      modelMap.get(vehicle.modelId)!.push(vehicle);
    });

    const availableModels = Array.from(modelMap.entries()).map(
      ([modelId, vehicleList]) => ({
        modelId,
        count: vehicleList.length,
        vehicles: vehicleList,
      })
    );

    return {
      ...station,
      availableModels,
      totalAvailableVehicles: stationVehicles.length,
    };
  });
};

/**
 * Search for stations by vehicle model name or brand
 */
export const searchStationsByVehicle = (
  query: string
): StationWithVehicles[] => {
  const stationsWithVehicles = getStationsWithVehicleInfo();
  const searchTerm = query.toLowerCase();

  return stationsWithVehicles.filter((station) => {
    const vehicles = getVehicles("en");
    const stationVehicles = vehicles.filter(
      (vehicle) => vehicle.stationId === station.id
    );

    return stationVehicles.some(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(searchTerm) ||
        vehicle.brand.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm)
    );
  });
};

/**
 * Get recommended stations based on user preferences
 */
export interface UserPreferences {
  preferredModels: string[];
  maxDistance?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  requiredFeatures?: string[];
}

export const getRecommendedStations = (
  preferences: UserPreferences,
  userLocation?: { lat: number; lng: number }
): StationLocation[] => {
  let recommendedStations: StationLocation[] = [];

  // Find stations with preferred models
  preferences.preferredModels.forEach((modelId) => {
    const stationsWithModel = findStationsWithModel(modelId, userLocation);
    recommendedStations = [...recommendedStations, ...stationsWithModel];
  });

  // Remove duplicates
  const uniqueStations = recommendedStations.filter(
    (station, index, self) =>
      index === self.findIndex((s) => s.id === station.id)
  );

  // Apply filters
  let filteredStations = uniqueStations;

  if (preferences.maxDistance && userLocation) {
    filteredStations = filteredStations.filter(
      (station) => (station.distance || 0) <= preferences.maxDistance!
    );
  }

  if (preferences.priceRange) {
    const vehicles = getVehicles("en");
    filteredStations = filteredStations.filter((station) => {
      const stationVehicles = vehicles.filter(
        (vehicle) =>
          vehicle.stationId === station.id &&
          preferences.preferredModels.includes(vehicle.modelId)
      );

      return stationVehicles.some(
        (vehicle) =>
          vehicle.pricePerHour >= preferences.priceRange!.min &&
          vehicle.pricePerHour <= preferences.priceRange!.max
      );
    });
  }

  return filteredStations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Get vehicle availability summary across all stations
 */
export const getVehicleAvailabilitySummary = () => {
  const vehicles = getVehicles("en");
  const models = getVehicleModels();

  return models.map((model) => {
    const modelVehicles = vehicles.filter((v) => v.modelId === model.modelId);
    const availableVehicles = modelVehicles.filter(
      (v) => v.availability === "available"
    );

    const stationAvailability = stations
      .map((station) => {
        const stationVehicles = availableVehicles.filter(
          (v) => v.stationId === station.id
        );
        return {
          station,
          count: stationVehicles.length,
          vehicles: stationVehicles,
        };
      })
      .filter((sa) => sa.count > 0);

    return {
      model,
      totalAvailable: availableVehicles.length,
      totalVehicles: modelVehicles.length,
      stations: stationAvailability,
    };
  });
};
