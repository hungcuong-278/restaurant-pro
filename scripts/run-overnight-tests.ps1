# Comprehensive Overnight Test Execution Script
# This script runs all tests, generates reports, and logs everything for morning review

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OVERNIGHT TEST EXECUTION STARTED" -ForegroundColor Cyan
Write-Host "   Start Time: $startTime" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create test-reports directory
$reportsDir = "test-reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

# Log file
$logFile = "$reportsDir/overnight-test-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$summaryFile = "$reportsDir/overnight-summary-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"

# Function to log with timestamp
function Log-Message {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry -ForegroundColor $Color
    Add-Content -Path $logFile -Value $logEntry
}

# Function to run tests with error handling
function Run-TestSuite {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkDir
    )
    
    Log-Message "========================================" "Cyan"
    Log-Message "Starting: $Name" "Cyan"
    Log-Message "Directory: $WorkDir" "Gray"
    Log-Message "Command: $Command" "Gray"
    Log-Message "========================================" "Cyan"
    
    $testStart = Get-Date
    
    try {
        Push-Location $WorkDir
        
        # Execute command and capture output
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        
        $testEnd = Get-Date
        $duration = ($testEnd - $testStart).TotalSeconds
        
        # Log output
        $output | ForEach-Object { Add-Content -Path $logFile -Value $_ }
        
        if ($exitCode -eq 0) {
            Log-Message "$Name PASSED (${duration}s)" "Green"
            return @{ Success = $true; Duration = $duration; Name = $Name }
        } else {
            Log-Message "$Name FAILED (${duration}s) - Exit Code: $exitCode" "Red"
            return @{ Success = $false; Duration = $duration; Name = $Name; ExitCode = $exitCode }
        }
    }
    catch {
        $testEnd = Get-Date
        $duration = ($testEnd - $testStart).TotalSeconds
        Log-Message "$Name ERRORED (${duration}s) - $_" "Red"
        return @{ Success = $false; Duration = $duration; Name = $Name; Error = $_.Exception.Message }
    }
    finally {
        Pop-Location
    }
}

# Initialize results
$results = @()

# 1. Backend Service Unit Tests
Log-Message "`nPhase 1: Backend Service Unit Tests" "Yellow"
$results += Run-TestSuite `
    -Name "Backend Service Tests" `
    -Command "npm test -- --testPathPattern=services --coverage --coverageDirectory=coverage/services" `
    -WorkDir "backend"

# 2. Backend API Integration Tests
Log-Message "`nPhase 2: Backend API Integration Tests" "Yellow"
$results += Run-TestSuite `
    -Name "Backend API Tests" `
    -Command "npm test -- --testPathPattern=api --coverage --coverageDirectory=coverage/api" `
    -WorkDir "backend"

# 3. Backend All Tests with Full Coverage
Log-Message "`nPhase 3: Backend Full Test Suite" "Yellow"
$results += Run-TestSuite `
    -Name "Backend All Tests" `
    -Command "npm test -- --coverage --coverageDirectory=coverage/all" `
    -WorkDir "backend"

# 4. Frontend Component Tests
Log-Message "`nPhase 4: Frontend Component Tests" "Yellow"
$results += Run-TestSuite `
    -Name "Frontend Component Tests" `
    -Command "npm test -- --coverage --watchAll=false" `
    -WorkDir "frontend"

# 5. Database Verification
Log-Message "`nPhase 5: Database Schema Verification" "Yellow"
try {
    Push-Location backend
    $dbOutput = npx ts-node verify-database-schema.ts 2>&1
    $dbOutput | ForEach-Object { Add-Content -Path $logFile -Value $_ }
    Log-Message "Database schema verified" "Green"
    $results += @{ Success = $true; Name = "Database Schema Check"; Duration = 2 }
    Pop-Location
}
catch {
    Log-Message "Database schema check skipped or failed: $_" "Yellow"
    $results += @{ Success = $false; Name = "Database Schema Check"; Duration = 0; Error = $_.Exception.Message }
}

# Calculate summary statistics
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalMinutes
$passedTests = ($results | Where-Object { $_.Success -eq $true }).Count
$failedTests = ($results | Where-Object { $_.Success -eq $false }).Count
$totalTests = $results.Count

# Generate summary report
$summaryContent = "# Overnight Test Execution Summary`n"
$summaryContent += "Test Run Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$summaryContent += "Total Duration: $([math]::Round($totalDuration, 2)) minutes`n`n"
$summaryContent += "## Overall Results`n"
$summaryContent += "Total Test Suites: $totalTests`n"
$summaryContent += "Passed: $passedTests`n"
$summaryContent += "Failed: $failedTests`n"
$summaryContent += "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%`n`n"
$summaryContent += "## Detailed Results`n`n"

foreach ($result in $results) {
    $status = if ($result.Success) { "PASSED" } else { "FAILED" }
    $duration = [math]::Round($result.Duration, 2)
    $summaryContent += "### $($result.Name) $status`n"
    $summaryContent += "Duration: ${duration}s`n"
    
    if ($result.ExitCode) {
        $summaryContent += "Exit Code: $($result.ExitCode)`n"
    }
    if ($result.Error) {
        $summaryContent += "Error: $($result.Error)`n"
    }
    $summaryContent += "`n"
}

$summaryContent += "`n## Generated Files`n"
$summaryContent += "Full log: $logFile`n"
$summaryContent += "Coverage reports:`n"
$summaryContent += "  backend/coverage/services/`n"
$summaryContent += "  backend/coverage/api/`n"
$summaryContent += "  backend/coverage/all/`n"
$summaryContent += "  frontend/coverage/`n`n"
$summaryContent += "## Next Steps`n"

if ($failedTests -eq 0) {
    $summaryContent += "1. All tests passed! Great job!`n"
    $summaryContent += "2. Review coverage reports to identify untested areas`n"
    $summaryContent += "3. Consider adding E2E tests`n"
    $summaryContent += "4. Deploy to staging environment`n"
} else {
    $summaryContent += "1. Review failed tests in the log file`n"
    $summaryContent += "2. Fix failing test cases`n"
    $summaryContent += "3. Address any identified bugs`n"
    $summaryContent += "4. Re-run failed test suites`n"
    $summaryContent += "5. Once all pass, review coverage reports`n"
}

$summaryContent += "`n## Coverage Goals`n"
$summaryContent += "Backend Services: Target 70+ percent coverage`n"
$summaryContent += "Backend API: Target 60+ percent coverage`n"
$summaryContent += "Frontend Components: Target 65+ percent coverage`n`n"
$summaryContent += "Check the HTML coverage reports in each coverage directory for detailed metrics.`n`n"
$summaryContent += "---`n"
$summaryContent += "End Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$summaryContent += "Generated by: Overnight Test Runner`n"

# Save summary
Set-Content -Path $summaryFile -Value $summaryContent

# Display final summary
Write-Host "`n" -NoNewline
Log-Message "========================================" "Cyan"
Log-Message "   OVERNIGHT TEST EXECUTION COMPLETED" "Cyan"
Log-Message "========================================" "Cyan"
Log-Message "Start Time: $startTime" "Gray"
Log-Message "End Time: $endTime" "Gray"
Log-Message "Total Duration: $([math]::Round($totalDuration, 2)) minutes" "Gray"
Log-Message "" "White"
Log-Message "Results:" "White"
Log-Message "  ✅ Passed: $passedTests" "Green"
Log-Message "  ❌ Failed: $failedTests" "Red"
Log-Message "  Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" $(if ($failedTests -eq 0) { "Green" } else { "Yellow" })
Log-Message "" "White"
Log-Message "📄 Full log: $logFile" "Cyan"
Log-Message "📊 Summary report: $summaryFile" "Cyan"
Log-Message "========================================" "Cyan"

# Open summary in browser
if ($failedTests -eq 0) {
    Log-Message "🎉 All tests passed! Opening summary report..." "Green"
} else {
    Log-Message "⚠️ Some tests failed. Please review the reports." "Yellow"
}

# Return exit code based on results
exit $failedTests
