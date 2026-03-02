import { fetchApi, setWorkspaceId } from "./client";
import type { ExplorerConfig, SyncStatus } from "./types";

/**
 * Search for an explorer by domain and return its config.
 * This is typically called once at app startup to resolve the workspace ID.
 */
export async function getExplorerConfig(
  domain: string,
): Promise<ExplorerConfig> {
  const config = await fetchApi<ExplorerConfig>("/explorers/search", {
    domain,
  });

  // Cache the workspace ID for all future API calls
  if (config.workspaceId) {
    setWorkspaceId(config.workspaceId);
  }

  return config;
}

/**
 * Get the current sync status of the explorer backend.
 * This endpoint does not require a workspace parameter.
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  return fetchApi<SyncStatus>("/status");
}
