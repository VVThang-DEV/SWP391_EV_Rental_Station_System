-- ===================================================================================
-- Script to Export ALL Data from EV_Rental Database
-- This will generate INSERT statements for all tables with data
-- ===================================================================================

USE [EV_Rental]
GO

SET NOCOUNT ON
GO

PRINT '========================================================================='
PRINT 'Exporting ALL data from EV_Rental database...'
PRINT '========================================================================='
PRINT ''

-- ===================================================================================
-- ROLES
-- ===================================================================================
PRINT '-- INSERT ROLES'
SELECT 'INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (' +
    CAST(role_id AS VARCHAR(10)) + ', N''' + 
    role_name + ''', N''' + 
    ISNULL(description, 'NULL') + ''', CAST(N''' + 
    CONVERT(VARCHAR(23), created_at, 121) + ''' AS DateTime))'
FROM [dbo].[roles]
ORDER BY role_id
GO

PRINT ''
PRINT '-- INSERT STATIONS'

-- ===================================================================================
-- STATIONS
-- ===================================================================================
SELECT 'INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (' +
    CAST(station_id AS VARCHAR(10)) + ', N''' + 
    name + ''', CAST(' + 
    CAST(latitude AS VARCHAR(20)) + ' AS Decimal(9, 6)), CAST(' +
    CAST(longitude AS VARCHAR(20)) + ' AS Decimal(9, 6)), N''' +
    address + ''', N''' +
    status + ''', CAST(N''' +
    CONVERT(VARCHAR(23), created_at, 121) + ''' AS DateTime), CAST(N''' +
    CONVERT(VARCHAR(23), updated_at, 121) + ''' AS DateTime), N''' +
    ISNULL(city, 'NULL') + ''', ' +
    CAST(ISNULL(available_vehicles, 0) AS VARCHAR(10)) + ', ' +
    CAST(ISNULL(total_slots, 0) AS VARCHAR(10)) + ', N''' +
    ISNULL(amenities, 'NULL') + ''', CAST(' +
    CAST(ISNULL(rating, 0) AS VARCHAR(10)) + ' AS Decimal(3, 2)), N''' +
    ISNULL(operating_hours, 'NULL') + ''', ' +
    CAST(ISNULL(fast_charging, 0) AS VARCHAR(1)) + ', N''' +
    ISNULL(image, 'NULL') + ''')'
FROM [dbo].[stations]
ORDER BY station_id
GO

PRINT ''
PRINT '-- INSERT USERS'

-- ===================================================================================
-- USERS
-- ===================================================================================
SELECT 'INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (' +
    CAST(user_id AS VARCHAR(10)) + ', N''' + 
    email + ''', N''' + 
    password_hash + ''', ' +
    CAST(role_id AS VARCHAR(10)) + ', N''' +
    full_name + ''', N''' +
    phone + ''', ' +
    CASE WHEN cccd IS NULL THEN 'NULL' ELSE 'N''' + cccd + '''' END + ', ' +
    CASE WHEN license_number IS NULL THEN 'NULL' ELSE 'N''' + license_number + '''' END + ', ' +
    CASE WHEN address IS NULL THEN 'NULL' ELSE 'N''' + REPLACE(address, '''', '''''') + '''' END + ', ' +
    CASE WHEN position IS NULL THEN 'NULL' ELSE 'N''' + position + '''' END + ', ' +
    CAST(ISNULL(is_active, 1) AS VARCHAR(1)) + ', CAST(N''' +
    CONVERT(VARCHAR(23), created_at, 121) + ''' AS DateTime), ' +
    CASE WHEN updated_at IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(23), updated_at, 121) + ''' AS DateTime)' END + ', ' +
    CASE WHEN gender IS NULL THEN 'NULL' ELSE 'N''' + gender + '''' END + ', ' +
    CASE WHEN date_of_birth IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), date_of_birth, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN station_id IS NULL THEN 'NULL' ELSE CAST(station_id AS VARCHAR(10)) END + ', ' +
    CASE WHEN wallet_balance IS NULL THEN 'NULL' ELSE 'CAST(' + CAST(wallet_balance AS VARCHAR(20)) + ' AS Decimal(10, 2))' END + ')'
FROM [dbo].[users]
ORDER BY user_id
GO

PRINT ''
PRINT '-- INSERT VEHICLE_MODELS'

-- ===================================================================================
-- VEHICLE MODELS
-- ===================================================================================
SELECT 'INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N''' +
    model_id + ''', N''' +
    brand + ''', N''' +
    model_name + ''', N''' +
    ISNULL([type], 'NULL') + ''', ' +
    CAST(ISNULL([year], 0) AS VARCHAR(10)) + ', ' +
    CAST(ISNULL(seats, 0) AS VARCHAR(10)) + ', N''' +
    ISNULL(features, 'NULL') + ''', N''' +
    ISNULL([description], 'NULL') + ''', CAST(N''' +
    CONVERT(VARCHAR(23), created_at, 121) + ''' AS DateTime), CAST(N''' +
    CONVERT(VARCHAR(23), updated_at, 121) + ''' AS DateTime), N''' +
    ISNULL(image, 'NULL') + ''', CAST(' +
    CAST(ISNULL(price_per_hour, 0) AS VARCHAR(20)) + ' AS Decimal(10, 2)), CAST(' +
    CAST(ISNULL(price_per_day, 0) AS VARCHAR(20)) + ' AS Decimal(10, 2)), ' +
    CAST(ISNULL(max_range_km, 0) AS VARCHAR(10)) + ')'
FROM [dbo].[vehicle_models]
ORDER BY model_id
GO

PRINT ''
PRINT '-- INSERT VEHICLES'

-- ===================================================================================
-- VEHICLES - This will be large!
-- ===================================================================================
SELECT 'INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (' +
    CAST(vehicle_id AS VARCHAR(10)) + ', ' +
    CAST(station_id AS VARCHAR(10)) + ', N''' +
    model_id + ''', ' +
    CASE WHEN unique_vehicle_id IS NULL THEN 'NULL' ELSE 'N''' + unique_vehicle_id + '''' END + ', ' +
    CAST(battery_level AS VARCHAR(10)) + ', ' +
    CAST(ISNULL(max_range_km, 0) AS VARCHAR(10)) + ', N''' +
    [status] + ''', CAST(' +
    CAST(price_per_hour AS VARCHAR(20)) + ' AS Decimal(10, 2)), ' +
    CASE WHEN price_per_day IS NULL THEN 'NULL' ELSE 'CAST(' + CAST(price_per_day AS VARCHAR(20)) + ' AS Decimal(10, 2))' END + ', ' +
    CASE WHEN rating IS NULL THEN 'NULL' ELSE 'CAST(' + CAST(rating AS VARCHAR(10)) + ' AS Decimal(2, 1))' END + ', ' +
    CAST(ISNULL(review_count, 0) AS VARCHAR(10)) + ', ' +
    CAST(ISNULL(trips, 0) AS VARCHAR(10)) + ', ' +
    CAST(ISNULL(mileage, 0) AS VARCHAR(10)) + ', ' +
    CASE WHEN inspection_date IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), inspection_date, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN insurance_expiry IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), insurance_expiry, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN [condition] IS NULL THEN 'NULL' ELSE 'N''' + [condition] + '''' END + ', CAST(N''' +
    CONVERT(VARCHAR(23), created_at, 121) + ''' AS DateTime), CAST(N''' +
    CONVERT(VARCHAR(23), updated_at, 121) + ''' AS DateTime), ' +
    CASE WHEN image IS NULL THEN 'NULL' ELSE 'N''' + image + '''' END + ', ' +
    CASE WHEN license_plate IS NULL THEN 'NULL' ELSE 'N''' + license_plate + '''' END + ', ' +
    CASE WHEN fuel_efficiency IS NULL THEN 'NULL' ELSE 'N''' + fuel_efficiency + '''' END + ', ' +
    CASE WHEN [location] IS NULL THEN 'NULL' ELSE 'N''' + [location] + '''' END + ', ' +
    CASE WHEN color IS NULL THEN 'NULL' ELSE 'N''' + color + '''' END + ', ' +
    CASE WHEN [year] IS NULL THEN 'NULL' ELSE CAST([year] AS VARCHAR(10)) END + ', ' +
    CASE WHEN battery_capacity IS NULL THEN 'NULL' ELSE 'CAST(' + CAST(battery_capacity AS VARCHAR(20)) + ' AS Decimal(5, 2))' END + ', ' +
    CASE WHEN purchase_date IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), purchase_date, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN warranty_expiry IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), warranty_expiry, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN next_maintenance_date IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), next_maintenance_date, 120) + ''' AS Date)' END + ', ' +
    CASE WHEN notes IS NULL THEN 'NULL' ELSE 'N''' + REPLACE(notes, '''', '''''') + '''' END + ', ' +
    CASE WHEN last_maintenance IS NULL THEN 'NULL' ELSE 'CAST(N''' + CONVERT(VARCHAR(10), last_maintenance, 120) + ''' AS Date)' END + ')'
FROM [dbo].[vehicles]
ORDER BY vehicle_id
GO

PRINT ''
PRINT '========================================================================='
PRINT 'Export completed! Copy all INSERT statements above.'
PRINT '========================================================================='
GO

