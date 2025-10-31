-- ============================================
-- Script tạo thêm nhiều xe vào database
-- ============================================

USE EV_Rental;
GO

-- Kiểm tra các station hiện có
SELECT station_id, name FROM stations ORDER BY station_id;
GO

-- Kiểm tra các model hiện có
SELECT model_id, name, manufacturer FROM vehicle_models ORDER BY model_id;
GO

-- ============================================
-- BƯỚC 1: TẠO NHIỀU XE CỦA VF3 (VinFast)
-- ============================================

-- Station 1 - District 1 (8 xe VF3)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
-- VF3 tại Station 1
(1, 'VF3', 'VN1-VF3-001', 85, 210, 'available', 8.00, 60.00, 4.8, 156, 89, 5420, '2024-10-01', '2025-12-31', 'excellent', NULL, '30A-12345', '6.5 kWh/100km', 'District 1 Station', 'White', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-002', 92, 210, 'available', 8.00, 60.00, 4.6, 142, 78, 4980, '2024-09-15', '2025-12-31', 'excellent', NULL, '30A-12346', '6.5 kWh/100km', 'District 1 Station', 'Black', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-003', 78, 210, 'available', 8.00, 60.00, 4.7, 134, 82, 5210, '2024-10-05', '2025-12-31', 'excellent', NULL, '30A-12347', '6.5 kWh/100km', 'District 1 Station', 'Blue', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-004', 95, 210, 'rented', 8.00, 60.00, 4.9, 167, 95, 6230, '2024-09-20', '2025-12-31', 'excellent', NULL, '30A-12348', '6.5 kWh/100km', 'District 1 Station', 'Red', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-005', 88, 210, 'available', 8.00, 60.00, 4.5, 128, 71, 4560, '2024-09-10', '2025-12-31', 'excellent', NULL, '30A-12349', '6.5 kWh/100km', 'District 1 Station', 'Silver', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-006', 91, 210, 'available', 8.00, 60.00, 4.8, 153, 85, 5670, '2024-10-03', '2025-12-31', 'excellent', NULL, '30A-12350', '6.5 kWh/100km', 'District 1 Station', 'White', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-007', 73, 210, 'maintenance', 8.00, 60.00, 4.6, 139, 76, 4830, '2024-08-25', '2025-12-31', 'good', NULL, '30A-12351', '6.5 kWh/100km', 'District 1 Station', 'Black', 2024, GETDATE(), GETDATE()),
(1, 'VF3', 'VN1-VF3-008', 97, 210, 'available', 8.00, 60.00, 4.9, 171, 103, 6780, '2024-09-28', '2025-12-31', 'excellent', NULL, '30A-12352', '6.5 kWh/100km', 'District 1 Station', 'Red', 2024, GETDATE(), GETDATE());

-- Station 2 - District 7 (7 xe VF3)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
(2, 'VF3', 'VN1-VF3-101', 86, 210, 'available', 8.00, 60.00, 4.7, 145, 82, 5120, '2024-10-02', '2025-12-31', 'excellent', NULL, '30A-23456', '6.5 kWh/100km', 'District 7 Station', 'White', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-102', 94, 210, 'available', 8.00, 60.00, 4.8, 158, 91, 5890, '2024-09-18', '2025-12-31', 'excellent', NULL, '30A-23457', '6.5 kWh/100km', 'District 7 Station', 'Black', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-103', 81, 210, 'rented', 8.00, 60.00, 4.6, 136, 79, 4940, '2024-09-12', '2025-12-31', 'excellent', NULL, '30A-23458', '6.5 kWh/100km', 'District 7 Station', 'Blue', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-104', 89, 210, 'available', 8.00, 60.00, 4.9, 162, 97, 6420, '2024-10-07', '2025-12-31', 'excellent', NULL, '30A-23459', '6.5 kWh/100km', 'District 7 Station', 'Red', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-105', 92, 210, 'available', 8.00, 60.00, 4.5, 131, 74, 4730, '2024-09-05', '2025-12-31', 'excellent', NULL, '30A-23460', '6.5 kWh/100km', 'District 7 Station', 'Silver', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-106', 76, 210, 'available', 8.00, 60.00, 4.7, 148, 86, 5340, '2024-10-10', '2025-12-31', 'excellent', NULL, '30A-23461', '6.5 kWh/100km', 'District 7 Station', 'White', 2024, GETDATE(), GETDATE()),
(2, 'VF3', 'VN1-VF3-107', 98, 210, 'available', 8.00, 60.00, 4.8, 151, 88, 5610, '2024-09-25', '2025-12-31', 'excellent', NULL, '30A-23462', '6.5 kWh/100km', 'District 7 Station', 'Black', 2024, GETDATE(), GETDATE());

-- Station 3 - Airport (10 xe VF3)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
(3, 'VF3', 'VN1-VF3-201', 88, 210, 'available', 8.00, 60.00, 4.6, 133, 77, 4680, '2024-10-04', '2025-12-31', 'excellent', NULL, '30A-34567', '6.5 kWh/100km', 'Airport Station', 'White', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-202', 91, 210, 'available', 8.00, 60.00, 4.8, 159, 93, 6120, '2024-09-22', '2025-12-31', 'excellent', NULL, '30A-34568', '6.5 kWh/100km', 'Airport Station', 'Black', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-203', 85, 210, 'rented', 8.00, 60.00, 4.7, 147, 84, 5270, '2024-09-08', '2025-12-31', 'excellent', NULL, '30A-34569', '6.5 kWh/100km', 'Airport Station', 'Blue', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-204', 93, 210, 'available', 8.00, 60.00, 4.9, 165, 99, 6510, '2024-10-12', '2025-12-31', 'excellent', NULL, '30A-34570', '6.5 kWh/100km', 'Airport Station', 'Red', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-205', 87, 210, 'available', 8.00, 60.00, 4.5, 129, 73, 4610, '2024-09-14', '2025-12-31', 'excellent', NULL, '30A-34571', '6.5 kWh/100km', 'Airport Station', 'Silver', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-206', 96, 210, 'available', 8.00, 60.00, 4.6, 141, 80, 5060, '2024-09-30', '2025-12-31', 'excellent', NULL, '30A-34572', '6.5 kWh/100km', 'Airport Station', 'White', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-207', 79, 210, 'available', 8.00, 60.00, 4.8, 154, 87, 5730, '2024-10-08', '2025-12-31', 'excellent', NULL, '30A-34573', '6.5 kWh/100km', 'Airport Station', 'Black', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-208', 90, 210, 'available', 8.00, 60.00, 4.7, 146, 83, 5380, '2024-09-19', '2025-12-31', 'excellent', NULL, '30A-34574', '6.5 kWh/100km', 'Airport Station', 'Blue', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-209', 84, 210, 'maintenance', 8.00, 60.00, 4.9, 168, 101, 6650, '2024-10-15', '2025-12-31', 'good', NULL, '30A-34575', '6.5 kWh/100km', 'Airport Station', 'Red', 2024, GETDATE(), GETDATE()),
(3, 'VF3', 'VN1-VF3-210', 95, 210, 'available', 8.00, 60.00, 4.6, 140, 81, 5120, '2024-09-27', '2025-12-31', 'excellent', NULL, '30A-34576', '6.5 kWh/100km', 'Airport Station', 'Silver', 2024, GETDATE(), GETDATE());

-- ============================================
-- BƯỚC 2: TẠO NHIỀU XE CỦA VF7 (VinFast)
-- ============================================

-- Station 1 - District 1 (5 xe VF7)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
(1, 'VF7', 'VN1-VF7-001', 82, 390, 'available', 18.00, 145.00, 4.7, 89, 45, 3420, '2024-10-06', '2025-12-31', 'excellent', NULL, '30B-11111', '8.2 kWh/100km', 'District 1 Station', 'White', 2024, GETDATE(), GETDATE()),
(1, 'VF7', 'VN1-VF7-002', 95, 390, 'available', 18.00, 145.00, 4.9, 102, 58, 4230, '2024-09-21', '2025-12-31', 'excellent', NULL, '30B-11112', '8.2 kWh/100km', 'District 1 Station', 'Black', 2024, GETDATE(), GETDATE()),
(1, 'VF7', 'VN1-VF7-003', 88, 390, 'rented', 18.00, 145.00, 4.8, 96, 52, 3890, '2024-09-11', '2025-12-31', 'excellent', NULL, '30B-11113', '8.2 kWh/100km', 'District 1 Station', 'Blue', 2024, GETDATE(), GETDATE()),
(1, 'VF7', 'VN1-VF7-004', 91, 390, 'available', 18.00, 145.00, 4.6, 87, 48, 3620, '2024-10-09', '2025-12-31', 'excellent', NULL, '30B-11114', '8.2 kWh/100km', 'District 1 Station', 'Red', 2024, GETDATE(), GETDATE()),
(1, 'VF7', 'VN1-VF7-005', 86, 390, 'available', 18.00, 145.00, 4.9, 108, 61, 4560, '2024-09-29', '2025-12-31', 'excellent', NULL, '30B-11115', '8.2 kWh/100km', 'District 1 Station', 'Silver', 2024, GETDATE(), GETDATE());

-- Station 2 - District 7 (4 xe VF7)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
(2, 'VF7', 'VN1-VF7-101', 89, 390, 'available', 18.00, 145.00, 4.7, 93, 50, 3720, '2024-10-11', '2025-12-31', 'excellent', NULL, '30B-22222', '8.2 kWh/100km', 'District 7 Station', 'White', 2024, GETDATE(), GETDATE()),
(2, 'VF7', 'VN1-VF7-102', 92, 390, 'available', 18.00, 145.00, 4.8, 99, 54, 3980, '2024-09-17', '2025-12-31', 'excellent', NULL, '30B-22223', '8.2 kWh/100km', 'District 7 Station', 'Black', 2024, GETDATE(), GETDATE()),
(2, 'VF7', 'VN1-VF7-103', 85, 390, 'available', 18.00, 145.00, 4.9, 105, 59, 4320, '2024-10-13', '2025-12-31', 'excellent', NULL, '30B-22224', '8.2 kWh/100km', 'District 7 Station', 'Blue', 2024, GETDATE(), GETDATE()),
(2, 'VF7', 'VN1-VF7-104', 97, 390, 'rented', 18.00, 145.00, 4.6, 91, 47, 3540, '2024-09-07', '2025-12-31', 'excellent', NULL, '30B-22225', '8.2 kWh/100km', 'District 7 Station', 'Red', 2024, GETDATE(), GETDATE());

-- Station 3 - Airport (6 xe VF7)
INSERT INTO vehicles (
    station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
    status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
    inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
    location, color, year, created_at, updated_at
)
VALUES
(3, 'VF7', 'VN1-VF7-201', 84, 390, 'available', 18.00, 145.00, 4.8, 97, 53, 3860, '2024-10-14', '2025-12-31', 'excellent', NULL, '30B-33333', '8.2 kWh/100km', 'Airport Station', 'White', 2024, GETDATE(), GETDATE()),
(3, 'VF7', 'VN1-VF7-202', 93, 390, 'available', 18.00, 145.00, 4.7, 92, 49, 3690, '2024-09-24', '2025-12-31', 'excellent', NULL, '30B-33334', '8.2 kWh/100km', 'Airport Station', 'Black', 2024, GETDATE(), GETDATE()),
(3, 'VF7', 'VN1-VF7-203', 87, 390, 'available', 18.00, 145.00, 4.9, 111, 63, 4720, '2024-09-16', '2025-12-31', 'excellent', NULL, '30B-33335', '8.2 kWh/100km', 'Airport Station', 'Blue', 2024, GETDATE(), GETDATE()),
(3, 'VF7', 'VN1-VF7-204', 90, 390, 'rented', 18.00, 145.00, 4.6, 88, 46, 3580, '2024-10-16', '2025-12-31', 'excellent', NULL, '30B-33336', '8.2 kWh/100km', 'Airport Station', 'Red', 2024, GETDATE(), GETDATE()),
(3, 'VF7', 'VN1-VF7-205', 96, 390, 'available', 18.00, 145.00, 4.8, 104, 57, 4110, '2024-09-26', '2025-12-31', 'excellent', NULL, '30B-33337', '8.2 kWh/100km', 'Airport Station', 'Silver', 2024, GETDATE(), GETDATE()),
(3, 'VF7', 'VN1-VF7-206', 83, 390, 'maintenance', 18.00, 145.00, 4.7, 94, 51, 3810, '2024-09-06', '2025-12-31', 'good', NULL, '30B-33338', '8.2 kWh/100km', 'Airport Station', 'White', 2024, GETDATE(), GETDATE());

-- ============================================
-- BƯỚC 3: TẠO THÊM XE CHO CÁC STATION KHÁC (nếu có)
-- ============================================

-- Nếu có Station 4 (District 3)
IF EXISTS (SELECT 1 FROM stations WHERE station_id = 4)
BEGIN
    INSERT INTO vehicles (
        station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
        status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
        inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
        location, color, year, created_at, updated_at
    )
    VALUES
    (4, 'VF3', 'VN1-VF3-301', 89, 210, 'available', 8.00, 60.00, 4.8, 163, 94, 6460, '2024-10-01', '2025-12-31', 'excellent', NULL, '30A-45678', '6.5 kWh/100km', 'District 3 Station', 'White', 2024, GETDATE(), GETDATE()),
    (4, 'VF3', 'VN1-VF3-302', 87, 210, 'available', 8.00, 60.00, 4.7, 152, 87, 5840, '2024-09-23', '2025-12-31', 'excellent', NULL, '30A-45679', '6.5 kWh/100km', 'District 3 Station', 'Black', 2024, GETDATE(), GETDATE()),
    (4, 'VF3', 'VN1-VF3-303', 94, 210, 'available', 8.00, 60.00, 4.6, 144, 83, 5310, '2024-10-05', '2025-12-31', 'excellent', NULL, '30A-45680', '6.5 kWh/100km', 'District 3 Station', 'Blue', 2024, GETDATE(), GETDATE()),
    (4, 'VF3', 'VN1-VF3-304', 91, 210, 'rented', 8.00, 60.00, 4.9, 169, 104, 6910, '2024-09-19', '2025-12-31', 'excellent', NULL, '30A-45681', '6.5 kWh/100km', 'District 3 Station', 'Red', 2024, GETDATE(), GETDATE());
END

-- Nếu có Station 5 (District 5)
IF EXISTS (SELECT 1 FROM stations WHERE station_id = 5)
BEGIN
    INSERT INTO vehicles (
        station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
        status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
        inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
        location, color, year, created_at, updated_at
    )
    VALUES
    (5, 'VF3', 'VN1-VF3-401', 88, 210, 'available', 8.00, 60.00, 4.7, 150, 86, 5480, '2024-10-06', '2025-12-31', 'excellent', NULL, '30A-56789', '6.5 kWh/100km', 'District 5 Station', 'White', 2024, GETDATE(), GETDATE()),
    (5, 'VF3', 'VN1-VF3-402', 86, 210, 'available', 8.00, 60.00, 4.8, 157, 90, 5950, '2024-09-13', '2025-12-31', 'excellent', NULL, '30A-56790', '6.5 kWh/100km', 'District 5 Station', 'Black', 2024, GETDATE(), GETDATE()),
    (5, 'VF3', 'VN1-VF3-403', 92, 210, 'available', 8.00, 60.00, 4.5, 132, 75, 4800, '2024-09-27', '2025-12-31', 'excellent', NULL, '30A-56791', '6.5 kWh/100km', 'District 5 Station', 'Blue', 2024, GETDATE(), GETDATE()),
    (5, 'VF3', 'VN1-VF3-404', 90, 210, 'available', 8.00, 60.00, 4.9, 166, 96, 6390, '2024-10-10', '2025-12-31', 'excellent', NULL, '30A-56792', '6.5 kWh/100km', 'District 5 Station', 'Red', 2024, GETDATE(), GETDATE());
END

-- Nếu có Station 6, 7, 8... (có thể thêm thêm)
IF EXISTS (SELECT 1 FROM stations WHERE station_id = 6)
BEGIN
    INSERT INTO vehicles (
        station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
        status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
        inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
        location, color, year, created_at, updated_at
    )
    VALUES
    (6, 'VF3', 'VN1-VF3-501', 85, 210, 'available', 8.00, 60.00, 4.6, 143, 81, 5160, '2024-10-08', '2025-12-31', 'excellent', NULL, '30A-67890', '6.5 kWh/100km', NULL, 'White', 2024, GETDATE(), GETDATE()),
    (6, 'VF3', 'VN1-VF3-502', 93, 210, 'available', 8.00, 60.00, 4.8, 160, 92, 6050, '2024-09-24', '2025-12-31', 'excellent', NULL, '30A-67891', '6.5 kWh/100km', NULL, 'Black', 2024, GETDATE(), GETDATE()),
    (6, 'VF3', 'VN1-VF3-503', 87, 210, 'available', 8.00, 60.00, 4.7, 149, 85, 5520, '2024-10-12', '2025-12-31', 'excellent', NULL, '30A-67892', '6.5 kWh/100km', NULL, 'Blue', 2024, GETDATE(), GETDATE()),
    (6, 'VF3', 'VN1-VF3-504', 95, 210, 'available', 8.00, 60.00, 4.9, 172, 106, 7040, '2024-09-16', '2025-12-31', 'excellent', NULL, '30A-67893', '6.5 kWh/100km', NULL, 'Red', 2024, GETDATE(), GETDATE());
END

IF EXISTS (SELECT 1 FROM stations WHERE station_id = 7)
BEGIN
    INSERT INTO vehicles (
        station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
        status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
        inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
        location, color, year, created_at, updated_at
    )
    VALUES
    (7, 'VF3', 'VN1-VF3-601', 86, 210, 'available', 8.00, 60.00, 4.7, 151, 87, 5580, '2024-10-04', '2025-12-31', 'excellent', NULL, '30A-78901', '6.5 kWh/100km', NULL, 'White', 2024, GETDATE(), GETDATE()),
    (7, 'VF3', 'VN1-VF3-602', 94, 210, 'available', 8.00, 60.00, 4.8, 164, 94, 6480, '2024-09-26', '2025-12-31', 'excellent', NULL, '30A-78902', '6.5 kWh/100km', NULL, 'Black', 2024, GETDATE(), GETDATE()),
    (7, 'VF3', 'VN1-VF3-603', 88, 210, 'rented', 8.00, 60.00, 4.6, 142, 81, 5260, '2024-09-18', '2025-12-31', 'excellent', NULL, '30A-78903', '6.5 kWh/100km', NULL, 'Blue', 2024, GETDATE(), GETDATE()),
    (7, 'VF3', 'VN1-VF3-604', 91, 210, 'available', 8.00, 60.00, 4.9, 170, 98, 6820, '2024-10-11', '2025-12-31', 'excellent', NULL, '30A-78904', '6.5 kWh/100km', NULL, 'Red', 2024, GETDATE(), GETDATE());
END

IF EXISTS (SELECT 1 FROM stations WHERE station_id = 8)
BEGIN
    INSERT INTO vehicles (
        station_id, model_id, unique_vehicle_id, battery_level, max_range_km,
        status, price_per_hour, price_per_day, rating, review_count, trips, mileage,
        inspection_date, insurance_expiry, condition, image, license_plate, fuel_efficiency,
        location, color, year, created_at, updated_at
    )
    VALUES
    (8, 'VF3', 'VN1-VF3-701', 87, 210, 'available', 8.00, 60.00, 4.8, 155, 89, 5640, '2024-10-02', '2025-12-31', 'excellent', NULL, '30A-89012', '6.5 kWh/100km', NULL, 'White', 2024, GETDATE(), GETDATE()),
    (8, 'VF3', 'VN1-VF3-702', 92, 210, 'available', 8.00, 60.00, 4.7, 148, 85, 5410, '2024-09-20', '2025-12-31', 'excellent', NULL, '30A-89013', '6.5 kWh/100km', NULL, 'Black', 2024, GETDATE(), GETDATE()),
    (8, 'VF3', 'VN1-VF3-703', 89, 210, 'available', 8.00, 60.00, 4.9, 167, 96, 6460, '2024-10-07', '2025-12-31', 'excellent', NULL, '30A-89014', '6.5 kWh/100km', NULL, 'Blue', 2024, GETDATE(), GETDATE()),
    (8, 'VF3', 'VN1-VF3-704', 96, 210, 'available', 8.00, 60.00, 4.6, 141, 80, 5190, '2024-09-09', '2025-12-31', 'excellent', NULL, '30A-89015', '6.5 kWh/100km', NULL, 'Red', 2024, GETDATE(), GETDATE());
END

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

PRINT '=== TOTAL VEHICLES BY STATION ===';
SELECT 
    s.station_id,
    s.name AS station_name,
    COUNT(v.vehicle_id) AS total_vehicles,
    SUM(CASE WHEN v.status = 'available' THEN 1 ELSE 0 END) AS available_vehicles,
    SUM(CASE WHEN v.status = 'rented' THEN 1 ELSE 0 END) AS rented_vehicles,
    SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_vehicles
FROM stations s
LEFT JOIN vehicles v ON s.station_id = v.station_id
GROUP BY s.station_id, s.name
ORDER BY s.station_id;
GO

PRINT '=== VEHICLES BY MODEL ===';
SELECT 
    model_id,
    COUNT(*) AS total_count,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) AS rented,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
FROM vehicles
GROUP BY model_id
ORDER BY model_id;
GO

PRINT '=== RECENT ADDED VEHICLES ===';
SELECT TOP 50
    vehicle_id,
    station_id,
    model_id,
    unique_vehicle_id,
    battery_level,
    status,
    price_per_hour,
    price_per_day,
    created_at
FROM vehicles
ORDER BY created_at DESC;
GO

PRINT '=== SCRIPT COMPLETED ===';
GO

