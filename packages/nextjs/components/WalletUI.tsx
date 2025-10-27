"use client";

import { useState } from "react";
import { useWallet, useWalletInitialization, useWalletBalances, useWalletAddresses } from "~~/components/WalletManager";

export const WalletUI = () => {
  const { isInitialized, initializeWallet, generateNewSeedPhrase } = useWalletInitialization();
  const { balances, refreshBalances } = useWalletBalances();
  const { addresses } = useWalletAddresses();
  const [seedPhrase, setSeedPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeWallet = async () => {
    setIsLoading(true);
    try {
      await initializeWallet(seedPhrase || undefined);
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewSeedPhrase = () => {
    const newSeedPhrase = generateNewSeedPhrase();
    setSeedPhrase(newSeedPhrase);
  };

  const formatBalance = (balance: bigint | null, decimals: number = 18): string => {
    if (balance === null) return "Loading...";
    const divisor = BigInt(10 ** decimals);
    const whole = balance / divisor;
    const remainder = balance % divisor;
    return `${whole}.${remainder.toString().padStart(decimals, "0").slice(0, 6)}`;
  };

  const formatAddress = (address: string | null): string => {
    if (!address) return "Not available";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isInitialized) {
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Initialize Avalanche Wallet</h2>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Seed Phrase (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Enter your seed phrase or leave empty to generate new one"
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
            />
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-outline btn-sm"
              onClick={handleGenerateNewSeedPhrase}
            >
              Generate New
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInitializeWallet}
              disabled={isLoading}
            >
              {isLoading ? "Initializing..." : "Initialize Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Avalanche Wallet</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Avalanche */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h3 className="card-title text-sm">Avalanche C-Chain</h3>
                <p className="text-xs">
                  <strong>Address:</strong> {formatAddress(addresses.avalanche)}
                </p>
                <p className="text-xs">
                  <strong>Balance:</strong> {formatBalance(balances.avalanche)} AVAX
                </p>
              </div>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-outline btn-sm"
              onClick={refreshBalances}
            >
              Refresh Balances
            </button>
          </div>
        </div>
      </div>

      {/* Full Addresses */}
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Full Addresses</h3>
          <div className="space-y-2">
            <div>
              <strong>Avalanche:</strong>
              <p className="text-sm font-mono break-all">{addresses.avalanche}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
