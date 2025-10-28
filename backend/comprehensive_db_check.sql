-- ============================================
-- Comprehensive Database Check Script
-- ============================================

USE EV_Rental;
GO

PRINT '=== DATABASE CONNECTION TEST ===';
PRINT 'Database: ' + DB_NAME();
PRINT 'Server: ' + @@SERVERNAME;
PRINT 'User: ' + USER_NAME();
GO

PRINT '=== CHECKING TABLES EXISTENCE ===';
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('users', 'vehicles', 'stations', 'reservations', 'payments', 'roles')
ORDER BY TABLE_NAME;
GO

PRINT '=== CHECKING USERS ===';
SELECT 
    user_id, 
    email, 
    full_name, 
    role_id,
    is_active,
    created_at
FROM users 
ORDER BY user_id;
GO

PRINT '=== CHECKING ROLES ===';
SELECT role_id, role_name FROM roles ORDER BY role_id;
GO

PRINT '=== CHECKING STATIONS ===';
SELECT 
    station_id, 
    name, 
    address, 
    status,
    created_at
FROM stations 
ORDER BY station_id;
GO

PRINT '=== CHECKING VEHICLES ===';
SELECT 
    vehicle_id, 
    model_id, 
    station_id, 
    unique_vehicle_id,
    status,
    price_per_hour,
    price_per_day,
    created_at
FROM vehicles 
ORDER BY vehicle_id;
GO

PRINT '=== CHECKING AVAILABLE VEHICLES ===';
SELECT 
    vehicle_id, 
    model_id, 
    station_id, 
    unique_vehicle_id,
    status
FROM vehicles 
WHERE status = 'available'
ORDER BY vehicle_id;
GO

PRINT '=== CHECKING RESERVATIONS ===';
SELECT 
    reservation_id,
    user_id,
    vehicle_id,
    station_id,
    start_time,
    end_time,
    status,
    created_at
FROM reservations 
ORDER BY created_at DESC;
GO

PRINT '=== CHECKING PAYMENTS ===';
SELECT 
    payment_id,
    reservation_id,
    rental_id,
    method_type,
    amount,
    status,
    transaction_id,
    created_at
FROM payments 
ORDER BY created_at DESC;
GO

PRINT '=== SUMMARY ===';
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'stations', COUNT(*) FROM stations
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'roles', COUNT(*) FROM roles;
GO

PRINT '=== CHECK COMPLETED ===';
GO
