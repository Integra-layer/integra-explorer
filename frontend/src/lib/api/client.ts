// =============================================================================
// Base API Client
// Fetch wrapper with error handling and workspace param injection.
// Works in both client components (browser) and server components (Node.js).
// =============================================================================

import { DEFAULT_SITE_URL } from "@/lib/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// Server-side base URL for when window is not available (SSR / server components).
// In production, set NEXT_PUBLIC_SITE_URL to the full origin.
const SERVER_ORIGIN = DEFAULT_SITE_URL;

/** Default fetch timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 15_000;

// The workspace name is resolved once from /api/explorers/search and cached.
// Can also be set via environment variable for static builds.
let resolvedWorkspaceName: string | null =
  process.env.NEXT_PUBLIC_WORKSPACE_ID || null;

// The firebaseUserId is required by every Ethernal data endpoint.
// Resolved from the explorer config's admin.firebaseUserId field.
// Can also be set via environment variable so it's available at module init
// (avoids race condition where hooks fire before async config resolution).
let resolvedFirebaseUserId: string | null =
  process.env.NEXT_PUBLIC_FIREBASE_USER_ID || null;

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

  // Inject workspace name if we have one and it is not already provided
  if (resolvedWorkspaceName && !params?.workspace) {
    url.searchParams.set("workspace", resolvedWorkspaceName);
  }

  // firebaseUserId is primarily sent as a header (see fetchApi),
  // but kept as query param for backwards compatibility with unpatched backends
  if (resolvedFirebaseUserId && !params?.firebaseUserId) {
    url.searchParams.set("firebaseUserId", resolvedFirebaseUserId);
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (resolvedFirebaseUserId) {
    headers["X-Firebase-User-Id"] = resolvedFirebaseUserId;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
  clearTimeout(timeout);

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
 * Set the workspace name used for all subsequent API calls.
 * Typically called once during app initialization after fetching explorer config.
 */
export function setWorkspaceName(name: string): void {
  if (!name || name.trim() === "") {
    console.warn(
      "[ApiClient] setWorkspaceName called with empty value — ignoring.",
    );
    return;
  }
  resolvedWorkspaceName = name;
}

/**
 * Get the currently configured workspace name.
 */
export function getWorkspaceName(): string | null {
  return resolvedWorkspaceName;
}

/**
 * Set the firebaseUserId used for all subsequent API calls.
 * Required by Ethernal backend on every data endpoint.
 */
export function setFirebaseUserId(id: string): void {
  if (!id || id.trim() === "") {
    console.warn(
      "[ApiClient] setFirebaseUserId called with empty value — ignoring.",
    );
    return;
  }
  resolvedFirebaseUserId = id;
}
