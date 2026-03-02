import { fetchApi } from "./client";
import type { Block, PaginatedResponse, PaginationParams } from "./types";

/**
 * Fetch a paginated list of blocks.
 */
export async function getBlocks(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Block>> {
  return fetchApi<PaginatedResponse<Block>>("/blocks", {
    page: String(params.page ?? 1),
    itemsPerPage: String(params.itemsPerPage ?? 25),
    order: params.order ?? "DESC",
  });
}

/**
 * Fetch a single block by block number (includes transactions).
 */
export async function getBlock(blockNumber: number): Promise<Block> {
  return fetchApi<Block>(`/blocks/${blockNumber}`);
}
