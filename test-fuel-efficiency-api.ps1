# Test script để kiểm tra form Register New Vehicle với fuel_efficiency
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "=== Testing Updated Admin Create Vehicle API with Fuel Efficiency ==="

# Admin credentials
$adminEmail = "admin@ev.local"
$adminPassword = "Admin@123"
$backendBaseUrl = "http://localhost:5000"

# Test data for new vehicle với fuel_efficiency
$testVehicleData = @{
    modelId = "VF3"
    uniqueVehicleId = "TEST-VIN-FUEL-123456789"
    batteryLevel = 100
    condition = "excellent"
    mileage = 0
    licensePlate = "TEST-FUEL-123"
    inspectionDate = "2024-01-25"
    insuranceExpiry = "2025-01-15"
    location = "Warehouse"
    color = "White"
    year = 2024
    batteryCapacity = 42.5
    purchaseDate = "2024-01-15"
    warrantyExpiry = "2027-01-15"
    nextMaintenanceDate = "2024-07-20"
    fuelEfficiency = 5.2
    notes = "Test vehicle with fuel efficiency created by admin"
} | ConvertTo-Json -Depth 10

Write-Host "Test Data:"
Write-Host $testVehicleData

# 1. Login as admin to get token
Write-Host "`n1. Logging in as admin..."
try {
    $loginResponse = Invoke-RestMethod -Uri "$($backendBaseUrl)/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json)
    $adminToken = $loginResponse.token
    Write-Host "✅ Login successful"
    Write-Host "   Token: $($adminToken.Substring(0, 20))..." # Show first 20 chars
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    exit 1
}

# 2. Call Admin Create Vehicle API
Write-Host "`n2. Testing admin create vehicle API with fuel efficiency..."
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    $createVehicleResponse = Invoke-RestMethod -Uri "$($backendBaseUrl)/api/admin/vehicles" -Method Post -Headers $headers -Body $testVehicleData
    Write-Host "✅ Vehicle created successfully!"
    Write-Host "   Response: $($createVehicleResponse | ConvertTo-Json -Depth 10)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "   Error Details: $($_.Exception.Response.GetResponseStream() | ForEach-Object { new-object System.IO.StreamReader($_).ReadToEnd() })"
    exit 1
}

Write-Host "`n✅ Test completed successfully!"
