"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useWdk } from "~~/contexts/WdkContext";

const Home: NextPage = () => {
  const { address, currentNetwork, isInitialized } = useWdk();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-4xl mx-auto">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">WDK Avalanche Starter</span>
            <span className="block text-lg mt-2 text-base-content/70">Powered by Scaffold-ETH 2</span>
          </h1>
          
          <div className="flex justify-center items-center space-x-2 flex-col mt-8">
            {isInitialized && address ? (
              <>
                <p className="my-2 font-medium">Connected Address:</p>
                <Address address={address as `0x${string}`} />
                <p className="text-sm text-base-content/70 mt-2">
                  Network: {currentNetwork.displayName}
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="my-2 font-medium text-base-content/70">Not connected</p>
                <Link href="/wallet" className="btn btn-primary btn-sm mt-2">
                  Connect Wallet
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="alert alert-info">
              <div>
                <h3 className="font-bold">🚀 Getting Started</h3>
                <div className="text-sm space-y-2 mt-2">
                  <p>1. Start local Avalanche node: <code className="bg-base-300 px-2 py-1 rounded">yarn avalanche:up</code></p>
                  <p>2. Deploy contracts: <code className="bg-base-300 px-2 py-1 rounded">yarn deploy:local</code></p>
                  <p>3. Connect your wallet on the <Link href="/wallet" className="link">Wallet page</Link></p>
                </div>
              </div>
            </div>

            <p className="text-center text-lg">
              Edit your smart contract{" "}
              <code className="italic bg-base-300 text-base font-bold px-2 py-1 rounded">
                YourContract.sol
              </code>{" "}
              in{" "}
              <code className="italic bg-base-300 text-base font-bold px-2 py-1 rounded">
                packages/hardhat/contracts
              </code>
            </p>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
