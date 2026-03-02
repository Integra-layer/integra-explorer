import { fetchApi } from "./client";
import type { ChainStats } from "./types";

/**
 * Safely fetch a stat value, returning a default on failure.
 * Some stats endpoints may not be available on all workspaces.
 */
async function safeFetch<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    return await fetchApi<T>(`/stats${endpoint}`);
  } catch {
    return fallback;
  }
}

/**
 * Fetch aggregate chain statistics by calling individual sub-endpoints in parallel.
 * Endpoints that fail (e.g. missing params) gracefully return defaults.
 */
export async function getStats(): Promise<ChainStats> {
  const [txTotal, tx24h, wallets, cumWallets, gasPrice, avgFee] =
    await Promise.all([
      safeFetch<{ count: number }>("/txCountTotal", { count: 0 }),
      safeFetch<{ count: number }>("/txCount24h", { count: 0 }),
      safeFetch<{ count: number }>("/activeWalletCount", { count: 0 }),
      safeFetch<{ count: number }>("/cumulativeWalletCount", { count: 0 }),
      safeFetch<{ averageGasPrice: string }>("/averageGasPrice", {
        averageGasPrice: "0",
      }),
      safeFetch<{ averageTransactionFee: string }>("/averageTransactionFee", {
        averageTransactionFee: "0",
      }),
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
