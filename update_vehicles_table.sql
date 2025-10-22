-- Script để cập nhật bảng vehicles với các trường mới từ form admin
-- Thêm các cột còn thiếu vào bảng vehicles

USE EV_Rental;
GO

-- Thêm các cột mới vào bảng vehicles
ALTER TABLE vehicles 
ADD 
    color NVARCHAR(50) NULL,                    -- Màu xe
    year INT NULL,                              -- Năm sản xuất
    battery_capacity DECIMAL(5,2) NULL,         -- Dung lượng pin (kWh)
    purchase_date DATE NULL,                    -- Ngày mua
    warranty_expiry DATE NULL,                  -- Ngày hết bảo hành
    next_maintenance_date DATE NULL,            -- Ngày bảo dưỡng tiếp theo
    notes NVARCHAR(MAX) NULL;                  -- Ghi chú

-- Thêm comment cho các cột mới
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Màu sắc của xe', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'color';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Năm sản xuất của xe', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'year';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Dung lượng pin của xe (kWh)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'battery_capacity';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Ngày mua xe', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'purchase_date';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Ngày hết bảo hành', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'warranty_expiry';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Ngày bảo dưỡng tiếp theo', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'next_maintenance_date';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Ghi chú về xe', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'vehicles', 
    @level2type = N'COLUMN', @level2name = N'notes';

PRINT 'Đã thêm thành công các cột mới vào bảng vehicles:';
PRINT '- color (NVARCHAR(50))';
PRINT '- year (INT)';
PRINT '- battery_capacity (DECIMAL(5,2))';
PRINT '- purchase_date (DATE)';
PRINT '- warranty_expiry (DATE)';
PRINT '- next_maintenance_date (DATE)';
PRINT '- notes (NVARCHAR(MAX))';
GO
