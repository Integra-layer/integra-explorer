/**
 * Search type auto-detection hook.
 * Determines what kind of entity the user is searching for based on input pattern.
 */

export type SearchType = "address" | "transaction" | "block" | "token" | "unknown";

/**
 * Detect the search type from a raw query string.
 *
 * - Pure digits -> block number
 * - 0x + 64 hex chars -> transaction hash
 * - 0x + 40 hex chars -> address
 * - Partial hex (starts with 0x) -> heuristic based on length
 * - Anything else -> unknown (triggers text/fuzzy search)
 */
export function detectSearchType(query: string): SearchType {
  const trimmed = query.trim();
  if (!trimmed) return "unknown";

  // Block number (pure digits)
  if (/^\d+$/.test(trimmed)) return "block";

  // Transaction hash: 0x + 64 hex chars
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) return "transaction";

  // Address: 0x + 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return "address";

  // Partial hex (starts with 0x) — heuristic
  if (/^0x[a-fA-F0-9]+$/.test(trimmed)) {
    return trimmed.length > 42 ? "transaction" : "address";
  }

  return "unknown";
}

/**
 * Returns the route to navigate to based on search type detection.
 */
export function getSearchRoute(query: string): string {
  const type = detectSearchType(query);
  const trimmed = query.trim();

  switch (type) {
    case "block":
      return `/blocks/${trimmed}`;
    case "transaction":
      return `/transactions/${trimmed}`;
    case "address":
      return `/address/${trimmed}`;
    default:
      return `/search?q=${encodeURIComponent(trimmed)}`;
  }
}

/** Human-readable labels for each search type */
export const searchTypeLabels: Record<SearchType, string> = {
  address: "Address",
  transaction: "Tx Hash",
  block: "Block",
  token: "Token",
  unknown: "Search",
};
