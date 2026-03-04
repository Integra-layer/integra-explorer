import { describe, it, expect } from "vitest";
import {
  detectSearchType,
  getSearchRoute,
  searchTypeLabels,
  type SearchType,
} from "../hooks/use-search-detect";

// ---------------------------------------------------------------------------
// detectSearchType
// ---------------------------------------------------------------------------

describe("detectSearchType", () => {
  // -------------------------------------------------------------------------
  // Block detection
  // -------------------------------------------------------------------------

  it("returns 'block' for a pure integer string", () => {
    expect(detectSearchType("12345")).toBe("block");
  });

  it("returns 'block' for block number '0'", () => {
    expect(detectSearchType("0")).toBe("block");
  });

  it("returns 'block' for a very large block number", () => {
    expect(detectSearchType("99999999")).toBe("block");
  });

  it("returns 'block' when input has surrounding whitespace", () => {
    expect(detectSearchType("  42  ")).toBe("block");
  });

  // -------------------------------------------------------------------------
  // Transaction hash detection
  // -------------------------------------------------------------------------

  it("returns 'transaction' for a 0x-prefixed 64-char hex string", () => {
    expect(
      detectSearchType(
        "0x988c09b72d769dd5129cc475efac67b700c4eed9d68a3c327bc945bbb80334f3",
      ),
    ).toBe("transaction");
  });

  it("returns 'transaction' for an uppercase hex tx hash", () => {
    expect(
      detectSearchType(
        "0x988C09B72D769DD5129CC475EFAC67B700C4EED9D68A3C327BC945BBB80334F3",
      ),
    ).toBe("transaction");
  });

  it("returns 'transaction' for a partial 0x hex string longer than 42 chars", () => {
    // 0x + 43 hex chars -> heuristic: length > 42 -> transaction
    expect(detectSearchType("0x" + "a".repeat(43))).toBe("transaction");
  });

  // -------------------------------------------------------------------------
  // Address detection
  // -------------------------------------------------------------------------

  it("returns 'address' for a 0x-prefixed 40-char hex string", () => {
    expect(detectSearchType("0x5551ff857fc71597511c34c8cc62a78c9d6748fb")).toBe(
      "address",
    );
  });

  it("returns 'address' for a checksummed mixed-case EVM address", () => {
    expect(detectSearchType("0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f")).toBe(
      "address",
    );
  });

  it("returns 'address' for a partial 0x hex string of length 42 or fewer", () => {
    // 0x + 10 hex chars: length 12, <= 42 -> address
    expect(detectSearchType("0xabcdef1234")).toBe("address");
  });

  it("returns 'address' for 0x + exactly 40 hex chars", () => {
    expect(detectSearchType("0x" + "0".repeat(40))).toBe("address");
  });

  // -------------------------------------------------------------------------
  // Unknown detection
  // -------------------------------------------------------------------------

  it("returns 'unknown' for an empty string", () => {
    expect(detectSearchType("")).toBe("unknown");
  });

  it("returns 'unknown' for a whitespace-only string", () => {
    expect(detectSearchType("   ")).toBe("unknown");
  });

  it("returns 'address' for a bech32 cosmos address", () => {
    expect(
      detectSearchType("integra124gllptlcu2ew5guxnyvcc483jwkwj8mlv58sk"),
    ).toBe("address");
  });

  it("returns 'unknown' for a plain text search term", () => {
    expect(detectSearchType("tUSDI")).toBe("unknown");
  });

  it("returns 'unknown' for a string with mixed alphanumeric that is not hex", () => {
    expect(detectSearchType("abc123xyz")).toBe("unknown");
  });

  it("returns 'unknown' for a 0x prefix with no hex digits following", () => {
    expect(detectSearchType("0x")).toBe("unknown");
  });

  it("returns 'unknown' for a 0x prefix followed by non-hex characters", () => {
    expect(detectSearchType("0xGGGGGG")).toBe("unknown");
  });

  // -------------------------------------------------------------------------
  // Boundary: tx hash vs address length discrimination
  // -------------------------------------------------------------------------

  it("returns 'address' for exactly 0x + 40 hex and 'transaction' for 0x + 64 hex", () => {
    expect(detectSearchType("0x" + "f".repeat(40))).toBe("address");
    expect(detectSearchType("0x" + "f".repeat(64))).toBe("transaction");
  });

  it("returns 'transaction' (heuristic) for a partial hash between 43 and 63 chars", () => {
    // 0x + 50 hex chars -> partial, length 52, > 42 -> transaction
    expect(detectSearchType("0x" + "a".repeat(50))).toBe("transaction");
  });
});

// ---------------------------------------------------------------------------
// getSearchRoute
// ---------------------------------------------------------------------------

describe("getSearchRoute", () => {
  it("routes a block number to /blocks/:number", () => {
    expect(getSearchRoute("42")).toBe("/blocks/42");
  });

  it("routes a transaction hash to /transactions/:hash", () => {
    const hash =
      "0x988c09b72d769dd5129cc475efac67b700c4eed9d68a3c327bc945bbb80334f3";
    expect(getSearchRoute(hash)).toBe(`/transactions/${hash}`);
  });

  it("routes an EVM address to /address/:addr", () => {
    const addr = "0x5551ff857fc71597511c34c8cc62a78c9d6748fb";
    expect(getSearchRoute(addr)).toBe(`/address/${addr}`);
  });

  it("routes an unknown query to /search?q=... with URL encoding", () => {
    expect(getSearchRoute("tUSDI")).toBe("/search?q=tUSDI");
  });

  it("URL-encodes special characters in unknown queries", () => {
    expect(getSearchRoute("foo bar")).toBe("/search?q=foo%20bar");
  });

  it("routes bech32 cosmos addresses to /address/ with EVM conversion", () => {
    const bech = "integra124gllptlcu2ew5guxnyvcc483jwkwj8mlv58sk";
    // bech32 is detected as address and converted to EVM hex
    expect(getSearchRoute(bech)).toBe(
      "/address/0x5551ff857fc71597511c34c8cc62a78c9d6748fb",
    );
  });

  it("trims whitespace from the query before building the route", () => {
    expect(getSearchRoute("  42  ")).toBe("/blocks/42");
  });

  it("routes an empty string to /search?q= (unknown fallback)", () => {
    expect(getSearchRoute("")).toBe("/search?q=");
  });
});

// ---------------------------------------------------------------------------
// searchTypeLabels
// ---------------------------------------------------------------------------

describe("searchTypeLabels", () => {
  const allTypes: SearchType[] = [
    "address",
    "transaction",
    "block",
    "token",
    "unknown",
  ];

  it("provides a non-empty label for every SearchType", () => {
    for (const type of allTypes) {
      expect(searchTypeLabels[type]).toBeTruthy();
      expect(typeof searchTypeLabels[type]).toBe("string");
    }
  });

  it("labels address as 'Address'", () => {
    expect(searchTypeLabels.address).toBe("Address");
  });

  it("labels transaction as 'Tx Hash'", () => {
    expect(searchTypeLabels.transaction).toBe("Tx Hash");
  });

  it("labels block as 'Block'", () => {
    expect(searchTypeLabels.block).toBe("Block");
  });

  it("labels token as 'Token'", () => {
    expect(searchTypeLabels.token).toBe("Token");
  });

  it("labels unknown as 'Search'", () => {
    expect(searchTypeLabels.unknown).toBe("Search");
  });
});
