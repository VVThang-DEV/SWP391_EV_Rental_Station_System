-- ============================================
-- Check Rented Vehicle and Its Reservations
-- ============================================

USE EV_Rental;
GO

PRINT '=== CHECK VEHICLE VN1VF3001A0001002 ===';

-- 1. Check vehicle information
SELECT 
    vehicle_id,
    unique_vehicle_id,
    model_id,
    status,
    station_id,
    updated_at
FROM vehicles
WHERE unique_vehicle_id = 'VN1VF3001A0001002';
GO

-- 2. Get vehicle_id for this unique_vehicle_id
DECLARE @VehicleId INT;
SELECT @VehicleId = vehicle_id 
FROM vehicles 
WHERE unique_vehicle_id = 'VN1VF3001A0001002';

PRINT '=== RESERVATIONS FOR THIS VEHICLE ===';
SELECT 
    r.reservation_id,
    r.user_id,
    u.full_name as customer_name,
    u.email,
    u.phone,
    r.vehicle_id,
    r.station_id,
    s.name as station_name,
    r.start_time,
    r.end_time,
    r.status,
    r.created_at,
    r.cancellation_reason,
    r.cancelled_by,
    r.cancelled_at
FROM reservations r
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN stations s ON r.station_id = s.station_id
WHERE r.vehicle_id = @VehicleId
ORDER BY r.created_at DESC;
GO

PRINT '=== ALL RESERVATIONS AT AIRPORT STATION ===';
SELECT 
    r.reservation_id,
    r.user_id,
    u.full_name as customer_name,
    r.vehicle_id,
    v.unique_vehicle_id,
    v.model_id,
    r.status,
    r.created_at
FROM reservations r
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
LEFT JOIN stations s ON r.station_id = s.station_id
WHERE s.name = 'Airport Station'
ORDER BY r.created_at DESC;
GO

PRINT '=== CHECK COMPLETED ===';
GO

