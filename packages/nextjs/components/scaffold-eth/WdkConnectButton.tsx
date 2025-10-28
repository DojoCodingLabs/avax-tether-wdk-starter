"use client";

import { useState } from "react";
import { useWdk } from "~~/contexts/WdkContext";
import { AVALANCHE_NETWORKS, NetworkId } from "~~/config/networks";
import { Address } from "~~/components/scaffold-eth";

/**
 * WDK Connect Button Component
 * Shows wallet status, address, balance, and network selector in header
 */
export function WdkConnectButton() {
  const {
    isInitialized,
    isLocked,
    address,
    currentNetwork,
    isSwitchingNetwork,
    switchNetwork,
  } = useWdk();

  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  const handleNetworkSwitch = async (networkId: NetworkId) => {
    setShowNetworkMenu(false);
    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Not initialized - show prompt to connect
  if (!isInitialized) {
    return (
      <a href="/wallet" className="btn btn-primary btn-sm">
        Connect Wallet
      </a>
    );
  }

  // Locked state
  if (isLocked) {
    return (
      <a href="/wallet" className="btn btn-warning btn-sm">
        🔒 Unlock Wallet
      </a>
    );
  }

  // Connected state
  return (
    <div className="flex items-center gap-2">
      {/* Network Selector */}
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          className="btn btn-sm btn-ghost normal-case"
          onClick={() => setShowNetworkMenu(!showNetworkMenu)}
          disabled={isSwitchingNetwork}
        >
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              currentNetwork.id === 'local' ? 'bg-yellow-500' :
              currentNetwork.id === 'fuji' ? 'bg-blue-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs">{currentNetwork.displayName}</span>
          </div>
        </button>
        {showNetworkMenu && (
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-1 p-2 shadow-lg bg-base-200 rounded-box w-52 z-50"
          >
            {Object.values(AVALANCHE_NETWORKS).map((network) => (
              <li key={network.id}>
                <button
                  onClick={() => handleNetworkSwitch(network.id as NetworkId)}
                  className={`${currentNetwork.id === network.id ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      network.id === 'local' ? 'bg-yellow-500' :
                      network.id === 'fuji' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <span>{network.displayName}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Address Display */}
      <a href="/wallet" className="btn btn-sm btn-ghost">
        {address && <Address address={address as `0x${string}`} />}
      </a>
    </div>
  );
}

