-- ============================================
-- Script to check user and vehicle data
-- ============================================

USE EV_Rental;
GO

-- Check users
SELECT user_id, email, full_name, role_id FROM users ORDER BY user_id;
GO

-- Check vehicles
SELECT vehicle_id, model_id, station_id, status FROM vehicles ORDER BY vehicle_id;
GO

-- Check available vehicles
SELECT vehicle_id, model_id, station_id, status 
FROM vehicles 
WHERE status = 'available'
ORDER BY vehicle_id;
GO

-- Show role information
SELECT role_id, role_name FROM roles;
GO

PRINT 'Check completed!';
GO

