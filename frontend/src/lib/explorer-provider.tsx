"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getExplorerConfig } from "@/lib/api/explorer";

/**
 * Resolves explorer config (workspace name + firebaseUserId) once on mount.
 * After resolution, invalidates all queries so they refetch with proper auth.
 * Must be placed INSIDE QueryProvider to access the query client.
 */
export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const domain = window.location.hostname;
    getExplorerConfig(domain)
      .then(() => {
        // Auth params now set — force all queries to refetch with them
        queryClient.invalidateQueries();
      })
      .catch((err) => {
        console.error("[ExplorerProvider] Failed to resolve explorer config:", err);
      });
  }, [queryClient]);

  return <>{children}</>;
}
