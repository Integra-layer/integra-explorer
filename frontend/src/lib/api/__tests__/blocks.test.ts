import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBlocks, getBlock } from "../blocks";

vi.mock("../client", () => ({
  fetchApi: vi.fn(),
}));

import { fetchApi } from "../client";
const mockFetchApi = vi.mocked(fetchApi);

describe("blocks API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getBlocks
  // ---------------------------------------------------------------------------

  describe("getBlocks", () => {
    it("calls fetchApi with /blocks and default params", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 0 });

      await getBlocks();

      expect(mockFetchApi).toHaveBeenCalledWith("/blocks", {
        page: "1",
        itemsPerPage: "25",
        order: "DESC",
      });
    });

    it("passes custom page, itemsPerPage, and order", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 100 });

      await getBlocks({ page: 3, itemsPerPage: 50, order: "ASC" });

      expect(mockFetchApi).toHaveBeenCalledWith("/blocks", {
        page: "3",
        itemsPerPage: "50",
        order: "ASC",
      });
    });

    it("returns the response matching PaginatedResponse shape", async () => {
      const mockResponse = {
        items: [{ number: 1, hash: "0xabc", timestamp: "2026-01-01" }],
        total: 87000,
      };
      mockFetchApi.mockResolvedValueOnce(mockResponse);

      const result = await getBlocks({ page: 1 });

      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(87000);
    });
  });

  // ---------------------------------------------------------------------------
  // getBlock
  // ---------------------------------------------------------------------------

  describe("getBlock", () => {
    it("calls fetchApi with /blocks/{number}", async () => {
      mockFetchApi.mockResolvedValueOnce({ number: 42, hash: "0xdef" });

      await getBlock(42);

      expect(mockFetchApi).toHaveBeenCalledWith("/blocks/42");
    });

    it("returns the block data", async () => {
      const mockBlock = { number: 100, hash: "0x123", transactions: [] };
      mockFetchApi.mockResolvedValueOnce(mockBlock);

      const result = await getBlock(100);

      expect(result).toEqual(mockBlock);
    });
  });
});
