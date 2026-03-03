"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { getAddress } from "@/lib/api/addresses";
import { useExplorerReady } from "@/lib/explorer-provider";
import { integraTestnet } from "@/lib/appkit/chains";
import type { Address } from "@/lib/api/types";

const publicClient = createPublicClient({
  chain: integraTestnet,
  transport: http(),
});

/**
 * Fetch address info (balance, tx count, contract, token balances).
 * Falls back to a minimal Address object on 404 (Ethernal doesn't track all addresses).
 * Supplements Ethernal's balance with a direct on-chain RPC call via viem, since
 * Ethernal doesn't reliably track EOA native balances.
 * Disabled when address is falsy. Gated on explorer auth.
 */
export function useAddress(address: string | undefined) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["address", address],
    queryFn: async (): Promise<Address> => {
      // Fetch from Ethernal (may have contract info, token balances, etc.)
      let data: Address;
      try {
        data = await getAddress(address!);
      } catch {
        // Ethernal returns 404 for addresses not in its accounts table.
        // Return a minimal Address so the page still renders with activity feed.
        data = {
          address: address!,
          balance: "0",
          transactionCount: 0,
        };
      }

      // Supplement with on-chain balance via RPC — Ethernal's balance is unreliable for EOAs.
      try {
        const onChainBalance = await publicClient.getBalance({
          address: address! as `0x${string}`,
        });
        const balanceStr = onChainBalance.toString();
        // Use RPC balance if it's higher (more accurate) than Ethernal's reported value.
        if (BigInt(balanceStr) > BigInt(data.balance || "0")) {
          data = { ...data, balance: balanceStr };
        }
      } catch {
        // RPC failed — keep whatever Ethernal returned.
      }

      return data;
    },
    enabled: isReady && !!address,
  });
}
