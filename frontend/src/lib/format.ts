/**
 * Formatting utilities for the Integra Explorer.
 */

import { findKnownToken } from "@/lib/api/tokens";

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
  if (!weiValue || weiValue === "0") return "0 IRL";
  try {
    const wei = BigInt(weiValue);
    const whole = wei / BigInt(1e18);
    const remainder = wei % BigInt(1e18);
    const decimal = Number(remainder) / 1e18;
    const num = Number(whole) + decimal;
    if (num < 0.001) return "<0.001 IRL";
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 4 })} IRL`;
  } catch {
    return "0 IRL";
  }
}

/**
 * Parse ERC-20 transfer amount from calldata.
 * transfer(address,uint256) selector = 0xa9059cbb
 * Amount is the second parameter (bytes 36-68).
 */
export function parseErc20Amount(input: string): bigint | null {
  if (!input || input.length < 138) return null; // 0x + 8 selector + 64 addr + 64 amount
  const selector = input.slice(0, 10).toLowerCase();
  if (selector !== "0xa9059cbb") return null;
  try {
    return BigInt("0x" + input.slice(74, 138));
  } catch {
    return null;
  }
}

/**
 * Format a token amount given raw value and decimals.
 */
export function formatTokenAmount(
  raw: bigint,
  decimals: number,
  symbol: string,
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  if (frac === BigInt(0)) {
    return `${whole.toLocaleString()} ${symbol}`;
  }
  const fracStr = frac
    .toString()
    .padStart(decimals, "0")
    .slice(0, 4)
    .replace(/0+$/, "");
  if (!fracStr) return `${whole.toLocaleString()} ${symbol}`;
  return `${whole.toLocaleString()}.${fracStr} ${symbol}`;
}

// ERC-20 transfer(address,uint256) function selector
const ERC20_TRANSFER_SELECTOR = "0xa9059cbb";

/**
 * Check if a transaction looks like an ERC-20 transfer.
 * Matches on methodDetails name OR the raw data selector.
 */
function looksLikeErc20Transfer(tx: {
  value: string;
  to: string | null;
  data: string;
  methodDetails?: { name: string; label: string } | null;
}): boolean {
  if (!tx.to || tx.value !== "0") return false;
  // Match by methodDetails (when Ethernal decodes it)
  if (tx.methodDetails?.name === "transfer" && tx.data) return true;
  // Match by raw data selector (fallback when methodDetails is null)
  if (tx.data && tx.data.toLowerCase().startsWith(ERC20_TRANSFER_SELECTOR))
    return true;
  return false;
}

/**
 * Format a transaction's display value, detecting ERC-20 transfers.
 * Detects via methodDetails OR raw 0xa9059cbb selector.
 * Falls back to native IRL formatting.
 */
export function formatTxValue(tx: {
  value: string;
  to: string | null;
  data: string;
  methodDetails?: { name: string; label: string } | null;
}): string {
  if (looksLikeErc20Transfer(tx)) {
    const token = findKnownToken(tx.to!);
    if (token) {
      const amount = parseErc20Amount(tx.data);
      if (amount !== null) {
        return formatTokenAmount(amount, token.decimals, token.symbol);
      }
    }
  }
  return formatIRL(tx.value);
}

/**
 * Detect whether a transaction is an ERC-20 transfer.
 */
export function isErc20Transfer(tx: {
  value: string;
  to: string | null;
  data: string;
  methodDetails?: { name: string; label: string } | null;
}): boolean {
  if (looksLikeErc20Transfer(tx)) {
    return !!findKnownToken(tx.to!);
  }
  return false;
}

/**
 * Format a transaction fee, showing "Free" for zero-fee transactions.
 */
export function formatFee(gasUsed: string | null, gasPrice: string): string {
  const used = gasUsed ? BigInt(gasUsed) : BigInt(0);
  const price = BigInt(gasPrice || "0");
  const fee = used * price;
  if (fee === BigInt(0)) return "Free";
  return formatIRL(fee.toString());
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
  if (!airlAmount || airlAmount === "0") return "0";
  try {
    const wei = BigInt(airlAmount);
    const whole = wei / BigInt(1e18);
    return Number(whole).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  } catch {
    return "0";
  }
}

/**
 * Format commission rate from a decimal string to percentage.
 * E.g. "0.050000000000000000" → "5.0%"
 */
export function formatCommission(rate: string): string {
  return `${(Number(rate) * 100).toFixed(1)}%`;
}
