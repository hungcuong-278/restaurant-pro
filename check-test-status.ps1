# Check if overnight tests are still running
# Quick status checker

Write-Host "Checking overnight test status..." -ForegroundColor Cyan
Write-Host ""

# Check for running PowerShell processes
$testProcesses = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*overnight*" -or 
    $_.CommandLine -like "*run-overnight-tests*"
}

if ($testProcesses) {
    Write-Host "🔄 Tests are STILL RUNNING" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Process Details:" -ForegroundColor Gray
    $testProcesses | Format-Table Id, ProcessName, StartTime, CPU -AutoSize
    Write-Host ""
    Write-Host "Estimated completion: Unknown" -ForegroundColor Gray
    Write-Host "You can check back later or wait for completion." -ForegroundColor Gray
}
else {
    Write-Host "✅ Tests have COMPLETED" -ForegroundColor Green
    Write-Host ""
    
    # Check for results
    $summaryFiles = Get-ChildItem -Path "test-reports" -Filter "overnight-summary-*.md" -ErrorAction SilentlyContinue | 
                    Sort-Object LastWriteTime -Descending
    
    if ($summaryFiles) {
        $latest = $summaryFiles[0]
        Write-Host "📊 Latest results: $($latest.Name)" -ForegroundColor Cyan
        Write-Host "   Created: $($latest.LastWriteTime)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Run this to view results:" -ForegroundColor Yellow
        Write-Host "   .\view-test-results.ps1" -ForegroundColor White
    }
    else {
        Write-Host "⚠️ No results found!" -ForegroundColor Yellow
        Write-Host "The tests may have failed to start or completed with errors." -ForegroundColor Gray
        Write-Host ""
        Write-Host "Try running manually:" -ForegroundColor Yellow
        Write-Host "   .\run-overnight-tests.ps1" -ForegroundColor White
    }
}

Write-Host ""
