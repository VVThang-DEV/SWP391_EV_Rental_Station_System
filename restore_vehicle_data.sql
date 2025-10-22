-- Script để khôi phục dữ liệu last_maintenance cho các xe hiện có
USE EV_Rental;
GO

-- Kiểm tra dữ liệu hiện tại
PRINT 'Dữ liệu hiện tại của các xe:';
SELECT 
    vehicle_id, 
    license_plate, 
    model_id, 
    station_id,
    last_maintenance,
    inspection_date,
    purchase_date,
    next_maintenance_date,
    created_at
FROM vehicles 
ORDER BY vehicle_id;

-- Khôi phục dữ liệu last_maintenance dựa trên logic:
-- 1. Nếu có next_maintenance_date, thì last_maintenance = next_maintenance_date - 6 tháng
-- 2. Nếu có purchase_date, thì last_maintenance = purchase_date + 1 tháng
-- 3. Nếu không có gì, thì last_maintenance = created_at - 3 tháng

PRINT '';
PRINT 'Khôi phục dữ liệu last_maintenance...';

UPDATE vehicles 
SET last_maintenance = CASE 
    -- Nếu có next_maintenance_date, tính ngược lại 6 tháng
    WHEN next_maintenance_date IS NOT NULL 
        THEN DATEADD(MONTH, -6, next_maintenance_date)
    -- Nếu có purchase_date, thêm 1 tháng
    WHEN purchase_date IS NOT NULL 
        THEN DATEADD(MONTH, 1, purchase_date)
    -- Mặc định: created_at - 3 tháng
    ELSE DATEADD(MONTH, -3, created_at)
END
WHERE last_maintenance IS NULL;

-- Khôi phục dữ liệu inspection_date dựa trên logic:
-- inspection_date = last_maintenance + 1 tháng (kiểm định sau bảo dưỡng)

PRINT 'Khôi phục dữ liệu inspection_date...';

UPDATE vehicles 
SET inspection_date = DATEADD(MONTH, 1, last_maintenance)
WHERE inspection_date IS NULL AND last_maintenance IS NOT NULL;

-- Khôi phục một số dữ liệu mặc định khác
PRINT 'Khôi phục dữ liệu mặc định khác...';

-- Điền color mặc định
UPDATE vehicles 
SET color = CASE 
    WHEN vehicle_id % 4 = 0 THEN 'White'
    WHEN vehicle_id % 4 = 1 THEN 'Black'
    WHEN vehicle_id % 4 = 2 THEN 'Blue'
    ELSE 'Red'
END
WHERE color IS NULL;

-- Điền year mặc định (2023-2024)
UPDATE vehicles 
SET year = CASE 
    WHEN vehicle_id % 2 = 0 THEN 2023
    ELSE 2024
END
WHERE year IS NULL;

-- Điền battery_capacity mặc định dựa trên model_id
UPDATE vehicles 
SET battery_capacity = CASE 
    WHEN model_id = 'VF3' THEN 49.00
    WHEN model_id = 'VF5' THEN 65.00
    WHEN model_id = 'VF6' THEN 75.00
    WHEN model_id = 'VF7' THEN 85.00
    WHEN model_id = 'VF8' THEN 95.00
    WHEN model_id = 'VF9' THEN 105.00
    ELSE 50.00
END
WHERE battery_capacity IS NULL;

-- Điền purchase_date mặc định (created_at - 6 tháng)
UPDATE vehicles 
SET purchase_date = DATEADD(MONTH, -6, created_at)
WHERE purchase_date IS NULL;

-- Điền warranty_expiry mặc định (purchase_date + 3 năm)
UPDATE vehicles 
SET warranty_expiry = DATEADD(YEAR, 3, purchase_date)
WHERE warranty_expiry IS NULL AND purchase_date IS NOT NULL;

-- Điền next_maintenance_date mặc định (last_maintenance + 6 tháng)
UPDATE vehicles 
SET next_maintenance_date = DATEADD(MONTH, 6, last_maintenance)
WHERE next_maintenance_date IS NULL AND last_maintenance IS NOT NULL;

-- Điền fuel_efficiency mặc định dựa trên model_id
UPDATE vehicles 
SET fuel_efficiency = CASE 
    WHEN model_id = 'VF3' THEN 5.2
    WHEN model_id = 'VF5' THEN 4.8
    WHEN model_id = 'VF6' THEN 4.5
    WHEN model_id = 'VF7' THEN 4.2
    WHEN model_id = 'VF8' THEN 4.0
    WHEN model_id = 'VF9' THEN 3.8
    ELSE 5.0
END
WHERE fuel_efficiency IS NULL;

-- Điền notes mặc định
UPDATE vehicles 
SET notes = 'Vehicle restored with default maintenance data'
WHERE notes IS NULL;

PRINT '';
PRINT 'Đã khôi phục thành công dữ liệu!';

-- Kiểm tra kết quả
PRINT '';
PRINT 'Dữ liệu sau khi khôi phục:';
SELECT 
    vehicle_id, 
    license_plate, 
    model_id, 
    station_id,
    last_maintenance,
    inspection_date,
    purchase_date,
    next_maintenance_date,
    color,
    year,
    battery_capacity,
    fuel_efficiency,
    created_at
FROM vehicles 
ORDER BY vehicle_id;
GO
