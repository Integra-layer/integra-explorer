"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getValidators,
  getValidator,
  getStakingPool,
  getValidatorDelegations,
} from "@/lib/api/validators";

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
