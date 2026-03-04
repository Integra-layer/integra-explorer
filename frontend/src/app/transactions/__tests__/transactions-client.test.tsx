import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

// Mock the useTransactions hook
const mockUseTransactions = vi.fn();
vi.mock("@/lib/hooks/use-transactions", () => ({
  useTransactions: (...args: unknown[]) => mockUseTransactions(...args),
}));

// Mock TxTable to avoid deep dependency tree in unit tests
vi.mock("@/components/transactions/tx-table", () => ({
  TxTable: ({
    transactions,
    isLoading,
  }: {
    transactions: unknown[];
    isLoading: boolean;
  }) => (
    <div
      data-testid="tx-table"
      data-loading={isLoading}
      data-count={transactions.length}
    />
  ),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        variants: _v,
        ...rest
      } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

import TransactionsClient from "../_client";

describe("TransactionsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("shows loading state while data is fetching", () => {
    mockUseTransactions.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TransactionsClient />);

    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("renders transaction data after load", () => {
    mockUseTransactions.mockReturnValue({
      data: {
        items: [{ hash: "0xabc", blockNumber: 100, from: "0x1", to: "0x2" }],
        total: 5000,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionsClient />);

    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("shows total count badge when total > 0", () => {
    mockUseTransactions.mockReturnValue({
      data: { items: [], total: 5000 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsClient />);

    expect(screen.getByText("5,000")).toBeInTheDocument();
  });

  it("calculates correct totalPages from total", () => {
    mockUseTransactions.mockReturnValue({
      data: { items: [], total: 5000 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsClient />);

    // 5000 / 25 = 200 pages
    expect(screen.getByText("Page 1 of 200")).toBeInTheDocument();
  });

  it("shows error state on API failure", () => {
    mockUseTransactions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    });

    render(<TransactionsClient />);

    expect(
      screen.getByText(/failed to load transactions/i),
    ).toBeInTheDocument();
  });

  it("reads page number from URL search params", () => {
    mockSearchParams = new URLSearchParams("page=3");
    mockUseTransactions.mockReturnValue({
      data: { items: [], total: 250 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsClient />);

    expect(mockUseTransactions).toHaveBeenCalledWith(3, 25);
    expect(screen.getByText("Page 3 of 10")).toBeInTheDocument();
  });

  it("defaults to page 1 when no page param", () => {
    mockUseTransactions.mockReturnValue({
      data: { items: [], total: 100 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsClient />);

    expect(mockUseTransactions).toHaveBeenCalledWith(1, 25);
  });
});
