"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTokenContract,
  getKnownTokens,
  type KnownToken,
} from "@/lib/api/tokens";
import type { Contract } from "@/lib/api/types";

/**
 * Return the static list of known tokens.
 * Wrapped in useQuery for consistency but effectively instant.
 */
export function useKnownTokens() {
  return useQuery<KnownToken[]>({
    queryKey: ["known-tokens"],
    queryFn: () => getKnownTokens(),
    staleTime: Infinity,
  });
}

/**
 * Fetch on-chain contract data for a token address.
 * Disabled when address is falsy.
 */
export function useTokenContract(address: string | undefined) {
  return useQuery<Contract>({
    queryKey: ["token-contract", address],
    queryFn: () => getTokenContract(address!),
    enabled: !!address,
  });
}
