import { useWdk, WdkAccount } from "~~/contexts/WdkContext";

/**
 * Hook to access the WDK signer (account)
 * The WDK account object can sign transactions and messages
 * @returns WDK account as signer or null if not initialized
 */
export function useWdkSigner(): WdkAccount | null {
  const { account } = useWdk();
  return account;
}

