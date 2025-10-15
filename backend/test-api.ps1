# EV Rental API Test Script
# Test các endpoints chính của API

$baseUrl = "http://localhost:5000"
$testResults = @()

function Write-TestResult {
    param($TestName, $Success, $Message, $Response = $null)
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    Write-Host "$status $TestName" -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
    if ($Message) { Write-Host "   $Message" -ForegroundColor Gray }
    if ($Response -and -not $Success) { Write-Host "   Response: $Response" -ForegroundColor Yellow }
    
    $script:testResults += [PSCustomObject]@{
        Test = $TestName
        Success = $Success
        Message = $Message
        Response = $Response
    }
}

function Test-Endpoint {
    param($Method, $Endpoint, $Body = $null, $Headers = @{})
    
    try {
        $uri = "$baseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return $true, $response
    }
    catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            return $false, $responseBody
        }
        return $false, $_.Exception.Message
    }
}

Write-Host "🚀 Starting EV Rental API Tests..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint" -ForegroundColor Yellow
$success, $response = Test-Endpoint -Method "GET" -Endpoint "/health"
Write-TestResult -TestName "Health Check" -Success $success -Message $(if ($success) { "API is running" } else { "API is not responding" }) -Response $response

# Test 2: Register a test user
Write-Host "`n2. Testing Registration" -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "TestPassword123!"
    fullName = "Test User"
    phone = "0123456789"
    cccd = "123456789012"
    licenseNumber = "A123456789"
    address = "123 Test Street"
    gender = "Male"
    dateOfBirth = "1990-01-01"
}

$success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Body $registerData
Write-TestResult -TestName "User Registration" -Success $success -Message $(if ($success) { "User registered successfully" } else { "Registration failed" }) -Response $response

# Test 3: Login
Write-Host "`n3. Testing Login" -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "TestPassword123!"
}

$success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Body $loginData
$token = $null
if ($success -and $response.token) {
    $token = $response.token
    Write-TestResult -TestName "User Login" -Success $true -Message "Login successful, token received"
} else {
    Write-TestResult -TestName "User Login" -Success $false -Message "Login failed" -Response $response
}

# Test 4: Get Stations
Write-Host "`n4. Testing Stations Endpoint" -ForegroundColor Yellow
$success, $response = Test-Endpoint -Method "GET" -Endpoint "/api/stations"
Write-TestResult -TestName "Get Stations" -Success $success -Message $(if ($success) { "Stations retrieved successfully" } else { "Failed to get stations" }) -Response $response

# Test 5: Get Vehicles
Write-Host "`n5. Testing Vehicles Endpoint" -ForegroundColor Yellow
$success, $response = Test-Endpoint -Method "GET" -Endpoint "/api/vehicles"
Write-TestResult -TestName "Get Vehicles" -Success $success -Message $(if ($success) { "Vehicles retrieved successfully" } else { "Failed to get vehicles" }) -Response $response

# Test 6: Get Vehicle Models
Write-Host "`n6. Testing Vehicle Models Endpoint" -ForegroundColor Yellow
$success, $response = Test-Endpoint -Method "GET" -Endpoint "/api/VehicleModels"
Write-TestResult -TestName "Get Vehicle Models" -Success $success -Message $(if ($success) { "Vehicle models retrieved successfully" } else { "Failed to get vehicle models" }) -Response $response

# Test 7: Send OTP (if we have a valid email)
Write-Host "`n7. Testing OTP Endpoint" -ForegroundColor Yellow
$otpData = @{
    email = "testuser@example.com"
    purpose = "verification"
}

$success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/send-otp" -Body $otpData
Write-TestResult -TestName "Send OTP" -Success $success -Message $(if ($success) { "OTP sent successfully" } else { "Failed to send OTP" }) -Response $response

# Test 8: Forgot Password
Write-Host "`n8. Testing Forgot Password" -ForegroundColor Yellow
$forgotPasswordData = @{
    email = "testuser@example.com"
}

$success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/forgot-password" -Body $forgotPasswordData
Write-TestResult -TestName "Forgot Password" -Success $success -Message $(if ($success) { "Password reset initiated" } else { "Failed to initiate password reset" }) -Response $response

# Test 9: Update Personal Info (with token if available)
if ($token) {
    Write-Host "`n9. Testing Update Personal Info" -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $token" }
    $updateData = @{
        email = "testuser@example.com"
        fullName = "Updated Test User"
        phone = "0987654321"
        address = "456 Updated Street"
        gender = "Female"
        dateOfBirth = "1990-01-01"
    }
    
    $success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/update-personal-info" -Body $updateData -Headers $headers
    Write-TestResult -TestName "Update Personal Info" -Success $success -Message $(if ($success) { "Personal info updated" } else { "Failed to update personal info" }) -Response $response
}

# Test 10: Debug endpoint
Write-Host "`n10. Testing Debug Endpoint" -ForegroundColor Yellow
$debugData = @{
    email = "testuser@example.com"
    cccd = "123456789012"
    licenseNumber = "A123456789"
    address = "123 Test Street"
    gender = "Male"
    dateOfBirth = "1990-01-01"
    phone = "0123456789"
}

$success, $response = Test-Endpoint -Method "POST" -Endpoint "/auth/debug-update" -Body $debugData
Write-TestResult -TestName "Debug Endpoint" -Success $success -Message $(if ($success) { "Debug endpoint working" } else { "Debug endpoint failed" }) -Response $response

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Yellow" })

if ($failedTests -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Message)" -ForegroundColor Red
        if ($_.Response) {
            Write-Host "    Response: $($_.Response)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
