"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactions, getTransaction } from "@/lib/api/transactions";

/**
 * Fetch a paginated list of transactions.
 * Refetches when page or itemsPerPage change.
 */
export function useTransactions(page = 1, itemsPerPage = 25) {
  return useQuery({
    queryKey: ["transactions", page, itemsPerPage],
    queryFn: () => getTransactions({ page, itemsPerPage }),
  });
}

/**
 * Fetch a single transaction by hash.
 * Disabled when hash is falsy.
 */
export function useTransaction(hash: string | undefined) {
  return useQuery({
    queryKey: ["transaction", hash],
    queryFn: () => getTransaction(hash!),
    enabled: !!hash,
  });
}
