-- Fix: Delete user and all related data for user_id = 47
-- This script handles the foreign key constraints properly

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. First, delete from dependent tables (child tables) that don't have further dependencies
    DELETE FROM user_documents WHERE user_id = 47;
    PRINT 'Deleted from user_documents';
    
    DELETE FROM maintenance_records WHERE staff_id = 47;
    PRINT 'Deleted from maintenance_records';
    
    DELETE FROM handovers WHERE staff_id = 47;
    PRINT 'Deleted from handovers';
    
    -- 2. Delete reservations that belong to this user
    -- This must come BEFORE deleting payments because payments reference reservations
    DELETE FROM reservations WHERE user_id = 47;
    PRINT 'Deleted from reservations';
    
    -- 3. Delete payments that belong to this user
    -- This comes after reservations because payments might reference reservations
    DELETE FROM payments WHERE reservation_id IN (
        SELECT reservation_id FROM reservations WHERE user_id = 47
    ) OR user_id = 47;
    PRINT 'Deleted from payments';
    
    -- 4. Delete rentals that belong to this user
    DELETE FROM rentals WHERE user_id = 47;
    PRINT 'Deleted from rentals';
    
    -- 5. Finally, delete the user
    DELETE FROM users WHERE user_id = 47;
    PRINT 'Deleted user 47 successfully';
    
    COMMIT TRANSACTION;
    PRINT 'Transaction completed successfully.';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error occurred. Transaction rolled back.';
    PRINT ERROR_MESSAGE();
END CATCH;

