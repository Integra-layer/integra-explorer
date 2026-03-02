import { fetchApi } from "./client";
import type { Contract } from "./types";

/**
 * Fetch contract info including ABI, token metadata, and verification status.
 */
export async function getContract(address: string): Promise<Contract> {
  return fetchApi<Contract>(`/contracts/${address}`);
}
