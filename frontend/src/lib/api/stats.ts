import { fetchApi } from "./client";
import type { ChainStats } from "./types";

/**
 * Fetch aggregate chain statistics by calling individual sub-endpoints in parallel.
 * Only calls endpoints known to work on Ethernal; broken endpoints
 * (averageGasPrice, cumulativeWalletCount, averageTransactionFee) are excluded.
 */
export async function getStats(): Promise<ChainStats> {
  const results = await Promise.allSettled([
    fetchApi<{ count: number }>("/stats/txCountTotal"),
    fetchApi<{ count: number }>("/stats/txCount24h"),
    fetchApi<{ count: number }>("/stats/activeWalletCount"),
  ]);

  return {
    txCountTotal:
      results[0].status === "fulfilled" ? results[0].value.count : 0,
    txCount24h: results[1].status === "fulfilled" ? results[1].value.count : 0,
    activeWalletCount:
      results[2].status === "fulfilled" ? results[2].value.count : 0,
  };
}
