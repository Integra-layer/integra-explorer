"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactions, getTransaction } from "@/lib/api/transactions";
import { fetchApi } from "@/lib/api/client";
import { useExplorerReady } from "@/lib/explorer-provider";
import type { Transaction, PaginatedResponse } from "@/lib/api/types";

/**
 * Fetch a paginated list of transactions.
 * Gated on explorer auth being resolved.
 */
export function useTransactions(page = 1, itemsPerPage = 25) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["transactions", page, itemsPerPage],
    queryFn: () => getTransactions({ page, itemsPerPage }),
    enabled: isReady,
  });
}

/**
 * Fetch a single transaction by hash.
 * Disabled when hash is falsy.
 */
export function useTransaction(hash: string | undefined) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["transaction", hash],
    queryFn: () => getTransaction(hash!),
    enabled: isReady && !!hash,
  });
}

/**
 * Fetch transactions for a specific address.
 * Gated on explorer auth being resolved and address being truthy.
 */
export function useAddressTransactions(address: string) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["address-transactions", address],
    queryFn: () =>
      fetchApi<PaginatedResponse<Transaction>>("/transactions", {
        address,
        itemsPerPage: "50",
        order: "DESC",
      }),
    enabled: isReady && !!address,
  });
}
