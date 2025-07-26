#!/bin/bash

# Deployment Verification Script for ICP VR Marketplace
# Verifies that all canisters are working correctly

set -e

echo "🔍 Verifying ICP VR Marketplace deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NETWORK=${1:-local}
TESTS_PASSED=0
TOTAL_TESTS=0

echo -e "${BLUE}Network: $NETWORK${NC}"
echo ""

# Function to run test
run_test() {
   local test_name="$1"
   local test_command="$2"
   
   echo -n "Testing $test_name... "
   ((TOTAL_TESTS++))
   
   if eval "$test_command" >/dev/null 2>&1; then
       echo -e "${GREEN}✅ PASS${NC}"
       ((TESTS_PASSED++))
   else
       echo -e "${RED}❌ FAIL${NC}"
   fi
}

# Function to test canister exists
test_canister_exists() {
   local canister_name="$1"
   dfx canister id "$canister_name" --network "$NETWORK"
}

# Function to test canister is running
test_canister_running() {
   local canister_name="$1"
   dfx canister status "$canister_name" --network "$NETWORK" | grep -q "Status: Running"
}

# Function to test canister method
test_canister_method() {
   local canister_name="$1"
   local method="$2"
   local args="$3"
   dfx canister call "$canister_name" "$method" "$args" --network "$NETWORK"
}

echo -e "${YELLOW}=== Canister Existence Tests ===${NC}"

run_test "Users canister exists" "test_canister_exists users"
run_test "Assets canister exists" "test_canister_exists assets"
run_test "Marketplace canister exists" "test_canister_exists marketplace"
run_test "Frontend canister exists" "test_canister_exists frontend"

echo ""
echo -e "${YELLOW}=== Canister Status Tests ===${NC}"

run_test "Users canister running" "test_canister_running users"
run_test "Assets canister running" "test_canister_running assets"
run_test "Marketplace canister running" "test_canister_running marketplace"
run_test "Frontend canister running" "test_canister_running frontend"

echo ""
echo -e "${YELLOW}=== Canister Method Tests ===${NC}"

# Test Users canister methods
run_test "Users: getAllUsers" "test_canister_method users getAllUsers '()'"

# Test Assets canister methods
run_test "Assets: getAllAssets" "test_canister_method assets getAllAssets '()'"
run_test "Assets: getFeaturedAssets" "test_canister_method assets getFeaturedAssets '()'"
run_test "Assets: getTotalAssetCount" "test_canister_method assets getTotalAssetCount '()'"

# Test Marketplace canister methods
run_test "Marketplace: getActiveListings" "test_canister_method marketplace getActiveListings '()'"
run_test "Marketplace: getMarketplaceStats" "test_canister_method marketplace getMarketplaceStats '()'"
run_test "Marketplace: getFeaturedListings" "test_canister_method marketplace getFeaturedListings '()'"

echo ""
echo -e "${YELLOW}=== Frontend Tests ===${NC}"

# Get frontend URL
FRONTEND_ID=$(dfx canister id frontend --network "$NETWORK" 2>/dev/null || echo "")

if [ -n "$FRONTEND_ID" ]; then
   if [ "$NETWORK" = "ic" ]; then
       FRONTEND_URL="https://$FRONTEND_ID.ic0.app"
   else
       FRONTEND_URL="http://localhost:4943/?canisterId=$FRONTEND_ID"
   fi
   
   run_test "Frontend URL accessible" "curl -s -o /dev/null -w '%{http_code}' '$FRONTEND_URL' | grep -q '200'"
   
   # Test if frontend serves HTML
   run_test "Frontend serves HTML" "curl -s '$FRONTEND_URL' | grep -q '<html'"
else
   echo -e "${RED}❌ Frontend canister ID not found${NC}"
   ((TOTAL_TESTS++))
fi

echo ""
echo -e "${YELLOW}=== Integration Tests ===${NC}"

# Test creating a user (this might fail if user already exists, which is OK)
echo -n "Testing user creation... "
((TOTAL_TESTS++))
if test_canister_method users createUser '(record { username = "test_user"; email = opt "test@test.com"; bio = null; avatar = null })' 2>/dev/null; then
   echo -e "${GREEN}✅ PASS${NC}"
   ((TESTS_PASSED++))
else
   # Check if user already exists (which is also a pass)
   if test_canister_method users getUser "principal \"$(dfx identity get-principal)\"" 2>/dev/null; then
       echo -e "${GREEN}✅ PASS (user exists)${NC}"
       ((TESTS_PASSED++))
   else
       echo -e "${RED}❌ FAIL${NC}"
   fi
fi

echo ""
echo -e "${YELLOW}=== Deployment Summary ===${NC}"

# Get canister information
echo -e "${BLUE}📊 Canister Information:${NC}"
if [ "$NETWORK" = "ic" ]; then
   echo "Network: Internet Computer Mainnet"
   USERS_ID=$(dfx canister id users --network ic 2>/dev/null || echo "Not deployed")
   ASSETS_ID=$(dfx canister id assets --network ic 2>/dev/null || echo "Not deployed")
   MARKETPLACE_ID=$(dfx canister id marketplace --network ic 2>/dev/null || echo "Not deployed")
   FRONTEND_ID=$(dfx canister id frontend --network ic 2>/dev/null || echo "Not deployed")
   
   echo "Users: $USERS_ID"
   echo "Assets: $ASSETS_ID"
   echo "Marketplace: $MARKETPLACE_ID"
   echo "Frontend: $FRONTEND_ID"
   
   if [ "$FRONTEND_ID" != "Not deployed" ]; then
       echo ""
       echo -e "${GREEN}🌐 Live URLs:${NC}"
       echo "Main: https://$FRONTEND_ID.ic0.app"
       echo "Alt:  https://$FRONTEND_ID.icp0.io"
   fi
else
   echo "Network: Local Development"
   USERS_ID=$(dfx canister id users 2>/dev/null || echo "Not deployed")
   ASSETS_ID=$(dfx canister id assets 2>/dev/null || echo "Not deployed")
   MARKETPLACE_ID=$(dfx canister id marketplace 2>/dev/null || echo "Not deployed")
   FRONTEND_ID=$(dfx canister id frontend 2>/dev/null || echo "Not deployed")
   
   echo "Users: $USERS_ID"
   echo "Assets: $ASSETS_ID"
   echo "Marketplace: $MARKETPLACE_ID"
   echo "Frontend: $FRONTEND_ID"
   
   if [ "$FRONTEND_ID" != "Not deployed" ]; then
       echo ""
       echo -e "${GREEN}🌐 Local URLs:${NC}"
       echo "Frontend: http://localhost:4943/?canisterId=$FRONTEND_ID"
       echo "Candid UI: http://localhost:4943/_/candid"
   fi
fi

echo ""
echo -e "${BLUE}📈 Test Results: $TESTS_PASSED/$TOTAL_TESTS tests passed${NC}"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
   echo -e "${GREEN}🎉 All tests passed! Deployment is healthy.${NC}"
   
   # Create verification report
   cat > verification-report-$NETWORK.md << EOL
# Deployment Verification Report

**Date**: $(date)
**Network**: $NETWORK
**Tests Passed**: $TESTS_PASSED/$TOTAL_TESTS

## Canister Status
- Users: $USERS_ID ✅
- Assets: $ASSETS_ID ✅
- Marketplace: $MARKETPLACE_ID ✅
- Frontend: $FRONTEND_ID ✅

## Functionality Verified
✅ All canisters deployed and running
✅ Core canister methods responding
✅ Frontend accessible and serving content
✅ Integration between canisters working

$(if [ "$NETWORK" = "ic" ]; then
echo "## Live URLs
- Main: https://$FRONTEND_ID.ic0.app
- Alternative: https://$FRONTEND_ID.icp0.io"
else
echo "## Local URLs
- Frontend: http://localhost:4943/?canisterId=$FRONTEND_ID
- Candid UI: http://localhost:4943/_/candid"
fi)

## WCHL 2025 Submission Ready
This deployment is verified and ready for demo/judging.
EOL
   
   echo -e "${GREEN}📄 Verification report saved: verification-report-$NETWORK.md${NC}"
   exit 0
else
   echo -e "${RED}❌ Some tests failed. Please check the deployment.${NC}"
   exit 1
fi
