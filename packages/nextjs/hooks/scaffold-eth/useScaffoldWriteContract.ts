import { useState, useCallback } from "react";
import { ExtractAbiFunctionNames } from "abitype";
import { useWdk } from "~~/contexts/WdkContext";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { encodeContractCall, executeWriteTransaction, estimateTransactionFee } from "~~/utils/scaffold-eth/wdkContract";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
  UseScaffoldWriteConfig,
} from "~~/utils/scaffold-eth/contract";

type ScaffoldWriteContractReturnType<TContractName extends ContractName> = {
  writeContractAsync: <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => Promise<{ hash: string } | undefined>;
  
  writeContract: <TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">>(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => void;
  
  isMining: boolean;
  isPending: boolean;
  data: { hash: string } | undefined;
  error: Error | null;
  reset: () => void;
};

export function useScaffoldWriteContract<TContractName extends ContractName>(
  config: UseScaffoldWriteConfig<TContractName>,
): ScaffoldWriteContractReturnType<TContractName>;

export function useScaffoldWriteContract<TContractName extends ContractName>(
  contractName: TContractName,
): ScaffoldWriteContractReturnType<TContractName>;

/**
 * Wrapper hook for writing to contracts using WDK
 * Automatically loads contract ABI and address from deployedContracts.ts
 * @param configOrName - contract name or config object
 */
export function useScaffoldWriteContract<TContractName extends ContractName>(
  configOrName: UseScaffoldWriteConfig<TContractName> | TContractName,
): ScaffoldWriteContractReturnType<TContractName> {
  const finalConfig =
    typeof configOrName === "string"
      ? { contractName: configOrName, chainId: undefined }
      : (configOrName as UseScaffoldWriteConfig<TContractName>);
  
  const { contractName, chainId } = finalConfig;

  const { currentNetwork, account, address, isInitialized } = useWdk();
  const [isMining, setIsMining] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<{ hash: string } | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const { data: deployedContractData } = useDeployedContractInfo({
    contractName,
    chainId: currentNetwork.chainId as any,
  });

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsMining(false);
    setIsPending(false);
  }, []);

  const writeContractAsync = useCallback(
    async (
      variables: ScaffoldWriteContractVariables<TContractName, any>,
      options?: ScaffoldWriteContractOptions,
    ): Promise<{ hash: string } | undefined> => {
      if (!deployedContractData) {
        notification.error("Target Contract is not deployed, did you forget to run deployment?");
        return;
      }

      if (!account || !address) {
        notification.error("Please unlock your wallet first");
        return;
      }

      if (!isInitialized) {
        notification.error("Wallet is not initialized");
        return;
      }

      try {
        setIsMining(true);
        setIsPending(true);
        setError(null);

        const { functionName, args, value } = variables as any;

        // Encode the contract call
        const data = encodeContractCall(
          deployedContractData.abi as any[],
          functionName,
          args || []
        );

        // Convert value to bigint if provided
        const valueBigInt = value ? BigInt(value.toString()) : 0n;

        // Estimate gas if needed
        if (!finalConfig?.disableSimulate) {
          try {
            const fee = await estimateTransactionFee(
              account,
              deployedContractData.address,
              data,
              valueBigInt
            );
            console.log(`Estimated transaction fee: ${fee.toString()}`);
          } catch (estimateError) {
            console.warn("Gas estimation failed, proceeding anyway:", estimateError);
          }
        }

        // Execute the transaction
        notification.loading("Sending transaction...");
        const result = await executeWriteTransaction(
          account,
          deployedContractData.address,
          data,
          valueBigInt
        );

        setData(result);
        notification.remove();
        notification.success(
          `Transaction sent successfully! Hash: ${result.hash}`
        );

        // Call success callback if provided
        if (options?.onSuccess) {
          options.onSuccess(result as any, variables as any, undefined);
        }

        return result;
      } catch (e: any) {
        const errorMessage = e?.message || "Transaction failed";
        setError(e);
        notification.remove();
        notification.error(errorMessage);
        
        // Call error callback if provided
        if (options?.onError) {
          options.onError(e, variables as any, undefined);
        }
        
        throw e;
      } finally {
        setIsMining(false);
        setIsPending(false);
      }
    },
    [deployedContractData, account, address, isInitialized, currentNetwork, finalConfig?.disableSimulate]
  );

  const writeContract = useCallback(
    (
      variables: ScaffoldWriteContractVariables<TContractName, any>,
      options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
    ): void => {
      writeContractAsync(variables, options).catch(error => {
        console.error("Write contract error:", error);
      });
    },
    [writeContractAsync]
  );

  return {
    writeContractAsync,
    writeContract,
    isMining,
    isPending,
    data,
    error,
    reset,
  };
}
