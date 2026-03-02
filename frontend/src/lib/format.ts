/**
 * Formatting utilities for the Integra Explorer.
 */

/**
 * Truncate an address for display: 0x1234567890abcdef -> 0x1234...cdef
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Truncate a transaction hash for display: 0xabcdef1234... -> 0xabcdef...1234ef
 */
export function truncateHash(hash: string, chars = 6): string {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Relative time: "12s ago", "5m ago", "2h ago", "3d ago"
 */
export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format a wei value to IRL (18 decimals).
 */
export function formatIRL(weiValue: string): string {
  const num = Number(weiValue) / 1e18;
  if (num === 0) return "0 IRL";
  if (num < 0.001) return "<0.001 IRL";
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 4 })} IRL`;
}

/**
 * Format gas value with locale separators.
 */
export function formatGas(gas: string | number): string {
  return Number(gas).toLocaleString();
}

/**
 * Format a large number with locale separators.
 */
export function formatNumber(value: number | string): string {
  return Number(value).toLocaleString();
}

/**
 * Format gas price from wei to Gwei.
 */
export function formatGwei(weiValue: string): string {
  const gwei = Number(weiValue) / 1e9;
  if (gwei === 0) return "0";
  if (gwei < 0.01) return "<0.01";
  return gwei.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Convert airl (18 decimals) to IRL with no decimal places.
 * E.g. "100000000000000000000" → "100"
 */
export function formatStakedIRL(airlAmount: string): string {
  const num = Number(airlAmount) / 1e18;
  if (num === 0) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Format commission rate from a decimal string to percentage.
 * E.g. "0.050000000000000000" → "5.0%"
 */
export function formatCommission(rate: string): string {
  return `${(Number(rate) * 100).toFixed(1)}%`;
}
