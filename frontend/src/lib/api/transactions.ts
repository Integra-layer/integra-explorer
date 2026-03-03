import { fetchApi } from "./client";
import type { Transaction, PaginatedResponse, PaginationParams } from "./types";

/**
 * Fetch a paginated list of transactions.
 */
export async function getTransactions(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Transaction>> {
  return fetchApi<PaginatedResponse<Transaction>>("/transactions", {
    page: String(params.page ?? 1),
    itemsPerPage: String(params.itemsPerPage ?? 25),
    order: params.order ?? "DESC",
  });
}

/**
 * Fetch a single transaction by hash.
 */
export async function getTransaction(hash: string): Promise<Transaction> {
  return fetchApi<Transaction>(`/transactions/${hash}`);
}

/**
 * Fetch all transactions for a specific block number.
 */
export async function getBlockTransactions(
  blockNumber: number,
  params: PaginationParams = {},
): Promise<PaginatedResponse<Transaction>> {
  return fetchApi<PaginatedResponse<Transaction>>("/transactions", {
    blockNumber: String(blockNumber),
    page: String(params.page ?? 1),
    itemsPerPage: String(params.itemsPerPage ?? 25),
    order: params.order ?? "ASC",
  });
}
