# Test API với staff của các quận khác
# Đảm bảo staff chỉ thấy xe của station mình

$baseUrl = "http://localhost:5000"

# Test staff District 7
Write-Host "=== Testing Staff District 7 ===" -ForegroundColor Green
$district7Login = @{
    email = "staff.district7@ev.local"
    password = "Staff@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $district7Login -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful for District 7 staff" -ForegroundColor Green
    
    # Test get vehicles
    $headers = @{ "Authorization" = "Bearer $token" }
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/staff/vehicles" -Method GET -Headers $headers
    Write-Host "📊 District 7 vehicles count: $($vehicles.Count)" -ForegroundColor Yellow
    foreach ($vehicle in $vehicles) {
        Write-Host "  - Vehicle ID: $($vehicle.vehicleId), Station ID: $($vehicle.stationId), Status: $($vehicle.status)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error testing District 7: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test staff Airport
Write-Host "=== Testing Staff Airport ===" -ForegroundColor Green
$airportLogin = @{
    email = "staff.airport@ev.local"
    password = "Staff@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $airportLogin -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful for Airport staff" -ForegroundColor Green
    
    # Test get vehicles
    $headers = @{ "Authorization" = "Bearer $token" }
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/staff/vehicles" -Method GET -Headers $headers
    Write-Host "📊 Airport vehicles count: $($vehicles.Count)" -ForegroundColor Yellow
    foreach ($vehicle in $vehicles) {
        Write-Host "  - Vehicle ID: $($vehicle.vehicleId), Station ID: $($vehicle.stationId), Status: $($vehicle.status)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error testing Airport: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test staff District 3
Write-Host "=== Testing Staff District 3 ===" -ForegroundColor Green
$district3Login = @{
    email = "staff.district3@ev.local"
    password = "Staff@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $district3Login -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful for District 3 staff" -ForegroundColor Green
    
    # Test get vehicles
    $headers = @{ "Authorization" = "Bearer $token" }
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/staff/vehicles" -Method GET -Headers $headers
    Write-Host "📊 District 3 vehicles count: $($vehicles.Count)" -ForegroundColor Yellow
    foreach ($vehicle in $vehicles) {
        Write-Host "  - Vehicle ID: $($vehicle.vehicleId), Station ID: $($vehicle.stationId), Status: $($vehicle.status)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error testing District 3: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
