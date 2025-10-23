-- ============================================
-- Check Vehicle Data for Booking
-- ============================================

USE EV_Rental;
GO

PRINT '=== VEHICLE DATA CHECK ===';

-- Check vehicles table structure
PRINT '--- Vehicle Table Structure ---';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'vehicles'
ORDER BY ORDINAL_POSITION;
GO

-- Check all vehicles with their IDs
PRINT '--- All Vehicles ---';
SELECT 
    vehicle_id,
    unique_vehicle_id,
    model_id,
    station_id,
    status,
    price_per_hour,
    price_per_day,
    created_at
FROM vehicles 
ORDER BY vehicle_id;
GO

-- Check available vehicles
PRINT '--- Available Vehicles ---';
SELECT 
    vehicle_id,
    unique_vehicle_id,
    model_id,
    station_id,
    status
FROM vehicles 
WHERE status = 'available'
ORDER BY vehicle_id;
GO

-- Check if there are any vehicles with unique_vehicle_id like 'VF3-ST1-001'
PRINT '--- Vehicles with VF3 pattern ---';
SELECT 
    vehicle_id,
    unique_vehicle_id,
    model_id,
    station_id,
    status
FROM vehicles 
WHERE unique_vehicle_id LIKE 'VF3%'
ORDER BY vehicle_id;
GO

-- Check stations
PRINT '--- Stations ---';
SELECT 
    station_id,
    name,
    address,
    status
FROM stations 
ORDER BY station_id;
GO

-- Check users
PRINT '--- Users ---';
SELECT 
    user_id,
    email,
    full_name,
    role_id,
    is_active
FROM users 
ORDER BY user_id;
GO

PRINT '=== CHECK COMPLETED ===';
GO
