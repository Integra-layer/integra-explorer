"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getExplorerConfig } from "@/lib/api/explorer";

/**
 * Context that signals when explorer auth (workspace + firebaseUserId) is resolved.
 * All data hooks should gate on `isReady` to avoid firing before auth params are set.
 */
const ExplorerContext = createContext({ isReady: false });

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
  const [isReady, setIsReady] = useState(false);

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
        // Still mark ready so the app doesn't stay in permanent loading
        setIsReady(true);
      });
  }, []);

  return (
    <ExplorerContext.Provider value={{ isReady }}>
      {children}
    </ExplorerContext.Provider>
  );
}
