@echo off
REM ============================================
REM Backend Startup Script
REM ============================================

echo Starting EV Rental API Backend...
echo.

cd /d "%~dp0"
cd backend\EVRentalApi

echo Building and running...
dotnet run

pause
