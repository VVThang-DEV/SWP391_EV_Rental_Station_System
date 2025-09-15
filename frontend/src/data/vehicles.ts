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

    lastMaintenance: "2024-01-08",

    mileage: 12850,

    fuelEfficiency: "150 kWh/100km",

    inspectionDate: "2024-01-12",

    insuranceExpiry: "2024-11-30",

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
    condition: "good",

    lastMaintenance: "2024-01-05",

    mileage: 8500,

    fuelEfficiency: "140 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-15",

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

    lastMaintenance: "2023-12-20",

    mileage: 15300,

    fuelEfficiency: "135 kWh/100km",

    inspectionDate: "2024-01-08",

    insuranceExpiry: "2024-09-20",

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
    condition: "excellent",

    lastMaintenance: "2024-01-10",

    mileage: 6200,

    fuelEfficiency: "120 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-12-10",

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
    condition: "fair",

    lastMaintenance: "2023-11-15",

    mileage: 22800,

    fuelEfficiency: "160 kWh/100km",

    inspectionDate: "2023-12-20",

    insuranceExpiry: "2024-08-30",

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
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&crop=center",
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
      "Wireless Charging",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-08",

    mileage: 12850,

    fuelEfficiency: "150 kWh/100km",

    inspectionDate: "2024-01-12",

    insuranceExpiry: "2024-11-30",

    description:
      "The Audi e-tron delivers a luxurious driving experience with advanced technology and superior performance.",
  },
  {
    id: "7",
    name: "Polestar 2",
    year: 2023,
    brand: "Polestar",
    model: "Polestar 2",
    type: "Sedan",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 87,
    location: "District 2 Station",
    availability: "available",
    pricePerHour: 18,
    pricePerDay: 150,
    rating: 4.8,
    reviewCount: 92,
    trips: 56,
    range: 440,
    seats: 5,
    features: [
      "Scandinavian Design",
      "Google Integration",
      "Fast Charging",
      "Premium Audio",
    ],
    condition: "good",

    lastMaintenance: "2024-01-05",

    mileage: 8500,

    fuelEfficiency: "140 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-15",

    description:
      "The Polestar 2 combines modern design with advanced technology, delivering a premium electric driving experience.",
  },
  {
    id: "8",
    name: "Kia EV6",
    year: 2023,
    brand: "Kia",
    model: "EV6",
    type: "Crossover",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 91,
    location: "Thu Duc Station",
    availability: "available",
    pricePerHour: 15,
    pricePerDay: 120,
    rating: 4.7,
    reviewCount: 134,
    trips: 89,
    range: 482,
    seats: 5,
    features: [
      "Ultra-Fast Charging",
      "Spacious Interior",
      "Dual Screens",
      "V2L Support",
    ],
    condition: "good",

    lastMaintenance: "2023-12-20",

    mileage: 15300,

    fuelEfficiency: "135 kWh/100km",

    inspectionDate: "2024-01-08",

    insuranceExpiry: "2024-09-20",

    description:
      "The Kia EV6 delivers impressive range and modern design, perfect for long-distance travel.",
  },
  {
    id: "9",
    name: "Honda e",
    year: 2022,
    brand: "Honda",
    model: "e",
    type: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1593941707882-d2b27fcd5e1a?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 84,
    location: "District 10 Station",
    availability: "available",
    pricePerHour: 12,
    pricePerDay: 90,
    rating: 4.5,
    reviewCount: 167,
    trips: 112,
    range: 137,
    seats: 4,
    features: ["Compact Design", "Easy Handling", "Honda App", "Home Charging"],
    condition: "excellent",

    lastMaintenance: "2024-01-10",

    mileage: 6200,

    fuelEfficiency: "120 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-12-10",

    description:
      "The Honda e is the perfect urban electric vehicle with its compact design and ease of use in busy cities.",
  },
  {
    id: "10",
    name: "Jaguar I-PACE",
    year: 2023,
    brand: "Jaguar",
    model: "I-PACE",
    type: "SUV",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 89,
    location: "District 4 Station",
    availability: "available",
    pricePerHour: 24,
    pricePerDay: 210,
    rating: 4.8,
    reviewCount: 67,
    trips: 34,
    range: 383,
    seats: 5,
    features: [
      "High Performance",
      "Luxurious Interior",
      "All-Wheel Drive",
      "Meridian Audio",
    ],
    condition: "fair",

    lastMaintenance: "2023-11-15",

    mileage: 22800,

    fuelEfficiency: "160 kWh/100km",

    inspectionDate: "2023-12-20",

    insuranceExpiry: "2024-08-30",

    description:
      "The Jaguar I-PACE combines sporting performance with the luxury of British craftsmanship.",
  },
  {
    id: "11",
    name: "Yamaha EC-05",
    year: 2023,
    brand: "Yamaha",
    model: "EC-05",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 96,
    location: "District 1 Station",
    availability: "available",
    pricePerHour: 3,
    pricePerDay: 15,
    rating: 4.6,
    reviewCount: 289,
    trips: 456,
    range: 43,
    seats: 1,
    features: ["Easy Control", "Fast Charging", "Smart Lock", "Connected App"],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "The Yamaha EC-05 is the perfect electric scooter for city commuting with its compact design and convenience.",
  },
  {
    id: "12",
    name: "Piaggio 1 Active",
    year: 2023,
    brand: "Piaggio",
    model: "1 Active",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 88,
    location: "District 3 Station",
    availability: "available",
    pricePerHour: 4.5,
    pricePerDay: 18,
    rating: 4.4,
    reviewCount: 198,
    trips: 267,
    range: 55,
    seats: 1,
    features: [
      "Italian Design",
      "Water Resistant",
      "Fast Charging",
      "Magnetic Lock",
    ],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "The Piaggio 1 Active brings classic Italian style with modern electric technology, perfect for urban mobility.",
  },
  {
    id: "13",
    name: "Honda PCX Electric",
    year: 2023,
    brand: "Honda",
    model: "PCX Electric",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 92,
    location: "Binh Thanh Station",
    availability: "available",
    pricePerHour: 6,
    pricePerDay: 24,
    rating: 4.7,
    reviewCount: 156,
    trips: 203,
    range: 41,
    seats: 1,
    features: [
      "Honda Engine",
      "Ultra-Fast Charging",
      "Honda App",
      "Anti-Theft",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "The Honda PCX Electric combines Honda's reliability with advanced electric technology for a comfortable riding experience.",
  },
  {
    id: "14",
    name: "Suzuki Burgman Electric",
    year: 2022,
    brand: "Suzuki",
    model: "Burgman Electric",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 85,
    location: "Tan Binh Station",
    availability: "available",
    pricePerHour: 4.5,
    pricePerDay: 18,
    rating: 4.5,
    reviewCount: 134,
    trips: 178,
    range: 52,
    seats: 1,
    features: ["Storage Space", "Fast Charging", "LCD Display", "Smart Lock"],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "The Suzuki Burgman Electric offers convenience with large storage space and modern electric technology.",
  },
  {
    id: "15",
    name: "Vespa Elettrica",
    year: 2023,
    brand: "Vespa",
    model: "Elettrica",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 90,
    location: "District 2 Station",
    availability: "available",
    pricePerHour: 7.5,
    pricePerDay: 30,
    rating: 4.8,
    reviewCount: 89,
    trips: 67,
    range: 100,
    seats: 1,
    features: [
      "Classic Design",
      "Wireless Charging",
      "Connected App",
      "Water Resistant",
    ],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "The Vespa Elettrica brings Italian style icon with modern electric technology and impressive range.",
  },
  {
    id: "16",
    name: "Harley-Davidson LiveWire",
    year: 2023,
    brand: "Harley-Davidson",
    model: "LiveWire",
    type: "Motorcycle",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 94,
    location: "District 7 Station",
    availability: "available",
    pricePerHour: 15,
    pricePerDay: 90,
    rating: 4.9,
    reviewCount: 45,
    trips: 23,
    range: 235,
    seats: 1,
    features: [
      "Powerful Electric Motor",
      "Classic Harley Design",
      "Fast Charging",
      "Connected App",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "The Harley-Davidson LiveWire brings Harley power and style with advanced electric technology.",
  },
  {
    id: "17",
    name: "Zero S",
    year: 2023,
    brand: "Zero Motorcycles",
    model: "S",
    type: "Motorcycle",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 91,
    location: "Thu Duc Station",
    availability: "available",
    pricePerHour: 12,
    pricePerDay: 60,
    rating: 4.7,
    reviewCount: 67,
    trips: 34,
    range: 199,
    seats: 1,
    features: [
      "Powerful Electric Motor",
      "Fast Charging",
      "TFT Display",
      "Zero App",
    ],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "The Zero S delivers high performance and reliability for speed enthusiasts.",
  },
  {
    id: "18",
    name: "Energica Ego",
    year: 2023,
    brand: "Energica",
    model: "Ego",
    type: "Motorcycle",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 87,
    location: "Phu Nhuan Station",
    availability: "available",
    pricePerHour: 18,
    pricePerDay: 120,
    rating: 4.8,
    reviewCount: 34,
    trips: 18,
    range: 420,
    seats: 1,
    features: [
      "Premium Electric Motor",
      "Italian Design",
      "Fast Charging",
      "Smart Battery Management",
    ],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "The Energica Ego delivers luxury and high performance for discerning riders.",
  },
  {
    id: "19",
    name: "Ather 450X",
    year: 2023,
    brand: "Ather",
    model: "450X",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 93,
    location: "District 10 Station",
    availability: "available",
    pricePerHour: 6,
    pricePerDay: 24,
    rating: 4.6,
    reviewCount: 123,
    trips: 89,
    range: 116,
    seats: 1,
    features: [
      "Ultra-Fast Charging",
      "Smart App",
      "GPS Tracking",
      "Anti-Theft",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "The Ather 450X delivers a smart mobility experience with advanced technology and modern design.",
  },
  {
    id: "20",
    name: "Ola S1",
    year: 2023,
    brand: "Ola Electric",
    model: "S1",
    type: "Scooter",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    batteryLevel: 89,
    location: "District 4 Station",
    availability: "available",
    pricePerHour: 4.5,
    pricePerDay: 15,
    rating: 4.5,
    reviewCount: 234,
    trips: 345,
    range: 181,
    seats: 1,
    features: ["5-Minute Charging", "Ola App", "Integrated GPS", "IoT Support"],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "The Ola S1 is a smart electric scooter with fast charging capability and convenient app for urban users.",
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
