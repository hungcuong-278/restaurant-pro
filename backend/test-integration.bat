@echo off
REM ============================================================================
REM Restaurant Pro - Complete Integration Test Runner
REM ============================================================================
REM Week 7 - Phase 2 - Task 2.6: Backend Integration Testing
REM 
REM This script runs comprehensive end-to-end integration tests
REM ============================================================================

echo.
echo ========================================================================
echo   RESTAURANT PRO - COMPLETE INTEGRATION TEST SUITE
echo ========================================================================
echo   Week 7 - Phase 2 - Task 2.6
echo   Testing: Order Management + Payment System Integration
echo ========================================================================
echo.

REM Check if server is running
echo [1/3] Checking if server is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Server is not running!
    echo Please start the server first:
    echo   cd backend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)
echo [OK] Server is running
echo.

REM Run integration tests
echo [2/3] Running complete integration test suite...
echo This will test:
echo   - Order Management (create, update, complete)
echo   - Payment Processing (full, partial, split)
echo   - Order-Payment Integration
echo   - Transaction Safety
echo   - Error Handling
echo.
echo Starting tests...
echo -----------------------------------------------------------------------
node test-integration-complete.js
echo -----------------------------------------------------------------------
echo.

REM Check test result
if errorlevel 1 (
    echo [3/3] Integration tests FAILED
    echo Please review the errors above
    echo.
    pause
    exit /b 1
) else (
    echo [3/3] Integration tests PASSED
    echo.
    echo ========================================================================
    echo   ALL INTEGRATION TESTS PASSED!
    echo ========================================================================
    echo   Backend is PRODUCTION READY
    echo ========================================================================
    echo.
)

pause
