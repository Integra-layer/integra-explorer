"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddress } from "@/lib/api/addresses";
import { useExplorerReady } from "@/lib/explorer-provider";

/**
 * Fetch address info (balance, tx count, contract, token balances).
 * Disabled when address is falsy. Gated on explorer auth.
 */
export function useAddress(address: string | undefined) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["address", address],
    queryFn: () => getAddress(address!),
    enabled: isReady && !!address,
  });
}
