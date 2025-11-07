-- Quick check if reservation_id column exists in pickup_qr_codes table
USE [ev_rental_system];
GO

-- Check column existence
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'pickup_qr_codes'
ORDER BY ORDINAL_POSITION;

-- Check existing QR codes
SELECT COUNT(*) AS QRCodeCount FROM pickup_qr_codes;

-- Check if we have any QR codes with reservation_id
SELECT * FROM pickup_qr_codes WHERE reservation_id IS NOT NULL;
