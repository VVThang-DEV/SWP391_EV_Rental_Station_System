@echo off
REM Run Database Migration for pickup_qr_codes table
REM Simple batch wrapper for the PowerShell migration script

echo ========================================
echo   pickup_qr_codes Migration Tool
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available on this system.
    echo Please run the SQL scripts manually using SSMS or sqlcmd.
    pause
    exit /b 1
)

echo Choose an option:
echo.
echo [1] Run Migration (upgrade to JSON support)
echo [2] Run Rollback (revert to original schema)
echo [3] Cancel
echo.

choice /c 123 /n /m "Enter your choice (1, 2, or 3): "

if errorlevel 3 goto :cancel
if errorlevel 2 goto :rollback
if errorlevel 1 goto :migrate

:migrate
echo.
echo Starting migration...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0run-migration.ps1"
goto :end

:rollback
echo.
echo Starting rollback...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0run-migration.ps1" -Rollback
goto :end

:cancel
echo.
echo Operation cancelled.
goto :end

:end
echo.
pause
