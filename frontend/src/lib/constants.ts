// =============================================================================
// Shared Constants
// =============================================================================

/**
 * Default site URL used for metadata and server-side API calls.
 * Both layout.tsx (metadata) and client.ts (SSR origin) must agree.
 */
export const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://testnet.explorer.integralayer.com";
