-- ============================================
-- Script to remove columns from reservations table
-- Removes: updated_at and booking_channel
-- ============================================

USE EV_Rental;
GO

-- Drop the updated_at column
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.reservations') 
    AND name = 'updated_at'
)
BEGIN
    ALTER TABLE dbo.reservations
    DROP COLUMN updated_at;
    PRINT 'Column updated_at has been removed from reservations table.';
END
ELSE
BEGIN
    PRINT 'Column updated_at does not exist in reservations table.';
END
GO

-- Drop the booking_channel column
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.reservations') 
    AND name = 'booking_channel'
)
BEGIN
    ALTER TABLE dbo.reservations
    DROP COLUMN booking_channel;
    PRINT 'Column booking_channel has been removed from reservations table.';
END
ELSE
BEGIN
    PRINT 'Column booking_channel does not exist in reservations table.';
END
GO

-- Verify the changes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'reservations'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Done! Columns updated_at and booking_channel have been removed from reservations table.';
GO

