-- Delete user and all related data for user_id = 47
-- WARNING: This will permanently delete all data related to this user

BEGIN TRANSACTION;

-- First, delete from dependent tables (child tables)
DELETE FROM user_documents WHERE user_id = 47;
DELETE FROM handovers WHERE staff_id = 47 OR EXISTS (SELECT 1 FROM rentals WHERE rentals.rental_id = handovers.rental_id AND rentals.user_id = 47);
DELETE FROM rentals WHERE user_id = 47;
DELETE FROM reservations WHERE user_id = 47;
DELETE FROM payments WHERE user_id = 47;
DELETE FROM maintenance_records WHERE staff_id = 47;

-- Then delete the user
DELETE FROM users WHERE user_id = 47;

-- Check if user was deleted
IF @@ROWCOUNT > 0
    PRINT 'User 47 has been successfully deleted along with all related data.';
ELSE
    PRINT 'No user with ID 47 found or deletion failed.';

COMMIT TRANSACTION;

