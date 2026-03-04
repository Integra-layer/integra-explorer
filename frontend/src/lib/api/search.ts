import { fetchApi } from "./client";
import type { Contract, PaginatedResponse } from "./types";
import { KNOWN_TOKENS } from "./tokens";
import type { KnownToken } from "./tokens";

// =============================================================================
// Search API
// Fuzzy/name-filter searches for contracts and tokens.
// =============================================================================

export type { KnownToken };

/**
 * Search contracts by name using the /contracts endpoint with a filter param.
 */
export async function searchContracts(query: string): Promise<Contract[]> {
  const result = await fetchApi<PaginatedResponse<Contract>>("/contracts", {
    name: query,
    itemsPerPage: "20",
    page: "1",
    order: "DESC",
  });
  return result.items ?? [];
}

/**
 * Search tokens by filtering the known static token registry.
 * Since Ethernal has no dedicated /tokens endpoint, we match against the
 * static KNOWN_TOKENS list and optionally against the contracts endpoint.
 */
export function searchTokens(query: string): KnownToken[] {
  const lower = query.toLowerCase();
  return KNOWN_TOKENS.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.symbol.toLowerCase().includes(lower) ||
      t.address.toLowerCase().includes(lower),
  );
}
