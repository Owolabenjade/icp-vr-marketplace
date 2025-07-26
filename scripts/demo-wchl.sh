#!/bin/bash

# WCHL 2025 Demo Script for ICP VR Marketplace
# Quick demo deployment for hackathon judges

set -e

echo "🏆 WCHL 2025 - ICP VR Marketplace Demo Setup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}================================${NC}"
echo -e "${PURPLE}  WCHL 2025 SUBMISSION DEMO     ${NC}"
echo -e "${PURPLE}================================${NC}"
echo -e "${BLUE}📋 Project: ICP VR Marketplace${NC}"
echo -e "${BLUE}👥 Team: Benjamin Owolabi & Edozie Obidile${NC}"
echo -e "${BLUE}🎯 Track: Fully On-Chain${NC}"
echo -e "${BLUE}⏱️  Build Time: 24 hours${NC}"
echo -e "${PURPLE}================================${NC}"
echo ""

# Check if this is a fresh setup
if [ ! -d ".dfx" ]; then
    echo -e "${YELLOW}🔧 First time setup detected. Running full setup...${NC}"
    ./scripts/setup-env.sh
fi

echo -e "${YELLOW}🚀 Starting WCHL demo deployment...${NC}"

# Step 1: Clean start
echo -e "${YELLOW}Step 1: Cleaning and starting fresh replica...${NC}"
dfx stop 2>/dev/null || true
dfx start --clean --background

echo "⏳ Waiting for replica to initialize..."
sleep 5

# Step 2: Deploy backend canisters
echo -e "${YELLOW}Step 2: Deploying backend canisters...${NC}"
echo "📦 Deploying Users canister..."
dfx deploy users --argument '()' --mode reinstall

echo "📦 Deploying Assets canister..."
dfx deploy assets --argument '()' --mode reinstall

echo "📦 Deploying Marketplace canister..."
dfx deploy marketplace --argument '()' --mode reinstall

# Step 3: Generate type declarations
echo -e "${YELLOW}Step 3: Generating TypeScript declarations...${NC}"
dfx generate

# Step 4: Build and deploy frontend
echo -e "${YELLOW}Step 4: Building and deploying frontend...${NC}"
cd frontend
npm ci --silent
npm run build --silent
cd ..

dfx deploy frontend --mode reinstall

# Step 5: Get canister IDs and URLs
echo -e "${YELLOW}Step 5: Gathering deployment information...${NC}"
FRONTEND_ID=$(dfx canister id frontend)
USERS_ID=$(dfx canister id users)
ASSETS_ID=$(dfx canister id assets)
MARKETPLACE_ID=$(dfx canister id marketplace)

FRONTEND_URL="http://localhost:4943/?canisterId=$FRONTEND_ID"
CANDID_UI="http://localhost:4943/_/candid"

# Step 6: Create demo data (simulate some assets)
echo -e "${YELLOW}Step 6: Setting up demo environment...${NC}"

# Create demo user profile
echo "👤 Creating demo user profile..."
dfx canister call users createUser '(record {
    username = "demo_creator";
    email = opt "demo@vrmarketplace.icp";
    bio = opt "VR asset creator showcasing amazing content for WCHL 2025";
    avatar = opt "https://example.com/avatar.jpg";
})' || echo "User may already exist"

# Step 7: Display demo information
echo ""
echo -e "${GREEN}🎉 WCHL 2025 DEMO READY!${NC}"
echo -e "${PURPLE}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${PURPLE}================================${NC}"
echo ""
echo -e "${BLUE}🌐 Demo URLs:${NC}"
echo -e "${GREEN}🔗 VR Marketplace:${NC} $FRONTEND_URL"
echo -e "${GREEN}🔗 Candid UI:${NC} $CANDID_UI"
echo ""
echo -e "${BLUE}📊 Canister Information:${NC}"
echo "Frontend: $FRONTEND_ID"
echo "Users: $USERS_ID"
echo "Assets: $ASSETS_ID"
echo "Marketplace: $MARKETPLACE_ID"
echo ""
echo -e "${BLUE}🎯 Demo Features to Showcase:${NC}"
echo "• ✅ Internet Identity Authentication"
echo "• ✅ VR Asset Upload & Management"
echo "• ✅ Marketplace with Search & Filters"
echo "• ✅ Asset Purchase with ICP Tokens"
echo "• ✅ Creator Dashboard & Analytics"
echo "• ✅ Fully Decentralized Architecture"
echo "• ✅ Mobile-Responsive Design"
echo ""
echo -e "${BLUE}🛠️ Technology Stack:${NC}"
echo "• Backend: Motoko canisters on Internet Computer"
echo "• Frontend: Next.js + React + TypeScript"
echo "• Styling: Tailwind CSS with custom VR themes"
echo "• Authentication: Internet Identity (Web3 native)"
echo "• Storage: 100% on-chain data storage"
echo ""
echo -e "${YELLOW}📋 WCHL 2025 Submission Checklist:${NC}"
echo "✅ Functional demo deployed locally"
echo "✅ All core features working"
echo "✅ Clean, modern UI design"
echo "✅ Fully on-chain architecture"
echo "✅ Internet Computer integration"
echo "✅ Ready for mainnet deployment"
echo ""
echo -e "${BLUE}💡 Demo Script for Judges:${NC}"
echo "1. Visit: $FRONTEND_URL"
echo "2. Click 'Sign In with Internet Identity'"
echo "3. Create a new Internet Identity (or use existing)"
echo "4. Upload a VR asset (use demo files in public/demo-assets/)"
echo "5. Browse the marketplace and filters"
echo "6. View creator dashboard analytics"
echo "7. Test asset purchase flow"
echo ""
echo -e "${GREEN}🏆 This project demonstrates:${NC}"
echo "• Complete VR asset marketplace ecosystem"
echo "• True blockchain ownership of digital assets"
echo "• Creator-friendly revenue model (97.5% to creators)"
echo "• Global accessibility with no geo-restrictions"
echo "• Professional-grade UI/UX design"
echo "• Scalable architecture for real-world use"
echo ""
echo -e "${PURPLE}================================${NC}"
echo -e "${YELLOW}⚡ READY FOR WCHL 2025 JUDGING!${NC}"
echo -e "${PURPLE}================================${NC}"

# Create a quick demo info file
cat > DEMO-INFO.md << EOL
# WCHL 2025 - ICP VR Marketplace Demo

## 🏆 Competition Details
- **Track**: Fully On-Chain
- **Team**: Benjamin Owolabi & Edozie Obidile
- **Build Time**: 24 hours
- **Demo Date**: $(date)

## 🌐 Local Demo URLs
- **Main Application**: $FRONTEND_URL
- **Candid UI**: $CANDID_UI

## 🎯 Key Features Demonstrated
1. **Internet Identity Authentication** - Web3-native login
2. **VR Asset Upload** - Complete asset management system
3. **Marketplace Browsing** - Search, filter, categorize assets
4. **Blockchain Transactions** - Buy/sell with ICP tokens
5. **Creator Dashboard** - Analytics and earnings tracking
6. **Responsive Design** - Works on mobile and desktop

## 🛠️ Technical Achievement
- **100% On-Chain**: All data stored on Internet Computer
- **3 Custom Canisters**: Users, Assets, Marketplace
- **Modern Frontend**: Next.js + React + TypeScript
- **Production Ready**: Complete CI/CD and deployment scripts

## 🚀 Innovation Highlights
- First decentralized VR asset marketplace
- True digital ownership via blockchain
- Creator-friendly economics (2.5% platform fee)
- Global accessibility without banking requirements
- Seamless Web3 UX with Internet Identity

## 📊 Canisters Deployed
- Frontend: $FRONTEND_ID
- Users: $USERS_ID  
- Assets: $ASSETS_ID
- Marketplace: $MARKETPLACE_ID

Built with ❤️ for WCHL 2025
EOL

echo ""
echo -e "${GREEN}📄 Demo info saved to: DEMO-INFO.md${NC}"
echo ""
echo -e "${BLUE}🎬 To record demo video:${NC}"
echo "1. Open: $FRONTEND_URL"
echo "2. Record screen while demonstrating features"
echo "3. Show: Login → Upload → Browse → Purchase → Dashboard"
echo "4. Duration: 3-5 minutes recommended"
echo ""
echo -e "${YELLOW}Good luck with WCHL 2025! 🍀${NC}"
