-- ============================================
-- Reset Booking System Script for SSMS
-- This script deletes all reservations and resets vehicle status to 'available'
-- ============================================

USE EV_Rental;
GO

-- Check current state
PRINT '=== Current State ===';
SELECT COUNT(*) AS total_reservations FROM reservations;
SELECT COUNT(*) AS pending_vehicles FROM vehicles WHERE status = 'pending';
SELECT COUNT(*) AS available_vehicles FROM vehicles WHERE status = 'available';
GO

-- Delete all reservations
PRINT '=== Deleting all reservations ===';
DELETE FROM reservations;
GO

-- Reset vehicle status to 'available'
PRINT '=== Resetting vehicle status to available ===';
UPDATE vehicles 
SET status = 'available', updated_at = GETDATE() 
WHERE status = 'pending';
GO

-- Verify results
PRINT '=== Final State ===';
SELECT COUNT(*) AS total_reservations FROM reservations;
SELECT COUNT(*) AS available_vehicles FROM vehicles WHERE status = 'available';
GO

PRINT '=== Reset Complete ===';
PRINT 'System is ready for new bookings!';
GO
