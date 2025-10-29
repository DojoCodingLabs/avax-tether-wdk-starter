"use client";

import { useEffect, useMemo, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { ethers } from "ethers";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useWdk } from "~~/contexts/WdkContext";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useWdkProvider } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const { account, currentNetwork, isInitialized } = useWdk();
  const provider = useWdkProvider();
  const { targetNetwork } = useTargetNetwork();
  
  const writeDisabled = !isInitialized || !account || currentNetwork.chainId !== targetNetwork.id;

  const handleWrite = async () => {
    if (!account || !provider) {
      notification.error("Wallet not connected");
      return;
    }

    setIsPending(true);
    try {
      // Encode the contract function call
      const contractInterface = new ethers.Interface(abi as any);
      const args = getParsedContractFunctionArgs(form);
      const data = contractInterface.encodeFunctionData(abiFunction.name, args);
      
      const value = txValue ? BigInt(txValue) : BigInt(0);
      
      // Send transaction using WDK account
      const tx = await account.sendTransaction({
        to: contractAddress,
        value: value,
        data: data,
      });
      
      notification.info("Transaction sent! Waiting for confirmation...");
      setTxHash(tx.hash);
      
      // Wait for transaction receipt
      const receipt = await provider.waitForTransaction(tx.hash);
      setDisplayedTxResult(receipt as any);
      
      notification.success("Transaction confirmed!");
      onChange();
    } catch (e: any) {
      console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      notification.error(e?.message || "Transaction failed");
    } finally {
      setIsPending(false);
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();

  const transformedFunction = useMemo(() => transformAbiFunction(abiFunction), [abiFunction]);
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="grow basis-0">{displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}</div>
          )}
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:-translate-x-1/3 before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button className="btn btn-secondary btn-sm" disabled={writeDisabled || isPending} onClick={handleWrite}>
              {isPending && <span className="loading loading-spinner loading-xs"></span>}
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && displayedTxResult ? (
        <div className="grow basis-0">
          <TxReceipt txResult={displayedTxResult} />
        </div>
      ) : null}
    </div>
  );
};
