#!/bin/bash

# Local Development Deployment Script for ICP VR Marketplace
# This script sets up the local development environment

set -e

echo "🚀 Starting local ICP development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}❌ dfx is not installed. Please install dfx first:${NC}"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    echo -e "${RED}❌ dfx.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Project: ICP VR Marketplace${NC}"
echo -e "${BLUE}👥 Team: Benjamin Owolabi & Edozie Obidile${NC}"
echo -e "${BLUE}🏆 WCHL 2025 - Fully On-Chain Track${NC}"
echo ""

# Step 1: Start dfx
echo -e "${YELLOW}Step 1: Starting local Internet Computer replica...${NC}"
dfx start --clean --background

# Wait for dfx to be ready
echo "⏳ Waiting for local replica to be ready..."
sleep 5

# Step 2: Deploy canisters
echo -e "${YELLOW}Step 2: Deploying backend canisters...${NC}"

echo "📦 Deploying Users canister..."
dfx deploy users --argument '()'

echo "📦 Deploying Assets canister..."
dfx deploy assets --argument '()'

echo "📦 Deploying Marketplace canister..."
dfx deploy marketplace --argument '()'

# Step 3: Install frontend dependencies
echo -e "${YELLOW}Step 3: Installing frontend dependencies...${NC}"
cd frontend
npm install

# Step 4: Generate type declarations
echo -e "${YELLOW}Step 4: Generating type declarations...${NC}"
cd ..
dfx generate

# Step 5: Build frontend
echo -e "${YELLOW}Step 5: Building frontend...${NC}"
cd frontend
npm run build

# Step 6: Deploy frontend
echo -e "${YELLOW}Step 6: Deploying frontend canister...${NC}"
cd ..
dfx deploy frontend

# Step 7: Show deployment info
echo -e "${GREEN}✅ Local deployment complete!${NC}"
echo ""
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo "Frontend: http://localhost:4943/?canisterId=$(dfx canister id frontend)"
echo "Users Canister: http://localhost:4943/?canisterId=$(dfx canister id users)"
echo "Assets Canister: http://localhost:4943/?canisterId=$(dfx canister id assets)"
echo "Marketplace Canister: http://localhost:4943/?canisterId=$(dfx canister id marketplace)"
echo ""
echo -e "${BLUE}🔧 Canister IDs:${NC}"
echo "Users: $(dfx canister id users)"
echo "Assets: $(dfx canister id assets)"
echo "Marketplace: $(dfx canister id marketplace)"
echo "Frontend: $(dfx canister id frontend)"
echo ""
echo -e "${GREEN}🎉 Your VR Marketplace is ready for development!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Open your browser to the frontend URL above"
echo "2. Start developing: cd frontend && npm run dev"
echo "3. View logs: dfx logs"
echo "4. Stop replica: dfx stop"
echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo "• dfx deploy --network local    # Redeploy canisters"
echo "• dfx canister call users getCurrentUser '()'  # Test canister calls"
echo "• dfx wallet balance           # Check cycles balance"
