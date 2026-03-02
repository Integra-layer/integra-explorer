"use client";

import { useQuery } from "@tanstack/react-query";
import { search } from "@/lib/api/search";
import { useExplorerReady } from "@/lib/explorer-provider";
import type { SearchResultType } from "@/lib/api/types";

/**
 * Search across blocks, transactions, addresses, contracts, and tokens.
 * Disabled when query is empty. Gated on explorer auth.
 */
export function useSearch(query: string, type?: SearchResultType) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => search({ query, type }),
    enabled: isReady && query.length > 0,
  });
}
