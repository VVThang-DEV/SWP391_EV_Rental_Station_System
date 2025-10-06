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

  const modelImages: Record<string, string> = {
    VF3: "https://cafefcdn.com/203337114487263232/2024/5/8/photo-1-1715090660361300961755-1715140612593-171514061306027642983.jpg",
    VF5: "https://media.vov.vn/sites/default/files/styles/large/public/2024-07/a7.jpg",
    VF6: "https://oto-vinfastsaigon.com/wp-content/uploads/2024/11/mau-xe-vinfast-vf6-bang-mau-xe-vinfast-vf6-cap-nhat-chinh-hang-4fvtET.jpg.webp",
    VF7: "https://img.autocarindia.com/Features/VF7%20Rivals%20Web.jpg?w=700&c=1",
    VF8: "https://vinfastquangtri.vn/wp-content/uploads/2023/02/8-mau-VF8-scaled.jpg",
    VF9: "https://vinfast-timescity.com.vn/wp-content/uploads/2022/12/cap-nhat-bang-mau-xe-vinfast-vf9-2023-1_optimized.jpeg",
    EVO200: "https://xedapchaydien.vn/upfiles/image/1.%20Xe%20%C4%91i%E1%BB%87n/xe-may-dien-infast-Evo200-21.jpg",
    EVO200LITE: "https://xedien2banh.com/image/catalog/%E1%BA%A2nh%20vi%E1%BA%BFt%20b%C3%A0i/Vinfast/xe-may-dien-vinfast-evo200-13.jpg",
    EVOGRAND: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0a6b8f9c/landingpage/lp-xmd/evo-grand/hero-mb.webp",
    EVOGRANDLITE: "https://vfxanh.vn/wp-content/uploads/2025/07/5@2x.jpg",
    EVONEO: "https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-6/494556506_1216786090451626_386267744405387881_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH21OJRf1TiSmiQ5wi3iQNv8dPBsjmrYajx08GyOathqGuZv-BKLDZB7jZxSpwXzjPwLOGV9dccp4GKT7UdmdMK&_nc_ohc=QHmmNyhEvuUQ7kNvwEuLdHB&_nc_oc=Adnh8zQEhskF-R5R1kYrcC71Jw-EmZksR_iOQUCXXPIQc24ep0wyn0npqXxB5nPpNSI&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=GBCAh0PQ-1JlkkQavOkP3w&oh=00_AfdfS005KRiLziGNbKsUshtbDFQ4125iLYHW8vzlstf-yQ&oe=68E53C28",
    FELIZS: "https://oto-vinfastsaigon.com/wp-content/uploads/2021/08/xe-may-dien-vinfast-klara-tai-muaxegiabeo_10-800x400-1.jpg",
    FELIZLITE: "https://oto-vinfastsaigon.com/wp-content/uploads/2021/08/xe-may-dien-vinfast-klara-tai-muaxegiabeo_10-800x400-1.jpg",

  };
  vehicles.forEach((vehicle) => {
    if (!modelMap.has(vehicle.modelId)) {
      modelMap.set(vehicle.modelId, {
        modelId: vehicle.modelId,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        image: modelImages[vehicle.modelId] || vehicle.image,
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
  const vehicles = getVehicles("en"); // Lấy danh sách xe từ dữ liệu thực tế

  return stations.map((station) => {
    // Lọc xe thuộc trạm hiện tại và có trạng thái "available"
    const stationVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.stationId === station.id && vehicle.availability === "available"
    );

    // Nhóm xe theo modelId
    const modelMap = new Map<string, Vehicle[]>();
    stationVehicles.forEach((vehicle) => {
      if (!modelMap.has(vehicle.modelId)) {
        modelMap.set(vehicle.modelId, []);
      }
      modelMap.get(vehicle.modelId)!.push(vehicle);
    });

    // Tạo danh sách các mẫu xe có sẵn tại trạm
    const availableModels = Array.from(modelMap.entries()).map(
      ([modelId, vehicleList]) => ({
        modelId,
        count: vehicleList.length, // Số lượng xe thuộc mẫu xe tại trạm
        vehicles: vehicleList,
      })
    );

    // Trả về thông tin trạm với các mẫu xe có sẵn
    return {
      ...station,
      availableModels,
      totalAvailableVehicles: stationVehicles.length, // Tổng số xe có sẵn tại trạm
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
