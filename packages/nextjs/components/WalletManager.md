# WalletManager Documentation

## Overview

The `WalletManager` component is the core wallet interface for the WDK Avalanche Starter. It provides a complete wallet management experience including creation, import, network switching, and secure seed phrase handling.

## Architecture

### Component Structure

```
WalletManager.tsx
├── Creation Flow
│   ├── New Wallet Generation
│   └── Seed Phrase Display & Confirmation
├── Import Flow
│   └── Seed Phrase Input & Validation
├── Locked State
│   └── Unlock Interface
└── Unlocked State
    ├── Address & Balance Display
    ├── Network Selector
    ├── Export Seed Modal
    ├── Lock Wallet
    └── Disconnect Modal
```

### State Management

The wallet state is managed through the `WdkContext` provider:

```typescript
const {
  isInitialized,      // Wallet exists
  isLocked,           // Wallet locked state
  address,            // Current address
  balance,            // Current balance
  currentNetwork,     // Active network
  isSwitchingNetwork, // Network switch in progress
  error,              // Error messages
  
  // Actions
  createWallet,       // Generate new wallet
  importWallet,       // Import from seed
  unlockWallet,       // Unlock from vault
  lockWallet,         // Lock wallet
  disconnectWallet,   // Remove wallet
  exportSeedPhrase,   // Export seed
  switchNetwork,      // Change network
} = useWdk();
```

## Features

### 1. Wallet Creation

**Flow:**
1. User clicks "Create New Wallet"
2. WDK generates random seed phrase
3. Seed is encrypted and saved to vault
4. Seed is displayed to user with security warning
5. User confirms they saved the seed
6. Wallet becomes active

**Security:**
- Seed phrase shown only once during creation
- Requires explicit confirmation before proceeding
- Warning about offline backup importance
- Seed stored encrypted in IndexedDB

### 2. Wallet Import

**Flow:**
1. User clicks "Import Existing Wallet"
2. User enters 12 or 24-word seed phrase
3. Seed is validated
4. Seed is encrypted and saved to vault
5. Wallet is initialized with imported seed

**Validation:**
- Minimum 12 words required
- Whitespace trimmed
- Error handling for invalid seeds

### 3. Network Switching

**Supported Networks:**
- Local (Chain ID: 43112)
- Fuji Testnet (Chain ID: 43113)
- Mainnet (Chain ID: 43114)

**Flow:**
1. User selects network from dropdown
2. WDK re-initializes with new RPC endpoint
3. Address and balance refresh
4. UI updates to show new network

**Persistence:**
- Selected network saved to IndexedDB
- Persists across browser sessions
- Restored on wallet unlock

### 4. Seed Phrase Export

**Flow:**
1. User clicks "Export Seed Phrase"
2. Warning modal appears
3. User confirms export
4. Seed phrase retrieved from vault and decrypted
5. Seed displayed in modal with security warning
6. User must close modal manually

**Security:**
- Two-step confirmation process
- Warning about screen visibility
- Seed never logged or transmitted
- Modal must be explicitly closed

### 5. Lock/Unlock

**Lock:**
- Clears wallet from memory
- Keeps encrypted seed in vault
- Requires unlock to access

**Unlock:**
- Loads encrypted seed from vault
- Decrypts seed
- Re-initializes WDK
- Restores previous network selection

**Auto-Unlock:**
- Enabled in development mode (`NODE_ENV=development`)
- Disabled in production for security
- Configurable in `SeedVault.shouldAutoUnlock()`

### 6. Disconnect Wallet

**Flow:**
1. User clicks "Disconnect"
2. Confirmation modal appears with warning
3. User confirms disconnect
4. All data cleared from vault
5. Wallet state reset to initial

**Warning:**
- Permanent action
- Cannot be undone without seed phrase
- User must have seed phrase backed up

## Integration with WDK Context

The `WalletManager` component is tightly integrated with the `WdkContext` provider (`packages/nextjs/contexts/WdkContext.tsx`).

### Key Interactions

```typescript
// Create Wallet
const seed = await createWallet();
// Internally:
// 1. WDK.getRandomSeedPhrase()
// 2. SeedVault.save(seed)
// 3. Initialize WDK with seed
// 4. Get account, address, balance

// Import Wallet
await importWallet(seedPhrase);
// Internally:
// 1. Validate seed phrase
// 2. SeedVault.save(seed)
// 3. Initialize WDK with seed
// 4. Get account, address, balance

// Switch Network
await switchNetwork('fuji');
// Internally:
// 1. Load seed from vault
// 2. Get new network config
// 3. Re-initialize WDK with new RPC
// 4. Refresh account data
// 5. Save network selection
```

## Seed Vault Implementation

The wallet uses a secure seed vault (`packages/nextjs/services/seedVault.ts`) for seed phrase storage.

### Encryption Details

**Algorithm:** AES-GCM with 256-bit keys

**Storage:**
- **Primary:** IndexedDB
- **Fallback:** localStorage

**Key Management:**
- Device-specific encryption key
- Auto-generated on first use
- Stored separately from encrypted seed
- Never exposed to user

### Vault API

```typescript
// Check if vault exists
const exists = await SeedVault.exists();

// Save seed phrase
await SeedVault.save(seedPhrase);

// Load seed phrase
const seed = await SeedVault.load();

// Export seed phrase
const seed = await SeedVault.exportSeed();

// Clear vault
await SeedVault.clear();

// Check auto-unlock
const shouldAutoUnlock = SeedVault.shouldAutoUnlock();

// Network persistence
await SeedVault.saveNetwork(networkId);
const networkId = await SeedVault.loadNetwork();
```

## UI Components

### Address Display

Uses the `<Address>` component from Scaffold-ETH:
```typescript
<Address address={address} />
```

### Balance Display

Uses the `<Balance>` component from Scaffold-ETH:
```typescript
<Balance address={address} />
```

### Network Selector

Custom dropdown with network indicators:
```typescript
<select value={currentNetwork.id} onChange={handleNetworkSwitch}>
  {Object.values(AVALANCHE_NETWORKS).map(network => (
    <option value={network.id}>{network.displayName}</option>
  ))}
</select>
```

### Modals

DaisyUI modals for:
- Export seed phrase confirmation
- Disconnect wallet warning

## Error Handling

The component handles various error scenarios:

1. **Invalid Seed Phrase:**
   ```typescript
   if (!seedPhrase || seedPhrase.trim().split(/\s+/).length < 12) {
     throw new Error("Invalid seed phrase");
   }
   ```

2. **Network Switch Failure:**
   - Caught and displayed in UI
   - Network remains at previous selection

3. **Vault Corruption:**
   - Graceful degradation
   - User prompted to import/create new wallet

4. **WDK Initialization Failure:**
   - Error displayed in UI
   - User can retry

## Best Practices

### For Developers

1. **Never Log Seeds:**
   ```typescript
   // BAD
   console.log('Seed:', seedPhrase);
   
   // GOOD
   console.log('Wallet created successfully');
   ```

2. **Validate User Input:**
   ```typescript
   const trimmedSeed = seedPhrase.trim();
   const wordCount = trimmedSeed.split(/\s+/).length;
   if (wordCount < 12) {
     throw new Error("Minimum 12 words required");
   }
   ```

3. **Handle Async Errors:**
   ```typescript
   try {
     await createWallet();
   } catch (error) {
     console.error("Wallet creation failed:", error);
     // Show user-friendly error message
   }
   ```

### For Users

1. **Save Your Seed Phrase:**
   - Write it down on paper
   - Store in a secure location
   - Never share with anyone
   - Never store digitally unencrypted

2. **Network Selection:**
   - Use Local for development
   - Use Fuji for testing
   - Use Mainnet with caution

3. **Security:**
   - Lock wallet when not in use (production)
   - Export seed only when necessary
   - Verify network before transactions
   - Ensure no one is watching when viewing seed

## Future Enhancements

Potential improvements:

1. **User-Provided Passphrase:**
   - Optional passphrase for extra security
   - PBKDF2 key derivation
   - Required for export in production

2. **Multi-Account Support:**
   - Multiple accounts from same seed
   - Account switching UI
   - Per-account balances

3. **Hardware Wallet Integration:**
   - Ledger support
   - Trezor support
   - Hardware-backed key storage

4. **Transaction History:**
   - Local transaction cache
   - Block explorer integration
   - Export to CSV

5. **Contact Book:**
   - Save frequently used addresses
   - Address nicknames
   - Import/export contacts

## Troubleshooting

### Wallet Won't Unlock

1. Check browser console for errors
2. Clear IndexedDB and recreate wallet
3. Try localStorage fallback
4. Import wallet using seed phrase

### Network Switch Fails

1. Check network RPC availability
2. Verify internet connection
3. Check browser console
4. Try refreshing the page

### Seed Export Not Working

1. Ensure wallet is unlocked
2. Check browser permissions
3. Try exporting again
4. Check console for errors

### Balance Not Updating

1. Click "Refresh Balance" manually
2. Check network connection
3. Verify RPC endpoint is responding
4. Switch networks and switch back

## Related Files

- `packages/nextjs/components/WalletManager.tsx` - Main component
- `packages/nextjs/contexts/WdkContext.tsx` - WDK provider
- `packages/nextjs/services/seedVault.ts` - Seed encryption
- `packages/nextjs/config/networks.ts` - Network configuration
- `packages/nextjs/components/scaffold-eth/WdkConnectButton.tsx` - Header widget

## Support

For issues or questions:
- Check the main [README.md](../../../README.md)
- Review [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io)
- See [WDK documentation](https://github.com/tetherto/lib-wallet-sdk)
- Open an issue on GitHub
