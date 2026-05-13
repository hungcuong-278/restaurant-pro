# Comprehensive Test Runner (PowerShell version)
# Runs all tests and generates detailed reports

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🧪 RESTAURANT PRO TEST SUITE 🧪" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Create reports directory
$reportsDir = "test-reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

# Start timestamp
$startTime = Get-Date
Write-Host "⏰ Started at: $startTime" -ForegroundColor Yellow
Write-Host ""

# Initialize exit codes
$backendUnitExit = 0
$backendApiExit = 0
$frontendExit = 0
$e2eExit = 0

# Backend Tests
Write-Host "📦 Running Backend Tests..." -ForegroundColor Green
Write-Host "----------------------------"
Push-Location backend

# Unit Tests
Write-Host "✓ Unit Tests..." -ForegroundColor White
npm test -- --coverage --coverageDirectory=../test-reports/backend-coverage --testPathPattern="services|utils" 2>&1 | Out-File -FilePath ../test-reports/backend-unit.log
$backendUnitExit = $LASTEXITCODE

# API Integration Tests  
Write-Host "✓ API Integration Tests..." -ForegroundColor White
npm test -- --testPathPattern="api" 2>&1 | Out-File -FilePath ../test-reports/backend-api.log
$backendApiExit = $LASTEXITCODE

# Generate backend test summary
Write-Host "✓ Generating Backend Summary..." -ForegroundColor White
npm test -- --json --outputFile=../test-reports/backend-results.json 2>&1 | Out-Null

Pop-Location

# Frontend Tests
Write-Host ""
Write-Host "⚛️  Running Frontend Tests..." -ForegroundColor Green
Write-Host "----------------------------"
Push-Location frontend

# Component Tests
Write-Host "✓ Component Tests..." -ForegroundColor White
npm test -- --coverage --coverageDirectory=../test-reports/frontend-coverage --watchAll=false 2>&1 | Out-File -FilePath ../test-reports/frontend-component.log
$frontendExit = $LASTEXITCODE

# Generate frontend test summary
Write-Host "✓ Generating Frontend Summary..." -ForegroundColor White
npm test -- --json --outputFile=../test-reports/frontend-results.json --watchAll=false 2>&1 | Out-Null

Pop-Location

# E2E Tests (if available)
if (Test-Path "e2e") {
    Write-Host ""
    Write-Host "🌐 Running E2E Tests..." -ForegroundColor Green
    Write-Host "----------------------------"
    Push-Location e2e
    npm test 2>&1 | Out-File -FilePath ../test-reports/e2e.log
    $e2eExit = $LASTEXITCODE
    Pop-Location
}

# End timestamp
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# Generate Summary Report
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏱️  Duration: $([math]::Round($duration, 2))s" -ForegroundColor Yellow
Write-Host ""

$passIcon = "✅"
$failIcon = "❌"

Write-Host "Backend Unit Tests: $(if ($backendUnitExit -eq 0) { "$passIcon PASSED" } else { "$failIcon FAILED" })" -ForegroundColor $(if ($backendUnitExit -eq 0) { "Green" } else { "Red" })
Write-Host "Backend API Tests:  $(if ($backendApiExit -eq 0) { "$passIcon PASSED" } else { "$failIcon FAILED" })" -ForegroundColor $(if ($backendApiExit -eq 0) { "Green" } else { "Red" })
Write-Host "Frontend Tests:     $(if ($frontendExit -eq 0) { "$passIcon PASSED" } else { "$failIcon FAILED" })" -ForegroundColor $(if ($frontendExit -eq 0) { "Green" } else { "Red" })

if (Test-Path "e2e") {
    Write-Host "E2E Tests:          $(if ($e2eExit -eq 0) { "$passIcon PASSED" } else { "$failIcon FAILED" })" -ForegroundColor $(if ($e2eExit -eq 0) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "📁 Test reports saved to: ./test-reports/" -ForegroundColor Cyan
Write-Host ""

# Coverage Summary
Write-Host "📈 Coverage Reports:" -ForegroundColor Yellow
Write-Host "  - Backend:  ./test-reports/backend-coverage/index.html"
Write-Host "  - Frontend: ./test-reports/frontend-coverage/index.html"

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Test suite completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Exit with failure if any tests failed
if ($backendUnitExit -ne 0 -or $backendApiExit -ne 0 -or $frontendExit -ne 0) {
    exit 1
}

exit 0
