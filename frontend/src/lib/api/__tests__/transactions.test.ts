import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTransactions, getTransaction, getBlockTransactions } from "../transactions";

vi.mock("../client", () => ({
  fetchApi: vi.fn(),
}));

import { fetchApi } from "../client";
const mockFetchApi = vi.mocked(fetchApi);

describe("transactions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getTransactions
  // ---------------------------------------------------------------------------

  describe("getTransactions", () => {
    it("calls fetchApi with /transactions and default params", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 0 });

      await getTransactions();

      expect(mockFetchApi).toHaveBeenCalledWith("/transactions", {
        page: "1",
        itemsPerPage: "25",
        order: "DESC",
      });
    });

    it("passes custom pagination params", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 500 });

      await getTransactions({ page: 5, itemsPerPage: 10, order: "ASC" });

      expect(mockFetchApi).toHaveBeenCalledWith("/transactions", {
        page: "5",
        itemsPerPage: "10",
        order: "ASC",
      });
    });

    it("returns the response matching PaginatedResponse shape", async () => {
      const mockResponse = {
        items: [{ hash: "0xabc", blockNumber: 1 }],
        total: 12345,
      };
      mockFetchApi.mockResolvedValueOnce(mockResponse);

      const result = await getTransactions();

      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(12345);
    });
  });

  // ---------------------------------------------------------------------------
  // getTransaction
  // ---------------------------------------------------------------------------

  describe("getTransaction", () => {
    it("calls fetchApi with /transactions/{hash}", async () => {
      mockFetchApi.mockResolvedValueOnce({ hash: "0xdef" });

      await getTransaction("0xdef");

      expect(mockFetchApi).toHaveBeenCalledWith("/transactions/0xdef");
    });
  });

  // ---------------------------------------------------------------------------
  // getBlockTransactions
  // ---------------------------------------------------------------------------

  describe("getBlockTransactions", () => {
    it("calls fetchApi with blockNumber param and ASC default order", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 0 });

      await getBlockTransactions(42);

      expect(mockFetchApi).toHaveBeenCalledWith("/transactions", {
        blockNumber: "42",
        page: "1",
        itemsPerPage: "25",
        order: "ASC",
      });
    });

    it("passes custom pagination params alongside blockNumber", async () => {
      mockFetchApi.mockResolvedValueOnce({ items: [], total: 10 });

      await getBlockTransactions(99, { page: 2, itemsPerPage: 5 });

      expect(mockFetchApi).toHaveBeenCalledWith("/transactions", {
        blockNumber: "99",
        page: "2",
        itemsPerPage: "5",
        order: "ASC",
      });
    });
  });
});
