"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlocks, getBlock } from "@/lib/api/blocks";
import { useExplorerReady } from "@/lib/explorer-provider";

/**
 * Fetch a paginated list of blocks.
 * Gated on explorer auth being resolved.
 */
export function useBlocks(page = 1, itemsPerPage = 25) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["blocks", page, itemsPerPage],
    queryFn: () => getBlocks({ page, itemsPerPage }),
    enabled: isReady,
  });
}

/**
 * Fetch a single block by number.
 * Disabled when blockNumber is falsy (0 or undefined).
 */
export function useBlock(blockNumber: number | undefined) {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["block", blockNumber],
    queryFn: () => getBlock(blockNumber!),
    enabled: isReady && blockNumber !== undefined && blockNumber >= 0,
  });
}
