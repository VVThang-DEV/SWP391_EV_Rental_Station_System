# Kiểm tra database để xem staff.district3@ev.local có tồn tại không
$baseUrl = "http://localhost:5000"

Write-Host "=== Checking Database for staff.district3@ev.local ===" -ForegroundColor Green

# Test login với staff.district3@ev.local
$district3Login = @{
    email = "staff.district3@ev.local"
    password = "Staff@123"
} | ConvertTo-Json

try {
    Write-Host "1. Testing login with staff.district3@ev.local..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $district3Login -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Full Name: $($loginResponse.fullName)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Cyan
    
    # Decode JWT token để xem user ID
    Write-Host "`n2. Decoding JWT token..." -ForegroundColor Yellow
    $tokenParts = $token.Split('.')
    # Add padding if needed
    $payloadPart = $tokenParts[1]
    while ($payloadPart.Length % 4 -ne 0) {
        $payloadPart += "="
    }
    $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payloadPart))
    $payloadObj = $payload | ConvertFrom-Json
    Write-Host "✅ JWT Payload:" -ForegroundColor Green
    Write-Host "   User ID: $($payloadObj.nameid)" -ForegroundColor Cyan
    Write-Host "   Email: $($payloadObj.name)" -ForegroundColor Cyan
    Write-Host "   Role: $($payloadObj.role)" -ForegroundColor Cyan
    
    $headers = @{ "Authorization" = "Bearer $token" }
    
    # Test staff profile
    Write-Host "`n3. Testing staff profile..." -ForegroundColor Yellow
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/staff/profile" -Method GET -Headers $headers
    Write-Host "✅ Staff Profile:" -ForegroundColor Green
    Write-Host "   User ID: $($profile.userId)" -ForegroundColor Cyan
    Write-Host "   Name: $($profile.fullName)" -ForegroundColor Cyan
    Write-Host "   Email: $($profile.email)" -ForegroundColor Cyan
    Write-Host "   Station ID: $($profile.stationId)" -ForegroundColor Cyan
    Write-Host "   Station Name: $($profile.stationName)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}
