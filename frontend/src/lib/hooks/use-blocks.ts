"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlocks, getBlock } from "@/lib/api/blocks";

/**
 * Fetch a paginated list of blocks.
 * Refetches when page or itemsPerPage change.
 */
export function useBlocks(page = 1, itemsPerPage = 25) {
  return useQuery({
    queryKey: ["blocks", page, itemsPerPage],
    queryFn: () => getBlocks({ page, itemsPerPage }),
  });
}

/**
 * Fetch a single block by number.
 * Disabled when blockNumber is falsy (0 or undefined).
 */
export function useBlock(blockNumber: number | undefined) {
  return useQuery({
    queryKey: ["block", blockNumber],
    queryFn: () => getBlock(blockNumber!),
    enabled: blockNumber !== undefined && blockNumber >= 0,
  });
}
