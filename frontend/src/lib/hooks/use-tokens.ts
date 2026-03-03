"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTokenContract,
  getKnownTokens,
  type KnownToken,
} from "@/lib/api/tokens";
import { useExplorerReady } from "@/lib/explorer-provider";
import type { Contract } from "@/lib/api/types";

/**
 * Return the static list of known tokens.
 * Direct return — no async overhead for synchronous static data.
 */
export function useKnownTokens() {
  return { data: getKnownTokens(), isLoading: false };
}

/**
 * Fetch on-chain contract data for a token address.
 * Disabled when address is falsy. Gated on explorer auth.
 */
export function useTokenContract(address: string | undefined) {
  const isReady = useExplorerReady();
  return useQuery<Contract>({
    queryKey: ["token-contract", address],
    queryFn: () => getTokenContract(address!),
    enabled: isReady && !!address,
  });
}
