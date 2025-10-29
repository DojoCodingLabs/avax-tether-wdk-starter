import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useWdk } from "~~/contexts/WdkContext";
import { useWdkProvider } from "./useWdkProvider";
import { useTargetNetwork } from "./useTargetNetwork";

type UseWatchBalanceParameters = {
  address?: Address;
};

/**
 * WDK-based balance hook. Polls balance every 4 seconds.
 * Fetches balance for any address using the provider.
 */
export const useWatchBalance = ({ address }: UseWatchBalanceParameters) => {
  const { account, isInitialized, address: wdkAddress } = useWdk();
  const provider = useWdkProvider();
  const { targetNetwork } = useTargetNetwork();

  // If no address provided, use the WDK account's own address
  const targetAddress = address || wdkAddress;

  const {
    data: balance,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["balance", targetAddress, targetNetwork.id],
    queryFn: async () => {
      if (!targetAddress) return null;
      
      try {
        // If querying our own address and we have an account, use it directly
        if (targetAddress === wdkAddress && account) {
          const balanceValue = await account.getBalance();
          return {
            decimals: targetNetwork.nativeCurrency.decimals,
            formatted: (Number(balanceValue) / 1e18).toFixed(4),
            symbol: targetNetwork.nativeCurrency.symbol,
            value: balanceValue,
          };
        }
        
        // For other addresses (including contracts), use the provider
        if (!provider) {
          console.warn("Provider not available for balance check");
          return null;
        }
        
        const balanceValue = await provider.getBalance(targetAddress);
        return {
          decimals: targetNetwork.nativeCurrency.decimals,
          formatted: (Number(balanceValue) / 1e18).toFixed(4),
          symbol: targetNetwork.nativeCurrency.symbol,
          value: balanceValue,
        };
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        throw error;
      }
    },
    enabled: !!targetAddress && (isInitialized || !!provider),
    refetchInterval: 4000, // Poll every 4 seconds
  });

  return {
    data: balance,
    isError,
    isLoading,
  };
};
