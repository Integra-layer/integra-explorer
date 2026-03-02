"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddress } from "@/lib/api/addresses";

/**
 * Fetch address info (balance, tx count, contract, token balances).
 * Disabled when address is falsy.
 */
export function useAddress(address: string | undefined) {
  return useQuery({
    queryKey: ["address", address],
    queryFn: () => getAddress(address!),
    enabled: !!address,
  });
}
