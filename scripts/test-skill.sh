#!/bin/bash

# AgentEX Skill Testing Script
# Tests all skill endpoints and installation

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_BASE="${API_BASE:-$BASE_URL/api/agentex/v2}"
SKILL_INSTALL_API="${SKILL_INSTALL_API:-$BASE_URL/api/skill/install}"

echo "🧪 AgentEX Skill Testing"
echo "========================"
echo "Base URL: $BASE_URL"
echo "API Base: $API_BASE"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "  Response: $body"
        ((FAILED++))
        return 1
    fi
}

echo "1. Testing Installation API"
echo "----------------------------"

# Test installation API for all platforms
test_endpoint "Install API - All platforms" "GET" "$SKILL_INSTALL_API" "" 200
test_endpoint "Install API - Claude" "GET" "$SKILL_INSTALL_API?platform=claude" "" 200
test_endpoint "Install API - GPT" "GET" "$SKILL_INSTALL_API?platform=gpt" "" 200
test_endpoint "Install API - OpenClaw" "GET" "$SKILL_INSTALL_API?platform=openclaw" "" 200
test_endpoint "Install API - Python" "GET" "$SKILL_INSTALL_API?platform=python" "" 200
test_endpoint "Install API - TypeScript" "GET" "$SKILL_INSTALL_API?platform=typescript" "" 200

echo ""
echo "2. Testing Tool Discovery"
echo "------------------------"

# Test tool search
test_endpoint "Search Tools - All" "POST" "$API_BASE/tools/search" '{"query":""}' 200
test_endpoint "Search Tools - Email" "POST" "$API_BASE/tools/search" '{"query":"email"}' 200
test_endpoint "Search Tools - Category" "POST" "$API_BASE/tools/search" '{"category":"communication"}' 200

# Test get tool
test_endpoint "Get Tool - Resend Email" "GET" "$API_BASE/tools/tool-resend-email" "" 200

echo ""
echo "3. Testing Validation"
echo "---------------------"

# Test validation
VALIDATE_DATA='{
  "action": "validate",
  "name": "Test Agent",
  "description": "A test agent for validation",
  "brain": "claude-3-5-sonnet",
  "tools": ["tool-resend-email", "tool-web-search"]
}'

test_endpoint "Validate Agent" "POST" "$API_BASE/validate" "$VALIDATE_DATA" 200

echo ""
echo "4. Testing Code Generation"
echo "---------------------------"

# Test generation
GENERATE_DATA='{
  "name": "Test Agent",
  "description": "A test agent for code generation",
  "brain": "claude-3-5-sonnet",
  "tools": ["tool-resend-email"],
  "runtime": "vercel"
}'

test_endpoint "Generate Agent Code" "POST" "$API_BASE/generate" "$GENERATE_DATA" 200

# Extract build ID from response
BUILD_ID=$(curl -s -X POST -H "Content-Type: application/json" -d "$GENERATE_DATA" "$API_BASE/generate" | grep -o '"buildId":"[^"]*' | cut -d'"' -f4)

if [ -n "$BUILD_ID" ]; then
    echo "  Build ID: $BUILD_ID"
    
    echo ""
    echo "5. Testing Build Status"
    echo "-----------------------"
    
    # Test status check
    test_endpoint "Check Build Status" "GET" "$API_BASE/status/$BUILD_ID" "" 200
    
    # Wait a bit and check again
    echo "  Waiting 5 seconds for generation to progress..."
    sleep 5
    test_endpoint "Check Build Status (after wait)" "GET" "$API_BASE/status/$BUILD_ID" "" 200
else
    echo -e "${YELLOW}⚠ Could not extract build ID, skipping status tests${NC}"
fi

echo ""
echo "6. Testing Error Handling"
echo "-------------------------"

# Test invalid validation
test_endpoint "Validate - Missing Fields" "POST" "$API_BASE/validate" '{"action":"validate"}' 400
test_endpoint "Validate - Invalid Brain" "POST" "$API_BASE/validate" '{"name":"Test","description":"Test","brain":"invalid-brain","tools":[]}' 200

# Test invalid tool
test_endpoint "Get Tool - Invalid" "GET" "$API_BASE/tools/invalid-tool-id" "" 404

echo ""
echo "========================"
echo "Test Results"
echo "========================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
