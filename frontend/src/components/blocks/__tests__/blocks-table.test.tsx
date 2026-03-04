import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlocksTable } from "../blocks-table";
import type { Block } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/link — render as a plain <a> so hrefs are testable
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// framer-motion — pass-through so motion.tr renders as <tr>
vi.mock("framer-motion", () => ({
  motion: {
    tr: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <tr className={className}>{children}</tr>,
  },
}));

import React from "react";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 1,
    workspaceId: 1,
    number: 1000,
    timestamp: new Date(Date.now() - 30_000).toISOString(),
    baseFeePerGas: null,
    difficulty: "0",
    extraData: "0x",
    gasLimit: "30000000",
    gasUsed: "21000",
    hash: "0xabc123",
    miner: "0x5551ff857fc71597511c34c8cc62a78c9d6748fb",
    nonce: "0x0",
    parentHash: "0xparent",
    transactionsCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlocksTable", () => {
  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  it("renders skeleton rows when isLoading=true", () => {
    const { container } = render(<BlocksTable blocks={[]} isLoading={true} />, {
      wrapper,
    });
    // 25 skeleton rows expected (SKELETON_ROWS constant)
    const skeletonRows = container.querySelectorAll("tbody tr");
    expect(skeletonRows.length).toBe(25);
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  it("shows 'No blocks found' when blocks is empty and not loading", () => {
    render(<BlocksTable blocks={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("No blocks found")).toBeInTheDocument();
  });

  it("does not show 'No blocks found' when blocks are present", () => {
    render(<BlocksTable blocks={[makeBlock()]} isLoading={false} />, { wrapper });
    expect(screen.queryByText("No blocks found")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Data rendering
  // -------------------------------------------------------------------------

  it("renders the block number as a link", () => {
    render(<BlocksTable blocks={[makeBlock({ number: 1234 })]} isLoading={false} />, { wrapper });
    const link = screen.getByRole("link", { name: /1,234/ });
    expect(link).toHaveAttribute("href", "/blocks/1234");
  });

  it("renders the transaction count badge", () => {
    render(<BlocksTable blocks={[makeBlock({ transactionsCount: 7 })]} isLoading={false} />, { wrapper });
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the miner address truncated as a link", () => {
    const miner = "0x5551ff857fc71597511c34c8cc62a78c9d6748fb";
    render(<BlocksTable blocks={[makeBlock({ miner })]} isLoading={false} />, { wrapper });
    // The miner cell is a link to /address/<miner>
    const links = screen.getAllByRole("link");
    const minerLink = links.find((l) => l.getAttribute("href") === `/address/${miner}`);
    expect(minerLink).toBeTruthy();
  });

  it("renders multiple blocks", () => {
    const blocks = [makeBlock({ number: 100 }), makeBlock({ id: 2, number: 101 })];
    render(<BlocksTable blocks={blocks} isLoading={false} />, { wrapper });
    expect(screen.getByRole("link", { name: /100/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /101/ })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Table structure
  // -------------------------------------------------------------------------

  it("renders the table caption for accessibility", () => {
    render(<BlocksTable blocks={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("List of recent blocks")).toBeInTheDocument();
  });

  it("renders column headers: Block, Age, Txs", () => {
    render(<BlocksTable blocks={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("Block")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Txs")).toBeInTheDocument();
  });
});
