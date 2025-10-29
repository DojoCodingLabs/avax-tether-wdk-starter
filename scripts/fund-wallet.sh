#!/bin/bash

# WDK Wallet Funding Script
# Usage: ./scripts/fund-wallet.sh <WALLET_ADDRESS>

set -e

if [ -z "$1" ]; then
  echo "❌ Error: No wallet address provided"
  echo ""
  echo "Usage:"
  echo "  yarn fund:local <WALLET_ADDRESS>"
  echo ""
  echo "Example:"
  echo "  yarn fund:local 0x63e52cE6af542950C148545baB7e46CcE84a63CC"
  echo ""
  echo "💡 Tip: Copy your WDK wallet address from http://localhost:3000/wallet"
  exit 1
fi

# Set the wallet address as an environment variable
export WDK_WALLET_ADDRESS="$1"

# Run the hardhat script
cd packages/hardhat
npx hardhat run scripts/fundWdkWallet.ts --network avalancheLocal

