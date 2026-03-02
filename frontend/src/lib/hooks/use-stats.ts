"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api/stats";
import { getSyncStatus } from "@/lib/api/explorer";
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

/**
 * Fetch the current sync status of the explorer backend.
 * Gated on explorer auth being resolved. Refetches every 10 seconds.
 */
export function useSyncStatus() {
  const isReady = useExplorerReady();
  return useQuery({
    queryKey: ["syncStatus"],
    queryFn: getSyncStatus,
    refetchInterval: 10_000,
    enabled: isReady,
  });
}
