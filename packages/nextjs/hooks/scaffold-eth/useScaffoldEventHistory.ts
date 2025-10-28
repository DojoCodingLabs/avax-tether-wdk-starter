import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExtractAbiEventNames } from "abitype";
import { ethers } from "ethers";
import { useWdk } from "~~/contexts/WdkContext";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { createWdkProvider, createReadContract } from "~~/utils/scaffold-eth/wdkContract";
import {
  ContractAbi,
  ContractName,
  UseScaffoldEventHistoryConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * @deprecated **Recommended only for local (hardhat/anvil) chains and development.**
 * For production, use an indexer such as ponder.sh or similar to query contract events efficiently.
 *
 * Reads events from a deployed contract using WDK
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - optional block number to start reading events from
 * @param config.toBlock - optional block number to stop reading events at
 * @param config.watch - if set to true, the events will be updated periodically (default: false)
 * @param config.enabled - set this to false to disable the hook from running (default: true)
 */
export const useScaffoldEventHistory = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  fromBlock,
  toBlock,
  watch,
  enabled = true,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName, false, false, false>) => {
  const { currentNetwork, isInitialized } = useWdk();
  const [events, setEvents] = useState<any[]>([]);

  const { data: deployedContractData } = useDeployedContractInfo({
    contractName,
    chainId: currentNetwork.chainId as any,
  });

  const fetchEvents = async () => {
    if (!deployedContractData?.address || !deployedContractData?.abi) {
      return [];
    }

    try {
      const provider = createWdkProvider(currentNetwork.rpcUrl);
      const contract = createReadContract(deployedContractData.address, deployedContractData.abi, provider);

      // Get current block number if toBlock not specified
      const currentBlock = toBlock || await provider.getBlockNumber();
      const startBlock = fromBlock || 0;

      // Create event filter
      const filter = contract.filters[eventName as string]();
      
      // Query events
      const logs = await contract.queryFilter(
        filter,
        typeof startBlock === 'bigint' ? Number(startBlock) : startBlock,
        typeof currentBlock === 'bigint' ? Number(currentBlock) : currentBlock
      );

      // Parse events
      const parsedEvents = logs.map(log => {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        return {
          ...log,
          args: parsed?.args,
          eventName: parsed?.name,
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex,
          logIndex: log.index,
        };
      });

      return parsedEvents;
    } catch (error) {
      console.error(`Error fetching events for ${contractName}:`, error);
      return [];
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["scaffold-event-history", contractName, eventName, fromBlock, toBlock, currentNetwork.chainId],
    queryFn: fetchEvents,
    enabled: enabled && isInitialized && !!deployedContractData?.address,
    refetchInterval: watch ? 10000 : false, // Poll every 10 seconds if watching
  });

  useEffect(() => {
    if (data) {
      setEvents(data);
    }
  }, [data]);

  return {
    data: events,
    isLoading,
    error,
    refetch,
  };
};
