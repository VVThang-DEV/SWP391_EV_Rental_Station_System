export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availableVehicles: number;
  totalSlots: number;
  amenities: string[];
  rating: number;
  operatingHours: string;
  fastCharging: boolean;
  image: string;
}

export const stations: Station[] = [
  {
    id: "st1",
    name: "District 1 Station",
    address: "123 Nguyen Hue Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7769, lng: 106.7009 },
    availableVehicles: 8,
    totalSlots: 12,
    amenities: ["Fast Charging", "Cafe", "Restroom", "Parking"],
    rating: 4.8,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st2",
    name: "District 7 Station",
    address: "456 Phu My Hung Boulevard",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7285, lng: 106.7317 },
    availableVehicles: 5,
    totalSlots: 10,
    amenities: ["Fast Charging", "Shopping Mall", "Restaurant", "ATM"],
    rating: 4.6,
    operatingHours: "6:00 AM - 10:00 PM",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st3",
    name: "Airport Station",
    address: "Tan Son Nhat International Airport",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.8231, lng: 106.6297 },
    availableVehicles: 12,
    totalSlots: 20,
    amenities: ["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"],
    rating: 4.9,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st4",
    name: "District 3 Station",
    address: "789 Vo Van Tan Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7891, lng: 106.6897 },
    availableVehicles: 3,
    totalSlots: 8,
    amenities: ["Standard Charging", "Convenience Store", "WiFi"],
    rating: 4.4,
    operatingHours: "7:00 AM - 9:00 PM",
    fastCharging: false,
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st5",
    name: "District 5 Station",
    address: "321 An Duong Vuong Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7546, lng: 106.6677 },
    availableVehicles: 6,
    totalSlots: 15,
    amenities: ["Fast Charging", "Food Court", "Pharmacy", "Gas Station"],
    rating: 4.5,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1617469165786-8007eda4bf80?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st6",
    name: "District 2 Station",
    address: "654 Xa Lo Ha Noi Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7972, lng: 106.7317 },
    availableVehicles: 9,
    totalSlots: 18,
    amenities: ["Fast Charging", "Supermarket", "Bank", "Car Wash"],
    rating: 4.7,
    operatingHours: "6:00 AM - 11:00 PM",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st7",
    name: "District 8 Station",
    address: "987 Pham The Hien Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7406, lng: 106.6792 },
    availableVehicles: 4,
    totalSlots: 10,
    amenities: ["Standard Charging", "Restaurant", "Restroom"],
    rating: 4.2,
    operatingHours: "8:00 AM - 8:00 PM",
    fastCharging: false,
    image:
      "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=800&h=600&fit=crop&crop=center",
  },
  {
    id: "st8",
    name: "Downtown Station",
    address: "159 Dong Khoi Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7743, lng: 106.7046 },
    availableVehicles: 7,
    totalSlots: 14,
    amenities: ["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"],
    rating: 4.9,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&crop=center",
  },
];
