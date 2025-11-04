# Run Database Migration for pickup_qr_codes table
# This script executes the migration SQL file

param(
    [string]$Server = "localhost",
    [string]$Database = "EV_Rental",
    [string]$Username = "",
    [string]$Password = "",
    [switch]$Rollback = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  pickup_qr_codes Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Determine which script to run
$scriptFile = if ($Rollback) { "rollback_pickup_qr_codes.sql" } else { "migrate_pickup_qr_codes.sql" }
$scriptPath = Join-Path $PSScriptRoot $scriptFile
$action = if ($Rollback) { "ROLLBACK" } else { "MIGRATION" }

# Check if script file exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Script file not found: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Server:   $Server" -ForegroundColor Gray
Write-Host "  Database: $Database" -ForegroundColor Gray
Write-Host "  Script:   $scriptFile" -ForegroundColor Gray
Write-Host "  Action:   $action" -ForegroundColor $(if ($Rollback) { "Yellow" } else { "Green" })
Write-Host ""

# Confirm action
$confirmation = Read-Host "Do you want to proceed with the $action? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing $action..." -ForegroundColor Cyan
Write-Host ""

try {
    # Build connection string
    if ([string]::IsNullOrEmpty($Username)) {
        # Windows Authentication
        Write-Host "Using Windows Authentication..." -ForegroundColor Gray
        $connectionString = "Server=$Server;Database=$Database;Integrated Security=True;TrustServerCertificate=True;"
    } else {
        # SQL Server Authentication
        Write-Host "Using SQL Server Authentication..." -ForegroundColor Gray
        $connectionString = "Server=$Server;Database=$Database;User Id=$Username;Password=$Password;TrustServerCertificate=True;"
    }

    # Load SQL Server SMO
    try {
        Add-Type -AssemblyName "Microsoft.SqlServer.Smo, Version=16.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" -ErrorAction Stop
    } catch {
        # Try loading without version
        Add-Type -AssemblyName "Microsoft.SqlServer.Smo" -ErrorAction Stop
    }

    # Execute using Invoke-Sqlcmd if available
    if (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue) {
        Write-Host "Using Invoke-Sqlcmd..." -ForegroundColor Gray
        
        $params = @{
            ServerInstance = $Server
            Database = $Database
            InputFile = $scriptPath
            Verbose = $true
            ErrorAction = 'Stop'
        }
        
        if (-not [string]::IsNullOrEmpty($Username)) {
            $params.Username = $Username
            $params.Password = $Password
        }
        
        Invoke-Sqlcmd @params
    }
    else {
        # Fallback to sqlcmd.exe
        Write-Host "Using sqlcmd.exe..." -ForegroundColor Gray
        
        $sqlcmdPath = "sqlcmd.exe"
        
        if ([string]::IsNullOrEmpty($Username)) {
            # Windows Authentication
            & $sqlcmdPath -S $Server -d $Database -E -i $scriptPath
        } else {
            # SQL Server Authentication
            & $sqlcmdPath -S $Server -d $Database -U $Username -P $Password -i $scriptPath
        }
        
        if ($LASTEXITCODE -ne 0) {
            throw "sqlcmd.exe returned error code: $LASTEXITCODE"
        }
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  $action COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    if (-not $Rollback) {
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Verify table structure:" -ForegroundColor Gray
        Write-Host "   SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pickup_qr_codes')" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "2. Test QR generation:" -ForegroundColor Gray
        Write-Host "   curl -X POST http://localhost:5000/api/qr/generate/64 -H 'Authorization: Bearer TOKEN'" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "3. Run the mobile app:" -ForegroundColor Gray
        Write-Host "   cd frontend/mobile-qr-scan-app && npx expo start" -ForegroundColor DarkGray
    } else {
        Write-Host "Rollback completed. Original schema restored." -ForegroundColor Yellow
        Write-Host "Check for backup table 'pickup_qr_codes_backup' if data restoration failed." -ForegroundColor Yellow
    }
    
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: $action FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verify SQL Server is running" -ForegroundColor Gray
    Write-Host "2. Check database name is correct: $Database" -ForegroundColor Gray
    Write-Host "3. Verify you have permissions to modify tables" -ForegroundColor Gray
    Write-Host "4. Check connection details are correct" -ForegroundColor Gray
    Write-Host "5. Try running the SQL script manually in SSMS" -ForegroundColor Gray
    Write-Host ""
    
    exit 1
}
