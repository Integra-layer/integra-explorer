import { fetchApi } from "./client";
import type { ChainStats } from "./types";

/**
 * Fetch aggregate chain statistics by calling individual sub-endpoints in parallel.
 * The Ethernal backend does not have a single /stats endpoint — each metric
 * lives at its own path (e.g. /stats/txCountTotal, /stats/activeWalletCount).
 */
export async function getStats(): Promise<ChainStats> {
  const [txTotal, tx24h, wallets, cumWallets, gasPrice, avgFee] =
    await Promise.all([
      fetchApi<{ count: number }>("/stats/txCountTotal"),
      fetchApi<{ count: number }>("/stats/txCount24h"),
      fetchApi<{ count: number }>("/stats/activeWalletCount"),
      fetchApi<{ count: number }>("/stats/cumulativeWalletCount"),
      fetchApi<{ averageGasPrice: string }>("/stats/averageGasPrice"),
      fetchApi<{ averageTransactionFee: string }>(
        "/stats/averageTransactionFee",
      ),
    ]);

  return {
    txCountTotal: txTotal.count,
    txCount24h: tx24h.count,
    activeWalletCount: wallets.count,
    cumulativeWalletCount: cumWallets.count,
    averageGasPrice: gasPrice.averageGasPrice,
    averageTransactionFee: avgFee.averageTransactionFee,
  };
}
