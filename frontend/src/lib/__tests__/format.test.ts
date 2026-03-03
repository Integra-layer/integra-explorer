import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  truncateAddress,
  truncateHash,
  timeAgo,
  formatIRL,
  parseErc20Amount,
  formatTokenAmount,
  formatFee,
  formatGas,
  formatNumber,
  formatGwei,
  formatStakedIRL,
  formatCommission,
  formatTxValue,
  isErc20Transfer,
} from "../format";

// ---------------------------------------------------------------------------
// truncateAddress
// ---------------------------------------------------------------------------

describe("truncateAddress", () => {
  it("truncates a long EVM address with default 4-char display", () => {
    const addr = "0x5551ff857fc71597511c34c8cc62a78c9d6748fb";
    expect(truncateAddress(addr)).toBe("0x5551...48fb");
  });

  it("returns the address unchanged when it is short enough to fit", () => {
    const short = "0x1234";
    // length 6, chars*2+2 = 10 -> short enough
    expect(truncateAddress(short)).toBe("0x1234");
  });

  it("returns empty string for an empty input", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("respects a custom chars parameter", () => {
    const addr = "0x5551ff857fc71597511c34c8cc62a78c9d6748fb";
    expect(truncateAddress(addr, 6)).toBe("0x5551ff...748fb");
  });
});

// ---------------------------------------------------------------------------
// truncateHash
// ---------------------------------------------------------------------------

describe("truncateHash", () => {
  it("truncates a 66-char tx hash with default 6-char display", () => {
    const hash =
      "0x988c09b72d769dd5129cc475efac67b700c4eed9d68a3c327bc945bbb80334f3";
    expect(truncateHash(hash)).toBe("0x988c09...334f3");
  });

  it("returns empty string for an empty input", () => {
    expect(truncateHash("")).toBe("");
  });

  it("returns the hash unchanged when it is short enough", () => {
    expect(truncateHash("0xabc")).toBe("0xabc");
  });
});

// ---------------------------------------------------------------------------
// timeAgo
// ---------------------------------------------------------------------------

describe("timeAgo", () => {
  beforeEach(() => {
    // Pin Date.now() so timeAgo results are deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-03T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Xs ago' for a timestamp less than 60 seconds old", () => {
    const ts = new Date(Date.now() - 30_000).toISOString(); // 30s ago
    expect(timeAgo(ts)).toBe("30s ago");
  });

  it("returns '0s ago' for a timestamp exactly at now", () => {
    expect(timeAgo(new Date(Date.now()).toISOString())).toBe("0s ago");
  });

  it("returns 'just now' for a timestamp in the future", () => {
    const ts = new Date(Date.now() + 5_000).toISOString();
    expect(timeAgo(ts)).toBe("just now");
  });

  it("returns 'Xm ago' for a timestamp between 1 and 59 minutes old", () => {
    const ts = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min ago
    expect(timeAgo(ts)).toBe("5m ago");
  });

  it("returns 'Xh ago' for a timestamp between 1 and 23 hours old", () => {
    const ts = new Date(Date.now() - 3 * 3600_000).toISOString(); // 3h ago
    expect(timeAgo(ts)).toBe("3h ago");
  });

  it("returns 'Xd ago' for a timestamp more than 24 hours old", () => {
    const ts = new Date(Date.now() - 2 * 86400_000).toISOString(); // 2 days ago
    expect(timeAgo(ts)).toBe("2d ago");
  });
});

// ---------------------------------------------------------------------------
// formatIRL
// ---------------------------------------------------------------------------

describe("formatIRL", () => {
  it("returns '0 IRL' for a zero wei value", () => {
    expect(formatIRL("0")).toBe("0 IRL");
  });

  it("returns '<0.001 IRL' for a value smaller than 0.001 IRL", () => {
    // 0.0001 IRL = 100000000000000 wei
    expect(formatIRL("100000000000000")).toBe("<0.001 IRL");
  });

  it("formats 1 IRL (1e18 wei) correctly", () => {
    expect(formatIRL("1000000000000000000")).toBe("1 IRL");
  });

  it("formats 100 IRL correctly", () => {
    expect(formatIRL("100000000000000000000")).toBe("100 IRL");
  });

  it("includes 'IRL' suffix", () => {
    expect(formatIRL("1000000000000000000")).toContain("IRL");
  });
});

// ---------------------------------------------------------------------------
// parseErc20Amount
// ---------------------------------------------------------------------------

describe("parseErc20Amount", () => {
  // ERC-20 transfer(address,uint256) calldata:
  // selector: 0xa9059cbb
  // recipient: 32-byte padded address
  // amount: 32-byte padded uint256
  const buildCalldata = (amountHex: string): string => {
    const selector = "a9059cbb";
    const recipient = "0".repeat(64); // zero address padded
    const amount = amountHex.padStart(64, "0");
    return "0x" + selector + recipient + amount;
  };

  it("parses the amount from a valid ERC-20 transfer calldata", () => {
    // 1000 tokens (no decimals here, raw uint256)
    const calldata = buildCalldata((1000n).toString(16));
    expect(parseErc20Amount(calldata)).toBe(1000n);
  });

  it("parses a large amount (1B tokens * 10^18)", () => {
    const bigAmount = BigInt("1000000000000000000000000000"); // 1B * 10^18
    const calldata = buildCalldata(bigAmount.toString(16));
    expect(parseErc20Amount(calldata)).toBe(bigAmount);
  });

  it("returns null for an empty string", () => {
    expect(parseErc20Amount("")).toBeNull();
  });

  it("returns null for a string shorter than 138 characters", () => {
    expect(parseErc20Amount("0xa9059cbb" + "0".repeat(60))).toBeNull();
  });

  it("returns null for a different function selector", () => {
    // approve(address,uint256) selector = 0x095ea7b3
    const calldata = "0x095ea7b3" + "0".repeat(128);
    expect(parseErc20Amount(calldata)).toBeNull();
  });

  it("returns null for null/undefined-like empty input", () => {
    expect(parseErc20Amount(null as unknown as string)).toBeNull();
  });

  it("returns zero bigint for a zero-amount transfer", () => {
    const calldata = buildCalldata("0");
    expect(parseErc20Amount(calldata)).toBe(0n);
  });
});

// ---------------------------------------------------------------------------
// formatTokenAmount
// ---------------------------------------------------------------------------

describe("formatTokenAmount", () => {
  it("formats a whole token amount with no fractional part", () => {
    expect(formatTokenAmount(1000n * 10n ** 18n, 18, "tUSDI")).toBe("1,000 tUSDI");
  });

  it("formats a fractional token amount, trimming trailing zeros", () => {
    // 1.5 tUSDI = 1_500_000_000_000_000_000
    const result = formatTokenAmount(1_500_000_000_000_000_000n, 18, "tUSDI");
    expect(result).toContain("1");
    expect(result).toContain("5");
    expect(result).toContain("tUSDI");
  });

  it("formats zero as '0 <symbol>'", () => {
    expect(formatTokenAmount(0n, 18, "tUSDI")).toBe("0 tUSDI");
  });

  it("includes the symbol in the output", () => {
    expect(formatTokenAmount(100n * 10n ** 6n, 6, "USDC")).toContain("USDC");
  });
});

// ---------------------------------------------------------------------------
// formatFee
// ---------------------------------------------------------------------------

describe("formatFee", () => {
  it("returns 'Free' when gas used is null", () => {
    expect(formatFee(null, "1000000000")).toBe("Free");
  });

  it("returns 'Free' when gas used is zero", () => {
    expect(formatFee("0", "1000000000")).toBe("Free");
  });

  it("returns 'Free' when gas price is zero", () => {
    expect(formatFee("21000", "0")).toBe("Free");
  });

  it("formats a non-zero fee as IRL", () => {
    // 21000 gas * 1 Gwei = 21000 * 1e9 = 2.1e13 wei = 0.000021 IRL -> "<0.001 IRL"
    const result = formatFee("21000", "1000000000");
    expect(result).toContain("IRL");
  });

  it("formats a large fee as IRL amount", () => {
    // 1 IRL fee: gasUsed=1, gasPrice=1e18
    const result = formatFee("1", "1000000000000000000");
    expect(result).toBe("1 IRL");
  });
});

// ---------------------------------------------------------------------------
// formatGas
// ---------------------------------------------------------------------------

describe("formatGas", () => {
  it("formats a gas value with locale separators", () => {
    // 1000000 -> "1,000,000" (locale-dependent, check it returns a string)
    const result = formatGas(1000000);
    expect(typeof result).toBe("string");
    expect(result).toContain("1");
  });

  it("accepts a string gas value", () => {
    const result = formatGas("21000");
    expect(typeof result).toBe("string");
  });

  it("formats zero gas", () => {
    expect(formatGas(0)).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// formatNumber
// ---------------------------------------------------------------------------

describe("formatNumber", () => {
  it("formats a numeric string with locale separators", () => {
    const result = formatNumber("1000000");
    expect(typeof result).toBe("string");
  });

  it("formats a number value", () => {
    const result = formatNumber(42);
    expect(result).toBe("42");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// formatGwei
// ---------------------------------------------------------------------------

describe("formatGwei", () => {
  it("returns '0' for a zero wei value", () => {
    expect(formatGwei("0")).toBe("0");
  });

  it("returns '<0.01' for a value smaller than 0.01 Gwei", () => {
    expect(formatGwei("1000000")).toBe("<0.01"); // 0.001 Gwei
  });

  it("formats 1 Gwei (1e9 wei) as '1'", () => {
    expect(formatGwei("1000000000")).toBe("1");
  });

  it("formats 1.5 Gwei correctly", () => {
    expect(formatGwei("1500000000")).toBe("1.5");
  });
});

// ---------------------------------------------------------------------------
// formatStakedIRL
// ---------------------------------------------------------------------------

describe("formatStakedIRL", () => {
  it("returns '0' for zero airl", () => {
    expect(formatStakedIRL("0")).toBe("0");
  });

  it("converts 100 IRL (100e18 airl) to '100'", () => {
    expect(formatStakedIRL("100000000000000000000")).toBe("100");
  });

  it("rounds to zero decimal places", () => {
    // 100.5 IRL -> "101" or "100" depending on rounding; must be no decimal
    const result = formatStakedIRL("100500000000000000000");
    expect(result).not.toContain(".");
  });
});

// ---------------------------------------------------------------------------
// formatCommission
// ---------------------------------------------------------------------------

describe("formatCommission", () => {
  it("formats 5% commission correctly", () => {
    expect(formatCommission("0.050000000000000000")).toBe("5.0%");
  });

  it("formats 0% commission correctly", () => {
    expect(formatCommission("0.000000000000000000")).toBe("0.0%");
  });

  it("formats 20% commission (maximum) correctly", () => {
    expect(formatCommission("0.200000000000000000")).toBe("20.0%");
  });

  it("formats 100% commission correctly", () => {
    expect(formatCommission("1.000000000000000000")).toBe("100.0%");
  });

  it("includes the % suffix", () => {
    expect(formatCommission("0.050000000000000000")).toMatch(/%$/);
  });
});

// ---------------------------------------------------------------------------
// formatTxValue — with mock for findKnownToken
// ---------------------------------------------------------------------------

describe("formatTxValue", () => {
  // Build a valid ERC-20 transfer calldata for 500 tUSDI (500 * 10^18)
  const tUSDIAddress = "0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f";
  const amount500tUSDI = (500n * 10n ** 18n).toString(16).padStart(64, "0");
  const erc20Calldata =
    "0xa9059cbb" + "0".repeat(64) + amount500tUSDI;

  it("falls back to IRL formatting for a native transfer", () => {
    const tx = { value: "1000000000000000000", to: "0xrecipient", data: "0x", methodDetails: null };
    expect(formatTxValue(tx)).toBe("1 IRL");
  });

  it("returns IRL for a transaction with no 'to' address", () => {
    const tx = { value: "1000000000000000000", to: null, data: "0x", methodDetails: null };
    expect(formatTxValue(tx)).toContain("IRL");
  });

  it("returns IRL for a transaction where value is not '0' (native transfer, not ERC-20)", () => {
    const tx = {
      value: "1000000000000000000",
      to: tUSDIAddress,
      data: erc20Calldata,
      methodDetails: null,
    };
    // value !== "0" so looksLikeErc20Transfer returns false
    expect(formatTxValue(tx)).toContain("IRL");
  });

  it("formats a known ERC-20 token transfer when value is '0'", () => {
    const tx = {
      value: "0",
      to: tUSDIAddress,
      data: erc20Calldata,
      methodDetails: null,
    };
    const result = formatTxValue(tx);
    // Should contain the token symbol and amount, not "IRL"
    expect(result).toContain("tUSDI");
    expect(result).not.toContain("IRL");
  });
});

// ---------------------------------------------------------------------------
// isErc20Transfer
// ---------------------------------------------------------------------------

describe("isErc20Transfer", () => {
  const tUSDIAddress = "0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f";
  const amount = (100n * 10n ** 18n).toString(16).padStart(64, "0");
  const erc20Calldata = "0xa9059cbb" + "0".repeat(64) + amount;

  it("returns true for a known ERC-20 token transfer", () => {
    const tx = { value: "0", to: tUSDIAddress, data: erc20Calldata, methodDetails: null };
    expect(isErc20Transfer(tx)).toBe(true);
  });

  it("returns false for a native IRL transfer", () => {
    const tx = { value: "1000000000000000000", to: "0xrecipient", data: "0x", methodDetails: null };
    expect(isErc20Transfer(tx)).toBe(false);
  });

  it("returns false when 'to' address is not a known token", () => {
    const tx = {
      value: "0",
      to: "0x1234567890123456789012345678901234567890",
      data: erc20Calldata,
      methodDetails: null,
    };
    expect(isErc20Transfer(tx)).toBe(false);
  });

  it("returns false when 'to' is null", () => {
    const tx = { value: "0", to: null, data: erc20Calldata, methodDetails: null };
    expect(isErc20Transfer(tx)).toBe(false);
  });
});
