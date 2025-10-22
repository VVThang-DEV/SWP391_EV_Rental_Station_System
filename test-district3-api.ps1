# Test API với staff District 3 để kiểm tra station info
$baseUrl = "http://localhost:5000"

Write-Host "=== Testing Staff District 3 API ===" -ForegroundColor Green

# Test login
$district3Login = @{
    email = "staff.district3@ev.local"
    password = "Staff@123"
} | ConvertTo-Json

try {
    Write-Host "1. Testing login..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $district3Login -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    $headers = @{ "Authorization" = "Bearer $token" }
    
    # Test staff profile
    Write-Host "`n2. Testing staff profile..." -ForegroundColor Yellow
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/staff/profile" -Method GET -Headers $headers
    Write-Host "✅ Staff Profile:" -ForegroundColor Green
    Write-Host "   Name: $($profile.fullName)" -ForegroundColor Cyan
    Write-Host "   Email: $($profile.email)" -ForegroundColor Cyan
    Write-Host "   Station ID: $($profile.stationId)" -ForegroundColor Cyan
    Write-Host "   Station Name: $($profile.stationName)" -ForegroundColor Cyan
    
    # Test station info
    Write-Host "`n3. Testing station info..." -ForegroundColor Yellow
    $stationInfo = Invoke-RestMethod -Uri "$baseUrl/api/staff/station" -Method GET -Headers $headers
    Write-Host "✅ Station Info:" -ForegroundColor Green
    Write-Host "   Station ID: $($stationInfo.stationId)" -ForegroundColor Cyan
    Write-Host "   Name: $($stationInfo.name)" -ForegroundColor Cyan
    Write-Host "   Address: $($stationInfo.address)" -ForegroundColor Cyan
    Write-Host "   City: $($stationInfo.city)" -ForegroundColor Cyan
    Write-Host "   Available Vehicles: $($stationInfo.availableVehicles)" -ForegroundColor Cyan
    
    # Test vehicles
    Write-Host "`n4. Testing station vehicles..." -ForegroundColor Yellow
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/staff/vehicles" -Method GET -Headers $headers
    Write-Host "✅ Station Vehicles Count: $($vehicles.Count)" -ForegroundColor Green
    foreach ($vehicle in $vehicles) {
        Write-Host "   - Vehicle ID: $($vehicle.vehicleId), Station ID: $($vehicle.stationId), Status: $($vehicle.status), Battery: $($vehicle.batteryLevel)%" -ForegroundColor Cyan
    }
    
    Write-Host "`n=== Test Complete ===" -ForegroundColor Green
    Write-Host "✅ All API endpoints working correctly!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}
