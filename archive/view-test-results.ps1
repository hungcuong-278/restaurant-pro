# Morning Test Results Viewer
# Quick script to view overnight test results

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MORNING TEST RESULTS VIEWER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$reportsDir = "test-reports"

# Find the most recent summary file
$summaryFiles = Get-ChildItem -Path $reportsDir -Filter "overnight-summary-*.md" | Sort-Object LastWriteTime -Descending

if ($summaryFiles.Count -eq 0) {
    Write-Host "❌ No test results found!" -ForegroundColor Red
    Write-Host "The overnight tests may not have completed yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check if the test process is still running:" -ForegroundColor Yellow
    Write-Host "  Get-Process | Where-Object {`$_.ProcessName -like '*powershell*'}" -ForegroundColor Gray
    exit 1
}

$latestSummary = $summaryFiles[0]
$latestLog = Get-ChildItem -Path $reportsDir -Filter "overnight-test-log-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

Write-Host "📊 Latest Test Summary: $($latestSummary.Name)" -ForegroundColor Cyan
Write-Host "📄 Latest Test Log: $($latestLog.Name)" -ForegroundColor Cyan
Write-Host ""

# Display summary
$summaryContent = Get-Content -Path $latestSummary.FullName -Raw
Write-Host $summaryContent

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QUICK ACTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. View full log:" -ForegroundColor Yellow
Write-Host "   notepad `"$($latestLog.FullName)`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open backend coverage report:" -ForegroundColor Yellow
Write-Host "   start backend\coverage\all\lcov-report\index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open frontend coverage report:" -ForegroundColor Yellow
Write-Host "   start frontend\coverage\lcov-report\index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Re-run failed tests:" -ForegroundColor Yellow
Write-Host "   cd backend; npm test" -ForegroundColor Gray
Write-Host ""
Write-Host "5. View this summary again:" -ForegroundColor Yellow
Write-Host "   .\view-test-results.ps1" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to open coverage reports
Write-Host "Would you like to open the coverage reports? (Y/N): " -ForegroundColor Green -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Opening coverage reports..." -ForegroundColor Cyan
    
    if (Test-Path "backend\coverage\all\lcov-report\index.html") {
        Start-Process "backend\coverage\all\lcov-report\index.html"
        Write-Host "✅ Opened backend coverage report" -ForegroundColor Green
    }
    
    if (Test-Path "frontend\coverage\lcov-report\index.html") {
        Start-Process "frontend\coverage\lcov-report\index.html"
        Write-Host "✅ Opened frontend coverage report" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Have a great day! 🌅" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
