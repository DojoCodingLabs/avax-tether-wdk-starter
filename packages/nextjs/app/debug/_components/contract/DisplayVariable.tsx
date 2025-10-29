"use client";

import { useEffect } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { displayTxResult } from "./utilsDisplay";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAnimationConfig, useWdkProvider } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const { targetNetwork } = useTargetNetwork();
  const provider = useWdkProvider();

  const {
    data: result,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["contractRead", contractAddress, abiFunction.name, targetNetwork.id, refreshDisplayVariables],
    queryFn: async () => {
      if (!provider) throw new Error("Provider not available");
      
      const contract = new ethers.Contract(
        contractAddress,
        abi as any,
        provider
      );
      
      const result = await contract[abiFunction.name]();
      return result;
    },
    enabled: !!provider && !!contractAddress,
    retry: false,
  });

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center">
        <h3 className="font-medium text-lg mb-0 break-all">{abiFunction.name}</h3>
        <button className="btn btn-ghost btn-xs" onClick={async () => await refetch()}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="text-base-content/80 flex flex-col items-start">
        <div>
          <div
            className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-xs animate-pulse-fast" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  );
};
