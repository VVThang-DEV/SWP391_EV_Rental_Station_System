-- ============================================
-- Check Current Time and Reservations
-- ============================================

USE EV_Rental;
GO

PRINT '=== CURRENT TIME ===';
SELECT GETDATE() AS CurrentTime;
GO

PRINT '=== UTC TIME ===';
SELECT GETUTCDATE() AS UTCTime;
GO

PRINT '=== LAST 5 RESERVATIONS ===';
SELECT TOP 5 
    reservation_id,
    user_id,
    vehicle_id,
    station_id,
    start_time,
    end_time,
    status,
    created_at
FROM dbo.reservations
ORDER BY created_at DESC;
GO

PRINT '=== VEHICLE STATUS ===';
SELECT 
    vehicle_id,
    unique_vehicle_id,
    status,
    updated_at
FROM vehicles
WHERE vehicle_id = 1;
GO

PRINT '=== CHECK COMPLETED ===';
GO
