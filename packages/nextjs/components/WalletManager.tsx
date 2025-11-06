"use client";

import { useState, useEffect } from "react";
import { HDNodeWallet } from "ethers";
import { useWdk } from "~~/contexts/WdkContext";
import { AVALANCHE_NETWORKS, NetworkId } from "~~/config/networks";
import { Address } from "~~/components/scaffold-eth";
import { Balance } from "~~/components/scaffold-eth";
import { SeedVault } from "~~/services/seedVault";

/**
 * Modern Wallet Manager Component
 * Handles wallet creation, import, network switching, and seed phrase management
 */
export function WalletManager() {
  const {
    isInitialized,
    isLocked,
    address,
    balance,
    currentNetwork,
    isLoading,
    isSwitchingNetwork,
    error,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    disconnectWallet,
    exportSeedPhrase,
    switchNetwork,
  } = useWdk();

  const [view, setView] = useState<"locked" | "unlocked" | "create" | "import" | "import-after-disconnect">("locked");
  const [importSeedInput, setImportSeedInput] = useState("");
  const [newSeedPhrase, setNewSeedPhrase] = useState<string | null>(null);
  const [seedSaved, setSeedSaved] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedSeed, setExportedSeed] = useState<string | null>(null);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [exportedPrivateKey, setExportedPrivateKey] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);

  // Check if vault exists on mount and when wallet state changes
  useEffect(() => {
    const checkVault = async () => {
      const exists = await SeedVault.exists();
      setVaultExists(exists);
      
      // Update view based on wallet state and vault existence
      if (isLocked && !isInitialized && !exists) {
        // Wallet was disconnected, need to import
        setView("import-after-disconnect");
      } else if (isLocked) {
        setView("locked");
      } else if (isInitialized && !isLocked) {
        setView("unlocked");
      } else if (!isInitialized && !isLocked) {
        setView("create");
      }
    };
    
    checkVault();
  }, [isInitialized, isLocked]);

  const handleCreateWallet = async () => {
    try {
      const seed = await createWallet();
      setNewSeedPhrase(seed);
      setSeedSaved(false);
      // Don't switch view yet - show seed phrase first
    } catch (error) {
      console.error("Failed to create wallet:", error);
    }
  };

  const handleSeedSaved = () => {
    setSeedSaved(true);
    setNewSeedPhrase(null);
    setView("unlocked");
  };

  const handleImportWallet = async () => {
    if (!importSeedInput.trim()) {
      alert("Please enter a valid seed phrase");
      return;
    }
    
    try {
      await importWallet(importSeedInput.trim());
      setImportSeedInput("");
      setView("unlocked");
    } catch (error) {
      console.error("Failed to import wallet:", error);
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockWallet();
      setView("unlocked");
    } catch (error) {
      console.error("Failed to unlock wallet:", error);
    }
  };

  const handleLock = async () => {
    await lockWallet();
    setView("locked");
  };

  const handleExportSeed = async () => {
    try {
      const seed = await exportSeedPhrase();
      setExportedSeed(seed);
    } catch (error) {
      console.error("Failed to export seed:", error);
    }
  };

  const handleExportPrivateKey = async () => {
    try {
      const seed = await exportSeedPhrase();
      // Derive private key from seed phrase using ethers
      const wallet = HDNodeWallet.fromPhrase(seed);
      setExportedPrivateKey(wallet.privateKey);
    } catch (error) {
      console.error("Failed to export private key:", error);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setShowDisconnectModal(false);
    setVaultExists(false);
    setView("import-after-disconnect");
  };

  const handleNetworkSwitch = async (networkId: NetworkId) => {
    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Show new seed phrase after creation
  if (newSeedPhrase && !seedSaved) {
    return (
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl">🔐 Save Your Seed Phrase</h2>
          
          <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold">Important: Write this down!</h3>
              <div className="text-sm">This seed phrase is the ONLY way to recover your wallet. Store it securely offline.</div>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-lg my-4">
            <pre className="text-center text-lg font-mono whitespace-pre-wrap break-words">
              {newSeedPhrase}
            </pre>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">I have securely saved my seed phrase</span>
              <input 
                type="checkbox" 
                className="checkbox checkbox-primary" 
                checked={seedSaved}
                onChange={(e) => setSeedSaved(e.target.checked)}
              />
            </label>
          </div>

          <div className="card-actions justify-end mt-4">
            <button 
              className="btn btn-primary" 
              onClick={handleSeedSaved}
              disabled={!seedSaved}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Import after disconnect - wallet was disconnected, need to re-import
  if (view === "import-after-disconnect") {
    return (
      <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🔌</div>
            <h2 className="text-2xl font-bold">Wallet Disconnected</h2>
            <p className="text-sm text-base-content/70 mt-3">
              Your wallet has been disconnected. Import your saved seed phrase to reconnect.
            </p>
          </div>

          <div className="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">If you don't have your seed phrase, you'll need to create a new wallet.</span>
          </div>
          
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Seed Phrase (12 or 24 words)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-40 resize-none text-sm p-4 leading-6 whitespace-pre-wrap break-words"
              placeholder="Enter your seed phrase here (separate words with spaces)&#10;&#10;Example:&#10;word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
              value={importSeedInput}
              onChange={(e) => setImportSeedInput(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                lineHeight: '1.5rem',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                💡 Tip: Each word should be separated by a space
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button 
              className="btn btn-outline btn-lg flex-1" 
              onClick={() => setView("create")}
            >
              Create New Wallet
            </button>
            <button 
              className="btn btn-primary btn-lg flex-1" 
              onClick={handleImportWallet}
              disabled={isLoading || !importSeedInput.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Importing...
                </>
              ) : (
                "Import Wallet"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Locked state - wallet exists in vault but locked
  if (isLocked && vaultExists) {
    return (
      <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="card-title text-2xl">Wallet Locked</h2>
          <p className="text-base-content/70">
            Network: {currentNetwork.displayName}
          </p>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <div className="card-actions mt-4">
            <button 
              className="btn btn-primary" 
              onClick={handleUnlock}
              disabled={isLoading}
            >
              {isLoading ? "Unlocking..." : "Unlock Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create/Import view - no wallet exists
  if (!isInitialized && (view === "create" || view === "import")) {
    if (view === "import") {
      return (
        <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto">
          <div className="card-body p-8">
            <h2 className="text-2xl font-bold mb-2">Import Wallet</h2>
            <p className="text-sm text-base-content/70 mb-6">
              Enter your 12 or 24 word seed phrase to restore your wallet.
            </p>
            
            {error && (
              <div className="alert alert-error mb-6">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Seed Phrase (12 or 24 words)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-40 resize-none text-sm p-4 leading-6 whitespace-pre-wrap break-words"
                placeholder="Enter your seed phrase here (separate words with spaces)&#10;&#10;Example:&#10;word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                value={importSeedInput}
                onChange={(e) => setImportSeedInput(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  lineHeight: '1.5rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  💡 Tip: Each word should be separated by a space
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button 
                className="btn btn-outline btn-lg flex-1" 
                onClick={() => setView("create")}
              >
                Back
              </button>
              <button 
                className="btn btn-primary btn-lg flex-1" 
                onClick={handleImportWallet}
                disabled={isLoading || !importSeedInput.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Importing...
                  </>
                ) : (
                  "Import Wallet"
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="card-title text-2xl">Welcome to WDK Wallet</h2>
          <p className="text-base-content/70 mb-6">
            Create a new wallet or import an existing one to get started on Avalanche.
          </p>

          {error && (
            <div className="alert alert-error w-full mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="card-actions flex-col w-full gap-3">
            <button 
              className="btn btn-primary w-full" 
              onClick={handleCreateWallet}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create New Wallet"}
            </button>
            <button 
              className="btn btn-outline w-full" 
              onClick={() => setView("import")}
            >
              Import Existing Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked state - fully functional wallet
  return (
    <div className="card w-full max-w-2xl bg-base-100 shadow-xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl flex items-center justify-between">
          <span>🔓 Wallet</span>
          <div className="badge badge-success">Connected</div>
        </h2>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Network Selector */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold">Network</span>
          </label>
          <select 
            className="select select-bordered w-full"
            value={currentNetwork.id}
            onChange={(e) => handleNetworkSwitch(e.target.value as NetworkId)}
            disabled={isSwitchingNetwork}
          >
            {Object.values(AVALANCHE_NETWORKS).map((network) => (
              <option key={network.id} value={network.id}>
                {network.displayName} (Chain ID: {network.chainId})
              </option>
            ))}
          </select>
          {isSwitchingNetwork && (
            <label className="label">
              <span className="label-text-alt text-info">Switching network...</span>
            </label>
          )}
        </div>

        {/* Address Display */}
        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text font-semibold">Address</span>
          </label>
          <div className="flex items-center gap-2">
            {address && <Address address={address as `0x${string}`} />}
          </div>
        </div>

        {/* Balance Display */}
        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text font-semibold">Balance</span>
          </label>
          <div className="text-2xl font-bold">
            {address && <Balance address={address as `0x${string}`} />}
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end mt-6 gap-2">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => setShowExportModal(true)}
          >
            Export Seed
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => setShowPrivateKeyModal(true)}
          >
            Show Private Key
          </button>
          <button 
            className="btn btn-sm btn-warning"
            onClick={handleLock}
          >
            Lock Wallet
          </button>
          <button 
            className="btn btn-sm btn-error"
            onClick={() => setShowDisconnectModal(true)}
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Export Seed Modal */}
      {showExportModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">⚠️ Export Seed Phrase</h3>
            {!exportedSeed ? (
              <>
                <p className="py-4">
                  Are you sure you want to export your seed phrase? Make sure no one is watching your screen.
                </p>
                <div className="modal-action">
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => setShowExportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-warning" 
                    onClick={handleExportSeed}
                  >
                    Show Seed Phrase
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-base-200 p-4 rounded-lg my-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {exportedSeed}
                  </pre>
                </div>
                <div className="alert alert-warning mt-4">
                  <span className="text-xs">Never share this seed phrase with anyone!</span>
                </div>
                <div className="modal-action">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setExportedSeed(null);
                      setShowExportModal(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setExportedSeed(null);
              setShowExportModal(false);
            }}>close</button>
          </form>
        </dialog>
      )}

      {/* Export Private Key Modal */}
      {showPrivateKeyModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">⚠️ Export Private Key</h3>
            {!exportedPrivateKey ? (
              <>
                <p className="py-4">
                  Are you sure you want to export your private key? Make sure no one is watching your screen.
                </p>
                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Warning!</h3>
                    <div className="text-sm">Your private key provides full access to your wallet. Never share it with anyone!</div>
                  </div>
                </div>
                <div className="modal-action">
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => setShowPrivateKeyModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-warning" 
                    onClick={handleExportPrivateKey}
                  >
                    Show Private Key
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-base-200 p-4 rounded-lg my-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {exportedPrivateKey}
                  </pre>
                </div>
                <div className="alert alert-error mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs">Never share this private key with anyone! It provides full access to your wallet and funds.</span>
                </div>
                <div className="modal-action">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setExportedPrivateKey(null);
                      setShowPrivateKeyModal(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setExportedPrivateKey(null);
              setShowPrivateKeyModal(false);
            }}>close</button>
          </form>
        </dialog>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">⚠️ Disconnect Wallet</h3>
            <p className="py-4">
              This will remove your wallet from this device. Make sure you have your seed phrase backed up!
            </p>
            <div className="alert alert-error">
              <span className="text-sm">This action cannot be undone without your seed phrase.</span>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDisconnectModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default WalletManager;
