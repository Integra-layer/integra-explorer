/**
 * Transaction Classification Engine.
 *
 * Classifies raw Ethernal transactions into semantic categories
 * (native transfer, ERC-20, ERC-721, approvals, contract calls, etc.)
 * and extracts decoded parameters from calldata.
 */

import { findKnownToken } from "@/lib/api/tokens";
import type { KnownToken } from "@/lib/api/tokens";
import type { Transaction } from "@/lib/api/types";
import { formatTokenAmount, formatIRL } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TxCategory =
  | "native-transfer"
  | "contract-creation"
  | "erc20-transfer"
  | "erc20-transferFrom"
  | "erc20-approve"
  | "nft-transfer"
  | "nft-safeTransfer"
  | "approval-for-all"
  | "contract-call";

export interface ClassifiedTx {
  category: TxCategory;
  /** Human-readable label: "IRL Transfer", "ERC-20 Transfer", etc. */
  label: string;
  /** tx.from (always the signer) */
  from: string;
  /** Resolved recipient (real recipient for token transfers) */
  to: string | null;
  /** Token/NFT contract address (tx.to for token txs) */
  contractAddress: string | null;
  /** Formatted display value: "1,000 tUSDI", "5.2 IRL" */
  value: string;
  /** Token metadata when a known token is involved */
  tokenInfo?: { symbol: string; name: string; decimals: number; standard: string };
  /** NFT token ID */
  tokenId?: string;
  /** Spender address for approve txs */
  spender?: string;
  /** Method name from methodDetails or selector */
  methodName?: string;
}

// ---------------------------------------------------------------------------
// Function selectors
// ---------------------------------------------------------------------------

const SELECTORS = {
  /** transfer(address,uint256) */
  ERC20_TRANSFER: "0xa9059cbb",
  /** transferFrom(address,address,uint256) */
  TRANSFER_FROM: "0x23b872dd",
  /** approve(address,uint256) */
  APPROVE: "0x095ea7b3",
  /** safeTransferFrom(address,address,uint256) */
  SAFE_TRANSFER_FROM_3: "0x42842e0e",
  /** safeTransferFrom(address,address,uint256,bytes) */
  SAFE_TRANSFER_FROM_4: "0xb88d4fde",
  /** setApprovalForAll(address,bool) */
  SET_APPROVAL_FOR_ALL: "0xa22cb465",
} as const;

// ---------------------------------------------------------------------------
// Calldata parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extract a 20-byte address from a 32-byte ABI-padded slot.
 * @param data Full calldata hex string (with 0x prefix)
 * @param slotIndex Zero-based slot index (0 = first param at offset 10)
 */
function parseAddress(data: string, slotIndex: number): string | null {
  // Each slot is 64 hex chars. Selector is 10 chars (0x + 8).
  const start = 10 + slotIndex * 64;
  const end = start + 64;
  if (data.length < end) return null;
  // Address is the last 40 chars of the 64-char slot
  const raw = data.slice(start + 24, end);
  return `0x${raw}`;
}

/**
 * Extract a uint256 value from a 32-byte ABI slot as bigint.
 * @param data Full calldata hex string (with 0x prefix)
 * @param slotIndex Zero-based slot index
 */
function parseUint256(data: string, slotIndex: number): bigint | null {
  const start = 10 + slotIndex * 64;
  const end = start + 64;
  if (data.length < end) return null;
  try {
    return BigInt("0x" + data.slice(start, end));
  } catch {
    return null;
  }
}

/**
 * Get the 4-byte function selector from calldata.
 */
function getSelector(data: string): string | null {
  if (!data || data.length < 10) return null;
  return data.slice(0, 10).toLowerCase();
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<TxCategory, string> = {
  "native-transfer": "IRL Transfer",
  "contract-creation": "Contract Creation",
  "erc20-transfer": "ERC-20 Transfer",
  "erc20-transferFrom": "ERC-20 Transfer",
  "erc20-approve": "Approve",
  "nft-transfer": "NFT Transfer",
  "nft-safeTransfer": "NFT Transfer",
  "approval-for-all": "Approval For All",
  "contract-call": "Contract Call",
};

function buildTokenInfo(token: KnownToken): ClassifiedTx["tokenInfo"] {
  return {
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    standard: token.standard ?? "ERC-20",
  };
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

export function classifyTransaction(tx: Transaction): ClassifiedTx {
  const data = tx.data ?? "";
  const selector = getSelector(data);
  const hasCalldata = !!selector;
  const isDataEmpty = !data || data === "0x" || data === "0x00" || data.length < 10;

  // --- Contract creation ---
  if (tx.to === null) {
    return {
      category: "contract-creation",
      label: "Contract Creation",
      from: tx.from,
      to: null,
      contractAddress: tx.receipt?.contractAddress ?? null,
      value: formatIRL(tx.value),
      methodName: "create",
    };
  }

  // --- Native IRL transfer ---
  if (isDataEmpty && tx.value !== "0") {
    return {
      category: "native-transfer",
      label: "IRL Transfer",
      from: tx.from,
      to: tx.to,
      contractAddress: null,
      value: formatIRL(tx.value),
    };
  }

  // --- Selector-based classification ---
  if (hasCalldata && selector) {
    const knownToken = findKnownToken(tx.to!);

    // ERC-20 transfer(address,uint256)
    if (
      selector === SELECTORS.ERC20_TRANSFER ||
      tx.methodDetails?.name === "transfer"
    ) {
      const recipient = parseAddress(data, 0);
      const amount = parseUint256(data, 1);

      let displayValue = formatIRL(tx.value);
      if (knownToken && amount !== null) {
        displayValue = formatTokenAmount(amount, knownToken.decimals, knownToken.symbol);
      }

      return {
        category: "erc20-transfer",
        label: knownToken
          ? `${knownToken.symbol} Transfer`
          : "ERC-20 Transfer",
        from: tx.from,
        to: recipient ?? tx.to,
        contractAddress: tx.to,
        value: displayValue,
        tokenInfo: knownToken ? buildTokenInfo(knownToken) : undefined,
        methodName: "transfer",
      };
    }

    // approve(address,uint256)
    if (selector === SELECTORS.APPROVE) {
      const spender = parseAddress(data, 0);
      const amount = parseUint256(data, 1);

      let displayValue = "Approved";
      if (knownToken && amount !== null) {
        // Max uint256 is "Unlimited"
        const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        if (amount === MAX_UINT256) {
          displayValue = `Unlimited ${knownToken.symbol}`;
        } else {
          displayValue = formatTokenAmount(amount, knownToken.decimals, knownToken.symbol);
        }
      }

      return {
        category: "erc20-approve",
        label: "Approve",
        from: tx.from,
        to: tx.to,
        contractAddress: tx.to,
        value: displayValue,
        tokenInfo: knownToken ? buildTokenInfo(knownToken) : undefined,
        spender: spender ?? undefined,
        methodName: "approve",
      };
    }

    // transferFrom(address,address,uint256) — shared by ERC-20 and ERC-721
    if (selector === SELECTORS.TRANSFER_FROM) {
      const transferFrom = parseAddress(data, 0);
      const transferTo = parseAddress(data, 1);
      const valueOrTokenId = parseUint256(data, 2);

      if (knownToken && knownToken.standard === "ERC-20") {
        // ERC-20 transferFrom
        let displayValue = formatIRL(tx.value);
        if (valueOrTokenId !== null) {
          displayValue = formatTokenAmount(valueOrTokenId, knownToken.decimals, knownToken.symbol);
        }

        return {
          category: "erc20-transferFrom",
          label: `${knownToken.symbol} Transfer`,
          from: transferFrom ?? tx.from,
          to: transferTo ?? tx.to,
          contractAddress: tx.to,
          value: displayValue,
          tokenInfo: buildTokenInfo(knownToken),
          methodName: "transferFrom",
        };
      }

      // ERC-721 transferFrom (unknown or NFT contract)
      return {
        category: "nft-transfer",
        label: "NFT Transfer",
        from: transferFrom ?? tx.from,
        to: transferTo ?? tx.to,
        contractAddress: tx.to,
        value: formatIRL(tx.value),
        tokenId: valueOrTokenId?.toString(),
        methodName: "transferFrom",
      };
    }

    // safeTransferFrom(address,address,uint256) or (address,address,uint256,bytes)
    if (
      selector === SELECTORS.SAFE_TRANSFER_FROM_3 ||
      selector === SELECTORS.SAFE_TRANSFER_FROM_4
    ) {
      const nftFrom = parseAddress(data, 0);
      const nftTo = parseAddress(data, 1);
      const tokenId = parseUint256(data, 2);

      return {
        category: "nft-safeTransfer",
        label: "NFT Transfer",
        from: nftFrom ?? tx.from,
        to: nftTo ?? tx.to,
        contractAddress: tx.to,
        value: formatIRL(tx.value),
        tokenId: tokenId?.toString(),
        methodName: "safeTransferFrom",
      };
    }

    // setApprovalForAll(address,bool)
    if (selector === SELECTORS.SET_APPROVAL_FOR_ALL) {
      const operator = parseAddress(data, 0);

      return {
        category: "approval-for-all",
        label: "Approval For All",
        from: tx.from,
        to: tx.to,
        contractAddress: tx.to,
        value: "Approval",
        spender: operator ?? undefined,
        methodName: "setApprovalForAll",
      };
    }
  }

  // --- Fallback: contract call (has calldata but no recognized selector) ---
  if (hasCalldata) {
    return {
      category: "contract-call",
      label: tx.methodDetails?.name
        ? tx.methodDetails.name.charAt(0).toUpperCase() + tx.methodDetails.name.slice(1)
        : "Contract Call",
      from: tx.from,
      to: tx.to,
      contractAddress: tx.to,
      value: formatIRL(tx.value),
      methodName: tx.methodDetails?.name ?? undefined,
    };
  }

  // --- Fallback: native transfer with 0 value (empty call) ---
  return {
    category: "native-transfer",
    label: "IRL Transfer",
    from: tx.from,
    to: tx.to,
    contractAddress: null,
    value: formatIRL(tx.value),
  };
}
