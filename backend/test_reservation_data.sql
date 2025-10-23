-- ============================================
-- Script to test and verify reservation data
-- Shows start_time and end_time saved in database
-- ============================================

USE EV_Rental;
GO

-- View all reservations with detailed information
SELECT 
    reservation_id,
    user_id,
    vehicle_id,
    station_id,
    start_time,
    end_time,
    status,
    created_at,
    -- Calculate duration in hours
    DATEDIFF(HOUR, start_time, end_time) AS duration_hours,
    -- Calculate duration in days
    DATEDIFF(DAY, start_time, end_time) AS duration_days
FROM dbo.reservations
ORDER BY created_at DESC;
GO

-- View most recent reservation
SELECT TOP 1
    reservation_id AS 'Reservation ID',
    user_id AS 'User ID',
    vehicle_id AS 'Vehicle ID',
    station_id AS 'Station ID',
    FORMAT(start_time, 'yyyy-MM-dd HH:mm:ss') AS 'Start Time',
    FORMAT(end_time, 'yyyy-MM-dd HH:mm:ss') AS 'End Time',
    status AS 'Status',
    FORMAT(created_at, 'yyyy-MM-dd HH:mm:ss') AS 'Created At'
FROM dbo.reservations
ORDER BY created_at DESC;
GO

PRINT 'Test completed! Check the results above to verify start_time and end_time are being saved correctly.';
GO

