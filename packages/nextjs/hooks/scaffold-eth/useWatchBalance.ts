import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useWdk } from "~~/contexts/WdkContext";
import { useTargetNetwork } from "./useTargetNetwork";

type UseWatchBalanceParameters = {
  address?: Address;
};

/**
 * WDK-based balance hook. Polls balance every 4 seconds.
 */
export const useWatchBalance = ({ address }: UseWatchBalanceParameters) => {
  const { account, isInitialized, address: wdkAddress } = useWdk();
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
      if (!targetAddress || !isInitialized || !account) return null;
      
      try {
        // If querying our own address, use the account directly
        if (targetAddress === wdkAddress) {
          const balanceValue = await account.getBalance();
          return {
            decimals: targetNetwork.nativeCurrency.decimals,
            formatted: (Number(balanceValue) / 1e18).toFixed(4),
            symbol: targetNetwork.nativeCurrency.symbol,
            value: balanceValue,
          };
        }
        
        // For other addresses, we'd need to use a provider
        // For now, return null as WDK accounts primarily check their own balance
        console.warn("Balance checking for other addresses not yet implemented");
        return null;
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        throw error;
      }
    },
    enabled: !!targetAddress && isInitialized && !!account,
    refetchInterval: 4000, // Poll every 4 seconds
  });

  return {
    data: balance,
    isError,
    isLoading,
  };
};
