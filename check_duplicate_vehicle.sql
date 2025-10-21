-- Script để kiểm tra duplicate với xe ở dòng 71
USE EV_Rental;
GO

-- Lấy thông tin xe ở dòng 71
DECLARE @target_vehicle_id INT = 71;

PRINT '=== THÔNG TIN XE Ở DÒNG 71 ===';
SELECT 
    vehicle_id,
    license_plate,
    unique_vehicle_id,
    model_id,
    color,
    year,
    battery_capacity,
    fuel_efficiency,
    inspection_date
FROM vehicles 
WHERE vehicle_id = @target_vehicle_id;

PRINT '';
PRINT '=== KIỂM TRA DUPLICATE LICENSE PLATE ===';
SELECT 
    vehicle_id,
    license_plate,
    unique_vehicle_id,
    model_id,
    color,
    year,
    fuel_efficiency,
    inspection_date,
    created_at
FROM vehicles 
WHERE license_plate = (SELECT license_plate FROM vehicles WHERE vehicle_id = @target_vehicle_id)
ORDER BY vehicle_id;

PRINT '';
PRINT '=== KIỂM TRA DUPLICATE VIN NUMBER ===';
SELECT 
    vehicle_id,
    license_plate,
    unique_vehicle_id,
    model_id,
    color,
    year,
    fuel_efficiency,
    inspection_date,
    created_at
FROM vehicles 
WHERE unique_vehicle_id = (SELECT unique_vehicle_id FROM vehicles WHERE vehicle_id = @target_vehicle_id)
ORDER BY vehicle_id;

PRINT '';
PRINT '=== KIỂM TRA XE CÓ CÙNG THÔNG TIN NHƯNG KHÁC ID ===';
SELECT 
    vehicle_id,
    license_plate,
    unique_vehicle_id,
    model_id,
    color,
    year,
    battery_capacity,
    fuel_efficiency,
    inspection_date,
    created_at
FROM vehicles 
WHERE vehicle_id != @target_vehicle_id
  AND model_id = (SELECT model_id FROM vehicles WHERE vehicle_id = @target_vehicle_id)
  AND color = (SELECT color FROM vehicles WHERE vehicle_id = @target_vehicle_id)
  AND year = (SELECT year FROM vehicles WHERE vehicle_id = @target_vehicle_id)
  AND battery_capacity = (SELECT battery_capacity FROM vehicles WHERE vehicle_id = @target_vehicle_id)
ORDER BY vehicle_id;
GO
