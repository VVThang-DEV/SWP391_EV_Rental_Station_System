-- Migration script for pickup_qr_codes table
-- This script drops and recreates the table to store JSON QR code data

USE [EV_Rental];
GO

PRINT '========================================';
PRINT 'Starting pickup_qr_codes table migration';
PRINT '========================================';
GO

-- Step 1: Check if table exists and drop it
IF OBJECT_ID('dbo.pickup_qr_codes', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing pickup_qr_codes table...';
    
    -- Drop foreign key constraints first
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_qr_rental')
    BEGIN
        ALTER TABLE dbo.pickup_qr_codes DROP CONSTRAINT fk_qr_rental;
        PRINT '  - Dropped foreign key constraint: fk_qr_rental';
    END
    
    DROP TABLE dbo.pickup_qr_codes;
    PRINT '  - Table dropped successfully';
END
ELSE
BEGIN
    PRINT 'pickup_qr_codes table does not exist, will create new';
END
GO

-- Step 2: Create the new table with JSON support
PRINT 'Creating new pickup_qr_codes table...';
GO

CREATE TABLE dbo.pickup_qr_codes (
    qr_id INT IDENTITY(1,1) PRIMARY KEY,
    rental_id INT NOT NULL,
    code NVARCHAR(MAX) NOT NULL, -- Changed to NVARCHAR(MAX) to store JSON data
    status VARCHAR(20) DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_qr_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id) ON DELETE CASCADE,
    
    -- Add check constraint for status
    CONSTRAINT ck_qr_status CHECK (status IN ('active', 'used', 'expired'))
);
GO

PRINT '  - Table created successfully';
GO

-- Step 3: Create indexes for better performance
PRINT 'Creating indexes...';
GO

-- Index on rental_id for faster lookups
CREATE NONCLUSTERED INDEX IX_pickup_qr_codes_rental_id 
ON dbo.pickup_qr_codes(rental_id);
PRINT '  - Created index: IX_pickup_qr_codes_rental_id';
GO

-- Index on status for filtering active QR codes
CREATE NONCLUSTERED INDEX IX_pickup_qr_codes_status 
ON dbo.pickup_qr_codes(status);
PRINT '  - Created index: IX_pickup_qr_codes_status';
GO

-- Index on expires_at for cleanup queries
CREATE NONCLUSTERED INDEX IX_pickup_qr_codes_expires_at 
ON dbo.pickup_qr_codes(expires_at);
PRINT '  - Created index: IX_pickup_qr_codes_expires_at';
GO

-- Step 4: Add helpful comments
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Stores QR codes for vehicle pickup verification. The code column contains JSON data with reservation details.', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'pickup_qr_codes';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'JSON string containing reservation data: {reservationId, vehicleId, stationId, userId, startTime, endTime, status, accessCode, timestamp}', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'pickup_qr_codes',
    @level2type = N'COLUMN', @level2name = N'code';
GO

PRINT '  - Added table and column descriptions';
GO

-- Step 5: Verify table structure
PRINT 'Verifying table structure...';
GO

SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    ISNULL(dc.definition, '') AS DefaultValue
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE c.object_id = OBJECT_ID('dbo.pickup_qr_codes')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '========================================';
PRINT 'Migration completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Table Structure:';
PRINT '  - qr_id: INT IDENTITY (Primary Key)';
PRINT '  - rental_id: INT (Foreign Key to rentals)';
PRINT '  - code: NVARCHAR(MAX) - Stores JSON data';
PRINT '  - status: VARCHAR(20) - active/used/expired';
PRINT '  - expires_at: DATETIME';
PRINT '  - used_at: DATETIME (nullable)';
PRINT '  - created_at: DATETIME';
PRINT '';
PRINT 'JSON Format Example:';
PRINT '{';
PRINT '  "reservationId": 64,';
PRINT '  "vehicleId": 37,';
PRINT '  "stationId": 1,';
PRINT '  "userId": 74,';
PRINT '  "startTime": "2025-11-04T14:30:00",';
PRINT '  "endTime": "2025-11-05T14:00:00",';
PRINT '  "status": "pending",';
PRINT '  "accessCode": "ACCESS_64_1762239910321",';
PRINT '  "timestamp": "2025-11-04T07:05:10.321Z"';
PRINT '}';
PRINT '';
GO
