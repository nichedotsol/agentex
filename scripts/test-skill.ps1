# AgentEX Skill Testing Script (PowerShell)
# Tests all skill endpoints and installation

$ErrorActionPreference = "Stop"

$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }
$API_BASE = "$BASE_URL/api/agentex/v2"
$SKILL_INSTALL_API = "$BASE_URL/api/skill/install"

Write-Host "🧪 AgentEX Skill Testing" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Base URL: $BASE_URL"
Write-Host "API Base: $API_BASE"
Write-Host ""

$PASSED = 0
$FAILED = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Data = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host -NoNewline "Testing $Name... "
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $Data -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        }
        
        $httpCode = $response.StatusCode
        
        if ($httpCode -eq $ExpectedStatus) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $httpCode)"
            $script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $httpCode, expected $ExpectedStatus)"
            Write-Host "  Response: $($response.Content)"
            $script:FAILED++
            return $false
        }
    } catch {
        $httpCode = $_.Exception.Response.StatusCode.value__
        if ($httpCode -eq $ExpectedStatus) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $httpCode)"
            $script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $httpCode, expected $ExpectedStatus)"
            Write-Host "  Error: $($_.Exception.Message)"
            $script:FAILED++
            return $false
        }
    }
}

Write-Host "1. Testing Installation API" -ForegroundColor Yellow
Write-Host "----------------------------"

Test-Endpoint "Install API - All platforms" "GET" "$SKILL_INSTALL_API"
Test-Endpoint "Install API - Claude" "GET" "$SKILL_INSTALL_API?platform=claude"
Test-Endpoint "Install API - GPT" "GET" "$SKILL_INSTALL_API?platform=gpt"
Test-Endpoint "Install API - OpenClaw" "GET" "$SKILL_INSTALL_API?platform=openclaw"
Test-Endpoint "Install API - Python" "GET" "$SKILL_INSTALL_API?platform=python"
Test-Endpoint "Install API - TypeScript" "GET" "$SKILL_INSTALL_API?platform=typescript"

Write-Host ""
Write-Host "2. Testing Tool Discovery" -ForegroundColor Yellow
Write-Host "------------------------"

$searchData = '{"query":""}'
Test-Endpoint "Search Tools - All" "POST" "$API_BASE/tools/search" $searchData

$emailSearch = '{"query":"email"}'
Test-Endpoint "Search Tools - Email" "POST" "$API_BASE/tools/search" $emailSearch

$categorySearch = '{"category":"communication"}'
Test-Endpoint "Search Tools - Category" "POST" "$API_BASE/tools/search" $categorySearch

Test-Endpoint "Get Tool - Resend Email" "GET" "$API_BASE/tools/tool-resend-email"

Write-Host ""
Write-Host "3. Testing Validation" -ForegroundColor Yellow
Write-Host "---------------------"

$validateData = @{
    action = "validate"
    name = "Test Agent"
    description = "A test agent for validation"
    brain = "claude-3-5-sonnet"
    tools = @("tool-resend-email", "tool-web-search")
} | ConvertTo-Json

Test-Endpoint "Validate Agent" "POST" "$API_BASE/validate" $validateData

Write-Host ""
Write-Host "4. Testing Code Generation" -ForegroundColor Yellow
Write-Host "---------------------------"

$generateData = @{
    name = "Test Agent"
    description = "A test agent for code generation"
    brain = "claude-3-5-sonnet"
    tools = @("tool-resend-email")
    runtime = "vercel"
} | ConvertTo-Json

try {
    $generateResponse = Invoke-WebRequest -Uri "$API_BASE/generate" -Method POST -Body $generateData -ContentType "application/json" -UseBasicParsing
    $generateResult = $generateResponse.Content | ConvertFrom-Json
    $BUILD_ID = $generateResult.buildId
    
    Write-Host "✓ Generate Agent Code" -ForegroundColor Green -NoNewline
    Write-Host " (HTTP $($generateResponse.StatusCode))"
    Write-Host "  Build ID: $BUILD_ID"
    $script:PASSED++
    
    Write-Host ""
    Write-Host "5. Testing Build Status" -ForegroundColor Yellow
    Write-Host "-----------------------"
    
    Test-Endpoint "Check Build Status" "GET" "$API_BASE/status/$BUILD_ID"
    
    Write-Host "  Waiting 5 seconds for generation to progress..."
    Start-Sleep -Seconds 5
    
    Test-Endpoint "Check Build Status (after wait)" "GET" "$API_BASE/status/$BUILD_ID"
} catch {
    Write-Host "✗ Generate Agent Code" -ForegroundColor Red -NoNewline
    Write-Host " (Error: $($_.Exception.Message))"
    $script:FAILED++
}

Write-Host ""
Write-Host "6. Testing Error Handling" -ForegroundColor Yellow
Write-Host "-------------------------"

$invalidValidate = '{"action":"validate"}'
Test-Endpoint "Validate - Missing Fields" "POST" "$API_BASE/validate" $invalidValidate 400

$invalidBrain = @{
    name = "Test"
    description = "Test"
    brain = "invalid-brain"
    tools = @()
} | ConvertTo-Json
Test-Endpoint "Validate - Invalid Brain" "POST" "$API_BASE/validate" $invalidBrain 200

try {
    Invoke-WebRequest -Uri "$API_BASE/tools/invalid-tool-id" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ Get Tool - Invalid" -ForegroundColor Red -NoNewline
    Write-Host " (Expected 404)"
    $script:FAILED++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ Get Tool - Invalid" -ForegroundColor Green -NoNewline
        Write-Host " (HTTP 404)"
        $script:PASSED++
    } else {
        Write-Host "✗ Get Tool - Invalid" -ForegroundColor Red -NoNewline
        Write-Host " (Unexpected error)"
        $script:FAILED++
    }
}

Write-Host ""
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}
