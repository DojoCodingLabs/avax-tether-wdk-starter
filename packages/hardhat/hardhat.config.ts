import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Avalanche local network pre-funded account (ewoq)
// This account is pre-funded with 1M AVAX when you start a local Avalanche network
// Address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
// WARNING: FOR LOCAL DEVELOPMENT ONLY! Never use this on mainnet!
const avalancheLocalPrivateKey = "56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027";

// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_V2_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    // Avalanche Networks
    avalancheLocal: {
      url: "http://127.0.0.1:9650/ext/bc/C/rpc",
      chainId: 1337, // Docker AvalancheGo uses 1337 for local network
      accounts: [avalancheLocalPrivateKey], // Use pre-funded ewoq account for local
    },
    avalancheFuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [deployerPrivateKey], 
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: [deployerPrivateKey],
    },
  },
  // Configuration for harhdat-verify plugin
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  // Configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
