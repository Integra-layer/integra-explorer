"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api/stats";
import { getSyncStatus } from "@/lib/api/explorer";

/**
 * Fetch aggregate chain statistics.
 * Refetches every 30 seconds to keep dashboard data fresh.
 */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 30_000,
  });
}

/**
 * Fetch the current sync status of the explorer backend.
 * Refetches every 10 seconds.
 */
export function useSyncStatus() {
  return useQuery({
    queryKey: ["syncStatus"],
    queryFn: getSyncStatus,
    refetchInterval: 10_000,
  });
}
