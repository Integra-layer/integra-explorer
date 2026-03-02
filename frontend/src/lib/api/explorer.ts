import { fetchApi, setWorkspaceName, setFirebaseUserId } from "./client";
import type { ExplorerConfig, SyncStatus } from "./types";

/**
 * Search for an explorer by domain and return its config.
 * The backend wraps the response in { explorer: { ... } }.
 */
export async function getExplorerConfig(
  domain: string,
): Promise<ExplorerConfig> {
  const response = await fetchApi<{ explorer: ExplorerConfig }>(
    "/explorers/search",
    { domain },
  );

  const config = response.explorer;

  // Cache workspace name and firebaseUserId for all future API calls
  if (config.workspace?.name) {
    setWorkspaceName(config.workspace.name);
  }
  if (config.admin?.firebaseUserId) {
    setFirebaseUserId(config.admin.firebaseUserId);
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
