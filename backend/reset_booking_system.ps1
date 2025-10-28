# Reset Booking System Script
# This script deletes all reservations and resets vehicle status to 'available'

Write-Host "=== EV Rental Booking System Reset ===" -ForegroundColor Green

Write-Host "`n1. Checking current reservations..." -ForegroundColor Yellow

# Check current reservations
$reservationsCheck = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "SELECT COUNT(*) as total_reservations FROM reservations"
$reservationCount = $reservationsCheck.Split("`n")[2].Trim()
Write-Host "Current reservations: $reservationCount" -ForegroundColor Cyan

# Check pending vehicles
$pendingVehicles = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "SELECT COUNT(*) as pending_vehicles FROM vehicles WHERE status = 'pending'"
$pendingCount = $pendingVehicles.Split("`n")[2].Trim()
Write-Host "Pending vehicles: $pendingCount" -ForegroundColor Cyan

Write-Host "`n2. Deleting all reservations..." -ForegroundColor Yellow

# Delete all reservations
$deleteResult = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "DELETE FROM reservations"
Write-Host "✅ Deleted all reservations" -ForegroundColor Green

Write-Host "`n3. Resetting vehicle status to 'available'..." -ForegroundColor Yellow

# Reset vehicle status
$updateResult = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "UPDATE vehicles SET status = 'available', updated_at = GETDATE() WHERE status = 'pending'"
Write-Host "✅ Reset vehicle status to 'available'" -ForegroundColor Green

Write-Host "`n4. Verifying results..." -ForegroundColor Yellow

# Verify reservations
$finalReservations = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "SELECT COUNT(*) as total_reservations FROM reservations"
$finalCount = $finalReservations.Split("`n")[2].Trim()
Write-Host "Final reservations: $finalCount" -ForegroundColor Cyan

# Verify available vehicles
$availableVehicles = sqlcmd -S localhost -d EV_Rental -U sa -P 12345 -Q "SELECT COUNT(*) as available_vehicles FROM vehicles WHERE status = 'available'"
$availableCount = $availableVehicles.Split("`n")[2].Trim()
Write-Host "Available vehicles: $availableCount" -ForegroundColor Cyan

Write-Host "`n=== Reset Complete ===" -ForegroundColor Green
Write-Host "System is ready for new bookings!" -ForegroundColor Green
