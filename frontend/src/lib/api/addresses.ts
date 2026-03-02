import { fetchApi } from "./client";
import type { Address } from "./types";

/**
 * Fetch address info including balance, transaction count, contract, and token balances.
 */
export async function getAddress(address: string): Promise<Address> {
  return fetchApi<Address>(`/addresses/${address}`);
}
