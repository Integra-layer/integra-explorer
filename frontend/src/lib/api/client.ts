// =============================================================================
// Base API Client
// Fetch wrapper with error handling and workspace param injection.
// Works in both client components (browser) and server components (Node.js).
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// Server-side base URL for when window is not available (SSR / server components).
// In production, set NEXT_PUBLIC_SITE_URL to the full origin, e.g. "https://scan.integralayer.com"
const SERVER_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// The workspace ID is resolved once from /api/explorers/search and cached.
// Can also be set via environment variable for static builds.
let resolvedWorkspaceId: string | null =
  process.env.NEXT_PUBLIC_WORKSPACE_ID || null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Build a full URL for an API endpoint.
 * In the browser, uses window.location.origin as the base.
 * On the server, uses SERVER_ORIGIN.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | undefined>,
): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : SERVER_ORIGIN;

  const url = new URL(`${API_BASE}${endpoint}`, origin);

  // Inject workspace if we have one and it is not already provided
  if (resolvedWorkspaceId && !params?.workspace) {
    url.searchParams.set("workspace", resolvedWorkspaceId);
  }

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

/**
 * Generic fetch wrapper. Adds workspace param, handles errors, returns typed JSON.
 */
export async function fetchApi<T>(
  endpoint: string,
  params?: Record<string, string | undefined>,
): Promise<T> {
  const url = buildUrl(endpoint, params);

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // body not JSON — ignore
    }
    throw new ApiError(
      res.status,
      `API ${res.status}: ${res.statusText} — ${endpoint}`,
      body,
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Workspace Resolution
// ---------------------------------------------------------------------------

/**
 * Set the workspace ID used for all subsequent API calls.
 * Typically called once during app initialization after fetching explorer config.
 */
export function setWorkspaceId(id: string | number): void {
  resolvedWorkspaceId = String(id);
}

/**
 * Get the currently configured workspace ID.
 */
export function getWorkspaceId(): string | null {
  return resolvedWorkspaceId;
}
