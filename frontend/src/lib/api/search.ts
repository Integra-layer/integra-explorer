import { fetchApi } from "./client";
import type { SearchResult, SearchParams } from "./types";

/**
 * Search across blocks, transactions, addresses, contracts, and tokens.
 */
export async function search(params: SearchParams): Promise<SearchResult[]> {
  return fetchApi<SearchResult[]>("/search", {
    query: params.query,
    type: params.type,
  });
}
