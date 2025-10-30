-- ============================================
-- Add cancellation tracking columns to reservations table
-- ============================================

USE EV_Rental;
GO

-- Add cancellation_reason column
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.reservations') 
    AND name = 'cancellation_reason'
)
BEGIN
    ALTER TABLE dbo.reservations
    ADD cancellation_reason NVARCHAR(500) NULL;
    PRINT 'Column cancellation_reason has been added to reservations table.';
END
ELSE
BEGIN
    PRINT 'Column cancellation_reason already exists in reservations table.';
END
GO

-- Add cancelled_by column (staff or customer)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.reservations') 
    AND name = 'cancelled_by'
)
BEGIN
    ALTER TABLE dbo.reservations
    ADD cancelled_by VARCHAR(20) NULL;
    PRINT 'Column cancelled_by has been added to reservations table.';
END
ELSE
BEGIN
    PRINT 'Column cancelled_by already exists in reservations table.';
END
GO

-- Add cancelled_at column
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.reservations') 
    AND name = 'cancelled_at'
)
BEGIN
    ALTER TABLE dbo.reservations
    ADD cancelled_at DATETIME NULL;
    PRINT 'Column cancelled_at has been added to reservations table.';
END
ELSE
BEGIN
    PRINT 'Column cancelled_at already exists in reservations table.';
END
GO

-- Verify the changes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'reservations'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Done! Cancellation tracking columns have been added to reservations table.';
GO

