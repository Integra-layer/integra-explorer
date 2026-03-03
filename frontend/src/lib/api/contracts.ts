import { fetchApi } from "./client";
import type { Contract, PaginatedResponse } from "./types";

/**
 * Fetch contract info including ABI, token metadata, and verification status.
 */
export async function getContract(address: string): Promise<Contract> {
  return fetchApi<Contract>(`/contracts/${address}`);
}

/**
 * Fetch a paginated list of contracts.
 */
export async function getContracts(
  page: number = 1,
  perPage: number = 25,
): Promise<PaginatedResponse<Contract>> {
  return fetchApi<PaginatedResponse<Contract>>("/contracts", {
    page: String(page),
    itemsPerPage: String(perPage),
    order: "DESC",
  });
}

// ---------------------------------------------------------------------------
// ABI Parsing
// ---------------------------------------------------------------------------

export interface AbiFunction {
  name: string;
  type: "function" | "event" | "constructor";
  stateMutability?: "view" | "pure" | "nonpayable" | "payable";
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
}

/**
 * Extract all function entries from a raw ABI array.
 */
export function parseAbiFunctions(abi: unknown[] | null): AbiFunction[] {
  if (!abi) return [];
  return abi.filter((item: any) => item.type === "function") as AbiFunction[];
}

/**
 * Extract all event entries from a raw ABI array.
 */
export function parseAbiEvents(abi: unknown[] | null): AbiFunction[] {
  if (!abi) return [];
  return abi.filter((item: any) => item.type === "event") as AbiFunction[];
}
