"use client";

import { useEffect, useRef } from "react";
import { getExplorerConfig } from "@/lib/api/explorer";

/**
 * Resolves explorer config (workspace name + firebaseUserId) once on mount.
 * Must be placed before QueryProvider so workspace params are set before
 * any data queries fire.
 */
export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const domain = window.location.hostname;
    getExplorerConfig(domain).catch((err) => {
      console.error("[ExplorerProvider] Failed to resolve explorer config:", err);
    });
  }, []);

  return <>{children}</>;
}
