-- Xóa dữ liệu cũ và import toàn bộ dữ liệu từ vehicles.ts
-- Đảm bảo dữ liệu hoàn toàn đồng bộ với frontend

-- ============================================
-- BƯỚC 1: XÓA DỮ LIỆU CŨ
-- ============================================

-- Xóa dữ liệu vehicles trước (do có foreign key đến vehicle_models)
DELETE FROM vehicles;

-- Xóa dữ liệu vehicle_models
DELETE FROM vehicle_models;

-- Reset identity columns
DBCC CHECKIDENT ('vehicles', RESEED, 0);
DBCC CHECKIDENT ('vehicle_models', RESEED, 0);

-- ============================================
-- BƯỚC 2: INSERT VEHICLE_MODELS TỪ VEHICLES.TS
-- ============================================

-- VF3 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF3', 'VinFast', 'VF3', 'Hatchback', 2024, 5, 'Smart Connectivity, Air Conditioning, USB Charging, LED Lights', 'VinFast VF3 - Compact city car perfect for urban mobility with modern features and efficient electric drivetrain.', 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', 8.00, 60.00, 210, GETDATE(), GETDATE());

-- VF5 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF5', 'VinFast', 'VF5', 'SUV', 2024, 5, 'Premium Sound, Panoramic Roof, Fast Charging, Smart Features', 'VinFast VF5 - Compact SUV with modern design and advanced technology for comfortable family trips.', 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', 12.00, 95.00, 285, GETDATE(), GETDATE());

-- VF6 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF6', 'VinFast', 'VF6', 'SUV', 2024, 5, 'Leather Interior, Wireless Charging, 360° Camera, Premium Audio', 'VinFast VF6 - Mid-size SUV offering perfect balance of comfort, performance and technology.', 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg', 15.00, 120.00, 365, GETDATE(), GETDATE());

-- VF7 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF7', 'VinFast', 'VF7', 'SUV', 2024, 7, 'Premium Seats, Autopilot, Panoramic Sunroof, Bang & Olufsen Audio', 'VinFast VF7 - Premium 7-seater SUV with advanced features and spacious interior for large families.', 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png', 18.00, 145.00, 390, GETDATE(), GETDATE());

-- VF8 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF8', 'VinFast', 'VF8', 'SUV', 2024, 5, 'Luxury Interior, Advanced Autopilot, Premium Sound System, Air Suspension', 'VinFast VF8 - Flagship SUV with luxury features, advanced technology and exceptional performance.', 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg', 22.00, 175.00, 425, GETDATE(), GETDATE());

-- VF9 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('VF9', 'VinFast', 'VF9', 'SUV', 2024, 7, 'Ultra Luxury, Full Autopilot, Premium Entertainment, Massage Seats', 'VinFast VF9 - Ultimate luxury SUV with cutting-edge technology and unmatched comfort for premium experiences.', 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp', 28.00, 220.00, 485, GETDATE(), GETDATE());

-- EVO200 Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('EVO200', 'VinFast', 'Evo200', 'Scooter', 2024, 2, 'Smart Key, USB Charging, LED Display, Mobile App', 'VinFast Evo200 - Modern electric scooter with smart connectivity and efficient performance for urban mobility.', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', 6.00, 35.00, 90, GETDATE(), GETDATE());

-- EVO200LITE Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('EVO200LITE', 'VinFast', 'Evo200 Lite', 'Scooter', 2024, 2, 'Lightweight, Energy Efficient, LED Lights, Anti-theft', 'VinFast Evo200 Lite - Lightweight and efficient electric scooter perfect for daily commuting.', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', 5.00, 30.00, 75, GETDATE(), GETDATE());

-- EVOGRAND Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('EVOGRAND', 'VinFast', 'Evo Grand', 'Scooter', 2024, 2, 'Premium Design, Large Storage, Advanced Display, Keyless Start', 'VinFast Evo Grand - Premium electric scooter with grand design and superior performance.', 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg', 7.00, 40.00, 110, GETDATE(), GETDATE());

-- EVOGRANDLITE Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('EVOGRANDLITE', 'VinFast', 'Evo Grand Lite', 'Scooter', 2024, 2, 'Balanced Performance, Good Storage, Digital Display, Eco Mode', 'VinFast Evo Grand Lite - Balanced electric scooter offering good performance with efficient design.', 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png', 6.00, 35.00, 95, GETDATE(), GETDATE());

-- EVONEO Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('EVONEO', 'VinFast', 'Evo Neo', 'Scooter', 2024, 2, 'Neo Design, Smart Features, Energy Efficient, LED Lighting', 'VinFast Evo Neo - Modern neo-style electric scooter with smart features and efficient performance.', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp', 5.00, 28.00, 78, GETDATE(), GETDATE());

-- FELIZS Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('FELIZS', 'VinFast', 'Feliz S', 'Scooter', 2024, 2, 'Compact Design, Easy Riding, LED Headlights, Phone Holder', 'VinFast Feliz S - Compact and stylish electric scooter for convenient city transportation.', 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png', 4.00, 25.00, 65, GETDATE(), GETDATE());

-- FELIZLITE Model
INSERT INTO vehicle_models (model_id, brand, model_name, type, year, seats, features, description, image, price_per_hour, price_per_day, max_range_km, created_at, updated_at)
VALUES ('FELIZLITE', 'VinFast', 'Feliz Lite', 'Scooter', 2024, 2, 'Budget Friendly, Simple Design, Basic Features, Reliable', 'VinFast Feliz Lite - Affordable and reliable electric scooter for budget-conscious riders.', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', 3.00, 20.00, 55, GETDATE(), GETDATE());

-- ============================================
-- BƯỚC 3: INSERT VEHICLES TỪ VEHICLES.TS
-- ============================================

-- VF3 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF3', 1, 'VN1VF3001A0001001', 88, 210, 'available', 8.00, 60.00, 4.6, 145, 78, 5200, '2024-01-15', '2024-01-20', '2024-12-31', 'excellent', 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', '50A-001', '110 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('VF3', 3, 'VN1VF3001A0001002', 92, 210, 'rented', 8.00, 60.00, 4.5, 98, 56, 3400, '2024-01-12', '2024-01-18', '2024-12-31', 'excellent', 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png', '50A-002', '110 kWh/100km', 'Airport Station', GETDATE(), GETDATE()),
('VF3', 5, 'VN1VF3001A0001003', 85, 210, 'available', 8.00, 60.00, 4.7, 134, 89, 6800, '2024-01-10', '2024-01-16', '2024-12-31', 'good', 'https://vinfast-tphochiminh.com/OTO3602300549/files/mau_xe/VF3/vang.webp', '50A-003', '110 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('VF3', 7, 'VN1VF3001A0001004', 78, 210, 'available', 8.00, 60.00, 4.4, 76, 45, 8900, '2024-01-08', '2024-01-14', '2024-12-31', 'good', 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xanh-Noc-trang-min.png', '50A-004', '110 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE());

-- VF5 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF5', 2, 'VN1VF5001A0002001', 90, 285, 'available', 12.00, 95.00, 4.8, 189, 123, 4200, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', '51B-001', '125 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('VF5', 4, 'VN1VF5001A0002002', 86, 285, 'available', 12.00, 95.00, 4.7, 167, 98, 6100, '2024-01-11', '2024-01-17', '2024-12-31', 'excellent', 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf5-trang.png', '51B-002', '125 kWh/100km', 'District 3 Station', GETDATE(), GETDATE()),
('VF5', 6, 'VN1VF5001A0002003', 93, 285, 'available', 12.00, 95.00, 4.6, 142, 87, 5400, '2024-01-13', '2024-01-18', '2024-12-31', 'excellent', 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey-white.png', '51B-003', '125 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('VF5', 8, 'VN1VF5001A0002004', 81, 285, 'available', 12.00, 95.00, 4.5, 98, 67, 7800, '2024-01-09', '2024-01-15', '2024-12-31', 'good', 'https://vinfastdienchau.com/wp-content/uploads/2014/08/vinfast-vf5-orange.png', '51B-004', '125 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- VF6 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF6', 1, 'VN1VF6001A0003001', 89, 365, 'rented', 15.00, 120.00, 4.8, 234, 156, 3800, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg', '51C-001', '140 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('VF6', 3, 'VN1VF6001A0003002', 94, 365, 'available', 15.00, 120.00, 4.7, 178, 112, 4900, '2024-01-13', '2024-01-19', '2024-12-31', 'excellent', 'https://vfxanh.vn/wp-content/uploads/2024/08/9.png', '51C-002', '140 kWh/100km', 'Airport Station', GETDATE(), GETDATE()),
('VF6', 5, 'VN1VF6001A0003003', 87, 365, 'available', 15.00, 120.00, 4.9, 201, 134, 5600, '2024-01-15', '2024-01-20', '2024-12-31', 'excellent', 'https://vinfastthanhhoa.net/wp-content/uploads/2024/03/vinfast-vf6-2.jpg', '51C-003', '140 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('VF6', 7, 'VN1VF6001A0003004', 82, 365, 'available', 15.00, 120.00, 4.6, 145, 89, 7200, '2024-01-10', '2024-01-16', '2024-12-31', 'good', 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-xam-1-1110x1032-600x600-1.jpg', '51C-004', '140 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE());

-- VF7 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF7', 2, 'VN1VF7001A0004001', 91, 390, 'available', 18.00, 145.00, 4.8, 267, 178, 4100, '2024-01-17', '2024-01-22', '2024-12-31', 'excellent', 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png', '51D-001', '155 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('VF7', 4, 'VN1VF7001A0004002', 88, 390, 'available', 18.00, 145.00, 4.7, 198, 134, 5300, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf7-do.png', '51D-002', '155 kWh/100km', 'District 3 Station', GETDATE(), GETDATE()),
('VF7', 6, 'VN1VF7001A0004003', 85, 390, 'available', 18.00, 145.00, 4.9, 223, 167, 4700, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://vinfastvietnam.com.vn/wp-content/uploads/2022/11/Xam-Xi-Mang-min.png', '51D-003', '155 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('VF7', 8, 'VN1VF7001A0004004', 79, 390, 'available', 18.00, 145.00, 4.6, 156, 98, 6900, '2024-01-11', '2024-01-17', '2024-12-31', 'good', 'https://vinfast-chevrolet.net/upload/sanpham/tai-xuong-0293.png', '51D-004', '155 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- VF8 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF8', 1, 'VN1VF8001A0005001', 93, 425, 'rented', 22.00, 175.00, 4.9, 312, 234, 3200, '2024-01-18', '2024-01-23', '2024-12-31', 'excellent', 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg', '51E-001', '165 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('VF8', 3, 'VN1VF8001A0005002', 96, 425, 'available', 22.00, 175.00, 4.8, 278, 189, 4100, '2024-01-15', '2024-01-20', '2024-12-31', 'excellent', 'https://vinfast-auto-vn.net/wp-content/uploads/2022/08/VinFast-VF-8-mau-Xanh-Luc.png', '51E-002', '165 kWh/100km', 'Airport Station', GETDATE(), GETDATE()),
('VF8', 5, 'VN1VF8001A0005003', 90, 425, 'available', 22.00, 175.00, 4.7, 245, 167, 4800, '2024-01-17', '2024-01-22', '2024-12-31', 'excellent', 'https://vinfastphantrongtue.com/wp-content/uploads/2023/09/11.png', '51E-003', '165 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('VF8', 7, 'VN1VF8001A0005004', 84, 425, 'available', 22.00, 175.00, 4.8, 201, 134, 5700, '2024-01-13', '2024-01-18', '2024-12-31', 'excellent', 'https://vinfastvietnam.com.vn/wp-content/uploads/2022/08/Bac-PLUS-min.png', '51E-004', '165 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE());

-- VF9 Vehicles (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('VF9', 2, 'VN1VF9001A0006001', 89, 485, 'available', 28.00, 220.00, 4.9, 198, 145, 2800, '2024-01-19', '2024-01-24', '2024-12-31', 'excellent', 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp', '51F-001', '180 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('VF9', 4, 'VN1VF9001A0006002', 92, 485, 'available', 28.00, 220.00, 4.8, 167, 112, 3500, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://vinfastductronglamdong.vn/images/thumbs/2025/03/vinfast-vf-9.png', '51F-002', '180 kWh/100km', 'District 3 Station', GETDATE(), GETDATE()),
('VF9', 6, 'VN1VF9001A0006003', 95, 485, 'available', 28.00, 220.00, 4.9, 234, 178, 3100, '2024-01-18', '2024-01-23', '2024-12-31', 'excellent', 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf9-xam.png', '51F-003', '180 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('VF9', 8, 'VN1VF9001A0006004', 87, 485, 'available', 28.00, 220.00, 4.7, 145, 89, 4200, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://vinfasthadong.com.vn/wp-content/uploads/2023/10/vinfast-vf9-blue.jpg', '51F-004', '180 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- Scooters (EVO200, EVO200LITE, EVOGRAND, EVOGRANDLITE, EVONEO, FELIZS, FELIZLITE)
-- EVO200 (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('EVO200', 5, 'VN2EVO200A0007005', 90, 90, 'available', 6.00, 35.00, 4.7, 201, 312, 3800, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', '59A-001', '35 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('EVO200', 6, 'VN2EVO200A0007006', 86, 90, 'available', 6.00, 35.00, 4.6, 178, 289, 4300, '2024-01-13', '2024-01-18', '2024-12-31', 'excellent', 'https://xedienvietthanh.com/wp-content/uploads/2022/11/xe-may-dien-vinfast-evo-200-trang.jpg', '59A-002', '35 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('EVO200', 7, 'VN2EVO200A0007007', 91, 90, 'available', 6.00, 35.00, 4.8, 223, 356, 3400, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw548c6028/images/PDP-XMD/evo200/img-evo-blue.png', '59A-003', '35 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE()),
('EVO200', 8, 'VN2EVO200A0007008', 84, 90, 'available', 6.00, 35.00, 4.5, 145, 223, 4800, '2024-01-11', '2024-01-17', '2024-12-31', 'good', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0b27b768/images/PDP-XMD/evo200/img-evo-red.png', '59A-004', '35 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- EVO200LITE (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('EVO200LITE', 1, 'VN2EVO200LA0008001', 89, 75, 'available', 5.00, 30.00, 4.6, 198, 289, 3600, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', '59B-001', '30 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('EVO200LITE', 2, 'VN2EVO200LA0008002', 93, 75, 'available', 5.00, 30.00, 4.7, 245, 367, 2900, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw469d980d/images/PDP-XMD/evo200-lite/img-evo-yellow.png', '59B-002', '30 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('EVO200LITE', 3, 'VN2EVO200LA0008003', 86, 75, 'available', 5.00, 30.00, 4.5, 167, 234, 4200, '2024-01-11', '2024-01-17', '2024-12-31', 'good', 'https://vinfastbinhthanh.com/wp-content/uploads/2024/01/vinfast_eveo200_lite_mau_trang.webp', '59B-003', '30 kWh/100km', 'Airport Station', GETDATE(), GETDATE()),
('EVO200LITE', 4, 'VN2EVO200LA0008004', 91, 75, 'available', 5.00, 30.00, 4.8, 289, 412, 3100, '2024-01-17', '2024-01-22', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwba20f6df/images/PDP-XMD/evo200-lite/img-evo-red.png', '59B-004', '30 kWh/100km', 'District 3 Station', GETDATE(), GETDATE());

-- EVOGRAND (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('EVOGRAND', 5, 'VN2EVOGRA0010005', 93, 110, 'available', 7.00, 40.00, 4.9, 312, 456, 2700, '2024-01-18', '2024-01-23', '2024-12-31', 'excellent', 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg', '59C-001', '38 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('EVOGRAND', 6, 'VN2EVOGRA0010006', 86, 110, 'available', 7.00, 40.00, 4.5, 167, 234, 3900, '2024-01-11', '2024-01-17', '2024-12-31', 'good', 'https://vinfastecoxe.vn/wp-content/uploads/2025/07/anh-khach-1207.png', '59C-002', '38 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('EVOGRAND', 7, 'VN2EVOGRA0010007', 91, 110, 'available', 7.00, 40.00, 4.8, 278, 389, 3100, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw059cd4e7/landingpage/lp-xmd/evo-grand/color/3.webp', '59C-003', '38 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE()),
('EVOGRAND', 8, 'VN2EVOGRA0010008', 87, 110, 'available', 7.00, 40.00, 4.6, 201, 298, 3600, '2024-01-13', '2024-01-18', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9a93ae28/landingpage/lp-xmd/evo-grand/color/2.webp', '59C-004', '38 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- EVOGRANDLITE (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('EVOGRANDLITE', 1, 'VN2EVOGRL0011001', 89, 95, 'available', 6.00, 35.00, 4.6, 189, 278, 3500, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png', '59D-001', '36 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('EVOGRANDLITE', 2, 'VN2EVOGRL0011002', 91, 95, 'available', 6.00, 35.00, 4.7, 234, 345, 3100, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-3-1.png', '59D-002', '36 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('EVOGRANDLITE', 3, 'VN2EVOGRL0011003', 84, 95, 'available', 6.00, 35.00, 4.5, 156, 223, 4200, '2024-01-10', '2024-01-16', '2024-12-31', 'good', 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-2.png', '59D-003', '36 kWh/100km', 'Airport Station', GETDATE(), GETDATE()),
('EVOGRANDLITE', 4, 'VN2EVOGRL0011004', 92, 95, 'available', 6.00, 35.00, 4.8, 267, 389, 2900, '2024-01-17', '2024-01-22', '2024-12-31', 'excellent', 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite.png', '59D-004', '36 kWh/100km', 'District 3 Station', GETDATE(), GETDATE());

-- EVONEO (4 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('EVONEO', 5, 'VN2EVONEO0012005', 89, 78, 'available', 5.00, 28.00, 4.6, 178, 234, 3400, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp', '59E-001', '32 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('EVONEO', 6, 'VN2EVONEO0012006', 92, 78, 'available', 5.00, 28.00, 4.7, 201, 289, 3100, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0537c8ee/images/PDP-XMD/evoneo/img-top-evoneo-white-sp.webp', '59E-002', '32 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('EVONEO', 7, 'VN2EVONEO0012007', 86, 78, 'available', 5.00, 28.00, 4.4, 134, 198, 4300, '2024-01-10', '2024-01-16', '2024-12-31', 'good', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw46480ad9/images/PDP-XMD/evoneo/img-top-evoneo-green-sp.webp', '59E-003', '32 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE()),
('EVONEO', 8, 'VN2EVONEO0012008', 88, 78, 'available', 5.00, 28.00, 4.9, 289, 423, 2600, '2024-01-18', '2024-01-23', '2024-12-31', 'excellent', 'https://xedienthanhtung.com/wp-content/uploads/2025/06/xe-may-dien-vinfast-evo-lite-neo-den.webp', '59E-004', '32 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- FELIZS (3 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('FELIZS', 1, 'VN2FELIZSA0013001', 88, 65, 'available', 4.00, 25.00, 4.5, 167, 245, 3900, '2024-01-12', '2024-01-18', '2024-12-31', 'excellent', 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png', '59F-001', '28 kWh/100km', 'District 1 Station', GETDATE(), GETDATE()),
('FELIZS', 2, 'VN2FELIZSA0013002', 92, 65, 'available', 4.00, 25.00, 4.6, 198, 289, 3400, '2024-01-14', '2024-01-19', '2024-12-31', 'excellent', 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/vinfast-feliz-s-zo5p3knt-9737.png', '59F-002', '28 kWh/100km', 'District 7 Station', GETDATE(), GETDATE()),
('FELIZS', 3, 'VN2FELIZSA0013003', 85, 65, 'available', 4.00, 25.00, 4.7, 223, 334, 4200, '2024-01-10', '2024-01-16', '2024-12-31', 'good', 'https://vinfast.net.vn/datafiles/42776/upload/images/san%20pham/fiz/fiz-7_result.jpg', '59F-003', '28 kWh/100km', 'Airport Station', GETDATE(), GETDATE());

-- FELIZLITE (5 xe)
INSERT INTO vehicles (model_id, station_id, unique_vehicle_id, battery_level, max_range_km, status, price_per_hour, price_per_day, rating, review_count, trips, mileage, last_maintenance, inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency, location, created_at, updated_at)
VALUES 
('FELIZLITE', 4, 'VN2FELIZL0014004', 92, 55, 'available', 3.00, 20.00, 4.6, 201, 298, 3200, '2024-01-16', '2024-01-21', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', '59G-001', '25 kWh/100km', 'District 3 Station', GETDATE(), GETDATE()),
('FELIZLITE', 5, 'VN2FELIZL0014005', 86, 55, 'available', 3.00, 20.00, 4.2, 123, 189, 4400, '2024-01-09', '2024-01-15', '2024-12-31', 'good', 'https://vinfastecoxe.vn/wp-content/uploads/2025/09/Feliz-2-pin-anh-web-3.png', '59G-002', '25 kWh/100km', 'District 5 Station', GETDATE(), GETDATE()),
('FELIZLITE', 6, 'VN2FELIZL0014006', 91, 55, 'available', 3.00, 20.00, 4.7, 245, 367, 2900, '2024-01-17', '2024-01-22', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5f142101/images/PDP-XMD/felizlite/img-top-feliz-lite-black.webp', '59G-003', '25 kWh/100km', 'Binh Thanh Station', GETDATE(), GETDATE()),
('FELIZLITE', 7, 'VN2FELIZL0014007', 83, 55, 'available', 3.00, 20.00, 4.1, 98, 145, 4800, '2024-01-08', '2024-01-14', '2024-12-31', 'fair', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf7bf9ced/images/PDP-XMD/felizlite/img-top-feliz-lite-light-green.webp', '59G-004', '25 kWh/100km', 'Thu Duc Station', GETDATE(), GETDATE()),
('FELIZLITE', 8, 'VN2FELIZL0014008', 89, 55, 'available', 3.00, 20.00, 4.5, 189, 278, 3400, '2024-01-15', '2024-01-20', '2024-12-31', 'excellent', 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwcc3b80f3/images/PDP-XMD/felizlite/img-top-feliz-lite-sand.webp', '59G-005', '25 kWh/100km', 'Phu Nhuan Station', GETDATE(), GETDATE());

-- ============================================
-- BƯỚC 4: KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra số lượng vehicle_models
SELECT 'VEHICLE MODELS COUNT:' as Info, COUNT(*) as Total
FROM vehicle_models;

-- Kiểm tra số lượng vehicles
SELECT 'VEHICLES COUNT:' as Info, COUNT(*) as Total
FROM vehicles;

-- Kiểm tra dữ liệu vehicle_models
SELECT 'VEHICLE MODELS DATA:' as Info;
SELECT model_id, brand, model_name, type, image, price_per_hour, price_per_day, max_range_km
FROM vehicle_models
ORDER BY model_id;

-- Kiểm tra dữ liệu vehicles (mẫu)
SELECT 'VEHICLES DATA SAMPLE:' as Info;
SELECT TOP 10 vehicle_id, model_id, unique_vehicle_id, license_plate, image, fuel_efficiency, location, status
FROM vehicles
ORDER BY vehicle_id;
