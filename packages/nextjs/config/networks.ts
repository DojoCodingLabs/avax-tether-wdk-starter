export interface AvalancheNetwork {
  id: string;
  name: string;
  displayName: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const AVALANCHE_NETWORKS: Record<string, AvalancheNetwork> = {
  local: {
    id: "local",
    name: "avalanche-local",
    displayName: "Local Avalanche",
    chainId: 1337, // Docker AvalancheGo uses 1337 for local network
    rpcUrl: "http://127.0.0.1:9650/ext/bc/C/rpc",
    blockExplorer: "http://localhost:4000",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  fuji: {
    id: "fuji",
    name: "avalanche-fuji",
    displayName: "Fuji Testnet",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  mainnet: {
    id: "mainnet",
    name: "avalanche",
    displayName: "Avalanche Mainnet",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
} as const;

export type NetworkId = keyof typeof AVALANCHE_NETWORKS;

export const DEFAULT_NETWORK: NetworkId = "local";

export function getNetworkById(id: NetworkId): AvalancheNetwork {
  return AVALANCHE_NETWORKS[id];
}

export function getNetworkByChainId(chainId: number): AvalancheNetwork | undefined {
  return Object.values(AVALANCHE_NETWORKS).find(network => network.chainId === chainId);
}

