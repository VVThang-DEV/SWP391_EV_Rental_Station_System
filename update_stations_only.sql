-- Chỉ cập nhật dữ liệu stations, KHÔNG xóa vehicles
-- Giữ nguyên vehicles đã import, chỉ sửa stations

-- ============================================
-- CẬP NHẬT STATIONS THEO DỮ LIỆU TỪ STATIONS.TS
-- ============================================

-- Cập nhật District 1 Station (station_id = 1)
UPDATE stations SET 
    name = 'District 1 Station',
    latitude = 10.7769,
    longitude = 106.7009,
    address = '123 Nguyen Hue Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 5,
    total_slots = 12,
    amenities = '["Fast Charging", "Cafe", "Restroom", "Parking"]',
    rating = 4.8,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://iwater.vn/Image/Picture/New/Quan-1.jpg',
    updated_at = GETDATE()
WHERE station_id = 1;

-- Cập nhật District 7 Station (station_id = 2)
UPDATE stations SET 
    name = 'District 7 Station',
    latitude = 10.7285,
    longitude = 106.7317,
    address = '456 Phu My Hung Boulevard',
    city = 'Ho Chi Minh City',
    available_vehicles = 6,
    total_slots = 10,
    amenities = '["Fast Charging", "Shopping Mall", "Restaurant", "ATM"]',
    rating = 4.6,
    operating_hours = '6:00 AM - 10:00 PM',
    fast_charging = 1,
    image = 'https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg',
    updated_at = GETDATE()
WHERE station_id = 2;

-- Cập nhật Airport Station (station_id = 3)
UPDATE stations SET 
    name = 'Airport Station',
    latitude = 10.8231,
    longitude = 106.6297,
    address = 'Tan Son Nhat International Airport',
    city = 'Ho Chi Minh City',
    available_vehicles = 6,
    total_slots = 20,
    amenities = '["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"]',
    rating = 4.9,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png',
    updated_at = GETDATE()
WHERE station_id = 3;

-- Cập nhật District 3 Station (station_id = 4)
UPDATE stations SET 
    name = 'District 3 Station',
    latitude = 10.7891,
    longitude = 106.6897,
    address = '789 Vo Van Tan Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 4,
    total_slots = 8,
    amenities = '["Standard Charging", "Convenience Store", "WiFi"]',
    rating = 4.4,
    operating_hours = '7:00 AM - 9:00 PM',
    fast_charging = 0,
    image = 'https://nasaland.vn/wp-content/uploads/2022/09/Quan-3-1.jpg',
    updated_at = GETDATE()
WHERE station_id = 4;

-- Cập nhật District 5 Station (station_id = 5)
UPDATE stations SET 
    name = 'District 5 Station',
    latitude = 10.7546,
    longitude = 106.6677,
    address = '321 An Duong Vuong Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 4,
    total_slots = 15,
    amenities = '["Fast Charging", "Food Court", "Pharmacy", "Gas Station"]',
    rating = 4.5,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://cdn.vietnammoi.vn/171464242508312576/2021/6/30/mttq-quan-5-16250453134831325127756.jpg',
    updated_at = GETDATE()
WHERE station_id = 5;

-- Cập nhật Binh Thanh Station (station_id = 6)
UPDATE stations SET 
    name = 'Binh Thanh Station',
    latitude = 10.7972,
    longitude = 106.7317,
    address = '654 Xa Lo Ha Noi Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 4,
    total_slots = 18,
    amenities = '["Fast Charging", "Supermarket", "Bank", "Car Wash"]',
    rating = 4.7,
    operating_hours = '6:00 AM - 11:00 PM',
    fast_charging = 1,
    image = 'https://bizweb.dktcdn.net/thumb/1024x1024/100/414/214/products/toan-thap.jpg?v=1676254526307',
    updated_at = GETDATE()
WHERE station_id = 6;

-- Cập nhật Thu Duc Station (station_id = 7)
UPDATE stations SET 
    name = 'Thu Duc Station',
    latitude = 10.7406,
    longitude = 106.6792,
    address = '987 Pham The Hien Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 4,
    total_slots = 10,
    amenities = '["Standard Charging", "Restaurant", "Restroom"]',
    rating = 4.2,
    operating_hours = '8:00 AM - 8:00 PM',
    fast_charging = 0,
    image = 'https://quanlykhachsan.edu.vn/wp-content/uploads/2021/12/dia-diem-chup-anh-dep-o-quan-8.jpg',
    updated_at = GETDATE()
WHERE station_id = 7;

-- Cập nhật Phu Nhuan Station (station_id = 8)
UPDATE stations SET 
    name = 'Phu Nhuan Station',
    latitude = 10.7743,
    longitude = 106.7046,
    address = '38 Khanh Hoi Street',
    city = 'Ho Chi Minh City',
    available_vehicles = 5,
    total_slots = 14,
    amenities = '["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"]',
    rating = 4.9,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg',
    updated_at = GETDATE()
WHERE station_id = 8;

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra dữ liệu stations đã được cập nhật
SELECT 'STATIONS UPDATED:' as Info;
SELECT station_id, name, city, available_vehicles, total_slots, rating, operating_hours, fast_charging, image
FROM stations
WHERE station_id <= 8
ORDER BY station_id;

-- Kiểm tra vehicles vẫn còn nguyên
SELECT 'VEHICLES STILL INTACT:' as Info;
SELECT COUNT(*) as Total_Vehicles
FROM vehicles;
