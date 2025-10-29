"use client";

import { useWdk } from "~~/contexts/WdkContext";
import { Address } from "~~/components/scaffold-eth";

/**
 * WDK Connect Button Component
 * Shows wallet status and address in header
 */
export function WdkConnectButton() {
  const {
    isInitialized,
    isLocked,
    address,
  } = useWdk();

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

  // Connected state - show address only
  return (
    <a href="/wallet" className="btn btn-sm btn-ghost">
      {address && <Address address={address as `0x${string}`} disableAddressLink={true} />}
    </a>
  );
}

