"use client";

import { useQuery } from "@tanstack/react-query";
import { search } from "@/lib/api/search";
import type { SearchResultType } from "@/lib/api/types";

/**
 * Search across blocks, transactions, addresses, contracts, and tokens.
 * Disabled when query is empty. Debounce at the call site for best UX.
 */
export function useSearch(query: string, type?: SearchResultType) {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => search({ query, type }),
    enabled: query.length > 0,
  });
}
