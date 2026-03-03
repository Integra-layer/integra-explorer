import { describe, it, expect } from "vitest";
import { findKnownToken, getKnownTokens, KNOWN_TOKENS } from "../api/tokens";

describe("KNOWN_TOKENS registry", () => {
  it("contains at least one token", () => {
    expect(KNOWN_TOKENS.length).toBeGreaterThan(0);
  });

  it("contains tUSDI as a featured token", () => {
    const tUSDI = KNOWN_TOKENS.find((t) => t.symbol === "tUSDI");
    expect(tUSDI).toBeDefined();
    expect(tUSDI?.featured).toBe(true);
  });

  it("has the correct tUSDI contract address", () => {
    const tUSDI = KNOWN_TOKENS.find((t) => t.symbol === "tUSDI");
    expect(tUSDI?.address).toBe("0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f");
  });

  it("tUSDI has 18 decimals", () => {
    const tUSDI = KNOWN_TOKENS.find((t) => t.symbol === "tUSDI");
    expect(tUSDI?.decimals).toBe(18);
  });

  it("every token has a non-empty address, name, symbol, and valid decimals", () => {
    for (const token of KNOWN_TOKENS) {
      expect(token.address).toBeTruthy();
      expect(token.name).toBeTruthy();
      expect(token.symbol).toBeTruthy();
      expect(typeof token.decimals).toBe("number");
      expect(token.decimals).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("getKnownTokens", () => {
  it("returns the same list as KNOWN_TOKENS", () => {
    expect(getKnownTokens()).toBe(KNOWN_TOKENS);
  });

  it("returns an array", () => {
    expect(Array.isArray(getKnownTokens())).toBe(true);
  });
});

describe("findKnownToken", () => {
  it("finds tUSDI by its exact address", () => {
    const token = findKnownToken("0xa640D8B5C9Cb3b989881B8E63B0f30179C78a04f");
    expect(token).toBeDefined();
    expect(token?.symbol).toBe("tUSDI");
  });

  it("finds tUSDI by lowercase address (case-insensitive)", () => {
    const token = findKnownToken("0xa640d8b5c9cb3b989881b8e63b0f30179c78a04f");
    expect(token).toBeDefined();
    expect(token?.symbol).toBe("tUSDI");
  });

  it("finds tUSDI by uppercase address (case-insensitive)", () => {
    const token = findKnownToken("0xA640D8B5C9CB3B989881B8E63B0F30179C78A04F");
    expect(token).toBeDefined();
    expect(token?.symbol).toBe("tUSDI");
  });

  it("returns undefined for an address that is not in the registry", () => {
    const token = findKnownToken("0x0000000000000000000000000000000000000001");
    expect(token).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    const token = findKnownToken("");
    expect(token).toBeUndefined();
  });

  it("returns undefined for a random non-token address", () => {
    const token = findKnownToken("0x5551ff857fc71597511c34c8cc62a78c9d6748fb");
    expect(token).toBeUndefined();
  });
});
