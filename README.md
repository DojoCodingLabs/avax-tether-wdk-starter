<p align="center">
  <a href="https://dojocoding.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="docs/assets/banner-light.svg">
      <img alt="WDK Avalanche Starter by Dojo Coding: Avalanche dApps with a Tether WDK wallet" src="docs/assets/banner-light.svg" width="100%">
    </picture>
  </a>
</p>

# WDK Avalanche Starter

**A dApp starter for builders on Avalanche C-Chain: Hardhat contracts, a Next.js app and a Tether WDK wallet, from a local node to Mainnet.**

A fully integrated Avalanche C-Chain development starter built on Scaffold-ETH 2, powered by the [Tether Wallet Development Kit (WDK)](https://docs.wallet.tether.io/). This starter provides a complete development environment for building dApps on Avalanche Local, Fuji Testnet, and Mainnet.

[![License: MIT](https://img.shields.io/badge/license-MIT-FF7151?labelColor=201E3D)](LICENCE) [![Chain: Avalanche C-Chain](https://img.shields.io/badge/chain-Avalanche%20C--Chain-FF7151?labelColor=201E3D)](https://docs.avax.network) [![Node.js 20.18.3+](https://img.shields.io/badge/Node.js-20.18.3%2B-201E3D?labelColor=201E3D)](https://nodejs.org/en/download/)

[Get started](#quick-start) · [Commands](#available-commands) · [Docs](#documentation) · [Contribute](CONTRIBUTING.md) · [Report an issue](https://github.com/DojoCodingLabs/avax-tether-wdk-starter/issues/new)

## Features

- ✅ **WDK-First Architecture**: All blockchain interactions use WDK exclusively (no wagmi/viem/ethers for runtime operations)
- 🏔️ **Full Avalanche Support**: Local node, Fuji Testnet (43113), and Mainnet (43114)
- 🔐 **Secure Seed Management**: Encrypted seed phrase storage with IndexedDB and WebCrypto (AES-GCM)
- 🔄 **Network Switching**: Seamless switching between Local, Fuji, and Mainnet
- 💼 **Modern Wallet UI**: Beautiful wallet interface with seed export and lock/unlock features
- 🎯 **Auto-Unlock in Dev**: Automatically unlocks wallet in development mode for better DX
- 📝 **Smart Contract Tools**: Debug, deploy, and interact with contracts on all networks
- 🔥 **Hot Reload**: Frontend auto-adapts to smart contract changes
- 🧱 **Web3 Components**: Pre-built components for Address, Balance, and more

## Requirements

Before you begin, install the following:

- [Node.js (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn v3](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)
- **For Local Node:**
  - [Avalanche CLI](https://docs.avax.network/tooling/cli) (recommended)
  - OR [Docker](https://www.docker.com/get-started) (fallback)

### Installing Avalanche CLI

**macOS:**
```bash
brew install ava-labs/tap/avalanche-cli
```

**Linux:**
```bash
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
```

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Start Local Avalanche Node

```bash
yarn avalanche:up
```

This will start a local Avalanche C-Chain node at `http://127.0.0.1:9650/ext/bc/C/rpc` with Chain ID `1337`.

Check node status:
```bash
yarn avalanche:status
```

### 3. Deploy Smart Contracts

Deploy to local network:
```bash
yarn deploy:local
```

Deploy to Fuji testnet:
```bash
yarn deploy:fuji
```
> **Note**: For detailed testnet deployment instructions, see the [Deploying Smart Contracts to Testnet](#deploying-smart-contracts-to-testnet) section below.

Deploy to Mainnet (be careful!):
```bash
yarn deploy:mainnet
```
> **Warning**: Only deploy to mainnet after thorough testing on local and testnet environments.

### 4. Start Frontend

```bash
yarn start
```

Visit `http://localhost:3000` and navigate to the **Avalanche Wallet** page to create or import a wallet.

## Wallet Management

### Creating a Wallet

1. Go to `/wallet` page
2. Click "Create New Wallet"
3. **IMPORTANT**: Save your seed phrase securely offline
4. Check "I have securely saved my seed phrase"
5. Your wallet is now active!

### Importing a Wallet

1. Go to `/wallet` page
2. Click "Import Existing Wallet"
3. Enter your 12 or 24-word seed phrase
4. Your wallet will be restored

### Network Switching

- Use the network dropdown in the header or wallet page
- Switch between Local, Fuji Testnet, and Mainnet
- Your wallet persists across network switches

### Getting Testnet AVAX

To test your dApp on Fuji Testnet, you'll need testnet AVAX tokens. Here are the available faucets:

#### Official Avalanche Faucet
- **URL**: [https://build.avax.network/console/primary-network/faucet](https://build.avax.network/console/primary-network/faucet)
- **Requirements**: Have an Avax Builder Hub Account

#### Chainlink Faucet
- **URL**: [https://faucets.chain.link/fuji](https://faucets.chain.link/fuji)
- **Requirements**: GitHub or Google account
- **Amount**: Variable

#### QuickNode Faucet
- **URL**: [https://faucet.quicknode.com/avalanche/fuji](https://faucet.quicknode.com/avalanche/fuji)
- **Requirements**: 0.001 ETH on Ethereum Mainnet
- **Limit**: One drip per network every 12 hours

**Note**: Testnet AVAX has no monetary value and is only for testing purposes.

## Deploying Smart Contracts to Testnet

Follow these steps to deploy your smart contracts to Avalanche Fuji Testnet:

### Step 1: Export Private Key from WDK Wallet

1. Start the frontend application:
   ```bash
   yarn start
   ```
2. Navigate to `http://localhost:3000/wallet` in your browser
3. Make sure your wallet is unlocked (create one if you haven't already)
4. Click the **"Show Private Key"** button
5. Read the warning message and click **"Show Private Key"** to confirm
6. **Copy the private key** that appears on the screen
   - ⚠️ **Important**: Keep this private key secure and never share it with anyone
   - This private key gives full access to your wallet and funds

> **Why Step 1?** You need the private key to import your WDK wallet account into Hardhat for contract deployment.

### Step 2: Get Testnet Tokens from Faucet

1. On the `/wallet` page, copy your wallet address (displayed at the top of the wallet card)
2. Switch the network to **Fuji Testnet** using the network dropdown (if not already on Fuji)
3. Visit one of the testnet faucets listed above (e.g., [Chainlink Faucet](https://faucets.chain.link/fuji))
4. Paste your wallet address and request testnet AVAX tokens
5. Wait for the transaction to confirm (usually takes a few minutes)
6. Verify you received the tokens by checking your wallet balance on the `/wallet` page

> **Tip**: You'll need at least 0.01 AVAX to cover gas fees for contract deployment.

### Step 3: Import Account into Hardhat

1. Open your terminal in the project root directory
2. Run the account import command:
   ```bash
   yarn account:import
   ```
3. When prompted, paste your private key (the one you copied from Step 1)
4. Create and confirm a password to encrypt your private key
   - ⚠️ **Remember this password** - you'll need it in Step 4 to deploy
5. The encrypted private key will be saved to `packages/hardhat/.env` as `DEPLOYER_PRIVATE_KEY_ENCRYPTED`

> **Security Note**: The private key is encrypted and stored locally. Never commit the `.env` file to version control.

### Step 4: Deploy to Testnet

1. Make sure your contracts are compiled:
   ```bash
   yarn compile
   ```
2. Deploy to Fuji testnet:
   ```bash
   yarn deploy:fuji
   ```
3. When prompted, enter the password you created in Step 3
4. Wait for the deployment to complete
5. The script will output the deployed contract address and transaction hash

### Step 5: Verify Deployment

You can verify your deployment in two ways:

#### Option A: Using the Avalanche Testnet Explorer
1. Copy the transaction hash from the deployment output
2. Visit [https://subnets-test.avax.network/c-chain](https://subnets-test.avax.network/c-chain)
3. Paste the transaction hash in the search bar
4. View the transaction details, contract address, and verify the deployment

#### Option B: Using Your WDK Wallet
1. Go to your `/wallet` page in the application
2. Switch to Fuji Testnet if not already on it
3. Your wallet balance should reflect the gas spent on deployment
4. You can also check the transaction hash in the explorer to see full deployment details

### Troubleshooting

**Error: "insufficient funds for gas"**
- Make sure you have enough testnet AVAX in your account (at least 0.01 AVAX)
- Request more tokens from the faucet if needed

**Error: "Failed to decrypt private key"**
- Make sure you're using the correct password created during `yarn account:import`
- If you forgot the password, you'll need to re-import the account

**Deployment takes too long**
- Testnet transactions can sometimes be slow. Wait a few minutes and check the explorer
- If the transaction fails, check the error message and try again

### Seed Phrase Security

- Seed phrases are encrypted using AES-GCM 256-bit encryption
- Encryption key is stored separately in IndexedDB
- **Auto-unlock in development** (NODE_ENV=development)
- **Manual unlock in production** for security
- Export seed phrase with confirmation modal

## Available Commands

### Avalanche Node Management

| Command | Description |
|---------|-------------|
| `yarn avalanche:up` | Start local Avalanche C-Chain node |
| `yarn avalanche:down` | Stop local node |
| `yarn avalanche:status` | Check node status |
| `yarn avalanche:restart` | Restart local node |
| `yarn avalanche:clean` | Remove all node data |

### Contract Development

| Command | Description |
|---------|-------------|
| `yarn compile` | Compile smart contracts |
| `yarn deploy:local` | Deploy to local Avalanche |
| `yarn deploy:fuji` | Deploy to Fuji testnet |
| `yarn deploy:mainnet` | Deploy to mainnet |
| `yarn test` | Run contract tests |

### Frontend Development

| Command | Description |
|---------|-------------|
| `yarn start` | Start Next.js dev server |
| `yarn build` | Build for production |
| `yarn format` | Format code |
| `yarn lint` | Lint code |

## Architecture

### WDK Integration

This starter uses **WDK exclusively** for all blockchain interactions:

- **Wallet Creation**: `WDK.getRandomSeedPhrase()` and `new WDK(seedPhrase)`
- **Account Management**: `wdk.getAccount(chain, index)`
- **Transactions**: `account.sendTransaction()`
- **Balance Queries**: `account.getBalance()`
- **Contract Interactions**: WDK provider + ethers.js for ABI encoding

### Directory Structure

```
avax-tether-wdk-starter/
├── packages/
│   ├── hardhat/              # Smart contract development
│   │   ├── contracts/        # Solidity contracts
│   │   ├── deploy/           # Deployment scripts
│   │   ├── scripts/          # Utility scripts
│   │   └── test/             # Contract tests
│   │
│   └── nextjs/               # Frontend application
│       ├── app/              # Next.js pages
│       ├── components/       # React components
│       │   └── WalletManager.tsx  # Main wallet UI
│       ├── contexts/         # React contexts
│       │   └── WdkContext.tsx     # WDK provider
│       ├── hooks/            # Custom React hooks
│       │   └── scaffold-eth/ # WDK-based hooks
│       ├── config/           # Network configurations
│       │   └── networks.ts   # Avalanche networks
│       ├── services/         # Utility services
│       │   └── seedVault.ts  # Seed encryption
│       └── utils/            # Helper utilities
│
├── docker-compose.yml        # Docker fallback for local node
└── README.md                 # This file
```

## Custom Hooks

### Core WDK Hooks

```typescript
import { 
  useWdkAccount,    // Get current account
  useWdkSigner,     // Get signer for transactions
  useWdkNetwork,    // Get/switch networks
  useWdkBalance,    // Get account balance
  useWdkProvider    // Get raw WDK instance
} from "~~/hooks/scaffold-eth";
```

### Contract Interaction Hooks

```typescript
import { 
  useScaffoldReadContract,   // Read contract state
  useScaffoldWriteContract,  // Write to contracts
  useScaffoldEventHistory    // Query contract events
} from "~~/hooks/scaffold-eth";
```

### Example Usage

```typescript
// Read from contract
const { data: greeting } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "greeting",
});

// Write to contract
const { writeContractAsync } = useScaffoldWriteContract({
  contractName: "YourContract",
});

await writeContractAsync({
  functionName: "setGreeting",
  args: ["Hello Avalanche!"],
});
```

## Network Configuration

Networks are configured in `packages/nextjs/config/networks.ts`:

```typescript
{
  local: {
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:9650/ext/bc/C/rpc"
  },
  fuji: {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc"
  },
  mainnet: {
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc"
  }
}
```

## Security Best Practices

1. **Never commit seed phrases or private keys**
2. **Always use test networks for development**
3. **Test thoroughly before deploying to mainnet**
4. **Keep your seed phrase backed up offline**
5. **Use strong passphrases for seed encryption (future feature)**
6. **Verify contract deployments on block explorers**

### Seed Phrase Storage

- Encrypted with WebCrypto AES-GCM 256-bit
- Device-specific encryption key in IndexedDB
- Separate storage for encrypted seed and key
- Auto-unlock in dev mode only
- Export requires explicit user confirmation

## Testing

### Contract Tests

```bash
cd packages/hardhat
yarn test
```

### Frontend Tests

```bash
cd packages/nextjs
yarn test
```

## Environment Variables

Create a `.env.local` file in `packages/nextjs/`:

```bash
# Default network (local, fuji, mainnet)
NEXT_PUBLIC_NETWORK=local

# Deployer seed phrase (for contract deployment)
# NEVER commit real seed phrases!
DEPLOYER_SEED_PHRASE=your_test_seed_phrase_here
```

## Deployment

### Frontend Deployment

Deploy to Vercel:
```bash
yarn vercel
```

### Contract Deployment

```bash
# Compile contracts
yarn compile

# Deploy to Fuji testnet
yarn deploy:fuji
# See the "Deploying Smart Contracts to Testnet" section for detailed steps

# Deploy to Mainnet (requires funded account)
yarn deploy:mainnet
# ⚠️ Only use after thorough testing on testnet!
```

For step-by-step testnet deployment instructions, refer to the [Deploying Smart Contracts to Testnet](#deploying-smart-contracts-to-testnet) section above.

## Documentation

- [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io)
- [Avalanche Docs](https://docs.avax.network)
- [WDK Documentation](https://docs.wallet.tether.io/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Next.js Docs](https://nextjs.org/docs)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

This starter kit is built with love by [Dojo Coding](https://dojocoding.io) and stands on the shoulders of amazing open source projects:

- **[Scaffold-ETH 2](https://scaffoldeth.io)** - The foundation of this starter kit, created by [BuidlGuidl](https://buidlguidl.com/). An incredible toolkit for Ethereum development that we've adapted for Avalanche.
- **[Tether WDK](https://tether.to)** - The Wallet Development Kit that powers all blockchain interactions in this starter.
- **[Avalanche](https://avax.network)** - The blazing fast L1 blockchain platform this starter is built for.

We're grateful to the open source community for making projects like this possible. Special thanks to BuidlGuidl for creating Scaffold-ETH 2 and fostering a culture of building in public.

---

**Happy Building on Avalanche! 🏔️**

## License

This project is licensed under the [MIT License](LICENCE). Built by [Dojo Coding](https://dojocoding.io).

<p align="center">
  <a href="https://dojocoding.io"><img src="docs/assets/dojocoding-mark.png" alt="Dojo Coding" width="48"></a>
</p>
