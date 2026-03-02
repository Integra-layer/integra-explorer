"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddress } from "@/lib/api/addresses";
import { useExplorerReady } from "@/lib/explorer-provider";
import type { Address } from "@/lib/api/types";

/**
 * Fetch address info (balance, tx count, contract, token balances).
 * Falls back to a minimal Address object on 404 (Ethernal doesn't track all addresses).
 * Disabled when address is falsy. Gated on explorer auth.
 */
export function useAddress(address: string | undefined) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["address", address],
    queryFn: async (): Promise<Address> => {
      try {
        return await getAddress(address!);
      } catch {
        // Ethernal returns 404 for addresses not in its accounts table.
        // Return a minimal Address so the page still renders with activity feed.
        return {
          address: address!,
          balance: "0",
          transactionCount: 0,
        };
      }
    },
    enabled: isReady && !!address,
  });
}
