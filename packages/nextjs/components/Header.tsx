"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { WdkConnectButton } from "~~/components/scaffold-eth/WdkConnectButton";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useWdk } from "~~/contexts/WdkContext";
import { AVALANCHE_NETWORKS, NetworkId } from "~~/config/networks";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Avalanche Wallet",
    href: "/wallet",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Network Selector Component for Header
 */
const NetworkSelector = () => {
  const { currentNetwork, switchNetwork, isSwitchingNetwork, isInitialized } = useWdk();
  const networkMenuRef = useRef<HTMLDetailsElement>(null);

  const handleNetworkSwitch = async (networkId: NetworkId) => {
    // Close the dropdown
    networkMenuRef.current?.removeAttribute("open");
    
    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Only show if wallet is initialized
  if (!isInitialized) {
    return null;
  }

  const networkColors = {
    local: "bg-yellow-500",
    fuji: "bg-blue-500",
    mainnet: "bg-red-500",
  };

  const networkColor = networkColors[currentNetwork.id as keyof typeof networkColors] || "bg-gray-500";

  return (
    <details className="dropdown dropdown-end" ref={networkMenuRef}>
      <summary 
        className="btn btn-sm btn-ghost gap-2 normal-case list-none cursor-pointer"
        style={{ listStyle: 'none' }}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${networkColor}`} />
        <span className="hidden sm:inline text-sm font-medium">{currentNetwork.displayName}</span>
        <span className="sm:hidden text-xs">{currentNetwork.id.toUpperCase()}</span>
        {isSwitchingNetwork && <span className="loading loading-spinner loading-xs"></span>}
        <svg className="fill-current w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </summary>
      <ul className="menu dropdown-content mt-2 p-2 shadow-lg bg-base-200 rounded-box w-56 z-50">
        {Object.values(AVALANCHE_NETWORKS).map((network) => (
          <li key={network.id}>
            <button
              onClick={() => handleNetworkSwitch(network.id as NetworkId)}
              className={`flex items-center gap-3 ${currentNetwork.id === network.id ? 'active' : ''}`}
              disabled={isSwitchingNetwork}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${networkColors[network.id as keyof typeof networkColors]}`} />
              <div className="flex flex-col items-start">
                <span className="font-medium">{network.displayName}</span>
                <span className="text-xs text-base-content/60">Chain ID: {network.chainId}</span>
              </div>
              {currentNetwork.id === network.id && (
                <span className="ml-auto text-success">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { currentNetwork } = useWdk();
  const isLocalNetwork = currentNetwork.id === "local";

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">WDK Avalanche</span>
            <span className="text-xs">Powered by Scaffold-ETH 2</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 gap-2">
        <NetworkSelector />
        <WdkConnectButton />
      </div>
    </div>
  );
};
