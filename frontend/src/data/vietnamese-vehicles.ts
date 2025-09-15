import { Vehicle } from "@/components/VehicleCard";

export const vietnameseVehicles: Vehicle[] = [
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
    pricePerHour: 345000, // VND equivalent of $15
    pricePerDay: 2760000, // VND equivalent of $120
    rating: 4.8,
    reviewCount: 124,
    trips: 89,
    range: 420,
    seats: 5,
    features: ["Âm thanh cao cấp", "Lái tự động", "Sạc nhanh", "Ghế da"],
    condition: "excellent",

    lastMaintenance: "2024-01-08",

    mileage: 12850,

    fuelEfficiency: "150 kWh/100km",

    inspectionDate: "2024-01-12",

    insuranceExpiry: "2024-11-30",

    description:
      "Trải nghiệm lái xe điện cao cấp với VinFast VF8. Chiếc SUV cao cấp này mang đến tầm hoạt động tuyệt vời và công nghệ tiên tiến cho hành trình của bạn.",
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
    pricePerHour: 414000, // VND equivalent of $18
    pricePerDay: 3450000, // VND equivalent of $150
    rating: 4.9,
    reviewCount: 256,
    trips: 142,
    range: 358,
    seats: 5,
    features: [
      "Lái tự động",
      "Sạc siêu nhanh",
      "Nội thất cao cấp",
      "Cập nhật qua mạng",
    ],
    condition: "good",

    lastMaintenance: "2024-01-05",

    mileage: 8500,

    fuelEfficiency: "140 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-15",

    description:
      "Tesla Model 3 mang đến hiệu suất vượt trội và hiệu quả. Hoàn hảo cho cả lái xe trong thành phố và đi đường dài.",
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
    location: "District 5 Station",
    availability: "available",
    pricePerHour: 276000, // VND equivalent of $12
    pricePerDay: 2070000, // VND equivalent of $90
    rating: 4.6,
    reviewCount: 89,
    trips: 67,
    range: 305,
    seats: 5,
    features: [
      "Sạc nhanh",
      "Màn hình cảm ứng",
      "Camera 360°",
      "Ứng dụng kết nối",
    ],
    condition: "good",

    lastMaintenance: "2023-12-20",

    mileage: 15300,

    fuelEfficiency: "135 kWh/100km",

    inspectionDate: "2024-01-08",

    insuranceExpiry: "2024-09-20",

    description:
      "Hyundai Kona Electric là lựa chọn hoàn hảo cho gia đình. Với thiết kế hiện đại và công nghệ tiên tiến, mang đến trải nghiệm lái xe thoải mái.",
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
    pricePerHour: 345000, // VND equivalent of $15
    pricePerDay: 2760000, // VND equivalent of $120
    rating: 4.7,
    reviewCount: 156,
    trips: 98,
    range: 246,
    seats: 4,
    features: [
      "Thiết kế thể thao",
      "Hệ thống âm thanh cao cấp",
      "Sạc nhanh",
      "Kết nối smartphone",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-10",

    mileage: 6200,

    fuelEfficiency: "120 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-12-10",

    description:
      "BMW i3 mang đến sự kết hợp hoàn hảo giữa hiệu suất và tính thực dụng. Thiết kế nhỏ gọn phù hợp cho đô thị.",
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
    location: "District 8 Station",
    availability: "available",
    pricePerHour: 207000, // VND equivalent of $9
    pricePerDay: 1380000, // VND equivalent of $60
    rating: 4.4,
    reviewCount: 203,
    trips: 145,
    range: 243,
    seats: 5,
    features: [
      "Hệ thống sạc nhanh",
      "Màn hình hiển thị",
      "Điều hòa tự động",
      "Cảm biến đỗ xe",
    ],
    condition: "fair",

    lastMaintenance: "2023-11-15",

    mileage: 22800,

    fuelEfficiency: "160 kWh/100km",

    inspectionDate: "2023-12-20",

    insuranceExpiry: "2024-08-30",

    description:
      "Nissan Leaf là mẫu xe điện phổ biến với chi phí vận hành thấp và dễ sử dụng. Lý tưởng cho việc đi lại hàng ngày.",
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
    location: "Downtown Station",
    availability: "available",
    pricePerHour: 483000, // VND equivalent of $21
    pricePerDay: 4140000, // VND equivalent of $180
    rating: 4.9,
    reviewCount: 78,
    trips: 45,
    range: 400,
    seats: 5,
    features: [
      "Hệ thống quattro",
      "Âm thanh Bang & Olufsen",
      "Màn hình HUD",
      "Sạc không dây",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-08",

    mileage: 12850,

    fuelEfficiency: "150 kWh/100km",

    inspectionDate: "2024-01-12",

    insuranceExpiry: "2024-11-30",

    description:
      "Audi e-tron mang đến trải nghiệm lái xe sang trọng với công nghệ tiên tiến và hiệu suất vượt trội.",
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
    pricePerHour: 414000, // VND equivalent of $18
    pricePerDay: 3450000, // VND equivalent of $150
    rating: 4.8,
    reviewCount: 92,
    trips: 56,
    range: 440,
    seats: 5,
    features: [
      "Thiết kế Scandinavian",
      "Google tích hợp",
      "Sạc nhanh",
      "Âm thanh cao cấp",
    ],
    condition: "good",

    lastMaintenance: "2024-01-05",

    mileage: 8500,

    fuelEfficiency: "140 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-15",

    description:
      "Polestar 2 kết hợp thiết kế hiện đại với công nghệ tiên tiến, mang đến trải nghiệm lái xe điện cao cấp.",
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
    location: "Airport Station",
    availability: "available",
    pricePerHour: 345000, // VND equivalent of $15
    pricePerDay: 2760000, // VND equivalent of $120
    rating: 4.7,
    reviewCount: 134,
    trips: 89,
    range: 482,
    seats: 5,
    features: [
      "Sạc siêu nhanh",
      "Không gian nội thất rộng",
      "Màn hình đôi",
      "Hỗ trợ V2L",
    ],
    condition: "good",

    lastMaintenance: "2023-12-20",

    mileage: 15300,

    fuelEfficiency: "135 kWh/100km",

    inspectionDate: "2024-01-08",

    insuranceExpiry: "2024-09-20",

    description:
      "Kia EV6 mang đến tầm hoạt động ấn tượng và thiết kế hiện đại, hoàn hảo cho các chuyến đi dài.",
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
    location: "District 1 Station",
    availability: "available",
    pricePerHour: 276000, // VND equivalent of $12
    pricePerDay: 2070000, // VND equivalent of $90
    rating: 4.5,
    reviewCount: 167,
    trips: 112,
    range: 137,
    seats: 4,
    features: [
      "Thiết kế nhỏ gọn",
      "Dễ điều khiển",
      "Ứng dụng Honda",
      "Sạc tại nhà",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-10",

    mileage: 6200,

    fuelEfficiency: "120 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-12-10",

    description:
      "Honda e là mẫu xe điện đô thị hoàn hảo với thiết kế nhỏ gọn và dễ sử dụng trong thành phố đông đúc.",
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
    location: "District 5 Station",
    availability: "available",
    pricePerHour: 552000, // VND equivalent of $24
    pricePerDay: 4830000, // VND equivalent of $210
    rating: 4.8,
    reviewCount: 67,
    trips: 34,
    range: 383,
    seats: 5,
    features: [
      "Hiệu suất cao",
      "Nội thất sang trọng",
      "Hệ thống 4 bánh",
      "Âm thanh Meridian",
    ],
    condition: "fair",

    lastMaintenance: "2023-11-15",

    mileage: 22800,

    fuelEfficiency: "160 kWh/100km",

    inspectionDate: "2023-12-20",

    insuranceExpiry: "2024-08-30",

    description:
      "Jaguar I-PACE mang đến sự kết hợp giữa hiệu suất thể thao và tính sang trọng của thương hiệu Anh quốc.",
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
    pricePerHour: 69000, // VND equivalent of $3
    pricePerDay: 345000, // VND equivalent of $15
    rating: 4.6,
    reviewCount: 289,
    trips: 456,
    range: 43,
    seats: 1,
    features: [
      "Dễ điều khiển",
      "Sạc nhanh",
      "Ổ khóa thông minh",
      "Ứng dụng kết nối",
    ],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "Yamaha EC-05 là mẫu xe tay ga điện hoàn hảo cho việc di chuyển trong thành phố với thiết kế nhỏ gọn và tiện lợi.",
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
    location: "Trạm Quận 3",
    availability: "available",
    pricePerHour: 103500, // VND equivalent of $4.5
    pricePerDay: 414000, // VND equivalent of $18
    rating: 4.4,
    reviewCount: 198,
    trips: 267,
    range: 55,
    seats: 1,
    features: ["Thiết kế Ý", "Chống nước", "Sạc nhanh", "Ổ khóa từ"],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "Piaggio 1 Active mang đến phong cách Ý cổ điển với công nghệ điện hiện đại, hoàn hảo cho việc di chuyển đô thị.",
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
    location: "Trạm Bình Thạnh",
    availability: "available",
    pricePerHour: 138000, // VND equivalent of $6
    pricePerDay: 552000, // VND equivalent of $24
    rating: 4.7,
    reviewCount: 156,
    trips: 203,
    range: 41,
    seats: 1,
    features: [
      "Động cơ Honda",
      "Sạc siêu nhanh",
      "Ứng dụng Honda",
      "Chống trộm",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "Honda PCX Electric kết hợp độ tin cậy của Honda với công nghệ điện tiên tiến cho trải nghiệm di chuyển thoải mái.",
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
    location: "Trạm Tân Bình",
    availability: "available",
    pricePerHour: 103500, // VND equivalent of $4.5
    pricePerDay: 414000, // VND equivalent of $18
    rating: 4.5,
    reviewCount: 134,
    trips: 178,
    range: 52,
    seats: 1,
    features: [
      "Không gian chứa đồ",
      "Sạc nhanh",
      "Màn hình LCD",
      "Khóa thông minh",
    ],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "Suzuki Burgman Electric mang đến sự tiện lợi với không gian chứa đồ lớn và công nghệ điện hiện đại.",
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
    location: "Trạm Quận 2",
    availability: "available",
    pricePerHour: 172500, // VND equivalent of $7.5
    pricePerDay: 690000, // VND equivalent of $30
    rating: 4.8,
    reviewCount: 89,
    trips: 67,
    range: 100,
    seats: 1,
    features: [
      "Thiết kế cổ điển",
      "Sạc không dây",
      "Ứng dụng kết nối",
      "Chống nước",
    ],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "Vespa Elettrica mang đến biểu tượng phong cách Ý với công nghệ điện hiện đại và tầm hoạt động ấn tượng.",
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
    location: "Trạm Quận 7",
    availability: "available",
    pricePerHour: 345000, // VND equivalent of $15
    pricePerDay: 2070000, // VND equivalent of $90
    rating: 4.9,
    reviewCount: 45,
    trips: 23,
    range: 235,
    seats: 1,
    features: [
      "Động cơ điện mạnh mẽ",
      "Thiết kế Harley cổ điển",
      "Sạc nhanh",
      "Ứng dụng kết nối",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "Harley-Davidson LiveWire mang đến sức mạnh và phong cách của Harley với công nghệ điện tiên tiến.",
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
    location: "Trạm Thủ Đức",
    availability: "available",
    pricePerHour: 276000, // VND equivalent of $12
    pricePerDay: 1380000, // VND equivalent of $60
    rating: 4.7,
    reviewCount: 67,
    trips: 34,
    range: 199,
    seats: 1,
    features: [
      "Động cơ điện mạnh mẽ",
      "Sạc nhanh",
      "Màn hình TFT",
      "Ứng dụng Zero",
    ],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "Zero S mang đến hiệu suất cao và độ tin cậy cho những tay lái đam mê tốc độ.",
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
    location: "Trạm Phú Nhuận",
    availability: "available",
    pricePerHour: 414000, // VND equivalent of $18
    pricePerDay: 2760000, // VND equivalent of $120
    rating: 4.8,
    reviewCount: 34,
    trips: 18,
    range: 420,
    seats: 1,
    features: [
      "Động cơ điện cao cấp",
      "Thiết kế Ý",
      "Sạc nhanh",
      "Hệ thống quản lý pin thông minh",
    ],
    condition: "fair",

    lastMaintenance: "2023-12-15",

    mileage: 8500,

    fuelEfficiency: "45 kWh/100km",

    inspectionDate: "2023-12-28",

    insuranceExpiry: "2024-09-15",

    description:
      "Energica Ego mang đến sự sang trọng và hiệu suất cao cho những tay lái tinh tế.",
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
    location: "Trạm Quận 10",
    availability: "available",
    pricePerHour: 138000, // VND equivalent of $6
    pricePerDay: 552000, // VND equivalent of $24
    rating: 4.6,
    reviewCount: 123,
    trips: 89,
    range: 116,
    seats: 1,
    features: [
      "Sạc siêu nhanh",
      "Ứng dụng thông minh",
      "Theo dõi GPS",
      "Chống trộm",
    ],
    condition: "excellent",

    lastMaintenance: "2024-01-12",

    mileage: 3200,

    fuelEfficiency: "35 kWh/100km",

    inspectionDate: "2024-01-15",

    insuranceExpiry: "2024-11-25",

    description:
      "Ather 450X mang đến trải nghiệm di chuyển thông minh với công nghệ tiên tiến và thiết kế hiện đại.",
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
    location: "Trạm Quận 4",
    availability: "available",
    pricePerHour: 103500, // VND equivalent of $4.5
    pricePerDay: 345000, // VND equivalent of $15
    rating: 4.5,
    reviewCount: 234,
    trips: 345,
    range: 181,
    seats: 1,
    features: [
      "Sạc nhanh 5 phút",
      "Ứng dụng Ola",
      "GPS tích hợp",
      "Hỗ trợ IoT",
    ],
    condition: "good",

    lastMaintenance: "2024-01-08",

    mileage: 4800,

    fuelEfficiency: "40 kWh/100km",

    inspectionDate: "2024-01-10",

    insuranceExpiry: "2024-10-20",

    description:
      "Ola S1 là mẫu xe điện thông minh với khả năng sạc nhanh và ứng dụng tiện lợi cho người dùng đô thị.",
  },
];
