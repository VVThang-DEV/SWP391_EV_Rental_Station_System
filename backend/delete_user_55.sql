-- Fix: Delete user and all related data for user_id = 55
-- This script handles the foreign key constraints properly

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. First, delete from dependent tables (child tables) that don't have further dependencies
    DELETE FROM user_documents WHERE user_id = 55;
    PRINT 'Deleted from user_documents';
    
    DELETE FROM maintenance_records WHERE staff_id = 55;
    PRINT 'Deleted from maintenance_records';
    
    DELETE FROM handovers WHERE staff_id = 55;
    PRINT 'Deleted from handovers';
    
    -- 2. Delete payments for this user BEFORE deleting reservations
    -- Because payments have FK reference to reservations
    DELETE FROM payments WHERE reservation_id IN (
        SELECT reservation_id FROM reservations WHERE user_id = 55
    ) OR user_id = 55;
    PRINT 'Deleted from payments';
    
    -- 3. Delete rentals that belong to this user
    DELETE FROM rentals WHERE user_id = 55;
    PRINT 'Deleted from rentals';
    
    -- 4. Now delete reservations (after payments are deleted)
    DELETE FROM reservations WHERE user_id = 55;
    PRINT 'Deleted from reservations';
    
    -- 5. Finally, delete the user
    DELETE FROM users WHERE user_id = 55;
    PRINT 'Deleted user 55 successfully';
    
    COMMIT TRANSACTION;
    PRINT 'Transaction completed successfully.';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error occurred. Transaction rolled back.';
    PRINT ERROR_MESSAGE();
END CATCH;

