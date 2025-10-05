@echo off
title Restaurant Pro - Server Monitor
color 0A
echo ========================================
echo   Restaurant Pro - Health Monitor
echo ========================================
echo.

:LOOP
cls
echo ========================================
echo   Server Health Check - %date% %time%
echo ========================================
echo.

echo [Backend - Port 5000]
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo Status: [32mONLINE[0m
    curl -s http://localhost:5000/api/health
) else (
    echo Status: [31mOFFLINE[0m
)
echo.

echo [Frontend - Port 3000]
netstat -ano | findstr :3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo Status: [32mONLINE[0m
    echo URL: http://localhost:3000
) else (
    echo Status: [31mOFFLINE[0m
)
echo.

echo [Node Processes]
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Select-Object Id, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet64/1MB,2)}}, StartTime | Format-Table -AutoSize"

echo ========================================
echo Refreshing in 10 seconds...
echo Press Ctrl+C to exit
echo ========================================
timeout /t 10 > nul
goto LOOP
