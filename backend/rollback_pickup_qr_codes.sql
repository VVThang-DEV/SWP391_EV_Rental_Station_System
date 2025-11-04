-- Rollback script for pickup_qr_codes table
-- This script reverts the table to the original schema (VARCHAR(128) for code)

USE [EV_Rental];
GO

PRINT '========================================';
PRINT 'Starting pickup_qr_codes rollback';
PRINT '========================================';
GO

-- Step 1: Backup data if table exists
IF OBJECT_ID('dbo.pickup_qr_codes', 'U') IS NOT NULL
BEGIN
    PRINT 'Backing up existing data...';
    
    SELECT * 
    INTO dbo.pickup_qr_codes_backup
    FROM dbo.pickup_qr_codes;
    
    DECLARE @rowCount INT = @@ROWCOUNT;
    PRINT '  - Backed up ' + CAST(@rowCount AS VARCHAR(10)) + ' rows to pickup_qr_codes_backup';
END
GO

-- Step 2: Drop the current table
IF OBJECT_ID('dbo.pickup_qr_codes', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping current pickup_qr_codes table...';
    
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_qr_rental')
    BEGIN
        ALTER TABLE dbo.pickup_qr_codes DROP CONSTRAINT fk_qr_rental;
    END
    
    DROP TABLE dbo.pickup_qr_codes;
    PRINT '  - Table dropped successfully';
END
GO

-- Step 3: Recreate original table structure
PRINT 'Recreating original pickup_qr_codes table...';
GO

CREATE TABLE dbo.pickup_qr_codes (
    qr_id INT IDENTITY(1,1) PRIMARY KEY,
    rental_id INT NOT NULL,
    code VARCHAR(128) NOT NULL UNIQUE, -- Original schema: VARCHAR(128) UNIQUE
    status VARCHAR(20) DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT fk_qr_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
    CONSTRAINT ck_qr_status CHECK (status IN ('active', 'used', 'expired'))
);
GO

PRINT '  - Original table structure restored';
GO

-- Step 4: Restore data if backup exists
IF OBJECT_ID('dbo.pickup_qr_codes_backup', 'U') IS NOT NULL
BEGIN
    PRINT 'Attempting to restore data from backup...';
    PRINT 'WARNING: Data restoration may fail if backup contains JSON that exceeds VARCHAR(128)';
    
    BEGIN TRY
        SET IDENTITY_INSERT dbo.pickup_qr_codes ON;
        
        INSERT INTO dbo.pickup_qr_codes (qr_id, rental_id, code, status, expires_at, used_at, created_at)
        SELECT 
            qr_id, 
            rental_id, 
            LEFT(code, 128) AS code, -- Truncate to 128 chars if needed
            status, 
            expires_at, 
            used_at, 
            created_at
        FROM dbo.pickup_qr_codes_backup;
        
        SET IDENTITY_INSERT dbo.pickup_qr_codes OFF;
        
        DECLARE @restoredCount INT = @@ROWCOUNT;
        PRINT '  - Restored ' + CAST(@restoredCount AS VARCHAR(10)) + ' rows';
        
        -- Drop backup table
        DROP TABLE dbo.pickup_qr_codes_backup;
        PRINT '  - Backup table removed';
    END TRY
    BEGIN CATCH
        PRINT 'ERROR: Failed to restore data - ' + ERROR_MESSAGE();
        PRINT 'Backup table (pickup_qr_codes_backup) has been preserved for manual recovery';
    END CATCH
END
GO

-- Step 5: Verify table structure
PRINT 'Verifying table structure...';
GO

SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.pickup_qr_codes')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '========================================';
PRINT 'Rollback completed!';
PRINT '========================================';
PRINT '';
PRINT 'Original Table Structure Restored:';
PRINT '  - qr_id: INT IDENTITY (Primary Key)';
PRINT '  - rental_id: INT (Foreign Key)';
PRINT '  - code: VARCHAR(128) UNIQUE';
PRINT '  - status: VARCHAR(20)';
PRINT '  - expires_at: DATETIME';
PRINT '  - used_at: DATETIME';
PRINT '  - created_at: DATETIME';
PRINT '';
GO
