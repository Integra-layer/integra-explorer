"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import {
  useSendTransaction,
  useSignMessage as useWagmiSignMessage,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useCallback } from "react";

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

/**
 * Send native IRL tokens to an address.
 */
export function useSendIRL() {
  const {
    sendTransaction,
    data: hash,
    isPending,
    error,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const send = useCallback(
    (to: string, amountIRL: string) => {
      sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amountIRL),
      });
    },
    [sendTransaction],
  );

  return { send, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Sign an arbitrary message with the connected wallet.
 */
export function useSignMessage() {
  const {
    signMessage,
    data: signature,
    isPending,
    error,
  } = useWagmiSignMessage();

  const sign = useCallback(
    (message: string) => {
      signMessage({ message });
    },
    [signMessage],
  );

  return { sign, signature, isPending, error };
}

/**
 * Read/write a contract function via wagmi.
 */
export function useContractInteraction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const write = useCallback(
    (params: {
      address: string;
      abi: unknown[];
      functionName: string;
      args?: unknown[];
      value?: bigint;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- wagmi overloads are too strict for generic usage
      const config: any = {
        address: params.address as `0x${string}`,
        abi: params.abi as readonly unknown[],
        functionName: params.functionName,
        args: params.args,
      };
      if (params.value !== undefined) {
        config.value = params.value;
      }
      writeContract(config);
    },
    [writeContract],
  );

  return { write, hash, isPending, isConfirming, isSuccess, error };
}
