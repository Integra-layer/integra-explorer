"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlocks } from "@/lib/api/blocks";
import { useExplorerReady } from "@/lib/explorer-provider";

/**
 * Shared hook that fetches the latest single block with a 5s refetch interval.
 * Prevents duplicate ["blocks", 1, 1] queries across components (e.g. StatsGrid, NetworkStatusBar).
 */
export function useLatestBlock() {
  const isReady = useExplorerReady();

  return useQuery({
    queryKey: ["blocks", 1, 1],
    queryFn: () => getBlocks({ page: 1, itemsPerPage: 1 }),
    refetchInterval: 5_000,
    enabled: isReady,
  });
}
