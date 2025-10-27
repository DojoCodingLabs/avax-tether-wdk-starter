# Avalanche Wallet Manager

This component provides a singleton wallet management system using the Tether WDK for Avalanche C-Chain support.

## Features

- **Singleton Pattern**: Ensures only one wallet instance exists across the application
- **Avalanche Support**: Avalanche C-Chain wallet using EVM-compatible interface
- **React Context**: Provides wallet state and operations throughout the app
- **Custom Hooks**: Easy-to-use hooks for different wallet operations
- **TypeScript Support**: Full type safety and IntelliSense support

## Installation

First, install the required Tether WDK packages:

```bash
npm install @tetherto/wdk @tetherto/wdk-wallet-evm
```

## Usage

### 1. Provider Setup

The `WalletProvider` is already integrated into the main app providers in `ScaffoldEthAppWithProviders.tsx`:

```tsx
<WalletProvider>
  <WagmiProvider config={wagmiConfig}>
    {/* ... other providers */}
  </WagmiProvider>
</WalletProvider>
```

### 2. Basic Usage

```tsx
import { useWallet, useWalletInitialization, useWalletBalances } from "~~/components/WalletManager";

function MyComponent() {
  const { initializeWallet, isInitialized } = useWalletInitialization();
  const { balances, refreshBalances } = useWalletBalances();
  
  const handleInitialize = async () => {
    await initializeWallet(); // Generates new seed phrase
    // or
    await initializeWallet("your seed phrase here");
  };
  
  return (
    <div>
      {!isInitialized ? (
        <button onClick={handleInitialize}>Initialize Wallet</button>
      ) : (
        <div>
          <p>Avalanche Balance: {balances.avalanche?.toString()}</p>
          <button onClick={refreshBalances}>Refresh</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Available Hooks

#### `useWallet()`
Main hook providing access to all wallet functionality:

```tsx
const {
  seedPhrase,
  isInitialized,
  accounts,
  addresses,
  balances,
  initializeWallet,
  generateNewSeedPhrase,
  refreshBalances,
  sendTransaction,
  estimateTransactionFee
} = useWallet();
```

#### `useWalletInitialization()`
Focused hook for wallet initialization:

```tsx
const { initializeWallet, generateNewSeedPhrase, isInitialized } = useWalletInitialization();
```

#### `useWalletBalances()`
Hook for balance management:

```tsx
const { balances, refreshBalances } = useWalletBalances();
```

#### `useWalletAddresses()`
Hook for address access:

```tsx
const { addresses } = useWalletAddresses();
```

#### `useWalletTransactions()`
Hook for transaction operations:

```tsx
const { sendTransaction, estimateTransactionFee } = useWalletTransactions();
```

### 4. Transaction Operations

```tsx
const { sendTransaction, estimateTransactionFee } = useWalletTransactions();

// Estimate transaction fee
const fee = await estimateTransactionFee(
  "avalanche", 
  "0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5", 
  1000000000000000000n // 1 AVAX
);

// Send transaction
const result = await sendTransaction(
  "avalanche",
  "0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5",
  1000000000000000000n // 1 AVAX
);

console.log("Transaction hash:", result.hash);
```

## Architecture

### Singleton Pattern

The `WalletManagerSingleton` class ensures that only one wallet instance exists across the entire application:

```tsx
class WalletManagerSingleton {
  private static instance: WalletManagerSingleton;
  
  public static getInstance(): WalletManagerSingleton {
    if (!WalletManagerSingleton.instance) {
      WalletManagerSingleton.instance = new WalletManagerSingleton();
    }
    return WalletManagerSingleton.instance;
  }
}
```

### State Management

The wallet state is managed through React Context and includes:

- `seedPhrase`: The master seed phrase
- `isInitialized`: Whether the wallet has been initialized
- `accounts`: Account object for Avalanche
- `addresses`: Resolved address for Avalanche
- `balances`: Current balance for Avalanche

### Dynamic Imports

The WDK modules are imported dynamically to avoid SSR issues:

```tsx
const WDK = (await import("@tetherto/wdk")).default;
const WalletManagerEvm = (await import("@tetherto/wdk-wallet-evm")).default;
// ... other imports
```

## Demo Page

A demo page is available at `/wallet` that showcases:

- Wallet initialization with custom or generated seed phrases
- Avalanche address display
- Balance checking and refreshing
- Clean UI using DaisyUI components

## Error Handling

The wallet manager includes comprehensive error handling:

- Initialization errors are caught and logged
- Transaction failures are properly handled
- Network connectivity issues are managed gracefully

## Security Considerations

- Seed phrases are stored in memory only (not persisted)
- All operations are performed client-side
- No private keys are exposed to the UI layer
- The singleton pattern prevents multiple wallet instances

## Future Enhancements

- Add support for Avalanche subnets
- Implement transaction history
- Add DeFi protocol integrations (Trader Joe, Pangolin, etc.)
- Support for hardware wallets
- Multi-signature wallet support
