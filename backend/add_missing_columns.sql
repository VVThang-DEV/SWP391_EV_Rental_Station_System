-- Thêm các cột thiếu vào bảng users
USE EV_Rental;
GO

-- Thêm cột gender
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'gender')
BEGIN
    ALTER TABLE dbo.users ADD gender VARCHAR(10) NULL;
    PRINT 'Added gender column to users table';
END
ELSE
BEGIN
    PRINT 'gender column already exists in users table';
END

-- Thêm cột date_of_birth
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'date_of_birth')
BEGIN
    ALTER TABLE dbo.users ADD date_of_birth DATE NULL;
    PRINT 'Added date_of_birth column to users table';
END
ELSE
BEGIN
    PRINT 'date_of_birth column already exists in users table';
END

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('gender', 'date_of_birth', 'cccd', 'license_number', 'address', 'phone')
ORDER BY COLUMN_NAME;
