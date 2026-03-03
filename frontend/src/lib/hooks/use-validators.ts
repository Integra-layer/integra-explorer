"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getValidators,
  getValidator,
  getStakingPool,
  getValidatorDelegations,
} from "@/lib/api/validators";
import { bech32ToEvmAddress } from "@/lib/bech32";

/**
 * Fetch all validators. Refetches every 60 seconds.
 */
export function useValidators() {
  return useQuery({
    queryKey: ["validators"],
    queryFn: getValidators,
    staleTime: 60_000,
  });
}

/**
 * Fetch a single validator by operator address.
 * Disabled when operatorAddress is empty/undefined.
 */
export function useValidator(operatorAddress: string) {
  return useQuery({
    queryKey: ["validator", operatorAddress],
    queryFn: () => getValidator(operatorAddress),
    enabled: !!operatorAddress,
  });
}

/**
 * Fetch staking pool data (bonded/not-bonded totals).
 * Refetches every 60 seconds.
 */
export function useStakingPool() {
  return useQuery({
    queryKey: ["staking-pool"],
    queryFn: getStakingPool,
    staleTime: 60_000,
  });
}

/**
 * Fetch delegations for a specific validator.
 * Disabled when operatorAddress is empty/undefined.
 */
export function useValidatorDelegations(operatorAddress: string) {
  return useQuery({
    queryKey: ["validator-delegations", operatorAddress],
    queryFn: () => getValidatorDelegations(operatorAddress),
    enabled: !!operatorAddress,
  });
}

/**
 * Build a lookup map: lowercase EVM address -> validator moniker.
 * Used to resolve block miner addresses to human-readable names.
 */
export function useValidatorMap() {
  const { data: validators } = useValidators();

  return useMemo(() => {
    const map = new Map<string, string>();
    if (!validators) return map;
    for (const v of validators) {
      const evmAddr = bech32ToEvmAddress(v.operator_address);
      if (evmAddr) {
        map.set(evmAddr.toLowerCase(), v.description.moniker || "Unknown");
      }
    }
    return map;
  }, [validators]);
}
