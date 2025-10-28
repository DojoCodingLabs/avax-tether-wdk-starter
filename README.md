# WDK Avalanche Starter 🏔️

A fully integrated Avalanche C-Chain development starter built on Scaffold-ETH 2, powered by the [Tether Wallet Development Kit (WDK)](https://github.com/tetherto/lib-wallet-sdk). This starter provides a complete development environment for building dApps on Avalanche Local, Fuji Testnet, and Mainnet.

## 🚀 Features

- ✅ **WDK-First Architecture**: All blockchain interactions use WDK exclusively (no wagmi/viem/ethers for runtime operations)
- 🏔️ **Full Avalanche Support**: Local node, Fuji Testnet (43113), and Mainnet (43114)
- 🔐 **Secure Seed Management**: Encrypted seed phrase storage with IndexedDB and WebCrypto (AES-GCM)
- 🔄 **Network Switching**: Seamless switching between Local, Fuji, and Mainnet
- 💼 **Modern Wallet UI**: Beautiful wallet interface with seed export and lock/unlock features
- 🎯 **Auto-Unlock in Dev**: Automatically unlocks wallet in development mode for better DX
- 📝 **Smart Contract Tools**: Debug, deploy, and interact with contracts on all networks
- 🔥 **Hot Reload**: Frontend auto-adapts to smart contract changes
- 🧱 **Web3 Components**: Pre-built components for Address, Balance, and more

## 📋 Requirements

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

## 🏁 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Start Local Avalanche Node

```bash
yarn avalanche:up
```

This will start a local Avalanche C-Chain node at `http://127.0.0.1:9650/ext/bc/C/rpc` with Chain ID `43112`.

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

Deploy to Mainnet (be careful!):
```bash
yarn deploy:mainnet
```

### 4. Start Frontend

```bash
yarn start
```

Visit `http://localhost:3000` and navigate to the **Avalanche Wallet** page to create or import a wallet.

## 📱 Wallet Management

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

### Seed Phrase Security

- Seed phrases are encrypted using AES-GCM 256-bit encryption
- Encryption key is stored separately in IndexedDB
- **Auto-unlock in development** (NODE_ENV=development)
- **Manual unlock in production** for security
- Export seed phrase with confirmation modal

## 🛠️ Available Commands

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

## 🏗️ Architecture

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

## 🔌 Custom Hooks

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

## 🌐 Network Configuration

Networks are configured in `packages/nextjs/config/networks.ts`:

```typescript
{
  local: {
    chainId: 43112,
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

## 🔒 Security Best Practices

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

## 🧪 Testing

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

## 📝 Environment Variables

Create a `.env.local` file in `packages/nextjs/`:

```bash
# Default network (local, fuji, mainnet)
NEXT_PUBLIC_NETWORK=local

# Deployer seed phrase (for contract deployment)
# NEVER commit real seed phrases!
DEPLOYER_SEED_PHRASE=your_test_seed_phrase_here
```

## 🚢 Deployment

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

# Deploy to Mainnet (requires funded account)
yarn deploy:mainnet
```

## 📚 Documentation

- [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io)
- [Avalanche Docs](https://docs.avax.network)
- [WDK Documentation](https://github.com/tetherto/lib-wallet-sdk)
- [Hardhat Docs](https://hardhat.org/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built on [Scaffold-ETH 2](https://scaffoldeth.io)
- Powered by [Tether WDK](https://tether.to)
- Supports [Avalanche](https://avax.network)

---

**Happy Building on Avalanche! 🏔️**
