@echo off
echo Starting Backend Server and Testing Payment API...
echo.

cd /d d:\First\backend

echo [1/3] Starting server in background...
start "Backend Server" cmd /k "npm run dev"

echo [2/3] Waiting for server to start (10 seconds)...
timeout /t 10 /nobreak > nul

echo [3/3] Testing Payment API endpoints...
echo.

echo Testing Health Check:
curl http://localhost:5000/api/health
echo.
echo.

echo Press any key to run payment tests...
pause > nul

echo Running Payment Tests:
node test-payment-api.js

echo.
echo Tests completed!
pause
