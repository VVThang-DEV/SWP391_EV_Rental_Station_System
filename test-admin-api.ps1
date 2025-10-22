# Test Admin API để tạo xe
Write-Host "=== Testing Admin Create Vehicle API ===" -ForegroundColor Green

# Test data
$testData = @{
    modelId = "VF3"
    uniqueVehicleId = "TEST-VIN-123456789"
    batteryLevel = 100
    condition = "excellent"
    mileage = 0
    licensePlate = "TEST-123"
    color = "White"
    year = 2024
    batteryCapacity = 42.5
    purchaseDate = "2024-01-15"
    warrantyExpiry = "2027-01-15"
    insuranceExpiry = "2025-01-15"
    lastMaintenance = "2024-01-20"
    inspectionDate = "2024-01-25"
    nextMaintenanceDate = "2024-07-20"
    notes = "Test vehicle created by admin"
    location = "Warehouse"
} | ConvertTo-Json

Write-Host "Test Data:" -ForegroundColor Yellow
Write-Host $testData -ForegroundColor Cyan

try {
    # Login as admin first
    $loginData = @{
        email = "admin@ev.local"
        password = "Admin@123"
    } | ConvertTo-Json
    
    Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
    
    # Test admin create vehicle API
    Write-Host "`n2. Testing admin create vehicle API..." -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $($loginResponse.token)" }
    $createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/vehicles" -Method POST -Body $testData -ContentType "application/json" -Headers $headers
    
    Write-Host "✅ Vehicle created successfully!" -ForegroundColor Green
    Write-Host "   Response: $($createResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error Details: $errorBody" -ForegroundColor Red
    }
}
