# EXQ Studio Comprehensive Security Assessment v3.0
# =================================================

param(
    [string]$TargetUrl = "https://exqstudio.cn",
    [string]$OutputFile = "security-assessment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
)

# Color output function
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

# Security test results
$SecurityResults = @{
    "timestamp" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "target_url" = $TargetUrl
    "tests" = @{}
    "overall_score" = 0
    "recommendations" = @()
}

Write-ColorOutput "EXQ Studio Comprehensive Security Assessment" "Cyan"
Write-ColorOutput "Target URL: $TargetUrl" "Blue"
Write-ColorOutput "Assessment Time: $(Get-Date)" "Blue"
Write-ColorOutput "=" * 60 "Cyan"

# 1. Website Connectivity Test
Write-ColorOutput "`n1. Website Connectivity Test..." "Yellow"
try {
    $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-ColorOutput "   [PASS] Website accessible (HTTP $($response.StatusCode))" "Green"
        $SecurityResults.tests["connectivity"] = @{ 
            "status" = "pass"
            "score" = 10
            "details" = "HTTP $($response.StatusCode)"
        }
    }
} catch {
    Write-ColorOutput "   [FAIL] Website access failed: $($_.Exception.Message)" "Red"
    $SecurityResults.tests["connectivity"] = @{ 
        "status" = "fail"
        "score" = 0
        "details" = $_.Exception.Message
    }
}

# 2. HTTPS Redirect Check
Write-ColorOutput "`n2. HTTPS Security Check..." "Yellow"
try {
    $httpUrl = $TargetUrl -replace "https://", "http://"
    $httpResponse = Invoke-WebRequest -Uri $httpUrl -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
    
    if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
        $location = $httpResponse.Headers["Location"]
        if ($location -and $location.StartsWith("https://")) {
            Write-ColorOutput "   [PASS] HTTPS redirect enabled" "Green"
            $SecurityResults.tests["https_redirect"] = @{ 
                "status" = "pass"
                "score" = 15
                "details" = "HTTP $($httpResponse.StatusCode) -> HTTPS"
            }
        }
    }
} catch {
    Write-ColorOutput "   [WARN] HTTPS redirect check failed" "Yellow"
    $SecurityResults.tests["https_redirect"] = @{ 
        "status" = "warning"
        "score" = 5
        "details" = "Cannot verify redirect"
    }
}

# 3. Security Headers Check
Write-ColorOutput "`n3. Security Headers Check..." "Yellow"
$securityHeaders = @{
    "Strict-Transport-Security" = 15
    "X-Frame-Options" = 10
    "X-Content-Type-Options" = 10
    "X-XSS-Protection" = 10
    "Content-Security-Policy" = 15
    "Referrer-Policy" = 5
}

$headerScore = 0
$headerResults = @{}

try {
    $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 10
      foreach ($headerName in $securityHeaders.Keys) {
        if ($response.Headers[$headerName]) {
            Write-ColorOutput "   [PASS] $headerName`: Present" "Green"
            $headerScore += $securityHeaders[$headerName]
            $headerResults[$headerName] = @{ 
                "present" = $true
                "value" = $response.Headers[$headerName]
            }
        } else {
            Write-ColorOutput "   [FAIL] $headerName`: Missing" "Red"
            $headerResults[$headerName] = @{ 
                "present" = $false
                "value" = $null
            }
            $SecurityResults.recommendations += "Add $headerName security header"
        }
    }
    
    $SecurityResults.tests["security_headers"] = @{ 
        "status" = if ($headerScore -gt 40) { "pass" } elseif ($headerScore -gt 20) { "warning" } else { "fail" }
        "score" = $headerScore
        "details" = $headerResults
    }
    
} catch {
    Write-ColorOutput "   [FAIL] Security headers check failed: $($_.Exception.Message)" "Red"
    $SecurityResults.tests["security_headers"] = @{ 
        "status" = "fail"
        "score" = 0
        "details" = $_.Exception.Message
    }
}

# 4. Sensitive Files Protection Check
Write-ColorOutput "`n4. Sensitive Files Protection Check..." "Yellow"
$sensitiveFiles = @(".htaccess", "config.php", "wp-config.php", ".env", ".git/config")
$protectionScore = 0

foreach ($file in $sensitiveFiles) {
    try {
        $testUrl = "$TargetUrl/$file"
        $fileResponse = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        if ($fileResponse.StatusCode -eq 403 -or $fileResponse.StatusCode -eq 404) {
            Write-ColorOutput "   [PASS] $file protected (HTTP $($fileResponse.StatusCode))" "Green"
            $protectionScore += 4
        } else {
            Write-ColorOutput "   [FAIL] $file accessible (HTTP $($fileResponse.StatusCode))" "Red"
            $SecurityResults.recommendations += "Protect sensitive file $file"
        }
    } catch {
        Write-ColorOutput "   [PASS] $file protected (connection refused)" "Green"
        $protectionScore += 4
    }
}

$SecurityResults.tests["file_protection"] = @{ 
    "status" = if ($protectionScore -gt 15) { "pass" } else { "warning" }
    "score" = $protectionScore
    "details" = "Checked $($sensitiveFiles.Count) sensitive files"
}

# 5. SSL/TLS Configuration Check
Write-ColorOutput "`n5. SSL/TLS Configuration Check..." "Yellow"
try {
    # Check SSL certificate
    $uri = [System.Uri]$TargetUrl
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($uri.Host, 443)
    
    $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
    $sslStream.AuthenticateAsClient($uri.Host)
    
    $cert = $sslStream.RemoteCertificate
    $certExpiry = [System.DateTime]::Parse($cert.GetExpirationDateString())
    $daysUntilExpiry = ($certExpiry - (Get-Date)).Days
    
    if ($daysUntilExpiry -gt 30) {
        Write-ColorOutput "   [PASS] SSL certificate valid, $daysUntilExpiry days remaining" "Green"
        $sslScore = 15
    } elseif ($daysUntilExpiry -gt 0) {
        Write-ColorOutput "   [WARN] SSL certificate expiring soon, $daysUntilExpiry days remaining" "Yellow"
        $sslScore = 10
        $SecurityResults.recommendations += "SSL certificate expiring soon, renew certificate"
    } else {
        Write-ColorOutput "   [FAIL] SSL certificate expired" "Red"
        $sslScore = 0
        $SecurityResults.recommendations += "SSL certificate expired, immediate renewal required"
    }
    
    $sslStream.Close()
    $tcpClient.Close()
    
    $SecurityResults.tests["ssl_tls"] = @{ 
        "status" = if ($sslScore -gt 10) { "pass" } else { "fail" }
        "score" = $sslScore
        "details" = "Certificate valid for $daysUntilExpiry days"
    }
    
} catch {
    Write-ColorOutput "   [FAIL] SSL/TLS check failed: $($_.Exception.Message)" "Red"
    $SecurityResults.tests["ssl_tls"] = @{ 
        "status" = "fail"
        "score" = 0
        "details" = $_.Exception.Message
    }
}

# Calculate total score
$totalScore = 0
foreach ($test in $SecurityResults.tests.Values) {
    $totalScore += $test.score
}

$SecurityResults.overall_score = $totalScore

# Security level assessment
$securityLevel = switch ($totalScore) {
    {$_ -ge 85} { "Excellent" }
    {$_ -ge 70} { "Good" }
    {$_ -ge 50} { "Fair" }
    {$_ -ge 30} { "Poor" }
    default { "Critical" }
}

# Output results
Write-ColorOutput "`n" "White"
Write-ColorOutput "=" * 60 "Cyan"
Write-ColorOutput "Security Assessment Results" "Cyan"
Write-ColorOutput "=" * 60 "Cyan"
Write-ColorOutput "Total Score: $totalScore/100" "Blue"
Write-ColorOutput "Security Level: $securityLevel" "Blue"
Write-ColorOutput "Assessment Time: $(Get-Date)" "Blue"

if ($SecurityResults.recommendations.Count -gt 0) {
    Write-ColorOutput "`nRecommendations:" "Yellow"
    foreach ($recommendation in $SecurityResults.recommendations) {
        Write-ColorOutput "  - $recommendation" "Yellow"
    }
}

# Save results to file
try {
    $SecurityResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-ColorOutput "`nDetailed report saved to: $OutputFile" "Green"
} catch {
    Write-ColorOutput "`nReport save failed: $($_.Exception.Message)" "Red"
}

Write-ColorOutput "`nSecurity assessment completed!" "Green"
