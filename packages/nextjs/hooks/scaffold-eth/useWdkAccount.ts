import { useWdk, WdkAccount } from "~~/contexts/WdkContext";

/**
 * Hook to access the current WDK account
 * @returns WDK account object or null if not initialized
 */
export function useWdkAccount(): WdkAccount | null {
  const { account } = useWdk();
  return account;
}

