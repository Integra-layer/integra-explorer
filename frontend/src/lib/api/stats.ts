import { fetchApi } from "./client";
import type { ChainStats } from "./types";

/**
 * Fetch aggregate chain statistics by calling individual sub-endpoints in parallel.
 * Only calls endpoints known to work on Ethernal; broken endpoints
 * (averageGasPrice, cumulativeWalletCount, averageTransactionFee) are excluded.
 */
export async function getStats(): Promise<ChainStats> {
  const [txTotal, tx24h, wallets] = await Promise.all([
    fetchApi<{ count: number }>("/stats/txCountTotal"),
    fetchApi<{ count: number }>("/stats/txCount24h"),
    fetchApi<{ count: number }>("/stats/activeWalletCount"),
  ]);

  return {
    txCountTotal: txTotal.count,
    txCount24h: tx24h.count,
    activeWalletCount: wallets.count,
  };
}
