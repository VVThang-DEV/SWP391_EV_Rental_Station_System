# PowerShell script to generate full SQL script with ALL data from EV_Rental database
# This will create a complete INSERT script for all tables

$ServerInstance = "localhost"
$Database = "EV_Rental"
$OutputFile = "EV_Rental_Full_Data_Complete.sql"

Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "Generating complete SQL script with ALL data..." -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host ""

# Function to escape single quotes in strings
function Escape-SingleQuotes {
    param([string]$text)
    if ($text) {
        return $text.Replace("'", "''")
    }
    return $text
}

# Create output file with header
$header = @"
-- ===================================================================================
-- Complete EV_Rental Database Script with ALL DATA
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- ===================================================================================

USE [EV_Rental]
GO

-- Disable constraints temporarily for bulk insert
EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO

"@

$header | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "Exporting ROLES..." -ForegroundColor Yellow

# Export ROLES
$sql = @"
SET IDENTITY_INSERT [dbo].[roles] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$rolesQuery = "SELECT * FROM [dbo].[roles] ORDER BY role_id"
$roles = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $rolesQuery

foreach ($row in $roles) {
    $desc = if ($row.description) { "N'$(Escape-SingleQuotes $row.description)'" } else { "NULL" }
    $sql = "INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES ($($row.role_id), N'$($row.role_name)', $desc, CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime))"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[roles] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($roles.Count) roles" -ForegroundColor Green

Write-Host "Exporting STATIONS..." -ForegroundColor Yellow

# Export STATIONS
$sql = @"
SET IDENTITY_INSERT [dbo].[stations] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$stationsQuery = "SELECT * FROM [dbo].[stations] ORDER BY station_id"
$stations = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $stationsQuery

foreach ($row in $stations) {
    $city = if ($row.city) { "N'$(Escape-SingleQuotes $row.city)'" } else { "NULL" }
    $amenities = if ($row.amenities) { "N'$(Escape-SingleQuotes $row.amenities)'" } else { "NULL" }
    $opHours = if ($row.operating_hours) { "N'$(Escape-SingleQuotes $row.operating_hours)'" } else { "NULL" }
    $image = if ($row.image) { "N'$(Escape-SingleQuotes $row.image)'" } else { "NULL" }
    
    $sql = "INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES ($($row.station_id), N'$(Escape-SingleQuotes $row.name)', CAST($($row.latitude) AS Decimal(9, 6)), CAST($($row.longitude) AS Decimal(9, 6)), N'$(Escape-SingleQuotes $row.address)', N'$($row.status)', CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), CAST(N'$($row.updated_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $city, $($row.available_vehicles), $($row.total_slots), $amenities, CAST($($row.rating) AS Decimal(3, 2)), $opHours, $($row.fast_charging), $image)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[stations] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($stations.Count) stations" -ForegroundColor Green

Write-Host "Exporting VEHICLE_MODELS..." -ForegroundColor Yellow

# Export VEHICLE_MODELS
$modelsQuery = "SELECT * FROM [dbo].[vehicle_models] ORDER BY model_id"
$models = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $modelsQuery

foreach ($row in $models) {
    $type = if ($row.type) { "N'$(Escape-SingleQuotes $row.type)'" } else { "NULL" }
    $features = if ($row.features) { "N'$(Escape-SingleQuotes $row.features)'" } else { "NULL" }
    $desc = if ($row.description) { "N'$(Escape-SingleQuotes $row.description)'" } else { "NULL" }
    $image = if ($row.image) { "N'$(Escape-SingleQuotes $row.image)'" } else { "NULL" }
    $year = if ($row.year) { $row.year } else { "NULL" }
    $seats = if ($row.seats) { $row.seats } else { "NULL" }
    $maxRange = if ($row.max_range_km) { $row.max_range_km } else { "NULL" }
    
    $sql = "INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'$(Escape-SingleQuotes $row.model_id)', N'$(Escape-SingleQuotes $row.brand)', N'$(Escape-SingleQuotes $row.model_name)', $type, $year, $seats, $features, $desc, CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), CAST(N'$($row.updated_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $image, CAST($($row.price_per_hour) AS Decimal(10, 2)), CAST($($row.price_per_day) AS Decimal(10, 2)), $maxRange)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"GO`n" | Add-Content -Path $OutputFile
Write-Host "Exported $($models.Count) vehicle models" -ForegroundColor Green

Write-Host "Exporting USERS..." -ForegroundColor Yellow

# Export USERS
$sql = @"
SET IDENTITY_INSERT [dbo].[users] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$usersQuery = "SELECT * FROM [dbo].[users] ORDER BY user_id"
$users = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $usersQuery

foreach ($row in $users) {
    $cccd = if ($row.cccd) { "N'$(Escape-SingleQuotes $row.cccd)'" } else { "NULL" }
    $license = if ($row.license_number) { "N'$(Escape-SingleQuotes $row.license_number)'" } else { "NULL" }
    $address = if ($row.address) { "N'$(Escape-SingleQuotes $row.address)'" } else { "NULL" }
    $position = if ($row.position) { "N'$(Escape-SingleQuotes $row.position)'" } else { "NULL" }
    $gender = if ($row.gender) { "N'$(Escape-SingleQuotes $row.gender)'" } else { "NULL" }
    $dob = if ($row.date_of_birth) { "CAST(N'$($row.date_of_birth.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $stationId = if ($row.station_id) { $row.station_id } else { "NULL" }
    $wallet = if ($row.wallet_balance) { "CAST($($row.wallet_balance) AS Decimal(10, 2))" } else { "CAST(0.00 AS Decimal(10, 2))" }
    $updatedAt = if ($row.updated_at) { "CAST(N'$($row.updated_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime)" } else { "NULL" }
    
    $sql = "INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES ($($row.user_id), N'$(Escape-SingleQuotes $row.email)', N'$(Escape-SingleQuotes $row.password_hash)', $($row.role_id), N'$(Escape-SingleQuotes $row.full_name)', N'$($row.phone)', $cccd, $license, $address, $position, $($row.is_active), CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $updatedAt, $gender, $dob, $stationId, $wallet)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[users] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($users.Count) users" -ForegroundColor Green

Write-Host "Exporting VEHICLES..." -ForegroundColor Yellow

# Export VEHICLES
$sql = @"
SET IDENTITY_INSERT [dbo].[vehicles] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$vehiclesQuery = "SELECT * FROM [dbo].[vehicles] ORDER BY vehicle_id"
$vehicles = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $vehiclesQuery

foreach ($row in $vehicles) {
    $uniqueId = if ($row.unique_vehicle_id) { "N'$(Escape-SingleQuotes $row.unique_vehicle_id)'" } else { "NULL" }
    $maxRange = if ($row.max_range_km) { $row.max_range_km } else { "NULL" }
    $priceDay = if ($row.price_per_day) { "CAST($($row.price_per_day) AS Decimal(10, 2))" } else { "NULL" }
    $rating = if ($row.rating) { "CAST($($row.rating) AS Decimal(2, 1))" } else { "NULL" }
    $inspDate = if ($row.inspection_date) { "CAST(N'$($row.inspection_date.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $insExp = if ($row.insurance_expiry) { "CAST(N'$($row.insurance_expiry.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $condition = if ($row.condition) { "N'$(Escape-SingleQuotes $row.condition)'" } else { "NULL" }
    $image = if ($row.image) { "N'$(Escape-SingleQuotes $row.image)'" } else { "NULL" }
    $plate = if ($row.license_plate) { "N'$(Escape-SingleQuotes $row.license_plate)'" } else { "NULL" }
    $fuel = if ($row.fuel_efficiency) { "N'$(Escape-SingleQuotes $row.fuel_efficiency)'" } else { "NULL" }
    $location = if ($row.location) { "N'$(Escape-SingleQuotes $row.location)'" } else { "NULL" }
    $color = if ($row.color) { "N'$(Escape-SingleQuotes $row.color)'" } else { "NULL" }
    $year = if ($row.year) { $row.year } else { "NULL" }
    $battery = if ($row.battery_capacity) { "CAST($($row.battery_capacity) AS Decimal(5, 2))" } else { "NULL" }
    $purDate = if ($row.purchase_date) { "CAST(N'$($row.purchase_date.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $warExp = if ($row.warranty_expiry) { "CAST(N'$($row.warranty_expiry.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $nextMaint = if ($row.next_maintenance_date) { "CAST(N'$($row.next_maintenance_date.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    $notes = if ($row.notes) { "N'$(Escape-SingleQuotes $row.notes)'" } else { "NULL" }
    $lastMaint = if ($row.last_maintenance) { "CAST(N'$($row.last_maintenance.ToString("yyyy-MM-dd"))' AS Date)" } else { "NULL" }
    
    $sql = "INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES ($($row.vehicle_id), $($row.station_id), N'$(Escape-SingleQuotes $row.model_id)', $uniqueId, $($row.battery_level), $maxRange, N'$(Escape-SingleQuotes $row.status)', CAST($($row.price_per_hour) AS Decimal(10, 2)), $priceDay, $rating, $($row.review_count), $($row.trips), $($row.mileage), $inspDate, $insExp, $condition, CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), CAST(N'$($row.updated_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $image, $plate, $fuel, $location, $color, $year, $battery, $purDate, $warExp, $nextMaint, $notes, $lastMaint)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[vehicles] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($vehicles.Count) vehicles" -ForegroundColor Green

Write-Host "Exporting USER_DOCUMENTS..." -ForegroundColor Yellow

# Export USER_DOCUMENTS
$sql = @"
SET IDENTITY_INSERT [dbo].[user_documents] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$userDocsQuery = "SELECT * FROM [dbo].[user_documents] ORDER BY document_id"
$userDocs = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $userDocsQuery

foreach ($row in $userDocs) {
    $userId = if ($row.user_id) { $row.user_id } else { "NULL" }
    $status = if ($row.status) { "N'$(Escape-SingleQuotes $row.status)'" } else { "NULL" }
    $verifiedAt = if ($row.verified_at) { "CAST(N'$($row.verified_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime)" } else { "NULL" }
    $verifiedBy = if ($row.verified_by) { $row.verified_by } else { "NULL" }
    
    $sql = "INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES ($($row.document_id), $userId, N'$(Escape-SingleQuotes $row.document_type)', N'$(Escape-SingleQuotes $row.file_url)', $status, $verifiedAt, $verifiedBy, CAST(N'$($row.uploaded_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime))"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[user_documents] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($userDocs.Count) user_documents" -ForegroundColor Green

Write-Host "Exporting RESERVATIONS..." -ForegroundColor Yellow

# Export RESERVATIONS
$sql = @"
SET IDENTITY_INSERT [dbo].[reservations] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$reservationsQuery = "SELECT * FROM [dbo].[reservations] ORDER BY reservation_id"
$reservations = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $reservationsQuery

foreach ($row in $reservations) {
    $status = if ($row.status) { "N'$(Escape-SingleQuotes $row.status)'" } else { "NULL" }
    $cancelReason = if ($row.cancellation_reason) { "N'$(Escape-SingleQuotes $row.cancellation_reason)'" } else { "NULL" }
    $cancelledBy = if ($row.cancelled_by) { "N'$(Escape-SingleQuotes $row.cancelled_by)'" } else { "NULL" }
    $cancelledAt = if ($row.cancelled_at) { "CAST(N'$($row.cancelled_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime)" } else { "NULL" }
    
    $sql = "INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES ($($row.reservation_id), $($row.user_id), $($row.vehicle_id), $($row.station_id), CAST(N'$($row.start_time.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), CAST(N'$($row.end_time.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $status, CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $cancelReason, $cancelledBy, $cancelledAt)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[reservations] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($reservations.Count) reservations" -ForegroundColor Green

Write-Host "Exporting PAYMENTS..." -ForegroundColor Yellow

# Export PAYMENTS
$sql = @"
SET IDENTITY_INSERT [dbo].[payments] ON;
GO

"@
$sql | Add-Content -Path $OutputFile

$paymentsQuery = "SELECT * FROM [dbo].[payments] ORDER BY payment_id"
$payments = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $paymentsQuery

foreach ($row in $payments) {
    $reservationId = if ($row.reservation_id) { $row.reservation_id } else { "NULL" }
    $rentalId = if ($row.rental_id) { $row.rental_id } else { "NULL" }
    $transactionId = if ($row.transaction_id) { "N'$(Escape-SingleQuotes $row.transaction_id)'" } else { "NULL" }
    $userId = if ($row.user_id) { $row.user_id } else { "NULL" }
    $transactionType = if ($row.transaction_type) { "N'$(Escape-SingleQuotes $row.transaction_type)'" } else { "N'payment'" }
    $updatedAt = if ($row.updated_at) { "CAST(N'$($row.updated_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime)" } else { "NULL" }
    
    $sql = "INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES ($($row.payment_id), $reservationId, $rentalId, N'$(Escape-SingleQuotes $row.method_type)', CAST($($row.amount) AS Decimal(10, 2)), N'$(Escape-SingleQuotes $row.status)', $transactionId, $($row.is_deposit), CAST(N'$($row.created_at.ToString("yyyy-MM-dd HH:mm:ss.fff"))' AS DateTime), $updatedAt, $userId, $transactionType)"
    $sql | Add-Content -Path $OutputFile
    "GO" | Add-Content -Path $OutputFile
}

"`nSET IDENTITY_INSERT [dbo].[payments] OFF;" | Add-Content -Path $OutputFile
"GO`n" | Add-Content -Path $OutputFile

Write-Host "Exported $($payments.Count) payments" -ForegroundColor Green

# Re-enable constraints
$footer = @"

-- Re-enable all constraints
EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
GO

PRINT '========================================================================='
PRINT 'Data import completed successfully!'
PRINT '========================================================================='
GO
"@

$footer | Add-Content -Path $OutputFile

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "Export completed successfully!" -ForegroundColor Green
Write-Host "Output file: $OutputFile" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Green

