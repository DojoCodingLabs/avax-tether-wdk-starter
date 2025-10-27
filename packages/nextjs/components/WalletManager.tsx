"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";

// Types for wallet management
export interface WalletAccount {
  getAddress(): Promise<string>;
  getBalance(): Promise<bigint>;
  sendTransaction(params: {
    to: string;
    value: bigint;
  }): Promise<{ hash: string }>;
  quoteSendTransaction(params: {
    to: string;
    value: bigint;
  }): Promise<{ fee: bigint }>;
}

export interface WalletManager {
  getAccount(chain: string, index: number): Promise<WalletAccount>;
}

export interface WDKInstance {
  registerWallet(chain: string, walletManager: any, config: any): WDKInstance;
  getAccount(chain: string, index: number): Promise<WalletAccount>;
}

export interface WalletState {
  seedPhrase: string | null;
  isInitialized: boolean;
  accounts: {
    avalanche: WalletAccount | null;
  };
  addresses: {
    avalanche: string | null;
  };
  balances: {
    avalanche: bigint | null;
  };
}

export interface WalletContextType extends WalletState {
  initializeWallet: (seedPhrase?: string) => Promise<void>;
  generateNewSeedPhrase: () => string;
  refreshBalances: () => Promise<void>;
  sendTransaction: (chain: string, to: string, value: bigint) => Promise<{ hash: string }>;
  estimateTransactionFee: (chain: string, to: string, value: bigint) => Promise<bigint>;
}

// Default wallet state
const defaultWalletState: WalletState = {
  seedPhrase: null,
  isInitialized: false,
  accounts: {
    avalanche: null,
  },
  addresses: {
    avalanche: null,
  },
  balances: {
    avalanche: null,
  },
};

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Singleton wallet manager class
class WalletManagerSingleton {
  private static instance: WalletManagerSingleton;
  private wdkInstance: WDKInstance | null = null;
  private seedPhrase: string | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): WalletManagerSingleton {
    if (!WalletManagerSingleton.instance) {
      WalletManagerSingleton.instance = new WalletManagerSingleton();
    }
    return WalletManagerSingleton.instance;
  }

  public async initialize(seedPhrase?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Generate or use provided seed phrase
      this.seedPhrase = seedPhrase || WDK.getRandomSeedPhrase();

      // Create WDK instance and register Avalanche testnet wallet
      this.wdkInstance = new WDK(this.seedPhrase)
        .registerWallet("avalanche", WalletManagerEvm, {
          provider: "https://api.avax-test.network/ext/bc/C/rpc",
        });

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      throw error;
    }
  }

  public getSeedPhrase(): string | null {
    return this.seedPhrase;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public async getAccount(chain: string, index: number = 0): Promise<WalletAccount> {
    if (!this.wdkInstance) {
      throw new Error("Wallet not initialized");
    }
    return await this.wdkInstance.getAccount(chain, index);
  }

  public async getAddress(chain: string, index: number = 0): Promise<string> {
    const account = await this.getAccount(chain, index);
    return await account.getAddress();
  }

  public async getBalance(chain: string, index: number = 0): Promise<bigint> {
    const account = await this.getAccount(chain, index);
    return await account.getBalance();
  }

  public async sendTransaction(
    chain: string,
    to: string,
    value: bigint,
    index: number = 0
  ): Promise<{ hash: string }> {
    const account = await this.getAccount(chain, index);
    return await account.sendTransaction({ to, value });
  }

  public async estimateTransactionFee(
    chain: string,
    to: string,
    value: bigint,
    index: number = 0
  ): Promise<bigint> {
    const account = await this.getAccount(chain, index);
    const quote = await account.quoteSendTransaction({ to, value });
    return quote.fee;
  }
}

// Wallet Provider Component
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletState, setWalletState] = useState<WalletState>(defaultWalletState);
  const walletManager = WalletManagerSingleton.getInstance();

  const initializeWallet = async (seedPhrase?: string) => {
    try {
      await walletManager.initialize(seedPhrase);
      
      // Get accounts for Avalanche
      const accounts = {
        avalanche: await walletManager.getAccount("avalanche", 0),
      };

      // Get addresses for Avalanche
      const addresses = {
        avalanche: await walletManager.getAddress("avalanche", 0),
      };

      // Get balances for Avalanche
      const balances = {
        avalanche: await walletManager.getBalance("avalanche", 0),
      };

      setWalletState({
        seedPhrase: walletManager.getSeedPhrase(),
        isInitialized: true,
        accounts,
        addresses,
        balances,
      });
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      throw error;
    }
  };

  const generateNewSeedPhrase = (): string => {
    // This will be handled by the WDK when initializing
    return "Generate new seed phrase";
  };

  const refreshBalances = async () => {
    if (!walletState.isInitialized) return;

    try {
      const balances = {
        avalanche: await walletManager.getBalance("avalanche", 0),
      };

      setWalletState(prev => ({
        ...prev,
        balances,
      }));
    } catch (error) {
      console.error("Failed to refresh balances:", error);
    }
  };

  const sendTransaction = async (
    chain: string,
    to: string,
    value: bigint
  ): Promise<{ hash: string }> => {
    if (!walletState.isInitialized) {
      throw new Error("Wallet not initialized");
    }

    try {
      const result = await walletManager.sendTransaction(chain, to, value);
      
      // Refresh balances after transaction
      await refreshBalances();
      
      return result;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  };

  const estimateTransactionFee = async (
    chain: string,
    to: string,
    value: bigint
  ): Promise<bigint> => {
    if (!walletState.isInitialized) {
      throw new Error("Wallet not initialized");
    }

    try {
      return await walletManager.estimateTransactionFee(chain, to, value);
    } catch (error) {
      console.error("Failed to estimate transaction fee:", error);
      throw error;
    }
  };

  const contextValue: WalletContextType = {
    ...walletState,
    initializeWallet,
    generateNewSeedPhrase,
    refreshBalances,
    sendTransaction,
    estimateTransactionFee,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Custom hooks for specific wallet operations
export const useWalletInitialization = () => {
  const { initializeWallet, generateNewSeedPhrase, isInitialized } = useWallet();
  
  return {
    initializeWallet,
    generateNewSeedPhrase,
    isInitialized,
  };
};

export const useWalletBalances = () => {
  const { balances, refreshBalances } = useWallet();
  
  return {
    balances,
    refreshBalances,
  };
};

export const useWalletAddresses = () => {
  const { addresses } = useWallet();
  
  return {
    addresses,
  };
};

export const useWalletTransactions = () => {
  const { sendTransaction, estimateTransactionFee } = useWallet();
  
  return {
    sendTransaction,
    estimateTransactionFee,
  };
};
