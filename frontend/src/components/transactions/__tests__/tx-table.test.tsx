import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TxTable } from "../tx-table";
import type { Transaction } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    workspaceId: 1,
    blockNumber: 500,
    hash: "0x988c09b72d769dd5129cc475efac67b700c4eed9d68a3c327bc945bbb80334f3",
    from: "0x5551ff857fc71597511c34c8cc62a78c9d6748fb",
    to: "0xa640d8b5c9cb3b989881b8e63b0f30179c78a04f",
    value: "0",
    gas: "21000",
    gasPrice: "1000000000",
    gasUsed: "21000",
    data: "0x",
    nonce: 1,
    timestamp: new Date(Date.now() - 60_000).toISOString(),
    transactionIndex: 0,
    type: 2,
    state: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receipt: {
      status: true,
      gasUsed: "21000",
      cumulativeGasUsed: "21000",
      effectiveGasPrice: "1000000000",
      contractAddress: null,
      logs: [],
    },
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

describe("TxTable", () => {
  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  it("renders skeleton rows when isLoading=true", () => {
    const { container } = render(<TxTable transactions={[]} isLoading={true} />, {
      wrapper,
    });
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(25);
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  it("shows 'No transactions found' when transactions is empty and not loading", () => {
    render(<TxTable transactions={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("No transactions found")).toBeInTheDocument();
  });

  it("does not show 'No transactions found' when transactions are present", () => {
    render(<TxTable transactions={[makeTx()]} isLoading={false} />, { wrapper });
    expect(screen.queryByText("No transactions found")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Data rendering
  // -------------------------------------------------------------------------

  it("renders the tx hash as a link to /transactions/<hash>", () => {
    const hash = "0x988c09b72d769dd5129cc475efac67b700c4eed9d68a3c327bc945bbb80334f3";
    render(<TxTable transactions={[makeTx({ hash })]} isLoading={false} />, { wrapper });
    const links = screen.getAllByRole("link");
    const txLink = links.find((l) => l.getAttribute("href") === `/transactions/${hash}`);
    expect(txLink).toBeTruthy();
  });

  it("renders the block number as a link to /blocks/<blockNumber>", () => {
    render(<TxTable transactions={[makeTx({ blockNumber: 500 })]} isLoading={false} />, { wrapper });
    const links = screen.getAllByRole("link");
    const blockLink = links.find((l) => l.getAttribute("href") === "/blocks/500");
    expect(blockLink).toBeTruthy();
  });

  it("renders a success status icon (aria-label=Success) for a receipt with status=true", () => {
    render(
      <TxTable transactions={[makeTx({ receipt: { status: true, gasUsed: "21000", cumulativeGasUsed: "21000", effectiveGasPrice: "1000000000", contractAddress: null, logs: [] } })]} isLoading={false} />,
      { wrapper }
    );
    expect(screen.getByLabelText("Success")).toBeInTheDocument();
  });

  it("renders a failed status icon (aria-label=Failed) for a receipt with status=false", () => {
    render(
      <TxTable transactions={[makeTx({ receipt: { status: false, gasUsed: "21000", cumulativeGasUsed: "21000", effectiveGasPrice: "1000000000", contractAddress: null, logs: [] } })]} isLoading={false} />,
      { wrapper }
    );
    expect(screen.getByLabelText("Failed")).toBeInTheDocument();
  });

  it("renders a pending status icon (aria-label=Pending) when there is no receipt", () => {
    render(
      <TxTable transactions={[makeTx({ receipt: undefined })]} isLoading={false} />,
      { wrapper }
    );
    expect(screen.getByLabelText("Pending")).toBeInTheDocument();
  });

  it("renders 'Contract Create' badge when 'to' is null", () => {
    render(
      <TxTable transactions={[makeTx({ to: null, receipt: { status: true, gasUsed: "21000", cumulativeGasUsed: "21000", effectiveGasPrice: "1000000000", contractAddress: "0xnew", logs: [] } })]} isLoading={false} />,
      { wrapper }
    );
    expect(screen.getByText("Contract Create")).toBeInTheDocument();
  });

  it("renders multiple transactions", () => {
    const hash1 = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const hash2 = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    render(
      <TxTable
        transactions={[makeTx({ hash: hash1 }), makeTx({ id: 2, hash: hash2 })]}
        isLoading={false}
      />,
      { wrapper }
    );
    const links = screen.getAllByRole("link");
    expect(links.find((l) => l.getAttribute("href") === `/transactions/${hash1}`)).toBeTruthy();
    expect(links.find((l) => l.getAttribute("href") === `/transactions/${hash2}`)).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Table structure
  // -------------------------------------------------------------------------

  it("renders the table caption for accessibility", () => {
    render(<TxTable transactions={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("List of transactions")).toBeInTheDocument();
  });

  it("renders column headers: Status, Tx Hash, From, To, Value", () => {
    render(<TxTable transactions={[]} isLoading={false} />, { wrapper });
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Tx Hash")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });
});
