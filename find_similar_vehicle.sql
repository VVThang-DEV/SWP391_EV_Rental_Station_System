-- Script để tìm xe tương tự với vehicle_id = 71 và có fuel_efficiency, inspection_date không NULL
USE EV_Rental;
GO

-- Lấy thông tin xe ở dòng 71
DECLARE @target_vehicle_id INT = 71;
DECLARE @target_model_id VARCHAR(10);
DECLARE @target_color VARCHAR(50);
DECLARE @target_year INT;
DECLARE @target_battery_capacity DECIMAL(5,2);

-- Lấy thông tin xe target
SELECT 
    @target_model_id = model_id,
    @target_color = color,
    @target_year = year,
    @target_battery_capacity = battery_capacity
FROM vehicles 
WHERE vehicle_id = @target_vehicle_id;

PRINT 'Thông tin xe target (ID: ' + CAST(@target_vehicle_id AS VARCHAR) + '):';
PRINT 'Model: ' + ISNULL(@target_model_id, 'NULL');
PRINT 'Color: ' + ISNULL(@target_color, 'NULL');
PRINT 'Year: ' + ISNULL(CAST(@target_year AS VARCHAR), 'NULL');
PRINT 'Battery Capacity: ' + ISNULL(CAST(@target_battery_capacity AS VARCHAR), 'NULL');
PRINT '';

-- Tìm xe tương tự có fuel_efficiency và inspection_date không NULL
PRINT 'Tìm xe tương tự có fuel_efficiency và inspection_date không NULL:';
SELECT 
    vehicle_id,
    model_id,
    color,
    year,
    battery_capacity,
    fuel_efficiency,
    inspection_date,
    license_plate,
    created_at
FROM vehicles 
WHERE vehicle_id != @target_vehicle_id
  AND model_id = @target_model_id
  AND color = @target_color
  AND year = @target_year
  AND battery_capacity = @target_battery_capacity
  AND fuel_efficiency IS NOT NULL
  AND inspection_date IS NOT NULL
ORDER BY created_at DESC;

-- Nếu không tìm thấy xe tương tự hoàn toàn, tìm xe cùng model
PRINT '';
PRINT 'Nếu không có xe tương tự hoàn toàn, tìm xe cùng model:';
SELECT 
    vehicle_id,
    model_id,
    color,
    year,
    battery_capacity,
    fuel_efficiency,
    inspection_date,
    license_plate,
    created_at
FROM vehicles 
WHERE vehicle_id != @target_vehicle_id
  AND model_id = @target_model_id
  AND fuel_efficiency IS NOT NULL
  AND inspection_date IS NOT NULL
ORDER BY created_at DESC;
GO
