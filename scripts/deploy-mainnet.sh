#!/bin/bash

# Mainnet Deployment Script for ICP VR Marketplace
# This script deploys to the Internet Computer mainnet

set -e

echo "🚀 Deploying ICP VR Marketplace to Internet Computer Mainnet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}❌ dfx is not installed. Please install dfx first.${NC}"
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

# Step 1: Check identity and wallet
echo -e "${YELLOW}Step 1: Verifying identity and wallet...${NC}"

IDENTITY=$(dfx identity whoami)
echo "Current identity: $IDENTITY"

# Check if wallet exists
if ! dfx wallet balance --network ic &> /dev/null; then
    echo -e "${RED}❌ No wallet found or insufficient cycles.${NC}"
    echo "Please ensure you have:"
    echo "1. Created a wallet: dfx identity deploy-wallet --network ic"
    echo "2. Added cycles to your wallet"
    echo "3. Set up your identity: dfx identity use <your-identity>"
    exit 1
fi

BALANCE=$(dfx wallet balance --network ic)
echo "Wallet balance: $BALANCE"

# Step 2: Confirm deployment
echo -e "${YELLOW}⚠️  MAINNET DEPLOYMENT CONFIRMATION${NC}"
echo "This will deploy to the Internet Computer mainnet and consume cycles."
echo "Identity: $IDENTITY"
echo "Wallet: $BALANCE"
echo ""
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Step 3: Build optimized frontend
echo -e "${YELLOW}Step 2: Building optimized frontend...${NC}"
cd frontend
npm ci --production
npm run build
cd ..

# Step 4: Deploy canisters to mainnet
echo -e "${YELLOW}Step 3: Deploying backend canisters to IC mainnet...${NC}"

echo "📦 Deploying Users canister..."
dfx deploy users --network ic --argument '()'

echo "📦 Deploying Assets canister..."
dfx deploy assets --network ic --argument '()'

echo "📦 Deploying Marketplace canister..."
dfx deploy marketplace --network ic --argument '()'

# Step 5: Generate declarations for mainnet
echo -e "${YELLOW}Step 4: Generating mainnet type declarations...${NC}"
dfx generate --network ic

# Step 6: Rebuild frontend with mainnet canister IDs
echo -e "${YELLOW}Step 5: Rebuilding frontend with mainnet canister IDs...${NC}"
cd frontend
npm run build
cd ..

# Step 7: Deploy frontend to mainnet
echo -e "${YELLOW}Step 6: Deploying frontend to IC mainnet...${NC}"
dfx deploy frontend --network ic

# Step 8: Show deployment results
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo ""
echo -e "${BLUE}🌐 Production URLs:${NC}"
FRONTEND_ID=$(dfx canister id frontend --network ic)
USERS_ID=$(dfx canister id users --network ic)
ASSETS_ID=$(dfx canister id assets --network ic)
MARKETPLACE_ID=$(dfx canister id marketplace --network ic)

echo "🔗 VR Marketplace: https://$FRONTEND_ID.ic0.app"
echo "🔗 Alternative: https://$FRONTEND_ID.icp0.io"
echo ""
echo -e "${BLUE}📊 Canister Information:${NC}"
echo "Users Canister: $USERS_ID"
echo "Assets Canister: $ASSETS_ID"
echo "Marketplace Canister: $MARKETPLACE_ID"
echo "Frontend Canister: $FRONTEND_ID"
echo ""
echo -e "${BLUE}🔍 Canister URLs:${NC}"
echo "Users API: https://$USERS_ID.ic0.app"
echo "Assets API: https://$ASSETS_ID.ic0.app"
echo "Marketplace API: https://$MARKETPLACE_ID.ic0.app"
echo ""

# Step 9: Check final wallet balance
FINAL_BALANCE=$(dfx wallet balance --network ic)
echo -e "${BLUE}💰 Remaining Cycles: $FINAL_BALANCE${NC}"
echo ""

# Step 10: Create deployment summary
cat > deployment-summary.md << EOL
# ICP VR Marketplace - Deployment Summary

**Project**: ICP VR Marketplace  
**Team**: Benjamin Owolabi & Edozie Obidile  
**Competition**: WCHL 2025 - Fully On-Chain Track  
**Deployment Date**: $(date)

## 🌐 Live Application
- **Main URL**: https://$FRONTEND_ID.ic0.app
- **Alternative URL**: https://$FRONTEND_ID.icp0.io

## 📊 Canister Details
| Canister | ID | URL |
|----------|----|----|
| Frontend | $FRONTEND_ID | https://$FRONTEND_ID.ic0.app |
| Users | $USERS_ID | https://$USERS_ID.ic0.app |
| Assets | $ASSETS_ID | https://$ASSETS_ID.ic0.app |
| Marketplace | $MARKETPLACE_ID | https://$MARKETPLACE_ID.ic0.app |

## 🎯 Key Features
- ✅ Fully decentralized VR asset marketplace
- ✅ Internet Identity authentication
- ✅ Asset upload and management
- ✅ Buying and selling with ICP tokens
- ✅ Creator dashboard and analytics
- ✅ Search and filtering
- ✅ Mobile-responsive design

## 🛠️ Technology Stack
- **Backend**: Motoko canisters on Internet Computer
- **Frontend**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Internet Identity
- **Storage**: Fully on-chain

## 🏆 WCHL 2025 Submission
This project represents a complete, functional VR marketplace built entirely on the Internet Computer Protocol, demonstrating true decentralization and blockchain-based asset ownership.

Deployed on: $(date)
EOL

echo -e "${GREEN}📄 Deployment summary saved to: deployment-summary.md${NC}"
echo ""
echo -e "${YELLOW}🎯 WCHL 2025 Submission Ready!${NC}"
echo "Your VR Marketplace is now live on the Internet Computer mainnet."
echo ""
echo -e "${BLUE}📋 For WCHL submission, include:${NC}"
echo "• Live demo URL: https://$FRONTEND_ID.ic0.app"
echo "• GitHub repository with this code"
echo "• Demo video showing functionality"
echo "• deployment-summary.md file"
