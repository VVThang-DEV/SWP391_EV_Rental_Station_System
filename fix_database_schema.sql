-- Sửa lỗi syntax: Bỏ từ khóa COLUMN trong ALTER TABLE ADD

-- 1. Cập nhật bảng vehicle_models
ALTER TABLE vehicle_models ADD image NVARCHAR(500);
ALTER TABLE vehicle_models ADD price_per_hour DECIMAL(10,2);
ALTER TABLE vehicle_models ADD price_per_day DECIMAL(10,2);
ALTER TABLE vehicle_models ADD max_range_km INT;
-- Cập nhật features thành JSON hoặc bảng riêng để cấu trúc tốt hơn

-- 2. Cập nhật bảng vehicles
ALTER TABLE vehicles ADD image NVARCHAR(500);
ALTER TABLE vehicles ADD license_plate NVARCHAR(20);
ALTER TABLE vehicles ADD fuel_efficiency NVARCHAR(50);
ALTER TABLE vehicles ADD location NVARCHAR(200);
-- Đổi tên max_range_km thành range_km cho nhất quán
-- Cập nhật status sử dụng enum values: 'available', 'rented', 'maintenance'

-- 3. Cập nhật bảng stations
ALTER TABLE stations ADD city NVARCHAR(100);
ALTER TABLE stations ADD available_vehicles INT DEFAULT 0;
ALTER TABLE stations ADD total_slots INT DEFAULT 0;
ALTER TABLE stations ADD amenities NVARCHAR(MAX); -- Mảng JSON
ALTER TABLE stations ADD rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE stations ADD operating_hours NVARCHAR(100);
ALTER TABLE stations ADD fast_charging BIT DEFAULT 0;
ALTER TABLE stations ADD image NVARCHAR(500);

-- 4. Cập nhật dữ liệu mẫu cho stations (nếu cần)
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

-- 5. Tạo index để tối ưu hiệu suất
CREATE INDEX IX_vehicles_station_id ON vehicles(station_id);
CREATE INDEX IX_vehicles_model_id ON vehicles(model_id);
CREATE INDEX IX_vehicles_status ON vehicles(status);
CREATE INDEX IX_stations_city ON stations(city);
