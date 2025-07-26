#!/bin/bash

# Environment Setup Script for ICP VR Marketplace
# Sets up development environment and dependencies

set -e

echo "🔧 Setting up ICP VR Marketplace development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Project: ICP VR Marketplace${NC}"
echo -e "${BLUE}👥 Team: Benjamin Owolabi & Edozie Obidile${NC}"
echo -e "${BLUE}🏆 WCHL 2025 - Fully On-Chain Track${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check and install dfx
echo -e "${YELLOW}Step 1: Checking dfx installation...${NC}"
if command_exists dfx; then
    DFX_VERSION=$(dfx --version)
    echo -e "${GREEN}✅ dfx is installed: $DFX_VERSION${NC}"
else
    echo -e "${YELLOW}📦 Installing dfx...${NC}"
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    export PATH="$HOME/bin:$PATH"
    if command_exists dfx; then
        echo -e "${GREEN}✅ dfx installed successfully${NC}"
    else
        echo -e "${RED}❌ dfx installation failed${NC}"
        exit 1
    fi
fi

# Step 2: Check Node.js
echo -e "${YELLOW}Step 2: Checking Node.js installation...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js is installed: $NODE_VERSION${NC}"
    
    # Check if version is 16 or higher
    NODE_MAJOR=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_MAJOR" -lt 16 ]; then
        echo -e "${YELLOW}⚠️  Node.js version 16+ recommended (current: $NODE_VERSION)${NC}"
    fi
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 16+ from: https://nodejs.org/"
    exit 1
fi

# Step 3: Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm is installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Step 4: Install project dependencies
echo -e "${YELLOW}Step 3: Installing project dependencies...${NC}"

# Install root dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Install frontend dependencies
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Step 5: Create .env files
echo -e "${YELLOW}Step 4: Setting up environment files...${NC}"

# Create frontend .env.local if it doesn't exist
if [ ! -f "frontend/.env.local" ] && [ -f "frontend/.env.local.example" ]; then
    echo "📝 Creating frontend/.env.local from example..."
    cp frontend/.env.local.example frontend/.env.local
    echo -e "${YELLOW}⚠️  Please update frontend/.env.local with your settings${NC}"
fi

# Step 6: Create necessary directories
echo -e "${YELLOW}Step 5: Creating project directories...${NC}"
mkdir -p frontend/public/demo-assets
mkdir -p frontend/declarations
mkdir -p demo/screenshots
mkdir -p docs

# Step 7: Verify dfx configuration
echo -e "${YELLOW}Step 6: Verifying dfx configuration...${NC}"
if [ -f "dfx.json" ]; then
    echo -e "${GREEN}✅ dfx.json found${NC}"
    
    # Check if dfx.json is valid
    if dfx start --dry-run >/dev/null 2>&1; then
        echo -e "${GREEN}✅ dfx.json is valid${NC}"
    else
        echo -e "${RED}❌ dfx.json has issues${NC}"
    fi
else
    echo -e "${RED}❌ dfx.json not found${NC}"
    exit 1
fi

# Step 8: Set up git hooks (optional)
echo -e "${YELLOW}Step 7: Setting up development tools...${NC}"
if [ -d ".git" ]; then
    # Create pre-commit hook for code formatting
    cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash
# Format frontend code before commit
if [ -d "frontend" ]; then
    cd frontend
    if command -v npm >/dev/null 2>&1; then
        npm run lint --silent || true
    fi
    cd ..
fi
HOOK
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Git hooks set up${NC}"
fi

# Step 9: Create useful aliases
echo -e "${YELLOW}Step 8: Creating useful development aliases...${NC}"
cat > dev-aliases.sh << 'ALIASES'
#!/bin/bash
# Development aliases for ICP VR Marketplace

# Deployment aliases
alias deploy-local='./scripts/deploy-local.sh'
alias deploy-mainnet='./scripts/deploy-mainnet.sh'

# Development aliases
alias start-replica='dfx start --clean --background'
alias stop-replica='dfx stop'
alias deploy-all='dfx deploy'
alias generate-types='dfx generate'

# Frontend aliases
alias frontend-dev='cd frontend && npm run dev'
alias frontend-build='cd frontend && npm run build'
alias frontend-lint='cd frontend && npm run lint'

# Canister interaction aliases
alias call-users='dfx canister call users'
alias call-assets='dfx canister call assets'
alias call-marketplace='dfx canister call marketplace'

# Utility aliases
alias check-cycles='dfx wallet balance'
alias view-logs='dfx logs'
alias canister-status='dfx canister status --all'

echo "Development aliases loaded! Use 'source dev-aliases.sh' to activate."
ALIASES

echo -e "${GREEN}📝 Development aliases created: dev-aliases.sh${NC}"

# Step 10: Final verification
echo -e "${YELLOW}Step 9: Final verification...${NC}"

CHECKS_PASSED=0
TOTAL_CHECKS=5

# Check dfx
if command_exists dfx; then
    echo -e "${GREEN}✅ dfx ready${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ dfx not ready${NC}"
fi

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✅ Node.js ready${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ Node.js not ready${NC}"
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✅ npm ready${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ npm not ready${NC}"
fi

# Check dfx.json
if [ -f "dfx.json" ]; then
    echo -e "${GREEN}✅ dfx.json present${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ dfx.json missing${NC}"
fi

# Check frontend
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅ Frontend configured${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ Frontend not configured${NC}"
fi

echo ""
echo -e "${BLUE}📊 Setup Status: $CHECKS_PASSED/$TOTAL_CHECKS checks passed${NC}"

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}🎉 Environment setup complete!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "1. Run local deployment: ./scripts/deploy-local.sh"
    echo "2. Start frontend development: cd frontend && npm run dev"
    echo "3. View development aliases: source dev-aliases.sh"
    echo ""
    echo -e "${YELLOW}💡 Useful commands:${NC}"
    echo "• ./scripts/deploy-local.sh     # Deploy locally"
    echo "• ./scripts/deploy-mainnet.sh   # Deploy to mainnet"
    echo "• source dev-aliases.sh         # Load development aliases"
    echo "• dfx start --background        # Start local replica"
    echo "• dfx stop                      # Stop local replica"
else
    echo -e "${RED}❌ Setup incomplete. Please resolve the issues above.${NC}"
    exit 1
fi
