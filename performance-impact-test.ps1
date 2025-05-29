# EXQ Studio Performance Impact Assessment
# ==========================================

param(
    [string]$TargetUrl = "https://exqstudio.cn",
    [int]$TestIterations = 5
)

function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    switch ($Color) {
        "Green" { Write-Host $Text -ForegroundColor Green }
        "Red" { Write-Host $Text -ForegroundColor Red }
        "Yellow" { Write-Host $Text -ForegroundColor Yellow }
        "Cyan" { Write-Host $Text -ForegroundColor Cyan }
        "Blue" { Write-Host $Text -ForegroundColor Blue }
        default { Write-Host $Text }
    }
}

Write-ColorOutput "EXQ Studio Performance Impact Assessment" "Cyan"
Write-ColorOutput "Target URL: $TargetUrl" "Blue"
Write-ColorOutput "Test Iterations: $TestIterations" "Blue"
Write-ColorOutput "=" * 50 "Cyan"

$performanceResults = @()
$totalTime = 0

# Run performance tests
for ($i = 1; $i -le $TestIterations; $i++) {
    Write-ColorOutput "`nTest $i/$TestIterations..." "Yellow"
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 30
        $stopwatch.Stop()
        
        $responseTime = $stopwatch.ElapsedMilliseconds
        $totalTime += $responseTime
        
        $result = @{
            "iteration" = $i
            "response_time_ms" = $responseTime
            "status_code" = $response.StatusCode
            "content_length" = $response.RawContentLength
            "success" = $true
        }
        
        Write-ColorOutput "   Response Time: $responseTime ms" "Green"
        Write-ColorOutput "   Status Code: $($response.StatusCode)" "Green"
        Write-ColorOutput "   Content Length: $($response.RawContentLength) bytes" "Green"
        
    } catch {
        $stopwatch.Stop()
        $result = @{
            "iteration" = $i
            "response_time_ms" = $stopwatch.ElapsedMilliseconds
            "status_code" = "Error"
            "content_length" = 0
            "success" = $false
            "error" = $_.Exception.Message
        }
        
        Write-ColorOutput "   Error: $($_.Exception.Message)" "Red"
    }
    
    $performanceResults += $result
    Start-Sleep -Seconds 1
}

# Calculate statistics
$successfulTests = $performanceResults | Where-Object { $_.success -eq $true }
$avgResponseTime = if ($successfulTests.Count -gt 0) { 
    ($successfulTests | Measure-Object -Property response_time_ms -Average).Average 
} else { 0 }

$minResponseTime = if ($successfulTests.Count -gt 0) { 
    ($successfulTests | Measure-Object -Property response_time_ms -Minimum).Minimum 
} else { 0 }

$maxResponseTime = if ($successfulTests.Count -gt 0) { 
    ($successfulTests | Measure-Object -Property response_time_ms -Maximum).Maximum 
} else { 0 }

$successRate = ($successfulTests.Count / $TestIterations) * 100

# Performance assessment
Write-ColorOutput "`n" "White"
Write-ColorOutput "=" * 50 "Cyan"
Write-ColorOutput "Performance Assessment Results" "Cyan"
Write-ColorOutput "=" * 50 "Cyan"

Write-ColorOutput "Success Rate: $successRate%" "Blue"
Write-ColorOutput "Average Response Time: $([math]::Round($avgResponseTime, 2)) ms" "Blue"
Write-ColorOutput "Minimum Response Time: $minResponseTime ms" "Blue"
Write-ColorOutput "Maximum Response Time: $maxResponseTime ms" "Blue"

# Performance rating
$performanceRating = switch ($avgResponseTime) {
    {$_ -le 500} { "Excellent (Fast)" }
    {$_ -le 1000} { "Good (Acceptable)" }
    {$_ -le 2000} { "Fair (Slow)" }
    {$_ -le 5000} { "Poor (Very Slow)" }
    default { "Critical (Timeout)" }
}

Write-ColorOutput "Performance Rating: $performanceRating" "Blue"

# Security vs Performance Analysis
Write-ColorOutput "`nSecurity vs Performance Analysis:" "Yellow"
if ($avgResponseTime -le 1000 -and $successRate -ge 95) {
    Write-ColorOutput "  [EXCELLENT] Security measures have minimal performance impact" "Green"
} elseif ($avgResponseTime -le 2000 -and $successRate -ge 90) {
    Write-ColorOutput "  [GOOD] Security measures have acceptable performance impact" "Green"
} elseif ($avgResponseTime -le 5000 -and $successRate -ge 80) {
    Write-ColorOutput "  [FAIR] Security measures have moderate performance impact" "Yellow"
} else {
    Write-ColorOutput "  [POOR] Security measures may be significantly impacting performance" "Red"
}

# Save results
$finalResults = @{
    "timestamp" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "target_url" = $TargetUrl
    "test_iterations" = $TestIterations
    "success_rate_percent" = $successRate
    "avg_response_time_ms" = [math]::Round($avgResponseTime, 2)
    "min_response_time_ms" = $minResponseTime
    "max_response_time_ms" = $maxResponseTime
    "performance_rating" = $performanceRating
    "detailed_results" = $performanceResults
}

$outputFile = "performance-assessment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
try {
    $finalResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $outputFile -Encoding UTF8
    Write-ColorOutput "`nPerformance report saved to: $outputFile" "Green"
} catch {
    Write-ColorOutput "`nReport save failed: $($_.Exception.Message)" "Red"
}

Write-ColorOutput "`nPerformance assessment completed!" "Green"
