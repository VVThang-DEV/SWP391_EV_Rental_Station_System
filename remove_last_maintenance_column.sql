-- Script để xóa cột last_maintenance khỏi bảng vehicles
USE EV_Rental;
GO

-- Kiểm tra cột hiện tại
PRINT 'Các cột hiện tại trong bảng vehicles:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'vehicles' 
  AND COLUMN_NAME IN ('last_maintenance', 'inspection_date')
ORDER BY ORDINAL_POSITION;

-- Xóa cột last_maintenance
PRINT '';
PRINT 'Xóa cột last_maintenance...';
ALTER TABLE vehicles DROP COLUMN last_maintenance;

PRINT 'Đã xóa cột last_maintenance thành công!';

-- Kiểm tra lại
PRINT '';
PRINT 'Các cột sau khi xóa:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'vehicles' 
  AND COLUMN_NAME IN ('last_maintenance', 'inspection_date')
ORDER BY ORDINAL_POSITION;
GO
