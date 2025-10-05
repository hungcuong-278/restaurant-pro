@echo off
echo ========================================
echo   Restaurant Pro - Frontend (Stable)
echo ========================================
echo.

echo [1/3] Checking for existing processes...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use!
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo Killing process %%a...
        taskkill /PID %%a /F > nul 2>&1
    )
    timeout /t 2 > nul
)

echo [2/3] Setting environment...
set NODE_OPTIONS=--max_old_space_size=4096
set GENERATE_SOURCEMAP=false

echo [3/3] Starting frontend server...
echo.
echo Frontend will run on: http://localhost:3000
echo Memory limit: 4GB
echo Source maps: Disabled (faster compilation)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
npm start
