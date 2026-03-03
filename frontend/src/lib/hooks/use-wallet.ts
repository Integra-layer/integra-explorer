"use client";

import { useAppKitAccount } from "@reown/appkit/react";

/**
 * Returns the connected EVM wallet address, or undefined if not connected.
 */
export function useWalletAddress(): string | undefined {
  const { address, isConnected } = useAppKitAccount();
  return isConnected ? address : undefined;
}

/**
 * Returns true when a wallet is connected.
 */
export function useIsConnected(): boolean {
  const { isConnected } = useAppKitAccount();
  return isConnected;
}
