"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import { SeedVault } from "~~/services/seedVault";
import { AVALANCHE_NETWORKS, NetworkId, DEFAULT_NETWORK, AvalancheNetwork } from "~~/config/networks";

// WDK Account interface
export interface WdkAccount {
  getAddress(): Promise<string>;
  getBalance(): Promise<bigint>;
  sendTransaction(params: { to: string; value: bigint; data?: string }): Promise<{ hash: string }>;
  quoteSendTransaction(params: { to: string; value: bigint; data?: string }): Promise<{ fee: bigint }>;
  signMessage(message: string): Promise<string>;
}

// WDK Context State
export interface WdkContextState {
  // Wallet state
  isInitialized: boolean;
  isLocked: boolean;
  address: string | null;
  balance: bigint | null;
  
  // Network state
  currentNetwork: AvalancheNetwork;
  
  // WDK instance and account
  wdkInstance: any | null;
  account: WdkAccount | null;
  
  // Loading states
  isLoading: boolean;
  isSwitchingNetwork: boolean;
  
  // Error state
  error: string | null;
}

// WDK Context Actions
export interface WdkContextActions {
  // Wallet management
  createWallet: () => Promise<string>; // Returns seed phrase
  importWallet: (seedPhrase: string) => Promise<void>;
  unlockWallet: () => Promise<void>;
  lockWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  exportSeedPhrase: () => Promise<string>;
  
  // Network management
  switchNetwork: (networkId: NetworkId) => Promise<void>;
  
  // Data refresh
  refreshBalance: () => Promise<void>;
  refreshAddress: () => Promise<void>;
}

export type WdkContextValue = WdkContextState & WdkContextActions;

// Create context
const WdkContext = createContext<WdkContextValue | undefined>(undefined);

// Initial state
const initialState: WdkContextState = {
  isInitialized: false,
  isLocked: true,
  address: null,
  balance: null,
  currentNetwork: AVALANCHE_NETWORKS[DEFAULT_NETWORK],
  wdkInstance: null,
  account: null,
  isLoading: false,
  isSwitchingNetwork: false,
  error: null,
};

// Provider Props
interface WdkProviderProps {
  children: ReactNode;
}

/**
 * WDK Provider Component
 * Manages WDK instance, wallet state, and network switching
 */
export function WdkProvider({ children }: WdkProviderProps) {
  const [state, setState] = useState<WdkContextState>(initialState);

  /**
   * Initialize WDK instance with seed phrase and network
   */
  const initializeWdk = useCallback(async (seedPhrase: string, networkId: NetworkId) => {
    try {
      const network = AVALANCHE_NETWORKS[networkId];
      
      // Create WDK instance and register Avalanche wallet
      const wdk = new WDK(seedPhrase).registerWallet("avalanche", WalletManagerEvm, {
        provider: network.rpcUrl,
      });

      // Get account
      const account = await wdk.getAccount("avalanche", 0);
      
      // Get address and balance
      const address = await account.getAddress();
      const balance = await account.getBalance();

      setState(prev => ({
        ...prev,
        wdkInstance: wdk,
        account,
        address,
        balance,
        currentNetwork: network,
        isInitialized: true,
        isLocked: false,
        isLoading: false,
        error: null,
      }));

      return { wdk, account, address, balance };
    } catch (error) {
      console.error("Failed to initialize WDK:", error);
      throw error;
    }
  }, []);

  /**
   * Create new wallet
   */
  const createWallet = useCallback(async (): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Generate new seed phrase
      const seedPhrase = WDK.getRandomSeedPhrase();
      
      // Save to vault
      await SeedVault.save(seedPhrase);
      
      // Load saved network or use default
      const savedNetwork = (await SeedVault.loadNetwork()) as NetworkId | null;
      const networkId = savedNetwork || DEFAULT_NETWORK;
      await SeedVault.saveNetwork(networkId);
      
      // Initialize WDK
      await initializeWdk(seedPhrase, networkId);
      
      return seedPhrase;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create wallet";
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      throw error;
    }
  }, [initializeWdk]);

  /**
   * Import existing wallet
   */
  const importWallet = useCallback(async (seedPhrase: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Validate seed phrase (basic check)
      if (!seedPhrase || seedPhrase.trim().split(/\s+/).length < 12) {
        throw new Error("Invalid seed phrase. Must be at least 12 words.");
      }
      
      // Save to vault
      await SeedVault.save(seedPhrase.trim());
      
      // Load saved network or use default
      const savedNetwork = (await SeedVault.loadNetwork()) as NetworkId | null;
      const networkId = savedNetwork || DEFAULT_NETWORK;
      await SeedVault.saveNetwork(networkId);
      
      // Initialize WDK
      await initializeWdk(seedPhrase.trim(), networkId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to import wallet";
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      throw error;
    }
  }, [initializeWdk]);

  /**
   * Unlock wallet from vault
   */
  const unlockWallet = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load seed from vault
      const seedPhrase = await SeedVault.load();
      if (!seedPhrase) {
        throw new Error("No seed phrase found in vault");
      }
      
      // Load saved network
      const savedNetwork = (await SeedVault.loadNetwork()) as NetworkId | null;
      const networkId = savedNetwork || DEFAULT_NETWORK;
      
      // Initialize WDK
      await initializeWdk(seedPhrase, networkId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to unlock wallet";
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      throw error;
    }
  }, [initializeWdk]);

  /**
   * Lock wallet (clear from memory but keep in vault)
   */
  const lockWallet = useCallback(async (): Promise<void> => {
    setState({
      ...initialState,
      isLocked: true,
      currentNetwork: state.currentNetwork,
    });
  }, [state.currentNetwork]);

  /**
   * Disconnect wallet (clear vault)
   */
  const disconnectWallet = useCallback(async (): Promise<void> => {
    await SeedVault.clear();
    setState(initialState);
  }, []);

  /**
   * Export seed phrase
   */
  const exportSeedPhrase = useCallback(async (): Promise<string> => {
    return await SeedVault.exportSeed();
  }, []);

  /**
   * Switch network
   */
  const switchNetwork = useCallback(async (networkId: NetworkId): Promise<void> => {
    setState(prev => ({ ...prev, isSwitchingNetwork: true, error: null }));
    
    try {
      // Load seed from vault
      const seedPhrase = await SeedVault.load();
      if (!seedPhrase) {
        throw new Error("No seed phrase found. Please unlock wallet first.");
      }
      
      // Save new network selection
      await SeedVault.saveNetwork(networkId);
      
      // Re-initialize WDK with new network
      await initializeWdk(seedPhrase, networkId);
      
      setState(prev => ({ ...prev, isSwitchingNetwork: false }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to switch network";
      setState(prev => ({ ...prev, error: errorMsg, isSwitchingNetwork: false }));
      throw error;
    }
  }, [initializeWdk]);

  /**
   * Refresh balance
   */
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!state.account) return;
    
    try {
      const balance = await state.account.getBalance();
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [state.account]);

  /**
   * Refresh address
   */
  const refreshAddress = useCallback(async (): Promise<void> => {
    if (!state.account) return;
    
    try {
      const address = await state.account.getAddress();
      setState(prev => ({ ...prev, address }));
    } catch (error) {
      console.error("Failed to refresh address:", error);
    }
  }, [state.account]);

  /**
   * Auto-unlock on mount if vault exists and dev mode
   * Auto-create wallet in dev mode if vault doesn't exist
   */
  useEffect(() => {
    let isMounted = true;
    
    const autoInitialize = async () => {
      if (!isMounted) return;
      
      const vaultExists = await SeedVault.exists();
      const shouldAutoUnlock = SeedVault.shouldAutoUnlock();
      
      console.log("🔍 Checking wallet state:", { vaultExists, shouldAutoUnlock, isDev: process.env.NODE_ENV === "development" });
      
      if (vaultExists && shouldAutoUnlock) {
        // Auto-unlock existing wallet in dev mode
        try {
          console.log("🔓 Auto-unlocking existing wallet...");
          const seedPhrase = await SeedVault.load();
          if (!seedPhrase) {
            console.error("❌ Vault exists but no seed found");
            return;
          }
          const savedNetwork = (await SeedVault.loadNetwork()) as NetworkId | null;
          const networkId = savedNetwork || DEFAULT_NETWORK;
          await initializeWdk(seedPhrase, networkId);
          console.log("✅ Wallet auto-unlocked");
        } catch (error) {
          console.error("❌ Auto-unlock failed:", error);
        }
      } else if (vaultExists) {
        // In production, show locked state
        console.log("🔒 Wallet exists but auto-unlock disabled (production mode)");
        setState(prev => ({ ...prev, isLocked: true }));
      } else if (shouldAutoUnlock) {
        // Auto-create wallet in dev mode if no vault exists
        try {
          console.log("🔐 Auto-generating development wallet...");
          const seedPhrase = WDK.getRandomSeedPhrase();
          await SeedVault.save(seedPhrase);
          const networkId = DEFAULT_NETWORK;
          await SeedVault.saveNetwork(networkId);
          await initializeWdk(seedPhrase, networkId);
          console.log("✅ Development wallet created and unlocked");
        } catch (error) {
          console.error("❌ Auto-create wallet failed:", error);
        }
      } else {
        console.log("ℹ️ No wallet found and auto-create disabled (production mode)");
      }
    };
    
    autoInitialize();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  const contextValue: WdkContextValue = {
    ...state,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    disconnectWallet,
    exportSeedPhrase,
    switchNetwork,
    refreshBalance,
    refreshAddress,
  };

  return <WdkContext.Provider value={contextValue}>{children}</WdkContext.Provider>;
}

/**
 * Hook to use WDK context
 */
export function useWdk(): WdkContextValue {
  const context = useContext(WdkContext);
  if (!context) {
    throw new Error("useWdk must be used within WdkProvider");
  }
  return context;
}

export default WdkContext;

