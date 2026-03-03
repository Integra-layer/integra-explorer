"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getExplorerConfig } from "@/lib/api/explorer";

/**
 * Context that signals when explorer auth (workspace + firebaseUserId) is resolved.
 * All data hooks should gate on `isReady` to avoid firing before auth params are set.
 */
const ExplorerContext = createContext({
  isReady: false,
  error: null as string | null,
});

export function useExplorerReady(): boolean {
  return useContext(ExplorerContext).isReady;
}

/**
 * Resolves explorer config (workspace name + firebaseUserId) once on mount.
 * Sets `isReady` to true after resolution, which unblocks all gated queries.
 * Must be placed INSIDE QueryProvider so hooks can access the query client.
 */
export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  // If NEXT_PUBLIC_WORKSPACE_ID is already set via env, the app is usable immediately
  // without waiting for remote config resolution.
  const hasEnvWorkspace = !!process.env.NEXT_PUBLIC_WORKSPACE_ID;
  const [isReady, setIsReady] = useState(hasEnvWorkspace);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const domain = window.location.hostname;
    getExplorerConfig(domain)
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error(
          "[ExplorerProvider] Failed to resolve explorer config:",
          err,
        );
        // If we already have a workspace from env, keep the app usable
        if (!hasEnvWorkspace) {
          setError(
            "Failed to load explorer configuration. Please try refreshing the page.",
          );
        }
      });
  }, [hasEnvWorkspace]);

  return (
    <ExplorerContext.Provider value={{ isReady, error }}>
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive px-4 py-3 text-center text-sm text-destructive-foreground">
          {error}
        </div>
      )}
      {children}
    </ExplorerContext.Provider>
  );
}
