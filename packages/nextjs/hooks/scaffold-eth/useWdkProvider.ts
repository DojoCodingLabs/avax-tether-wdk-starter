import { useMemo } from "react";
import { ethers } from "ethers";
import { useWdk } from "~~/contexts/WdkContext";

/**
 * Hook to access an ethers.js provider for the current network
 * @returns ethers.js JsonRpcProvider or null if not initialized
 */
export function useWdkProvider(): ethers.JsonRpcProvider | null {
  const { currentNetwork, isInitialized } = useWdk();
  
  return useMemo(() => {
    if (!isInitialized || !currentNetwork?.rpcUrl) {
      return null;
    }
    
    try {
      return new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
    } catch (error) {
      console.error("Failed to create provider:", error);
      return null;
    }
  }, [currentNetwork?.rpcUrl, isInitialized]);
}

