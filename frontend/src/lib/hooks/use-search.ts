"use client";

import { useQuery } from "@tanstack/react-query";
import { searchContracts, searchTokens } from "@/lib/api/search";
import { useExplorerReady } from "@/lib/explorer-provider";

/**
 * Parallel search hook for contracts and tokens.
 * Returns combined results, loading state, and errors.
 * Queries are disabled when query is empty.
 */
export function useSearch(query: string) {
  const isReady = useExplorerReady();
  const enabled = isReady && !!query;

  const contractsQuery = useQuery({
    queryKey: ["search", "contracts", query],
    queryFn: () => searchContracts(query),
    enabled,
    staleTime: 30_000,
  });

  // Token search is synchronous (static list), wrap in useQuery for consistency
  const tokensQuery = useQuery({
    queryKey: ["search", "tokens", query],
    queryFn: () => searchTokens(query),
    enabled: !!query,
    staleTime: Infinity,
  });

  return {
    contracts: contractsQuery.data ?? [],
    tokens: tokensQuery.data ?? [],
    isLoading: contractsQuery.isLoading || tokensQuery.isLoading,
    error: contractsQuery.error ?? tokensQuery.error,
  };
}
