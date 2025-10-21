# Kiểm tra trực tiếp database để xem staff.district3@ev.local có tồn tại không
Write-Host "=== Checking Database Directly ===" -ForegroundColor Green

# Test với các tài khoản staff khác nhau
$staffAccounts = @(
    @{ email = "staff.district3@ev.local"; password = "Staff@123" },
    @{ email = "staff.district7@ev.local"; password = "Staff@123" },
    @{ email = "staff.airport@ev.local"; password = "Staff@123" },
    @{ email = "staff@ev.local"; password = "Staff@123" }
)

foreach ($account in $staffAccounts) {
    Write-Host "`n--- Testing $($account.email) ---" -ForegroundColor Yellow
    
    $loginData = @{
        email = $account.email
        password = $account.password
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Full Name: $($loginResponse.fullName)" -ForegroundColor Cyan
        Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Cyan
        
        # Test staff profile
        $token = $loginResponse.token
        $headers = @{ "Authorization" = "Bearer $token" }
        $profile = Invoke-RestMethod -Uri "http://localhost:5000/api/staff/profile" -Method GET -Headers $headers
        Write-Host "   Profile - User ID: $($profile.userId), Station ID: $($profile.stationId), Station Name: $($profile.stationName)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
