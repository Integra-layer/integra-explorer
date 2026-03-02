"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api/stats";
import { useExplorerReady } from "@/lib/explorer-provider";

/**
 * Fetch aggregate chain statistics.
 * Gated on explorer auth being resolved. Refetches every 30 seconds.
 */
export function useStats() {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 30_000,
    enabled: isReady,
  });
}
