#!/bin/bash

# Demo Setup Script for Realmind
# This script sets up the environment for the 2-minute MVP demo

echo "🎮 Setting up Realmind Demo Environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for environment variables
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local found. Creating template..."
    cat > .env.local << EOL
# Core Testnet2 Configuration
VITE_WALLET_CONNECT_PROJECT_ID="your_wallet_connect_project_id"
VITE_ENVIRONMENT="development"

# Contract Addresses (will be updated after deployment)
VITE_QUIZ_GAME_ADDRESS="0xc0ee7f9763f414d82c1b59441a6338999eafa80e"
VITE_TOKEN1_ADDRESS="0x7e9532d025b0d0c06e5913170d5271851b37cf39"

# Demo Configuration
VITE_DEMO_MODE="true"
VITE_AUTO_PLAY="false"
EOL
    echo "📝 Please update .env.local with your actual values"
fi

# Check smart contracts
echo "📋 Checking smart contracts..."
if [ -d "contracts" ]; then
    echo "✅ Smart contracts directory found"
    if [ -f "contracts/src/QuizDuel.sol" ] && [ -f "contracts/src/GuildSystem.sol" ] && [ -f "contracts/src/QuizNFT.sol" ]; then
        echo "✅ All demo contracts are present"
    else
        echo "⚠️  Some demo contracts are missing"
    fi
else
    echo "❌ Contracts directory not found"
fi

# Generate route tree
echo "🗺️  Generating route tree..."
pnpm run dev --silent & 
DEV_PID=$!
sleep 5
kill $DEV_PID 2>/dev/null

echo ""
echo "🎉 Demo setup complete!"
echo ""
echo "To start the demo:"
echo "1. pnpm run dev"
echo "2. Navigate to http://localhost:5173/demo"
echo "3. Connect your wallet to Core Testnet2"
echo "4. Click the 'Auto Play' button for automatic demo"
echo ""
echo "Demo Features:"
echo "✅ Solo Quiz with on-chain rewards"
echo "✅ PvP Duels with RedStone Oracle"
echo "✅ Guild System with treasury"
echo "✅ NFT Quiz creation and royalties"
echo "✅ All partner integrations mocked"
echo ""
echo "Happy demoing! 🚀"