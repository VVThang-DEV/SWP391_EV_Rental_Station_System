-- Script sửa lỗi hoàn chỉnh - Chạy từng phần một

-- ============================================
-- PHẦN 1: THÊM CÁC CỘT CÒN THIẾU CHO BẢNG STATIONS
-- ============================================

-- Kiểm tra xem cột đã tồn tại chưa trước khi thêm
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'city')
    ALTER TABLE stations ADD city NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'available_vehicles')
    ALTER TABLE stations ADD available_vehicles INT DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'total_slots')
    ALTER TABLE stations ADD total_slots INT DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'amenities')
    ALTER TABLE stations ADD amenities NVARCHAR(MAX);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'rating')
    ALTER TABLE stations ADD rating DECIMAL(3,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'operating_hours')
    ALTER TABLE stations ADD operating_hours NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'fast_charging')
    ALTER TABLE stations ADD fast_charging BIT DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stations' AND COLUMN_NAME = 'image')
    ALTER TABLE stations ADD image NVARCHAR(500);

-- ============================================
-- PHẦN 2: THÊM CÁC CỘT CÒN THIẾU CHO BẢNG VEHICLE_MODELS
-- ============================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicle_models' AND COLUMN_NAME = 'image')
    ALTER TABLE vehicle_models ADD image NVARCHAR(500);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicle_models' AND COLUMN_NAME = 'price_per_hour')
    ALTER TABLE vehicle_models ADD price_per_hour DECIMAL(10,2);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicle_models' AND COLUMN_NAME = 'price_per_day')
    ALTER TABLE vehicle_models ADD price_per_day DECIMAL(10,2);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicle_models' AND COLUMN_NAME = 'max_range_km')
    ALTER TABLE vehicle_models ADD max_range_km INT;

-- ============================================
-- PHẦN 3: THÊM CÁC CỘT CÒN THIẾU CHO BẢNG VEHICLES
-- ============================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'image')
    ALTER TABLE vehicles ADD image NVARCHAR(500);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'license_plate')
    ALTER TABLE vehicles ADD license_plate NVARCHAR(20);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'fuel_efficiency')
    ALTER TABLE vehicles ADD fuel_efficiency NVARCHAR(50);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'location')
    ALTER TABLE vehicles ADD location NVARCHAR(200);

-- ============================================
-- PHẦN 4: CẬP NHẬT DỮ LIỆU MẪU CHO STATIONS
-- ============================================

-- Cập nhật dữ liệu cho station_id = 1 (District 1 Station)
UPDATE stations SET 
    city = 'Ho Chi Minh City',
    available_vehicles = 5,
    total_slots = 12,
    amenities = '["Fast Charging", "Cafe", "Restroom", "Parking"]',
    rating = 4.8,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://iwater.vn/Image/Picture/New/Quan-1.jpg'
WHERE station_id = 1;

-- Cập nhật dữ liệu cho station_id = 2 (District 7 Station)
UPDATE stations SET 
    city = 'Ho Chi Minh City',
    available_vehicles = 6,
    total_slots = 10,
    amenities = '["Fast Charging", "Shopping Mall", "Restaurant", "ATM"]',
    rating = 4.6,
    operating_hours = '6:00 AM - 10:00 PM',
    fast_charging = 1,
    image = 'https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg'
WHERE station_id = 2;

-- Cập nhật dữ liệu cho station_id = 3 (Airport Station)
UPDATE stations SET 
    city = 'Ho Chi Minh City',
    available_vehicles = 6,
    total_slots = 20,
    amenities = '["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"]',
    rating = 4.9,
    operating_hours = '24/7',
    fast_charging = 1,
    image = 'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png'
WHERE station_id = 3;

-- ============================================
-- PHẦN 5: TẠO INDEX ĐỂ TỐI ƯU HIỆU SUẤT
-- ============================================

-- Tạo index cho bảng vehicles
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vehicles_station_id')
    CREATE INDEX IX_vehicles_station_id ON vehicles(station_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vehicles_model_id')
    CREATE INDEX IX_vehicles_model_id ON vehicles(model_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vehicles_status')
    CREATE INDEX IX_vehicles_status ON vehicles(status);

-- Tạo index cho bảng stations
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_stations_city')
    CREATE INDEX IX_stations_city ON stations(city);

-- ============================================
-- PHẦN 6: KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra cấu trúc bảng stations sau khi cập nhật
SELECT 'STATIONS TABLE STRUCTURE:' as Info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'stations'
ORDER BY ORDINAL_POSITION;

-- Kiểm tra dữ liệu stations
SELECT 'STATIONS DATA:' as Info;
SELECT station_id, name, city, available_vehicles, total_slots, rating, operating_hours, fast_charging
FROM stations;
