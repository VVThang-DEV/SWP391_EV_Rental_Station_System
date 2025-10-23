-- ============================================
-- Reset Vehicle Status Script
-- ============================================

USE EV_Rental;
GO

PRINT '=== BEFORE RESET ===';
SELECT vehicle_id, status FROM vehicles ORDER BY vehicle_id;
GO

-- Reset all vehicles to available
UPDATE vehicles 
SET status = 'available', updated_at = GETDATE()
WHERE status IN ('pending', 'rented', 'maintenance');

PRINT '=== AFTER RESET ===';
SELECT vehicle_id, status FROM vehicles ORDER BY vehicle_id;
GO

PRINT '=== RESET COMPLETED ===';
PRINT 'All vehicles have been set to available status';
GO
