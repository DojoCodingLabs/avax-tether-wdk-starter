import { useWdk } from "~~/contexts/WdkContext";

/**
 * Hook to access the raw WDK instance for advanced usage
 * @returns WDK instance or null if not initialized
 */
export function useWdkProvider(): any | null {
  const { wdkInstance } = useWdk();
  return wdkInstance;
}

