import { fetchApi } from "./client";
import type { Contract } from "./types";

// =============================================================================
// Token API
// Tokens are contracts with tokenName set. Since Ethernal has no dedicated
// /api/tokens endpoint, we use the contracts endpoint for detail lookups and
// maintain a static registry of known tokens for the list page.
// =============================================================================

/**
 * Known tokens on the Integra network.
 * As new ERC-20/ERC-721 tokens are deployed, add them here.
 */
export interface KnownToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  featured?: boolean;
  standard?: "ERC-20" | "ERC-721" | "ERC-1155";
}

export const KNOWN_TOKENS: KnownToken[] = [
  {
    address: "0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f",
    name: "Testnet USDI",
    symbol: "tUSDI",
    decimals: 18,
    totalSupply: "1000000000000000000000000000", // 1B * 10^18
    featured: true,
    standard: "ERC-20",
  },
  {
    address: "0x8ebAE4219f149e822f73948B926a1fc57A5a7963",
    name: "Integra Collectibles",
    symbol: "INTC",
    decimals: 0,
    featured: true,
    standard: "ERC-721",
  },
  {
    address: "0x9640937D9F696427766a0188fbC16E4af073accF",
    name: "Integra Assets",
    symbol: "INTG",
    decimals: 0,
    featured: true,
    standard: "ERC-1155",
  },
];

/**
 * Fetch contract info for a token address.
 * Returns the full Contract object which includes token metadata fields
 * (tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply).
 */
export async function getTokenContract(address: string): Promise<Contract> {
  return fetchApi<Contract>(`/contracts/${address}`);
}

/**
 * Get the static list of known tokens.
 */
export function getKnownTokens(): KnownToken[] {
  return KNOWN_TOKENS;
}

/**
 * Find a known token by address (case-insensitive).
 */
export function findKnownToken(address: string): KnownToken | undefined {
  return KNOWN_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase(),
  );
}
