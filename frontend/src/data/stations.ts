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
    availableVehicles: 5,
    totalSlots: 12,
    amenities: ["Fast Charging", "Cafe", "Restroom", "Parking"],
    rating: 4.8,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://iwater.vn/Image/Picture/New/Quan-1.jpg",
  },
  {
    id: "st2",
    name: "District 7 Station",
    address: "456 Phu My Hung Boulevard",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7285, lng: 106.7317 },
    availableVehicles: 6,
    totalSlots: 10,
    amenities: ["Fast Charging", "Shopping Mall", "Restaurant", "ATM"],
    rating: 4.6,
    operatingHours: "6:00 AM - 10:00 PM",
    fastCharging: true,
    image:
      "https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg",
  },
  {
    id: "st3",
    name: "Airport Station",
    address: "Tan Son Nhat International Airport",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.8231, lng: 106.6297 },
    availableVehicles: 6,
    totalSlots: 20,
    amenities: ["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"],
    rating: 4.9,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png",
  },
  {
    id: "st4",
    name: "District 3 Station",
    address: "789 Vo Van Tan Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7891, lng: 106.6897 },
    availableVehicles: 4,
    totalSlots: 8,
    amenities: ["Standard Charging", "Convenience Store", "WiFi"],
    rating: 4.4,
    operatingHours: "7:00 AM - 9:00 PM",
    fastCharging: false,
    image:
      "https://nasaland.vn/wp-content/uploads/2022/09/Quan-3-1.jpg",
  },
  {
    id: "st5",
    name: "District 5 Station",
    address: "321 An Duong Vuong Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7546, lng: 106.6677 },
    availableVehicles: 4,
    totalSlots: 15,
    amenities: ["Fast Charging", "Food Court", "Pharmacy", "Gas Station"],
    rating: 4.5,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://cdn.vietnammoi.vn/171464242508312576/2021/6/30/mttq-quan-5-16250453134831325127756.jpg",
  },
  {
    id: "st6",
    name: "District 2 Station",
    address: "654 Xa Lo Ha Noi Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7972, lng: 106.7317 },
    availableVehicles: 4,
    totalSlots: 18,
    amenities: ["Fast Charging", "Supermarket", "Bank", "Car Wash"],
    rating: 4.7,
    operatingHours: "6:00 AM - 11:00 PM",
    fastCharging: true,
    image:
      "https://bizweb.dktcdn.net/thumb/1024x1024/100/414/214/products/toan-thap.jpg?v=1676254526307",
  },
  {
    id: "st7",
    name: "Thu Duc Station",
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
      "https://quanlykhachsan.edu.vn/wp-content/uploads/2021/12/dia-diem-chup-anh-dep-o-quan-8.jpg",
  },
  {
    id: "st8",
    name: "District 4 Station",
    address: "38 Khanh Hoi Street",
    city: "Ho Chi Minh City",
    coordinates: { lat: 10.7743, lng: 106.7046 },
    availableVehicles: 5,
    totalSlots: 14,
    amenities: ["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"],
    rating: 4.9,
    operatingHours: "24/7",
    fastCharging: true,
    image:
      "https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg",
  },
];
