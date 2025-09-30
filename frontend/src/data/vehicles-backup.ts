import { Vehicle } from "@/components/VehicleCard";
import { vietnameseVehicles } from "./vietnamese-vehicles";

// English vehicle data
const englishVehicles: Vehicle[] = [
  {
    id: "1",
    name: "VinFast VF8",
    year: 2023,
    brand: "VinFast",
    model: "VF8",
    type: "SUV",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 90,
    location: "District 1 Station",
    availability: "available",
    pricePerHour: 15,
    pricePerDay: 120,
    rating: 4.8,
    reviewCount: 124,
    trips: 89,
    range: 420,
    seats: 5,
    features: ["Premium Sound", "Autopilot", "Fast Charging", "Leather Seats"],
    condition: "excellent",
    lastMaintenance: "2024-01-10",
    mileage: 15420,
    fuelEfficiency: "120 kWh/100km",
    inspectionDate: "2024-01-15",
    insuranceExpiry: "2024-12-31",
    description:
      "Experience luxury electric driving with the VinFast VF8. This premium SUV offers exceptional range and cutting-edge technology for your journey.",
  },
  {
    id: "2",
    name: "Tesla Model 3",
    year: 2022,
    brand: "Tesla",
    model: "Model 3",
    type: "Sedan",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 85,
    location: "District 7 Station",
    availability: "available",
    pricePerHour: 18,
    pricePerDay: 150,
    rating: 4.9,
    reviewCount: 256,
    trips: 142,
    range: 358,
    seats: 5,
    features: [
      "Autopilot",
      "Supercharging",
      "Premium Interior",
      "Over-the-Air Updates",
    ],
    condition: "excellent",
    lastMaintenance: "2024-01-08",
    mileage: 12850,
    fuelEfficiency: "150 kWh/100km",
    inspectionDate: "2024-01-12",
    insuranceExpiry: "2024-11-30",
    description:
      "The iconic Tesla Model 3 delivers unmatched performance and efficiency. Perfect for both city driving and long-distance trips.",
  },
  {
    id: "3",
    name: "Hyundai Kona Electric",
    year: 2023,
    brand: "Hyundai",
    model: "Kona Electric",
    type: "Crossover",
    image:
      "https://images.unsplash.com/photo-1549399735-cef2e2c3f638?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 78,
    location: "Binh Thanh Station",
    availability: "available",
    pricePerHour: 12,
    pricePerDay: 90,
    rating: 4.6,
    reviewCount: 89,
    trips: 67,
    range: 305,
    seats: 5,
    features: [
      "Fast Charging",
      "Touchscreen Display",
      "360° Camera",
      "Connected App",
    ],
    condition: "good",
    lastMaintenance: "2024-01-05",
    mileage: 8500,
    fuelEfficiency: "140 kWh/100km",
    inspectionDate: "2024-01-10",
    insuranceExpiry: "2024-10-15",
    description:
      "The Hyundai Kona Electric is the perfect family choice. With modern design and advanced technology, it provides a comfortable driving experience.",
  },
  {
    id: "4",
    name: "BMW i3",
    year: 2023,
    brand: "BMW",
    model: "i3",
    type: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 92,
    location: "District 3 Station",
    availability: "available",
    pricePerHour: 15,
    pricePerDay: 120,
    rating: 4.7,
    reviewCount: 156,
    trips: 98,
    range: 246,
    seats: 4,
    features: [
      "Sporty Design",
      "Premium Audio",
      "Fast Charging",
      "Smartphone Integration",
    ],
    condition: "good",
    lastMaintenance: "2023-12-20",
    mileage: 15300,
    fuelEfficiency: "135 kWh/100km",
    inspectionDate: "2024-01-08",
    insuranceExpiry: "2024-09-20",
    description:
      "The BMW i3 offers the perfect combination of performance and practicality. Its compact design is ideal for urban environments.",
  },
  {
    id: "5",
    name: "Nissan Leaf",
    year: 2022,
    brand: "Nissan",
    model: "Leaf",
    type: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1593941707882-d2b27fcd5e1a?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 88,
    location: "Tan Binh Station",
    availability: "available",
    pricePerHour: 9,
    pricePerDay: 60,
    rating: 4.4,
    reviewCount: 203,
    trips: 145,
    range: 243,
    seats: 5,
    features: [
      "Fast Charging System",
      "Display Screen",
      "Auto Climate Control",
      "Parking Sensors",
    ],
    condition: "excellent",
    lastMaintenance: "2024-01-10",
    mileage: 6200,
    fuelEfficiency: "120 kWh/100km",
    inspectionDate: "2024-01-15",
    insuranceExpiry: "2024-12-10",
    description:
      "The Nissan Leaf is a popular electric vehicle with low operating costs and ease of use. Ideal for daily commuting.",
  },
  {
  id: "6",
  name: "Audi e-tron",
  year: 2023,
  brand: "Audi",
  model: "e-tron",
  type: "SUV",
  image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&crop=center",
  batteryLevel: 95,
  location: "Phu Nhuan Station",
  availability: "available",
  pricePerHour: 21,
  pricePerDay: 180,
  rating: 4.9,
  reviewCount: 78,
  trips: 45,
  range: 400,
  seats: 5,
  features: [
    "quattro System",
    "Bang & Olufsen Audio",
    "HUD Display", 
    "Wireless Charging"
  ],
  condition: "excellent", // ✅ ADD
  lastMaintenance: "2024-01-10", // ✅ ADD
  mileage: 15420, // ✅ ADD
  fuelEfficiency: "160 kWh/100km", // ✅ ADD
  inspectionDate: "2024-01-15", // ✅ ADD
  insuranceExpiry: "2024-12-31", // ✅ ADD
  description: "The Audi e-tron delivers a luxurious driving experience with advanced technology and superior performance."
},
];

// Function to get vehicles based on language
export const getVehicles = (language: "en" | "vi" = "en"): Vehicle[] => {
  return language === "vi" ? vietnameseVehicles : englishVehicles;
};

// Function to get available vehicles
export const getAvailableVehicles = () => {
  return englishVehicles.filter(
    (vehicle) => vehicle.availability === "available"
  );
};

// Function to get vehicle by ID
export const getVehicleById = (id: string) => {
  return englishVehicles.find((vehicle) => vehicle.id === id);
};

// Default export for backward compatibility
export const vehicles: Vehicle[] = englishVehicles;
