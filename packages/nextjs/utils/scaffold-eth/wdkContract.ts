/**
 * WDK Contract Utilities
 * Helper functions for contract interactions using WDK
 */

import { ethers } from "ethers";
import { WdkAccount } from "~~/contexts/WdkContext";

/**
 * Create a JSON-RPC provider for read-only operations
 */
export function createWdkProvider(rpcUrl: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Create a contract instance for reading
 */
export function createReadContract(
  address: string,
  abi: any[],
  provider: ethers.JsonRpcProvider
): ethers.Contract {
  return new ethers.Contract(address, abi, provider);
}

/**
 * Call a read-only contract function
 */
export async function callReadFunction(
  contract: ethers.Contract,
  functionName: string,
  args: any[] = []
): Promise<any> {
  return await contract[functionName](...args);
}

/**
 * Encode contract call data for transactions
 */
export function encodeContractCall(
  abi: any[],
  functionName: string,
  args: any[] = []
): string {
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData(functionName, args);
}

/**
 * Decode contract call result
 */
export function decodeContractResult(
  abi: any[],
  functionName: string,
  data: string
): any {
  const iface = new ethers.Interface(abi);
  return iface.decodeFunctionResult(functionName, data);
}

/**
 * Execute a write transaction using WDK account
 */
export async function executeWriteTransaction(
  account: WdkAccount,
  contractAddress: string,
  data: string,
  value: bigint = 0n
): Promise<{ hash: string }> {
  return await account.sendTransaction({
    to: contractAddress,
    value,
    data,
  });
}

/**
 * Estimate gas for a write transaction
 */
export async function estimateTransactionFee(
  account: WdkAccount,
  contractAddress: string,
  data: string,
  value: bigint = 0n
): Promise<bigint> {
  const quote = await account.quoteSendTransaction({
    to: contractAddress,
    value,
    data,
  });
  return quote.fee;
}

/**
 * Parse contract events from transaction receipt
 */
export function parseContractEvents(
  abi: any[],
  logs: any[]
): ethers.LogDescription[] {
  const iface = new ethers.Interface(abi);
  return logs
    .map(log => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter((log): log is ethers.LogDescription => log !== null);
}

/**
 * Get event filter for querying events
 */
export function createEventFilter(
  contract: ethers.Contract,
  eventName: string,
  fromBlock?: number,
  toBlock?: number | string
) {
  const filter = contract.filters[eventName]();
  return {
    ...filter,
    fromBlock,
    toBlock: toBlock || "latest",
  };
}

/**
 * Query contract events
 */
export async function queryContractEvents(
  contract: ethers.Contract,
  eventName: string,
  fromBlock?: number,
  toBlock?: number | string
): Promise<any[]> {
  const filter = createEventFilter(contract, eventName, fromBlock, toBlock);
  return await contract.queryFilter(filter);
}

