-- Migration: Add reservation_id to pickup_qr_codes table
-- This allows QR codes to be created at reservation time (not just at rental time)

USE [ev_rental_system];
GO

-- Step 1: Check if reservation_id column already exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[pickup_qr_codes]') AND name = 'reservation_id')
BEGIN
    PRINT 'Adding reservation_id column to pickup_qr_codes table...';
    
    -- Add reservation_id column (nullable for backward compatibility)
    ALTER TABLE [dbo].[pickup_qr_codes]
    ADD [reservation_id] INT NULL;
    
    -- Add foreign key constraint to reservations table
    ALTER TABLE [dbo].[pickup_qr_codes]
    ADD CONSTRAINT FK_pickup_qr_codes_reservations
    FOREIGN KEY ([reservation_id]) REFERENCES [dbo].[reservations]([reservation_id]);
    
    PRINT 'reservation_id column added successfully!';
END
ELSE
BEGIN
    PRINT 'reservation_id column already exists in pickup_qr_codes table.';
END
GO

-- Step 2: Make rental_id nullable (if not already) since QR codes can be created for reservations before rental
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[pickup_qr_codes]') 
    AND name = 'rental_id' 
    AND is_nullable = 0
)
BEGIN
    PRINT 'Making rental_id nullable...';
    
    -- Drop existing foreign key constraint if exists
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pickup_qr_codes_rentals')
    BEGIN
        ALTER TABLE [dbo].[pickup_qr_codes]
        DROP CONSTRAINT FK_pickup_qr_codes_rentals;
    END
    
    -- Alter column to be nullable
    ALTER TABLE [dbo].[pickup_qr_codes]
    ALTER COLUMN [rental_id] INT NULL;
    
    -- Re-add foreign key constraint
    ALTER TABLE [dbo].[pickup_qr_codes]
    ADD CONSTRAINT FK_pickup_qr_codes_rentals
    FOREIGN KEY ([rental_id]) REFERENCES [dbo].[rentals]([rental_id]);
    
    PRINT 'rental_id is now nullable!';
END
ELSE
BEGIN
    PRINT 'rental_id is already nullable.';
END
GO

-- Step 3: Add index on reservation_id for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_pickup_qr_codes_reservation_id' AND object_id = OBJECT_ID('pickup_qr_codes'))
BEGIN
    CREATE INDEX IX_pickup_qr_codes_reservation_id ON [dbo].[pickup_qr_codes]([reservation_id]);
    PRINT 'Index on reservation_id created successfully!';
END
ELSE
BEGIN
    PRINT 'Index on reservation_id already exists.';
END
GO

PRINT 'Migration completed successfully!';
PRINT 'QR codes can now be linked to both reservations and rentals.';
GO
