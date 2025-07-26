# 🏆 ICP VR Marketplace - WCHL 2025 Submission

> **The Future of VR Asset Trading - Built on Internet Computer Protocol**

[![WCHL 2025](https://img.shields.io/badge/WCHL-2025-blue.svg)](https://wchl.xyz)
[![Track](https://img.shields.io/badge/Track-Fully%20On--Chain-green.svg)](#)
[![ICP](https://img.shields.io/badge/Built%20on-Internet%20Computer-orange.svg)](https://internetcomputer.org)

## 🎯 Project Overview

ICP VR Marketplace is a fully decentralized marketplace for VR assets built entirely on the Internet Computer Protocol. It enables creators to upload, sell, and monetize their VR content while providing buyers with true blockchain ownership of digital assets.

**Team**: Benjamin Owolabi & Edozie Obidile  
**Competition**: WCHL 2025 - Fully On-Chain Track  
**Build Time**: 24 hours  

## ✨ Key Features

### 🎨 **For Creators**
- **Asset Upload & Management** - Upload VR environments, characters, objects, animations
- **Creator Dashboard** - Real-time analytics, earnings tracking, asset performance
- **Fair Revenue Model** - Keep 97.5% of sales (only 2.5% marketplace fee)
- **Global Reach** - Sell to anyone, anywhere, without geographical restrictions

### 🛒 **For Buyers**
- **Discover VR Content** - Browse thousands of VR assets by category
- **Advanced Search** - Filter by price, platform compatibility, file format
- **True Ownership** - Blockchain-verified ownership of purchased assets
- **Secure Transactions** - Buy with ICP tokens using Internet Identity

### 🔧 **Technical Innovation**
- **100% On-Chain** - All data stored on Internet Computer blockchain
- **Internet Identity** - Web3-native authentication without passwords
- **Smart Contracts** - Automated transactions and royalty distribution
- **Cross-Platform** - Support for all major VR platforms (Quest, Vive, Index, etc.)

## 🏗️ Architecture

### Backend (Motoko Canisters)

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ Users │ │ Assets │ │ Marketplace │ │ Canister │ │ Canister │ │ Canister │ │ │ │ │ │ │ │ • Profiles │ │ • VR Assets │ │ • Listings │ │ • Auth │ │ • Metadata │ │ • Purchases │ │ • Stats │ │ • Ownership │ │ • Analytics │ └─────────────┘ └─────────────┘ └─────────────┘


### Frontend (Next.js + React)

┌─────────────────────────────────────────────────┐ │ Frontend App │ ├─────────────┬─────────────┬─────────────────────┤ │ Pages │ Components │ Services │ │ │ │ │ │ • Homepage │ • AssetCard │ • ICP Integration │ │ • Market │ • SearchBar │ • Authentication │ │ • Details │ • Dashboard │ • Data Management │ │ • Creator │ • Modals │ • Error Handling │ └─────────────┴─────────────┴─────────────────────┘


## 🚀 Quick Start

### Prerequisites
- [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) 16+
- [Git](https://git-scm.com/)

### 1. Setup Environment
```bash
# Clone the repository
git clone <repository-url>
cd icp-vr-marketplace

# Run setup script
./scripts/setup-env.sh

2. Local Development

bash

# Deploy locally for development
./scripts/deploy-local.sh

# Start frontend development server
cd frontend
npm run dev

3. WCHL Demo

bash

# Quick demo setup for judges
./scripts/demo-wchl.sh

4. Mainnet Deployment

bash

# Deploy to Internet Computer mainnet
./scripts/deploy-mainnet.sh

