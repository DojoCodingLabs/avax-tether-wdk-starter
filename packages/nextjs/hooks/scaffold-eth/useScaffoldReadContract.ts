import { useQuery } from "@tanstack/react-query";
import type { ExtractAbiFunctionNames } from "abitype";
import { useWdk } from "~~/contexts/WdkContext";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { createWdkProvider, createReadContract, callReadFunction } from "~~/utils/scaffold-eth/wdkContract";
import {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  UseScaffoldReadConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper hook for reading contract data using WDK
 * Automatically loads contract ABI and address from deployedContracts.ts
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  functionName,
  args,
  ...readConfig
}: UseScaffoldReadConfig<TContractName, TFunctionName>) => {
  const { currentNetwork, isInitialized } = useWdk();
  
  const { data: deployedContract } = useDeployedContractInfo({
    contractName,
    chainId: currentNetwork.chainId as any,
  });

  const { query: queryOptions, watch, ...readContractConfig } = readConfig;
  const defaultWatch = watch ?? true;

  const queryResult = useQuery({
    queryKey: ["scaffold-read-contract", contractName, functionName, args, currentNetwork.chainId],
    queryFn: async () => {
      if (!deployedContract?.address || !deployedContract?.abi) {
        throw new Error(`Contract ${contractName} not deployed on ${currentNetwork.displayName}`);
      }

      try {
        // Create provider and contract instance
        const provider = createWdkProvider(currentNetwork.rpcUrl);
        const contract = createReadContract(deployedContract.address, [...deployedContract.abi] as any[], provider);

        // Call the read function
        const result = await callReadFunction(contract, functionName as string, args as any[] || []);
        
        return result;
      } catch (error) {
        console.error(`Error reading ${String(functionName)} from ${contractName}:`, error);
        throw error;
      }
    },
    enabled: isInitialized && !!deployedContract?.address && (!Array.isArray(args) || !args.some(arg => arg === undefined)),
    refetchInterval: defaultWatch ? 10000 : false, // Poll every 10 seconds if watching
    ...queryOptions,
  });

  return queryResult as any;
};
