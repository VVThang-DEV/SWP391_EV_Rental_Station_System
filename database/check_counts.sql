-- Check record counts in all tables
USE [EV_Rental]
GO

SELECT 'roles' AS TableName, COUNT(*) AS RecordCount FROM [dbo].[roles]
UNION ALL
SELECT 'stations', COUNT(*) FROM [dbo].[stations]
UNION ALL
SELECT 'users', COUNT(*) FROM [dbo].[users]
UNION ALL
SELECT 'vehicle_models', COUNT(*) FROM [dbo].[vehicle_models]
UNION ALL
SELECT 'vehicles', COUNT(*) FROM [dbo].[vehicles]
UNION ALL
SELECT 'reservations', COUNT(*) FROM [dbo].[reservations]
UNION ALL
SELECT 'rentals', COUNT(*) FROM [dbo].[rentals]
UNION ALL
SELECT 'payments', COUNT(*) FROM [dbo].[payments]
UNION ALL
SELECT 'user_documents', COUNT(*) FROM [dbo].[user_documents]
UNION ALL
SELECT 'battery_logs', COUNT(*) FROM [dbo].[battery_logs]
UNION ALL
SELECT 'contracts', COUNT(*) FROM [dbo].[contracts]
UNION ALL
SELECT 'handovers', COUNT(*) FROM [dbo].[handovers]
UNION ALL
SELECT 'maintenance_records', COUNT(*) FROM [dbo].[maintenance_records]
UNION ALL
SELECT 'notifications', COUNT(*) FROM [dbo].[notifications]
UNION ALL
SELECT 'otp_codes', COUNT(*) FROM [dbo].[otp_codes]
UNION ALL
SELECT 'pickup_qr_codes', COUNT(*) FROM [dbo].[pickup_qr_codes]
UNION ALL
SELECT 'reports', COUNT(*) FROM [dbo].[reports]
ORDER BY TableName
GO

