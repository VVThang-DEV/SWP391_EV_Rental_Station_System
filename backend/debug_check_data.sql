-- ============================================
-- Debug script to check if data is being saved
-- ============================================

USE EV_Rental;
GO

-- 1. Check if reservations table exists
SELECT 
    TABLE_NAME, 
    TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'reservations';
GO

-- 2. Check if vehicles table exists
SELECT 
    TABLE_NAME, 
    TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'vehicles';
GO

-- 3. Check if payments table exists
SELECT 
    TABLE_NAME, 
    TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'payments';
GO

-- 4. Check all reservations
SELECT TOP 10 * FROM reservations ORDER BY created_at DESC;
GO

-- 5. Check all payments
SELECT TOP 10 * FROM payments ORDER BY created_at DESC;
GO

-- 6. Check all vehicles
SELECT vehicle_id, status, updated_at FROM vehicles ORDER BY vehicle_id;
GO

-- 7. Check for any recent activity
SELECT 
    'Reservations' as TableName,
    COUNT(*) as RecordCount,
    MAX(created_at) as LastRecord
FROM reservations
UNION ALL
SELECT 
    'Payments' as TableName,
    COUNT(*) as RecordCount,
    MAX(created_at) as LastRecord
FROM payments
UNION ALL
SELECT 
    'Vehicles' as TableName,
    COUNT(*) as RecordCount,
    MAX(updated_at) as LastRecord
FROM vehicles;
GO

PRINT 'Debug completed!';
GO

