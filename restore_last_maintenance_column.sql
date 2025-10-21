-- Script để thêm lại cột last_maintenance vào bảng vehicles
USE EV_Rental;
GO

-- Kiểm tra cột hiện tại
PRINT 'Các cột hiện tại trong bảng vehicles:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'vehicles' 
  AND COLUMN_NAME IN ('last_maintenance', 'inspection_date')
ORDER BY ORDINAL_POSITION;

-- Thêm lại cột last_maintenance
PRINT '';
PRINT 'Thêm lại cột last_maintenance...';
ALTER TABLE vehicles ADD last_maintenance DATE NULL;

PRINT 'Đã thêm lại cột last_maintenance thành công!';

-- Kiểm tra lại
PRINT '';
PRINT 'Các cột sau khi thêm lại:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'vehicles' 
  AND COLUMN_NAME IN ('last_maintenance', 'inspection_date')
ORDER BY ORDINAL_POSITION;
GO
