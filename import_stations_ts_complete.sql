-- Xóa dữ liệu cũ và import toàn bộ dữ liệu từ stations.ts
-- Đảm bảo dữ liệu hoàn toàn đồng bộ với frontend

-- ============================================
-- BƯỚC 1: XÓA DỮ LIỆU CŨ
-- ============================================

-- Xóa dữ liệu stations
DELETE FROM stations;

-- Reset identity column cho bảng stations
DBCC CHECKIDENT ('stations', RESEED, 0);

-- ============================================
-- BƯỚC 2: INSERT STATIONS TỪ STATIONS.TS
-- ============================================

-- District 1 Station
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('District 1 Station', 10.7769, 106.7009, '123 Nguyen Hue Street', 'active', 'Ho Chi Minh City', 5, 12, '["Fast Charging", "Cafe", "Restroom", "Parking"]', 4.8, '24/7', 1, 'https://iwater.vn/Image/Picture/New/Quan-1.jpg', GETDATE(), GETDATE());

-- District 7 Station
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('District 7 Station', 10.7285, 106.7317, '456 Phu My Hung Boulevard', 'active', 'Ho Chi Minh City', 6, 10, '["Fast Charging", "Shopping Mall", "Restaurant", "ATM"]', 4.6, '6:00 AM - 10:00 PM', 1, 'https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg', GETDATE(), GETDATE());

-- Airport Station
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('Airport Station', 10.8231, 106.6297, 'Tan Son Nhat International Airport', 'active', 'Ho Chi Minh City', 6, 20, '["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"]', 4.9, '24/7', 1, 'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png', GETDATE(), GETDATE());

-- District 3 Station
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('District 3 Station', 10.7891, 106.6897, '789 Vo Van Tan Street', 'active', 'Ho Chi Minh City', 4, 8, '["Standard Charging", "Convenience Store", "WiFi"]', 4.4, '7:00 AM - 9:00 PM', 0, 'https://nasaland.vn/wp-content/uploads/2022/09/Quan-3-1.jpg', GETDATE(), GETDATE());

-- District 5 Station
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('District 5 Station', 10.7546, 106.6677, '321 An Duong Vuong Street', 'active', 'Ho Chi Minh City', 4, 15, '["Fast Charging", "Food Court", "Pharmacy", "Gas Station"]', 4.5, '24/7', 1, 'https://cdn.vietnammoi.vn/171464242508312576/2021/6/30/mttq-quan-5-16250453134831325127756.jpg', GETDATE(), GETDATE());

-- District 2 Station (Binh Thanh)
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('Binh Thanh Station', 10.7972, 106.7317, '654 Xa Lo Ha Noi Street', 'active', 'Ho Chi Minh City', 4, 18, '["Fast Charging", "Supermarket", "Bank", "Car Wash"]', 4.7, '6:00 AM - 11:00 PM', 1, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/414/214/products/toan-thap.jpg?v=1676254526307', GETDATE(), GETDATE());

-- Thu Duc Station (District 8)
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('Thu Duc Station', 10.7406, 106.6792, '987 Pham The Hien Street', 'active', 'Ho Chi Minh City', 4, 10, '["Standard Charging", "Restaurant", "Restroom"]', 4.2, '8:00 AM - 8:00 PM', 0, 'https://quanlykhachsan.edu.vn/wp-content/uploads/2021/12/dia-diem-chup-anh-dep-o-quan-8.jpg', GETDATE(), GETDATE());

-- Phu Nhuan Station (District 4)
INSERT INTO stations (name, latitude, longitude, address, status, city, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging, image, created_at, updated_at)
VALUES ('Phu Nhuan Station', 10.7743, 106.7046, '38 Khanh Hoi Street', 'active', 'Ho Chi Minh City', 5, 14, '["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"]', 4.9, '24/7', 1, 'https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg', GETDATE(), GETDATE());

-- ============================================
-- BƯỚC 3: KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra số lượng stations
SELECT 'STATIONS COUNT:' as Info, COUNT(*) as Total
FROM stations;

-- Kiểm tra dữ liệu stations
SELECT 'STATIONS DATA:' as Info;
SELECT station_id, name, city, available_vehicles, total_slots, rating, operating_hours, fast_charging, image
FROM stations
ORDER BY station_id;

-- Kiểm tra dữ liệu chi tiết
SELECT 'STATIONS DETAILED DATA:' as Info;
SELECT station_id, name, address, city, latitude, longitude, available_vehicles, total_slots, amenities, rating, operating_hours, fast_charging
FROM stations
ORDER BY station_id;
