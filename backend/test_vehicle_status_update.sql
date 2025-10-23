-- ============================================
-- Script to test vehicle status update on reservation
-- Shows vehicle status changes
-- ============================================

USE EV_Rental;
GO

-- View vehicles with their current status
SELECT 
    vehicle_id,
    model_id,
    station_id,
    status,
    battery_level,
    updated_at
FROM dbo.vehicles
ORDER BY vehicle_id;
GO

-- View reservations with vehicle status
SELECT 
    r.reservation_id,
    r.user_id,
    r.vehicle_id,
    v.status AS vehicle_status,
    r.start_time,
    r.end_time,
    r.status AS reservation_status,
    r.created_at
FROM dbo.reservations r
LEFT JOIN dbo.vehicles v ON r.vehicle_id = v.vehicle_id
ORDER BY r.created_at DESC;
GO

-- Test: Check specific vehicle status before and after booking
-- Example: Check vehicle_id = 1
SELECT 
    vehicle_id,
    status,
    updated_at
FROM dbo.vehicles
WHERE vehicle_id = 1;
GO

PRINT 'Test completed! Check the results above to verify vehicle status changes.';
GO

PRINT '';
PRINT 'Expected behavior:';
PRINT '1. When booking: vehicle status changes from "available" to "pending"';
PRINT '2. When cancelling: vehicle status changes from "pending" back to "available"';
PRINT '3. Check updated_at column to see when status was last updated';
GO

