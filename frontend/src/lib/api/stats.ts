import { fetchApi } from "./client";
import type { ChainStats } from "./types";

/**
 * Fetch aggregate chain statistics (tx counts, block counts, wallet counts, gas).
 */
export async function getStats(): Promise<ChainStats> {
  return fetchApi<ChainStats>("/stats");
}
