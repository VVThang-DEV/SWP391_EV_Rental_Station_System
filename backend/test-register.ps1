# Test script for register API
$baseUrl = "http://localhost:5000"
$registerUrl = "$baseUrl/auth/register"

# Test data
$testData = @{
    fullName = "Nguyễn Văn A"
    email = "test@example.com"
    phone = "0912345678"
    dateOfBirth = "1990-01-01"
    password = "Password123"
} | ConvertTo-Json

Write-Host "Testing Register API..."
Write-Host "URL: $registerUrl"
Write-Host "Data: $testData"

try {
    $response = Invoke-RestMethod -Uri $registerUrl -Method POST -Body $testData -ContentType "application/json"
    Write-Host "Success Response:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error Response:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
