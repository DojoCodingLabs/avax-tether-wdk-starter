import { useQuery } from "@tanstack/react-query";
import { useWdk } from "~~/contexts/WdkContext";

interface UseWdkBalanceReturn {
  balance: bigint | null;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch and watch the current account balance
 * @param options - Query options
 * @returns Balance data and loading state
 */
export function useWdkBalance(options?: { watch?: boolean; refetchInterval?: number }): UseWdkBalanceReturn {
  const { account, address, balance: contextBalance, refreshBalance } = useWdk();
  const { watch = true, refetchInterval = 10000 } = options || {};

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["wdk-balance", address],
    queryFn: async () => {
      if (!account) return null;
      return await account.getBalance();
    },
    enabled: !!account && !!address,
    refetchInterval: watch ? refetchInterval : false,
    initialData: contextBalance,
  });

  return {
    balance: data ?? contextBalance,
    isLoading,
    refetch: () => {
      refreshBalance();
      refetch();
    },
  };
}

